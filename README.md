# Yelling at Discord
A simple arduino project to visualize discord voice call intensity using two leds (for amplitude and length of speech).

The inspiration for this project was to find an alternative way to gauge engagement in discord voice channels that can allow users to avoid overstimulation.

![Image of the project in action](https://github.com/pruutik/yellingatdiscord/assets/68960417/4e1fc4d2-cc9a-43ac-9706-921a1bc8883f)
## Requirements
1. Node.js (this project was made using v19.6.0)
2. A [discord bot application](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot)
3. An arduino with a [standard firmata flashed onto it](https://www.instructables.com/Arduino-Installing-Standard-Firmata/)

## Setup
### Hardware
Follow [the schematic](./schematics.pdf) to set up your circuit and plug in your arduino to your computer.

Materials required:
1. 2 LEDs (different colours recommended)
2. 1 Resistor (minimum 330 ohms recommended)
3. [Not pictured] Any sort of diffuser placed on top of the LEDs (tissues work)

### Software
Assuming you've installed node.js and flashed your arduino with a standard firmata, simply:
1. Clone into this repo
2. Run `npm install`
3. Create a `config.json` file with the following information:
	```json
	{
		"voiceChannelId": "the ID of the voice channel you want to listen to",
		"token": "your bot's token"
	}
	```
Now you can simply run `node index.js` to start the application!

## Demo
Check out [this brief video](https://youtu.be/9BJ9rPN1vVE) demonstrating the interaction!

***Note: No diffuser has been used in the demo video or image since my camera struggles to capture the light through it***
