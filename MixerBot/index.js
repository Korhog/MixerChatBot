const https = require('https');
const Helpers = require('./helpers');
const Engine = require('./engine/engine');

const Mixer = require('@mixer/client-node');
const ws = require('ws');
const Data = {
    channelId: null,
    game: null
}

const botName = 'ChatBot';

let userInfo;

const client = new Mixer.Client(new Mixer.DefaultRequestRunner());
client.use(new Mixer.OAuthProvider(client, {
    tokens: Helpers.getToken(),
}));

client.request('GET', 'users/current')
    .then(response => {
        userInfo = response.body;
        return new Mixer.ChatService(client).join(response.body.channel.id);
    })
    .then(response => {
        const body = response.body;
        return createChatSocket(userInfo.id, userInfo.channel.id, body.endpoints, body.authkey);
    })
    .catch(error => {
        console.error('Something went wrong.');
        console.error(error);
    });

// делаем соккет
function createChatSocket (userId, channelId, endpoints, authkey) {
    
    const socket = new Mixer.Socket(ws, endpoints).boot();
    Engine.init(socket, userId, channelId, endpoints, authkey);    
    Data.channelId = channelId;    

    socket.auth(channelId, userId, authkey)
        .then(() => {
            console.log('You are now authenticated!');
            return socket.call('msg', ['[CBT] Hello!']);
        })
        .catch(error => {
            console.error('Oh no! An error occurred.');
            console.error(error);
        });

    // Listen for chat messages. Note you will also receive your own!
    socket.on('ChatMessage', data => Engine.getMessage(data));

    socket.on('UserJoin', data =>{ 
        UserJoin(socket, data);
    });    

    // Listen for socket errors. You will need to handle these here.
    socket.on('error', error => {
        console.error('Socket error');
        console.error(error);
    });
}

function UserJoin(sc, data) {
    if (data.roles.includes("Owner")) {
        Engine.sendMessage(`Все приветствуем повелителя чата @${data.username}!`);
        return;
    }
    
    Engine.sendMessage(`Привет, @${data.username}! жмакни !help что б узнать, всякое разное`);    
}


