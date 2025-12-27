require('dotenv').config();

const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("KuramaMC Discord Bot Aktif");
});

app.listen(PORT, () => {
  console.log(`Web server açık: ${PORT}`);
});

const {
  Client,
  Collection,
  EmbedBuilder,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  Events
} = require('discord.js');

const fs = require('fs');
const path = require('path');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

client.commands = new Collection();
const PREFIX = '!';


const komutlarPath = path.join(__dirname, 'komutlar');
const komutDosyalari = fs.readdirSync(komutlarPath).filter(f => f.endsWith('.js'));

for (const dosya of komutDosyalari) {
  const komut = require(path.join(komutlarPath, dosya));
  if (!komut.name) continue;

  client.commands.set(komut.name, komut);

  if (Array.isArray(komut.aliases)) {
    komut.aliases.forEach(alias => client.commands.set(alias, komut));
  }
}


client.once(Events.ClientReady, () => {
  console.log(`${client.user.tag} olarak giriş yapıldı!`);

  setTimeout(() => {
    client.user.setPresence({
      activities: [{ name: '⚒️ KuramaMC Yapım Aşamasında ⚒️', type: 0 }],
      status: 'online'
    });
  }, 5000);
});


const OTOROL_ID = '1454393822728421470';
const HOSGELDIN_KANALI_ID = '1454515855671951524';

client.on(Events.GuildMemberAdd, async member => {
  const rol = member.guild.roles.cache.get(OTOROL_ID);
  if (rol) await member.roles.add(rol).catch(() => {});

  const kanal = member.guild.channels.cache.get(HOSGELDIN_KANALI_ID);
  if (!kanal) return;

  const embed = new EmbedBuilder()
    .setAuthor({ name: 'KuramaMC - Hoşgeldin!', iconURL: member.guild.iconURL({ dynamic: true }) })
    .setDescription(`
**${member.user.tag}** aramıza katıldı! 🌟
Herkes yeni üyemize merhaba desin 👋

🟢 **IP:** \`kuramamc.tkmc.net\`
🟢 **Versiyon:** 1.21.3+
`)
    .setColor('Green')
    .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
    .setFooter({ text: 'Keyifli oyunlar dileriz!' })
    .setTimestamp();

  kanal.send({ embeds: [embed] });
});


client.on(Events.MessageCreate, async message => {
  if (message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const komutAdi = args.shift().toLowerCase();
  const komut = client.commands.get(komutAdi);
  if (!komut) return;

  try {
    await komut.execute(message, client);
  } catch (err) {
    console.error(err);
    message.reply('❌ Komut çalışırken hata oluştu.');
  }
});


const BASVURU_LOG_KANAL = "1454533545396670747";
const ONAY_KANAL = "1454515007806115984";

client.on(Events.InteractionCreate, async interaction => {

  if (interaction.isModalSubmit() && interaction.customId === "yetkili_basvuru_modal") {

    const cevaplar = [
      interaction.fields.getTextInputValue("ad"),
      interaction.fields.getTextInputValue("yas"),
      interaction.fields.getTextInputValue("aktiflik"),
      interaction.fields.getTextInputValue("ekip"),
      interaction.fields.getTextInputValue("ign"),
      interaction.fields.getTextInputValue("yetki")
    ];

    const logEmbed = new EmbedBuilder()
      .setTitle("📃 Yeni Yetkili Başvurusu")
      .setColor("Blurple")
      .setDescription(
        `${interaction.user}\n\n` +
        `**1️⃣ Adınız Nedir?**\n${cevaplar[0]}\n\n` +
        `**2️⃣ Yaşınız Kaç?**\n${cevaplar[1]}\n\n` +
        `**3️⃣ Kaç Saat Aktif Kalabilirsiniz?**\n${cevaplar[2]}\n\n` +
        `**4️⃣ Ekip Çalışmasına Uyumlu musunuz?**\n${cevaplar[3]}\n\n` +
        `**5️⃣ IGN**\n${cevaplar[4]}\n\n` +
        `**6️⃣ İstenen Yetki**\n${cevaplar[5]}`
      )
      .setFooter({
        text: "KuramaMC - Yetkili Başvuru Sistemi",
        iconURL: interaction.guild.iconURL({ dynamic: true })
      })
      .setTimestamp();

    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`basvuru_onay_${interaction.user.id}`)
        .setLabel("✅ ONAYLA")
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId(`basvuru_red_${interaction.user.id}`)
        .setLabel("❌ REDDET")
        .setStyle(ButtonStyle.Danger)
    );

    interaction.guild.channels.cache
      .get(BASVURU_LOG_KANAL)
      ?.send({ embeds: [logEmbed], components: [buttons] });

    return interaction.reply({ content: "✅ Başvurun gönderildi!", ephemeral: true });
  }

  if (interaction.isButton()) {
    const basvuranId = interaction.customId.split("_").pop();
    const basvuran = await interaction.guild.members.fetch(basvuranId).catch(() => null);
    if (!basvuran) return;

    const yetkili = interaction.user;
    const kanal = interaction.guild.channels.cache.get(ONAY_KANAL);

    if (interaction.customId.startsWith("basvuru_onay_")) {
      const embed = new EmbedBuilder()
        .setTitle("🟢 KuramaMC - Başvuru Onayı!")
        .setColor("Green")
        .setDescription(
          `Merhaba ${basvuran},\n\nBaşvurun ${yetkili} tarafından **ONAYLANDI**.\n` +
          `${basvuran} lütfen destek talebi açınız!\n\n` +
          `**Onaylayan Yetkili**\n${yetkili}\n\n` +
          `**Başvuran Kişi**\n${basvuran}`
        )
        .setFooter({
          text: "KuramaMC - Yetkili Başvuru Sistemi",
          iconURL: interaction.guild.iconURL({ dynamic: true })
        })
        .setTimestamp();

      kanal?.send({ embeds: [embed] });
    }

    if (interaction.customId.startsWith("basvuru_red_")) {
      const embed = new EmbedBuilder()
        .setTitle("🔴 KuramaMC - Başvuru Reddedildi")
        .setColor("Red")
        .setDescription(
          `${basvuran} kullanıcısının başvurusu ${yetkili} tarafından **REDDEDİLDİ**.\n\n` +
          `**Reddeden Yetkili**\n${yetkili}\n\n` +
          `**Başvuran Kişi**\n${basvuran}`
        )
        .setFooter({
          text: "KuramaMC - Yetkili Başvuru Sistemi",
          iconURL: interaction.guild.iconURL({ dynamic: true })
        })
        .setTimestamp();

      kanal?.send({ embeds: [embed] });
    }

    await interaction.message.edit({ components: [] });
    await interaction.reply({ content: "İşlem tamamlandı.", ephemeral: true });
  }
});

client.login(process.env.TOKEN);
