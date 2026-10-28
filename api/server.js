require('dotenv').config();
const express = require('express');
const cors = require('cors');
const prisma = require('./src/data/prisma');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/usuario/login', async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ mensagem: 'Informe o e-mail e a senha.' });
  }

  try {
    const usuario = await prisma.usuario.findUnique({ where: { email } });

    if (!usuario || usuario.senha !== senha) {
      return res.status(401).json({ mensagem: 'E-mail ou senha incorretos.' });
    }

    res.json({ id: usuario.id, nome: usuario.nome, email: usuario.email });
  } catch (erro) {
    res.status(500).json({ mensagem: 'Erro ao fazer login.' });
  }
});

app.get('/usuario', async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      select: { id: true, nome: true, email: true }
    });
    res.json(usuarios);
  } catch (erro) {
    res.status(500).json({ mensagem: 'Erro ao listar usuários.' });
  }
});

app.get('/evento', async (req, res) => {
  try {
    const eventos = await prisma.evento.findMany({
      include: { usuario: { select: { id: true, nome: true } } },
      orderBy: { data: 'desc' }
    });
    res.json(eventos);
  } catch (erro) {
    res.status(500).json({ mensagem: 'Erro ao listar eventos.' });
  }
});

app.get('/evento/:id', async (req, res) => {
  try {
    const evento = await prisma.evento.findUnique({
      where: { id: Number(req.params.id) },
      include: { usuario: { select: { id: true, nome: true } } }
    });
    if (!evento) return res.status(404).json({ mensagem: 'Evento não encontrado.' });
    res.json(evento);
  } catch (erro) {
    res.status(500).json({ mensagem: 'Erro ao consultar evento.' });
  }
});

app.post('/evento', async (req, res) => {
  const { usuarioId, cidade, tipoEvento, temperaturaMaxima, data, nivelImpacto } = req.body;

  if (!usuarioId || !cidade || !tipoEvento || !nivelImpacto) {
    return res.status(400).json({ mensagem: 'Preencha os campos obrigatórios.' });
  }

  try {
    const evento = await prisma.evento.create({
      data: {
        usuarioId: Number(usuarioId),
        cidade,
        tipoEvento,
        temperaturaMaxima: temperaturaMaxima === '' || temperaturaMaxima == null ? null : Number(temperaturaMaxima),
        ...(data ? { data: new Date(data) } : {}),
        nivelImpacto
      }
    });
    res.status(201).json(evento);
  } catch (erro) {
    res.status(400).json({ mensagem: 'Não foi possível cadastrar o evento. Confira o usuário informado.' });
  }
});

app.put('/evento/:id', async (req, res) => {
  const { usuarioId, cidade, tipoEvento, temperaturaMaxima, data, nivelImpacto } = req.body;

  try {
    const evento = await prisma.evento.update({
      where: { id: Number(req.params.id) },
      data: {
        ...(usuarioId ? { usuarioId: Number(usuarioId) } : {}),
        ...(cidade !== undefined ? { cidade } : {}),
        ...(tipoEvento !== undefined ? { tipoEvento } : {}),
        ...(temperaturaMaxima !== undefined ? { temperaturaMaxima: temperaturaMaxima === '' || temperaturaMaxima == null ? null : Number(temperaturaMaxima) } : {}),
        ...(data ? { data: new Date(data) } : {}),
        ...(nivelImpacto !== undefined ? { nivelImpacto } : {})
      }
    });
    res.json(evento);
  } catch (erro) {
    res.status(404).json({ mensagem: 'Não foi possível atualizar o evento.' });
  }
});

app.delete('/evento/:id', async (req, res) => {
  try {
    await prisma.evento.delete({ where: { id: Number(req.params.id) } });
    res.json({ mensagem: 'Evento excluído.' });
  } catch (erro) {
    res.status(404).json({ mensagem: 'Evento não encontrado.' });
  }
});

app.get('/', (req, res) => {
  res.json({ mensagem: 'API de Eventos Climáticos funcionando!', rotas: ['/usuario/login', '/usuario', '/evento'] });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
