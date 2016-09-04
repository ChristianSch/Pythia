(function() {
    'use strict';

    var socket = io(),
        request = window.superagent;

    Vue.config.delimiters = ['${', '}'];

    var emptyExp = {};
    var expId = document.body.getAttribute('data-experiment-id');

    emptyExp.name = 'Loading';
    emptyExp.date = 'Loading';
    emptyExp.models = [];
    emptyExp.description = 'Loading';

    function _deleteModel(model_id) {
        request
            .del('/api/v1/experiment/' + expId + '/model/' + model_id)
            .end(function(res) {
                console.log(res);
            });
    }

    var vm = new Vue({
        el: '#vue-instance',
        data: {
            experiment: null
        },
        methods: {
            deleteModel: _deleteModel
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

            socket.on('model-removed', function(data) {
                if (data.experiment_id == expId) {
                    for (var i = 0; i < this.experiment.models.length; i++) {
                        if (this.experiment.models[i]._id == data._id) {
                            this.experiment.models.$remove(this.experiment.models[i]);
                        }
                    }
                }
            }.bind(this));
        }
    });
})();
