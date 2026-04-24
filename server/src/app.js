import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import taskRoutes from "./routes/taskRoutes.js";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, "../..");

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "TaskFlow API activa",
  });
});

app.use("/api/tasks", taskRoutes);

app.use(express.static(projectRoot));

app.use((req, res, next) => {
  const error = new Error("Ruta no encontrada.");
  error.statusCode = 404;
  next(error);
});

app.use((error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || "Error interno del servidor.";

  res.status(statusCode).json({
    success: false,
    message,
  });
});

const PORT = Number(process.env.PORT) || 3000;
const currentFilePath = fileURLToPath(import.meta.url);
const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === currentFilePath;

if (isDirectRun) {
  app.listen(PORT, () => {
    console.log("========================================");
    console.log("===      SERVIDOR FUNCIONANDO       ===");
    console.log(`===  http://localhost:${PORT}                ===`);
    console.log("========================================");
  });
}

export default app;
