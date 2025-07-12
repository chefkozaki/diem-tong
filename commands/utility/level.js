// Commands/level.js
const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = './levels.json';

function getRank(level) {
    if (level <= 19) return 'Diêm sĩ';
    if (level <= 40) return 'Diêm tá';
    if (level <= 70) return 'Diêm vương';
    if (level <= 100) return 'Diêm đế';
    if (level <= 150) return 'Diêm thần';
    return 'Tối thượng';
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('level')
        .setDescription('Kiểm tra level và cấp bậc của bạn'),

    async execute(interaction) {
        const userId = interaction.user.id;
        const username = interaction.user.username;

        let levels = {};
        if (fs.existsSync(path)) {
            levels = JSON.parse(fs.readFileSync(path));
        }

        if (!levels[userId]) {
            levels[userId] = { exp: 0, level: 1, rank: getRank(1) };
        }

        const user = levels[userId];
        const msg = `Thuật sĩ ${username} hiện tại cấp ${user.level} (${user.exp}/100 exp), cấp bậc: ${user.rank}.`;

        await interaction.reply(msg);
    }
};
