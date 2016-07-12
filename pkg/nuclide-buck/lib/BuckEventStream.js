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

exports.isBuildFinishEvent = isBuildFinishEvent;
exports.getEventsFromSocket = getEventsFromSocket;
exports.getEventsFromProcess = getEventsFromProcess;
exports.combineEventStreams = combineEventStreams;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _rxjsBundlesRxUmdMinJs2;

function _rxjsBundlesRxUmdMinJs() {
  return _rxjsBundlesRxUmdMinJs2 = require('rxjs/bundles/Rx.umd.min.js');
}

var _stripAnsi2;

function _stripAnsi() {
  return _stripAnsi2 = _interopRequireDefault(require('strip-ansi'));
}

var _nuclideLogging2;

function _nuclideLogging() {
  return _nuclideLogging2 = require('../../nuclide-logging');
}

var PROGRESS_OUTPUT_INTERVAL = 5 * 1000;
var BUILD_FAILED_MESSAGE = 'BUILD FAILED:';

function convertJavaLevel(level) {
  switch (level) {
    case 'INFO':
      return 'info';
    case 'WARNING':
      return 'warning';
    case 'SEVERE':
      return 'error';
  }
  return 'log';
}

// Every build finishes with a 100% progress event.

function isBuildFinishEvent(event) {
  return event.type === 'progress' && event.progress === 1;
}

function getEventsFromSocket(socketStream) {
  var log = function log(message) {
    var level = arguments.length <= 1 || arguments[1] === undefined ? 'log' : arguments[1];
    return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.of({
      type: 'log',
      message: message,
      level: level
    });
  };

  var eventStream = socketStream.flatMap(function (message) {
    switch (message.type) {
      case 'ParseStarted':
        return log('Parsing BUCK files...');
      case 'ParseFinished':
        return log('Parsing finished. Starting build...');
      case 'ConsoleEvent':
        return log(message.message, convertJavaLevel(message.level.name));
      case 'InstallFinished':
        return log('Install finished.', 'info');
      case 'BuildFinished':
        return log('Build finished with exit code ' + message.exitCode + '.', message.exitCode === 0 ? 'info' : 'error');
      case 'BuildProgressUpdated':
        return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.of({
          type: 'progress',
          progress: message.progressValue
        });
    }
    return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.empty();
  }).catch(function (err) {
    (0, (_nuclideLogging2 || _nuclideLogging()).getLogger)().error('Got Buck websocket error', err);
    // Return to indeterminate progress.
    return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.of({
      type: 'progress',
      progress: null
    });
  }).share();

  // Periodically emit log events for progress updates.
  return eventStream.merge(eventStream.flatMap(function (event) {
    if (event.type === 'progress' && event.progress != null && event.progress > 0 && event.progress < 1) {
      return log('Building... [' + Math.round(event.progress * 100) + '%]');
    }
    return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.empty();
  }).throttleTime(PROGRESS_OUTPUT_INTERVAL));
}

function getEventsFromProcess(processStream) {
  return processStream.map(function (message) {
    switch (message.kind) {
      case 'error':
        return {
          type: 'log',
          message: 'Buck failed: ' + message.error.message,
          level: 'error'
        };
      case 'exit':
        return {
          type: 'log',
          message: 'Buck exited with code ' + message.exitCode + '.',
          level: 'info'
        };
      case 'stderr':
      case 'stdout':
        return {
          type: 'log',
          // Some Buck steps output ansi escape codes regardless of terminal setting.
          message: (0, (_stripAnsi2 || _stripAnsi()).default)(message.data),
          // Build failure messages typically do not show up in the web socket.
          // TODO(hansonw): fix this on the Buck side
          level: message.data.indexOf(BUILD_FAILED_MESSAGE) === -1 ? 'log' : 'error'
        };
      default:
        throw new Error('impossible');
    }
  });
}

function combineEventStreams(subcommand, socketEvents, processEvents) {
  var mergedEvents = (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.merge(socketEvents,
  // Skip everything from Buck's output until the first non-log message.
  // We ensure that error/info logs will not duplicate messages from the websocket.
  // $FlowFixMe: add skipWhile to flow-typed rx definitions
  processEvents.skipWhile(function (event) {
    return event.type !== 'log' || event.level === 'log';
  }));
  if (subcommand === 'test') {
    // The websocket does not reliably provide test output.
    // After the build finishes, fall back to the Buck output stream.
    mergedEvents = (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.concat(mergedEvents.takeUntil(socketEvents.filter(isBuildFinishEvent)),
    // Return to indeterminate progress.
    (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.of({ type: 'progress', progress: null }), processEvents);
  } else if (subcommand === 'install') {
    // Add a message indicating that install has started after build completes.
    // The websocket does not naturally provide any indication.
    mergedEvents = (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.merge(mergedEvents, socketEvents.filter(isBuildFinishEvent)
    // $FlowFixMe: add switchMapTo to flow-typed
    .switchMapTo((_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.of({
      type: 'progress',
      progress: null
    }, {
      type: 'log',
      message: 'Installing...',
      level: 'info'
    })));
  }
  return mergedEvents
  // Socket stream never stops, so use the process lifetime.
  .takeUntil(processEvents.ignoreElements()
  // Despite the docs, takeUntil doesn't respond to completion.
  .concat((_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.of(null)));
}