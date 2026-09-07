import { AppError } from "../../../utils/AppError";
import { prisma } from "../../lib/prisma";
import type { ICategory } from "./category.interface";
import httpStatus from "http-status";

const createCategoryToDB = async (payload: ICategory) => {
	const title = payload.title.trim();
	const modifyPayload = { title: title };
	const existingCategory = await prisma.category.findFirst({
		where: {
			title,
		},
	});
	if (existingCategory) {
		throw new AppError(httpStatus.CONFLICT, "Category Already Exists");
	}
	const category = await prisma.category.create({
		data: modifyPayload,
	});
	return category;
};
const getAllCategory = async () => {
	const categories = await prisma.category.findMany({});
	return categories;
};

export const categoryServices = {
	createCategoryToDB,
	getAllCategory,
};
