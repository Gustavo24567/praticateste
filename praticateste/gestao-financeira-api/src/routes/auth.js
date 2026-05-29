import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "chave_super_secreta";
console.log("JWT_SECRET:", JWT_SECRET); // Verifique se a variável de ambiente está sendo lida corretamente

router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, passwordHash },
    });
    const token = jwt.sign({ userId: user.id }, JWT_SECRET);
    res.status(201).json({ token, user: { id: user.id, name, email } });
  } catch (e) {
    next(e);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }
    const token = jwt.sign({ userId: user.id }, JWT_SECRET);
    res.json({ token, user: { id: user.id, name: user.name, email } });
  } catch (e) {
    next(e);
  }
});

export default router;