'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PackagerActivation = undefined;

var _LogTailer;

function _load_LogTailer() {
  return _LogTailer = require('../../../nuclide-console/lib/LogTailer');
}

var _nuclideReactNativeBase;

function _load_nuclideReactNativeBase() {
  return _nuclideReactNativeBase = require('../../../nuclide-react-native-base');
}

var _process;

function _load_process() {
  return _process = require('../../../commons-node/process');
}

var _parseMessages;

function _load_parseMessages() {
  return _parseMessages = require('./parseMessages');
}

var _atom = require('atom');

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

/**
 * Runs the server in the appropriate place. This class encapsulates all the state of the packager
 * so as to keep the Activation class (which brings together various RN features) clean.
 */


// eslint-disable-next-line nuclide-internal/no-cross-atom-imports
let PackagerActivation = exports.PackagerActivation = class PackagerActivation {

  constructor() {
    const packagerEvents = _rxjsBundlesRxMinJs.Observable.defer(() => getPackagerObservable(this._projectRootPath)).share();
    const messages = packagerEvents.filter(event => event.kind === 'message').map(event => {
      if (!(event.kind === 'message')) {
        throw new Error('Invariant violation: "event.kind === \'message\'"');
      }

      return event.message;
    });
    const ready = packagerEvents.filter(message => message.kind === 'ready').mapTo(undefined);
    this._logTailer = new (_LogTailer || _load_LogTailer()).LogTailer({
      name: 'React Native Packager',
      messages: messages,
      ready: ready,
      handleError: function (err) {
        switch (err.name) {
          case 'NoReactNativeProjectError':
            // If a React Native project hasn't been found, notify the user and complete normally.
            atom.notifications.addError("Couldn't find a React Native project", {
              dismissable: true,
              description: 'Make sure that your current working root (or its ancestor) contains a' + ' "node_modules" directory with react-native installed, or a .buckconfig file' + ' with a "[react-native]" section that has a "server" key.'
            });
            return;
          case 'PackagerError':
            if (!(err instanceof PackagerError)) {
              throw new Error('Invariant violation: "err instanceof PackagerError"');
            }

            atom.notifications.addError(`Packager exited with ${ err.exitMessage }`, {
              dismissable: true,
              detail: err.stderr.trim() === '' ? undefined : err.stderr
            });
            return;
        }
        throw err;
      },

      trackingEvents: {
        start: 'react-native-packager:start',
        stop: 'react-native-packager:stop',
        restart: 'react-native-packager:restart'
      }
    });

    this._disposables = new _atom.CompositeDisposable(new _atom.Disposable(() => {
      this._logTailer.stop();
    }), atom.commands.add('atom-workspace', {
      'nuclide-react-native:start-packager': event => {
        // $FlowFixMe
        const detail = event.detail != null && typeof event.detail === 'object' ? event.detail : undefined;
        this._logTailer.start(detail);
      },
      'nuclide-react-native:stop-packager': () => this._logTailer.stop(),
      'nuclide-react-native:restart-packager': () => this._logTailer.restart()
    }));
  }

  dispose() {
    this._disposables.dispose();
  }

  consumeCwdApi(api) {
    this._disposables.add(api.observeCwd(dir => {
      this._projectRootPath = dir == null ? null : dir.getPath();
    }));
  }

  consumeOutputService(api) {
    this._disposables.add(api.registerOutputProvider({
      id: 'React Native Packager',
      messages: this._logTailer.getMessages(),
      observeStatus: cb => this._logTailer.observeStatus(cb),
      start: () => {
        this._logTailer.start();
      },
      stop: () => {
        this._logTailer.stop();
      }
    }));
  }

};
let NoReactNativeProjectError = class NoReactNativeProjectError extends Error {
  constructor() {
    super('No React Native Project found');
    this.name = 'NoReactNativeProjectError';
  }
};
let PackagerError = class PackagerError extends Error {
  constructor(exitMessage, stderr) {
    super('An error occurred while running the packager');
    this.name = 'PackagerError';
    this.exitMessage = exitMessage;
    this.stderr = stderr;
  }
};

/**
 * Create an observable that runs the packager and and collects its output.
 */

function getPackagerObservable(projectRootPath) {
  const stdout = _rxjsBundlesRxMinJs.Observable.fromPromise((0, (_nuclideReactNativeBase || _load_nuclideReactNativeBase()).getCommandInfo)(projectRootPath)).switchMap(commandInfo => commandInfo == null ? _rxjsBundlesRxMinJs.Observable.throw(new NoReactNativeProjectError()) : _rxjsBundlesRxMinJs.Observable.of(commandInfo)).switchMap(commandInfo => {
    const command = commandInfo.command,
          cwd = commandInfo.cwd,
          args = commandInfo.args;

    return (0, (_process || _load_process()).observeProcess)(() => (0, (_process || _load_process()).safeSpawn)(command, args, { cwd: cwd }));
  })
  // Accumulate the stderr so that we can show it to the user if something goes wrong.
  .scan((acc, event) => {
    return {
      stderr: event.kind === 'stderr' ? acc.stderr + event.data : acc.stderr,
      event: event
    };
  }, { stderr: '', event: null }).switchMap((_ref) => {
    let stderr = _ref.stderr,
        event = _ref.event;

    if (event == null) {
      return _rxjsBundlesRxMinJs.Observable.empty();
    }
    switch (event.kind) {
      case 'error':
        return _rxjsBundlesRxMinJs.Observable.throw(event.error);
      case 'stdout':
        return _rxjsBundlesRxMinJs.Observable.of(event.data);
      case 'exit':
        if (event.exitCode !== 0) {
          return _rxjsBundlesRxMinJs.Observable.throw(new PackagerError((0, (_process || _load_process()).exitEventToMessage)(event), stderr));
        }
        return _rxjsBundlesRxMinJs.Observable.empty();
      case 'stderr':
      default:
        // We just ignore these.
        return _rxjsBundlesRxMinJs.Observable.empty();
    }
  });

  return (0, (_parseMessages || _load_parseMessages()).parseMessages)(stdout);
}