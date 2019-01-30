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
    tokens: {
        access: 'YqasEfNeP9VNq75cgJ1kVu8D4iENSBb5OI6cn09ybgd0y9hTGyO6UYfUjZOqwfza',
        expires: Date.now() + (365 * 24 * 60 * 60 * 1000)
    },
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
    Data.channelId = channelId;

    Engine.init(socket, userId, channelId, endpoints, authkey);

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

function ParseMessage(sc, data) {
    if (data.message.meta.is_skill) {
        var skill = data.message.meta.skill; 
        sc.call('msg', [`[CBT] Mmmm ${skill.cost} sparks from @${data.user_name}!<br/> Swe-e-et!`]);
        return;
    }


    var text = data.message.message[0].data;
    if (text.toLowerCase().startsWith('!ping')) {
        Engine.sendMessage(`@${data.user_name} send ${text}`);
        return;
    }

    // Троленк
    if (text.toLowerCase().includes('нет')){
        sc.call('msg', [`[CBT] @${data.user_name} пидора ответ `]); 
        return;
    }    
    
    if (text.toLowerCase().includes('где') && text.endsWith('?')) {
        var v = parseInt(Math.random() * 3);
        switch(v)
        {
            case 1: sc.call('msg', [`[CBT] @${data.user_name} у тебя за щекой`]); break;
            case 2: sc.call('msg', [`[CBT] @${data.user_name} за щекой проверяй`]);  break;
            default: sc.call('msg', [`[CBT] @${data.user_name} отправил тебе за щеку`]);
        } 
        return;       
    }

    if (text.toLowerCase().startsWith('!help')) {
        ShowInfo(sc, data);
        return;
    }

    if (text.toLowerCase().startsWith('!stat')) {
        ShowStat(sc, data);
        return;
    }

    if (text.toLowerCase().startsWith('!game')) {
        SetGame(sc, data);
        return;
    }
}

function UserJoin(sc, data) {
    if (data.roles.includes("Owner")) {
        Engine.sendMessage(`Все приветствуем повелителя чата @${data.username}!`);
        return;
    }
    
    Engine.sendMessage(`Привет, @${data.username}! жмакни !help что б узнать, всякое разное`);    
}


