import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import {
  createCategorySchema,
  updateCategorySchema,
} from "../schemas/categorySchema.js";

const router = Router();

// GET /categories - lista categorias do usuário + globais
router.get("/", async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      where: {
        OR: [
          { userId: req.userId },      // categorias criadas pelo próprio usuário
          { userId: null },            // categorias globais (padrão)
        ],
      },
      orderBy: { displayName: "asc" },
    });
    res.json(categories);
  } catch (e) { next(e); }
});

// POST /categories - cria nova categoria personalizada
router.post("/", async (req, res, next) => {
  try {
    const data = createCategorySchema.parse(req.body);
    const category = await prisma.category.create({
      data: {
        ...data,
        userId: req.userId,   // associa ao usuário logado
        isDefault: false,     // categorias criadas via app não são padrão
      },
    });
    res.status(201).json(category);
  } catch (e) { next(e); }
});

// PUT /categories/:id - atualiza categoria (apenas se for do usuário)
router.put("/:id", async (req, res, next) => {
  try {
    const data = updateCategorySchema.parse(req.body);
    // Verifica se a categoria pertence ao usuário
    const existing = await prisma.category.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!existing) {
      return res.status(404).json({ error: "Categoria não encontrada ou não pertence ao usuário" });
    }
    const category = await prisma.category.update({
      where: { id: req.params.id },
      data,
    });
    res.json(category);
  } catch (e) { next(e); }
});

// DELETE /categories/:id - remove categoria (apenas se for do usuário e não for padrão)
router.delete("/:id", async (req, res, next) => {
  try {
    // Busca só pelo id, sem filtrar por userId
    const existing = await prisma.category.findFirst({
      where: { id: req.params.id },
    });

    if (!existing) {
      return res.status(404).json({ error: "Categoria não encontrada" });
    }
    if (existing.isDefault) {
      return res.status(400).json({ error: "Categorias padrão não podem ser excluídas" });
    }
    // Só agora verifica se pertence ao usuário
    if (existing.userId !== req.userId) {
      return res.status(404).json({ error: "Categoria não pertence ao usuário" });
    }

    await prisma.category.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (e) { next(e); }
});

export default router;