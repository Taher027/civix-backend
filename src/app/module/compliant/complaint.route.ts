import { Router } from "express";
import { complaintControllers } from "./complaint.controller";
import { auth } from "../../middleware/auth";
import { UserRole } from "../../../../prisma/generated/prisma/enums";
import { compaintZodSchemas } from "./complaint.validation";
import { validateRequest } from "../../middleware/validateRequest";
const router = Router();
router.post(
	"/create-complaint",
	validateRequest(compaintZodSchemas.createComplaintSchema),
	auth(UserRole.ADMIN, UserRole.AGENT, UserRole.CITIZEN),
	complaintControllers.createComplaint,
);
router.get("/complaints", complaintControllers.getAllComplaints);
router.patch(
	"/update-complaint/:id",
	validateRequest(compaintZodSchemas.updatedComplaintSchema),
	auth(UserRole.ADMIN, UserRole.AGENT, UserRole.CITIZEN),
	complaintControllers.updateComplaint,
);
router.patch(
	"/update-complaint-status/:id",
	auth(UserRole.ADMIN, UserRole.AGENT, UserRole.CITIZEN),
	complaintControllers.updatedComplaintStatus,
);
router.delete("/delete-complaint/:id", complaintControllers.deletedComplaint);
export const compaintRoute = router;
