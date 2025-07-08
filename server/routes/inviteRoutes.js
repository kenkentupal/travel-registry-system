import express from "express";
import { fetchInvites, createInvite } from "../controllers/inviteController.js";

const router = express.Router();

router.get("/", fetchInvites);
router.post("/", createInvite);

export default router;
