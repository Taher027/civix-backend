import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../utils/AppError";
import httpStatus from "http-status";
export const parseFormDataJson = (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	if (req.body?.data && typeof req.body.data === "string") {
		try {
			const parsed = JSON.parse(req.body.data);
			req.body = { ...req.body, ...parsed };
			delete req.body.data;
		} catch {
			throw new AppError(
				httpStatus.BAD_REQUEST,
				"Invalid JSON in 'data' field",
			);
		}
	}
	next();
};
