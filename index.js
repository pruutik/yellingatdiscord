const five = require('johnny-five');
const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, EndBehaviorType } = require('@discordjs/voice');
const { OpusEncoder } = require('@discordjs/opus');
const { voiceChannelId, token } = require('./config.json');

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates
	],
});

var amplitudeled;
var lengthled;
var soundlength = 0;
var skip = 0;

const board = new five.Board();
board.on('ready', async () => {
    amplitudeled = new five.Led(11);
    lengthled = new five.Led(10);
    amplitudeled.on();
    lengthled.on();
    amplitudeled.brightness(0);
    lengthled.brightness(0);
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
            const encoder = new OpusEncoder(48000, 2);

            subscription.on("data", (audioBuffer) => {

                let channelData = encoder.decode(audioBuffer)

                // Calculate amplitude
                let amplitude = calcrms_lin(new Int8Array(channelData));
                // console.log(amplitude);
                // amplitude -= 20;
                // amplitude *= 4;
                if(amplitude<=0){
                    amplitude=0;
                    soundlength=0;
                }else{
                    soundlength+=0.01;
                    if(amplitude>255)amplitude=255;
                }

                skip++;
                if(skip>3){
                    skip=0;
                    amplitudeled.brightness(amplitude);
                    lengthled.brightness(soundlength);
                }
                // console.log(amplitude);
            })
        })
    });
});