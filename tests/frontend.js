(function() {
    'use strict';

    var request = require('supertest'),
        express = require('express'),
        should = require('chai').should,
        expect = require('chai').expect,
        assert = require('chai').assert;

    var app = require('../').app;

    describe('Frontend:', function() {
        describe('GET /', function() {
            it('should return a website', function(done) {
                request(app)
                    .get('/')
                    .expect(200)
                    .end(function(err, res) {
                        done(err);
                    });
            });
        });

        describe('GET static files', function() {
            it('should return main.js', function(done) {
                request(app)
                    .get('/js/index.js')
                    .expect(200)
                    .end(function(err, res) {
                        done(err);
                    });
            });

            it('should return main.css', function(done) {
                request(app)
                    .get('/css/main.css')
                    .expect(200)
                    .end(function(err, res) {
                        done(err);
                    });
            });
        });
    });
})();
