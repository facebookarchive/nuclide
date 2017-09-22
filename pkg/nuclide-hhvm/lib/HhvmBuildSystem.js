'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _event;

function _load_event() {
  return _event = require('nuclide-commons/event');
}

var _tasks;

function _load_tasks() {
  return _tasks = require('../../commons-node/tasks');
}

var _bindObservableAsProps;

function _load_bindObservableAsProps() {
  return _bindObservableAsProps = require('nuclide-commons-ui/bindObservableAsProps');
}

var _Icon;

function _load_Icon() {
  return _Icon = require('nuclide-commons-ui/Icon');
}

var _HhvmDebug;

function _load_HhvmDebug() {
  return _HhvmDebug = require('./HhvmDebug');
}

var _HhvmToolbar;

function _load_HhvmToolbar() {
  return _HhvmToolbar = _interopRequireDefault(require('./HhvmToolbar'));
}

var _ProjectStore;

function _load_ProjectStore() {
  return _ProjectStore = _interopRequireDefault(require('./ProjectStore'));
}

var _react = _interopRequireWildcard(require('react'));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class HhvmBuildSystem {

  constructor() {
    this.id = 'hhvm';
    this.name = 'HHVM';
    this._projectStore = new (_ProjectStore || _load_ProjectStore()).default();
  }

  dispose() {
    this._projectStore.dispose();
  }

  getExtraUi() {
    if (this._extraUi == null) {
      const projectStore = this._projectStore;
      const subscription = (0, (_event || _load_event()).observableFromSubscribeFunction)(projectStore.onChange.bind(projectStore));
      this._extraUi = (0, (_bindObservableAsProps || _load_bindObservableAsProps()).bindObservableAsProps)(subscription.startWith(null).mapTo({ projectStore }), (_HhvmToolbar || _load_HhvmToolbar()).default);
    }
    return this._extraUi;
  }

  getPriority() {
    return 1; // Take precedence over the Arcanist build toolbar.
  }

  getIcon() {
    return () => _react.createElement((_Icon || _load_Icon()).Icon, { icon: 'nuclicon-hhvm', className: 'nuclide-hhvm-task-runner-icon' });
  }

  runTask(taskName) {
    return (0, (_tasks || _load_tasks()).taskFromObservable)(_rxjsBundlesRxMinJs.Observable.fromPromise((0, (_HhvmDebug || _load_HhvmDebug()).debug)(this._projectStore.getDebugMode(), this._projectStore.getProjectRoot(), this._projectStore.getDebugTarget())).ignoreElements());
  }

  setProjectRoot(projectRoot, callback) {
    const path = projectRoot == null ? null : projectRoot.getPath();

    const enabledObservable = (0, (_event || _load_event()).observableFromSubscribeFunction)(this._projectStore.onChange.bind(this._projectStore)).map(() => this._projectStore).filter(store => store.getProjectRoot() === path && store.isHHVMProject() !== null).map(store => store.isHHVMProject() === true).distinctUntilChanged();

    const tasksObservable = _rxjsBundlesRxMinJs.Observable.of([{
      type: 'debug',
      label: 'Debug',
      description: 'Debug an HHVM project',
      icon: 'nuclicon-debugger',
      cancelable: false
    }]);

    const subscription = _rxjsBundlesRxMinJs.Observable.combineLatest(enabledObservable, tasksObservable).subscribe(([enabled, tasks]) => callback(enabled, tasks));

    this._projectStore.setProjectRoot(path);

    return new (_UniversalDisposable || _load_UniversalDisposable()).default(subscription);
  }
}
exports.default = HhvmBuildSystem; /**
                                    * Copyright (c) 2015-present, Facebook, Inc.
                                    * All rights reserved.
                                    *
                                    * This source code is licensed under the license found in the LICENSE file in
                                    * the root directory of this source tree.
                                    *
                                    * 
                                    * @format
                                    */