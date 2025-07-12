// Commands/farm.js
const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const rollPath = './roll.json';
const cooldownPath = './farm_cooldown.json';

const COOLDOWN = 60 * 60 * 1000; // 1 giờ
const MAX_FARM_PER_HOUR = 4;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('farm')
        .setDescription('Farm vé quay (giới hạn 4 lần mỗi giờ)'),

    async execute(interaction) {
        const userId = interaction.user.id;
        const username = interaction.user.username;
        const now = Date.now();

        // Load cooldowns
        let cooldowns = fs.existsSync(cooldownPath) ? JSON.parse(fs.readFileSync(cooldownPath)) : {};
        let userCooldown = cooldowns[userId] || { timestamps: [] };

        // Loại bỏ các lần farm cũ hơn 1 giờ
        userCooldown.timestamps = userCooldown.timestamps.filter(ts => now - ts < COOLDOWN);

        if (userCooldown.timestamps.length >= MAX_FARM_PER_HOUR) {
            const nextAvailable = COOLDOWN - (now - userCooldown.timestamps[0]);
            const minutes = Math.ceil(nextAvailable / 60000);
            return interaction.reply(`Thuật sĩ đã hết mana, ${minutes} phút sau hãy quay lại.`);
        }

        const rolls = fs.existsSync(rollPath) ? JSON.parse(fs.readFileSync(rollPath)) : {};
        const reward = Math.floor(Math.random() * 30) + 1;

        rolls[userId] = (rolls[userId] || 0) + reward;
        fs.writeFileSync(rollPath, JSON.stringify(rolls, null, 2));

        // Cập nhật cooldown
        userCooldown.timestamps.push(now);
        cooldowns[userId] = userCooldown;
        fs.writeFileSync(cooldownPath, JSON.stringify(cooldowns, null, 2));

        await interaction.reply(`Thuật sĩ ${username} đã thành công đoạt được kho báu ${reward} vé quay.`);
    }
};
