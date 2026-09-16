import z from "zod";

const updateUserValidationSchema = z
	.object({
		name: z
			.string("Name must be a string")
			.min(1, "Name cannot be empty")
			.max(255, "Name is too long")
			.optional(),
		phone: z
			.string("Phone must be a string")
			.min(1, "Phone cannot be empty")
			.optional(),
		city: z
			.string("City must be a string")
			.min(1, "City cannot be empty")
			.optional(),
		address: z
			.string("Address must be a string")
			.min(1, "Address cannot be empty")
			.optional(),
	})
	.strict();

export const userZodValidation = {
	updateUserValidationSchema,
};
