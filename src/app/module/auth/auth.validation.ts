import z from "zod";

const zodUserLoginSchema = z.object({
	email: z.email("Email is required!"),
	password: z.string("Password is required"),
});

export const authZodValidations = {
	zodUserLoginSchema,
};
