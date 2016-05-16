(function() {
    'use strict';

    var mongoose = require('mongoose'),
        Schema = mongoose.Schema;

    var measurementSchema = new Schema({
        date_added: { type: Date, default: Date.now },
        name: String,
        value: Number,
        step: Number,
        epoch: { type: Number, default: 0 }
    });

    var modelSchema = new Schema({
        date_added: { type: Date, default: Date.now },
        hyperparameter: String,
        name: String,
        description: String,
        measurements: [measurementSchema]
    });

    var experimentSchema = new Schema({
        date_added: { type: Date, default: Date.now },
        name: String,
        description: String,
        models: [modelSchema]
    });

    var Experiment = exports.Experiment = mongoose.model('Experiment', experimentSchema);
})();
