const pool = require('../config/bd');
const { compare } = require('bcrypt');
const { sign } = require('jsonwebtoken');
const senhaJwt = require('../senhaJwt');

const realizarLogin = async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ mensagem: 'Todos os campos são obrigatórios.' });
    }

    try {
        const { rowCount: verificacaoEmail, rows } = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);

        if (verificacaoEmail < 1) {
            return res.status(400).json({ mensagem: 'E-mail e/ou senha inválido(s).' });
        }

        const usuarioEncontrado = rows[0];

        const senhaCorreta = await compare(senha, usuarioEncontrado.senha);

        if (!senhaCorreta) {
            return res.status(400).json({ mensagem: 'E-mail e/ou senha inválido(s).' });
        }

        const token = sign({ id: usuarioEncontrado.id }, senhaJwt, { expiresIn: '1h' });

        const { senha: _, ...usuario } = usuarioEncontrado;

        return res.json({ usuario, token });
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};

module.exports = realizarLogin;