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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _commonsAtomCreatePackage2;

function _commonsAtomCreatePackage() {
  return _commonsAtomCreatePackage2 = _interopRequireDefault(require('../../commons-atom/createPackage'));
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _RequestEditDialog2;

function _RequestEditDialog() {
  return _RequestEditDialog2 = require('./RequestEditDialog');
}

var _redux2;

function _redux() {
  return _redux2 = require('redux');
}

var _Actions2;

function _Actions() {
  return _Actions2 = _interopRequireWildcard(require('./Actions'));
}

var _Epics2;

function _Epics() {
  return _Epics2 = _interopRequireWildcard(require('./Epics'));
}

var _Reducers2;

function _Reducers() {
  return _Reducers2 = _interopRequireWildcard(require('./Reducers'));
}

var _commonsNodeReduxObservable2;

function _commonsNodeReduxObservable() {
  return _commonsNodeReduxObservable2 = require('../../commons-node/redux-observable');
}

var _rxjsBundlesRxMinJs2;

function _rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs2 = require('rxjs/bundles/Rx.min.js');
}

var _nuclideUiBindObservableAsProps2;

function _nuclideUiBindObservableAsProps() {
  return _nuclideUiBindObservableAsProps2 = require('../../nuclide-ui/bindObservableAsProps');
}

var _nuclideAnalytics2;

function _nuclideAnalytics() {
  return _nuclideAnalytics2 = require('../../nuclide-analytics');
}

var Activation = (function () {
  function Activation() {
    var _this = this;

    _classCallCheck(this, Activation);

    var initialState = {
      uri: 'example.com',
      method: 'GET',
      headers: {
        cookie: ''
      },
      body: null
    };
    var epics = Object.keys(_Epics2 || _Epics()).map(function (k) {
      return (_Epics2 || _Epics())[k];
    }).filter(function (epic) {
      return typeof epic === 'function';
    });
    var rootEpic = (0, (_commonsNodeReduxObservable2 || _commonsNodeReduxObservable()).combineEpics).apply(undefined, _toConsumableArray(epics));
    this._store = (0, (_redux2 || _redux()).createStore)((_Reducers2 || _Reducers()).app, initialState, (0, (_redux2 || _redux()).applyMiddleware)((0, (_commonsNodeReduxObservable2 || _commonsNodeReduxObservable()).createEpicMiddleware)(rootEpic)));
    this._actionCreators = (0, (_redux2 || _redux()).bindActionCreators)(_Actions2 || _Actions(), this._store.dispatch);
    this._requestEditDialog = null;
    this._disposables = new (_atom2 || _atom()).CompositeDisposable(atom.commands.add('atom-workspace', {
      'nuclide-http-request-sender:toggle-http-request-edit-dialog': function nuclideHttpRequestSenderToggleHttpRequestEditDialog() {
        (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)('nuclide-http-request-sender:toggle-http-request-edit-dialog');
        _this._toggleRequestEditDialog();
      },
      'nuclide-http-request-sender:send-http-request': function nuclideHttpRequestSenderSendHttpRequest() {
        (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)('nuclide-http-request-sender:send-http-request');
        _this._actionCreators.sendHttpRequest();
      }
    }));
  }

  _createClass(Activation, [{
    key: '_toggleRequestEditDialog',
    value: function _toggleRequestEditDialog() {
      var dialog = this._createModalIfNeeded();
      if (dialog.isVisible()) {
        dialog.hide();
      } else {
        dialog.show();
      }
    }
  }, {
    key: '_createModalIfNeeded',
    value: function _createModalIfNeeded() {
      var _this2 = this;

      if (this._requestEditDialog != null) {
        return this._requestEditDialog;
      }
      // $FlowFixMe -- Flow doesn't know about the Observable symbol used by from().
      var BoundEditDialog = (0, (_nuclideUiBindObservableAsProps2 || _nuclideUiBindObservableAsProps()).bindObservableAsProps)((_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.from(this._store), (_RequestEditDialog2 || _RequestEditDialog()).RequestEditDialog);
      var container = document.createElement('div');
      var requestEditDialog = atom.workspace.addModalPanel({
        item: container,
        visible: false
      });
      (_reactForAtom2 || _reactForAtom()).ReactDOM.render((_reactForAtom2 || _reactForAtom()).React.createElement(BoundEditDialog, { actionCreators: this._actionCreators }), container);
      this._disposables.add(new (_atom2 || _atom()).Disposable(function () {
        requestEditDialog.destroy();
        _this2._requestEditDialog = null;
        (_reactForAtom2 || _reactForAtom()).ReactDOM.unmountComponentAtNode(container);
      }));
      this._requestEditDialog = requestEditDialog;
      return requestEditDialog;
    }
  }, {
    key: 'provideHttpRequestSender',
    value: function provideHttpRequestSender() {
      return {
        updateRequestEditDialogDefaults: this._actionCreators.updateState
      };
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._disposables.dispose();
    }
  }]);

  return Activation;
})();

exports.default = (0, (_commonsAtomCreatePackage2 || _commonsAtomCreatePackage()).default)(Activation);
module.exports = exports.default;