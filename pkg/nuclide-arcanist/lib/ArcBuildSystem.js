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
exports.default = undefined;

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _tasks;

function _load_tasks() {
  return _tasks = require('../../commons-node/tasks');
}

var _event;

function _load_event() {
  return _event = require('../../commons-node/event');
}

var _createExtraUiComponent;

function _load_createExtraUiComponent() {
  return _createExtraUiComponent = require('./ui/createExtraUiComponent');
}

var _reactForAtom = require('react-for-atom');

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let ArcBuildSystem = class ArcBuildSystem {

  constructor() {
    this.id = 'arcanist';
    this._outputMessages = new _rxjsBundlesRxMinJs.Subject();
    this._model = this._getModel();
    this.name = this._model.getName();
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(this._outputMessages);
  }

  setCwdApi(cwdApi) {
    this._cwdApi = cwdApi;
    this._model.setCwdApi(cwdApi);
  }

  _getModel() {
    let ArcToolbarModel;
    try {
      // $FlowFB
      ArcToolbarModel = require('./fb/FbArcToolbarModel').FbArcToolbarModel;
    } catch (_) {
      ArcToolbarModel = require('./ArcToolbarModel').ArcToolbarModel;
    }
    return new ArcToolbarModel(this._outputMessages);
  }

  observeTaskList(cb) {
    if (this._tasks == null) {
      this._tasks = _rxjsBundlesRxMinJs.Observable.concat(_rxjsBundlesRxMinJs.Observable.of(this._model.getTaskList()), (0, (_event || _load_event()).observableFromSubscribeFunction)(this._model.onChange.bind(this._model)).map(() => this._model.getTaskList()));
    }
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(this._tasks.subscribe({ next: cb }));
  }

  getExtraUi() {
    if (this._extraUi == null) {
      this._extraUi = (0, (_createExtraUiComponent || _load_createExtraUiComponent()).createExtraUiComponent)(this._model);
    }
    return this._extraUi;
  }

  getIcon() {
    return ArcIcon;
  }

  getOutputMessages() {
    return this._outputMessages;
  }

  runTask(taskType) {
    if (!this._model.getTaskList().some(task => task.type === taskType)) {
      throw new Error(`There's no hhvm task named "${ taskType }"`);
    }

    const taskFunction = getTaskRunFunction(this._model, taskType);
    return (0, (_tasks || _load_tasks()).taskFromObservable)(taskFunction());
  }

  dispose() {
    this._disposables.dispose();
  }
};
exports.default = ArcBuildSystem;


function getTaskRunFunction(model, taskType) {
  switch (taskType) {
    case 'build':
      return () => model.arcBuild();
    default:
      throw new Error(`Invalid task type: ${ taskType }`);
  }
}

const ArcIcon = () => _reactForAtom.React.createElement(
  'span',
  null,
  'arc'
);
module.exports = exports['default'];