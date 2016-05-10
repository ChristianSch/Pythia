module.exports = function(io) {
    'use strict';

    /**
     * Author: Christian Schulze
     * License: MIT
     * Date: 2016/05/10
     *
     * Main entry point for the Pythia api v1.
     */

    var express = require('express'),
        app = module.exports = express(),
        experiment = require('./experiment')(io);

    /**
     * @api {get} / API entry point of first api version
     * @apiName GetRootFirstVersion
     * @apiGroup APIv1
     *
     * @apiSuccess (200) 200 OK
     *
     * @apiSuccessExample {json} Success-Response:
     *      HTTP/1.1 200 OK
     *      {
     *          "_links":{
     *              "self":{
     *                  "href":"/api/v1"
     *              },
     *              "users":{
     *                  "href":"/api/v1/users"
     *               }
     *          }
     *      }
     */
    app.get('/api/v1/', function(req, res) {
        res.status = 200;
        res.send({
            '_links': {
                'self': {
                    'href': '/api/v1'
                },
                'users': {
                    'href': '/api/v1/users'
                }
            }
        });
    });

    app.use(experiment);

    return app;
};
