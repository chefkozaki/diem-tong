const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

const invPath = './inventory.json';
const equipPath = './equipped.json';
const charactersPath = './characters.json';

const elementOrder = ['hỏa', 'kim', 'mộc', 'thổ', 'thủy']; // vòng khắc chế
const rankTier = ['common', 'uncommon', 'rare', 'sr', 'ssr'];

function parseCharacter(key) {
    const [name, rank] = key.split(' - ');
    return { name, rank };
}

function getElementFromName(name) {
    const characters = JSON.parse(fs.readFileSync(charactersPath));
    const char = characters.find(c => c.name === name);
    return char ? char.element : null;
}

function isCounter(ele1, ele2) {
    const i = elementOrder.indexOf(ele1);
    return elementOrder[(i + 1) % 5] === ele2;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('solo')
        .setDescription('Thách đấu với người chơi khác')
        .addUserOption(opt =>
            opt.setName('target')
                .setDescription('Người chơi bạn muốn solo')
                .setRequired(true)
        ),

    async execute(interaction) {
        const user1 = interaction.user;
        const user2 = interaction.options.getUser('target');

        if (user1.id === user2.id) {
            return interaction.reply('Không thể solo với chính mình.');
        }

        const inv = fs.existsSync(invPath) ? JSON.parse(fs.readFileSync(invPath)) : {};
        const eq = fs.existsSync(equipPath) ? JSON.parse(fs.readFileSync(equipPath)) : {};

        const equip1 = eq[user1.id];
        const equip2 = eq[user2.id];

        if (!equip1 || !inv[user1.id] || !inv[user1.id][equip1]) {
            return interaction.reply(`${user1.username} chưa trang bị công pháp.`);
        }
        if (!equip2 || !inv[user2.id] || !inv[user2.id][equip2]) {
            return interaction.reply(`${user2.username} chưa trang bị công pháp.`);
        }

        const char1 = parseCharacter(equip1);
        const char2 = parseCharacter(equip2);

        const tier1 = rankTier.indexOf(char1.rank);
        const tier2 = rankTier.indexOf(char2.rank);

        const ele1 = getElementFromName(char1.name);
        const ele2 = getElementFromName(char2.name);

        let result = '';
        let expChange = 0;

        if (tier1 > tier2) {
            result = `Thuật sĩ ${user1.username} đã chiến thắng đối thủ do công pháp cấp độ hiếm cao hơn.`;
            expChange = 5;
        } else if (tier1 < tier2) {
            result = `Thuật sĩ ${user1.username} đã thất bại vì công pháp cấp độ hiếm thấp hơn.`;
            expChange = -5;
        } else {
            if (isCounter(ele1, ele2)) {
                result = `Thuật sĩ ${user1.username} đã chiến thắng đối thủ do thuộc tính khắc chế.`;
                expChange = 5;
            } else if (isCounter(ele2, ele1)) {
                result = `Thuật sĩ ${user1.username} đã thất bại vì bị khắc chế thuộc tính.`;
                expChange = -5;
            } else {
                result = `Trận đấu giữa ${user1.username} và ${user2.username} kết thúc với kết quả hòa.`;
                expChange = 0;
            }
        }

        if (expChange !== 0) {
            interaction.client.levelSystem.addExp(user1.id, user1.username, expChange, interaction.channel);
        }

        await interaction.reply(result);
    }
};
