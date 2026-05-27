import "dotenv/config";
import express from "express";
import cors from "cors";               // ← apenas uma vez
import categoriesRouter from "./routes/categories.js";
import transactionsRouter from "./routes/transactions.js";
import authRouter from "./routes/auth.js";
import { auth } from "./middlewares/auth.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();

app.use(cors());                       // ← usa o cors importado
app.use(express.json());

app.get("/", (req, res) => res.json({ ok: true, name: "gestao-financeira-api" }));

// Rotas públicas
app.use("/", authRouter);

// Rotas protegidas
app.use("/categories", auth, categoriesRouter);
app.use("/transactions", auth, transactionsRouter);

app.use(errorHandler);

const port = process.env.PORT ?? 3000;
app.listen(port, () => {
  console.log(`API rodando em http://localhost:${port}`);
});