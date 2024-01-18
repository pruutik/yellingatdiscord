const five = require('johnny-five');
const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');
const { token } = require('./config.json');

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates
	],
});

var led;

var speakers = 0;

const board = new five.Board();
board.on('ready', () => {
    led = new five.Led(8);
    client.login(token);
});

client.once('ready', () => {
    client.channels.fetch('958800820084817923').then((channel) => {
        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
        });
        connection.receiver.speaking.on('start', () => {
            speakers++;
            led.on();
        })
        connection.receiver.speaking.on('end', () => {
            speakers--;
            if(speakers<=0){
                led.off();
            }
        })
    });
});