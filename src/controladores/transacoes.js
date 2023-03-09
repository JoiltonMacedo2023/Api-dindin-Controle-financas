const pool = require('../config/bd')

const listarTransacoes = async (req, res) => {
  const { id } = req.usuario;
  const { filtro } = req.query;

  try {
    const query = 'SELECT t.id, t.tipo, t.descricao, t.valor, t.data, t.usuario_id, t.categoria_id, c.descricao as categoria_nome FROM transacoes t LEFT JOIN categorias c ON t.categoria_id = c.id WHERE usuario_id = $1';
    
    const { rows: transacoes } = await pool.query(query, [id]);

    if (filtro) {
      const transacoesFiltradas = [];
      for (const categoria of filtro) {
        const resultado = transacoes.filter(transacao => transacao.categoria_nome.toLowerCase() === categoria.toLowerCase());
        transacoesFiltradas.push(...resultado);
      }
      return res.json(transacoesFiltradas);
    }
    
    return res.json(transacoes);
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ mensagem: `Erro interno do servidor.` });
  }
};

const detalharTransacao = async (req, res) => {
  const { id: usuario_id } = req.usuario;
  const { id: transacao_id } = req.params;

  try {
    const query = 'SELECT t.id, t.tipo, t.descricao, t.valor, t.data, t.usuario_id, t.categoria_id, c.descricao as categoria_nome FROM transacoes t LEFT JOIN categorias c ON t.categoria_id = c.id WHERE usuario_id = $1 AND t.id = $2';

    const { rowCount, rows } = await pool.query(query, [usuario_id, transacao_id]);

    if (rowCount < 1) {
      return res.status(404).json({ mensagem: 'Transação não encontrada.' });
    }

    return res.json(rows[0]);
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ mensagem: `Erro interno do servidor.` });
  }
};

const cadastrarTransacao = async (req, res) => {
  const { id: usuario_id } = req.usuario;
  const { tipo, descricao, valor, data, categoria_id } = req.body;

  if (!tipo || !descricao || !valor || !data || !categoria_id) {
    return res.status(400).json({ mensagem: 'Todos os campos obrigatórios devem ser informados.' });
  }

  try {
    const { rowCount: numCategorias } = await pool.query('SELECT * FROM categorias WHERE id = $1', [categoria_id]);

    if (numCategorias < 1) {
      return res.status(404).json({ mensagem: 'Não há categoria o id informado.' });
    }

    if (tipo !== 'entrada' && tipo !== 'saida') {
      return res.status(400).json({ mensagem: "O tipo de transação deve ser 'entrada' ou 'saida'." });
    }

    const { rows: dadosTransacao } = await pool.query('INSERT INTO transacoes (tipo, descricao, valor, data, categoria_id, usuario_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [tipo, descricao, valor, data, categoria_id, usuario_id]);

    const { rows: categoria_nome } = await pool.query('SELECT descricao AS categoria_nome FROM categorias WHERE id = $1', [categoria_id]);

    return res.status(201).json({ ...dadosTransacao[0], ...categoria_nome[0] });
  } catch (error) {
    return res.status(500).json({ mensagem: `Erro interno do servidor.` });
  }
};

const atualizarTransacao = async (req, res) => {
  const { id: usuario_id } = req.usuario;
  const { id: transacao_id } = req.params;
  const { descricao, valor, data, categoria_id, tipo } = req.body;

  if (!descricao || !valor || !data || !categoria_id || !tipo) {
    return res.status(400).json({ mensagen: 'Todos os campos são obrigatórios' })
  }

  if (tipo !== 'entrada' && tipo !== 'saida') {
    return res.status(400).json({ mensagen: "O tipo de transação deve ser 'entrada' ou 'saida'." })
  }

  try {
    const transacao = await pool.query('SELECT * FROM transacoes WHERE usuario_id = $1 AND id = $2', [usuario_id, transacao_id]);

    if (transacao.rowCount <= 0) {
      return res.status(404).json({ mensagem: 'Esta transação não existe' });
    }

    const categoria = await pool.query('SELECT * FROM categorias WHERE id = $1', [categoria_id]);

    if (categoria.rowCount <= 0) {
      return res.status(404).json({ mensagem: 'Esta categoria não existe.' });
    }

    const queryAtualizacao = 'UPDATE transacoes SET descricao = $1, valor = $2, data = $3, categoria_id = $4, tipo = $5 WHERE id = $6';
    const paramAtualizacao = [descricao, valor, data, categoria_id, tipo, transacao_id];
    await pool.query(queryAtualizacao, paramAtualizacao);

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
  }

};

const excluirTransacao = async (req, res) => {
  const { id: usuario_id } = req.usuario;
  const { id: transacao_id } = req.params;

  try {
    const transacao = await pool.query('SELECT * FROM transacoes WHERE usuario_id = $1 AND id = $2', [usuario_id, transacao_id]);

    if (transacao.rowCount <= 0) {
      return res.status(404).json({ mensagem: 'A transação não existe.' });
    }

    await pool.query('DELETE FROM transacoes WHERE id = $1', [transacao_id]);

    return res.status(204).send();

  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
  }
};

const obterExtrato = async (req, res) => {
  const { id: usuario_id } = req.usuario;

  try {
    const { rows: transacoes } = await pool.query('SELECT * FROM transacoes WHERE usuario_id = $1', [usuario_id]);

    const extrato = {
      entrada: 0,
      saida: 0
    };

    for (const transacao of transacoes) {
      if (transacao.tipo === 'entrada') {
        extrato.entrada += transacao.valor;
      } else {
        extrato.saida += transacao.valor;
      }
    }

    return res.status(200).json(extrato);
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ mensagem: `Erro interno do servidor.` });
  }
};

module.exports = {
  listarTransacoes,
  detalharTransacao,
  cadastrarTransacao,
  atualizarTransacao,
  excluirTransacao,
  obterExtrato
};
