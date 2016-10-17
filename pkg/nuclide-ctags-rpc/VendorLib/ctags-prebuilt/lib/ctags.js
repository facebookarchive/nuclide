'use strict';

var path = require('path');
var pack = require('../package.json');
var binding_path = path.join(
  __dirname,
  '../build/ctags/',
  'v' + pack.version,
  // ABI v49 is only for Electron. https://github.com/electron/electron/issues/5851
  process.versions.modules === '49'
    ? ['electron', 'v1.3', process.platform, process.arch].join('-')
    : ['node', 'v' + process.versions.modules, process.platform, process.arch].join('-'),
  'ctags.node'
);

var readable = require('./readable');
var Tags = require(binding_path).Tags;

exports.findTags = function(tagsFilePath, tag, options, callback) {
  if (typeof tagsFilePath !== 'string') {
    throw new TypeError('tagsFilePath must be a string');
  }

  if (typeof tag !== 'string') {
    throw new TypeError('tag must be a string');
  }

  if (typeof options === 'function') {
    callback = options;
    options = null;
  }

  var caseInsensitive = options ? options.caseInsensitive : null;
  var partialMatch = options ? options.partialMatch : null;
  var limit = options ? options.limit : null;
  if (limit != null && (!(typeof limit === "number") || limit <= 0)) {
    throw new TypeError('limit must be a positive integer');
  }
  var tagsWrapper = new Tags(tagsFilePath);

  tagsWrapper.findTags(tag, partialMatch, caseInsensitive, limit, function(error, tags) {
    tagsWrapper.end();
    callback(error, tags);
  });
};

exports.createReadStream = function(tagsFilePath, options) {
  if (typeof tagsFilePath !== 'string') {
    throw new TypeError('tagsFilePath must be a string');
  }

  var chunkSize = options && options.chunkSize || 100;
  var tagsWrapper = new Tags(tagsFilePath);

  return readable(function(count, callback) {
    if (!tagsWrapper.exists()) {
      callback(new Error('Tags file could not be opened: ' + tagsFilePath));
      return;
    }
    var that = this;
    tagsWrapper.getTags(chunkSize, function(error, tags) {
      if ((error != null) || tags.length === 0) {
        tagsWrapper.end();
      }
      callback(error, tags);
      if ((error != null) || tags.length === 0) {
        that.emit('end');
      }
    });
  });
};
