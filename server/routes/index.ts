import { Router } from "express";
import { authRouter } from "./auth.routes";
import { branchRouter } from "./branch.routes";
import { customerRouter } from "./customer.routes";
import { dashboardRouter } from "./dashboard.routes";
import { employeeRouter } from "./employee.routes";
import { healthRouter } from "./health.routes";
import { payrollRouter } from "./payroll.routes";
import { productRouter } from "./product.routes";
import { reportRouter } from "./report.routes";
import { saleRouter } from "./sale.routes";
import { settingsRouter } from "./settings.routes";

/**
 * Every API route is mounted here under the `/api` prefix by `app.ts`.
 */
export const apiRouter = Router();

apiRouter.use(healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/products", productRouter);
apiRouter.use("/branches", branchRouter);
apiRouter.use("/sales", saleRouter);
apiRouter.use("/reports", reportRouter);
apiRouter.use("/dashboard", dashboardRouter);
apiRouter.use("/customers", customerRouter);
apiRouter.use("/settings", settingsRouter);
apiRouter.use("/employees", employeeRouter);
apiRouter.use("/payroll", payrollRouter);
