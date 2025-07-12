const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const rollPath = './roll.json';
const invPath = './inventory.json';
const levelsPath = './levels.json';
const pityPath = './pity.json';
const characters = JSON.parse(fs.readFileSync(path.join(__dirname, '../../characters.json')));

function getRank(level) {
  if (level <= 19) return 'Diêm sĩ';
  if (level <= 40) return 'Diêm tá';
  if (level <= 70) return 'Diêm vương';
  if (level <= 100) return 'Diêm đế';
  if (level <= 150) return 'Diêm thần';
  return 'Tối thượng';
}

function getRankChance(rank) {
  const rankChances = {
    'Diêm sĩ': { common: 80, uncommon: 5, rare: 5, sr: 5, ssr: 5 },
    'Diêm tá': { common: 70, uncommon: 10, rare: 10, sr: 5, ssr: 5 },
    'Diêm vương': { common: 60, uncommon: 20, rare: 10, sr: 5, ssr: 5 },
    'Diêm đế': { common: 50, uncommon: 20, rare: 10, sr: 10, ssr: 10 },
    'Diêm thần': { common: 40, uncommon: 10, rare: 10, sr: 20, ssr: 20 },
    'Tối thượng': { common: 20, uncommon: 20, rare: 10, sr: 25, ssr: 25 }
  };
  return rankChances[rank] || rankChances['Diêm sĩ'];
}

function getRandomRank(chances) {
  const roll = Math.random() * 100;
  let sum = 0;
  for (const [rank, chance] of Object.entries(chances)) {
    sum += chance;
    if (roll <= sum) return rank;
  }
  return 'common';
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('roll')
    .setDescription('Tuyển mộ 1 trợ thủ, tốn 1 vé'),

  async execute(interaction) {
    const userId = interaction.user.id;
    const username = interaction.user.username;

    const rolls = fs.existsSync(rollPath) ? JSON.parse(fs.readFileSync(rollPath)) : {};
    const inv = fs.existsSync(invPath) ? JSON.parse(fs.readFileSync(invPath)) : {};
    const levels = fs.existsSync(levelsPath) ? JSON.parse(fs.readFileSync(levelsPath)) : {};
    const pity = fs.existsSync(pityPath) ? JSON.parse(fs.readFileSync(pityPath)) : {};

    const userRoll = rolls[userId] || 0;
    const userData = levels[userId] || { level: 1 };
    const userRank = getRank(userData.level);
    const rankChance = getRankChance(userRank);

    if (userRoll < 1) {
      return interaction.reply('Bạn không đủ vé để quay.');
    }

    if (!pity[userId]) pity[userId] = { rPity: 0, srPity: 0, ssrPity: 0 };
    const pityCount = pity[userId];

    pityCount.rPity++;
    pityCount.srPity++;
    pityCount.ssrPity++;

    let forcedRank = null;
    if (pityCount.ssrPity >= 200) forcedRank = 'ssr';
    else if (pityCount.srPity >= 100) forcedRank = 'sr';
    else if (pityCount.rPity >= 10) forcedRank = 'rare';

    let chosenRank = forcedRank || getRandomRank(rankChance);
    const pool = characters.filter(c => c.rank === chosenRank);
    const selected = pool[Math.floor(Math.random() * pool.length)];

    // Reset pity nếu ra rank tương ứng
    if (selected.rank === 'rare') pityCount.rPity = 0;
    if (selected.rank === 'sr') pityCount.srPity = 0;
    if (selected.rank === 'ssr') pityCount.ssrPity = 0;

    // Cập nhật túi đồ
    const key = `${selected.name} - ${selected.rank}`;
    if (!inv[userId]) inv[userId] = {};
    if (!inv[userId][key]) inv[userId][key] = 0;
    inv[userId][key]++;

    rolls[userId] = userRoll - 1;

    fs.writeFileSync(rollPath, JSON.stringify(rolls, null, 2));
    fs.writeFileSync(invPath, JSON.stringify(inv, null, 2));
    fs.writeFileSync(pityPath, JSON.stringify(pity, null, 2));

    // +1 exp
    interaction.client.levelSystem.addExp(userId, username, 1, interaction.channel);

    await interaction.reply(`Thuật sĩ ${username} đã tuyển được trợ thủ ${selected.name} - ${selected.rank}`);
  }
};
