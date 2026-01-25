const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

module.exports = {
  name: "ticket-embed",
  description: "Destek talebi embedini gönderir (Yetkili komutu)",
  execute(message) {
    if (!message.member.permissions.has("Administrator")) {
      return message.reply("❌ Bu komutu sadece yetkililer kullanabilir.");
    }

    const randomColor = Math.floor(Math.random() * 16777215);

    const embed = new EmbedBuilder()
      .setTitle("🎟️ KuramaMC Destek Talebi 🎟️")
      .setDescription(
        "---------------------------------\n\n" +
        "Destek Sistemine Hoşgeldin Oyuncu,\n" +
        "Minecraft veya Discord Sunucumuz Üzerinde Bir Sorunla Karşılaştıysan " +
        "Buradan Destek Talebi Oluşturup Yetkililerimize Ulaşabilirsin\n\n" +
        "🔧 Teknik Destek\n" +
        "💳 Ödeme İşlemleri\n" +
        "🔑 Oyun İçi Hesap İşlemleri\n" +
        "🤝 Partnerlik Anlaşmaları\n" +
        "⁉️ Diğer"
      )
      .setColor(randomColor)
      .setFooter({
        text: "5.133.100.199 | KuramaMC LIFESTEAL",
        iconURL: message.guild.iconURL({ dynamic: true })
      });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("ticket_create")
        .setLabel("🎟️ Destek Talebi Oluştur")
        .setStyle(ButtonStyle.Primary)
    );

    message.channel.send({
      embeds: [embed],
      components: [row]
    });
  }
};
