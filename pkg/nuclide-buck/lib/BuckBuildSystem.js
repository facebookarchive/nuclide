"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BuckBuildSystem = void 0;

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _tasks() {
  const data = require("../../commons-node/tasks");

  _tasks = function () {
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

function _nuclideRemoteConnection() {
  const data = require("../../nuclide-remote-connection");

  _nuclideRemoteConnection = function () {
    return data;
  };

  return data;
}

function _featureConfig() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/feature-config"));

  _featureConfig = function () {
    return data;
  };

  return data;
}

function _BuckEventStream() {
  const data = require("./BuckEventStream");

  _BuckEventStream = function () {
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
 * 
 * @format
 */
const SOCKET_TIMEOUT = 30000;

class BuckBuildSystem {
  constructor() {
    this._diagnosticUpdates = new _RxMin.Subject();
    this._diagnosticInvalidations = new _RxMin.Subject();
  }

  build(opts) {
    const {
      root,
      target,
      args
    } = opts;
    let buildOutput = null;
    const task = (0, _tasks().taskFromObservable)(this.runSubcommand(root, 'build', target, {
      buildArguments: args
    }, false, null).do(event => {
      if (event.type === 'result') {
        buildOutput = event.result;
      }
    }));
    return Object.assign({}, task, {
      getBuildOutput() {
        if (buildOutput == null) {
          throw new Error('No build output!');
        }

        return buildOutput;
      }

    });
  }

  runSubcommand(buckRoot, subcommand, buildTarget, taskSettings, isDebug, udid, processEventCallback, skipLaunchAfterInstall = false) {
    // Clear Buck diagnostics every time we run a buck command.
    this._diagnosticInvalidations.next({
      scope: 'all'
    });

    const buckService = (0, _nuclideRemoteConnection().getBuckServiceByNuclideUri)(buckRoot);
    const buildArguments = taskSettings.buildArguments || [];
    const runArguments = taskSettings.runArguments || [];
    const targetString = getCommandStringForResolvedBuildTarget(buildTarget);
    return _RxMin.Observable.fromPromise(buckService.getHTTPServerPort(buckRoot)).catch(err => {
      (0, _log4js().getLogger)('nuclide-buck').warn(`Failed to get httpPort for ${_nuclideUri().default.getPath(buckRoot)}`, err);
      return _RxMin.Observable.of(-1);
    }).switchMap(httpPort => {
      let socketEvents = null;

      if (httpPort > 0) {
        socketEvents = (0, _BuckEventStream().getEventsFromSocket)(buckService.getWebSocketStream(buckRoot, httpPort).refCount()).share();
      }

      const args = runArguments.length > 0 && (subcommand === 'run' || subcommand === 'install' || subcommand === 'test') ? buildArguments.concat(['--']).concat(runArguments) : buildArguments;
      const processMessages = runBuckCommand(buckService, buckRoot, targetString, subcommand, args, isDebug, udid, skipLaunchAfterInstall).share();
      const processEvents = (0, _BuckEventStream().getEventsFromProcess)(processMessages).share();
      let httpRecommendation;
      let mergedEvents;

      if (socketEvents == null) {
        // Without a websocket, just pipe the Buck output directly.
        mergedEvents = processEvents;
        httpRecommendation = (0, _tasks().createMessage)('For better logs, set httpserver.port in your Buck config and restart Nuclide.', 'info');
      } else {
        mergedEvents = (0, _BuckEventStream().combineEventStreams)(subcommand, socketEvents, processEvents).share();
        httpRecommendation = _RxMin.Observable.empty();
      }

      return _RxMin.Observable.concat(httpRecommendation, // Wait until the socket starts up before triggering the Buck process.
      socketEvents == null ? _RxMin.Observable.empty() : socketEvents.filter(event => event.type === 'socket-connected').take(1).timeout(SOCKET_TIMEOUT).catch(err => {
        if (err instanceof _RxMin.TimeoutError) {
          throw new Error('Timed out connecting to Buck server.');
        }

        throw err;
      }).ignoreElements(), this._consumeEventStream(_RxMin.Observable.merge(mergedEvents, _featureConfig().default.get('nuclide-buck.compileErrorDiagnostics') ? (0, _BuckEventStream().getDiagnosticEvents)(mergedEvents, buckRoot) : _RxMin.Observable.empty(), processEventCallback != null ? processEventCallback(processMessages) : _RxMin.Observable.empty()), buckRoot));
    }).share();
  }

  getDiagnosticProvider() {
    return {
      updates: this._diagnosticUpdates,
      invalidations: this._diagnosticInvalidations
    };
  }
  /**
   * Processes side diagnostics, converts relevant events to TaskEvents.
   */


  _consumeEventStream(events, buckRoot) {
    // TODO: the Diagnostics API does not allow emitting one message at a time.
    // We have to accumulate messages per-file and emit them all.
    const fileDiagnostics = new Map(); // Save error messages until the end so diagnostics have a chance to finish.
    // Real exceptions will not be handled by this, of course.

    let errorMessage = null;
    return _RxMin.Observable.concat(events.flatMap(event => {
      if (event.type === 'progress') {
        return _RxMin.Observable.of(event);
      } else if (event.type === 'log') {
        return (0, _tasks().createMessage)(event.message, event.level);
      } else if (event.type === 'build-output') {
        const {
          target,
          path,
          successType
        } = event.output;
        return _RxMin.Observable.concat((0, _tasks().createMessage)(`Target: ${target}`, 'log'), (0, _tasks().createMessage)(`Output: ${path}`, 'log'), (0, _tasks().createMessage)(`Success type: ${successType}`, 'log'), (0, _tasks().createResult)(Object.assign({}, event.output, {
          path: _nuclideUri().default.join(buckRoot, path)
        })));
      } else if (event.type === 'diagnostics') {
        // Warning: side effects below
        const {
          diagnostics
        } = event; // Update only the files that changed in this message.
        // Since emitting messages for a file invalidates it, we have to
        // be careful to emit all previous messages for it as well.

        const changedFiles = new Map();
        diagnostics.forEach(diagnostic => {
          let messages = fileDiagnostics.get(diagnostic.filePath);

          if (messages == null) {
            messages = [];
            fileDiagnostics.set(diagnostic.filePath, messages);
          }

          messages.push(diagnostic);
          changedFiles.set(diagnostic.filePath, messages);
        });

        this._diagnosticUpdates.next(changedFiles);
      } else if (event.type === 'error') {
        errorMessage = event.message;
      }

      return _RxMin.Observable.empty();
    }), _RxMin.Observable.defer(() => {
      if (fileDiagnostics.size > 0) {
        return (0, _tasks().createMessage)('Compilation errors detected: open the Diagnostics pane to jump to them.', 'info');
      } else {
        return _RxMin.Observable.empty();
      }
    }), _RxMin.Observable.defer(() => {
      if (errorMessage != null) {
        throw new Error(errorMessage);
      }

      return _RxMin.Observable.empty();
    }));
  }

}

exports.BuckBuildSystem = BuckBuildSystem;

function runBuckCommand(buckService, buckRoot, buildTarget, subcommand, args, debug, simulator, skipLaunchAfterInstall = false) {
  // TODO(T17463635)
  if (debug) {
    // Stop any existing debugging sessions, as install hangs if an existing
    // app that's being overwritten is being debugged.
    atom.commands.dispatch(atom.views.getView(atom.workspace), 'debugger:stop-debugging');
  }

  const targets = splitTargets(buildTarget);

  if (subcommand === 'install') {
    return buckService.installWithOutput(buckRoot, targets, args, simulator, !skipLaunchAfterInstall, debug).refCount();
  } else if (subcommand === 'build') {
    return buckService.buildWithOutput(buckRoot, targets, args).refCount();
  } else if (subcommand === 'test') {
    return buckService.testWithOutput(buckRoot, targets, args, debug).refCount();
  } else if (subcommand === 'run') {
    return buckService.runWithOutput(buckRoot, targets, args).refCount();
  } else {
    throw new Error(`Unknown subcommand: ${subcommand}`);
  }
}

function getCommandStringForResolvedBuildTarget(target) {
  const {
    qualifiedName,
    flavors
  } = target;
  const separator = flavors.length > 0 ? '#' : '';
  return `${qualifiedName}${separator}${flavors.join(',')}`;
}

function splitTargets(buildTarget) {
  return buildTarget.trim().split(/\s+/);
}