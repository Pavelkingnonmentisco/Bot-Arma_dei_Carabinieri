// ═══════════════════════════════════════════════════════════════
//  Arma dei Carabinieri — IERP Discord Bot
//  Comandi slash per gestione provvedimenti
// ═══════════════════════════════════════════════════════════════

const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

const TOKEN      = process.env.BOT_TOKEN;
const CLIENT_ID  = process.env.CLIENT_ID  || '1496217264712585429';
const GUILD_ID   = process.env.GUILD_ID;
const WEBHOOK    = process.env.WEBHOOK_URL || "https://discord.com/api/webhooks/1496219749971923034/JxyWhVqJ8MkSjzr1p8JxlyA9sJgxQZyb02aellGRmsuRIVTKYVy_OyyimBz91_7KU0qu";
const LOGO_URL   = "https://res.cloudinary.com/dajjun43n/image/upload/v1776556698/occofjisvhzbzgfdn6qc.webp";
const RUOLO_ISTRUTTORI = "1493725249022202078";

// ── Definizione comandi ───────────────────────────────────────────
const commands = [
  // PROMOZIONE
  new SlashCommandBuilder()
    .setName('promozione')
    .setDescription('Emetti una promozione di grado per un operatore')
    .addUserOption(o => o.setName('operatore').setDescription('L\'operatore da promuovere').setRequired(true))
    .addStringOption(o => o.setName('grado_precedente').setDescription('Grado attuale').setRequired(true))
    .addStringOption(o => o.setName('nuovo_grado').setDescription('Nuovo grado').setRequired(true))
    .addStringOption(o => o.setName('motivazione').setDescription('Motivazione della promozione').setRequired(true))
    .addStringOption(o => o.setName('matricola').setDescription('Matricola operatore (es. CC-10)').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  // AVVERTIMENTO
  new SlashCommandBuilder()
    .setName('avvertimento')
    .setDescription('Emetti un avvertimento formale a un operatore')
    .addUserOption(o => o.setName('operatore').setDescription('L\'operatore da avvertire').setRequired(true))
    .addStringOption(o => o.setName('infrazione').setDescription('Infrazione commessa').setRequired(true))
    .addStringOption(o => o.setName('descrizione').setDescription('Descrizione dettagliata').setRequired(true))
    .addStringOption(o => o.setName('conseguenze').setDescription('Conseguenze in caso di recidiva').setRequired(true))
    .addStringOption(o => o.setName('matricola').setDescription('Matricola operatore').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  // SOSPENSIONE
  new SlashCommandBuilder()
    .setName('sospensione')
    .setDescription('Sospendi temporaneamente un operatore dal servizio')
    .addUserOption(o => o.setName('operatore').setDescription('L\'operatore da sospendere').setRequired(true))
    .addStringOption(o => o.setName('durata').setDescription('Durata della sospensione (es. 7 giorni)').setRequired(true))
    .addStringOption(o => o.setName('motivo').setDescription('Motivo della sospensione').setRequired(true))
    .addStringOption(o => o.setName('data_fine').setDescription('Data fine sospensione (es. 30/04/2025)').setRequired(false))
    .addStringOption(o => o.setName('matricola').setDescription('Matricola operatore').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  // LICENZIAMENTO
  new SlashCommandBuilder()
    .setName('licenziamento')
    .setDescription('Rimuovi definitivamente un operatore dall\'Arma')
    .addUserOption(o => o.setName('operatore').setDescription('L\'operatore da licenziare').setRequired(true))
    .addStringOption(o => o.setName('motivazione').setDescription('Motivazione del licenziamento').setRequired(true))
    .addStringOption(o => o.setName('precedenti').setDescription('Provvedimenti precedenti').setRequired(false))
    .addStringOption(o => o.setName('matricola').setDescription('Matricola operatore').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  // RAPPORTO SUPERVISIONE
  new SlashCommandBuilder()
    .setName('rapporto')
    .setDescription('Invia un rapporto di supervisione per un allievo')
    .addUserOption(o => o.setName('allievo').setDescription('L\'allievo da valutare').setRequired(true))
    .addIntegerOption(o => o.setName('valutazione').setDescription('Valutazione da 1 a 10').setMinValue(1).setMaxValue(10).setRequired(true))
    .addStringOption(o => o.setName('descrizione').setDescription('Descrizione delle attività svolte').setRequired(true))
    .addStringOption(o => o.setName('osservazioni').setDescription('Osservazioni aggiuntive').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  // FASCICOLO
  new SlashCommandBuilder()
    .setName('fascicolo')
    .setDescription('Visualizza il fascicolo di un operatore')
    .addUserOption(o => o.setName('operatore').setDescription('L\'operatore').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  // INFO OPERATORE
  new SlashCommandBuilder()
    .setName('operatore')
    .setDescription('Mostra le informazioni di un operatore')
    .addUserOption(o => o.setName('utente').setDescription('L\'operatore').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
];

// ── Registra comandi ──────────────────────────────────────────────
async function registerCommands() {
  const rest = new REST({ version: '10' }).setToken(TOKEN);
  try {
    console.log('📋 Registrazione comandi slash...');
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands.map(c => c.toJSON()) }
    );
    console.log('✅ Comandi registrati con successo!');
  } catch (err) {
    console.error('❌ Errore registrazione comandi:', err);
  }
}

// ── Client Discord ────────────────────────────────────────────────
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

client.once('ready', () => {
  console.log(`✅ Bot online: ${client.user.tag}`);
  client.user.setActivity('Arma dei Carabinieri — IERP', { type: 3 });
});

// ── Helper: crea embed base ───────────────────────────────────────
function baseEmbed(title, color) {
  return new EmbedBuilder()
    .setTitle(title)
    .setColor(color)
    .setThumbnail(LOGO_URL)
    .setFooter({ text: 'Arma dei Carabinieri — I.E.R.P. • ERLC Roblox', iconURL: LOGO_URL })
    .setTimestamp();
}

// ── Helper: barra valutazione ─────────────────────────────────────
function votoBar(v) {
  return '🟩'.repeat(Math.min(v, 10)) + '⬜'.repeat(Math.max(0, 10 - v));
}

// ── Gestione interazioni ──────────────────────────────────────────
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName, user, guild } = interaction;
  const emittente = interaction.member;
  const dataOggi = new Date().toLocaleDateString('it-IT');

  // ── /promozione ──────────────────────────────────────────────
  if (commandName === 'promozione') {
    const operatore    = interaction.options.getUser('operatore');
    const gradoPre     = interaction.options.getString('grado_precedente');
    const gradoPost    = interaction.options.getString('nuovo_grado');
    const motivazione  = interaction.options.getString('motivazione');
    const matricola    = interaction.options.getString('matricola') || '—';

    const embed = baseEmbed('🏅 Promozione — Arma dei Carabinieri IERP', 0x4caf7d)
      .addFields(
        {
          name: '👤 Operatore Coinvolto',
          value: `• **Nome**: ${operatore.displayName}\n• **Matricola**: ${matricola}\n• **Discord**: <@${operatore.id}>`,
          inline: false
        },
        {
          name: '📋 Dettagli Promozione',
          value: `• **Tipo**: Promozione\n• **Motivo**: ${motivazione}`,
          inline: false
        },
        {
          name: '🎖️ Variazione Grado',
          value: `• **Precedente**: \`${gradoPre}\`\n• **Successivo**: \`${gradoPost}\``,
          inline: false
        },
        {
          name: '✍️ Firma',
          value: `*${emittente.displayName} — ${dataOggi}*\n*Arma dei Carabinieri — I.E.R.P.*`,
          inline: false
        }
      );

    await interaction.reply({
      content: `<@${operatore.id}> — **Nuovo Provvedimento: Promozione**`,
      embeds: [embed]
    });
  }

  // ── /avvertimento ────────────────────────────────────────────
  else if (commandName === 'avvertimento') {
    const operatore   = interaction.options.getUser('operatore');
    const infrazione  = interaction.options.getString('infrazione');
    const descrizione = interaction.options.getString('descrizione');
    const conseguenze = interaction.options.getString('conseguenze');
    const matricola   = interaction.options.getString('matricola') || '—';

    const embed = baseEmbed('⚠️ Avvertimento — Arma dei Carabinieri IERP', 0xf0a500)
      .addFields(
        {
          name: '👤 Operatore Coinvolto',
          value: `• **Nome**: ${operatore.displayName}\n• **Matricola**: ${matricola}\n• **Discord**: <@${operatore.id}>`,
          inline: false
        },
        {
          name: '⚠️ Dettagli Avvertimento',
          value: `• **Infrazione**: ${infrazione}\n• **Descrizione**: ${descrizione}`,
          inline: false
        },
        {
          name: '🔁 Conseguenze in caso di recidiva',
          value: conseguenze,
          inline: false
        },
        {
          name: '✍️ Firma',
          value: `*${emittente.displayName} — ${dataOggi}*\n*Arma dei Carabinieri — I.E.R.P.*`,
          inline: false
        }
      );

    await interaction.reply({
      content: `<@${operatore.id}> — **Nuovo Provvedimento: Avvertimento**`,
      embeds: [embed]
    });
  }

  // ── /sospensione ─────────────────────────────────────────────
  else if (commandName === 'sospensione') {
    const operatore = interaction.options.getUser('operatore');
    const durata    = interaction.options.getString('durata');
    const motivo    = interaction.options.getString('motivo');
    const dataFine  = interaction.options.getString('data_fine') || '—';
    const matricola = interaction.options.getString('matricola') || '—';

    const embed = baseEmbed('🔴 Sospensione — Arma dei Carabinieri IERP', 0xe05555)
      .addFields(
        {
          name: '👤 Operatore Coinvolto',
          value: `• **Nome**: ${operatore.displayName}\n• **Matricola**: ${matricola}\n• **Discord**: <@${operatore.id}>`,
          inline: false
        },
        {
          name: '🔴 Dettagli Sospensione',
          value: `• **Durata**: ${durata}\n• **Dal**: ${dataOggi}\n• **Al**: ${dataFine}`,
          inline: false
        },
        {
          name: '📋 Motivo',
          value: motivo,
          inline: false
        },
        {
          name: '✍️ Firma',
          value: `*${emittente.displayName} — ${dataOggi}*\n*Arma dei Carabinieri — I.E.R.P.*`,
          inline: false
        }
      );

    await interaction.reply({
      content: `<@${operatore.id}> — **Nuovo Provvedimento: Sospensione**`,
      embeds: [embed]
    });
  }

  // ── /licenziamento ───────────────────────────────────────────
  else if (commandName === 'licenziamento') {
    const operatore   = interaction.options.getUser('operatore');
    const motivazione = interaction.options.getString('motivazione');
    const precedenti  = interaction.options.getString('precedenti') || null;
    const matricola   = interaction.options.getString('matricola') || '—';

    const fields = [
      {
        name: '👤 Operatore Coinvolto',
        value: `• **Nome**: ${operatore.displayName}\n• **Matricola**: ${matricola}\n• **Discord**: <@${operatore.id}>`,
        inline: false
      },
      {
        name: '🚫 Motivo Licenziamento',
        value: motivazione,
        inline: false
      }
    ];

    if (precedenti) {
      fields.push({
        name: '📁 Provvedimenti Precedenti',
        value: precedenti,
        inline: false
      });
    }

    fields.push({
      name: '✍️ Firma',
      value: `*${emittente.displayName} — ${dataOggi}*\n*Arma dei Carabinieri — I.E.R.P.*`,
      inline: false
    });

    const embed = baseEmbed('🚫 Licenziamento — Arma dei Carabinieri IERP', 0x8b0000)
      .addFields(...fields);

    await interaction.reply({
      content: `<@${operatore.id}> — **Nuovo Provvedimento: Licenziamento**`,
      embeds: [embed]
    });
  }

  // ── /rapporto ────────────────────────────────────────────────
  else if (commandName === 'rapporto') {
    const allievo     = interaction.options.getUser('allievo');
    const valutazione = interaction.options.getInteger('valutazione');
    const descrizione = interaction.options.getString('descrizione');
    const osservazioni = interaction.options.getString('osservazioni') || null;
    const color = valutazione >= 8 ? 0x4caf7d : valutazione >= 5 ? 0xc9a84c : 0xe05555;

    const fields = [
      {
        name: '👤 Allievo',
        value: `**${allievo.displayName}**\n<@${allievo.id}>`,
        inline: true
      },
      {
        name: '🎖️ Supervisore',
        value: `**${emittente.displayName}**`,
        inline: true
      },
      { name: '\u200b', value: '\u200b', inline: true },
      {
        name: '📅 Data',
        value: dataOggi,
        inline: true
      },
      {
        name: `⭐ Valutazione: ${valutazione}/10`,
        value: votoBar(valutazione),
        inline: false
      },
      {
        name: '📝 Descrizione',
        value: descrizione,
        inline: false
      }
    ];

    if (osservazioni) {
      fields.push({ name: '💬 Osservazioni', value: osservazioni, inline: false });
    }

    const embed = baseEmbed('📋 Rapporto di Supervisione — Arma dei Carabinieri IERP', color)
      .addFields(...fields);

    await interaction.reply({
      content: `<@&${RUOLO_ISTRUTTORI}> <@${allievo.id}> — **Nuovo rapporto di supervisione** da **${emittente.displayName}**\n> Gli istruttori sono invitati a visionare il rapporto.`,
      embeds: [embed]
    });
  }

  // ── /fascicolo ───────────────────────────────────────────────
  else if (commandName === 'fascicolo') {
    const operatore = interaction.options.getUser('operatore');

    const embed = baseEmbed(`📁 Fascicolo — ${operatore.displayName}`, 0xc9a84c)
      .setDescription(`Fascicolo personale di <@${operatore.id}>\n\n*Per visualizzare il fascicolo completo accedi all\'Area Personale sul portale IERP.*`)
      .addFields(
        { name: '👤 Operatore', value: `<@${operatore.id}>`, inline: true },
        { name: '📅 Richiesto da', value: `<@${user.id}>`, inline: true },
        { name: '🌐 Portale', value: '[Area Personale IERP](https://ierp-fdo.lovable.app)', inline: false }
      );

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }

  // ── /operatore ───────────────────────────────────────────────
  else if (commandName === 'operatore') {
    const utente = interaction.options.getUser('utente');
    const member = await guild.members.fetch(utente.id).catch(() => null);

    const embed = baseEmbed(`👤 Operatore — ${utente.displayName}`, 0xc9a84c)
      .setThumbnail(utente.displayAvatarURL({ size: 256 }))
      .addFields(
        { name: '🏷️ Tag Discord', value: `<@${utente.id}>`, inline: true },
        { name: '📅 Entrato nel server', value: member ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:D>` : '—', inline: true },
        { name: '🎭 Ruoli', value: member ? member.roles.cache.filter(r => r.id !== guild.id).map(r => `<@&${r.id}>`).join(', ') || '—' : '—', inline: false }
      );

    await interaction.reply({ embeds: [embed] });
  }
});

// ── Avvio ─────────────────────────────────────────────────────────
registerCommands().then(() => {
  client.login(TOKEN);
});
