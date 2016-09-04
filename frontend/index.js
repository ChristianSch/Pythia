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
        Experiment.find({}).sort('date_added').exec(function(err, docs) {
            if (!err) {
                //  we use experiment-added to populate the experiment
                // list initially. quite hacky.
                for (var i = 0; i < docs.length; i ++) {
                    socket.emit('experiment-added', {
                        'data': docs[i],
                        '_id': docs[i]._id
                    });
                }
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

        socket.on('fetch-model', function(data) {
            Experiment.findOne({
                '_id': data.experiment_id
            }, function(err, doc) {
                for (var i = 0; i < doc.models.length; i++) {
                    if (doc.models[i]._id == data.model_id) {
                        socket.emit('fetch-model-result', doc.models[i]);
                    }
                }
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

    app.get('/experiment/:expId/model/:mId', function(req, res) {
        res.render('model.html', {
            'experiment_id': req.params.expId,
            'model_id': req.params.mId
        });
    });

    return app;
};
