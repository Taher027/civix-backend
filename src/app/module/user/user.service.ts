import { AppError } from "../../../utils/AppError";
import { prisma } from "../../lib/prisma";
import type { IUserUpdateData } from "./user.interface";
import httpStatus from "http-status";
import type { UploadApiResponse } from "cloudinary";
import { cloudinary } from "../../lib/cloudinary";

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
const updateUserToDB = async (userID: string, payload: IUserUpdateData) => {
	const isExist = await prisma.user.findUnique({
		where: {
			id: userID,
		},
	});

	if (!isExist) {
		throw new AppError(httpStatus.NOT_FOUND, "User not found");
	}
	const updatedUser = await prisma.user.update({
		where: {
			id: userID,
		},
		data: payload,
		omit: {
			password: true,
		},
	});

	return updatedUser;
};

export const userServices = {
	updateProfileImage,
	updateUserToDB,
};
