(function() {
    'use strict';

    var request = require('supertest'),
        express = require('express'),
        should = require('chai').should,
        expect = require('chai').expect,
        assert = require('chai').assert;

    var app = require('../').app;

    var exp_id = null,
        model_id = null;

    describe('REST API:', function() {
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
        });

        describe('Change Model: PUT /experiment/:id/model', function() {
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
                        console.log(res.body);

                        expect(res.body._id).to.be.ok;
                        expect(res.body.name).to.equal('foo');
                        expect(res.body.description).to.equal('bar');
                        expect(res.body.hyperparameter).to.equal('baz');

                        done(err);
                    });
            });
        });
    });
})();
