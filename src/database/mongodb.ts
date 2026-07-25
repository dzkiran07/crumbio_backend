import mongoose from "mongoose";
import { config } from "../config";

export async function connectDatabase(): Promise<void> {
  mongoose.set("strictQuery", true);

  await mongoose.connect(config.mongoUri);

  console.log(`[database] connected to MongoDB (${config.env})`);

  mongoose.connection.on("error", (error) => {
    console.error("[database] connection error:", error);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("[database] disconnected from MongoDB");
  });
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}
