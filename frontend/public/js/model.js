(function() {
    'use strict';

    var socket = io();

    Vue.config.delimiters = ['${', '}'];

    var expId = document.body.getAttribute('data-experiment-id'),
        modelId = document.body.getAttribute('data-model-id');

    var vm = new Vue({
        el: '#vue-instance',
        data: {
            model: null
        },
        created: function() {
            this.model = {};

            socket.emit('fetch-model', {
                'experiment_id': expId,
                'model_id': modelId
            });

            socket.on('fetch-model-result', function(data) {
                console.log(data);
                this.model = data;
            }.bind(this));

            socket.on('model-udpate', function(data) {
                if (data._id == modelId) {
                    this.model = data;
                }
            }.bind(this));

            socket.on('measurement-added', function(data) {
                console.log(data);
                if (data.experiment_id == expId && data.model_id == modelId) {
                    self.sortedMeasurements = _updateMeasurements(this.sortedMeasurements, data.data);
                }
            });
        }
    });
})();
