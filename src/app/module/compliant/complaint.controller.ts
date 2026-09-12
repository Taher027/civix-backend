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
		message: "All Complaint retrieved successfull",
		data: result,
	});
});
const getSingleComplaint = catchAsync(async (req: Request, res: Response) => {
	const { id } = req.params;

	const result = await complaintServices.getSingleComplaintFromDb(id as string);

	sendResponse(res, {
		success: true,
		statusCode: httpStatus.OK,
		message: "Complaint retrieved successfull",
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
const updatedComplaintVotes = catchAsync(
	async (req: Request, res: Response) => {
		const { id } = req.params;
		const user = req.user;
		if (!user) {
			throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized Access!");
		}
		const result = await complaintServices.increamentComplaintVotes(
			id as string,
		);

		sendResponse(res, {
			success: true,
			statusCode: httpStatus.OK,
			message: "Complaint vote updated successfull",
			data: result,
		});
	},
);
const updatedComplaintStatus = catchAsync(
	async (req: Request, res: Response) => {
		const { id } = req.params;

		const payload = req.body;

		const result = await complaintServices.updateCompliantStatus(
			id as string,
			payload,
		);
		sendResponse(res, {
			success: true,
			statusCode: httpStatus.OK,
			message: "Complaint status updated successfull",
			data: result,
		});
	},
);
const deletedComplaint = catchAsync(async (req: Request, res: Response) => {
	const { id } = req.params;
	await complaintServices.deleteComplaint(id as string);
	sendResponse(res, {
		success: true,
		statusCode: httpStatus.OK,
		message: "Complaint deleted successfull",
		data: null,
	});
});
export const complaintControllers = {
	createComplaint,
	getAllComplaints,
	getSingleComplaint,
	updateComplaint,
	updatedComplaintVotes,
	updatedComplaintStatus,
	deletedComplaint,
};
