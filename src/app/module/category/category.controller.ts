import type { Request, Response } from "express";
import { catchAsync } from "../../../utils/catchAsync";
import { categoryServices } from "./category.service";
import { sendResponse } from "../../../utils/sendResponse";
import httpStatus from "http-status";
import { AppError } from "../../../utils/AppError";

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
const updateCategory = catchAsync(async (req: Request, res: Response) => {
	const { categoryId } = req.params;
	if (!categoryId) {
		throw new AppError(
			httpStatus.FAILED_DEPENDENCY,
			"CategoryId is required with params",
		);
	}
	const result = await categoryServices.updateCategory(
		req.body,
		categoryId as string,
	);
	sendResponse(res, {
		success: true,
		statusCode: httpStatus.OK,
		message: "Category updated Successfull",
		data: result,
	});
});

const deleteCategory = catchAsync(async (req: Request, res: Response) => {
	const { categoryId } = req.params;
	if (!categoryId) {
		throw new AppError(
			httpStatus.FAILED_DEPENDENCY,
			"CategoryId is required with params",
		);
	}
	const result = await categoryServices.deleteCategory(categoryId as string);
	sendResponse(res, {
		success: true,
		statusCode: httpStatus.OK,
		message: "category deleted Successfull",
		data: result,
	});
});

export const categoryControllers = {
	createCategory,
	getAllCategory,
	updateCategory,
	deleteCategory,
};
