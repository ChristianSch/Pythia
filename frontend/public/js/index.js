(function() {
    'use strict';

    var socket = io(),
        request = window.superagent;

    Vue.config.delimiters = ['${', '}'];

    function _deleteExperiment(expId) {
        request
            .del('/api/v1/experiment/' + expId)
            .end(function(res) {
                console.log(res);
            });
    }

    var vm = new Vue({
        el: '#vue-instance',
        data: {
            experiments: [],
            experimentColumns: ['date_added', 'name']
        },
        methods: {
            deleteExperiment: _deleteExperiment
        },
        created: function() {
            socket.on('experiment-removed', function(data) {
                for (var i = 0; i < this.experiments.length; i++) {
                    if (this.experiments[i]._id === data._id) {
                        this.experiments.$remove(this.experiments[i]);
                        return;
                    }
                }
            }.bind(this));

            socket.on('experiment-updated', function(data) {
                for (var i = 0; i < this.experiments.length; i ++) {
                    if (this.experiments[i]._id == data._id) {
                        for (var key in data.data) {
                            if (data.data.hasOwnProperty(key)) {
                                Vue.set(this.experiments[i],
                                        key,
                                        data.data[key]);
                            }
                        }
                    }
                }
            }.bind(this));

            socket.on('experiment-added', function(data) {
                this.experiments.unshift(data.data);
            }.bind(this));

            socket.on('model-added', function(data) {
                for (var i = 0; i < this.experiments.length; i ++) {
                    if (this.experiments[i]._id == data.experiment_id) {
                        console.log(this.experiments[i]);
                        this.experiments[i].models.push(data.data);
                    }
                }
            }.bind(this));

            socket.on('model-removed', function(data) {
                for (var i = 0; i < this.experiments.length; i++) {
                    if (this.experiments[i]._id == data.experiment_id) {
                        for (var j = 0; j < this.experiments[i].models.length; j++) {
                            if (this.experiments[i].models[j]._id == data._id) {
                                this.experiments[i].models.$remove(
                                    this.experiments[i].models[j]
                                );
                            }
                        }
                    }
                }
            }.bind(this));
        }
    });
})();
