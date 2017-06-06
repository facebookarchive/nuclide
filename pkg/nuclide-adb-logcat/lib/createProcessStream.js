'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createProcessStream = createProcessStream;

var _process;

function _load_process() {
  return _process = require('nuclide-commons/process');
}

var _observable;

function _load_observable() {
  return _observable = require('nuclide-commons/observable');
}

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('nuclide-commons-atom/feature-config'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

function createProcessStream() {
  const processEvents = (0, (_process || _load_process()).observeProcess)((_featureConfig || _load_featureConfig()).default.get('nuclide-adb-logcat.pathToAdb'), ['logcat', '-v', 'long'], { /* TODO(T17353599) */isExitError: () => false }).catch(error => _rxjsBundlesRxMinJs.Observable.of({ kind: 'error', error })) // TODO(T17463635)
  .share();
  const stdoutEvents = processEvents.filter(event => event.kind === 'stdout')
  // Not all versions of adb have a way to skip historical logs so we just ignore the first
  // second.
  .skipUntil(_rxjsBundlesRxMinJs.Observable.interval(1000).take(1));
  const otherEvents = processEvents.filter(event => event.kind !== 'stdout');

  return (0, (_observable || _load_observable()).compact)(_rxjsBundlesRxMinJs.Observable.merge(stdoutEvents, otherEvents)
  // Forward the event, but add the last line of std err too. We can use this later if the
  // process exits to provide more information.
  .scan((acc, event) => {
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
          event,
          lastError: parseError(event.data) || acc.lastError
        };
      case 'stderr':
        return Object.assign({}, acc, {
          lastError: event.data || acc.lastError,
          event
        });
      default:
        // This should never happen.
        throw new Error(`Invalid event kind: ${event.kind}`);
    }
  }, { event: null, lastError: null }).map(acc => acc.event))
  // Only get the text from stdout.
  .filter(event => event.kind === 'stdout').map(event => event.data && event.data.replace(/\r*\n$/, ''));
}

function parseError(line) {
  const match = line.match(/^ERROR:\s*(.*)/);
  return match == null ? null : match[1].trim();
}