require("dotenv").config();
const fs = require("fs");
const path = require("path");
const express = require("express");
const {
  Client,
  GatewayIntentBits,
  Collection,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits
} = require("discord.js");


const TICKET_CATEGORY_ID = "1454604502295642375";
const SUPPORT_ROLE_ID = "1454393829577986099";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("DexioraMC Discord Bot Aktif 🚀");
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
  try {

    if (interaction.isButton() && interaction.customId === "ticket_create") {
      await interaction.deferReply({ ephemeral: true });

      const menu = new StringSelectMenuBuilder()
        .setCustomId("ticket_reason")
        .setPlaceholder("Bir sebep seçiniz")
        .addOptions([
          { label: "Teknik Destek", value: "teknik", emoji: "🔧" },
          { label: "Ödeme İşlemleri", value: "odeme", emoji: "💳" },
          { label: "Oyun İçi Hesap İşlemleri", value: "hesap", emoji: "🔑" },
          { label: "Partnerlik Anlaşmaları", value: "partner", emoji: "🤝" },
          { label: "Diğer", value: "diger", emoji: "⁉️" }
        ]);

      return interaction.editReply({
        content: "**Hangi Sebepten Dolayı Destek Talebi Oluşturuyorsunuz?**",
        components: [new ActionRowBuilder().addComponents(menu)]
      });
    }

    if (interaction.isStringSelectMenu() && interaction.customId === "ticket_reason") {
      const reasonMap = {
        teknik: "🔧 Teknik Destek",
        odeme: "💳 Ödeme İşlemleri",
        hesap: "🔑 Oyun İçi Hesap İşlemleri",
        partner: "🤝 Partnerlik Anlaşmaları",
        diger: "⁉️ Diğer"
      };

      const reason = reasonMap[interaction.values[0]];

      const channel = await interaction.guild.channels.create({
        name: `destek-${interaction.user.id}`,
        parent: TICKET_CATEGORY_ID,
        permissionOverwrites: [
          {
            id: interaction.guild.id,
            deny: [PermissionFlagsBits.ViewChannel]
          },
          {
            id: interaction.user.id,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages
            ]
          },
          {
            id: SUPPORT_ROLE_ID,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages
            ]
          }
        ]
      });

      const embed = {
        title: "DexioraMC Destek Talebi",
        description:
          "---------------------------\n\n" +
          `Desteğe Hoş Geldin ${interaction.user},\n` +
          "Yetkililerimiz Kısa Süre İçinde Seninle İlgilenecektir.\n\n" +
          `**Destek Açılma Sebebi:** ${reason}`,
        color: 0x2f3136
      };

      const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("ticket_claim")
          .setLabel("💎 Desteği Üstlen")
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId("ticket_delete")
          .setLabel("❌ Desteği Sil")
          .setStyle(ButtonStyle.Danger)
      );

      await channel.send({
        content: `<@&${SUPPORT_ROLE_ID}>`,
        embeds: [embed],
        components: [buttons]
      });

      return interaction.update({
        content: "✅ Destek talebin oluşturuldu.",
        components: []
      });
    }
    
    if (interaction.isButton()) {
      const isStaff = interaction.member.roles.cache.has(SUPPORT_ROLE_ID);
      const isOwner = interaction.channel.name.endsWith(interaction.user.id);

if (interaction.customId === "ticket_claim") {
  if (!isStaff) {
    return interaction.reply({
      content: "❌ Bu desteği sadece yetkililer üstlenebilir.",
      ephemeral: true
    });
  }

  const disabledRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("ticket_claim_disabled") // ✅ EKLENDİ
      .setLabel("✅ Destek Üstlenildi!")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(true),
    new ButtonBuilder()
      .setCustomId("ticket_delete")
      .setLabel("❌ Desteği Sil")
      .setStyle(ButtonStyle.Danger)
  );

  await interaction.message.edit({
    components: [disabledRow]
  });

  await interaction.channel.send(
    `✅ **Destek ${interaction.user} tarafından üstlenildi.** Artık bu destek ile ilgilenecek.`
  );

  return interaction.reply({
    content: "💎 Desteği başarıyla üstlendin.",
    ephemeral: true
  });
}


      if (interaction.customId === "ticket_delete") {
        if (!isStaff && !isOwner) {
          return interaction.reply({
            content: "❌ Bu desteği silme yetkin yok.",
            ephemeral: true
          });
        }

        await interaction.reply("🗑️ Destek 5 saniye içinde silinecek...");

        setTimeout(() => {
          interaction.channel.delete().catch(() => {});
        }, 5000);
      }
    }

  } catch (err) {
    console.error("INTERACTION HATASI:", err);
    if (!interaction.replied) {
      interaction.reply({ content: "❌ Bir hata oluştu.", ephemeral: true });
    }
  }
});

client.once("ready", () => {
  console.log(`🤖 Bot giriş yaptı: ${client.user.tag}`);
});

client.login(process.env.TOKEN);
