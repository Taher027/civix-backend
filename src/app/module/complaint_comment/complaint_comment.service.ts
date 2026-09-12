import { prisma } from "../../lib/prisma";

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

export const complaintCommentServices = {
	createComplaintCommentIntoDb,
	getAllComplaintCommentsFromDb,
};
