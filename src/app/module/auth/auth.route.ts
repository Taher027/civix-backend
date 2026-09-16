import { Router } from "express";
import { authControllers } from "./auth.controller";
import { auth } from "../../middleware/auth";
import { UserRole } from "../../../../prisma/generated/prisma/enums";
import { validateRequest } from "../../middleware/validateRequest";
import { authZodValidations } from "./auth.validation";

const router = Router();
router.post(
	"/register-user",
	validateRequest(authZodValidations.zodUserRegisterSchema),
	authControllers.userRegister,
);
router.post(
	"/verify-email",
	validateRequest(authZodValidations.zodUserEmailVerifySchema),
	authControllers.verifyUserEmail,
);
router.post(
	"/login",
	validateRequest(authZodValidations.zodUserLoginSchema),
	authControllers.login,
);
router.get(
	"/getme",
	auth(UserRole.ADMIN, UserRole.VOLUNTEER, UserRole.CITIZEN),
	authControllers.getMe,
);

export const authRouter = router;
