import { AppError } from "../../../utils/AppError";
import { prisma } from "../../lib/prisma";
import httpStatus from "http-status";

const createComplaintCommentIntoDb = async (payload: {
	text: string;
	imagesURL?: string[];
	userID: string;
	complaintID: string;
}) => {
	await prisma.complaint.findUniqueOrThrow({
		where: { id: payload.complaintID },
	});

	const result = await prisma.complaint_Comment.create({
		data: {
			text: payload.text,
			imagesURL: payload.imagesURL ?? [],
			userID: payload.userID,
			complaintID: payload.complaintID,
		},
		include: {
			user: {
				select: {
					id: true,
					name: true,
					email: true,
					avatar: true,
				},
			},
		},
	});

	return result;
};
const getAllComplaintCommentsFromDb = async (complaintID: string) => {
	await prisma.complaint.findUniqueOrThrow({
		where: { id: complaintID },
	});
	const result = await prisma.complaint_Comment.findMany({
		where: { complaintID },
		include: {
			user: {
				select: {
					id: true,
					name: true,
					email: true,
				},
			},
		},
		orderBy: {
			createdAt: "desc",
		},
	});

	return result;
};
const updateComplaintCommentIntoDb = async (
	id: string,
	userID: string,
	payload: {
		text?: string;
		imagesURL?: string[];
	},
) => {
	// 1. make sure the comment actually exists
	const comment = await prisma.complaint_Comment.findUniqueOrThrow({
		where: { id },
	});

	// 2. make sure the logged-in user actually owns this comment
	if (comment.userID !== userID) {
		throw new AppError(
			httpStatus.FORBIDDEN,
			"You are not allowed to update this comment",
		);
	}

	// 3. proceed with update
	const result = await prisma.complaint_Comment.update({
		where: { id },
		data: {
			text: payload.text,
			imagesURL: payload.imagesURL,
		},
		include: {
			user: {
				select: {
					id: true,
					name: true,
					email: true,
				},
			},
		},
	});

	return result;
};
const deleteComplaintCommentFromDb = async (id: string, userID: string) => {
	const comment = await prisma.complaint_Comment.findUniqueOrThrow({
		where: { id },
	});

	if (comment.userID !== userID) {
		throw new AppError(
			httpStatus.FORBIDDEN,
			"You are not allowed to delete this comment",
		);
	}

	const result = await prisma.complaint_Comment.delete({
		where: { id },
	});

	return result;
};

export const complaintCommentServices = {
	createComplaintCommentIntoDb,
	getAllComplaintCommentsFromDb,
	updateComplaintCommentIntoDb,
	deleteComplaintCommentFromDb,
};
