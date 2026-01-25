const { PermissionFlagsBits } = require("discord.js");

module.exports = {
  name: "sil",
  description: "Belirtilen sayıda mesaj siler",
  async execute(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return message.reply("❌ Bu komutu kullanmak için **Mesajları Yönet** yetkisine sahip olmalısın.");
    }

    const amount = parseInt(args[0]);

    if (!amount || amount < 1 || amount > 100) {
      return message.reply("❌ Lütfen **1 ile 100** arasında bir sayı gir.\nÖrnek: `!sil 20`");
    }

    try {

      await message.channel.bulkDelete(amount + 1, true);

      const info = await message.channel.send(
        `🧹 **${amount} mesaj başarıyla silindi.**`
      );

      setTimeout(() => info.delete().catch(() => {}), 3000);

    } catch (err) {
      console.error(err);
      message.reply("❌ 14 günden eski mesajlar silinemez.");
    }
  }
};
