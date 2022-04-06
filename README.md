# Discord Dice Rolling Bot

## Really Simple. Really Basic. Does the job.

This is just a dumb bot I threw together in about a day because I was bored and angry that the bot that my D&D group uses also includes a stupid level up feature. I hate bots with "level up" features and by the way if you are a bot developer who adds this, I personally hate you.

# Hosting this bot

To host this bot, you need...

- A publicly exposed linux or windows server (such as one provided by [Vultr](https://www.vultr.com/) or [DigitalOcean](https://www.digitalocean.com/)).
- A [Discord Application](https://discordapp.com/developers/applications/me)
- A [Proficient or higher level of Reading Comprehension](https://comprehensibleclassroom.com/2018/08/19/how-to-grade-reading-comprehension/)

To start, you need to create a Discord Application. Go to [Discord Applications](https://discordapp.com/developers/applications/me) and create a new application. Create a bot user, with Server Members Intent and Message Content Intent. Note down it's token. Additionally, note down it's Application ID under General Information.

Next, Goto [Discord Permissions Calculator](https://discordapi.com/permissions.html#274877910016) and put your Application ID under "Client ID". **YOU MUST PUT `applications.commands bot` IN SCOPE. IF YOU FORGOT TO DO THIS, YOU WILL NEED TO REINVITE YOUR BOT TO YOUR SERVER.** Click the link that it generates for you.

Now that you have told Discord about your bot, you can move on to hosting it. I'll assume you are hosting this on a Linux server, but you can host it on Windows as well. I wont provide Windows instructions however. Just set up a php webserver and nodejs.

Start by installing NodeJS and NPM.

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
nvm install v17.0.1
```

You need to host a webserver with PHP support. I recommend following the instructions [here](https://www.rosehosting.com/blog/how-to-install-php-7-4-with-nginx-on-ubuntu-20-04/) to install Nginx and PHP. However, keep in mind you also need the gd library, so before you configure ngix, make sure you have it installed.

```bash
sudo apt-get install php7.4-fpm php7.4-cli php7.4-common php7.4-gd php7.4-mysql php7.4-xml php7.4-mbstring php7.4-zip -y
```

Now clone the repository into your server.

```bash
git clone https://github.com/shigbeard/discord-dice-bot.git
cd discord-dice-bot
```

Copy the web files to your server.

```bash
cp -r webstuff/* /var/www/html/
```

You still need to find a font file. I use Impact personally, but due to licensing issues, I cannot host that font. Find your own .ttf font file, and put it in `/var/www/html/`. You can find a list of fonts [here](https://www.google.com/fonts/).

Next, install the dependencies and setup the bot's config.

```bash
npm install
npm run setup
```

You'll be asked to insert your Application ID and Token, desired prefix, and a URL. The URL should point to the `numbers.php` file in your nginx setup. So, for instance, `https://example.com/numbers.php`. Make sure it can be accessed by anybody.

Finally, you can start the bot.

```bash
npm start
```

# Word to the wise

If you actually needed most of those instructions, this bot is probably not for you. I rushed this, and ideally I wouldn't run the image processing in a PHP script but Discord wont let me inject images into thumbnails without a url to them.

There's also zero error checking so have fun with that.