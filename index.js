const five = require('johnny-five');
const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');
const { OpusEncoder } = require('@discordjs/opus');
const { voiceChannelId, token } = require('./config.json');

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates
	],
});

var led;

var speakers = 0;

// const board = new five.Board();
// board.on('ready', () => {
//     led = new five.Led(8);
    client.login(token);
// });

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
            const subcription = connection.receiver.subscribe(userId, { end: { 
                // behavior: EndBehaviorType.AfterSilence, 
                duration: 100 
            }});
            const encoder = new OpusEncoder(48000,2);
            subcription.on("data", (audioBuffer) => {
                // encoder.decode(chunk)
                // console.log(audioBuffer);
                let channelData = encoder.decode(audioBuffer)
                console.log(channelData);
                // Calculate amplitude
                const amplitude = calcrms_lin(channelData);
                console.log(amplitude)
            })
            speakers++;
            // led.on();
        })
        connection.receiver.speaking.on('end', () => {
            speakers--;
            if(speakers<=0){
                // led.off();
            }
        })
    });
});