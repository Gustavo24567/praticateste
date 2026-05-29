import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "chave_super_secreta";

export function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Token não fornecido" });
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (e) {
    res.status(401).json({ error: "Token inválido" });
  }
}