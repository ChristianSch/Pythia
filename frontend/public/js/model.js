(function() {
    'use strict';

    var socket = io();

    Vue.config.delimiters = ['${', '}'];

    var chartComp = Vue.extend({
        template: '<canvas id="${ key }-chart" class="measurement-chart" data-measurement-type="${ key }" width="400" height="361"></canvas>',
        props: ['key', 'data'],
        ready: function() {
            buildChart(this.$el, this.key, this.data);
            /*
            var chart = new Chart(this.$el, {
                'type': 'line',
                'data': {
                    'labels': Array.apply(null, {
                            length: this.data.length
                        }).map(Number.call, Number),
                    'datasets': [{
                        label: this.key,
                        data: this.data,
                        fill: false,
                        borderCapStyle: 'butt',
                        backgroundColor: "rgba(75,192,192,1)",
                        borderDashOffset: 0.0,
                        borderJoinStyle: 'miter',
                        pointRadius: 1,
                        pointBorderColor: "rgba(75,192,192,1)",
                        pointBorderWidth: 1,
                        pointBackgroundColor: "#fff"
                    }]
                }
            });
            */
        }
    });

    Vue.component('canvas-chart', chartComp);

    var expId = document.body.getAttribute('data-experiment-id'),
        modelId = document.body.getAttribute('data-model-id');

    function _sortByKey(model) {
        var kv = {};
        kv._keys = [];

        for (var i = 0; i < model.measurements.length; i++) {
            var m = model.measurements[i];

            kv = _updateMeasurements(kv, m);
        }

        return kv;
    }

    function _updateMeasurements(kv, data) {
        if (kv._keys.indexOf(data.name) === -1) {
            kv._keys.push(data.name);
            kv[data.name] = [data.value];
        } else {
            kv[data.name].push(data.value);
        }

        return kv;
    }

    function buildChart(el, key, data) {
        console.log(el);
        var chart = new Chart(el, {
            'type': 'line',
            'data': {
                'labels': Array.apply(null, {
                        length: data.length
                    }).map(Number.call, Number),
                'datasets': [{
                    label: key,
                    data: data,
                    fill: false,
                    borderCapStyle: 'butt',
                    backgroundColor: "rgba(0,0,0,1)",
                    borderDashOffset: 0.0,
                    borderJoinStyle: 'miter',
                    pointRadius: 1,
                    pointBorderColor: "rgba(0,0,0,1)",
                    pointBorderWidth: 2,
                    pointBackgroundColor: "#fff"
                }]
            }
        });
    }

    var vm = new Vue({
        el: '#vue-instance',
        data: {
            model: null,
            sortedMeasurements: {}
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
                this.sortedMeasurements = _sortByKey(this.model);
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

                buildChart(document.getElementById(data.name + '-chart'),
                           data.name,
                           data.data);
            }.bind(this));
        }
    });
})();
