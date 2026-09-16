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
const zodUserLoginSchema = z.object({
	email: z.email("Email is required!"),
	password: z.string("Password is required"),
});
const zodUserEmailVerifySchema = z.object({
	email: z.email("Not email!!"),
	otp: z.string().length(6),
});

export const authZodValidations = {
	zodUserRegisterSchema,
	zodUserLoginSchema,
	zodUserEmailVerifySchema,
};
