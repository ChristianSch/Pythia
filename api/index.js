module.exports = function(io) {
    'use strict';

    /**
     * Author: Christian Schulze
     * License: MIT
     * Date: 2016/05/10
     *
     * Main entry point for the Pythia api.
     */

    var express = require('express'),
        app = module.exports = express(),
        v1 = require('./v1')(io);

    /**
     * @api {get} / API entry point
     * @apiName GetRoot
     * @apiGroup API
     *
     * @apiSuccess (200) {String} _links available links from the endpoint
     *
     * @apiSuccessExample {json} Success-Response:
     *       HTTP/1.1 OK
     *       {
     *           "_links": {
     *               "self": {
     *                   "href": "/api"
     *               },
     *               "v1": {
     *                   "href": "/api/v1"
     *               }
     *           }
     *       }
     */
    app.get('/api/', function(req, res) {
        res.status = 200;
        res.send({
            '_links': {
                'self': {
                    'href': '/api/'
                },
                'v1': {
                    'href': '/api/v1'
                }
            }
        });
    });

    /* use first API version */
    app.use(v1);

    return app;
};
