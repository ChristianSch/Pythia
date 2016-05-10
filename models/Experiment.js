(function() {
    'use strict';

    var mongoose = require('mongoose'),
        Schema = mongoose.Schema;

    var metricSchema = new Schema({
        date_added: { type: Date, default: Date.now },
        name: String,
        value: Number
    });

    var modelSchema = new Schema({
        date_added: { type: Date, default: Date.now },
        parameter: String,
        hyperparameter: String,
        name: String,
        description: String,
        metrics: [metricSchema]
    });

    var experimentSchema = new Schema({
        date_added: { type: Date, default: Date.now },
        date_updated: Date,
        name: String,
        description: String,
        iterations: [modelSchema]
    });

    var Experiment = exports.Experiment = mongoose.model('Experiment', experimentSchema);
})();
