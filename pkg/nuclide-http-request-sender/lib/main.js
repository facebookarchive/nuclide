"use strict";

function _createPackage() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/createPackage"));

  _createPackage = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

var _reactDom = _interopRequireDefault(require("react-dom"));

function _RequestEditDialog() {
  const data = require("./RequestEditDialog");

  _RequestEditDialog = function () {
    return data;
  };

  return data;
}

function _reduxMin() {
  const data = require("redux/dist/redux.min.js");

  _reduxMin = function () {
    return data;
  };

  return data;
}

function Actions() {
  const data = _interopRequireWildcard(require("./Actions"));

  Actions = function () {
    return data;
  };

  return data;
}

function Epics() {
  const data = _interopRequireWildcard(require("./Epics"));

  Epics = function () {
    return data;
  };

  return data;
}

function Reducers() {
  const data = _interopRequireWildcard(require("./Reducers"));

  Reducers = function () {
    return data;
  };

  return data;
}

function _reduxObservable() {
  const data = require("../../../modules/nuclide-commons/redux-observable");

  _reduxObservable = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _bindObservableAsProps() {
  const data = require("../../../modules/nuclide-commons-ui/bindObservableAsProps");

  _bindObservableAsProps = function () {
    return data;
  };

  return data;
}

function _nuclideAnalytics() {
  const data = require("../../nuclide-analytics");

  _nuclideAnalytics = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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
      parameters: [{
        key: '',
        value: ''
      }]
    };
    const epics = Object.keys(Epics()).map(k => Epics()[k]).filter(epic => typeof epic === 'function');
    const rootEpic = (0, _reduxObservable().combineEpics)(...epics);
    this._store = (0, _reduxMin().createStore)(Reducers().app, initialState, (0, _reduxMin().applyMiddleware)((0, _reduxObservable().createEpicMiddleware)(rootEpic)));
    this._actionCreators = (0, _reduxMin().bindActionCreators)(Actions(), this._store.dispatch);
    this._requestEditDialog = null;
    this._disposables = new (_UniversalDisposable().default)(atom.commands.add('atom-workspace', {
      'nuclide-http-request-sender:toggle-http-request-edit-dialog': () => {
        (0, _nuclideAnalytics().track)('nuclide-http-request-sender:toggle-http-request-edit-dialog');

        this._toggleRequestEditDialog();
      },
      'nuclide-http-request-sender:send-http-request': () => {
        (0, _nuclideAnalytics().track)('nuclide-http-request-sender:send-http-request');

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

    const BoundEditDialog = (0, _bindObservableAsProps().bindObservableAsProps)( // $FlowFixMe -- Flow doesn't know about the Observable symbol used by from().
    _RxMin.Observable.from(this._store), _RequestEditDialog().RequestEditDialog);
    const container = document.createElement('div');
    const requestEditDialog = atom.workspace.addModalPanel({
      item: container,
      visible: false
    });

    _reactDom.default.render(React.createElement(BoundEditDialog, {
      actionCreators: this._actionCreators
    }), container);

    this._disposables.add(new (_UniversalDisposable().default)(() => {
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

(0, _createPackage().default)(module.exports, Activation);