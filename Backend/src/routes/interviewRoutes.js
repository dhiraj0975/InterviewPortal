import express from "express";
import {
  addInterview,
  getAllInterviews,
  getInterviewById,
  updateInterview,
  deleteInterview,
} from "../controllers/nterviewController.js";

const router = express.Router();

router.post("/", addInterview);
router.get("/", getAllInterviews);
router.get("/:id", getInterviewById);
router.put("/:id", updateInterview);
router.delete("/:id", deleteInterview);

export default router;
