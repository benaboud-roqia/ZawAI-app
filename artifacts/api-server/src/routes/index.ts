import { Router, type IRouter } from "express";
import healthRouter from "./health";
import captionsRouter from "./captions";
import supportRouter from "./support";
import tipsRouter from "./tips";

const router: IRouter = Router();

router.use(healthRouter);
router.use(captionsRouter);
router.use(supportRouter);
router.use(tipsRouter);

export default router;
