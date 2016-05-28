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

    var Experiment = require(path.join(__dirname,
                        '../../..',
                        '/models/Experiment')).Experiment;

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
                if (err) {
                    return res.status(500).json({
                        'message': err.message
                    });
                }

                return res.status(200).json(_doc);
            });
        });
    });

    app.delete('/api/v1/experiment/:expId/model/:mId', function(req, res) {
        Experiment.findById(req.params.expId, function(err, doc) {
            if (err) {
                return res.status(500).json({
                        'message': err.message
                    });
            }

            if (!doc) {
                return res.status(404).json({
                        'message': 'No such experiment'
                    });
            }

            doc.remove(function(err, _doc) {
                if (err) {
                    return res.status(500).json({
                        'message': err.message
                    });
                }

                return res.status(200).json({
                    'message': 'Model removed',
                    'doc': _doc
                });
            });
        });
    });

    app.post('/api/v1/experiment/:expId/model/', function(req, res) {
        Experiment.findById(req.params.expId, function(err, doc) {
            if (err) {
                return res.status(500).json({
                        'message': err.message
                    });
            }

            if (!doc) {
                return res.status(404).json({
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

    app.put('/api/v1/experiment/:expId/model/:mId', function(req, res) {
        Experiment.findById(req.params.expId, function(err, doc) {
            var model = false;

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
                    model = true;
                    break;
                }
            }

            if (model) {
                if (req.body.name) {
                    doc.models[i].name = req.body.name;
                }

                if (req.body.description) {
                    doc.models[i].description = req.body.description;
                }

                if (req.body.hyperparameter) {
                    doc.models[i].hyperparameter = req.body.hyperparameter;
                }

                doc.save(function(err, _doc) {
                    return res.status(200).json(_doc.models[i]);
                });
            } else {
                return res
                    .status(404)
                    .json({
                        message: 'No such model'
                    });
            }
        });
    });

    app.delete('/api/v1/experiment/:expId/model/:mId', function(req, res) {
        Experiment.findById(req.params.expId, function(err, doc) {
            var model = false;

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
                    model = true;
                    doc.models.pull(doc.models[i]);
                    break;
                }
            }

            if (model) {
                io.emit('model-removed', {
                    'experiment_id': doc._id,
                    'model_id': req.params.mId
                });

                doc.save(function(err, _doc) {
                    return res.status(200).json(_doc.models[i]);
                });
            } else {
                return res
                    .status(404)
                    .json({
                        message: 'No such model'
                    });
            }
        });
    });

    app.post('/api/v1/experiment/:expId/model/:itId/measurements', function(req, res) {
        Experiment.findOne({
            '_id': req.params.expId,
            'models._id': req.params.itId
        }, function(err, doc) {
            var model = null;

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
                    model = doc.models[i];
                    break;
                }
            }

            if (mode !==  null) {
                var measurement = model.measurements.create({
                        'name': req.body.name,
                        'step': req.body.step,
                        'epoch': req.body.epoch,
                        'value': req.body.value
                    });

                doc.models[i].measurements.push(measurement);

                doc.save(function(err, doc) {
                    if (err) {
                        return res
                            .status(500)
                            .json({
                                'message': err
                            });
                    }

                    io.emit('measurement-added', {
                        'experiment_id': doc._id,
                        'model_id': doc.models[i]._id,
                        'measurement': measurement
                    });

                    return res.status(200).json(measurement);
                });
            }

            return res
                .status(404)
                .json({
                    message: 'No such model'
                });
        });
    });

    app.get('/api/v1/*', function(req, res) {
        return res.status(404).json({
            'message': 'No such route'
        });
    });

    app.put('/api/v1/*', function(req, res) {
        return res.status(404).json({
            'message': 'No such route'
        });
    });

    app.post('/api/v1/*', function(req, res) {
        return res.status(404).json({
            'message': 'No such route'
        });
    });

    app.delete('/api/v1/*', function(req, res) {
        return res.status(404).json({
            'message': 'No such route'
        });
    });

    return app;
};
