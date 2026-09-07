import { Router } from "express";
import { userControllers } from "./user.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { userZodValidation } from "./user.Validation";
import { auth } from "../../middleware/auth";
import { UserRole } from "../../../../prisma/generated/prisma/enums";
import { upload } from "../../lib/multer";

const router = Router();

router.post(
	"/register-user",
	validateRequest(userZodValidation.zodUserRegisterSchema),
	userControllers.userRegister,
);
router.patch(
	"/profile-image",
	auth(UserRole.ADMIN, UserRole.AGENT, UserRole.CITIZEN),
	upload.single("profileImage"),
	userControllers.updateProfileImage,
);
router.patch(
	"/update-user",
	validateRequest(userZodValidation.updateUserValidationSchema),
	auth(UserRole.ADMIN, UserRole.AGENT, UserRole.CITIZEN),
	userControllers.updateUser,
);

export const userRoute = router;
