const { verify } = require('jsonwebtoken');
const pool = require('../config/bd');
const senhaJwt = require('../senhaJwt');

const verificarLogin = async (req, res, next) => {
    const { authorization } = req.headers;

    if (!authorization) {
        return res.status(401).json({ mensagem: 'Não autorizado.' });
    }

    const token = authorization.split(" ")[1];

    try {
        const { id } = verify(token, senhaJwt);

        const { rowCount, rows } = await pool.query('SELECT * FROM usuarios WHERE id = $1', [id]);

        if (rowCount < 1) {
            return res.status(401).json({ mensagem: 'Não autorizado.' });
        }

        const { senha: _, ...dadosUsuario } = rows[0];

        req.usuario = dadosUsuario;

        next();
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};

module.exports = verificarLogin;