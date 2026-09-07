import z from "zod";
import { UserRole } from "../../../../prisma/generated/prisma/enums";

const zodUserRegisterSchema = z.object({
	name: z.string({ error: "Name is required!" }).min(1, "Name cannot be empty"),

	email: z
		.email({ error: "Email is required!" })
		.max(255, "Email must be less than 255 characters"),

	password: z
		.string({ error: "Password is required" })
		.min(6, "Password must be at least 6 characters long"),

	phone: z
		.string({ error: "Phone number is required!" })
		.min(1, "Phone number cannot be empty"),

	city: z.string({ error: "City is required!" }).min(1, "City cannot be empty"),

	address: z
		.string({ error: "Address is required!" })
		.min(1, "Address cannot be empty"),

	role: z.enum(UserRole).optional(),

	avatar: z.string().optional(),

	avatarPublicId: z.string().optional(),
});
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
	zodUserRegisterSchema,
	updateUserValidationSchema,
};
