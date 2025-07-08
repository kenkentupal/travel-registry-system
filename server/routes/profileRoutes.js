import express from "express";
import { fetchProfiles } from "../controllers/profileController";

const router = express.Router();

router.get("/", fetchProfiles);

export default router;
