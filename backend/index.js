import express from "express";
import "./config/dotenv.js";
import userRoutes from "./routes/userRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import leadRoutes from "./routes/leadRoutes.js";
import workspaceRoutes from "./routes/workspaceRoutes.js";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
app.use(express.json());
app.use(express.static("public"));

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-workspace-id"],
    credentials: true,
  }),
);
app.use(cookieParser());

app.get("/", (req, res) => res.send("CRM API running"));

app.use("/api/auth", userRoutes);


app.use("/api/workspace", workspaceRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/tasks", taskRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server is running on http://localhost:${PORT}`),
);
