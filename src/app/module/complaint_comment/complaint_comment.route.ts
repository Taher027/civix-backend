import { Router } from "express";
import { complaintCommentControllers } from "./complaint_comment.controller";
import { auth } from "../../middleware/auth";
import { UserRole } from "../../../../prisma/generated/prisma/enums";
import { upload } from "../../lib/multer";
import { parseFormDataJson } from "../../middleware/parseFormDataJson";
import { complaintCommentZodValidation } from "./complaint_comment.validation";
import { validateRequest } from "../../middleware/validateRequest";

const router = Router();
router.get(
	"/:complaintID",
	complaintCommentControllers.getAllComplaintComments,
);
router.post(
	"/:complaintID",
	auth(UserRole.ADMIN, UserRole.VOLUNTEER, UserRole.CITIZEN),
	upload.array("commentImages", 2),
	parseFormDataJson,
	validateRequest(complaintCommentZodValidation.createCommentSchema),
	complaintCommentControllers.createComplaintComment,
);
router.patch(
	"/:id",
	auth(UserRole.ADMIN, UserRole.VOLUNTEER, UserRole.CITIZEN),
	complaintCommentControllers.updateComplaintComment,
);
router.delete(
	"/:id",
	auth(UserRole.ADMIN, UserRole.VOLUNTEER, UserRole.CITIZEN),
	complaintCommentControllers.deleteComplaintComment,
);

export const complaintCommentRoutes = router;
