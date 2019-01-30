const Helpers = require('../helpers');
const Https = require('https');

const Mixer = require('@mixer/client-node');
const client = new Mixer.Client(new Mixer.DefaultRequestRunner());


// main chat engine
module.exports = {
    _socket: null,
    _name: 'ChatBot',
    _userId: null, 
    _channelId: null, 
    _endpoints: null, 
    _authkey: null,

    init: function(sc, userId, channelId, endpoints, authkey, name) {

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
            const viewers = res.body.viewersTotal;
            console.log(`You have ${viewers} total viewers...`);
        });
    },

    getMessage: function(data) {
        var message = data.message.message[0].data;
        var command = Helpers.getCommand(message);
        if (command) {
            switch (command) {
                case '!stat': this.getStatic();break;

                default: this.sendMessage(`Команда не найдена`);
            }            
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



    


}