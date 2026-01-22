require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { Client, GatewayIntentBits, Collection } = require("discord.js");

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
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);

  if (command.name && typeof command.execute === "function") {
    client.commands.set(command.name, command);
    console.log(`✔ Komut yüklendi: ${command.name}`);
  } else {
    console.log(`❌ Hatalı komut dosyası: ${file}`);
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
