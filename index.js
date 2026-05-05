require('dotenv').config();

console.log(process.env.TOKEN);

const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  StringSelectMenuBuilder
} = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.once('clientReady', () => {
  console.log('Bot online!');
});

// ================= DADOS =================

const siglas = [
  { label: 'CF (Centroavante)', value: 'CF' },
  { label: 'RW (Ponta Direita)', value: 'RW' },
  { label: 'LW (Ponta Esquerda)', value: 'LW' },
  { label: 'CM (Meio Campo)', value: 'CM' },
  { label: 'GK (Goleiro)', value: 'GK' }
];

const classes = [
  { label: 'Raro', value: 'raro' },
  { label: 'Épico', value: 'epico' },
  { label: 'Lendário', value: 'lendario' },
  { label: 'Mítico', value: 'mitico' },
  { label: 'World Class', value: 'world' },
  { label: 'Mestre', value: 'mestre' },
  { label: 'Limitado', value: 'limitado' }
];

const estilos = {

  raro: [
    'Isagi (Básico)',
    'Hiori',
    'Chigiri',
    'Igaguri'
  ],

  epico: [
    'Raichi',
    'Otoya',
    'Gagamaru',
    'Kurona'
  ],

  lendario: [
    'Nagi (Básico)',
    'Bachira (Básico)',
    'Kunigami',
    'Karasu'
  ],

  mitico: [
    'Rin (Básico)',
    'Aiku',
    'Charles',
    'Shidou',
    'King (Barou)',
    'Ness',
    'Yukimiya',
    'Neleo'
  ],

  world: [
    'Sae',
    'Rin (NEL)',
    'Bachira (NEL)',
    'Isagi (NEL)',
    'Bunny',
    'Don Lorenzo',
    'Kaiser'
  ],

  mestre: [
    'Lavinho'
  ],

  limitado: [
    'Phantom Isagi',
    'Reaper Sae',
    'Demon Shidou',
    'Blood Moon Rin',
    'Elf Kaiser',
    'Santa Lavinho',
    'Gengibre Charles',
    'Krampus Barou',
    'Firework Bachira',
    'Sub-zero Loki',
    'Skeleton Nagi',
    'Ester Yukimiya'
  ]

};

// guarda escolhas
let jogadores = {};

// ================= INTERAÇÕES =================

client.on('interactionCreate', async interaction => {

  // ================= COMANDO /time =================
  if (interaction.isChatInputCommand()) {

    if (interaction.commandName === 'time') {

      jogadores = {}; // reset

      const menu = new StringSelectMenuBuilder()
        .setCustomId('sigla')
        .setPlaceholder('Escolha sua posição')
        .addOptions(siglas);

      const row = new ActionRowBuilder().addComponents(menu);

      return interaction.reply({
        content: '⚽ Criando time... escolha sua posição:',
        components: [row]
      });
    }
  }

  // ================= SELECT MENUS =================
  if (!interaction.isStringSelectMenu()) return;

  const userId = interaction.user.id;

  // ===== SIGLA =====
  if (interaction.customId === 'sigla') {

    const sigla = interaction.values[0];

    // evita repetir posição
    if (Object.values(jogadores).some(j => j.sigla === sigla)) {
      return interaction.reply({
        content: '❌ Essa posição já foi escolhida!',
        ephemeral: true
      });
    }

    jogadores[userId] = { sigla };

    const menu = new StringSelectMenuBuilder()
      .setCustomId('classe')
      .setPlaceholder('Escolha a classe')
      .addOptions(classes);

    const row = new ActionRowBuilder().addComponents(menu);

    return interaction.reply({
      content: `Você escolheu ${sigla}\nAgora escolha a classe:`,
      components: [row],
      ephemeral: true
    });
  }

  // ===== CLASSE =====
  if (interaction.customId === 'classe') {

    const classe = interaction.values[0];

    jogadores[userId].classe = classe;

    const lista = estilos[classe];

    const menu = new StringSelectMenuBuilder()
      .setCustomId('estilo')
      .setPlaceholder('Escolha o personagem')
      .addOptions(lista.map(e => ({ label: e, value: e })));

    const row = new ActionRowBuilder().addComponents(menu);

    return interaction.update({
      content: 'Escolha seu personagem:',
      components: [row]
    });
  }

  // ===== ESTILO =====
  if (interaction.customId === 'estilo') {

    const estilo = interaction.values[0];

    jogadores[userId].estilo = estilo;

    await interaction.update({
      content: `✅ Você escolheu ${estilo}`,
      components: []
    });

    // monta time
    let texto = '⚽ **TIME ATUAL**\n\n';

    for (let id in jogadores) {
      const j = jogadores[id];
      texto += `${j.sigla} - <@${id}> (${j.estilo || '...'} )\n`;
    }

    await interaction.followUp({ content: texto });

    // verifica se completou
    if (Object.keys(jogadores).length === 5) {
      await interaction.followUp({
        content: '🏆 TIME COMPLETO! PRONTO PRA JOGAR!'
      });
    }
  }

});

client.login(process.env.TOKEN);