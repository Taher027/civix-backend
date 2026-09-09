import { AppError } from "../../../utils/AppError";
import { prisma } from "../../lib/prisma";
import type { RequestUser } from "../../middleware/auth";
import httpStatus from "http-status";
import type {
	ICreateComplaintInput,
	IUpdateComplaintInput,
} from "./complaint.interface";

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
		},
	});

	return updatedComplaint;
};

export const complaintServices = {
	createComplaintToDB,
	updateComplaintToDB,
};
