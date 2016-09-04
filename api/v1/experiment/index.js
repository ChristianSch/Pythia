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

    var i = 0;

    /**
     * Filters raw database output in form of an experiment entry to be returned
     * by the API.
     *
     * @param doc javascript object presentation of raw databse entry
    */
    function filterExperimentFields(doc) {
        return {
            '_id': doc._id,
            'name': doc.name,
            'description': doc.description,
            'date_added': doc.date_added,
            'models': doc.models // empty anyway
        };
    }

    /**
     * Filters raw database output in form of a model entry to be returned
     * by the API.
     *
     * @param doc javascript object presentation of raw databse entry
    */
    function filterModelFields(doc) {
        return {
            '_id': doc._id,
            'date_added': doc.date_added,
            'hyperparameter': doc.hyperparameter,
            'name': doc.name,
            'description': doc.description,
            'measurements': doc.measurements
        };
    }

    /**
     * Filters raw database output in form of a measurement entry to be returned
     * by the API.
     *
     * @param doc javascript object presentation of raw databse entry
    */
    function filterMeasurementFields(doc) {
        return {
            '_id': doc._id,
            'date_added': doc.date_added,
            'name': doc.name,
            'value': doc.value,
            'step': doc.step,
            'epoch': doc.epoch
        };
    }

    app.post('/api/v1/experiment/', function(req, res) {
        var exp = new Experiment({
            'name': req.body.name || haikunate(),
            'description': req.body.description || "No description given"
        });

        exp.save(function(err, doc) {
            io.emit('experiment-added', {
                'data': doc
            });

            if (err) {
                return res
                    .status(500)
                    .json({
                        'message': err
                    });
            }

            return res
                .status(201)
                .json(filterExperimentFields(doc));
        });
    });

    app.get('/api/v1/experiment/', function(req, res) {
        Experiment.find({}, function(err, doc) {
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

            var docs = [];

            for (var i in doc) {
                docs.push(filterExperimentFields(doc[i]));
            }

            return res.status(200).json(docs);
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

            return res.status(200).json(filterExperimentFields(doc));
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

            if (req.body.hyperparameter) {
                doc.hyperparameter = req.body.hyperparameter;
            }

            doc.save(function(err, _doc) {
                if (err) {
                    return res.status(500).json({
                        'message': err.message
                    });
                }

                io.emit('experiment-updated',{
                        '_id': req.params.expId,
                        'data': doc
                    });

                return res.status(200).json(filterExperimentFields(_doc));
            });
        });
    });

    app.delete('/api/v1/experiment/:expId', function(req, res) {
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

                io.emit('experiment-removed', {
                    '_id': req.params.expId,
                    'data': doc
                });

                return res.status(200).json({
                    'message': 'Model removed',
                    'doc': filterExperimentFields(_doc)
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

            doc.save(function(err, _doc) {
                if (err) {
                    return res
                        .status(500)
                        .json({
                            'message': err
                        });
                }

                io.emit('model-added', {
                    'experiment_id': doc._id,
                    'data': model
                });

                return res.status(201).json(filterModelFields(model));
            });
        });
    });

    app.get('/api/v1/experiment/:expId/model', function(req, res) {
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

            var models = [];

            for (var i in doc.models) {
                models.push(filterModelFields(doc.models[i]));
            }

            return res.status(200).json(models);
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

            for (i in doc.models) {
                if (doc.models[i]._id == req.params.mId) {
                    return res.status(200).json(filterModelFields(doc.models[i]));
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

            for (i in doc.models) {
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

                io.emit('model-updated', {
                    'experiment_id': req.params.expId,
                    '_id': req.params.mId,
                    'data': doc
                });

                doc.save(function(err, _doc) {
                    return res.status(200).json(filterModelFields(_doc.models[i]));
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

            for (i in doc.models) {
                if (doc.models[i]._id == req.params.mId) {
                    model = doc.models[i];
                    doc.models.pull(model);
                    break;
                }
            }

            if (model) {
                io.emit('model-removed', {
                    'experiment_id': doc._id,
                    '_id': req.params.mId,
                    'data': doc
                });

                doc.save(function(err, _doc) {
                    console.log(JSON.stringify(model));
                    return res.status(200).json(filterModelFields(model));
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

    app.post('/api/v1/experiment/:expId/model/:mId/measurements', function(req, res) {
        Experiment.findOne({
            '_id': req.params.expId,
            'models._id': req.params.mId
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

            if (!req.body.name && !req.body.value) {
                return res.status(400).json({
                    'message': 'Missing mandatory fields (name, value)'
                });
            }

            for (i in doc.models) {
                if (doc.models[i]._id == req.params.mId) {
                    model = doc.models[i];
                    break;
                }
            }

            if (model) {
                var measurement = model.measurements.create({
                        'name': req.body.name,
                        'step': req.body.step || null,
                        'epoch': req.body.epoch || null,
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
                        'data': measurement,
                        'name': req.body.name
                    });

                    return res.status(201).json(filterMeasurementFields(measurement));
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

    app.get('/api/v1/experiment/:expId/model/:mId/measurements', function(req, res) {
        Experiment.findOne({
            '_id': req.params.expId,
            'models._id': req.params.mId
        }, function(err, doc) {
            var out = {},
                model = null;

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
                        'message': 'No such experiment'
                    });
            }

            for (i in doc.models) {
                if (doc.models[i]._id == req.params.mId) {
                    model = doc.models[i];
                    break;
                }
            }

            var measurements = [];

            for (i in model.measurements) {
                measurements.push(model.measurements)
            }

            if (model) {
                return res.status(200).json(measurements);
            } else {
                return res.status(404).json({
                    'message': 'No such model'
                });
            }
        });
    });

    app.get('/api/v1/experiment/:expId/model/:mId/measurements/forname/:name', function(req, res) {
        Experiment.findOne({
            '_id': req.params.expId,
            'models._id': req.params.mId
        }, function(err, doc) {
            var out = {},
                model = null,
                dataPoints = [];

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

            for (i in doc.models) {
                if (doc.models[i]._id == req.params.mId) {
                    model = doc.models[i];
                    break;
                }
            }

            if (model) {
                for (i in model.measurements) {
                    if (model.measurements[i].name == req.params.name) {
                        dataPoints.push(filterMeasurementFields(model.measurements[i]));
                    }
                }

                return res.status(200).json(dataPoints);
            } else {
                return res.status(404).json({
                    'message': 'No such model'
                });
            }
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
