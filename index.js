/*
 * ------------------------------------------------------------
 * "THE BEERWARE LICENSE" (Revision 42):
 * <atbrinkman : abrinkman94@gmail.com> wrote this code. As long as you retain this
 * notice, you can do whatever you want with this stuff. If we
 * meet someday, and you think this stuff is worth it, you can
 * buy me a beer in return.
 * ------------------------------------------------------------
 */
import { loadConfig } from "./config-loader.js";
import isEqual from "lodash.isequal";
import { Client, GatewayIntentBits, ChannelType } from"discord.js";

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates
    ]
});

/**
 * @property token <string> Client token
 * @property channelName <string> Name of the Discord channel receiving voice chat notifications
 */
const { token, channelName } = loadConfig("./config.json")

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`)
});

client.on("voiceStateUpdate", async (oldState, newState) => {
    const { member, channel } = newState;

    if (!channel) return;

    const textChannel = member.guild.channels.cache.find((channel) =>
        isEqual(channel.name, channelName) && isEqual(channel.type, ChannelType.GuildText)
    );

    if (textChannel && isEqual(channel.type, ChannelType.GuildVoice)) {
        const message = await textChannel.send(`${channel}:`);
        await message.edit(`${channel}: ${member} has joined`)
    }
});

client.login(token);
