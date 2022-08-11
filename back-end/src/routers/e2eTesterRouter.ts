import { Router } from "express";
import { recommendationController } from "../controllers/recommendationController.js";

const e2eTestRouter = Router();

e2eTestRouter.post("/tests/reset", recommendationController.deleteAll);

export default e2eTestRouter;
