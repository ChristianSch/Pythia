module.exports = function(io) {
    'use strict';

    /**
     * Author: Christian Schulze
     * License: MIT
     * Date: 2016/05/10
     *
     * Main entry point for the Pythia api v1 experiments route.
     */

    var express = require('express'),
        path = require('path'),
        app = module.exports = express(),
        mongoose = require('mongoose'),
        haikunate = require('haikunator');

    var Experiment = require(path.join(__dirname, '../../..', '/models/Experiment')).Experiment;

    app.post('/api/v1/experiment/', function(req, res) {
        var name = haikunate();

        var exp = new Experiment({
            'name': req.body.name || name,
            'description': req.body.description || "No description given"
        });

        exp.save(function(err, doc) {
            io.emit('experiments-updated', [doc]);

            if (err) {
                return res
                    .status(500)
                    .json({
                        'message': err
                    });
            }

            return res
                .status(200)
                .json({
                    'name': doc.name,
                    'description': doc.description,
                    'id': doc._id
                });
        });
    });

    return app;
};
