"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _event() {
  const data = require("../../../modules/nuclide-commons/event");

  _event = function () {
    return data;
  };

  return data;
}

function _tasks() {
  const data = require("../../commons-node/tasks");

  _tasks = function () {
    return data;
  };

  return data;
}

function _bindObservableAsProps() {
  const data = require("../../../modules/nuclide-commons-ui/bindObservableAsProps");

  _bindObservableAsProps = function () {
    return data;
  };

  return data;
}

function _Icon() {
  const data = require("../../../modules/nuclide-commons-ui/Icon");

  _Icon = function () {
    return data;
  };

  return data;
}

function _HhvmDebug() {
  const data = require("./HhvmDebug");

  _HhvmDebug = function () {
    return data;
  };

  return data;
}

function _HhvmToolbar() {
  const data = _interopRequireDefault(require("./HhvmToolbar"));

  _HhvmToolbar = function () {
    return data;
  };

  return data;
}

function _ProjectStore() {
  const data = _interopRequireDefault(require("./ProjectStore"));

  _ProjectStore = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

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
class HhvmBuildSystem {
  constructor() {
    this.id = 'hhvm';
    this.name = 'HHVM';
    this._projectStore = new (_ProjectStore().default)();
  }

  dispose() {
    this._projectStore.dispose();
  }

  getExtraUi() {
    if (this._extraUi == null) {
      const projectStore = this._projectStore;
      const subscription = (0, _event().observableFromSubscribeFunction)(projectStore.onChange.bind(projectStore));
      this._extraUi = (0, _bindObservableAsProps().bindObservableAsProps)(subscription.startWith(null).mapTo({
        projectStore
      }), _HhvmToolbar().default);
    }

    return this._extraUi;
  }

  getPriority() {
    return 1; // Take precedence over the Arcanist build toolbar.
  }

  getIcon() {
    return () => React.createElement(_Icon().Icon, {
      icon: "nuclicon-hhvm",
      className: "nuclide-hhvm-task-runner-icon"
    });
  }

  runTask(taskName) {
    return (0, _tasks().taskFromObservable)(_RxMin.Observable.fromPromise((0, _HhvmDebug().debug)(this._projectStore.getDebugMode(), this._projectStore.getProjectRoot(), this._projectStore.getDebugTarget(), this._projectStore.getUseTerminal(), this._projectStore.getScriptArguments())).ignoreElements());
  }

  setProjectRoot(projectRoot, callback) {
    const enabledObservable = (0, _event().observableFromSubscribeFunction)(this._projectStore.onChange.bind(this._projectStore)).map(() => this._projectStore).filter(store => store.getProjectRoot() === projectRoot && // eslint-disable-next-line eqeqeq
    store.isHHVMProject() !== null).map(store => store.isHHVMProject() === true).distinctUntilChanged();

    const tasksObservable = _RxMin.Observable.of([{
      type: 'debug',
      label: 'Debug',
      description: 'Debug an HHVM project',
      icon: 'nuclicon-debugger',
      cancelable: false
    }]);

    const subscription = _RxMin.Observable.combineLatest(enabledObservable, tasksObservable).subscribe(([enabled, tasks]) => callback(enabled, tasks));

    this._projectStore.setProjectRoot(projectRoot);

    return new (_UniversalDisposable().default)(subscription);
  }

}

exports.default = HhvmBuildSystem;