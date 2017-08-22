'use strict';

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
  return _process = require('nuclide-commons/process');
}

var _string;

function _load_string() {
  return _string = require('nuclide-commons/string');
}

var _parseMessages;

function _load_parseMessages() {
  return _parseMessages = require('./parseMessages');
}

var _atom = require('atom');

var _electron = _interopRequireDefault(require('electron'));

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Runs the server in the appropriate place. This class encapsulates all the state of the packager
 * so as to keep the Activation class (which brings together various RN features) clean.
 */


// eslint-disable-next-line nuclide-internal/no-cross-atom-imports
class PackagerActivation {

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
      messages,
      ready,
      handleError(err) {
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

            atom.notifications.addError(`Packager exited with ${err.exitMessage}`, {
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
}

exports.PackagerActivation = PackagerActivation; /**
                                                  * Copyright (c) 2015-present, Facebook, Inc.
                                                  * All rights reserved.
                                                  *
                                                  * This source code is licensed under the license found in the LICENSE file in
                                                  * the root directory of this source tree.
                                                  *
                                                  * 
                                                  * @format
                                                  */

class NoReactNativeProjectError extends Error {
  constructor() {
    super('No React Native Project found');
    this.name = 'NoReactNativeProjectError';
  }
}

class PackagerError extends Error {
  constructor(exitMessage, stderr) {
    super('An error occurred while running the packager');
    this.name = 'PackagerError';
    this.exitMessage = exitMessage;
    this.stderr = stderr;
  }
}

/**
 * Create an observable that runs the packager and and collects its output.
 */
function getPackagerObservable(projectRootPath) {
  const stdout = _rxjsBundlesRxMinJs.Observable.fromPromise((0, (_nuclideReactNativeBase || _load_nuclideReactNativeBase()).getCommandInfo)(projectRootPath)).switchMap(commandInfo => commandInfo == null ? _rxjsBundlesRxMinJs.Observable.throw(new NoReactNativeProjectError()) : _rxjsBundlesRxMinJs.Observable.of(commandInfo)).switchMap(commandInfo => {
    const { command, cwd, args } = commandInfo;
    const remote = _electron.default.remote;

    if (!(remote != null)) {
      throw new Error('Invariant violation: "remote != null"');
    }
    // Tell the packager to use this Atom to edit the files.


    const editor = [remote.app.getPath('exe')];
    if (atom.devMode) {
      editor.push('--dev');
    }
    return (0, (_process || _load_process()).observeProcess)(command, args, {
      cwd,
      env: Object.assign({}, process.env, { REACT_EDITOR: (0, (_string || _load_string()).shellQuote)(editor) }),
      killTreeWhenDone: true,
      /* TODO(T17353599) */isExitError: () => false
    }).catch(error => _rxjsBundlesRxMinJs.Observable.of({ kind: 'error', error })); // TODO(T17463635)
  })
  // Accumulate the stderr so that we can show it to the user if something goes wrong.
  .scan((acc, event) => {
    return {
      stderr: event.kind === 'stderr' ? acc.stderr + event.data : acc.stderr,
      event
    };
  }, { stderr: '', event: null }).switchMap(({ stderr, event }) => {
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
          if (!stderr.includes('Error: listen EADDRINUSE :::8081')) {
            atom.notifications.addWarning('Packager failed to start - continuing anyway. This is expected if you ' + 'are intentionally running a packager in a separate terminal. If not, ' + '`lsof -i tcp:8081` might help you find the process using the packager port', {
              dismissable: true,
              detail: stderr.trim() === '' ? undefined : stderr
            });
          }
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