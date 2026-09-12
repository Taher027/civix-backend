import type { Request, Response } from "express";
import { sendResponse } from "../../../utils/sendResponse";
import { complaintCommentServices } from "./complaint_comment.service";
import { catchAsync } from "../../../utils/catchAsync";
import httpStatus from "http-status";
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

export const complaintCommentControllers = {
	createComplaintComment,
	getAllComplaintComments,
};
