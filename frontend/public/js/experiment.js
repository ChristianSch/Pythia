(function() {
    'use strict';

    var socket = io();

    Vue.config.delimiters = ['${', '}'];

    var emptyExp = {};
    var expId = document.body.getAttribute('data-experiment-id');

    emptyExp.name = 'Loading';
    emptyExp.date = 'Loading';
    emptyExp.models = [];
    emptyExp.description = 'Loading';

    var vm = new Vue({
        el: '#vue-instance',
        data: {
            experiment: null
        },
        created: function() {
            this.experiment = emptyExp;

            socket.emit('fetch-experiment', expId);
            socket.on('fetch-experiment-result', function(data) {
                this.experiment = data;
            }.bind(this));

            socket.on('experiment-udpate', function(data) {
                if (data._id == expId) {
                    this.experiment = data;
                }
            });
        }
    });
})();
