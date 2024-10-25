/*
 * ------------------------------------------------------------
 * "THE BEERWARE LICENSE" (Revision 42):
 * <atbrinkman : abrinkman94@gmail.com> wrote this code. As long as you retain this
 * notice, you can do whatever you want with this stuff. If we
 * meet someday, and you think this stuff is worth it, you can
 * buy me a beer in return.
 * ------------------------------------------------------------
 */
import isEqual from "lodash.isequal";
import config from "./config.js";
import {Client, Options, GatewayIntentBits, ChannelType} from "discord.js";
import isEmpty from "lodash.isempty";

/**
 * @property token <string> Client token
 * @property channelName <string> Name of the Discord channel receiving voice chat notifications
 */
const {token, channels, members} = config.load("./config.json")

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates
    ],
    sweepers: {
        ...Options.DefaultSweeperSettings,
        messages: {
            interval: 1_800,
            lifetime: 300,
            maxSize: 1
        }
    }
});

const handleError = (e) => console.error(e);

client.on("error", handleError);

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`)
});

client.on("voiceStateUpdate", async (oldState, newState) => {
    if (!newState.channel) return;

    const isUserUpdate = !newState.member.user.bot
    const isChannelChange = !isEqual(oldState.channelId, newState.channelId)
    const isVoiceChannel = isEqual(newState.channel.type, ChannelType.GuildVoice)

    if (isUserUpdate && isVoiceChannel && isChannelChange) {
        const notificationChannels = [
            // config.members channels
            ...(!isEmpty(members) ? await Promise.all(members.map((id) => client.users.fetch(id).catch(handleError))) : []),
            // config.channels channels
            ...(!isEmpty(channels) ? await Promise.all(
                channels.map((channelName) => newState.member.guild.channels.cache.find(({name, type}) =>
                        isEqual(name, channelName) && isEqual(type, ChannelType.GuildText)
                    )
                )
            ) : [])
        ];

        await Promise.all(notificationChannels.map((notificationChannel) =>
                new Promise(async (resolve, reject) => {
                    let message = null;
                    try {
                        message = await notificationChannel.send(`${newState.channel}:`);
                        await message.edit(`${newState.channel}: ${newState.member} has joined`);
                    } catch (e) {
                        await message?.delete()
                            .then(({author}) => console.log(
                                `Deleted failed message attempt from ${author.username} to ${notificationChannel.name}`
                            ))
                            .catch((e) => reject(e));
                    } finally {
                        resolve()
                    }
                })
            )
        )
    }
});

client.login(token);
