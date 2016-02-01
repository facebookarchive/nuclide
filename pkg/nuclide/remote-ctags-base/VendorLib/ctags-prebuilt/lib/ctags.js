'use strict';

var binary = require('./util/pre-binding');
var path = require('path');
var binding_path = binary.find(path.resolve(path.join(__dirname, '../package.json')));

var readable = require('./util/readable');
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
  var tagsWrapper = new Tags(tagsFilePath);

  tagsWrapper.findTags(tag, partialMatch, caseInsensitive, function(error, tags) {
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
