import { AppError } from "../../../utils/AppError";
import { prisma } from "../../lib/prisma";
import type { RequestUser } from "../../middleware/auth";
import httpStatus from "http-status";
import type { ICreateComplaintInput } from "./complaint.interface";

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

export const complaintServices = {
	createComplaintToDB,
};
