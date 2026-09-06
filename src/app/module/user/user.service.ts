import { AppError } from "../../../utils/AppError";
import { prisma } from "../../lib/prisma";
import type { IUserRegister } from "./user.interface";
import httpStatus from "http-status";
import bcrypt from "bcrypt";
import config from "../../config";
import type { UploadApiResponse } from "cloudinary";
import { cloudinary } from "../../lib/cloudinary";

const userRegisterToDB = async (payload: IUserRegister) => {
	const isExist = await prisma.user.findUnique({
		where: {
			email: payload.email,
		},
	});

	if (isExist) {
		throw new AppError(httpStatus.CONFLICT, "User already Exists");
	}

	const hashedPassword = await bcrypt.hash(
		payload.password,
		Number(config.bcrypt_salt_round),
	);

	const createUser = await prisma.user.create({
		data: {
			...payload,
			password: hashedPassword,
		},
		omit: {
			password: true,
		},
	});
	console.log(payload);

	return createUser;
};
const updateProfileImage = async (buffer: Buffer, userID: string) => {
	const currentUser = await prisma.user.findUnique({
		where: {
			id: userID,
		},
		select: {
			avatarPublicId: true,
			avatar: true,
		},
	});
	const cloudinaryResult = await new Promise<UploadApiResponse>(
		(resolve, reject) => {
			cloudinary.uploader
				.upload_stream(
					{
						resource_type: "auto",
					},
					async (error, result) => {
						if (error) {
							return reject(error);
						}
						if (!result) {
							return reject(
								new AppError(
									httpStatus.BAD_REQUEST,
									"No result found from cloudinary",
								),
							);
						}
						resolve(result);
					},
				)
				.end(buffer);
		},
	);

	const updatedUser = await prisma.user.update({
		where: {
			id: userID,
		},
		data: {
			avatar: cloudinaryResult.secure_url,
			avatarPublicId: cloudinaryResult.public_id,
		},
		omit: { password: true },
	});

	if (currentUser?.avatarPublicId && currentUser.avatar) {
		await cloudinary.uploader.destroy(currentUser.avatarPublicId);
	}

	return updatedUser;
};

export const userServices = {
	userRegisterToDB,
	updateProfileImage,
};
