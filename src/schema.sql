CREATE DATABASE dindin;

DROP TABLE if exists usuarios;
CREATE TABLE usuarios (
    id serial primary key,
    nome varchar(100) NOT NULL,
    email varchar(100) NOT NULL UNIQUE,
    senha text NOT NULL
);

DROP TABLE if exists categorias;
CREATE TABLE categorias (
    id serial primary key,
    descricao text NOT NULL
);

DROP TABLE if exists transacoes;
CREATE TABLE transacoes (
    id serial primary key,
    descricao text NOT NULL,
    valor integer NOT NULL,
    data timestamptz NOT NULL,
    categoria_id integer NOT NULL references categorias(id),
    usuario_id integer NOT NULL references usuarios(id),
    tipo varchar(10) NOT NULL
);

INSERT INTO categorias (descricao)
VALUES ('Alimentação'),
    ('Assinaturas e Serviços'),
    ('Casa'),
    ('Mercado'),
    ('Cuidados Pessoais'),
    ('Educação'),
    ('Família'),
    ('Lazer'),
    ('Pets'),
    ('Presentes'),
    ('Roupas'),
    ('Saúde'),
    ('Transporte'),
    ('Salário'),
    ('Vendas'),
    ('Outras receitas'),
    ('Outras despesas');