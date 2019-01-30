const oAuth = 'YqasEfNeP9VNq75cgJ1kVu8D4iENSBb5OI6cn09ybgd0y9hTGyO6UYfUjZOqwfza';

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
    },

    getGameNodeConnection: function() {
        return {
            authToken: oAuth,
            versionId: 324174,
        };        
    },

    // Get connection token
    getToken: function() {
        return {
            access: oAuth,
            expires: Date.now() + (365 * 24 * 60 * 60 * 1000)
        }        
    }
}
