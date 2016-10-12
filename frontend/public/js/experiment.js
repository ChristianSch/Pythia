(function() {
    'use strict';

    var socket = io(),
        request = window.superagent;

    Vue.config.delimiters = ['${', '}'];

    Vue.component('exp-table-metricrow', {
        template: '<table class="table"><tr v-for="m in measurements._keys">\
            <td>${m}</td>\
            <template v-if="measurements[m].length == 1">\
                <td title="${ measurements[m][0] }">\
                    ${ measurements[m][0] | truncate "6" }</td>\
                <td>&mdash;</td><td>&mdash;</td><td>&mdash;</td>\
            </template>\
            <template v-else>\
            <td>&mdash;</td>\
            <td title="${measurements[m] | avg }">\
                ${ measurements[m] | avg | truncate "6" }</td>\
            <td title="${measurements[m] | min }">\
                ${ measurements[m] | min | truncate "6" }</td>\
            <td title="${ measurements[m] | max }">\
                ${ measurements[m] | max | truncate "6" }</td>\
            </template></tr></table>',
        props: ['measurements']
    });

    var emptyExp = {};
    var expId = document.body.getAttribute('data-experiment-id');

    emptyExp.name = 'Loading';
    emptyExp.date = 'Loading';
    emptyExp.models = [];
    emptyExp.description = 'Loading';

    Vue.filter('avg', function(arr) {
        var acc = 0;

        if (arr === undefined || !arr) {
            return 0;
        }

        console.log('avg called:', arr);

        for (var i = 0; i < arr.length; i++) {
            acc += arr[i];
        }

        return (acc / arr.length);
    });

    Vue.filter('max', function(arr) {
        var max = null;

        if (arr === undefined || !arr) {
            return 0;
        }

        for (var i = 0; i < arr.length; i++) {
            if (max === null) {
                max = arr[i];
            } else if (max < arr[i]) {
                max = arr[i];
            }
        }

        return max || 0;
    });

    Vue.filter('min', function(arr) {
        var min = null;

        if (arr === undefined || !arr) {
            return 0;
        }

        for (var i = 0; i < arr.length; i++) {
            if (min === null) {
                min = arr[i];
            } else if (min > arr[i]) {
                min = arr[i];
            }
        }

        return min || 0;
    });

    Vue.filter('truncate', function(str, value) {
        var s = new String(str);

        if (s.length <= value) {
            return s;
        }

        return (new String(s)).substring(0, value) + '…';
    });

    function _deleteModel(model_id) {
        request
            .del('/api/v1/experiment/' + expId + '/model/' + model_id)
            .end(function(res) {
                // TODO: do something
                console.log(res);
            });
    }

    function _sortByKey(model) {
        var kv = {};
        kv._keys = [];

        if (model.measurements === undefined) {
            model.measurements = [];
        }

        for (var i = 0; i < model.measurements.length; i++) {
            var m = model.measurements[i];

            kv = _updateMeasurements(kv, m);
        }

        return kv;
    }

    function _updateMeasurements(kv, data) {
        if (kv === undefined || kv._keys === undefined) {
            return _sortByKey(data);
        }

        if (kv._keys.indexOf(data.name) === -1) {
            kv._keys.push(data.name);
            kv[data.name] = [data.value];
        } else {
            kv[data.name].push(data.value);
        }

        return kv;
    }

    var vm = new Vue({
        el: '#vue-instance',
        data: {
            experiment: {'models':[]},
            columns: ['name', 'description', 'metric', 'value', 'avg', 'min', 'max']
        },
        methods: {
            deleteModel: _deleteModel,
            sortBy: function (key) {
                this.sortKey = key
                this.sortOrders[key] = this.sortOrders[key] * -1
            },
            modelKeys: function(model) {
                return model.sortedMeasurements._keys;
            }
        },
        created: function() {
            this.experiment = emptyExp;

            socket.emit('fetch-experiment', expId);
            socket.on('fetch-experiment-result', function(data) {
                Vue.set(this, 'experiment', data)

                for (var i = 0; i < this.experiment.models.length; i++) {
                    Vue.set(this.experiment.models[i],
                        'sortedMeasurements',
                        _sortByKey(this.experiment.models[i]));
                    Vue.set(this.experiment.models[i], 'metrics',
                        this.experiment.models[i].sortedMeasurements._keys);
                }
            }.bind(this));

            socket.on('experiment-udpate', function(data) {
                if (data._id == expId) {
                    for (var i = 0; i < thix.experiment.models.length; i++) {
                        var sortedMeasurements = _sortByKey(this.experiment.models[i]);

                        Vue.set(this.experiment.models[i],
                                'sortedMeasurements',
                                sortedMeasurements);
                        Vue.set(this.experiment.models[i], 'metrics',
                                sortedMeasurements._keys);
                    }
                }
            });

            socket.on('model-added', function(data) {
                if (data.experiment_id == expId) {
                    this.experiment.models.push(data.data);
                }
            }.bind(this));

            socket.on('model-updated', function(data) {
                console.log('model-updated')
                if (data.experiment_id == expId) {
                    for (var i = 0; i < this.experiment.models.length; i++) {
                        if (this.experiment.models[i]._id == data._id) {
                            for (var key in data.data) {
                                if (data.data.hasOwnProperty(key)) {
                                    Vue.set(this.experiment.models[i],
                                            key,
                                            data.data[key]);
                                }
                            }
                            var sortedMeasurements = _sortByKey(this.experiment.models[i]);

                            Vue.set(this.experiment.models[i],
                                    'sortedMeasurements',
                                    sortedMeasurements);
                            Vue.set(this.experiment.models[i], 'metrics',
                                    sortedMeasurements._keys);

                            return;
                        }
                    }
                }
            }.bind(this));

            socket.on('model-removed', function(data) {
                if (data.experiment_id == expId) {
                    for (var i = 0; i < this.experiment.models.length; i++) {
                        if (this.experiment.models[i]._id == data._id) {
                            this.experiment.models.$remove(this.experiment.models[i]);
                        }
                    }
                }
            }.bind(this));

            socket.on('measurement-added', function(data) {
                if (data.experiment_id == expId) {
                    for (var i = 0; i < this.experiment.models.length; i++) {
                        if (this.experiment.models[i]._id == data.model_id) {
                            Vue.set(this.experiment.models[i],
                                'sortedMeasurements',
                                _updateMeasurements(this.experiment.models[i].sortedMeasurements,
                                                    data.data));
                        }
                    }
                }
            }.bind(this));
        }
    });
})();
