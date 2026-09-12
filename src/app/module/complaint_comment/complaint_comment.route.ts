import { Router } from "express";
import { complaintCommentControllers } from "./complaint_comment.controller";
import { auth } from "../../middleware/auth";
import { UserRole } from "../../../../prisma/generated/prisma/enums";

const router = Router();
router.get(
	"/:complaintID",
	complaintCommentControllers.getAllComplaintComments,
);
router.post(
	"/:complaintID",
	auth(UserRole.ADMIN, UserRole.AGENT, UserRole.CITIZEN),
	complaintCommentControllers.createComplaintComment,
);

export const complaintCommentRoutes = router;
