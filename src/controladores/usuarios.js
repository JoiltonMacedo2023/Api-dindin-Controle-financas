const pool = require('../config/bd');
const { hash } = require('bcrypt');

const cadastrarUsuario = async (req, res) => {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
        return res.status(400).json({ mensagem: 'Todos os campos são obrigatórios.' });
    }

    try {
        const { rowCount: verificacaoEmail } = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);

        if (verificacaoEmail > 0) {
            return res.status(400).json({ mensagem: 'Já existe usuário cadastrado com o e-mail informado.' });
        }

        const senhaCriptografada = await hash(senha, 10);

        const { rowCount, rows } = await pool.query('INSERT INTO usuarios (nome, email, senha) VALUES ($1, $2, $3) RETURNING *', [nome, email, senhaCriptografada]);

        if (rowCount < 1) {
            return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
        }

        const { senha: _, ...usuario } = rows[0];

        return res.status(201).json(usuario);
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};

const detalharUsuario = async (req, res) => {
    const { usuario } = req;

    try {
        const tokenEncontrado = await pool.query('SELECT * FROM usuarios WHERE id = $1', [usuario.id]);

        if (tokenEncontrado.rowCount <= 0) {
            return res.status(400).json({ mensagem: 'Token inválido.' });
        }
        return res.status(200).json(
            {
                "id": usuario.id,
                "nome": usuario.nome,
                "email": usuario.email
            }
        );
    } catch (error) {
        return res.status(401).json(
            {
                mensagem: 'Para acessar este recurso um token de autenticação válido deve ser enviado.'
            }
        );
    }
};

const atualizarUsuario = async (req, res) => {
    const { nome, email, senha } = req.body;
    const { usuario } = req;

    if (!nome || !email || !senha) {
        return res.status(400).json({ mensagem: 'Todos os campos são obrigatórios' });
    }

    try {
        const usuarioEncontrado = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);

        if (usuario.rowCount > 0 && usuarioEncontrado.rows[0].id !== usuario.id) {
            return res.status(400).json({ mensagem: 'O e-mail informado já está sendo utilizado por outro usuário.' });
        }

        const senhaCriptografada = await hash(senha, 10);

        const queryAtualizado = 'UPDATE usuarios SET nome = $1, email = $2, senha = $3 WHERE id = $4';
        const paramAtualizado = [nome, email, senhaCriptografada, usuario.id];
        const usuarioAtualizado = await pool.query(queryAtualizado, paramAtualizado);

        if (usuarioAtualizado.rowCount <= 0) {
            return res.status(500).json({ mensagem: `Erro interno do servidor.` });
        }

        return res.status(204).send();
    } catch (error) {
        return res.status(500).json({ mensagem: `Erro interno do servidor.` });
    }
};

module.exports = {
    cadastrarUsuario,
    detalharUsuario,
    atualizarUsuario,
}