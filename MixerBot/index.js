const https = require('https');
const Mixer = require('@mixer/client-node');
const ws = require('ws');
const Data = {
    game: "None"
}

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
        console.log(response.body);
        // Store the logged in user's details for later reference
        userInfo = response.body;
        // Returns a promise that resolves with our chat connection details.
        return new Mixer.ChatService(client).join(response.body.channel.id);
    })
    .then(response => {
        const body = response.body;
        console.log(body);
        return createChatSocket(userInfo.id, userInfo.channel.id, body.endpoints, body.authkey);
    })
    .catch(error => {
        console.error('Something went wrong.');
        console.error(error);
    });

// делаем соккет
function createChatSocket (userId, channelId, endpoints, authkey) {
    const socket = new Mixer.Socket(ws, endpoints).boot();

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
    socket.on('ChatMessage', data => {        
        ParseMessage(socket, data);
    });

    socket.on('UserJoin', data => {
        socket.call('msg', [`[CBT] Hello @${data.username}! I'm ChatBot. Send !help for more info`]);  
    });

    // Listen for socket errors. You will need to handle these here.
    socket.on('error', error => {
        console.error('Socket error');
        console.error(error);
    });
}

function ParseMessage(sc, data) {
    var text = data.message.message[0].data;
    if (text.toLowerCase().startsWith('!ping')) {
        sc.call('msg', [`[CBT] Massage parsed @${data.user_name} send ${text}`]);
        console.log(`Ponged ${data.user_name}`);
        return;
    }

    // Троленк
    if (text.toLowerCase().includes('нет')){
        sc.call('msg', [`[CBT] @${data.user_name} пидора ответ `]); 
        return;
    }    
    
    if (text.toLowerCase().includes('где') && text.endsWith('?')) {
        var v = parseInt(Math.random() * 2 + 1);
        switch(v)
        {
            case 1: sc.call('msg', [`[CBT] @${data.user_name} у тебя за щекой`]); break;
            case 2: sc.call('msg', [`[CBT] @${data.user_name} за щекой проверяй`]);  break;
            case 3: sc.call('msg', [`[CBT] @${data.user_name} отправил тебе за щеку`]);  break;
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

function ShowInfo(sc, data) {
    sc.call('msg', [`[CBT] Commands: !game, !stat`]);
}

function ShowStat(sc, data) {
    https.get('https://mixer.com/api/v2/chats/637843/users', resp => {
        let data = '';
        resp.on('data', chunk => data += chunk);
        resp.on('end', () =>{
            var users = JSON.parse(data); 
            sc.call('msg', [`[CBT] ${users.length} пользователей смотрят как @Korhog позорится`]);           
            console.log(data);
        });
    });
}

function SetGame(sc, data) {
    if(data.user_roles.includes("Owner")) {
        var name = data.message.message[0].data.substr(5).trim();
        if (name) {
            console.log(name);  
            Data.game = name;
            console.log(Data.game);
            sc.call('msg', [`[CBT] current game: ${Data.game}`]);    
            return;
        }   
    }
    sc.call('msg', [`[CBT] current game: ${Data.game}`]);   
}


