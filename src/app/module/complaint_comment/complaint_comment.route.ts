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
router.patch(
	"/:id",
	auth(UserRole.ADMIN, UserRole.AGENT, UserRole.CITIZEN),
	complaintCommentControllers.updateComplaintComment,
);
router.delete(
	"/:id",
	auth(UserRole.ADMIN, UserRole.AGENT, UserRole.CITIZEN),
	complaintCommentControllers.deleteComplaintComment,
);

export const complaintCommentRoutes = router;
