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

var _atom;

function _load_atom() {
  return _atom = require('atom');
}

var _commonsAtomCreatePackage;

function _load_commonsAtomCreatePackage() {
  return _commonsAtomCreatePackage = _interopRequireDefault(require('../../commons-atom/createPackage'));
}

var _reactForAtom;

function _load_reactForAtom() {
  return _reactForAtom = require('react-for-atom');
}

var _RequestEditDialog;

function _load_RequestEditDialog() {
  return _RequestEditDialog = require('./RequestEditDialog');
}

var _redux;

function _load_redux() {
  return _redux = require('redux');
}

var _Actions;

function _load_Actions() {
  return _Actions = _interopRequireWildcard(require('./Actions'));
}

var _Epics;

function _load_Epics() {
  return _Epics = _interopRequireWildcard(require('./Epics'));
}

var _Reducers;

function _load_Reducers() {
  return _Reducers = _interopRequireWildcard(require('./Reducers'));
}

var _commonsNodeReduxObservable;

function _load_commonsNodeReduxObservable() {
  return _commonsNodeReduxObservable = require('../../commons-node/redux-observable');
}

var _rxjsBundlesRxMinJs;

function _load_rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');
}

var _nuclideUiBindObservableAsProps;

function _load_nuclideUiBindObservableAsProps() {
  return _nuclideUiBindObservableAsProps = require('../../nuclide-ui/bindObservableAsProps');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
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
    var epics = Object.keys(_Epics || _load_Epics()).map(function (k) {
      return (_Epics || _load_Epics())[k];
    }).filter(function (epic) {
      return typeof epic === 'function';
    });
    var rootEpic = (0, (_commonsNodeReduxObservable || _load_commonsNodeReduxObservable()).combineEpics).apply(undefined, _toConsumableArray(epics));
    this._store = (0, (_redux || _load_redux()).createStore)((_Reducers || _load_Reducers()).app, initialState, (0, (_redux || _load_redux()).applyMiddleware)((0, (_commonsNodeReduxObservable || _load_commonsNodeReduxObservable()).createEpicMiddleware)(rootEpic)));
    this._actionCreators = (0, (_redux || _load_redux()).bindActionCreators)(_Actions || _load_Actions(), this._store.dispatch);
    this._requestEditDialog = null;
    this._disposables = new (_atom || _load_atom()).CompositeDisposable(atom.commands.add('atom-workspace', {
      'nuclide-http-request-sender:toggle-http-request-edit-dialog': function nuclideHttpRequestSenderToggleHttpRequestEditDialog() {
        (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('nuclide-http-request-sender:toggle-http-request-edit-dialog');
        _this._toggleRequestEditDialog();
      },
      'nuclide-http-request-sender:send-http-request': function nuclideHttpRequestSenderSendHttpRequest() {
        (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('nuclide-http-request-sender:send-http-request');
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
      var BoundEditDialog = (0, (_nuclideUiBindObservableAsProps || _load_nuclideUiBindObservableAsProps()).bindObservableAsProps)((_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.from(this._store), (_RequestEditDialog || _load_RequestEditDialog()).RequestEditDialog);
      var container = document.createElement('div');
      var requestEditDialog = atom.workspace.addModalPanel({
        item: container,
        visible: false
      });
      (_reactForAtom || _load_reactForAtom()).ReactDOM.render((_reactForAtom || _load_reactForAtom()).React.createElement(BoundEditDialog, { actionCreators: this._actionCreators }), container);
      this._disposables.add(new (_atom || _load_atom()).Disposable(function () {
        requestEditDialog.destroy();
        _this2._requestEditDialog = null;
        (_reactForAtom || _load_reactForAtom()).ReactDOM.unmountComponentAtNode(container);
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

exports.default = (0, (_commonsAtomCreatePackage || _load_commonsAtomCreatePackage()).default)(Activation);
module.exports = exports.default;