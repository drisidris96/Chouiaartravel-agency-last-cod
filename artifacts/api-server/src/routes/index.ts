import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import tripsRouter from "./trips";
import bookingsRouter from "./bookings";
import reservationsRouter from "./reservations";
import visaRequestsRouter from "./visa-requests";
import residencyRequestsRouter from "./residency-requests";
import serviceRequestsRouter from "./service-requests";
import adminRouter from "./admin";
import supportRouter from "./support";
import uploadRouter from "./upload";
import announcementsRouter from "./announcements";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/trips", tripsRouter);
router.use("/bookings", bookingsRouter);
router.use("/reservations", reservationsRouter);
router.use("/visa-requests", visaRequestsRouter);
router.use("/residency-requests", residencyRequestsRouter);
router.use("/service-requests", serviceRequestsRouter);
router.use("/admin", adminRouter);
router.use("/support", supportRouter);
router.use("/announcements", announcementsRouter);
router.use(uploadRouter);

export default router;
