const express = require('express')
const espressWs = require('express-ws')
const { WebSocketServer } = require('ws')
const path = require('path');
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser');



function main() {
    const app = express();
    espressWs(app);
    const wsServer = new WebSocketServer({ server: app});
    const sockets = new Set();
    const userMap = new Map([
        [1234, {
            id : 1234,
            email : 'john.doe@test.com',
            name: 'John Doe',
        }]
    ])

    app.use(cookieParser())
    app.use(express.static(path.join(__dirname, 'public')));

    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, 'index.html'));
    });


    app.ws('/ws', (ws, res) => {
        sockets.add(ws);
        ws.on('message', (msg) => {
            console.log(msg);
           sockets.forEach((socket) => {
            if (socket !== ws) {
            socket.send(msg);
            }
           })
        })
        ws.on('close', () => {
            sockets.delete(ws);
        })
    });

    app.post('/login', bodyParser.urlencoded(), (req, res) => {
        const email = req.body.email;
        const user = Array.from(userMap.values()).find((user) => user.email == email);
        if(!user) {
            res.status(401).send('invalid email');
            return;
        }
        res.cookie('ssid', user.id);
        res.send('Logged in');
    })

    app.listen(3000,() => {
        console.log('exemple app listening on port 3000!');
    });
}

main()