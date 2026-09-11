import type { Request, Response } from "express";
import { catchAsync } from "../../../utils/catchAsync";
import { complaintServices } from "./complaint.service";
import { sendResponse } from "../../../utils/sendResponse";
import httpStatus from "http-status";
import { AppError } from "../../../utils/AppError";
import pick from "../../../shared/pick";

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
const getAllComplaints = catchAsync(async (req: Request, res: Response) => {
	const filters = pick(req.query, [
		"title",
		"city",
		"location",
		"status",
		"priority",
		"categoryId",
	]);

	const result = await complaintServices.getAllComplaintsFromDb(filters);

	sendResponse(res, {
		success: true,
		statusCode: httpStatus.OK,
		message: "Complaint updated successfull",
		data: result,
	});
});
const updateComplaint = catchAsync(async (req: Request, res: Response) => {
	const { id } = req.params;
	const user = req.user;
	if (!user) {
		throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized Access!");
	}
	const payload = req.body;
	const result = await complaintServices.updateComplaintToDB(
		payload,
		id as string,
		user,
	);

	sendResponse(res, {
		success: true,
		statusCode: httpStatus.OK,
		message: "Complaint updated successfull",
		data: result,
	});
});

export const complaintControllers = {
	createComplaint,
	getAllComplaints,
	updateComplaint,
};
