import { UserStatus } from "../../../../prisma/generated/prisma/enums";
import { AppError } from "../../../utils/AppError";
import { prisma } from "../../lib/prisma";
import crypto from "crypto";
import type {
	ILoginPayload,
	IRequestUser,
	IVerifyEmailPayload,
} from "./auth.interface";
import httpStatus from "http-status";
import bcrypt from "bcrypt";
import { jwtUtils } from "../../../utils/jwt";
import config from "../../config";
import type { JwtPayload, SignOptions } from "jsonwebtoken";
import type { IUserRegister } from "../user/user.interface";
import { redisClient } from "../../lib/redis";
import { transporter } from "../../lib/nodemailer";
const userRegisterToDB = async (payload: IUserRegister) => {
	const { password, ...userData } = payload;

	const isExist = await prisma.user.findUnique({
		where: {
			email: payload.email,
		},
	});

	if (isExist) {
		throw new AppError(httpStatus.CONFLICT, "User already Exists");
	}

	const saltRounds = Number(config.bcrypt_salt_round) || 10;
	const hashedPassword = await bcrypt.hash(password, saltRounds);

	const expirationSeconds = 5 * 60;
	const otpKey = `user-registration-otp:${payload.email}`;
	const otpValue = crypto.randomInt(100000, 1000000).toString();

	await redisClient.set(otpKey, otpValue, { EX: expirationSeconds });

	const userRegistrationKey = `user-registration-data:${payload.email}`;
	const redisUserDataPayload = { ...userData, password: hashedPassword };

	await redisClient.set(
		userRegistrationKey,
		JSON.stringify(redisUserDataPayload),
		{ EX: expirationSeconds },
	);

	await transporter.sendMail({
		from: config.email_sender,
		to: payload.email,
		subject: "Email Verification",
		html: `<h1>Your OTP is ${otpValue}</h1>`,
	});

	return { message: "Verification OTP sent to email." };
};

const verifyUserEmail = async (payload: IVerifyEmailPayload) => {
	const otp = payload.otp;
	const email = payload.email.trim().toLowerCase();
	const otpKey = `user-registration-otp:${email}`;
	const redisOtp = await redisClient.get(otpKey);

	if (!redisOtp) {
		throw new AppError(httpStatus.BAD_REQUEST, "OTP has expired or is invalid");
	}

	if (redisOtp !== otp) {
		throw new AppError(httpStatus.BAD_REQUEST, "OTP Does Not Match");
	}

	const userRegistrationKey = `user-registration-data:${email}`;
	const redisUserData = await redisClient.get(userRegistrationKey);

	if (!redisUserData) {
		throw new AppError(
			httpStatus.NOT_FOUND,
			"Registration session expired. Please register again.",
		);
	}

	const isUserExist = await prisma.user.findUnique({
		where: { email },
	});

	if (isUserExist) {
		if (isUserExist.status === "BLOCKED") {
			throw new AppError(httpStatus.FORBIDDEN, "User is Blocked");
		}
		if (isUserExist.emailVerified) {
			throw new AppError(httpStatus.CONFLICT, "Email Already Verified");
		}
		if (isUserExist.isDeleted || isUserExist.status === "DELETED") {
			throw new AppError(httpStatus.FORBIDDEN, "User account is deleted");
		}
	}

	const registrationPayload = JSON.parse(redisUserData);

	const createUser = await prisma.user.create({
		data: {
			...registrationPayload,
			emailVerified: true,
		},
		omit: { password: true },
	});

	await redisClient.del(otpKey);
	await redisClient.del(userRegistrationKey);

	const { id, name, role, email: userEmail } = createUser;
	const jwtPayload = {
		userID: id,
		name,
		role,
		email: userEmail,
	};

	const accessToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_access_token_secret as string,
		config.jwt_access_token_expireIn as SignOptions,
	);

	const refreshToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_refresh_token_secret as string,
		config.jwt_refresh_token_expireIn as SignOptions,
	);

	try {
		await transporter.sendMail({
			from: config.email_sender,
			to: email,
			subject: "Welcome to Civix.",
			html: `<h1>Your email (${userEmail}) is successfully verified.</h1>`,
		});
	} catch (emailError) {
		console.error("Failed to send welcome email:", emailError);
	}

	return {
		createUser,
		accessToken,
		refreshToken,
	};
};

const loginToDB = async (payload: ILoginPayload) => {
	const { password } = payload;
	const email = payload.email.trim().toLowerCase();
	const user = await prisma.user.findUnique({
		where: {
			email,
		},
	});
	if (!user) {
		throw new AppError(httpStatus.NOT_FOUND, "User Not Found");
	}
	if (user.status === UserStatus.BLOCKED) {
		throw new AppError(httpStatus.FORBIDDEN, "User is blocked");
	}

	if (user.isDeleted || user.status === UserStatus.DELETED) {
		throw new AppError(httpStatus.FORBIDDEN, "User is deleted");
	}

	const isPasswordMatched = await bcrypt.compare(
		password,
		user.password as string,
	);
	if (!isPasswordMatched) {
		throw new AppError(httpStatus.UNAUTHORIZED, "Invalid credentials");
	}

	const jwtPayload = {
		userID: user.id,
		name: user.name,
		email: user.email,
		role: user.role,
	};
	const accessToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_access_token_secret as string,
		config.jwt_access_token_expireIn as SignOptions,
	);

	const refreshToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_refresh_token_secret as string,
		config.jwt_refresh_token_expireIn as SignOptions,
	);

	return {
		accessToken,
		refreshToken,
	};
};
const refreshToken = async (token: string) => {
	const verifiedRefreshToken = jwtUtils.verifyToken(
		token,
		config.jwt_refresh_token_secret as string,
	);

	if (!verifiedRefreshToken.success || !verifiedRefreshToken.data) {
		throw new AppError(
			httpStatus.UNAUTHORIZED,
			config.node_env === "development"
				? verifiedRefreshToken.error
				: "Invalid refresh token",
		);
	}

	const data = verifiedRefreshToken.data as JwtPayload;

	const user = await prisma.user.findUnique({
		where: { id: data.userID },
	});

	if (!user || user.isDeleted || user.status !== UserStatus.ACTIVE) {
		throw new AppError(
			httpStatus.UNAUTHORIZED,
			"User is inactive or not found",
		);
	}

	const jwtPayload = {
		userID: user.id,
		name: user.name,
		email: user.email,
		role: user.role,
	};

	const accessToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_access_token_secret as string,
		config.jwt_access_token_expireIn as SignOptions,
	);

	const refreshToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_refresh_token_secret as string,
		config.jwt_refresh_token_expireIn as SignOptions,
	);

	return {
		accessToken,
		refreshToken,
	};
};
const getMe = async (user: IRequestUser) => {
	const isUserExists = await prisma.user.findUnique({
		where: {
			id: user.userID,
		},
		omit: {
			password: true,
		},
	});

	if (!isUserExists) {
		throw new AppError(httpStatus.NOT_FOUND, "User not found");
	}

	return isUserExists;
};

export const authServices = {
	userRegisterToDB,
	verifyUserEmail,
	loginToDB,
	refreshToken,
	getMe,
};
