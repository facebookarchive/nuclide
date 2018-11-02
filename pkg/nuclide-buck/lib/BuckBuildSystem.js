"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BuckBuildSystem = void 0;

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

function _consumeFirstProvider() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/consumeFirstProvider"));

  _consumeFirstProvider = function () {
    return data;
  };

  return data;
}

function _passesGK() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/passesGK"));

  _passesGK = function () {
    return data;
  };

  return data;
}

var _rxjsCompatUmdMin = require("rxjs-compat/bundles/rxjs-compat.umd.min.js");

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
    this._diagnosticUpdates = new _rxjsCompatUmdMin.Subject();
    this._diagnosticInvalidations = new _rxjsCompatUmdMin.Subject();
    this._statusMemory = {
      // we'll only add one "target" to the "Building... " title
      addedBuildTargetToTitle: false,
      title: 'No events from buck...',
      body: ''
    };
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
    let buildArguments = taskSettings.buildArguments || [];
    const runArguments = taskSettings.runArguments || [];
    const keepGoing = taskSettings.keepGoing == null ? true : taskSettings.keepGoing;
    const targetString = getCommandStringForResolvedBuildTarget(buildTarget);
    return _rxjsCompatUmdMin.Observable.fromPromise(Promise.all([buckService.getHTTPServerPort(buckRoot), (0, _passesGK().default)('nuclide_buck_superconsole')])).switchMap(([httpPort, useSuperconsole]) => {
      let socketEvents = null;
      let buildId = null;
      const socketStream = buckService.getWebSocketStream(buckRoot, httpPort).refCount().map(message => message) // The do() and filter() ensures that we only listen to messages
      // for a single build.
      .do(message => {
        // eslint-disable-next-line eqeqeq
        if (buildId === null) {
          if (message.type === 'BuildStarted') {
            buildId = message.buildId;
          }
        }
      }).filter(message => message.buildId == null || buildId === message.buildId);

      if (httpPort > 0) {
        socketEvents = (0, _BuckEventStream().getEventsFromSocket)(socketStream).share();
      }

      if (useSuperconsole) {
        buildArguments = buildArguments.concat(['--config', 'ui.superconsole=enabled', '--config', 'color.ui=always']);
      }

      let args = keepGoing && subcommand !== 'run' ? buildArguments.concat(['--keep-going']) : buildArguments;

      if (runArguments.length > 0 && (subcommand === 'run' || subcommand === 'install' || subcommand === 'test')) {
        args = args.concat(['--']).concat(runArguments);
      }

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
        httpRecommendation = _rxjsCompatUmdMin.Observable.empty();
      }

      return _rxjsCompatUmdMin.Observable.concat(httpRecommendation, // Wait until the socket starts up before triggering the Buck process.
      socketEvents == null ? _rxjsCompatUmdMin.Observable.empty() : socketEvents.filter(event => event.type === 'socket-connected').take(1).timeout(SOCKET_TIMEOUT).catch(err => {
        if (err instanceof _rxjsCompatUmdMin.TimeoutError) {
          throw new Error('Timed out connecting to Buck server.');
        }

        throw err;
      }).ignoreElements(), this._consumeEventStream(_rxjsCompatUmdMin.Observable.merge(mergedEvents, _featureConfig().default.get('nuclide-buck.compileErrorDiagnostics') ? (0, _BuckEventStream().getDiagnosticEvents)(mergedEvents, buckRoot) : _rxjsCompatUmdMin.Observable.empty(), processEventCallback != null ? processEventCallback(processMessages) : _rxjsCompatUmdMin.Observable.empty()), buckRoot));
    }).share();
  }

  getDiagnosticProvider() {
    return {
      updates: this._diagnosticUpdates,
      invalidations: this._diagnosticInvalidations
    };
  }
  /*
  * _processStatusEvent recieves an ANSI-stripped line of Buck superconsole
  *  stdout as input with flags set by the ANSI. This function combines the
  *  _statusMemory to reconstruct the buck superconsole. State is also used
  *  for summarized title for the element. The TaskEvent we return contains:
  *  title: the summarized one-line info based on buck state (max len: 35)
  *  body: the combined stream inbetween reset flags which constitutes the
  *         state that the buck superconsole wants to represent.
  *
  * TODO refactor this logic into a react scoped class that can construct
  *  these as react elements.
  */


  _processStatusEvent(event) {
    if (event == null || event.type !== 'buck-status') {
      return _rxjsCompatUmdMin.Observable.empty();
    }

    const result = event.reset ? _rxjsCompatUmdMin.Observable.of({
      type: 'status',
      status: {
        type: 'bulletin',
        bulletin: {
          title: this._statusMemory.title.slice(),
          body: this._statusMemory.body.slice()
        }
      }
    }) : _rxjsCompatUmdMin.Observable.empty();

    if (event.reset) {
      this._statusMemory.addedBuildTargetToTitle = false;
      this._statusMemory.body = '';
    }

    const PARSING_BUCK_FILES_REGEX = /(Pars.* )([\d:]+\d*\.?\d*)\s(min|sec)/g;
    const CREATING_ACTION_GRAPH_REGEX = /(Creat.* )([\d:]+\d*\.?\d*)\s(min|sec)/g;
    const BUILDING_REGEX = /(Buil.* )([\d:]+\d*\.?\d*)\s(min|sec)/g;
    const BUILD_TARGET_REGEX = /\s-\s.*\/(?!.*\/)(.*)\.\.\.\s([\d:]+\d*\.?\d*)\s(min|sec)/g;
    const STARTING_BUCK_REGEX = /(Starting.*)/g;
    /* We'll attempt to match the event.message to a few known regex matches,
    * otherwise we'll ignore it. When we find a match, we'll parse it for
    * length, markup, and set the title.
    */

    let match = PARSING_BUCK_FILES_REGEX.exec(event.message);

    if (match == null) {
      match = CREATING_ACTION_GRAPH_REGEX.exec(event.message);
    }

    if (match == null) {
      match = BUILDING_REGEX.exec(event.message);
    }

    if (match != null && match.length > 1) {
      let prefix = match[1];

      if (prefix.length > 24) {
        prefix = prefix.slice(0, 24);
      } // TODO refactor this logic into a react scoped class that can construct
      // these as react elements.


      this._statusMemory.title = `${prefix}<span>${match[2]}</span> ${match[3]}`;
    }
    /* this block parses the first subsequent Building... line
    * (i.e. " - fldr/com/facebook/someTarget:someTarget#header-info 2.3 sec")
    * into: "Building... someTarget:som 2.3 sec". & gates itself with addedBuildTargetToTitle
    */


    if (match == null && !this._statusMemory.addedBuildTargetToTitle) {
      match = BUILD_TARGET_REGEX.exec(event.message);

      if (match != null) {
        let target = match[1].split('#')[0];

        if (target.length > 12) {
          target = target.slice(0, 12);
        }

        this._statusMemory.title = `Building ../${target} <span>${match[2]}</span> ${match[3]}`;
        this._statusMemory.addedBuildTargetToTitle = true;
      }
    }

    if (match == null) {
      match = STARTING_BUCK_REGEX.exec(event.message);

      if (match != null) {
        let target = match[0];

        if (target.length > 35) {
          target = target.slice(0, 35);
        }

        this._statusMemory.title = target;
      }
    }

    if (event.error) {
      this._statusMemory.title = event.message.slice(0, 35);
    } // logging lines that don't match our REGEX so we can manually add them later


    if (match == null && !event.error) {
      (0, _log4js().getLogger)('nuclide-buck-superconsole').warn('no match:' + event.message);
    } // body is cleared by event.reset, otherwise we append a newline & message


    this._statusMemory.body = event.reset ? event.message.trim() : this._statusMemory.body + '<br/>' + event.message.trim();
    return result;
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
    return _rxjsCompatUmdMin.Observable.concat(events.flatMap(event => {
      if (event.type === 'progress') {
        return _rxjsCompatUmdMin.Observable.of(event);
      } else if (event.type === 'buck-status') {
        return this._processStatusEvent(event);
      } else if (event.type === 'log') {
        return (0, _tasks().createMessage)(event.message, event.level);
      } else if (event.type === 'build-output') {
        const {
          target,
          path,
          successType
        } = event.output;
        return _rxjsCompatUmdMin.Observable.concat((0, _tasks().createMessage)(`Target: ${target}`, 'log'), (0, _tasks().createMessage)(`Output: ${path}`, 'log'), (0, _tasks().createMessage)(`Success type: ${successType}`, 'log'), (0, _tasks().createResult)(Object.assign({}, event.output, {
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

      return _rxjsCompatUmdMin.Observable.empty();
    }), _rxjsCompatUmdMin.Observable.defer(() => {
      if (fileDiagnostics.size > 0) {
        return (0, _tasks().createMessage)('Compilation errors detected: open the Diagnostics pane to jump to them.', 'info');
      } else {
        return _rxjsCompatUmdMin.Observable.empty();
      }
    }), _rxjsCompatUmdMin.Observable.defer(() => {
      if (errorMessage != null) {
        throw new Error(errorMessage);
      }

      return _rxjsCompatUmdMin.Observable.empty();
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
    const SENTINEL = {
      kind: 'exit',
      exitCode: null,
      signal: null
    };
    return openExopackageTunnelIfNeeded(buckRoot, simulator).switchMap(() => {
      return buckService.installWithOutput(buckRoot, targets, args, simulator, !skipLaunchAfterInstall, debug).refCount().concat(_rxjsCompatUmdMin.Observable.of(SENTINEL));
    }) // We need to do this to make sure that we close the
    // openExopackageTunnelIfNeeded observable once
    // buckService.installWithOutput finishes so we can close the tunnel.
    .takeWhile(value => value !== SENTINEL);
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

function isOneWorldDevice(simulator) {
  return simulator != null && /^localhost:\d+$/.test(simulator);
}

function openExopackageTunnelIfNeeded(host, simulator) {
  // We need to create this tunnel for exopackage installations to work as
  // buck expects this port to be open. We don't need it in the case of
  // installing to One World though because it's handled by adbmux.
  if (!_nuclideUri().default.isRemote(host) || isOneWorldDevice(simulator)) {
    return _rxjsCompatUmdMin.Observable.of('ready');
  }

  return _rxjsCompatUmdMin.Observable.defer(async () => (0, _passesGK().default)('nuclide_adb_exopackage_tunnel')).mergeMap(shouldTunnel => {
    if (!shouldTunnel) {
      return _rxjsCompatUmdMin.Observable.of('ready');
    } else {
      return _rxjsCompatUmdMin.Observable.defer(async () => (0, _consumeFirstProvider().default)('nuclide.ssh-tunnel')).switchMap(service => service.openTunnels([{
        description: 'exopackage',
        from: {
          host,
          port: 2829,
          family: 4
        },
        to: {
          host: 'localhost',
          port: 2829,
          family: 4
        }
      }]));
    }
  });
}