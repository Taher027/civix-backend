import type { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import type z from "zod";
import { catchAsync } from "../../utils/catchAsync";
import { AppError } from "../../utils/AppError";

export const validateRequest = (zodSchema: z.ZodObject) => {
	return catchAsync((req: Request, res: Response, next: NextFunction) => {
		const payload = req.body ?? {};

		const result = zodSchema.safeParse(payload);

		if (!result.success) {
			const message = result.error.issues
				.map((issue) => issue.message)
				.join(", ");
			throw new AppError(httpStatus.BAD_REQUEST, message);
		}

		req.body = result.data;

		next();
	});
};
