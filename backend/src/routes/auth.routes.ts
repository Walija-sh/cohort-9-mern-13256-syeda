import { Router } from "express";

import {
  registerUser,
  loginUser,
  getMe,
  logOut
} from "../controllers/auth.controller";

import protect from "../middleware/protect.middleware";

const authRouter = Router();

authRouter.post("/register", registerUser);
authRouter.post("/login", loginUser);


authRouter.get("/me", protect, getMe);
authRouter.post("/logout", protect, logOut);

export default authRouter;