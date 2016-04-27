Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

exports['default'] = createMessageStream;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _nuclideCommons = require('../../nuclide-commons');

var _createMessage = require('./createMessage');

var _createMessage2 = _interopRequireDefault(_createMessage);

var _parseLogcatMetadata = require('./parseLogcatMetadata');

var _parseLogcatMetadata2 = _interopRequireDefault(_parseLogcatMetadata);

var _rxjs = require('rxjs');

var _rxjs2 = _interopRequireDefault(_rxjs);

function createMessageStream(line$) {

  // Separate the lines into groups, beginning with metadata lines.
  return _rxjs2['default'].Observable.create(function (observer) {
    var buffer = [];
    var prevMetadata = null;
    var prevLineIsBlank = function prevLineIsBlank() {
      return buffer[buffer.length - 1] === '';
    };

    var flush = function flush() {
      if (buffer.length === 0) {
        return;
      }

      // Remove the empty line, which is a message separator.
      if (prevLineIsBlank()) {
        buffer.pop();
      }

      observer.next({
        metadata: prevMetadata,
        message: buffer.join('\n')
      });
      buffer = [];
      prevMetadata = null;
    };

    var sharedLine$ = line$.share();

    return new _nuclideCommons.CompositeSubscription(
    // Buffer incoming lines.
    sharedLine$.subscribe(
    // onNext
    function (line) {
      var metadata = undefined;
      var hasPreviousLines = buffer.length > 0;

      if (!hasPreviousLines || prevLineIsBlank()) {
        metadata = (0, _parseLogcatMetadata2['default'])(line);
      }

      if (metadata) {
        // We've reached a new message so the other one must be done.
        flush();
        prevMetadata = metadata;
      } else {
        buffer.push(line);
      }
    },

    // onError
    function (error) {
      flush();
      observer.error(error);
    },

    // onCompleted
    function () {
      flush();
      observer.complete();
    }),

    // We know *for certain* that we have a complete entry once we see the metadata for the next
    // one. But what if the next one takes a long time to happen? After a certain point, we need
    // to just assume we have the complete entry and move on.
    sharedLine$.debounceTime(200).subscribe(flush));
  }).map(_createMessage2['default']).share();
}

module.exports = exports['default'];