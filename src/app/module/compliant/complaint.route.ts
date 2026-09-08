import { Router } from "express";
import { complaintControllers } from "./complaint.controller";
import { auth } from "../../middleware/auth";
import { UserRole } from "../../../../prisma/generated/prisma/enums";
const router = Router();
router.post(
	"/create-complaint",
	auth(UserRole.ADMIN, UserRole.AGENT, UserRole.CITIZEN),
	complaintControllers.createComplaint,
);

export const compaintRoute = router;
