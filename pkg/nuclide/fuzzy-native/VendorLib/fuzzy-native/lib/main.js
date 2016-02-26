'use strict';

var binary = require('pre-binding');
var path = require('path');
var binding_path = binary.find(path.resolve(path.join(__dirname, '../package.json')));

module.exports = require(binding_path);
