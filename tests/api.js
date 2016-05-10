(function() {
    'use strict';

    var request = require('supertest'),
        express = require('express'),
        should = require('chai').should,
        expect = require('chai').expect,
        assert = require('chai').assert;

    var app = require('../').app;

    describe('REST API:', function() {
        describe('Create Experiment: POST /experiment', function() {
            it('should create an experiment with a randomly generated name', function(done) {
                request(app)
                    .post('/api/v1/experiment')
                    .expect(200)
                    .send({
                        'description': 'test'
                    })
                    .end(function(err, res) {
                        expect(res.body.id).to.be.ok;
                        expect(res.body.name).to.be.ok;
                        expect(res.body.description).to.equal('test');

                        done(err);
                    });
            });
        });
    });
})();
