(function() {
    'use strict';

    var socket = io();

    var vm = new Vue({
        el: '#vue-instance',
        data: {
            experiments: []
        },
        created: function() {
            socket.on('experiments-updated', function(data) {
                for (var i = 0; i < data.length; i++) {
                    this.experiments.unshift(data[i]);
                }
            }.bind(this));
        }
    });
})();
