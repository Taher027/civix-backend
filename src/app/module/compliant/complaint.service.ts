import { AppError } from "../../../utils/AppError";
import { prisma } from "../../lib/prisma";
import type { RequestUser } from "../../middleware/auth";
import httpStatus from "http-status";
import type {
	ICreateComplaintInput,
	IStatusUpdate,
	IUpdateComplaintInput,
} from "./complaint.interface";
import {
	ComplaintStatus,
	type Prisma,
} from "../../../../prisma/generated/prisma/client";
import type { TComplaintFilters } from "../../../shared/pick";

const createComplaintToDB = async (
	payload: ICreateComplaintInput,
	user: RequestUser,
) => {
	const existingCategory = await prisma.category.findFirst({
		where: {
			id: payload.categoryId,
		},
	});
	if (!existingCategory) {
		throw new AppError(httpStatus.NOT_FOUND, "Category does not exists!");
	}
	const existingComplaint = await prisma.complaint.findFirst({
		where: {
			createdBy: user.userID,
			title: payload.title,
		},
	});
	if (existingComplaint) {
		throw new AppError(
			httpStatus.CONFLICT,
			"This compalint alreday added by you!",
		);
	}
	const compalint = prisma.complaint.create({
		data: {
			...payload,
			createdBy: user.userID,
		},
	});

	return compalint;
};
const getAllComplaintsFromDb = async (filters: TComplaintFilters) => {
	const { title, city, location, status, priority, categoryId, searchTerm } =
		filters;
	const andConditions: Prisma.ComplaintWhereInput[] = [];
	andConditions.push({
		status: {
			not: "DELETED",
		},
	});
	if (searchTerm) {
		andConditions.push({
			OR: [
				{ title: { contains: searchTerm, mode: "insensitive" } },
				{ city: { contains: searchTerm, mode: "insensitive" } },
				{ location: { contains: searchTerm, mode: "insensitive" } },
			],
		});
	}
	if (title) {
		andConditions.push({ title: { contains: title, mode: "insensitive" } });
	}
	if (city) {
		andConditions.push({ city: { contains: city, mode: "insensitive" } });
	}
	if (location) {
		andConditions.push({
			location: { contains: location, mode: "insensitive" },
		});
	}

	if (status) {
		andConditions.push({ status: status });
	}

	if (priority) {
		andConditions.push({ priority: priority });
	}

	if (categoryId) {
		andConditions.push({
			category: {
				id: categoryId,
			},
		});
	}
	const whereConditions: Prisma.ComplaintWhereInput =
		andConditions.length > 0 ? { AND: andConditions } : {};

	const allComplaints = await prisma.complaint.findMany({
		where: whereConditions,
		include: {
			category: true,
		},
	});
	return allComplaints;
};
const getSingleComplaintFromDb = async (id: string) => {
	const complaint = await prisma.complaint.findUniqueOrThrow({
		where: { id },
		include: { category: true },
	});
	return complaint;
};
const increamentComplaintVotes = async (id: string) => {
	const existingComplaint = await prisma.complaint.findFirst({
		where: { id },
		select: { id: true, upvotes: true },
	});
	if (!existingComplaint) {
		throw new AppError(httpStatus.NOT_FOUND, "Complaint not found !");
	}

	const updatedComplaint = await prisma.complaint.update({
		where: { id },
		data: {
			upvotes: {
				increment: 1,
			},
		},
	});
	return updatedComplaint;
};
const updateComplaintToDB = async (
	payload: IUpdateComplaintInput,
	id: string,
	user: RequestUser,
) => {
	const existingComplaint = await prisma.complaint.findUnique({
		where: {
			id: id,
		},
		select: {
			createdBy: true,
			status: true,
		},
	});
	if (!existingComplaint) {
		throw new AppError(httpStatus.NOT_FOUND, "Complaint does not exists!");
	}
	if (user.userID !== existingComplaint.createdBy) {
		throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized Access!");
	}
	if (existingComplaint.status === ComplaintStatus.DELETED) {
		throw new AppError(httpStatus.BAD_REQUEST, "Complaint not Found!");
	}
	const {
		title,
		description,
		short_description,
		city,
		location,
		mapURL,
		initialImages,
	} = payload;

	const updatedComplaint = await prisma.complaint.update({
		where: { id },
		data: {
			title,
			description,
			short_description,
			mapURL,
			initialImages,
			location,
			city,
		},
	});

	return updatedComplaint;
};
const updateCompliantStatus = async (id: string, payload: IStatusUpdate) => {
	const existingComplaint = await prisma.complaint.findFirst({
		where: { id: id },
		select: {
			id: true,
			title: true,
			status: true,
		},
	});
	if (!existingComplaint) {
		throw new AppError(httpStatus.NOT_FOUND, "compalint not found!");
	}

	if (existingComplaint.status === ComplaintStatus.REJECTED) {
		throw new AppError(httpStatus.NOT_FOUND, "Compalint already rejected");
	}
	if (existingComplaint.status === ComplaintStatus.DELETED) {
		throw new AppError(httpStatus.NOT_FOUND, "Compalint not found");
	}
	if (existingComplaint.status === ComplaintStatus.RESOLVED) {
		throw new AppError(httpStatus.NOT_FOUND, "Compalint already resolved");
	}
	const upadtedStatus = await prisma.complaint.update({
		where: { id },
		data: {
			status: payload.status,
		},
	});
	return upadtedStatus;
};
const deleteComplaint = async (id: string) => {
	const existingComplaint = await prisma.complaint.findFirst({
		where: { id: id },
		select: {
			id: true,
		},
	});
	if (!existingComplaint) {
		throw new AppError(httpStatus.NOT_FOUND, "Complaint not found!");
	}

	const deletedComplaint = await prisma.complaint.update({
		where: { id },
		data: {
			status: ComplaintStatus.DELETED,
		},
	});
	return deletedComplaint;
};

export const complaintServices = {
	createComplaintToDB,
	getAllComplaintsFromDb,
	getSingleComplaintFromDb,
	increamentComplaintVotes,
	updateComplaintToDB,
	updateCompliantStatus,
	deleteComplaint,
};
