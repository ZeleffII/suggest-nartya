const Discord = require('discord.js');
const config = require('../../config.json');
const msgRecent = new Set();

module.exports.run = async (client, message, args, prefix) => {
    // Cooldown de 5 secondes avant de ré utiliser la commande

    if (msgRecent.has(message.author.id)) {

        return message.channel.send({ content:  "Merci de patienter `« 5 secondes »` avant de réutiliser la commande !"}).then((msg) => {
          setTimeout(() => msg.delete().catch(error => {
            // Envoie l'erreur dans la console si ce dernier n'est pas une erreur : 10008
            if (error.code !== 10008) {
              console.error('Echec lors de la suppression du message :', error);
            }
          }), 5000)
        });
      } else {  
        msgRecent.add(message.author.id);
        setTimeout(() => {
          msgRecent.delete(message.author.id);
        }, 5000);
      }
    // Le rôle à mentionner lors d'une nouvelle suggestion
    const mods = message.guild.roles.cache.find(r => r.id === config.mod);

    // Salon où les suggestions sera envoyées
    const Salon = client.channels.cache.get(config.suggest);

    // Si le salon suggestion est introuvable
    if (!Salon) {
        // Réagit avec :x:
        message.react('❌')
        // Message d'erreur si le salon fourni dans le fichier config.json est introuvable
        return message.channel.send('Salon des suggestions introuvable. Veuillez vous assurez que l\'identifiant du salon fourni dans le fichier `config.json` soit valide.').then((msg) => {
            // Suppression du message d'erreur après 5 secondes
            setTimeout(() => msg.delete().catch(error => {
              // Envoie l'erreur dans la console si ce dernier n'est pas une erreur : 10008
              if (error.code !== 10008) {
                console.error('Echec lors de la suppression du message :', error);
              }
            }), 5000)
          });
    }

    // Suggestion
    const Suggest = args[0];

    // S'il n'y a pas de suggestion, renvoie une erreur
    if (!Suggest) return message.reply('\\❌ **Veuillez fournir une suggestion !**').then((msg) => {
        // Suppression du message d'erreur après 5 secondes
        setTimeout(() => msg.delete().catch(error => {
          // Envoie l'erreur dans la console si ce dernier n'est pas une erreur : 10008
          if (error.code !== 10008) {
            console.error('Echec lors de la suppression du message :', error);
          }
        }), 5000)
      });

    // --------- Création des Embeds / Butons ----------- \\
    const embedSuggest = new Discord.MessageEmbed()
        .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
        .setTitle(`Suggestion de ${message.author.tag}`)
        .setDescription(Suggest)
        .setColor('DARK_NAVY')
        .setThumbnail(message.guild.iconURL({ dynamic: true }))
        .setFooter({
            text: '❗ En cours de traitement..'
        })

    const refuseSuggest = new Discord.MessageEmbed()
        .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
        .setTitle(`Suggestion de ${message.author.tag}`)
        .setDescription(Suggest)
        .setColor('DARK_RED')
        .setThumbnail(message.guild.iconURL({ dynamic: true }))
        .setFooter({
            text: '❌ Refusée par'
        })

    const acceptSuggest = new Discord.MessageEmbed()
        .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
        .setTitle(`Suggestion de ${message.author.tag}`)
        .setDescription(Suggest)
        .setColor('DARK_GREEN')
        .setThumbnail(message.guild.iconURL({ dynamic: true }))
        .setFooter({
            text: '✅ Acceptée par'
        })

 
    const but1 = new Discord.MessageButton()
        .setCustomId('refuse')
        .setLabel('Refuser')
        .setStyle('DANGER')

    const but2 = new Discord.MessageButton()
        .setCustomId('accept')
        .setLabel('Accepter')
        .setStyle('SUCCESS')

    const nb1 = new Discord.MessageButton()
        .setCustomId('refuse')
        .setLabel('Refuser')
        .setStyle('DANGER')
        .setDisabled()

    const nb2 = new Discord.MessageButton()
        .setCustomId('accept')
        .setLabel('Accepter')
        .setStyle('SUCCESS')
        .setDisabled()
    // -------------------- \\

    // Components
    const row = new Discord.MessageActionRow().addComponents(but1, but2)
    const row1 = new Discord.MessageActionRow().addComponents(nb1, nb2)

    // Envoie de l'embed / components dans le salon indiquer
    let mssg = await Salon.send({ embeds: [embedSuggest], components: [row], content: `${mods || ' '}` })
    await message.react('✅')
    message.reply('\\✅ votre suggestion à bien été soumis ! Vous recevrez un message privé si votre suggestion est refusée ou acceptée.').then((msg) => {
        // Suppression du message d'erreur après 8 secondes
        setTimeout(() => msg.delete().catch(error => {
          // Envoie l'erreur dans la console si ce dernier n'est pas une erreur : 10008
          if (error.code !== 10008) {
            console.error('Echec lors de la suppression du message :', error);
          }
        }), 8000)
      });

    
    
    const collector = mssg.createMessageComponentCollector();
    

    collector.on('collect', async (i) => {
        
        // Si la personne n'a pas la permission MANAGE_MESSAGES, elle ne pourra pas réagir aux boutons
        if (!i.member.permissions.has('MANAGE_MESSAGES')) return;
        await i.deferUpdate();

        // Si le bouton accepter est utilisé
        if (i.customId == 'accept') {
            
            // Embed : Accepter
            i.message.edit({ embeds: [acceptSuggest.setFooter({ text: `✅ Acceptée par : ${i.user.username}` })], components: [row1] })
            // Envoie d'un message privé à l'utilisateur 
            message.author.send({ content: `✅ Votre suggestion sur **${message.guild.name}** à été **acceptée** !` })
        }


        // Si le bouton refuser est utilisé
        if (i.customId == 'refuse') {


            // Embed : Refuser
            i.message.edit({ embeds: [refuseSuggest.setFooter({ text: `❌ Refusée par ${i.user.username}` })], components: [row1] })
            // Envoie d'un message privé à l'utilisateur 
            message.author.send({ content: `❌ Votre suggestion sur **${message.guild.name}** à été **refusée** !` })
        }

    })
}

module.exports.help = {
    name: "suggest",
    aliases: ["suggestion"],
    description: "Soumet une suggestion !"
}


/* 
CREDITS:
------
🐔 by Zeleff_
Discord : https://discord.gg/HzXH5JGJsG
Tag : Zeleff_#2957
ID : 332488118588538880
------
*/
