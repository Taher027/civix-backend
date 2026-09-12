import type { Request, Response } from "express";
import { sendResponse } from "../../../utils/sendResponse";
import { complaintCommentServices } from "./complaint_comment.service";
import { catchAsync } from "../../../utils/catchAsync";
import httpStatus from "http-status";
import { AppError } from "../../../utils/AppError";
const createComplaintComment = catchAsync(
	async (req: Request, res: Response) => {
		const { complaintID } = req.params;
		const user = req.user;
		const userID = user?.userID;

		const result = await complaintCommentServices.createComplaintCommentIntoDb({
			...req.body,
			complaintID,
			userID,
		});

		sendResponse(res, {
			success: true,
			statusCode: httpStatus.CREATED,
			message: "Comment added successfully",
			data: result,
		});
	},
);
const getAllComplaintComments = catchAsync(
	async (req: Request, res: Response) => {
		const { complaintID } = req.params;

		const result = await complaintCommentServices.getAllComplaintCommentsFromDb(
			complaintID as string,
		);

		sendResponse(res, {
			success: true,
			statusCode: httpStatus.OK,
			message: "Comments retrieved successfully",
			data: result,
		});
	},
);
const updateComplaintComment = catchAsync(
	async (req: Request, res: Response) => {
		const { id } = req.params;
		const user = req.user;
		if (!user) {
			throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized Access!");
		}
		const { userID } = user;
		const payload = req.body;

		const result = await complaintCommentServices.updateComplaintCommentIntoDb(
			id as string,
			userID,
			payload,
		);

		sendResponse(res, {
			success: true,
			statusCode: httpStatus.OK,
			message: "Comment updated successfully",
			data: result,
		});
	},
);
const deleteComplaintComment = catchAsync(
	async (req: Request, res: Response) => {
		const { id } = req.params;
		const user = req.user;
		if (!user) {
			throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized Access!");
		}
		const { userID } = user;
		const result = await complaintCommentServices.deleteComplaintCommentFromDb(
			id as string,
			userID,
		);

		sendResponse(res, {
			success: true,
			statusCode: httpStatus.OK,
			message: "Comment deleted successfully",
			data: result,
		});
	},
);

export const complaintCommentControllers = {
	createComplaintComment,
	getAllComplaintComments,
	updateComplaintComment,
	deleteComplaintComment,
};
