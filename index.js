// js@base.io, 2016

const path        = require('path');
const watchreload = require('watchreload');

const config      = require('./config.js');
const builder     = require('./src/build');

config.contentSource    = path.join(__dirname, config.contentSource);
config.buildDestination = path.join(__dirname, config.buildDestination);
config.cacheDirectory 	= path.join(__dirname, config.cache);

builder.configure( config );

watchreload.run({
  watch: ['src/', 'src/partials/', config.contentSource, config.buildDestination +'/lib/'],
  proc: builder.run,
  port: 8181,
  root: config.buildDestination
});
