Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _commonsNodeStream2;

function _commonsNodeStream() {
  return _commonsNodeStream2 = require('../../../commons-node/stream');
}

var _getCommandInfo2;

function _getCommandInfo() {
  return _getCommandInfo2 = require('./getCommandInfo');
}

var _ReactNativeServerActions2;

function _ReactNativeServerActions() {
  return _ReactNativeServerActions2 = _interopRequireDefault(require('./ReactNativeServerActions'));
}

var _ReactNativeServerManager2;

function _ReactNativeServerManager() {
  return _ReactNativeServerManager2 = _interopRequireDefault(require('./ReactNativeServerManager'));
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _flux2;

function _flux() {
  return _flux2 = require('flux');
}

var _rxjsBundlesRxUmdMinJs2;

function _rxjsBundlesRxUmdMinJs() {
  return _rxjsBundlesRxUmdMinJs2 = _interopRequireDefault(require('rxjs/bundles/Rx.umd.min.js'));
}

/**
 * Runs the server in the appropriate place. This class encapsulates all the state of the packager
 * so as to keep the Activation class (which brings together various RN features) clean.
 */

var PackagerActivation = (function () {
  function PackagerActivation() {
    var _this = this;

    _classCallCheck(this, PackagerActivation);

    this._disposables = new (_atom2 || _atom()).CompositeDisposable(atom.commands.add('atom-workspace', {
      'nuclide-react-native:start-packager': function nuclideReactNativeStartPackager() {
        return _this._restart();
      },
      'nuclide-react-native:stop-packager': function nuclideReactNativeStopPackager() {
        return _this._stop();
      },
      'nuclide-react-native:restart-packager': function nuclideReactNativeRestartPackager() {
        return _this._restart();
      }
    }), new (_atom2 || _atom()).Disposable(function () {
      return _this._stop();
    }));

    // TODO(matthewwithanm): Remove all this flux stuff. All we need is an object that represents
    //   the packager server. We don't actually have a store here, we're just using the
    //   actions/dispatcher as a roundabout way of calling methods on the server so we can just
    //   merge that stuff into this class (after removing extra logic, etc).
    var dispatcher = new (_flux2 || _flux()).Dispatcher();
    var actions = this._actions = new (_ReactNativeServerActions2 || _ReactNativeServerActions()).default(dispatcher);
    new (_ReactNativeServerManager2 || _ReactNativeServerManager()).default(dispatcher, actions); // eslint-disable-line no-new
  }

  _createClass(PackagerActivation, [{
    key: 'dispose',
    value: function dispose() {
      this._disposables.dispose();
    }
  }, {
    key: '_restart',
    value: function _restart() {
      var _this2 = this;

      this._stop();

      this._connectionDisposables = new (_atom2 || _atom()).CompositeDisposable(new (_commonsNodeStream2 || _commonsNodeStream()).DisposableSubscription((_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).default.Observable.fromPromise((0, (_getCommandInfo2 || _getCommandInfo()).getCommandInfo)()).subscribe(function (commandInfo) {
        if (commandInfo == null) {
          atom.notifications.addError("Couldn't find a React Native project", {
            dismissable: true,
            description: 'Make sure that one of the folders in your Atom project (or its ancestor)' + ' contains a "node_modules" directory with react-native installed, or a' + ' .buckconfig file with a "[react-native]" section that has a "server" key.'
          });
          return;
        }
        _this2._actions.startServer(commandInfo);
      })), new (_atom2 || _atom()).Disposable(function () {
        return _this2._actions.stopServer();
      }));
    }
  }, {
    key: '_stop',
    value: function _stop() {
      if (this._connectionDisposables) {
        this._connectionDisposables.dispose();
        this._connectionDisposables = null;
      }
    }
  }]);

  return PackagerActivation;
})();

exports.PackagerActivation = PackagerActivation;