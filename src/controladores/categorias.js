const pool = require("../config/bd");

const listarCategorias = async (req, res) => {
    try {
        const categorias = await pool.query('SELECT * FROM categorias');
        return res.json(categorias.rows);
    } catch (error) {
        return res.status(500).json({ mensagem: `Erro interno do servidor.` });
    }
};

module.exports = {
    listarCategorias
}