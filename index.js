const five = require('johnny-five');
const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, EndBehaviorType } = require('@discordjs/voice');
const { OpusEncoder } = require('@discordjs/opus');
const { voiceChannelId, token } = require('./config.json');

const fs = require('fs');

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates
	],
});

var led;
var brightnessModifier = 0;

const board = new five.Board();
board.on('ready', () => {
    led = new five.Led(11);
    led.on();
    led.brightness(0);
    client.login(token);
});

// https://stackoverflow.com/questions/51218090/how-to-get-amplitude-from-opus-audio
function calcrms_lin(buffer){
    var rms = 0;

    for(var bufferIndex = 0; bufferIndex < buffer.length; bufferIndex++){
        rms+= buffer[bufferIndex]*buffer[bufferIndex];
    }

    rms /= buffer.length;
    rms = Math.sqrt(rms);

    return rms;
}

client.once('ready', () => {
    client.channels.fetch(voiceChannelId).then((channel) => {
        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
            selfDeaf: false
        });
        connection.receiver.speaking.on('start', (userId) => {
            const subscription = connection.receiver.subscribe(userId, {end: EndBehaviorType.AfterSilence});
            const encoder = new OpusEncoder(48000,1);
            subscription.on("data", (audioBuffer) => {

                let channelData = encoder.decode(audioBuffer)

                // Calculate amplitude
                let amplitude = calcrms_lin(channelData);
                console.log(amplitude);
                amplitude -= 100;
                if(amplitude<0){
                    amplitude=0;
                    brightnessModifier=0;
                }else{
                    brightnessModifier+=.00001*amplitude;
                    amplitude=amplitude*brightnessModifier;
                    if(amplitude>255)amplitude=255;
                }

                led.brightness(amplitude);
                console.log(amplitude);
            })
        })
    });
});