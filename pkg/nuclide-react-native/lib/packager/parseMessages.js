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

exports.parseMessages = parseMessages;

var _rxjsBundlesRxUmdMinJs2;

function _rxjsBundlesRxUmdMinJs() {
  return _rxjsBundlesRxUmdMinJs2 = require('rxjs/bundles/Rx.umd.min.js');
}

var PORT_LINE = /.*(Running packager on port.*?)\s*│/;
var SOURCE_LIST_START = /Looking for JS files in/;
var NORMAL_LINE = /^\s*\[(\d+):(\d+):(\d+) (A|P)M\]\s*(.*?)\s*$/;
var ERROR_LINE = /^\s*ERROR\s*(.*?)\s*$/;

/**
 * Parses output from the packager into messages.
 */

function parseMessages(raw) {
  return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.create(function (observer) {
    var sawPreamble = false;
    var sawPortLine = false;
    var sawSourcesStart = false;
    var sawSourcesEnd = false;
    var sourceDirectories = [];

    return raw.subscribe({
      next: function next(line) {
        // If we've seen the port and the sources, that's the preamble! Or, if we get to a line that
        // starts with a "[", we probably missed the closing of the preamble somehow. (Like the
        // packager output changed).
        sawPreamble = sawPreamble || sawPortLine && sawSourcesEnd || line.startsWith('[');

        if (!sawPortLine && !sawPreamble) {
          var match = line.match(PORT_LINE);
          if (match != null) {
            sawPortLine = true;
            observer.next({
              level: 'info',
              text: match[1]
            });
            return;
          }
        }

        if (!sawSourcesStart && !sawPreamble) {
          sawSourcesStart = line.match(SOURCE_LIST_START) != null;
        }

        // Once we've seen the start of the source list, we need to accumulate a list until we see
        // a blank line.
        if (sawSourcesStart && !sawSourcesEnd && !sawPreamble) {
          if (!isBlankLine(line)) {
            // Add the directory to the list.
            sourceDirectories.push(line.trim());
          } else if (sourceDirectories.length > 0) {
            // We've gotten our list!
            sawSourcesEnd = true;
            observer.next({
              level: 'info',
              text: 'Looking for JS files in: ' + sourceDirectories.join(',')
            });
            return;
          }
        }

        if (sawPreamble) {
          // Drop all blank lines that come after the preamble.
          if (isBlankLine(line)) {
            return;
          }

          observer.next(parseRegularMessage(line));
          return;
        }

        // If we've gotten here, it means that we have an unhandled line in the preamble. Those are
        // the lines we want to ignore, so don't do anything.
      },
      error: observer.error.bind(observer),
      complete: observer.complete.bind(observer)
    });
  });
}

var isBlankLine = function isBlankLine(line) {
  return (/^\s*$/.test(line)
  );
};

function parseRegularMessage(line) {
  var normalMatch = line.match(NORMAL_LINE);
  if (normalMatch != null) {
    // TODO (matthewwithanm): Add support for showing timestamps and include that in the message.
    return {
      level: 'log',
      text: normalMatch[5]
    };
  }

  var errorMatch = line.match(ERROR_LINE);
  if (errorMatch != null) {
    return {
      level: 'error',
      text: errorMatch[1]
    };
  }

  // If we weren't able to successfully parse a message, just fall back to using the line. This
  // is expected for some of the packagers output ("[Hot Module Replacement] Server listening on
  // /hot", "React packager ready.").
  return {
    level: 'log',
    text: line
  };
}