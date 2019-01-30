module.exports = { 
       
    sendMessage: function(sc, message) {
        sc.call('msg', [`[ Korhog's bot ] ${message}`]); 
    },

    getCommand(message) {
        var matches = /\!\w+/.exec(message);
        if (matches) {
            if (matches.length == 0) return null;
            return matches[0]; 
        }

        return null;              
    }
}
