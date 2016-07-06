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

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _nuclideConsoleLibLogTailer2;

function _nuclideConsoleLibLogTailer() {
  return _nuclideConsoleLibLogTailer2 = require('../../../nuclide-console/lib/LogTailer');
}

var _commonsNodeProcess2;

function _commonsNodeProcess() {
  return _commonsNodeProcess2 = require('../../../commons-node/process');
}

var _getCommandInfo2;

function _getCommandInfo() {
  return _getCommandInfo2 = require('./getCommandInfo');
}

var _parseMessages2;

function _parseMessages() {
  return _parseMessages2 = require('./parseMessages');
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _rxjsBundlesRxUmdMinJs2;

function _rxjsBundlesRxUmdMinJs() {
  return _rxjsBundlesRxUmdMinJs2 = require('rxjs/bundles/Rx.umd.min.js');
}

/**
 * Runs the server in the appropriate place. This class encapsulates all the state of the packager
 * so as to keep the Activation class (which brings together various RN features) clean.
 */

var PackagerActivation = (function () {
  function PackagerActivation() {
    var _this = this;

    _classCallCheck(this, PackagerActivation);

    this._logTailer = new (_nuclideConsoleLibLogTailer2 || _nuclideConsoleLibLogTailer()).LogTailer({
      name: 'React Native Packager',
      messages: (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.defer(getPackagerObservable),
      trackingEvents: {
        start: 'react-native-packager:start',
        stop: 'react-native-packager:stop',
        restart: 'react-native-packager:restart'
      }
    });

    this._disposables = new (_atom2 || _atom()).CompositeDisposable(new (_atom2 || _atom()).Disposable(function () {
      _this._logTailer.stop();
    }), atom.commands.add('atom-workspace', {
      'nuclide-react-native:start-packager': function nuclideReactNativeStartPackager() {
        return _this._logTailer.start();
      },
      'nuclide-react-native:stop-packager': function nuclideReactNativeStopPackager() {
        return _this._logTailer.stop();
      },
      'nuclide-react-native:restart-packager': function nuclideReactNativeRestartPackager() {
        return _this._logTailer.restart();
      }
    }));
  }

  _createClass(PackagerActivation, [{
    key: 'dispose',
    value: function dispose() {
      this._disposables.dispose();
    }
  }, {
    key: 'consumeOutputService',
    value: function consumeOutputService(api) {
      var _this2 = this;

      this._disposables.add(api.registerOutputProvider({
        id: 'React Native Packager',
        messages: this._logTailer.getMessages(),
        observeStatus: function observeStatus(cb) {
          return _this2._logTailer.observeStatus(cb);
        },
        start: function start() {
          _this2._logTailer.start();
        },
        stop: function stop() {
          _this2._logTailer.stop();
        }
      }));
    }
  }]);

  return PackagerActivation;
})();

exports.PackagerActivation = PackagerActivation;

var NoReactNativeProjectError = (function (_Error) {
  _inherits(NoReactNativeProjectError, _Error);

  function NoReactNativeProjectError() {
    _classCallCheck(this, NoReactNativeProjectError);

    _get(Object.getPrototypeOf(NoReactNativeProjectError.prototype), 'constructor', this).call(this, 'No React Native Project found');
    this.name = 'NoReactNativeProjectError';
  }

  /**
   * Create an observable that runs the packager and and collects its output.
   */
  return NoReactNativeProjectError;
})(Error);

function getPackagerObservable() {
  var stdout = (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.fromPromise((0, (_getCommandInfo2 || _getCommandInfo()).getCommandInfo)()).switchMap(function (commandInfo) {
    return commandInfo == null ? (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.throw(new NoReactNativeProjectError()) : (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.of(commandInfo);
  }).switchMap(function (commandInfo) {
    var command = commandInfo.command;
    var cwd = commandInfo.cwd;
    var args = commandInfo.args;

    return (0, (_commonsNodeProcess2 || _commonsNodeProcess()).observeProcess)(function () {
      return (0, (_commonsNodeProcess2 || _commonsNodeProcess()).safeSpawn)(command, args, { cwd: cwd });
    });
  }).switchMap(function (event) {
    switch (event.kind) {
      case 'error':
        return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.throw(event.error);
      case 'stdout':
        return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.of(event.data);
      case 'exit':
      case 'stderr':
      default:
        // We just ignore these.
        return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.empty();
    }
  }).catch(function (err) {
    // If a React Native project hasn't been found, notify the user and complete normally.
    if (err.name === 'NoReactNativeProjectError') {
      atom.notifications.addError("Couldn't find a React Native project", {
        dismissable: true,
        description: 'Make sure that one of the folders in your Atom project (or its ancestor)' + ' contains a "node_modules" directory with react-native installed, or a' + ' .buckconfig file with a "[react-native]" section that has a "server" key.'
      });
      return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.empty();
    }
    throw err;
  });

  return (0, (_parseMessages2 || _parseMessages()).parseMessages)(stdout);
}