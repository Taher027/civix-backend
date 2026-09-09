import z from "zod";
import {
	ComplaintPriority,
	ComplaintStatus,
} from "../../../../prisma/generated/prisma/enums";

const createComplaintSchema = z
	.object({
		title: z.string("Title is required"),

		short_description: z.string("Short description is required"),

		description: z.string().optional(),

		location: z.string("Location is required"),

		mapURL: z.url("Invalid map URL alignment").optional(),

		initialImages: z.array(z.url("Each image must be a valid URL")).optional(),

		priority: z.enum(ComplaintPriority).optional(),

		status: z.enum(ComplaintStatus).optional(),

		categoryId: z.uuid("Invalid category ID format"),
	})
	.strict();
const updatedComplaintSchema = z
	.object({
		title: z.string("Title is required").optional(),

		short_description: z.string("Short description is required").optional(),

		description: z.string().optional(),

		location: z.string("Location is required").optional(),

		mapURL: z.url("Invalid map URL alignment").optional(),

		initialImages: z.array(z.url("Each image must be a valid URL")).optional(),
	})
	.strict();
export const compaintZodSchemas = {
	createComplaintSchema,
	updatedComplaintSchema,
};
