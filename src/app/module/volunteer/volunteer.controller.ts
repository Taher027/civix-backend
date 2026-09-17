import type { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../../utils/catchAsync";
import { sendResponse } from "../../../utils/sendResponse";
import type { IRequestUser } from "../auth/auth.interface";
import { volunteerServices } from "./volunteer.service";
import type { VolunteerApplicationStatus } from "../../../../prisma/generated/prisma/enums";

const applyForVolunteer = catchAsync(async (req: Request, res: Response) => {
	const user = req.user as IRequestUser;
	const result = await volunteerServices.applyForVolunteerToDB(user, req.body);

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "Volunteer application submitted successfully",
		data: result,
	});
});

const getMyProfile = catchAsync(async (req: Request, res: Response) => {
	const user = req.user as IRequestUser;
	const result = await volunteerServices.getMyVolunteerProfile(user);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Volunteer profile fetched successfully",
		data: result,
	});
});

const getAllApplications = catchAsync(async (req: Request, res: Response) => {
	const status = req.query.status as VolunteerApplicationStatus;
	const result = await volunteerServices.getAllVolunteerApplications(status);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Volunteer applications fetched successfully",
		data: result,
	});
});

const reviewApplication = catchAsync(async (req: Request, res: Response) => {
	const admin = req.user as IRequestUser;
	const { userId } = req.params;
	const result = await volunteerServices.reviewVolunteerApplication(
		admin,
		userId as string,
		req.body,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Volunteer application reviewed successfully",
		data: result,
	});
});

const applyForComplaint = catchAsync(async (req: Request, res: Response) => {
	const user = req.user as IRequestUser;
	const { complaintId } = req.params;
	const result = await volunteerServices.applyForComplaintToDB(
		user,
		complaintId as string,
		req.body,
	);

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "Applied for complaint successfully",
		data: result,
	});
});

const getComplaintApplications = catchAsync(
	async (req: Request, res: Response) => {
		const { complaintId } = req.params;
		const result = await volunteerServices.getComplaintApplicationsFromDB(
			complaintId as string,
		);

		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "Complaint applications fetched successfully",
			data: result,
		});
	},
);

const acceptVolunteer = catchAsync(async (req: Request, res: Response) => {
	const admin = req.user as IRequestUser;
	const { complaintId, volunteerId } = req.params;
	const result = await volunteerServices.acceptVolunteerForComplaint(
		admin,
		complaintId as string,
		volunteerId as string,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Volunteer accepted for complaint",
		data: result,
	});
});

const submitComplaintStatus = catchAsync(
	async (req: Request, res: Response) => {
		const user = req.user as IRequestUser;
		const { complaintId } = req.params;
		const files = (req.files as Express.Multer.File[]) ?? [];

		const result = await volunteerServices.submitComplaintStatusToDB(
			user,
			complaintId as string,
			req.body,
			files,
		);

		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "Status submitted successfully",
			data: result,
		});
	},
);

const resolveComplaint = catchAsync(async (req: Request, res: Response) => {
	const admin = req.user as IRequestUser;
	const { complaintId, volunteerId } = req.params;
	const result = await volunteerServices.resolveComplaintByAdmin(
		admin,
		complaintId as string,
		volunteerId as string,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Complaint resolved successfully",
		data: result,
	});
});

export const volunteerControllers = {
	applyForVolunteer,
	getMyProfile,
	getAllApplications,
	reviewApplication,
	applyForComplaint,
	getComplaintApplications,
	acceptVolunteer,
	submitComplaintStatus,
	resolveComplaint,
};
