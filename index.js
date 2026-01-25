require("dotenv").config();
const fs = require("fs");
const path = require("path");
const express = require("express");
const {
  Client,
  GatewayIntentBits,
  Collection,
  ActionRowBuilder,
  StringSelectMenuBuilder
} = require("discord.js");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("KuramaMC Discord Bot Aktif 🚀");
});

app.listen(PORT, () => {
  console.log(`🌐 Web server aktif: ${PORT}`);
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const PREFIX = "!";
client.commands = new Collection();

const commandsPath = path.join(__dirname, "komutlar");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter(f => f.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  if (command.name && command.execute) {
    client.commands.set(command.name, command);
    console.log(`✔ Komut yüklendi: ${command.name}`);
  }
}

client.on("messageCreate", message => {
  if (message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName);
  if (!command) return;

  try {
    command.execute(message, args);
  } catch (err) {
    console.error(err);
    message.reply("❌ Komut çalıştırılırken hata oluştu.");
  }
});

client.on("interactionCreate", async interaction => {
  if (interaction.isButton()) {
    if (interaction.customId !== "ticket_create") return;

    const menu = new StringSelectMenuBuilder()
      .setCustomId("ticket_reason")
      .setPlaceholder("Bir sebep seçiniz")
      .addOptions([
        {
          label: "Teknik Destek",
          value: "teknik",
          emoji: "🔧"
        },
        {
          label: "Ödeme İşlemleri",
          value: "odeme",
          emoji: "💳"
        },
        {
          label: "Oyun İçi Hesap İşlemleri",
          value: "hesap",
          emoji: "🔑"
        },
        {
          label: "Partnerlik Anlaşmaları",
          value: "partner",
          emoji: "🤝"
        },
        {
          label: "Diğer",
          value: "diger",
          emoji: "⁉️"
        }
      ]);

    const row = new ActionRowBuilder().addComponents(menu);

    return interaction.reply({
      content:
        "**Hangi Sebepten Dolayı Destek Talebi Oluşturuyorsunuz?**",
      components: [row],
      ephemeral: true
    });
  }

  if (interaction.isStringSelectMenu()) {
    if (interaction.customId !== "ticket_reason") return;

    const secim = interaction.values[0];

    await interaction.update({
      content: `✅ **Destek Talebi Sebebiniz:** ${secim}`,
      components: []
    });
    
  }
});

client.once("ready", () => {
  console.log(`🤖 Bot giriş yaptı: ${client.user.tag}`);
});

client.login(process.env.TOKEN);
