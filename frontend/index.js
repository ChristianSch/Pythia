module.exports = function(io) {
    'use strict';

    /**
     * Author: Christian Schulze
     * License: MIT
     * Date: 2016/05/10
     *
     * Main entry point for the Pythia frontend.
     */

    var express = require('express'),
        nunjucks = require('nunjucks'),
        path = require('path'),
        app = module.exports = express();

    var Experiment = require(path.join(__dirname, '..', '/models/Experiment')).Experiment;

    // Template config
    nunjucks.configure('frontend/views', {
        autoescape: true,
        express: app
    });

    io.on('connection', function(socket) {
        // Send all the experiments
        Experiment.find({}).sort('-date-created').exec(function(err, docs) {
            if (!err) {
                socket.emit('experiments-updated', docs);
            } else {
                console.log(err);
            }
        });

        socket.on('fetch-experiment', function(id) {
            Experiment.findOne({
                '_id': id
            }, function(err, doc) {
                socket.emit('fetch-experiment-result', doc);
            });
        });
    });

    /* Static files middleware */
    app.use(express.static(path.join(__dirname, 'public/')));

    app.get('/', function(req, res) {
        res.render('index.html');
    });

    app.get('/experiment/:expId', function(req, res) {
        res.render('experiment.html', {
            'experiment_id': req.params.expId
        });
    });

    return app;
};
