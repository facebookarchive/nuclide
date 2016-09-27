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

var _parseRegularLine2;

function _parseRegularLine() {
  return _parseRegularLine2 = require('./parseRegularLine');
}

var _rxjsBundlesRxMinJs2;

function _rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs2 = require('rxjs/bundles/Rx.min.js');
}

var PORT_LINE = /.*Running.*on port\s+(\d+)/;
var SOURCE_LIST_START = /Looking for JS files in/;
var READY_LINE = /(packager|server) ready/i;

/**
 * Parses output from the packager into messages.
 */

function parseMessages(raw) {
  return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.create(function (observer) {
    var sawPreamble = false;
    var sawPortLine = false;
    var sawSourcesStart = false;
    var sawSourcesEnd = false;
    var sawReadyMessage = false;
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
              kind: 'message',
              message: {
                level: 'info',
                text: 'Running packager on port ' + match[1] + '.'
              }
            });
            return;
          }
        }

        if (!sawSourcesStart && !sawPreamble) {
          sawSourcesStart = line.match(SOURCE_LIST_START) != null;
          return;
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
              kind: 'message',
              message: {
                level: 'info',
                text: 'Looking for JS files in: ' + sourceDirectories.join(',')
              }
            });
            return;
          }
        }

        if (sawPreamble) {
          // Drop all blank lines that come after the preamble.
          if (isBlankLine(line)) {
            return;
          }

          observer.next({ kind: 'message', message: (0, (_parseRegularLine2 || _parseRegularLine()).parseRegularLine)(line) });

          if (!sawReadyMessage && READY_LINE.test(line)) {
            sawReadyMessage = true;
            observer.next({ kind: 'ready' });
          }

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