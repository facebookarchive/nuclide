'use strict';

var path = require('path');
var pack = require('../package.json');
var binding_path = path.join(
  __dirname,
  '../build/fuzzy-native/',
  'v' + pack.version,
  // ABI v49 is only for Electron. https://github.com/electron/electron/issues/5851
  process.versions.modules === '49'
    ? ['electron', 'v1.3', process.platform, process.arch].join('-')
    : ['node', 'v' + process.versions.modules, process.platform, process.arch].join('-'),
  'fuzzy-native.node'
);

module.exports = require(binding_path);
