import { z } from "zod";

const createDonation = z.object({
	amount: z.number("Amount is required").positive(),
	payerReference: z.string().optional(),
});

export const DonationValidation = {
	createDonation,
};
