// src/routes/transactions.js
import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import {
  createTransactionSchema,
  updateTransactionSchema,
} from "../schemas/transactionSchema.js";

const router = Router();

// GET /transactions - lista transações do usuário logado (com filtro opcional de mês/ano)
router.get("/", async (req, res, next) => {
  try {
    const { mes, ano } = req.query;
    let where = { userId: req.userId };

    if (mes && ano) {
      const startDate = new Date(parseInt(ano), parseInt(mes) - 1, 1);
      const endDate = new Date(parseInt(ano), parseInt(mes), 0); // último dia do mês
      where.date = {
        gte: startDate,
        lte: endDate,
      };
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: { category: true },
      orderBy: { date: "desc" },
    });

    res.json(transactions);
  } catch (e) {
    next(e);
  }
});

// POST /transactions - cria nova transação para o usuário logado
router.post("/", async (req, res, next) => {
  try {
    const data = createTransactionSchema.parse(req.body);
    const transaction = await prisma.transaction.create({
      data: {
        ...data,
        userId: req.userId, // vincula a transação ao usuário autenticado
      },
      include: { category: true },
    });
    res.status(201).json(transaction);
  } catch (e) {
    next(e);
  }
});

// PUT /transactions/:id - atualiza transação (apenas se pertencer ao usuário)
router.put("/:id", async (req, res, next) => {
  try {
    const data = updateTransactionSchema.parse(req.body);
    
    // Verifica se a transação existe e pertence ao usuário
    const existing = await prisma.transaction.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!existing) {
      return res.status(404).json({ error: "Transação não encontrada ou não pertence ao usuário" });
    }

    const transaction = await prisma.transaction.update({
      where: { id: req.params.id },
      data,
      include: { category: true },
    });
    res.json(transaction);
  } catch (e) {
    next(e);
  }
});

// DELETE /transactions/:id - remove transação (apenas se pertencer ao usuário)
router.delete("/:id", async (req, res, next) => {
  try {
    // Verifica se a transação existe e pertence ao usuário
    const existing = await prisma.transaction.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!existing) {
      return res.status(404).json({ error: "Transação não encontrada ou não pertence ao usuário" });
    }

    await prisma.transaction.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

export default router;