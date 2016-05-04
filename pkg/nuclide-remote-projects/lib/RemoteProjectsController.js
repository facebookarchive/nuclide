var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _nuclideRemoteConnection = require('../../nuclide-remote-connection');

var _reactForAtom = require('react-for-atom');

var _atom = require('atom');

var _uiStatusBarTile = require('./ui/StatusBarTile');

var _uiStatusBarTile2 = _interopRequireDefault(_uiStatusBarTile);

var _nuclideRemoteUri = require('../../nuclide-remote-uri');

var _nuclideRemoteUri2 = _interopRequireDefault(_nuclideRemoteUri);

var _ConnectionState = require('./ConnectionState');

var _ConnectionState2 = _interopRequireDefault(_ConnectionState);

var _nuclideAtomHelpers = require('../../nuclide-atom-helpers');

var RemoteProjectsController = (function () {
  function RemoteProjectsController() {
    _classCallCheck(this, RemoteProjectsController);

    this._statusBarTile = null;
    this._disposables = new _atom.CompositeDisposable();

    this._statusSubscription = null;
    this._disposables.add(atom.workspace.onDidChangeActivePaneItem(this._disposeSubscription.bind(this)), _nuclideAtomHelpers.atomEventDebounce.onWorkspaceDidStopChangingActivePaneItem(this._updateConnectionStatus.bind(this)));
  }

  _createClass(RemoteProjectsController, [{
    key: '_disposeSubscription',
    value: function _disposeSubscription() {
      var subscription = this._statusSubscription;
      if (subscription) {
        this._disposables.remove(subscription);
        subscription.dispose();
        this._statusSubscription = null;
      }
    }
  }, {
    key: '_updateConnectionStatus',
    value: function _updateConnectionStatus(paneItem) {
      var _this = this;

      this._disposeSubscription();

      if (!atom.workspace.isTextEditor(paneItem)) {
        this._renderStatusBar(_ConnectionState2.default.NONE);
        return;
      }
      var textEditor = paneItem;
      var fileUri = textEditor.getPath();
      if (!fileUri) {
        return;
      }
      if (_nuclideRemoteUri2.default.isLocal(fileUri)) {
        this._renderStatusBar(_ConnectionState2.default.LOCAL, fileUri);
        return;
      }

      var updateStatus = function updateStatus(isConnected) {
        _this._renderStatusBar(isConnected ? _ConnectionState2.default.CONNECTED : _ConnectionState2.default.DISCONNECTED, fileUri);
      };

      var connection = _nuclideRemoteConnection.RemoteConnection.getForUri(fileUri);
      if (connection == null) {
        updateStatus(false);
        return;
      }

      var socket = connection.getConnection().getSocket();
      updateStatus(socket.isConnected());
      socket.on('status', updateStatus);

      this._statusSubscription = new _atom.Disposable(function () {
        socket.removeListener('status', updateStatus);
      });
      this._disposables.add(this._statusSubscription);
    }
  }, {
    key: 'consumeStatusBar',
    value: function consumeStatusBar(statusBar) {
      var _this2 = this;

      this._statusBarDiv = document.createElement('div');
      this._statusBarDiv.className = 'nuclide-remote-projects inline-block';

      var tooltip = atom.tooltips.add(this._statusBarDiv, { title: 'Click to show details of connection.' });
      (0, _assert2.default)(this._statusBarDiv);
      var rightTile = statusBar.addLeftTile({
        item: this._statusBarDiv,
        priority: -99
      });

      this._disposables.add(new _atom.Disposable(function () {
        (0, _assert2.default)(_this2._statusBarDiv);
        var parentNode = _this2._statusBarDiv.parentNode;
        if (parentNode) {
          parentNode.removeChild(_this2._statusBarDiv);
        }
        _reactForAtom.ReactDOM.unmountComponentAtNode(_this2._statusBarDiv);
        _this2._statusBarDiv = null;
        rightTile.destroy();
        tooltip.dispose();
      }));

      var textEditor = atom.workspace.getActiveTextEditor();
      if (textEditor != null) {
        this._updateConnectionStatus(textEditor);
      }
    }
  }, {
    key: '_renderStatusBar',
    value: function _renderStatusBar(connectionState, fileUri) {
      if (!this._statusBarDiv) {
        return;
      }

      var component = _reactForAtom.ReactDOM.render(_reactForAtom.React.createElement(_uiStatusBarTile2.default, {
        connectionState: connectionState,
        fileUri: fileUri
      }), this._statusBarDiv);
      (0, _assert2.default)(component instanceof _uiStatusBarTile2.default);
      this._statusBarTile = component;
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this._disposables.dispose();
    }
  }]);

  return RemoteProjectsController;
})();

module.exports = RemoteProjectsController;