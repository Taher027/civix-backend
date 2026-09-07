import { Router } from "express";
import { complaintControllers } from "./complaint.controller";
const router = Router();
router.post("/create-complaint", complaintControllers.createComplaint);

export const compaintRoute = router;
