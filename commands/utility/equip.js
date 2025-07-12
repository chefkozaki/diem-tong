// Commands/equip.js
const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

const invPath = './inventory.json';
const equipPath = './equipped.json';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('equip')
        .setDescription('Trang bị trợ thủ cho solo')
        .addStringOption(opt => 
            opt.setName('name')
                .setDescription('Tên trợ thủ (không cần độ hiếm)')
                .setRequired(true)
        ),

    async execute(interaction) {
        const userId = interaction.user.id;
        const username = interaction.user.username;
        const chosenName = interaction.options.getString('name');

        const inv = fs.existsSync(invPath) ? JSON.parse(fs.readFileSync(invPath)) : {};
        const equipped = fs.existsSync(equipPath) ? JSON.parse(fs.readFileSync(equipPath)) : {};

        const userInv = inv[userId];
        if (!userInv) {
            return interaction.reply('Bạn không có trợ thủ nào trong túi đồ.');
        }

        const matchedKey = Object.keys(userInv).find(key => key.startsWith(chosenName + ' -'));
        if (!matchedKey) {
            return interaction.reply('Không tìm thấy trợ thủ nào có tên đó trong túi đồ.');
        }

        equipped[userId] = matchedKey;
        fs.writeFileSync(equipPath, JSON.stringify(equipped, null, 2));

        await interaction.reply(`Thuật sĩ ${username} đã liên kết thành công với trợ thủ ${matchedKey}`);
    }
};
