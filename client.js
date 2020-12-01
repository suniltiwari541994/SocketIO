var socket = require('socket.io-client')('http://localhost:3000');
const repl = require('repl')
const chalk = require('chalk');
var username = "sunil"
let x;
let time;

socket.on('connect', () => {
    console.log(chalk.green('=== Connected ==='))
    
})

socket.on('disconnect', function () {
    socket.emit('disconnect1')
});

socket.on('message', (data) => {

    const { cmd, status } = data

    if (typeof status !== 'undefined') { //condition will call at result time only
        if (status == 1) {
            console.log(chalk.whiteBright(`\n\n${cmd}`))
        } else {
            console.log(chalk.red(`\n\n${cmd}`))
        }
    }
    else {
        //console.clear()
        console.log(`\n\n\nQ.${cmd}   /   Your Score : ${data.score} `);
        x = setInterval(() => {
            let now = new Date().getTime();
            var distance = data.time - now;

            // Time calculations for seconds
            time = Math.floor((distance % (1000 * 60)) / 1000);
            if (time <= 0) {
                clearInterval(x);
                console.log(chalk.green('\n\n================== Your Input submited  =================='))
                socket.emit('message', { cmd: "", username, time });
            } else {
                process.stdout.write(`\rRemaining Time : ${time}  ${chalk.green('Please press ENTER first then type your input as above')}`)
            }
        }, 1000)
    }
})



repl.start({
    prompt: '',
    eval: (cmd) => {
        clearInterval(x);
        socket.send({ cmd, username,time })
    }
})