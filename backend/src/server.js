const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./config/database");
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "Backend funcionando!"
    });
});

app.use("/api", authRoutes);

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

app.listen(process.env.PORT || 3000, "0.0.0.0", () => {
    console.log("Backend rodando na porta 3000");
});