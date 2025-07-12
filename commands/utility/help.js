// Commands/help.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Xem danh sách các lệnh và mô tả'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('📜 Danh sách lệnh hỗ trợ')
      .setDescription('Dưới đây là các lệnh có thể sử dụng trong trò chơi')
      .setColor(0x00AE86)
      .addFields(
        { name: '/level', value: 'Xem cấp độ và exp hiện tại' },
        { name: '/rank', value: 'Xem bậc hiện tại (Diêm sĩ → Tối thượng)' },
        { name: '/roll', value: 'Dùng vé quay gacha trợ thủ (tốn 1 vé)' },
        { name: '/farm', value: 'Nhận ngẫu nhiên 1-30 vé (tối đa 4 lần/giờ)' },
        { name: '/inv', value: 'Xem túi đồ trợ thủ đã sở hữu' },
        { name: '/equip <tên trợ thủ>', value: 'Trang bị trợ thủ để dùng khi solo' },
        { name: '/solo <@người chơi>', value: 'Thách đấu solo với người chơi khác' },
        { name: '/lb', value: 'Xem bảng xếp hạng theo cấp độ' },
        { name: '/help', value: 'Xem danh sách các lệnh này' },
        { name: '/rollcount', value: 'Xem số lượng vé quay còn lại của bạn' },
        { name: '/roll10', value: 'Quay 10 lần gacha trợ thủ (tốn 10 vé)' },
      )
      .setFooter({ text: 'Chúc thuật sĩ may mắn trong hành trình!' });

    await interaction.reply({ embeds: [embed] });
  }
};
