import type { Request, Response } from "express";
import { catchAsync } from "../../../utils/catchAsync";
import { categoryServices } from "./category.service";
import { sendResponse } from "../../../utils/sendResponse";
import httpStatus from "http-status";

const createCategory = catchAsync(async (req: Request, res: Response) => {
	const result = await categoryServices.createCategoryToDB(req.body);
	sendResponse(res, {
		success: true,
		statusCode: httpStatus.CREATED,
		message: "Category Created Successfull",
		data: result,
	});
});

const getAllCategory = catchAsync(async (req: Request, res: Response) => {
	const result = await categoryServices.getAllCategory();
	sendResponse(res, {
		success: true,
		statusCode: httpStatus.OK,
		message: "All Category retrieved Successfull",
		data: result,
	});
});

export const categoryControllers = {
	createCategory,
	getAllCategory,
};
