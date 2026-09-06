import type { Request, Response } from "express";
import { catchAsync } from "../../../utils/catchAsync";
import { sendResponse } from "../../../utils/sendResponse";
import httpStatus from "http-status";
import { userServices } from "./user.service";

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

export const userControllers = {
	userRegister,
};
