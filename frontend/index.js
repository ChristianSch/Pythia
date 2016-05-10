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
        path = require('path'),
        app = module.exports = express();

    var Experiment = require(path.join(__dirname, '..', '/models/Experiment')).Experiment;

    io.on('connection', function(socket) {
        // Send all the experiments
        Experiment.find({}).sort('-date-created').exec(function(err, docs) {
            if (!err) {
                socket.emit('experiments-updated', docs);
            } else {
                console.log(err);
            }
        });
    });

    /* Static files middleware */
    app.use(express.static(path.join(__dirname, 'public/')));

    app.get('/', function(req, res) {
        res.sendFile(path.join(__dirname, 'views/index.html'));
        /*
        res.status = 200;
        res.send("Hello, Apollo.");
        */
    });

    return app;
};
