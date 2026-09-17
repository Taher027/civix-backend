import httpStatus from "http-status";
import { AppError } from "../../../utils/AppError";
import { prisma } from "../../lib/prisma";
import {
	ComplaintVolunteerStatus,
	ComplaintStatus,
	UserRole,
	VolunteerApplicationStatus,
} from "../../../../prisma/generated/prisma/enums";
import type { IRequestUser } from "../auth/auth.interface";
import type {
	IComplaintVolunteerApplyPayload,
	IComplaintVolunteerStatusPayload,
	IVolunteerApplyPayload,
	IVolunteerReviewPayload,
} from "./volunteer.interface";
import type { UploadApiResponse } from "cloudinary";
import { cloudinary } from "../../lib/cloudinary";
const applyForVolunteerToDB = async (
	user: IRequestUser,
	payload: IVolunteerApplyPayload,
) => {
	const existingProfile = await prisma.volunteerProfile.findUnique({
		where: { userId: user.userID },
	});

	if (existingProfile) {
		if (existingProfile.status === VolunteerApplicationStatus.PENDING) {
			throw new AppError(
				httpStatus.CONFLICT,
				"You already have a pending volunteer application",
			);
		}
		if (existingProfile.status === VolunteerApplicationStatus.APPROVED) {
			throw new AppError(httpStatus.CONFLICT, "You are already a volunteer");
		}
	}

	const volunteerProfile = existingProfile
		? await prisma.volunteerProfile.update({
				where: { userId: user.userID },
				data: {
					bio: payload.bio,
					skills: payload.skills ?? [],
					status: VolunteerApplicationStatus.PENDING,
					reviewedAt: null,
					reviewedBy: null,
				},
			})
		: await prisma.volunteerProfile.create({
				data: {
					userId: user.userID,
					bio: payload.bio,
					skills: payload.skills ?? [],
				},
			});

	return volunteerProfile;
};

const getMyVolunteerProfile = async (user: IRequestUser) => {
	const profile = await prisma.volunteerProfile.findUnique({
		where: { userId: user.userID },
		include: {
			complaintApplications: {
				include: { complaint: true },
			},
		},
	});

	if (!profile) {
		throw new AppError(httpStatus.NOT_FOUND, "Volunteer profile not found");
	}

	return profile;
};

const getAllVolunteerApplications = async (
	status?: VolunteerApplicationStatus,
) => {
	const applications = await prisma.volunteerProfile.findMany({
		where: status ? { status } : undefined,
		include: {
			user: { select: { id: true, name: true, email: true, phone: true } },
		},
		orderBy: { appliedAt: "desc" },
	});

	return applications;
};

const reviewVolunteerApplication = async (
	admin: IRequestUser,
	targetUserId: string,
	payload: IVolunteerReviewPayload,
) => {
	const profile = await prisma.volunteerProfile.findUnique({
		where: { userId: targetUserId },
	});

	if (!profile) {
		throw new AppError(httpStatus.NOT_FOUND, "Volunteer application not found");
	}

	if (profile.status !== VolunteerApplicationStatus.PENDING) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"This application has already been reviewed",
		);
	}

	const result = await prisma.$transaction(async (tx) => {
		const updatedProfile = await tx.volunteerProfile.update({
			where: { userId: targetUserId },
			data: {
				status: payload.status,
				reviewedAt: new Date(),
				reviewedBy: admin.userID,
			},
		});

		if (payload.status === VolunteerApplicationStatus.APPROVED) {
			await tx.user.update({
				where: { id: targetUserId },
				data: { role: UserRole.VOLUNTEER },
			});
		}

		return updatedProfile;
	});

	return result;
};

const applyForComplaintToDB = async (
	user: IRequestUser,
	complaintId: string,
	payload: IComplaintVolunteerApplyPayload,
) => {
	const volunteerProfile = await prisma.volunteerProfile.findUnique({
		where: { userId: user.userID },
	});

	if (
		!volunteerProfile ||
		volunteerProfile.status !== VolunteerApplicationStatus.APPROVED
	) {
		throw new AppError(
			httpStatus.FORBIDDEN,
			"You are not an approved volunteer",
		);
	}

	const complaint = await prisma.complaint.findUnique({
		where: { id: complaintId },
	});

	if (!complaint) {
		throw new AppError(httpStatus.NOT_FOUND, "Complaint not found");
	}

	if (
		complaint.status === ComplaintStatus.RESOLVED ||
		complaint.status === ComplaintStatus.REJECTED ||
		complaint.status === ComplaintStatus.DELETED
	) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"This complaint is no longer open for volunteer applications",
		);
	}

	const existingApplication = await prisma.complaintVolunteer.findUnique({
		where: {
			complaintId_volunteerId: {
				complaintId,
				volunteerId: volunteerProfile.id,
			},
		},
	});

	if (existingApplication) {
		throw new AppError(
			httpStatus.CONFLICT,
			"You have already applied for this complaint",
		);
	}

	const application = await prisma.complaintVolunteer.create({
		data: {
			complaintId,
			volunteerId: volunteerProfile.id,
			message: payload.message,
		},
	});

	return application;
};

const getComplaintApplicationsFromDB = async (complaintId: string) => {
	const applications = await prisma.complaintVolunteer.findMany({
		where: { complaintId },
		include: {
			volunteer: {
				include: {
					user: {
						select: { id: true, name: true, email: true, phone: true },
					},
				},
			},
		},
		orderBy: { appliedAt: "desc" },
	});

	return applications;
};

const acceptVolunteerForComplaint = async (
	admin: IRequestUser,
	complaintId: string,
	volunteerId: string,
) => {
	const application = await prisma.complaintVolunteer.findUnique({
		where: { complaintId_volunteerId: { complaintId, volunteerId } },
	});

	if (!application) {
		throw new AppError(httpStatus.NOT_FOUND, "Application not found");
	}

	if (application.status !== ComplaintVolunteerStatus.APPLIED) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"This application has already been processed",
		);
	}

	const result = await prisma.$transaction(async (tx) => {
		const accepted = await tx.complaintVolunteer.update({
			where: { complaintId_volunteerId: { complaintId, volunteerId } },
			data: {
				status: ComplaintVolunteerStatus.ACCEPTED,
				acceptedAt: new Date(),
			},
		});

		await tx.complaintVolunteer.updateMany({
			where: {
				complaintId,
				volunteerId: { not: volunteerId },
				status: ComplaintVolunteerStatus.APPLIED,
			},
			data: { status: ComplaintVolunteerStatus.REJECTED },
		});

		await tx.complaint.update({
			where: { id: complaintId },
			data: { status: ComplaintStatus.IN_PROGRESS },
		});

		return accepted;
	});

	return result;
};

const submitComplaintStatusToDB = async (
	user: IRequestUser,
	complaintId: string,
	payload: IComplaintVolunteerStatusPayload,
	solutionImages: Express.Multer.File[],
) => {
	const volunteerProfile = await prisma.volunteerProfile.findUnique({
		where: { userId: user.userID },
	});

	if (!volunteerProfile) {
		throw new AppError(httpStatus.FORBIDDEN, "You are not a volunteer");
	}

	const application = await prisma.complaintVolunteer.findUnique({
		where: {
			complaintId_volunteerId: {
				complaintId,
				volunteerId: volunteerProfile.id,
			},
		},
	});

	if (
		!application ||
		application.status === ComplaintVolunteerStatus.REJECTED
	) {
		throw new AppError(
			httpStatus.FORBIDDEN,
			"You are not assigned to this complaint",
		);
	}

	if (application.status !== ComplaintVolunteerStatus.ACCEPTED) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"You must be accepted for this complaint before submitting a status",
		);
	}

	const uploadResults = await Promise.all(
		(solutionImages ?? []).map((file) => {
			return new Promise<UploadApiResponse>((resolve, reject) => {
				cloudinary.uploader
					.upload_stream(
						{
							resource_type: "auto",
							folder: "complaint-solutions",
						},
						(error, result) => {
							if (error) {
								return reject(error);
							}

							if (!result) {
								return reject(
									new AppError(
										httpStatus.INTERNAL_SERVER_ERROR,
										"No result returned from Cloudinary",
									),
								);
							}

							resolve(result);
						},
					)
					.end(file.buffer);
			});
		}),
	);

	const solutionImageUrls = uploadResults.map((r) => r.secure_url);

	const updated = await prisma.complaintVolunteer.update({
		where: {
			complaintId_volunteerId: {
				complaintId,
				volunteerId: volunteerProfile.id,
			},
		},
		data: {
			statusNote: payload.statusNote,
			solutionImages: solutionImageUrls,
			status: ComplaintVolunteerStatus.SUBMITTED,
		},
	});

	return updated;
};

const resolveComplaintByAdmin = async (
	admin: IRequestUser,
	complaintId: string,
	volunteerId: string,
) => {
	const application = await prisma.complaintVolunteer.findUnique({
		where: { complaintId_volunteerId: { complaintId, volunteerId } },
	});

	if (!application) {
		throw new AppError(httpStatus.NOT_FOUND, "Application not found");
	}

	if (application.status !== ComplaintVolunteerStatus.SUBMITTED) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"Volunteer has not submitted a solution for this complaint yet",
		);
	}

	const result = await prisma.$transaction(async (tx) => {
		const resolvedApplication = await tx.complaintVolunteer.update({
			where: { complaintId_volunteerId: { complaintId, volunteerId } },
			data: {
				status: ComplaintVolunteerStatus.RESOLVED,
				resolvedAt: new Date(),
			},
		});

		await tx.complaint.update({
			where: { id: complaintId },
			data: { status: ComplaintStatus.RESOLVED, resolvedAt: new Date() },
		});

		await tx.volunteerProfile.update({
			where: { id: volunteerId },
			data: { totalResolved: { increment: 1 } },
		});

		return resolvedApplication;
	});

	return result;
};

export const volunteerServices = {
	applyForVolunteerToDB,
	getMyVolunteerProfile,
	getAllVolunteerApplications,
	reviewVolunteerApplication,
	applyForComplaintToDB,
	getComplaintApplicationsFromDB,
	acceptVolunteerForComplaint,
	submitComplaintStatusToDB,
	resolveComplaintByAdmin,
};
