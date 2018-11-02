"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _nuclideDebuggerCommon() {
  const data = require("../../../modules/nuclide-debugger-common");

  _nuclideDebuggerCommon = function () {
    return data;
  };

  return data;
}

var _rxjsCompatUmdMin = require("rxjs-compat/bundles/rxjs-compat.umd.min.js");

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

function _debugger() {
  const data = require("../../../modules/nuclide-commons-atom/debugger");

  _debugger = function () {
    return data;
  };

  return data;
}

function _HhvmLaunchAttachProvider() {
  const data = require("../../nuclide-debugger-vsp/lib/HhvmLaunchAttachProvider");

  _HhvmLaunchAttachProvider = function () {
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
// eslint-disable-next-line nuclide-internal/no-cross-atom-imports
const WEB_SERVER_OPTION = {
  label: 'Attach to WebServer',
  value: 'webserver'
};
const SCRIPT_OPTION = {
  label: 'Launch Script',
  value: 'script'
};
const DEBUG_OPTIONS = [WEB_SERVER_OPTION, SCRIPT_OPTION];

class HhvmBuildSystem {
  constructor() {
    this.id = 'hhvm';
    this.name = 'HHVM';
    this._projectStore = new (_ProjectStore().default)();

    try {
      // $FlowFB
      const helpers = require("./fb-hhvm.js");

      DEBUG_OPTIONS.push(...helpers.getAdditionalLaunchOptions());
    } catch (e) {}
  }

  dispose() {
    this._projectStore.dispose();
  }

  getExtraUi() {
    if (this._extraUi == null) {
      const projectStore = this._projectStore;
      const subscription = (0, _event().observableFromSubscribeFunction)(projectStore.onChange.bind(projectStore));
      this._extraUi = (0, _bindObservableAsProps().bindObservableAsProps)(subscription.startWith(null).mapTo({
        projectStore,
        debugOptions: DEBUG_OPTIONS
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
    return (0, _tasks().taskFromObservable)(_rxjsCompatUmdMin.Observable.fromPromise((async () => {
      this._projectStore.updateLastUsed();

      this._projectStore.saveSettings();

      return this._debug(this._projectStore.getDebugMode(), this._projectStore.getProjectRoot(), this._projectStore.getDebugTarget(), this._projectStore.getUseTerminal(), this._projectStore.getScriptArguments());
    })()).ignoreElements());
  }

  async _debug(debugMode, activeProjectRoot, target, useTerminal, scriptArguments) {
    let processConfig = null;

    if (!(activeProjectRoot != null)) {
      throw new Error('Active project is null');
    } // See if this is a custom debug mode type.


    try {
      // $FlowFB
      const helper = require("./fb-hhvm");

      processConfig = await helper.getCustomLaunchInfo(debugMode, activeProjectRoot, target, scriptArguments);
    } catch (e) {}

    if (processConfig == null) {
      if (debugMode === 'script') {
        processConfig = (0, _HhvmLaunchAttachProvider().getLaunchProcessConfig)(activeProjectRoot, target, scriptArguments, null
        /* script wrapper */
        , useTerminal, ''
        /* cwdPath */
        );
      } else {
        await (0, _HhvmLaunchAttachProvider().startAttachProcessConfig)(activeProjectRoot, null
        /* attachPort */
        , true
        /* serverAttach */
        );
        return;
      }
    }

    if (!(processConfig != null)) {
      throw new Error("Invariant violation: \"processConfig != null\"");
    }

    const debuggerService = await (0, _debugger().getDebuggerService)();
    await debuggerService.startVspDebugging(processConfig);
  }

  setProjectRoot(projectRoot, callback) {
    const enabledObservable = (0, _event().observableFromSubscribeFunction)(this._projectStore.onChange.bind(this._projectStore)).map(() => this._projectStore).filter(store => store.getProjectRoot() === projectRoot && // eslint-disable-next-line eqeqeq
    store.isHHVMProject() !== null).map(store => store.isHHVMProject() === true).distinctUntilChanged();

    const getTask = disabledMsg => [{
      type: 'debug',
      label: 'Debug',
      description: disabledMsg != null ? disabledMsg : this._projectStore.getDebugMode() === 'webserver' ? 'Attach HHVM debugger to webserver' : 'Debug Hack/PHP Script',
      icon: 'nuclicon-debugger',
      cancelable: false,
      disabled: disabledMsg != null
    }];

    const tasksObservable = _rxjsCompatUmdMin.Observable.concat(_rxjsCompatUmdMin.Observable.of(null), _rxjsCompatUmdMin.Observable.fromPromise((0, _debugger().getDebuggerService)())).switchMap(debugService => {
      if (debugService == null) {
        return _rxjsCompatUmdMin.Observable.of(getTask(null));
      }

      return _rxjsCompatUmdMin.Observable.concat(_rxjsCompatUmdMin.Observable.of(getTask(null)), _rxjsCompatUmdMin.Observable.merge((0, _event().observableFromSubscribeFunction)(debugService.onDidChangeDebuggerSessions.bind(debugService)), (0, _event().observableFromSubscribeFunction)(this._projectStore.onChange.bind(this._projectStore))).switchMap(() => {
        let disabledMsg = null;

        if (!this._projectStore.isCurrentSettingDebuggable()) {
          disabledMsg = this._projectStore.getDebugMode() === 'webserver' ? 'Cannot debug this project: Your current working root is not a Hack root!' : 'Cannot debug this project: The current file is not a Hack/PHP file!';
        }

        if (this._projectStore.getDebugMode() === 'webserver' && debugService.getDebugSessions().some(c => c.adapterType === _nuclideDebuggerCommon().VsAdapterTypes.HHVM && c.targetUri === projectRoot)) {
          disabledMsg = 'The HHVM debugger is already attached to this server';
        }

        return _rxjsCompatUmdMin.Observable.of(getTask(disabledMsg));
      }));
    });

    const subscription = _rxjsCompatUmdMin.Observable.combineLatest(enabledObservable, tasksObservable).subscribe(([enabled, tasks]) => callback(enabled, tasks));

    this._projectStore.setProjectRoot(projectRoot);

    return new (_UniversalDisposable().default)(subscription);
  }

}

exports.default = HhvmBuildSystem;