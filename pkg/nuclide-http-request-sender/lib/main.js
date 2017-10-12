'use strict';

var _atom = require('atom');

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('nuclide-commons-atom/createPackage'));
}

var _react = _interopRequireWildcard(require('react'));

var _reactDom = _interopRequireDefault(require('react-dom'));

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

var _reduxObservable;

function _load_reduxObservable() {
  return _reduxObservable = require('nuclide-commons/redux-observable');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _bindObservableAsProps;

function _load_bindObservableAsProps() {
  return _bindObservableAsProps = require('nuclide-commons-ui/bindObservableAsProps');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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

class Activation {

  constructor() {
    const initialState = {
      uri: 'example.com',
      method: 'GET',
      headers: {
        cookie: ''
      },
      body: null,
      parameters: [{ key: '', value: '' }]
    };
    const epics = Object.keys(_Epics || _load_Epics()).map(k => (_Epics || _load_Epics())[k]).filter(epic => typeof epic === 'function');
    const rootEpic = (0, (_reduxObservable || _load_reduxObservable()).combineEpics)(...epics);
    this._store = (0, (_redux || _load_redux()).createStore)((_Reducers || _load_Reducers()).app, initialState, (0, (_redux || _load_redux()).applyMiddleware)((0, (_reduxObservable || _load_reduxObservable()).createEpicMiddleware)(rootEpic)));
    this._actionCreators = (0, (_redux || _load_redux()).bindActionCreators)(_Actions || _load_Actions(), this._store.dispatch);
    this._requestEditDialog = null;
    this._disposables = new _atom.CompositeDisposable(atom.commands.add('atom-workspace', {
      'nuclide-http-request-sender:toggle-http-request-edit-dialog': () => {
        (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('nuclide-http-request-sender:toggle-http-request-edit-dialog');
        this._toggleRequestEditDialog();
      },
      'nuclide-http-request-sender:send-http-request': () => {
        (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('nuclide-http-request-sender:send-http-request');
        this._actionCreators.sendHttpRequest();
      }
    }));
  }

  _toggleRequestEditDialog() {
    const dialog = this._createModalIfNeeded();
    if (dialog.isVisible()) {
      dialog.hide();
    } else {
      dialog.show();
    }
  }

  _createModalIfNeeded() {
    if (this._requestEditDialog != null) {
      return this._requestEditDialog;
    }
    const BoundEditDialog = (0, (_bindObservableAsProps || _load_bindObservableAsProps()).bindObservableAsProps)(
    // $FlowFixMe -- Flow doesn't know about the Observable symbol used by from().
    _rxjsBundlesRxMinJs.Observable.from(this._store), (_RequestEditDialog || _load_RequestEditDialog()).RequestEditDialog);
    const container = document.createElement('div');
    const requestEditDialog = atom.workspace.addModalPanel({
      item: container,
      visible: false
    });
    _reactDom.default.render(_react.createElement(BoundEditDialog, { actionCreators: this._actionCreators }), container);
    this._disposables.add(new _atom.Disposable(() => {
      requestEditDialog.destroy();
      this._requestEditDialog = null;
      _reactDom.default.unmountComponentAtNode(container);
    }));
    this._requestEditDialog = requestEditDialog;
    return requestEditDialog;
  }

  provideHttpRequestSender() {
    return {
      updateRequestEditDialogDefaults: this._actionCreators.updateState
    };
  }

  dispose() {
    this._disposables.dispose();
  }
}

(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);