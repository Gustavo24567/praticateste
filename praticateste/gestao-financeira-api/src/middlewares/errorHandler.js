// src/middlewares/errorHandler.js
/**
 * Middleware central de erro do Express.
 * Captura tudo que cair em next(error) e devolve JSON consistente.
 */
export function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.name === "ZodError") {
    return res.status(400).json({ error: "Dados inválidos", details: err.issues });
  }
  if (err.code === "P2025") {
    return res.status(404).json({ error: "Recurso não encontrado" });
  }
  if (err.code === "P2002") {
    return res.status(409).json({ error: "Registro duplicado" });
  }

  res.status(500).json({ error: "Erro interno do servidor" });
}