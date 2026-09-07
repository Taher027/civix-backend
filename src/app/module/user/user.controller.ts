import type { Request, Response } from "express";
import { catchAsync } from "../../../utils/catchAsync";
import { sendResponse } from "../../../utils/sendResponse";
import httpStatus from "http-status";
import { userServices } from "./user.service";
import { AppError } from "../../../utils/AppError";

const userRegister = catchAsync(async (req: Request, res: Response) => {
	const payload = req.body;

	const result = await userServices.userRegisterToDB(payload);

	sendResponse(res, {
		success: true,
		statusCode: httpStatus.CREATED,
		message: "User Register SuccessFull",
		data: result,
	});
});

const updateProfileImage = catchAsync(async (req: Request, res: Response) => {
	if (!req.file) {
		throw new AppError(httpStatus.BAD_REQUEST, "No File provided");
	}
	const userID = req.user?.userID;
	const result = await userServices.updateProfileImage(
		req.file.buffer,
		userID!,
	);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Profile image update successfully",
		data: result,
	});
});
const updateUser = catchAsync(async (req: Request, res: Response) => {
	const userID = req.user?.userID;

	if (!userID) {
		throw new AppError(httpStatus.UNAUTHORIZED, "User not authenticated");
	}

	const payload = req.body;

	const result = await userServices.updateUserToDB(userID, payload);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "User profile updated successfully",
		data: result,
	});
});

export const userControllers = {
	userRegister,
	updateProfileImage,
	updateUser,
};
