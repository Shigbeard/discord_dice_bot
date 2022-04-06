const Discord = require('discord.js');
require('dotenv').config();
const intents = new Discord.Intents(['GUILDS', 'GUILD_MEMBERS', 'GUILD_MESSAGES', 'GUILD_MESSAGE_REACTIONS']);
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { SlashCommandBuilder } = require('@discordjs/builders');
const client = new Discord.Client({intents: intents});
const { Random } = require('random-js');
const chalk = require('chalk');

const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

client.on('ready', async () => {
    client.user.setActivity(`${process.env.PREFIX}roll`, { type: 'LISTENING'});
    console.log(`Logged in as ${client.user.tag}!`);
    try {
        await rest.put(
            Routes.applicationCommands(process.env.APPLICATION_ID), {body: cmnds},
        );
    } catch (e) {
        console.error(e);
    }
});

function roll(count, sides, modifier) {
    const random = new Random();
    const rolls = [];
    for (let i = 0; i < count; i++) {
        rolls.push(random.integer(1, sides));
    }
    const total = rolls.reduce((a, b) => a + b, 0);
    let result = {
        rolls: rolls,
        sum: total + modifier,
        premod: total,
    }
    return result;
}

const youre_a_dummy = (user) => {
    const dummy = [
        "The universe collapses under your immeasurable stupidity.",
        "You are a complete and utter idiot.",
        "The Doctor's at the psych ward decide to up your dosage.",
        "Your mother would be disappointed.",
        "Despite your volume, nobody laughs with you.",
        "You fell off + L + ratio + you're fat.",
        "Why are you wasting my time?",
        "I'm going to have to ask you to leave.",
        `/ban ${user.name}`,
    ]
    return dummy[Math.floor(Math.random() * dummy.length)];
}

const ispositive = (num) => {
    if (num > 0) {
        return 1;
    } else if (num < 0) {
        return -1;
    } else {
        return 0;
    }
}

const logthis = (author, roll, result, modifier, numbers, total, crit) => {
    const now = new Date();
    const nowstring = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
    let logstring = `${chalk.blue(`[${nowstring}]`)} ${author.username} ${chalk.grey('rolled')} ${roll.length} ${chalk.grey(`group${roll.length > 1 ? 's' : ''} of dice!`)} \n`
        // `${roll.map(x => `${x}`).join(', ')} = ${result.sum}${crit ? ` (${crit})` : ''}\n` +
        for (let i = 0; i < roll.length; i++) {
            const x = roll[i];
            const y = result[i];
            logstring += `\t${chalk.yellow(`[${x}]`.padEnd(8))} ${chalk.grey(`=`)} ${chalk.green(`[${y.rolls.join(', ')}]`.padEnd(40))} ${chalk.grey(`=`)} ${chalk.green(`[${y.sum}]`)}\n`
        }
        logstring += `${chalk.grey('Total:'.padEnd(10))}${chalk.green(`(${total})`) + chalk.greenBright(`[${total + modifier}]`)}\n`
        logstring += `${chalk.grey('Numbers:'.padEnd(10))}${chalk.green(`[${numbers}]`)}\n`
        logstring += `${chalk.grey('Crit:'.padEnd(10))}${chalk.green(`[${crit}]`)}\n`
        // `${numbers ? `${numbers.map(x => `${x}`).join(', ')}` : ''}${total ? ` + ${total}` : ''} = ${result.premod}`;
    console.log(logstring);
}

const messageFormatter = async (author, roll, result=null, modifier=0, maxroll=0) => {
    const embed = new Discord.MessageEmbed()
        .setColor(result ? '#0099ff' : '#ff0000')
    if (result === [] || result === null) {
        embed.setTitle(`${author.username} rolled ${roll.count}d${roll.sides}${roll.modifier ? ` + ${roll.modifier}` : ''}`);
        embed.setDescription(`${youre_a_dummy(author)}`);
    } else {
        let modstring = ""
        switch (ispositive(modifier)) {
            case 1:
                modstring = `+ ${modifier}`;
                break;
            case -1:
                modstring = `- ${-modifier}`;
                break;
            default:
                modstring = "";
                break;
        }
        embed.setTitle(`${author.username} rolled ${roll.length} group${roll.length > 1 ? 's' : ''} of dice!`);
        embed.setDescription(`Your dicegroups: [**${roll.join(', ')}**] ${modstring}`);
        const numbers = [];
        for (let i = 0; i < result.length; i++) {
            const group = result[i];
            numbers[i] = group.sum;
            embed.addField(`${roll[i]}`, `[${group.rolls.join(', ')}] = **${group.sum}**`, inline=true);
        }
        const total = result.reduce((a, b) => a + b.sum, 0)
        const tenpercent = Math.floor(total * 0.1);
        let crit = '';
        if ((total+modifier) >= maxroll - tenpercent) {
            crit = "success";
        } else if ((total+modifier) <= tenpercent) {
            crit = "failure";
        }
        embed.addField(`Total`, `(${numbers.join(' + ')}) ${modstring} = ${total} ${modstring} == **${total + modifier}**`);
        embed.setThumbnail(`${process.env.IMAGE_HOST}?number=${total + modifier}${crit !== '' ? `&crit=${crit}` : ''}`);
        logthis(author, roll, result, modifier, numbers, total, crit);
    }
    return embed;
}

const rollthedice = async (author, args) => {
    const modregex = /([\+\-])(\d+)$/;
    let modifier = modregex.exec(args);
    let actualmod = 0;
    if (modifier) {
        if (modifier[1] == '-') {
            actualmod = -parseInt(modifier[2]);
        } else {
            actualmod = parseInt(modifier[2]);
        }
    } else {
        modifier = ['+',0]
        actualmod = 0;
    }
    // remove the modifier from the string
    const rollstring = args.replace(/[\+\-]\d+$/, '');
    const dicegroups = rollstring.split(',');
    const regex = /(?:(\d+))?d(\d+)/;
    const results = []
    // Calculate what the highest possible roll is of all dice groups combined
    let maxroll = 0;
    for (let i = 0; i < dicegroups.length; i++) {
        const dg = dicegroups[i];
        const match = regex.exec(dg);
        if (match) {
            const count = parseInt(match[1] ? match[1] : 1);
            const sides = parseInt(match[2] ? match[2] : 6);
            // const modifier = parseInt(match[3] ? match[3] : 0);
            // Reject rolls requesting a 0 or negative count/sides
            if (count <= 0 || sides <= 0) {
                // Bad roll
                break;
                // return await message.channel.send({
                //     embeds : [
                //         messageFormatter(message, { count, sides, modifier })
                //     ]
                // });
            } else {
                maxroll += count * sides;
                const result = roll(count, sides, 0);
            // return await message.channel.send({
            //     embeds : [
            //         messageFormatter(message, { count, sides, modifier }, result)
            //     ]
            // });
                results[i] = result;
            }
        }
    }
    return await messageFormatter(author, dicegroups, results, actualmod, maxroll)
        
}

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (!message.content.startsWith(process.env.PREFIX)) return;
    let args = message.content.slice(process.env.PREFIX.length).split(/ +/);
    const command = args.shift().toLowerCase();
    if (command === 'roll') {
        if (args.length === 0) {
            args = ['1d20'];
        }
        return await message.reply({
            embeds : [
                await rollthedice(message.author, args[0])
            ]
        });
    }
});

const rollcommand = new SlashCommandBuilder()
    .setName('roll')
    .setDescription('Roll the dice!')
    .addStringOption(option => 
        option.setName('dice')
            .setDescription('The dice group to roll. Example: `1d20,1d6,1d4+5`')
            .setRequired(true)
            // .setDefaultValue('1d20')

);
const cmnds = [];
cmnds.push(rollcommand.toJSON());


client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    if (interaction.commandName === 'roll') {
        return await interaction.reply({
            embeds : [
                await rollthedice(interaction.user, interaction.options.getString('dice'))
            ]
        });
    };
});










// catch SIGINT and SIGTERM and exit cleanly
process.on('SIGINT', () => {
    console.log('\nGracefully shutting down from SIGINT (Ctrl-C)');
    client.destroy();
    process.exit(0);
});
process.on('SIGTERM', () => {
    console.log('\nGracefully shutting down from SIGTERM');
    client.destroy();
    process.exit(0);
});
client.login(process.env.TOKEN);