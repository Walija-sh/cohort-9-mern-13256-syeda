import { Router } from "express";

import {
  registerUser,
  loginUser,
  getMe,
} from "../controllers/auth.controller";

import protect from "../middleware/protect.middleware";

const authRouter = Router();

authRouter.post("/register", registerUser);
authRouter.post("/login", loginUser);


authRouter.get("/me", protect, getMe);

export default authRouter;