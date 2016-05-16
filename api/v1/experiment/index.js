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
        var exp = new Experiment({
            'name': req.body.name || haikunate(),
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
                .status(201)
                .json(doc);
        });
    });

    app.get('/api/v1/experiment/:expId', function(req, res) {
        Experiment.findById(req.params.expId, function(err, doc) {
            if (err) {
                return res
                    .status(500)
                    .json({
                        'message': err
                    });
            }

            if (!doc) {
                return res
                    .status(404)
                    .json({
                        message: 'No such experiment'
                    });
            }

            return res.status(200).json(doc);
        });
    });

    app.put('/api/v1/experiment/:expId', function(req, res) {
        Experiment.findById(req.params.expId, function(err, doc) {
            if (err) {
                return res
                    .status(500)
                    .json({
                        'message': err
                    });
            }

            if (!doc) {
                return res
                    .status(404)
                    .json({
                        message: 'No such experiment'
                    });
            }

            if (req.body.description) {
                doc.description = req.body.description;
            }

            if (req.body.name) {
                doc.name = req.body.name;
            }

            doc.save(function(err, _doc) {
                return res.status(200).json(_doc);
            });
        });
    });

    app.post('/api/v1/experiment/:expId/model/', function(req, res) {
        Experiment.findById(req.params.expId, function(err, doc) {
            if (err) {
                return res
                    .status(500)
                    .json({
                        'message': err
                    });
            }

            if (!doc) {
                return res
                    .status(404)
                    .json({
                        message: 'No such experiment'
                    });
            }

            var model = doc.models.create({
                'name': req.body.name || haikunate(),
                'description': req.body.description,
                'hyperparameter': req.body.hyperparameter
            });

            doc.models.push(model);

            doc.save(function(err, doc_) {
                if (err) {
                    return res
                        .status(500)
                        .json({
                            'message': err
                        });
                }

                io.emit('experiments-updated', [doc_]);
                io.emit('experiment-updated', doc_);
                io.emit('model-added', {
                    'experiment_id': doc._id,
                    'model': model
                });

                return res.status(201).json(model);
            });
        });
    });

    app.get('/api/v1/experiment/:expId/model/:mId', function(req, res) {
        Experiment.findById(req.params.expId, function(err, doc) {
            if (err) {
                return res
                    .status(500)
                    .json({
                        'message': err
                    });
            }

            if (!doc) {
                return res
                    .status(404)
                    .json({
                        message: 'No such experiment'
                    });
            }

            for (var i in doc.models) {
                if (doc.models[i]._id == req.params.mId) {
                    return res.status(200).json(doc.models[i]);
                }
            }

            return res
                .status(404)
                .json({
                    message: 'No such model'
                });
        });
    });

    app.post('/api/v1/experiment/:expId/model/:itId/measurements', function(req, res) {
        Experiment.findOne({
            '_id': req.params.expId,
            'models._id': req.params.itId
        }, function(err, doc) {
            if (err) {
                return res
                    .status(500)
                    .json({
                        'message': err
                    });
            }

            if (!doc) {
                return res
                    .status(404)
                    .json({
                        message: 'No such experiment'
                    });
            }

            // TODO
            io.emit('experiments-updated', [doc]);
            io.emit('experiment-updated', doc);
        });
    });

    return app;
};
