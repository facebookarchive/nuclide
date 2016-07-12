Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.createProcessStream = createProcessStream;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _commonsNodeProcess2;

function _commonsNodeProcess() {
  return _commonsNodeProcess2 = require('../../commons-node/process');
}

var _commonsNodeStream2;

function _commonsNodeStream() {
  return _commonsNodeStream2 = require('../../commons-node/stream');
}

var _nuclideFeatureConfig2;

function _nuclideFeatureConfig() {
  return _nuclideFeatureConfig2 = _interopRequireDefault(require('../../nuclide-feature-config'));
}

var _rxjsBundlesRxUmdMinJs2;

function _rxjsBundlesRxUmdMinJs() {
  return _rxjsBundlesRxUmdMinJs2 = _interopRequireDefault(require('rxjs/bundles/Rx.umd.min.js'));
}

function createProcessStream() {
  return (0, (_commonsNodeStream2 || _commonsNodeStream()).compact)((0, (_commonsNodeProcess2 || _commonsNodeProcess()).observeProcess)(spawnAdbLogcat)
  // Forward the event, but add the last line of std err too. We can use this later if the
  // process exits to provide more information.
  .scan(function (acc, event) {
    switch (event.kind) {
      case 'error':
        throw event.error;
      case 'exit':
        throw new Error(acc.lastError || '');
      case 'stdout':
        // Keep track of the last error so that we can show it to users if the process dies
        // badly. If we get a non-error message, then the last error we saw wasn't the one
        // that killed the process, so throw it away. Why is this not on stderr? I don't know.
        return {
          event: event,
          lastError: parseError(event.data)
        };
      case 'stderr':
        return _extends({}, acc, { event: event });
      default:
        // This should never happen.
        throw new Error('Invalid event kind: ' + event.kind);
    }
  }, { event: null, lastError: null }).map(function (acc) {
    return acc.event;
  }))

  // Only get the text from stdout.
  .filter(function (event) {
    return event.kind === 'stdout';
  }).map(function (event) {
    return event.data && event.data.replace(/\r?\n$/, '');
  })

  // Skip the single historical log. Adb requires us to have at least one (`-T`) but (for now at
  // least) we only want to show live logs. Also, since we're automatically retrying, displaying
  // it would mean users would get an inexplicable old entry.
  .skip(1);
}

function spawnAdbLogcat() {
  return (0, (_commonsNodeProcess2 || _commonsNodeProcess()).safeSpawn)((_nuclideFeatureConfig2 || _nuclideFeatureConfig()).default.get('nuclide-adb-logcat.pathToAdb'), ['logcat', '-v', 'long', '-T', '1']);
}

function parseError(line) {
  var match = line.match(/^ERROR:\s*(.*)/);
  return match == null ? null : match[1].trim();
}