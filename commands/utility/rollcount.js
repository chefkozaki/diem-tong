// Commands/rollcount.js
const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

const rollPath = './roll.json';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rollcount')
    .setDescription('Xem số lượng vé quay còn lại của bạn'),

  async execute(interaction) {
    const userId = interaction.user.id;
    const username = interaction.user.username;

    const rolls = fs.existsSync(rollPath) ? JSON.parse(fs.readFileSync(rollPath)) : {};
    const count = rolls[userId] || 0;

    await interaction.reply(`Thuật sĩ ${username} còn lại ${count} vé quay.`);
  }
};
