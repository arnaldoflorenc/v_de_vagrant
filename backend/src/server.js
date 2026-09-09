const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const db = require("./config/database");
const authRoutes = require("./Routes/authRoutes");
const pedidoRoutes = require("./Routes/pedidoRoutes");

const app = express();

const ensureKitchenUser = async () => {
    const email = "cozinha@cozinha";
    const senha = "cozinha";

    const [usuarios] = await db.query(
        "SELECT id FROM usuarios WHERE email = ? LIMIT 1",
        [email]
    );

    if (usuarios.length > 0) {
        return;
    }

    const senhaHash = await bcrypt.hash(senha, 10);
    await db.query(
        "INSERT INTO usuarios (nome, email, senha, tipo) VALUES (?, ?, ?, 'cozinha')",
        ["Cozinha", email, senhaHash]
    );
    console.log("Usuário padrão da cozinha criado.");
};

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "Backend funcionando!"
    });
});

app.use("/api", authRoutes);
app.use("/cozinha", pedidoRoutes);

app.get("/usuarios", async (req, res) => {
    try {
        const [usuarios] = await db.query("SELECT * FROM usuarios");

        res.json(usuarios);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Erro ao consultar banco de dados"
        });
    }
});

const startServer = async () => {
    try {
        await ensureKitchenUser();
        app.listen(process.env.PORT || 3000, "0.0.0.0", () => {
            console.log("Backend rodando na porta 3000");
        });
    } catch (error) {
        console.error("Erro ao preparar o usuário padrão da cozinha:", error);
        process.exit(1);
    }
};

startServer();