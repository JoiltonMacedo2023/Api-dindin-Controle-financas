const express = require('express');
const { cadastrarUsuario, detalharUsuario, atualizarUsuario } = require('./controladores/usuarios');
const realizarLogin = require('./controladores/login');
const verificarLogin = require('./intermediarios/verificarLogin');
const { listarCategorias } = require('./controladores/categorias');
const { listarTransacoes, detalharTransacao, cadastrarTransacao, excluirTransacao, obterExtrato, atualizarTransacao } = require('./controladores/transacoes');

const rotas = express();

rotas.post('/usuario', cadastrarUsuario);
rotas.post('/login', realizarLogin);

rotas.use(verificarLogin);

rotas.get('/usuario', detalharUsuario);
rotas.put('/usuario', atualizarUsuario);
rotas.get('/categoria', listarCategorias);
rotas.get('/transacao', listarTransacoes);
rotas.get('/transacao/extrato', obterExtrato);
rotas.get('/transacao/:id', detalharTransacao);
rotas.post('/transacao', cadastrarTransacao);
rotas.put('/transacao/:id', atualizarTransacao);
rotas.delete('/transacao/:id', excluirTransacao);

module.exports = rotas;