import { AppError } from "../../../utils/AppError";
import { prisma } from "../../lib/prisma";
import type { RequestUser } from "../../middleware/auth";
import httpStatus from "http-status";
import type {
	ICreateComplaintInput,
	IUpdateComplaintInput,
} from "./complaint.interface";
import type { Prisma } from "../../../../prisma/generated/prisma/client";
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
		},
	});
	if (!existingComplaint) {
		throw new AppError(httpStatus.NOT_FOUND, "Complaint does not exists!");
	}
	if (user.userID !== existingComplaint.createdBy) {
		throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized Access!");
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

export const complaintServices = {
	createComplaintToDB,
	getAllComplaintsFromDb,
	updateComplaintToDB,
};
