"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getEventsFromSocket = getEventsFromSocket;
exports.getEventsFromProcess = getEventsFromProcess;
exports.combineEventStreams = combineEventStreams;
exports.getDiagnosticEvents = getDiagnosticEvents;

function _passesGK() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/passesGK"));

  _passesGK = function () {
    return data;
  };

  return data;
}

var _rxjsCompatUmdMin = require("rxjs-compat/bundles/rxjs-compat.umd.min.js");

function _stripAnsi() {
  const data = _interopRequireDefault(require("strip-ansi"));

  _stripAnsi = function () {
    return data;
  };

  return data;
}

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

function _DiagnosticsParser() {
  const data = _interopRequireDefault(require("./DiagnosticsParser"));

  _DiagnosticsParser = function () {
    return data;
  };

  return data;
}

function _process() {
  const data = require("../../../modules/nuclide-commons/process");

  _process = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */
const PROGRESS_OUTPUT_INTERVAL = 5 * 1000;
const BUILD_FAILED_MESSAGE = 'BUILD FAILED:';
const BUILD_OUTPUT_REGEX = /^OK {3}(.*?) (.*?) (.*?)$/;
const RESET_ANSI = '?7l';
const ERROR_ANSI = '?7h[31m';

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
  const log = (message, level = 'log') => _rxjsCompatUmdMin.Observable.of({
    type: 'log',
    message,
    level
  });

  const eventStream = socketStream.flatMap(message => {
    switch (message.type) {
      case 'SocketConnected':
        return _rxjsCompatUmdMin.Observable.of({
          type: 'socket-connected'
        });

      case 'ParseStarted':
        return log('Parsing BUCK files...');

      case 'ParseFinished':
        return log('Parsing finished. Starting build...');

      case 'ConsoleEvent':
        const strippedMessage = (0, _stripAnsi().default)(message.message);
        const match = strippedMessage.match(BUILD_OUTPUT_REGEX);

        if (match != null && match.length === 4) {
          // The result is also printed to stdout and converted into build-output there.
          return _rxjsCompatUmdMin.Observable.empty();
        } else if (strippedMessage !== '') {
          return log(strippedMessage, convertJavaLevel(message.level.name));
        } else {
          return _rxjsCompatUmdMin.Observable.empty();
        }

      case 'InstallFinished':
        return log('Install finished.', 'info');

      case 'BuildFinished':
        return log(`Build finished with exit code ${message.exitCode}.`, message.exitCode === 0 ? 'info' : 'error');

      case 'BuildProgressUpdated':
        return _rxjsCompatUmdMin.Observable.of({
          type: 'progress',
          progress: message.progressValue
        });

      case 'CompilerErrorEvent':
        // TODO: forward suggestions to diagnostics as autofixes
        return log(message.error, 'error');
    }

    return _rxjsCompatUmdMin.Observable.empty();
  }).catch(err => {
    (0, _log4js().getLogger)('nuclide-buck').error('Got Buck websocket error', err); // Return to indeterminate progress.

    return _rxjsCompatUmdMin.Observable.of({
      type: 'progress',
      progress: null
    });
  }).share();

  const progressEvents = _rxjsCompatUmdMin.Observable.fromPromise((0, _passesGK().default)('nuclide_buck_superconsole')).switchMap(passed => {
    if (!passed) {
      // Periodically emit log events for progress updates.
      return eventStream.switchMap(event => {
        if (event.type === 'progress' && event.progress != null && event.progress > 0 && event.progress < 1) {
          return log(`Building... [${Math.round(event.progress * 100)}%]`);
        }

        return _rxjsCompatUmdMin.Observable.empty();
      });
    } else {
      return _rxjsCompatUmdMin.Observable.empty();
    }
  });

  return eventStream.merge(progressEvents.take(1).concat(progressEvents.sampleTime(PROGRESS_OUTPUT_INTERVAL)));
}

function getEventsFromProcess(processStream) {
  return _rxjsCompatUmdMin.Observable.fromPromise((0, _passesGK().default)('nuclide_buck_superconsole')).switchMap(useSuperconsole => {
    return processStream.map(message => {
      switch (message.kind) {
        case 'error':
          return {
            type: 'error',
            message: `Buck failed: ${message.error.message}`
          };

        case 'exit':
          const logMessage = `Buck exited with ${(0, _process().exitEventToMessage)(message)}.`;

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
          } else if (useSuperconsole) {
            const mdata = message.data;
            const reset = mdata.includes(RESET_ANSI);
            const error = mdata.includes(ERROR_ANSI);
            const stripped = (0, _stripAnsi().default)(message.data);

            if (message.data.indexOf(BUILD_FAILED_MESSAGE) !== -1) {
              return {
                type: 'log',
                level: 'error',
                message: stripped
              };
            }

            return {
              type: 'buck-status',
              message: stripped,
              error,
              reset
            };
          } else {
            return {
              type: 'log',
              // Some Buck steps output ansi escape codes regardless of terminal setting.
              message: (0, _stripAnsi().default)(message.data),
              // Build failure messages typically do not show up in the web socket.
              // TODO(hansonw): fix this on the Buck side
              level: message.data.indexOf(BUILD_FAILED_MESSAGE) === -1 ? 'log' : 'error'
            };
          }

        default:
          message;
          throw new Error('impossible');
      }
    });
  });
}

function combineEventStreams(subcommand, socketEvents, processEvents) {
  // Every build finishes with a 100% progress event.
  function isBuildFinishEvent(event) {
    return event.type === 'progress' && event.progress === 1;
  }

  function isRegularLogMessage(event) {
    return event.type === 'log' && event.level === 'log';
  } // Socket stream never stops, so use the process lifetime.


  const finiteSocketEvents = socketEvents.takeUntil(processEvents.ignoreElements() // Despite the docs, takeUntil doesn't respond to completion.
  .concat(_rxjsCompatUmdMin.Observable.of(null))).share();

  let mergedEvents = _rxjsCompatUmdMin.Observable.merge(finiteSocketEvents, // Take all process output until the first socket message.
  // There's a slight risk of output duplication if the socket message is late,
  // but this is pretty rare.
  processEvents.takeUntil(finiteSocketEvents).takeWhile(isRegularLogMessage), // Error/info logs from the process represent exit/error conditions, so always take them.
  // We ensure that error/info logs will not duplicate messages from the websocket.
  processEvents.skipWhile(isRegularLogMessage));

  if (subcommand === 'test' || subcommand === 'run') {
    // The websocket does not reliably provide test output.
    // After the build finishes, fall back to the Buck output stream.
    mergedEvents = _rxjsCompatUmdMin.Observable.concat(mergedEvents.takeUntil(finiteSocketEvents.filter(isBuildFinishEvent)), // Return to indeterminate progress.
    _rxjsCompatUmdMin.Observable.of({
      type: 'progress',
      progress: null
    }), processEvents);
  } else if (subcommand === 'install') {
    // Add a message indicating that install has started after build completes.
    // The websocket does not naturally provide any indication.
    mergedEvents = _rxjsCompatUmdMin.Observable.merge(mergedEvents, finiteSocketEvents.filter(isBuildFinishEvent).switchMapTo(_rxjsCompatUmdMin.Observable.of({
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
  const diagnosticsParser = new (_DiagnosticsParser().default)();
  return events.flatMap(event => {
    // For log messages, try to detect compile errors and emit diagnostics.
    if (event.type === 'log') {
      return _rxjsCompatUmdMin.Observable.fromPromise(diagnosticsParser.getDiagnostics(event.message, event.level, buckRoot)).map(diagnostics => ({
        type: 'diagnostics',
        diagnostics
      }));
    }

    return _rxjsCompatUmdMin.Observable.empty();
  });
}