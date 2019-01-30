const Helpers = require('../helpers');
const Mixer = require('@mixer/client-node');
const Interactive = require('@mixer/interactive-node');

const client = new Mixer.Client(new Mixer.DefaultRequestRunner());
const helpMessage = `Команды: !stat !gus`;

// main chat engine
module.exports = {
    _socket: null,
    _name: 'ChatBot',
    _userId: null, 
    _channelId: null, 
    _endpoints: null, 
    _authkey: null,
    _game: null,

    init: function(sc, userId, channelId, endpoints, authkey, name) {       

        // let ws = require('ws');
        // Interactive.setWebSocket(ws);
        // this._game = new Interactive.GameClient();
        // this._game.on('open', () => {
        //     console.log('Connected to Interactive!');
        // });
        // this._game.open(Helpers.getGameNodeConnection());

        this._socket = sc;   
        this._userId = userId;
        this._channelId = channelId;
        this._endpoints = endpoints;
        this._authkey = authkey;

        if (name) {
            this._name = name;
        }
    },

    getStatic: function() {
        var self = this;
        client.request('GET', `channels/${this._channelId}`)
            .then(res => {
                const viewers = res.body.viewersCurrent;
                self.sendMessage(`${viewers} человек смотрит как @Korhog позорится. Уже набрал ${res.body.user.sparks} искр`);
                console.log(`You have ${viewers} total viewers...`);
        });
    },

    getMessage: function(data) {
        var message = data.message.message[0].data;
        var command = Helpers.getCommand(message);
        if (command) {
            switch (command) {
                case '!stat': 
                    this.getStatic();
                    break;
                case '!dummy': 
                    this.dummy();
                    break;
                case '!help': 
                    this.sendMessage(helpMessage);
                    break;
                default: 
                    this.sendMessage(`Команда не найдена`);
            }            
            return;
        }  
        
        if (data.user_roles.includes("Owner")) {
            // не обрабатываем сообщенич
            return;
        }       
        

        if (message.toLowerCase().includes('где') && message.endsWith('?')) {
            var v = parseInt(Math.random() * 3);
            switch(v)
            {
                case 1: this.sendMessage(`@${data.user_name} у тебя за щекой`); break;
                case 2: this.sendMessage(`@${data.user_name} за щекой проверяй`);  break;
                default: this.sendMessage(`@${data.user_name} отправил тебе за щеку`);
            } 
            return;       
        }
    },

    // send message to chat
    sendMessage: function(message) {
        this._socket.call('msg', [` [ ${this._name} ] ${message}`]); 
    },   

    dummy: function() {
        client.request('GET', `achievements`).then(res => {
                const viewers = res.body;
        });
    },

    gus: function() {
        var text = `
        ЗАПУСКАЕМ 
        ░ГУСЯ░▄▀▀▀▄░РАБОТЯГИ░░ 
        ▄███▀░◐░░░▌░░░░░░░ 
        ░░░░▌░░░░░▐░░░░░░░ 
        ░░░░▐░░░░░▐░░░░░░░ 
        ░░░░▌░░░░░▐▄▄░░░░░ 
        ░░░░▌░░░░▄▀▒▒▀▀▀▀▄ 
        ░░░▐░░░░▐▒▒▒▒▒▒▒▒▀▀▄ 
        ░░░▐░░░░▐▄▒▒▒▒▒▒▒▒▒▒▀▄ 
        ░░░░▀▄░░░░▀▄▒▒▒▒▒▒▒▒▒▒▀▄ 
        ░░░░░░▀▄▄▄▄▄█▄▄▄▄▄▄▄▄▄▄▄▀▄ 
        ░░░░░░░░░░░▌▌░▌▌░░░░░ 
        ░░░░░░░░░░░▌▌░▌▌░░░░░ 
        ░░░░░░░░░▄▄▌▌▄▌▌░░░░░
        `;
    }
}