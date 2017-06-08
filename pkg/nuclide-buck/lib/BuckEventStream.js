'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getEventsFromSocket = getEventsFromSocket;
exports.getEventsFromProcess = getEventsFromProcess;
exports.combineEventStreams = combineEventStreams;
exports.getDiagnosticEvents = getDiagnosticEvents;

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _stripAnsi;

function _load_stripAnsi() {
  return _stripAnsi = _interopRequireDefault(require('strip-ansi'));
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _DiagnosticsParser;

function _load_DiagnosticsParser() {
  return _DiagnosticsParser = _interopRequireDefault(require('./DiagnosticsParser'));
}

var _process;

function _load_process() {
  return _process = require('nuclide-commons/process');
}

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

const PROGRESS_OUTPUT_INTERVAL = 5 * 1000;
const BUILD_FAILED_MESSAGE = 'BUILD FAILED:';
const BUILD_OUTPUT_REGEX = /^OK {3}(.*?) (.*?) (.*?)$/;

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

function getEventsFromSocket(socketStream) {
  const log = (message, level = 'log') => _rxjsBundlesRxMinJs.Observable.of({
    type: 'log',
    message,
    level
  });

  const eventStream = socketStream.flatMap(message => {
    switch (message.type) {
      case 'SocketConnected':
        return _rxjsBundlesRxMinJs.Observable.of({ type: 'socket-connected' });
      case 'ParseStarted':
        return log('Parsing BUCK files...');
      case 'ParseFinished':
        return log('Parsing finished. Starting build...');
      case 'ConsoleEvent':
        const match = message.message.match(BUILD_OUTPUT_REGEX);
        if (match != null && match.length === 4) {
          // The result is also printed to stdout and converted into build-output there.
          return _rxjsBundlesRxMinJs.Observable.empty();
        } else {
          return log(message.message, convertJavaLevel(message.level.name));
        }
      case 'InstallFinished':
        return log('Install finished.', 'info');
      case 'BuildFinished':
        return log(`Build finished with exit code ${message.exitCode}.`, message.exitCode === 0 ? 'info' : 'error');
      case 'BuildProgressUpdated':
        return _rxjsBundlesRxMinJs.Observable.of({
          type: 'progress',
          progress: message.progressValue
        });
      case 'CompilerErrorEvent':
        // TODO: forward suggestions to diagnostics as autofixes
        return log(message.error, 'error');
    }
    return _rxjsBundlesRxMinJs.Observable.empty();
  }).catch(err => {
    (0, (_log4js || _load_log4js()).getLogger)('nuclide-buck').error('Got Buck websocket error', err);
    // Return to indeterminate progress.
    return _rxjsBundlesRxMinJs.Observable.of({
      type: 'progress',
      progress: null
    });
  }).share();

  // Periodically emit log events for progress updates.
  const progressEvents = eventStream.switchMap(event => {
    if (event.type === 'progress' && event.progress != null && event.progress > 0 && event.progress < 1) {
      return log(`Building... [${Math.round(event.progress * 100)}%]`);
    }
    return _rxjsBundlesRxMinJs.Observable.empty();
  });

  return eventStream.merge(progressEvents.take(1).concat(progressEvents.sampleTime(PROGRESS_OUTPUT_INTERVAL)));
}

function getEventsFromProcess(processStream) {
  return processStream.map(message => {
    switch (message.kind) {
      case 'error':
        return {
          type: 'error',
          message: `Buck failed: ${message.error.message}`
        };
      case 'exit':
        const logMessage = `Buck exited with ${(0, (_process || _load_process()).exitEventToMessage)(message)}.`;
        if (message.exitCode === 0) {
          return {
            type: 'log',
            message: logMessage,
            level: 'info'
          };
        }
        return {
          type: 'error',
          message: logMessage
        };
      case 'stderr':
      case 'stdout':
        const match = message.data.trim().match(BUILD_OUTPUT_REGEX);
        if (match != null && match.length === 4) {
          return {
            type: 'build-output',
            output: {
              target: match[1],
              successType: match[2],
              path: match[3]
            }
          };
        } else {
          return {
            type: 'log',
            // Some Buck steps output ansi escape codes regardless of terminal setting.
            message: (0, (_stripAnsi || _load_stripAnsi()).default)(message.data),
            // Build failure messages typically do not show up in the web socket.
            // TODO(hansonw): fix this on the Buck side
            level: message.data.indexOf(BUILD_FAILED_MESSAGE) === -1 ? 'log' : 'error'
          };
        }
      default:
        throw new Error('impossible');
    }
  });
}

function combineEventStreams(subcommand, socketEvents, processEvents) {
  // Every build finishes with a 100% progress event.
  function isBuildFinishEvent(event) {
    return event.type === 'progress' && event.progress === 1;
  }
  function isRegularLogMessage(event) {
    return event.type === 'log' && event.level === 'log';
  }
  // Socket stream never stops, so use the process lifetime.
  const finiteSocketEvents = socketEvents.takeUntil(processEvents.ignoreElements()
  // Despite the docs, takeUntil doesn't respond to completion.
  .concat(_rxjsBundlesRxMinJs.Observable.of(null))).share();
  let mergedEvents = _rxjsBundlesRxMinJs.Observable.merge(finiteSocketEvents,
  // Take all process output until the first socket message.
  // There's a slight risk of output duplication if the socket message is late,
  // but this is pretty rare.
  processEvents.takeUntil(finiteSocketEvents).takeWhile(isRegularLogMessage),
  // Error/info logs from the process represent exit/error conditions, so always take them.
  // We ensure that error/info logs will not duplicate messages from the websocket.
  processEvents.skipWhile(isRegularLogMessage));
  if (subcommand === 'test' || subcommand === 'run') {
    // The websocket does not reliably provide test output.
    // After the build finishes, fall back to the Buck output stream.
    mergedEvents = _rxjsBundlesRxMinJs.Observable.concat(mergedEvents.takeUntil(finiteSocketEvents.filter(isBuildFinishEvent)),
    // Return to indeterminate progress.
    _rxjsBundlesRxMinJs.Observable.of({ type: 'progress', progress: null }), processEvents);
  } else if (subcommand === 'install') {
    // Add a message indicating that install has started after build completes.
    // The websocket does not naturally provide any indication.
    mergedEvents = _rxjsBundlesRxMinJs.Observable.merge(mergedEvents, finiteSocketEvents.filter(isBuildFinishEvent).switchMapTo(_rxjsBundlesRxMinJs.Observable.of({
      type: 'progress',
      progress: null
    }, {
      type: 'log',
      message: 'Installing...',
      level: 'info'
    })));
  }
  return mergedEvents;
}

function getDiagnosticEvents(events, buckRoot) {
  const diagnosticsParser = new (_DiagnosticsParser || _load_DiagnosticsParser()).default();
  return events.flatMap(event => {
    // For log messages, try to detect compile errors and emit diagnostics.
    if (event.type === 'log') {
      return _rxjsBundlesRxMinJs.Observable.fromPromise(diagnosticsParser.getDiagnostics(event.message, event.level, buckRoot)).map(diagnostics => ({ type: 'diagnostics', diagnostics }));
    }
    return _rxjsBundlesRxMinJs.Observable.empty();
  });
}