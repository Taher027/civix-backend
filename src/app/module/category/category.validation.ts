import z from "zod";

const createCategoryZodSchema = z
	.object({
		title: z
			.string("Category title is required")
			.min(1, { message: "Category title cannot be empty" }),
	})
	.strict();

export const categoryZodSchemas = {
	createCategoryZodSchema,
};
