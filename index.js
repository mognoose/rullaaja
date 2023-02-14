require('dotenv').config()
const Discord = require('discord.js');
const http = require('http');
const url = require('url');
const { REST, Routes } = require('discord.js');

const commands = [
  {
    name: 'roll',
    type: 1,
    description: 'Rolls a dice.',
    options: [
        {
            name: "dice",
            description: "Dice to roll",
            type: 3,
            choices: [
                {
                    name: "D20",
                    value: "20",
                },
                {
                    name: "D6",
                    value: "6",
                },
                {
                    name: "D100",
                    value: "100",
                },
            ]

        }
    ]
  },
];

const roll = dice => ({dice: dice, result: Math.floor(Math.random() * (dice - 1 + 1)) + 1});
const parseMessage = (user, roll) => (`${user} heitti D${roll.dice} nopalla: ${roll.result}`)

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(Routes.applicationCommands(process.env.APPID), { body: commands });

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();

const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);
  });
  
  client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
      
    const dice = interaction.options.getString('dice') || 20;
    if (interaction.commandName === 'roll') {
      await interaction.reply(`${interaction.user.username} heitti D${dice} nopalla: ${roll(dice).result}`);
    }

});
  
client.login(process.env.TOKEN);

http.createServer(async (req, res) => {
    const uri = url.parse(req.url).pathname.split("/");
    const baseUrl = uri[1]
    const diceRequest = uri[2]
    let dice = diceRequest || 20;
    if(baseUrl == 'api'){
        res.writeHead(200, {'Content-Type': 'application/json'});
        const rolled = roll(dice);
        const channel = await client.channels.fetch('479199736776228865');
        channel.send(parseMessage('Unknown API user', rolled));
        res.end(JSON.stringify(rolled));
    }

  }).listen(3000);