import { AppError } from "../../../utils/AppError";
import { prisma } from "../../lib/prisma";
import type { RequestUser } from "../../middleware/auth";
import httpStatus from "http-status";

const createComplaintToDB = async (payload: any, user: RequestUser) => {
	const existingComplaint = await prisma.complaint.findFirst({
		where: {
			createdBy: user.userID,
			title: payload.title,
		},
	});
	if (!existingComplaint) {
		throw new AppError(
			httpStatus.CONFLICT,
			"This compalint alreday added by you!",
		);
	}
	const compalint = prisma.complaint.create({
		data: payload,
	});

	return compalint;
};

export const complaintServices = {
	createComplaintToDB,
};
