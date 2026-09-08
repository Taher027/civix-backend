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
const updateCategory = async (payload: ICategory, categoryId: string) => {
	const updatedCategory = await prisma.category.update({
		where: {
			id: categoryId,
		},
		data: {
			title: payload.title,
		},
	});
	return updatedCategory;
};
const deleteCategory = async (categoryId: string) => {
	const category = await prisma.category.findUnique({
		where: { id: categoryId },
	});
	if (!category?.title) {
		throw new AppError(httpStatus.NOT_FOUND, "category does not found!");
	}
	await prisma.category.delete({
		where: {
			id: categoryId,
		},
	});
	return {
		messege: `category ${category?.title} is deleted successfull!`,
	};
};

export const categoryServices = {
	createCategoryToDB,
	getAllCategory,
	updateCategory,
	deleteCategory,
};
