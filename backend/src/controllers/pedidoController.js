const db = require("../config/database");

const get_pedido = async (req, res) => {
    try {
        const [pedidos] = await db.query(
            "SELECT id, content, value, data_pedido, hora_pedido FROM pedidos ORDER BY data_pedido DESC, id DESC"
        );
        res.json(pedidos);
    } catch (error) {
        console.error("Erro ao buscar pedidos:", error);
        res.status(500).json({ error: "Erro ao buscar pedidos" });
    }
};

const atualiza_pedido = async (req, res) => {
    const { id, value } = req.body;
    const statusPermitidos = ["pendente", "em produção", "finalizado"];

    if (!id || !statusPermitidos.includes(value)) {
        return res.status(400).json({ error: "Id e status válido são obrigatórios." });
    }

    try {
        const [result] = await db.query(
            "UPDATE pedidos SET value = ? WHERE id = ?",
            [value, id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Pedido não encontrado." });
        }

        res.json({ message: "Pedido atualizado com sucesso" });
    } catch (error) {
        console.error("Erro ao atualizar pedido:", error);
        res.status(500).json({ error: "Erro ao atualizar pedido" });
    }
};

    const post_pedido = async (req, res) => {
        const { id_usuario, data_pedido, hora_pedido, content} = req.body;

        if (!id_usuario || !data_pedido || !hora_pedido || !content) {
            return res.status(400).json({ error: "Todos os campos são obrigatórios." });
        }
        try {
            const [result] = await db.query(
                "INSERT INTO pedidos (usuario_id, data_pedido, hora_pedido, content) VALUES (?, ?, ?, ?)",
                [id_usuario, data_pedido, hora_pedido, content]
            );
            res.status(201).json({ message: "Pedido criado com sucesso", id: result.insertId });
        } catch (error) {
            console.error("Erro ao criar pedido:", error);
            res.status(500).json({ error: "Erro ao criar pedido" });
        }
    }

module.exports = { get_pedido, atualiza_pedido, post_pedido };