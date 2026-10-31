import { Router } from "express";
import { router as user } from "./users/index.route.js";

const router: Router = Router();

router.use("/users", user);

export default router;
