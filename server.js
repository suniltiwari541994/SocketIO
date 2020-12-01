const http = require('http').createServer();
const io = require('socket.io')(http);
const repl = require('repl')
const chalk = require('chalk');

const port = 3000;
let liveQuestion = "";
let users = [];
//let QuestionAnswerList = []
let totalScore = 0;
let userResponseCount=0;



io.on('connection', (socket) => {

    socket.on('message', (evt) => {

        if (users.indexOf(evt.username) === -1) {
            users.push(evt.username)
        }
        //  console.log("evt.CMD >>", evt.cmd)
        let checkAnswer = (liveQuestion == evt.cmd ? true : false)


        if (evt.time == 0) { //if user did not select any option within a time

            totalScore = totalScore;
            liveQuestion = "";//reset
            userResponseCount=userResponseCount+1 //add user does not response count

            if(userResponseCount>=3)
            {
                eliminate()
            }
            console.log("\n\nUser Input  >>>>>>>>>>>>>>>", chalk.green(evt.cmd)) //inform at server end
        }
        else if (evt.cmd.trim() !== "" && liveQuestion != "") {

            let score = checkAnswer ? 1 : evt.cmd == "" ? 0 : -1;
            totalScore = totalScore + score; //update score

            liveQuestion = "";//reset

            userResponseCount=0 //reset user does not response count

            if (totalScore > 10) {
                sendCongratulation()
            } else if (totalScore <= -3) {
                sendFailMessage()
            }
            console.log("\n\nUser Input  >>>>>>>>>>>>>>>", chalk.green(evt.cmd)) //inform at server end
        }
    })
})


io.on('disconnect', (evt) => {
    console.log('disconnected')
})


repl.start({
    prompt: '',
    eval: (cmd) => {
        liveQuestion = cmd; //store q send from server
        var seconds = new Date().setMilliseconds(15000); //send time with buffer 15seconds
        console.log("\n\nYour Input  >>>>>>>>>>>>>>>", chalk.red(cmd))
        io.send({ cmd, score: totalScore, time: seconds })
    }
})

sendCongratulation = (marks) => {
    totalScore = 0;
    io.emit('message', { cmd: "CONGRATULATIONS! Wow! you've passed your test ", status: 1 });
}

sendFailMessage = () => {
    totalScore = 0;
    io.emit('message', { cmd: "Ops you could  not clear your test", status: 0 });
}

eliminate=()=>{
    totalScore = 0;
    io.emit('message', { cmd: "Ops you are eliminated from test", status: 0 });
}


http.listen(port, () => console.log(`server listening on port: ${port}`))