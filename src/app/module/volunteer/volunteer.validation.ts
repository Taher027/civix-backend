import { z } from "zod";

const zodVolunteerApplySchema = z.object({
	bio: z.string().max(1000).optional(),
	skills: z.array(z.string()).optional(),
});

const zodVolunteerReviewSchema = z.object({
	status: z.enum(["APPROVED", "REJECTED"]),
});
const zodComplaintVolunteerApplySchema = z.object({
	message: z.string().max(500).optional(),
});

export const submitComplaintStatusValidationSchema = z.object({
	statusNote: z
		.string("Status note is required")
		.min(1, "Status note is required")
		.trim(),
});

export const volunteerZodValidations = {
	zodVolunteerApplySchema,
	zodVolunteerReviewSchema,
	zodComplaintVolunteerApplySchema,
};
