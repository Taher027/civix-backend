import { Router } from "express";
import { authControllers } from "./auth.controller";
import { auth } from "../../middleware/auth";
import { UserRole } from "../../../../prisma/generated/prisma/enums";

const router = Router();
router.post("/login", authControllers.login);
router.get(
	"/getme",
	auth(UserRole.ADMIN, UserRole.AGENT, UserRole.CITIZEN),
	authControllers.getMe,
);

export const authRouter = router;
