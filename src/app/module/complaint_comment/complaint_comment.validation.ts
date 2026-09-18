import z from "zod";

const createCommentSchema = z
	.object({
		text: z.string().optional(),
	})
	.strict();

export const complaintCommentZodValidation = {
	createCommentSchema,
};
