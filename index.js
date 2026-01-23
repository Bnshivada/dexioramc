require("dotenv").config();
const fs = require("fs");
const path = require("path");
const express = require("express");
const { Client, GatewayIntentBits, Collection } = require("discord.js");
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
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith(".js"));

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

client.once("ready", () => {
  console.log(`🤖 Bot giriş yaptı: ${client.user.tag}`);
});

client.login(process.env.TOKEN);
