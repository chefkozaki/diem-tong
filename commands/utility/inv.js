// Commands/inv.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = './inventory.json';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('inv')
        .setDescription('Xem túi đồ của bạn'),

    async execute(interaction) {
        const userId = interaction.user.id;
        const username = interaction.user.username;

        const inventory = fs.existsSync(path) ? JSON.parse(fs.readFileSync(path)) : {};
        const userInv = inventory[userId];

        if (!userInv || Object.keys(userInv).length === 0) {
            return interaction.reply('Túi đồ của bạn đang trống. Dùng /roll để chiêu mộ trợ thủ.');
        }

        const embed = new EmbedBuilder()
            .setTitle(`Túi đồ của Thuật sĩ ${username}`)
            .setColor('Random');

        for (const [key, count] of Object.entries(userInv)) {
            embed.addFields({ name: ` ${key}`, value: `Số lượng: ${count}`, inline: true });
        }

        await interaction.reply({ embeds: [embed] });
    }
};
