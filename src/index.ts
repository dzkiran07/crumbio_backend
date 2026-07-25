import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import path from "path";
import { config } from "./config";
import { connectDatabase } from "./database/mongodb";
import { HttpError } from "./errors/http-error";
import adminUserRoute from "./routes/admin.user.route";
import authRoute from "./routes/auth.route";
import orderRoute from "./routes/order.route";
import paymentRoute from "./routes/payment.route";
import productRoute from "./routes/product.route";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/auth", authRoute);
app.use("/api/admin/users", adminUserRoute);
app.use("/api/products", productRoute);
app.use("/api/orders", orderRoute);
app.use("/api/payments", paymentRoute);

app.use((_req: Request, _res: Response, next: NextFunction) => {
  next(HttpError.notFound("Route not found"));
});

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof HttpError) {
    res.status(error.statusCode).json({ message: error.message, details: error.details });
    return;
  }

  console.error(error);
  res.status(500).json({ message: "Internal server error" });
});

async function start(): Promise<void> {
  await connectDatabase();
  app.listen(config.port, () => {
    console.log(`[server] Crumbio API listening on port ${config.port}`);
  });
}

start().catch((error) => {
  console.error("[server] failed to start:", error);
  process.exit(1);
});
