import "dotenv/config";
import express from "express";
import cors from "cors";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../generated/prisma/client.js";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const app = express();
app.use(cors());
app.use(express.json());

app.get("/users", async (_req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

app.get("/users/:id", async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: Number(req.params.id) },
  });
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});

app.post("/users", async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: "Name and email are required" });
  }
  try {
    const user = await prisma.user.create({ data: { name, email } });
    res.status(201).json(user);
  } catch {
    res.status(409).json({ error: "Email already exists" });
  }
});

app.put("/users/:id", async (req, res) => {
  const { name, email } = req.body;
  try {
    const user = await prisma.user.update({
      where: { id: Number(req.params.id) },
      data: { name, email },
    });
    res.json(user);
  } catch {
    res.status(404).json({ error: "User not found or email already exists" });
  }
});

app.delete("/users/:id", async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
  } catch {
    res.status(404).json({ error: "User not found" });
  }
});