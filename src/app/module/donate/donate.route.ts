import express from "express";
import { auth } from "../../middleware/auth";
import { validateRequest } from "../../middleware/validateRequest";
import { DonationValidation } from "./donate.validation";
import { DonationController } from "./donate.controller";
import { UserRole } from "../../../../prisma/generated/prisma/enums";

const router = express.Router();

router.post(
	"/",
	auth(UserRole.CITIZEN, UserRole.VOLUNTEER, UserRole.ADMIN),
	validateRequest(DonationValidation.createDonation),
	DonationController.createDonation,
);

router.get("/callback", DonationController.callback);
router.get(
	"/my-donations",
	auth(UserRole.CITIZEN, UserRole.VOLUNTEER, UserRole.ADMIN),
	DonationController.getMyDonations,
);
router.get(
	"/:id",
	auth(UserRole.CITIZEN, UserRole.VOLUNTEER, UserRole.ADMIN),
	DonationController.getDonationById,
);

export const DonationRoutes = router;
