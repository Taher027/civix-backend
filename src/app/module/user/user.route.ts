import { Router } from "express";
import { userControllers } from "./user.controller";

const router = Router();

router.post("/register-user", userControllers.userRegister);

export const userRoute = router;
