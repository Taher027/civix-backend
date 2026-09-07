import { Router } from "express";
import { categoryControllers } from "./category.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { categoryZodSchemas } from "./category.validation";
const router = Router();
router.post(
	"/create-category",
	validateRequest(categoryZodSchemas.createCategoryZodSchema),
	categoryControllers.createCategory,
);
router.get("/categories", categoryControllers.getAllCategory);

export const categoryRouter = router;
