const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, MessageFlags } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// === Gán hệ thống level trước khi login ===
client.levelSystem = {
    getRank(level) {
        if (level <= 19) return 'Diêm sĩ';
        if (level <= 40) return 'Diêm tá';
        if (level <= 70) return 'Diêm vương';
        if (level <= 100) return 'Diêm đế';
        if (level <= 150) return 'Diêm thần';
        return 'Tối thượng';
    },

    addExp(userId, username, amount, channel) {
        const levels = JSON.parse(fs.readFileSync('./levels.json'));
        if (!levels[userId]) levels[userId] = { exp: 0, level: 1, rank: this.getRank(1) };

        let user = levels[userId];
        user.exp += amount;

        let leveledUp = false;
        let rankUp = false;

        while (user.exp >= 100) {
            user.exp -= 100;
            user.level++;
            leveledUp = true;

            const newRank = this.getRank(user.level);
            if (newRank !== user.rank) {
                user.rank = newRank;
                rankUp = true;
            }
        }

        levels[userId] = user;
        fs.writeFileSync('./levels.json', JSON.stringify(levels, null, 2));

        if (leveledUp) channel.send(`Thuật sĩ ${username} đã thành công lên cấp ${user.level}!`);
        if (rankUp) channel.send(`Thuật sĩ ${username} thành công đột phá chiến bậc ${user.rank}!`);
    },

    getUserLevel(userId) {
        const levels = JSON.parse(fs.readFileSync('./levels.json'));
        if (!levels[userId]) return { exp: 0, level: 1, rank: this.getRank(1) };
        return levels[userId];
    }
};

// === Tạo file dữ liệu nếu chưa tồn tại ===
const levelPath = './levels.json';
if (!fs.existsSync(levelPath)) fs.writeFileSync(levelPath, '{}');
const inventoryPath = './inventory.json';
if (!fs.existsSync(inventoryPath)) fs.writeFileSync(inventoryPath, '{}');
const rollPath = './roll.json';
if (!fs.existsSync(rollPath)) fs.writeFileSync(rollPath, '{}');

// === Load lệnh ===
client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

// === Sự kiện bot online ===
client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

// === Sự kiện xử lý slash command ===
client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;
	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction, client); // nhớ truyền `client`
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
		}
	}
});

// === Cuối cùng mới login ===
client.login(ExampleTokenHere); // Thay ExampleTokenHere bằng token thực tế của bạn
