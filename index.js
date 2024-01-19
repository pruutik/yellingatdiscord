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

var extrabrightness = 0;

const board = new five.Board();
board.on('ready', () => {
    led = new five.Led(11);
    led.on();
    led.brightness(0);
    client.login(token);
});

function calcrms_lin(buffer){

    var rms = 0;

    for(var bufferIndex = 0; bufferIndex < buffer.length; bufferIndex++){
        rms+= buffer[bufferIndex]*buffer[bufferIndex];
    }

    rms /= buffer.length;
    rms = Math.sqrt(rms);

    return rms;

}

// function calcrms_db(buffer){
//     return 400*Math.log10(calcrms_lin(buffer))-600;
// }

client.once('ready', () => {
    client.channels.fetch(voiceChannelId).then((channel) => {
        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
            selfDeaf: false
        });
        connection.receiver.speaking.on('start', (userId) => {
            const subscription = connection.receiver.subscribe(userId, { end: { 
                // behavior: EndBehaviorType.AfterSilence, 
                duration: 10
            }});
            const encoder = new OpusEncoder(48000,1);
            subscription.on("data", (audioBuffer) => {
                // encoder.decode(chunk)
                // console.log(audioBuffer);
                let channelData = encoder.decode(audioBuffer)
                // console.log(channelData);
                // Calculate amplitude
                let amplitude = calcrms_lin(channelData);
                amplitude -= 100;
                if(amplitude<0){
                    amplitude=0;
                    extrabrightness=1;
                }else{
                    extrabrightness+=.01;
                    amplitude=amplitude*extrabrightness;
                    if(amplitude>255)amplitude=255;
                }
                // amplitude += amplitude;
                led.brightness(amplitude);
                console.log(amplitude);
            })
            // subscription.on('')
            // speakers++;
            // led.on();
        })
        // connection.receiver.speaking.on('end', () => {
        //     speakers--;
        //     if(speakers<=0){
        //         // led.off();
        //     }
        // })
    });
});