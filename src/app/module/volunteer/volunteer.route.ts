import { Router } from "express";
import { auth } from "../../middleware/auth";
import { UserRole } from "../../../../prisma/generated/prisma/enums";
import { validateRequest } from "../../middleware/validateRequest";
import { volunteerZodValidations } from "./volunteer.validation";
import { volunteerControllers } from "./volunteer.controller";
import { upload } from "../../lib/multer";
import { parseFormDataJson } from "../../middleware/parseFormDataJson";

const router = Router();

router.post(
	"/apply",
	auth(UserRole.CITIZEN),
	validateRequest(volunteerZodValidations.zodVolunteerApplySchema),
	volunteerControllers.applyForVolunteer,
);

router.get(
	"/me",
	auth(UserRole.CITIZEN, UserRole.VOLUNTEER),
	volunteerControllers.getMyProfile,
);

router.get(
	"/applications",
	auth(UserRole.ADMIN),
	volunteerControllers.getAllApplications,
);

router.patch(
	"/applications/:userId/review",
	auth(UserRole.ADMIN),
	validateRequest(volunteerZodValidations.zodVolunteerReviewSchema),
	volunteerControllers.reviewApplication,
);

router.post(
	"/complaints/:complaintId/apply",
	auth(UserRole.VOLUNTEER),
	validateRequest(volunteerZodValidations.zodComplaintVolunteerApplySchema),
	volunteerControllers.applyForComplaint,
);

router.get(
	"/complaints/:complaintId/applications",
	auth(UserRole.ADMIN),
	volunteerControllers.getComplaintApplications,
);

router.patch(
	"/complaints/:complaintId/accept/:volunteerId",
	auth(UserRole.ADMIN),
	volunteerControllers.acceptVolunteer,
);

router.patch(
	"/complaints/:complaintId/status",
	auth(UserRole.VOLUNTEER),
	upload.array("solutionImages", 5),
	parseFormDataJson,
	volunteerControllers.submitComplaintStatus,
);

router.patch(
	"/complaints/:complaintId/resolve/:volunteerId",
	auth(UserRole.ADMIN),
	volunteerControllers.resolveComplaint,
);

export const volunteerRouter = router;
