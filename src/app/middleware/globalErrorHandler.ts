import type { ErrorRequestHandler } from "express";
import handlePrismaClientKnownRequestError from "../error/handlePrismaError";
import type { IGenericErrorMessage } from "../types";
import { Prisma } from "../../../prisma/generated/prisma/client";
import { AppError } from "../../utils/AppError";

const globalErrorHandler: ErrorRequestHandler = (error, req, res, next) => {
	let statusCode = 500;
	let message = "Something went wrong!";
	let errorMessages: IGenericErrorMessage[] = [
		{ path: "", message: error.message || "Something went wrong!" },
	];
	if (error instanceof Prisma.PrismaClientKnownRequestError) {
		const simplifiedError = handlePrismaClientKnownRequestError(error);

		statusCode = simplifiedError.statusCode;
		message = simplifiedError.message;
		errorMessages = simplifiedError.errorMessages;
	} else if (error instanceof Prisma.PrismaClientValidationError) {
		statusCode = 400;
		message = "Invalid data passed to database query";
		errorMessages = [{ path: "", message: error.message }];
	} else if (error instanceof AppError) {
		statusCode = error.statusCode;
		message = error.message;

		errorMessages = [
			{
				path: "",
				message: error.message,
			},
		];
	}

	res.status(statusCode).json({
		success: false,
		message,
		errorMessages,
	});
};

export default globalErrorHandler;
