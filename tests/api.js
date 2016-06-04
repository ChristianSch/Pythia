(function() {
    'use strict';

    var request = require('supertest'),
        express = require('express'),
        should = require('chai').should,
        expect = require('chai').expect,
        assert = require('chai').assert;

    var app = require('../').app;

    var exp_id = null,
        model_id = null,
        i = 0;

    describe('REST API:', function() {
        describe('Get API: GET /api', function() {
            request(app)
                .get('/api')
                .expect(200)
                .end(function(err, res) {
                    expect(res.body._links.self.href).to.equal('/api/');
                    expect(res.body._links.v1.href).to.equal('/api/v1');
                });
        });

        describe('Get API/v1: GET /api/v1', function() {
            request(app)
                .get('/api/v1')
                .expect(200)
                .end(function(err, res) {
                    expect(res.body._links.self.href).to.equal('/api/v1');
                    expect(res.body._links.experiment.href).to.equal('/api/v1/experiment');
                });
        });


        describe('Create Experiment: POST /experiment', function() {
            it('should create an experiment with a randomly generated name', function(done) {
                request(app)
                    .post('/api/v1/experiment')
                    .expect(201)
                    .send({
                        'description': 'test'
                    })
                    .end(function(err, res) {
                        exp_id = res.body._id;
                        expect(res.body._id).to.be.ok;
                        expect(res.body.name).to.be.ok;
                        expect(res.body.description).to.equal('test');

                        done(err);
                    });
            });

            it('should get experiment with correct field values', function(done) {
                request(app)
                    .get('/api/v1/experiment/' + exp_id)
                    .expect(200)
                    .end(function(err, res) {
                        expect(res.body._id).to.be.ok;
                        expect(res.body.name).to.be.ok;
                        expect(res.body.description).to.equal('test');

                        done(err);
                    });
            });

            it('should create an experiment with a given generated name', function(done) {
                request(app)
                    .post('/api/v1/experiment')
                    .expect(201)
                    .send({
                        'description': 'test',
                        'name': 'ImageNet 2012'
                    })
                    .end(function(err, res) {
                        expect(res.body._id).to.be.ok;
                        expect(res.body.name).to.be.ok;
                        expect(res.body.description).to.equal('test');
                        expect(res.body.name).to.equal('ImageNet 2012');

                        done(err);
                    });
            });

            it('should get all experiments', function(done) {
                request(app)
                    .get('/api/v1/experiment/')
                    .expect(200)
                    .end(function(err, res) {
                        var notFail = false;

                        for (i = 0; i < res.body.length; i++) {
                            if (res.body[i]._id == exp_id) {
                                notFail = true;
                                break;
                            }
                        }

                        expect(notFail).to.be.ok;

                        done(err);
                    });
            });

            it('should return 500', function(done) {
                request(app)
                    .get('/api/v1/experiment/invalid_id')
                    .expect(500)
                    .end(function(err, res) {
                        done(err);
                    });
            });

            it('should return 404', function(done) {
                request(app)
                    .get('/api/v1/experiment/000000000000000000000000')
                    .expect(404)
                    .end(function(err, res) {
                        done(err);
                    });
                });
        });

        describe('Change Experiment: PUT /experiment/:id', function() {
            it('should update the name and description', function(done) {
                request(app)
                    .put('/api/v1/experiment/' + exp_id)
                    .expect(200)
                    .send({
                        'description': 'just testing put',
                        'name': 'ImageNet 2011'
                    })
                    .end(function(err, res) {
                        expect(res.body._id).to.be.ok;
                        expect(res.body.name).to.be.ok;
                        expect(res.body.description).to.equal('just testing put');
                        expect(res.body.name).to.equal('ImageNet 2011');

                        done(err);
                    });
            });

            it('should return 500', function(done) {
                request(app)
                    .put('/api/v1/experiment/invalid_id')
                    .expect(500)
                    .end(function(err, res) {
                        done(err);
                    });
            });

            it('should return 404', function(done) {
                request(app)
                    .put('/api/v1/experiment/000000000000000000000000')
                    .expect(404)
                    .end(function(err, res) {
                        done(err);
                    });
            });
        });

        describe('Create Model: POST /experiment/:id/model', function() {
            var dummyHyperparams = 'distribution: gaußian, n-grams: 2-grams, stopwords: removed',
                dummyName = 'bow naïve bayes',
                dummyDescr = 'some description';

            it('should create model for given experiment', function(done) {
                request(app)
                    .post('/api/v1/experiment/' + exp_id + '/model')
                    .expect(201)
                    .send({
                        'name': dummyName,
                        'description': dummyDescr,
                        'hyperparameter': dummyHyperparams
                    })
                    .end(function(err, res) {
                        model_id = res.body._id;

                        expect(res.body._id).to.be.ok;
                        expect(res.body.name).to.equal(dummyName);
                        expect(res.body.hyperparameter).to.equal(dummyHyperparams);
                        expect(res.body.description).to.equal(dummyDescr);

                        done(err);
                    });
            });

            it('should get the model with correct field values', function(done) {
                request(app)
                    .get('/api/v1/experiment/' + exp_id + '/model/' + model_id)
                    .expect(200)
                    .end(function(err, res) {
                        expect(res.body._id).to.be.ok;
                        expect(res.body.name).to.equal(dummyName);
                        expect(res.body.hyperparameter).to.equal(dummyHyperparams);
                        expect(res.body.description).to.equal(dummyDescr);

                        done(err);
                    });
            });

            it('should get all models, including the just created one', function(done) {
                request(app)
                    .get('/api/v1/experiment/' + exp_id + '/model')
                    .expect(200)
                    .end(function(err, res) {
                        var notFail = false;

                        for (i = 0; i < res.body.length; i++) {
                            if (res.body[i]._id == model_id) {
                                notFail = true;
                                break;
                            }
                        }

                        expect(notFail).to.be.ok;

                        done(err);
                    });
            });

            it('should return 404', function(done) {
                request(app)
                    .get('/api/v1/experiment/' + exp_id + '/model/000000000000000000000000')
                    .expect(404)
                    .end(function(err, res) {
                        done(err);
                    });
            });
        });

        describe('Change Model: PUT /experiment/:id/model/:id', function() {
            it('should change the model data', function(done) {
                request(app)
                    .put('/api/v1/experiment/' + exp_id + '/model/' + model_id)
                    .expect(200)
                    .send({
                        'name': 'foo',
                        'description': 'bar',
                        'hyperparameter': 'baz'
                    })
                    .end(function(err, res) {
                        expect(res.body._id).to.be.ok;
                        expect(res.body.name).to.equal('foo');
                        expect(res.body.description).to.equal('bar');
                        expect(res.body.hyperparameter).to.equal('baz');

                        done(err);
                    });
            });

            it('should return 404', function(done) {
                request(app)
                    .put('/api/v1/experiment/' + exp_id + '/model/000000000000000000000000')
                    .expect(404)
                    .end(function(err, res) {
                        done(err);
                    });
            });
        });

        describe('Create Measurements: POST /experiment/:id/model/:id/measurements', function() {
            it('should return bad request', function(done) {
                request(app)
                    .post('/api/v1/experiment/' + exp_id + '/model/' + model_id + '/measurements')
                    .expect(400)
                    .end(function(err, res) {
                        expect(res.body.message).to.equal('Missing mandatory fields (name, value)');
                        done(err);
                    });
            });

            it('should create measurement point', function(done) {
                request(app)
                    .post('/api/v1/experiment/' + exp_id + '/model/' + model_id + '/measurements')
                    .expect(201)
                    .send({
                        'name': 'totalLoss',
                        'step': '-0.33',
                        'epoch': '0'
                    })
                    .end(function(err, res) {
                        done(err);
                    });
            });
        });

        describe('Get Measurements: GET /experiment/:id/model/:id/measurements', function() {
            it('should return 200', function(done) {
                request(app)
                    .get('/api/v1/experiment/' + exp_id + '/model/' + model_id + '/measurements')
                    .expect(200)
                    .end(function(err, res) {
                        assert(res.body.length > 0);
                        done(err);
                    });
            });

            it('should return 404', function(done) {
                request(app)
                    .get('/api/v1/experiment/' + exp_id + '/model/000000000000000000000000/measurements')
                    .expect(404)
                    .end(function(err, res) {
                        done(err);
                    });
            });

            it('should return 404', function(done) {
                request(app)
                    .get('/api/v1/experiment/000000000000000000000000/model/000000000000000000000000/measurements')
                    .expect(404)
                    .end(function(err, res) {
                        done(err);
                    });
            });
        });

        describe('Get Measurements for Name: GET /experiment/:id/model/:id/measurements/forname/:name', function() {
            it('should retrieve previously created loss', function(done) {
                request(app)
                    .get('/api/v1/experiment/' + exp_id + '/model/' + model_id + '/measurements/forname/totalLoss')
                    .expect(200)
                    .end(function(err, res) {
                        assert(res.body.length > 0);
                        expect(res.body[0].name).to.equal('totalLoss');
                        done(err);
                    });
            });

            it('should return 404', function(done) {
                request(app)
                    .get('/api/v1/experiment/' + exp_id + '/model/000000000000000000000000/measurements/forname/totalLoss')
                    .expect(404)
                    .end(function(err, res) {
                        done(err);
                    });
            });

            it('should return 404', function(done) {
                request(app)
                    .get('/api/v1/experiment/000000000000000000000000/model/000000000000000000000000/measurements/forname/totalLoss')
                    .expect(404)
                    .end(function(err, res) {
                        done(err);
                    });
            });
        });

        describe('Delete Model: DELETE /experiment/:id/model/:id', function() {
            it('should remove the document', function(done) {
                request(app)
                    .del('/api/v1/experiment/' + exp_id + '/model/' + model_id)
                    .expect(200)
                    .end(function(err, res) {
                        done(err);
                    });
            });

            it('should not get the document', function(done) {
                request(app)
                    .get('/api/v1/experiment/' + exp_id + '/model/' + model_id)
                    .expect(404)
                    .end(function(err, res) {
                        done(err);
                    });
            });

            it('should return 404', function(done) {
                request(app)
                    .del('/api/v1/experiment/' + exp_id + '/model/000000000000000000000000')
                    .expect(404)
                    .end(function(err, res) {
                        done(err);
                    });
            });
        });

        describe('Delete Experiment: DELETE /experiment/:id', function() {
            it('should remove the document', function(done) {
                request(app)
                    .del('/api/v1/experiment/' + exp_id)
                    .expect(200)
                    .end(function(err, res) {
                        done(err);
                    });
            });

            it('should return 500', function(done) {
                request(app)
                    .del('/api/v1/experiment/invalid_id')
                    .expect(500)
                    .end(function(err, res) {
                        done(err);
                    });
            });

            it('should return 404', function(done) {
                request(app)
                    .del('/api/v1/experiment/000000000000000000000000')
                    .expect(404)
                    .end(function(err, res) {
                        done(err);
                    });
            });
        });

        describe('Invalid Routes', function() {
            it('should return "not found" for put /experiment', function(done) {
                request(app)
                    .put('/api/v1/experiment')
                    .expect(404)
                    .send({'name': 'does not matter'})
                    .end(function(err, doc) {
                        done(err);
                    });
            });

            it('should return "not found" for delete /experiment', function(done) {
                request(app)
                    .del('/api/v1/experiment')
                    .expect(404)
                    .send({'name': 'does not matter'})
                    .end(function(err, doc) {
                        done(err);
                    });
            });
        });

        // TODO: delete models
    });
})();
