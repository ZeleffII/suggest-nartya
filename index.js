const Discord = require('discord.js');
const { GuildEmoji } = require('discord.js');
const fs = require('fs');
const config = require('./config.json');
const client = new Discord.Client({
    intents: 32767
});

client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();

// Handler Command
fs.readdirSync('./commands/').forEach(dir => {
    fs.readdir(`./commands/${dir}`, (err, files) => {
        if (err) throw err;

        const jsFiles = files.filter(f => f.split(".").pop() === "js");
        if (jsFiles.length <= 0) return console.log("Je ne trouve aucune commande !");

        jsFiles.forEach(file => {
            const fileGet = require(`./commands/${dir}/${file}`);
            console.log(`✅ Commande ${file} chargée !`)

            try {
                client.commands.set(fileGet.help.name, fileGet);

                fileGet.help.aliases.forEach(alias => {
                    client.aliases.set(alias, fileGet.help.name);
                });
            } catch (err) {
                return console.log(err)
            }
        })
    })
})


client.on('messageCreate', async (message) => {
    if (message.author.bot || message.channel.type === 'DM') return;

    const prefix = config.prefix;
    let messageArray = message.content.split(" ");
    let cmd = messageArray[0];
    let args = messageArray.slice(1)

    let commands = client.commands.get(cmd.slice(prefix.length)) || client.commands.get(client.aliases.get(cmd.slice(prefix.length)));

    if (commands) {
        if (!message.content.startsWith(prefix)) return;
        commands.run(client, message, args, prefix);
    }
})



client.on('ready', async () => {
    let guildCount = client.guilds.cache.size;
    let countTxt;
    if (guildCount > 1) {
        countTxt = `Attention : Votre bot est sur plusieurs serveurs, ce code n'est pas optimisé pour le multi-serveurs ! Des erreurs peuvent faire surfaces !`
    } else {
        countTxt = ` `;
    }
    client.user.setActivity(`Suggest system, by Zeleff_ `, {
        type: "STREAMING",
        url: "https://www.twitch.tv/zeleff_"
      })
    console.log(`${client.user.username} est prêt ! Utilisateurs : ${client.users.cache.size} | ${countTxt}`)
})

client.login(config.token);

/* 
CREDITS:
------
🐔 by Zeleff_
Discord : https://discord.gg/HzXH5JGJsG
Tag : Zeleff_#2957
ID : 332488118588538880
------
*/