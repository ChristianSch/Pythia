(function() {
    'use strict';
    /**
     * Author: Christian Schulze
     * License: MIT
     * Date: 2016/05/10
     *
     * Main entry point for the Pythia app, providing the api as well as the frontend.
     */

    var express = require('express'),
        app = exports.app = express(),
        http = require('http').Server(app),
        bodyParser = require('body-parser'),
        mongoose = require('mongoose'),
        io = require('socket.io')(http),
        path = require('path'),
        config = require('./config.js');

    /* Middleware */
    var api = require('./api')(io),
        frontend = require('./frontend')(io);

    /* POST body parsing */
    app.use(bodyParser.urlencoded({
        extended: false
    }));

    app.use(bodyParser.json());

    /* Custom middleware */
    app.use(api);
    app.use(frontend);


    /* Mongoose */
    var mongooseIsConnected = false;

    /* Establish database connection: either use the specified `DB_URI=ADDRESS_TO_MONGODB`
    via the environment, or fall back to the default path */
    var connectionFn = function() {
        var database = process.env.MONGODB_URI || 'localhost:27017/pythia';
        mongoose.connect(database);
    };

    // connect
    connectionFn();

    mongoose.connection.on('connected', function() {
        console.log('Mongoose connected to database');
        mongooseIsConnected = true;
    });

    mongoose.connection.on('error', function(err) {
        console.error(err);

        // closing via driver
        mongoose.connection.db.close();

        // retry connection until succeeding
        connectionFn();
    });

    mongoose.connection.on('disconnected', function() {
        console.log('Mongoose disconnected');
        mongooseIsConnected = false;
    });

    var handleDisconnect = function() {
        console.log('attempting graceful shutdown.');

        if (mongooseIsConnected) {
            mongoose.connection.close(function() {
                console.log('Mongoose is disconnecting due to app termination');
                process.exit(0);
            });
        } else {
            process.exit(0);
        }
    };

    /* Mongoose disconnection on app termination */
    process.on('SIGINT', handleDisconnect);
    process.on('SIGTERM', handleDisconnect);

    app.set('port', (process.env.PORT || 5667));

    /* set up CORS header */
    app.use(function(req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        next();
    });

    http.listen(app.get('port'), function() {
      console.log('listening on http://localhost:' + app.get('port'));
    });

})();
