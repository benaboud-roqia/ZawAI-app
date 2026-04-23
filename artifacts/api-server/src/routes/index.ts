import { Router, type IRouter } from "express";
import healthRouter from "./health";
import captionsRouter from "./captions";
import supportRouter from "./support";
import tipsRouter from "./tips";
import scenariosRouter from "./scenarios";

const router: IRouter = Router();

router.use(healthRouter);
router.use(captionsRouter);
router.use(supportRouter);
router.use(tipsRouter);
router.use(scenariosRouter);

export default router;
