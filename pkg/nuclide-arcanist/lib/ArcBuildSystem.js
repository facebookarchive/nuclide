'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _tasks;

function _load_tasks() {
  return _tasks = require('../../commons-node/tasks');
}

var _event;

function _load_event() {
  return _event = require('nuclide-commons/event');
}

var _createExtraUiComponent;

function _load_createExtraUiComponent() {
  return _createExtraUiComponent = require('./ui/createExtraUiComponent');
}

var _react = _interopRequireWildcard(require('react'));

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class ArcBuildSystem {

  constructor() {
    this.id = 'arcanist';
    this._model = this._getModel();
    this.name = this._model.getName();
  }

  setProjectRoot(projectRoot, callback) {
    const path = projectRoot ? projectRoot.getPath() : null;
    this._model.setProjectPath(path);

    const storeReady = (0, (_event || _load_event()).observableFromSubscribeFunction)(this._model.onChange.bind(this._model)).map(() => this._model).startWith(this._model).filter(model => model.isArcSupported() !== null && model.getActiveProjectPath() === path);

    const enabledObservable = storeReady.map(model => model.isArcSupported() === true).distinctUntilChanged();

    const tasksObservable = storeReady.map(model => model.getTaskList());

    return new (_UniversalDisposable || _load_UniversalDisposable()).default(_rxjsBundlesRxMinJs.Observable.combineLatest(enabledObservable, tasksObservable).subscribe(([enabled, tasks]) => callback(enabled, tasks)));
  }

  _getModel() {
    let ArcToolbarModel;
    try {
      // $FlowFB
      ArcToolbarModel = require('./fb/FbArcToolbarModel').FbArcToolbarModel;
    } catch (_) {
      ArcToolbarModel = require('./ArcToolbarModel').ArcToolbarModel;
    }
    return new ArcToolbarModel();
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

  runTask(taskType) {
    if (!this._model.getTaskList().some(task => task.type === taskType)) {
      throw new Error(`There's no hhvm task named "${taskType}"`);
    }

    const taskFunction = getTaskRunFunction(this._model, taskType);
    return (0, (_tasks || _load_tasks()).taskFromObservable)(taskFunction());
  }
}

exports.default = ArcBuildSystem; /**
                                   * Copyright (c) 2015-present, Facebook, Inc.
                                   * All rights reserved.
                                   *
                                   * This source code is licensed under the license found in the LICENSE file in
                                   * the root directory of this source tree.
                                   *
                                   * 
                                   * @format
                                   */

function getTaskRunFunction(model, taskType) {
  switch (taskType) {
    case 'build':
      return () => model.arcBuild();
    default:
      throw new Error(`Invalid task type: ${taskType}`);
  }
}

const ArcIcon = () => _react.createElement(
  'span',
  null,
  'arc'
);