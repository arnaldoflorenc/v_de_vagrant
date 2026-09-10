CREATE DATABASE IF NOT EXISTS vagrantdb;

USE vagrantdb;

CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    tipo ENUM('cliente', 'cozinha', 'admin') NOT NULL DEFAULT 'cliente'
);

ALTER TABLE usuarios
    MODIFY COLUMN tipo ENUM('cliente', 'cozinha', 'admin') NOT NULL DEFAULT 'cliente';

CREATE TABLE IF NOT EXISTS pedidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    data_pedido DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    hora_pedido TIME NOT NULL DEFAULT (CURRENT_TIME()),
    content VARCHAR(255) NOT NULL,
    value ENUM('pendente', 'em produção', 'finalizado') NOT NULL DEFAULT 'pendente',
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE USER IF NOT EXISTS 'app'@'10.1.2.10' IDENTIFIED BY 'senha'; 
GRANT ALL PRIVILEGES ON vagrantdb.* TO 'app'@'10.1.2.10'; 
FLUSH PRIVILEGES;