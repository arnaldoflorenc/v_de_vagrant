const express = require("express");
const { get_pedido, atualiza_pedido } = require("../controllers/pedidoController");
    
const router = express.Router();

router.get("/pedidos/", get_pedido);
router.put("/pedidos", atualiza_pedido);

module.exports = router;