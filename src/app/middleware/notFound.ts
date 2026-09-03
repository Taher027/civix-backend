import type { Request, Response, NextFunction } from "express";
import status from "http-status";

const notFound = (req: Request, res: Response, next: NextFunction) => {
	res.status(status.NOT_FOUND).json({
		success: false,
		message: "API Not Found",
		errorMessages: [
			{
				path: req.originalUrl,
				message: "The requested route does not exist.",
			},
		],
	});
};

export default notFound;
