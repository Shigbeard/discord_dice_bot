const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

rl.question('What is your bot\'s token? ', function (token) {
    rl.question('What is your bot\'s application ID? ', function (applicationid) {
        rl.question('What prefix do you want on the bot?', function (prefix) {
            rl.question('Please enter the URL where we can access numbers.php: ', function (url) {
                // create a .env file with these settings
                fs.writeFileSync('.env', `TOKEN=${token}\nAPPLICATION_ID=${applicationid}\nPREFIX=${prefix}\nIMAGE_HOST=${url}`);
                rl.close()
            })
        })
    })
})

rl.on('close', function () {
    console.log('terminated');
    process.exit(0);
});
