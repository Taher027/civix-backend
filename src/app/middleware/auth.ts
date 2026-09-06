import type { Request, Response, NextFunction } from "express";
import type { UserRole } from "../../../prisma/generated/prisma/enums";
import { catchAsync } from "../../utils/catchAsync";
import { AppError } from "../../utils/AppError";
import httpStatus from "http-status";
import { jwtUtils } from "../../utils/jwt";
import config from "../config";
import type { JwtPayload } from "jsonwebtoken";
import { prisma } from "../lib/prisma";

export interface RequestUser {
	email: string;
	name: string;
	userID: string;
	role: string;
}
declare global {
	namespace Express {
		interface Request {
			user?: RequestUser;
		}
	}
}
export const auth = (...requiredRoles: UserRole[]) => {
	return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
		const token = req.cookies.accessToken
			? req.cookies.accessToken
			: req.headers.authorization?.startsWith("Bearer ")
				? req.headers.authorization?.split(" ")[1]
				: req.headers.authorization;

		if (!token) {
			throw new AppError(
				httpStatus.UNAUTHORIZED,
				"You are not Logged in. Please log in to access this resource.",
			);
		}
		const verifiedToken = jwtUtils.verifyToken(
			token,
			config.jwt_access_token_secret as string,
		);

		if (!verifiedToken.success) {
			throw new AppError(httpStatus.UNAUTHORIZED, verifiedToken.error);
		}

		const { email, name, userID, role } = verifiedToken.data as JwtPayload;
		if (requiredRoles.length && !requiredRoles.includes(role)) {
			throw new AppError(
				httpStatus.FORBIDDEN,
				"Forbidden. You don't have permission to access this resource.",
			);
		}

		const user = await prisma.user.findUnique({
			where: {
				id: userID,
				email,
				name,
				role,
			},
		});
		if (!user) {
			throw new AppError(
				httpStatus.UNAUTHORIZED,
				"User not found. Please log in again.",
			);
		}

		if (user.status === "BLOCKED") {
			throw new AppError(
				httpStatus.FORBIDDEN,
				"Your account has been blocked. Please contact support.",
			);
		}
		req.user = {
			email,
			name,
			userID,
			role,
		};
		next();
	});
};
