const prisma = require('../src/data/prisma');

async function main() {
  await prisma.$transaction(async (tx) => {
    await tx.evento.deleteMany();
    await tx.usuario.deleteMany();

    const usuarios = await Promise.all([
      tx.usuario.create({ data: { nome: 'Ana Silva', email: 'ana@email.com', senha: 'senha123' } }),
      tx.usuario.create({ data: { nome: 'Maria Silva', email: 'maria@email.com', senha: 'senha123' } }),
      tx.usuario.create({ data: { nome: 'João Oliveira', email: 'joao@email.com', senha: 'senha123' } }),
      tx.usuario.create({ data: { nome: 'Paula Martins', email: 'paula@email.com', senha: 'senha123' } }),
      tx.usuario.create({ data: { nome: 'Pedro Souza', email: 'pedro@email.com', senha: 'senha123' } })
    ]);

    const eventos = [
      { usuarioId: usuarios[0].id, cidade: 'Amparo', tipoEvento: 'Tempestade', temperaturaMaxima: 34.2, nivelImpacto: 'Queda de árvores e destelhamentos' },
      { usuarioId: usuarios[0].id, cidade: 'Campinas', tipoEvento: 'Queimada', temperaturaMaxima: 38.2, nivelImpacto: 'Perda de vegetação e áreas agrícolas' },
      { usuarioId: usuarios[1].id, cidade: 'Jaguariúna', tipoEvento: 'Tempestade', temperaturaMaxima: 30.1, nivelImpacto: 'Risco de alagamentos e raios' },
      { usuarioId: usuarios[1].id, cidade: 'Pedreira', tipoEvento: 'Vendaval', temperaturaMaxima: 34.2, nivelImpacto: 'Queda de árvores' },
      { usuarioId: usuarios[2].id, cidade: 'Monte Alegre do Sul', tipoEvento: 'Vendaval', temperaturaMaxima: 36.2, nivelImpacto: 'Danos em telhados' },
      { usuarioId: usuarios[2].id, cidade: 'Santo Antônio de Posse', tipoEvento: 'Baixa umidade', temperaturaMaxima: 39.7, nivelImpacto: 'Problemas respiratórios' },
      { usuarioId: usuarios[3].id, cidade: 'Serra Negra', tipoEvento: 'Geada', temperaturaMaxima: 6.2, nivelImpacto: 'Perda de produção agrícola' },
      { usuarioId: usuarios[4].id, cidade: 'Águas de Lindóia', tipoEvento: 'Tempestade', temperaturaMaxima: 34.8, nivelImpacto: 'Queda de árvores e destelhamentos' }
    ];

    await tx.evento.createMany({ data: eventos });
  });

  console.log('Dados de teste cadastrados.');
}

main()
  .catch((erro) => {
    console.error(erro);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
