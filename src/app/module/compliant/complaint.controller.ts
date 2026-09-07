import type { Request, Response } from "express";
import { catchAsync } from "../../../utils/catchAsync";
import { complaintServices } from "./complaint.service";
import { sendResponse } from "../../../utils/sendResponse";
import httpStatus from "http-status";
import { AppError } from "../../../utils/AppError";

const createComplaint = catchAsync(async (req: Request, res: Response) => {
	const user = req.user;
	if (!user) {
		throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized Access!");
	}
	const payload = req.body;
	const result = await complaintServices.createComplaintToDB(payload, user);

	sendResponse(res, {
		success: true,
		statusCode: httpStatus.CREATED,
		message: "Complaint create successfull",
		data: result,
	});
});

export const complaintControllers = {
	createComplaint,
};
