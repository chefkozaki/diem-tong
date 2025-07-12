// Commands/lb.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const levelsPath = './levels.json';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lb')
        .setDescription('Xem bảng xếp hạng level'),

    async execute(interaction) {
        const levels = fs.existsSync(levelsPath) ? JSON.parse(fs.readFileSync(levelsPath)) : {};

        const leaderboard = Object.entries(levels)
            .map(([id, data]) => ({ id, ...data }))
            .sort((a, b) => b.level - a.level || b.exp - a.exp)
            .slice(0, 10);

        const embed = new EmbedBuilder()
            .setTitle('📜 Bảng Xếp Hạng Thuật Sĩ')
            .setColor('Gold');

        for (let i = 0; i < leaderboard.length; i++) {
            const user = leaderboard[i];
            const member = await interaction.guild.members.fetch(user.id).catch(() => null);
            const name = member ? member.user.username : `ID: ${user.id}`;
            embed.addFields({ name: `#${i + 1} - ${name}`, value: `Rank: ${user.rank} - Level: ${user.level}`, inline: false });
        }

        await interaction.reply({ embeds: [embed] });
    }
};
