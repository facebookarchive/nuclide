"use strict";

function _createPackage() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/createPackage"));

  _createPackage = function () {
    return data;
  };

  return data;
}

function _registerGrammar() {
  const data = _interopRequireDefault(require("../../commons-atom/register-grammar"));

  _registerGrammar = function () {
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

function _buildFiles() {
  const data = require("./buildFiles");

  _buildFiles = function () {
    return data;
  };

  return data;
}

function _HyperclickProvider() {
  const data = require("./HyperclickProvider");

  _HyperclickProvider = function () {
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

function _BuckTaskRunner() {
  const data = require("./BuckTaskRunner");

  _BuckTaskRunner = function () {
    return data;
  };

  return data;
}

function _PlatformService() {
  const data = require("./PlatformService");

  _PlatformService = function () {
    return data;
  };

  return data;
}

function _BuckClangProvider() {
  const data = require("./BuckClangProvider");

  _BuckClangProvider = function () {
    return data;
  };

  return data;
}

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
const OPEN_NEAREST_BUILD_FILE_COMMAND = 'nuclide-buck:open-nearest-build-file';

class Activation {
  constructor(rawState) {
    this._initialState = null;
    this._taskRunner = new (_BuckTaskRunner().BuckTaskRunner)(rawState);
    this._disposables = new (_UniversalDisposable().default)(atom.commands.add('atom-workspace', OPEN_NEAREST_BUILD_FILE_COMMAND, event => {
      (0, _nuclideAnalytics().track)(OPEN_NEAREST_BUILD_FILE_COMMAND); // Add feature logging.

      const target = event.target;
      (0, _buildFiles().openNearestBuildFile)(target); // Note this returns a Promise.
    }), this._taskRunner);
    (0, _registerGrammar().default)('source.python', ['BUCK']);
    (0, _registerGrammar().default)('source.json', ['BUCK.autodeps']);
    (0, _registerGrammar().default)('source.ini', ['.buckconfig']);
  }

  dispose() {
    this._disposables.dispose();
  }

  consumeTaskRunnerServiceApi(api) {
    this._printToConsole = message => api.printToConsole(message, this._taskRunner);

    this._disposables.add(new (_UniversalDisposable().default)(api.register(this._taskRunner), () => this._printToConsole = null));
  }

  consumeBusySignal(service) {
    this._busySignalService = service;
    return new (_UniversalDisposable().default)(() => {
      this._busySignalService = null;
    });
  }

  provideObservableDiagnosticUpdates() {
    return this._taskRunner.getBuildSystem().getDiagnosticProvider();
  }

  serialize() {
    return this._taskRunner.serialize();
  }

  getHyperclickProvider() {
    return {
      priority: 200,
      providerName: 'nuclide-buck',

      getSuggestion(editor, position) {
        return (0, _HyperclickProvider().getSuggestion)(editor, position);
      }

    };
  }

  provideBuckBuilder() {
    return this._taskRunner.getBuildSystem();
  }

  provideBuckTaskRunnerService() {
    return {
      getBuildTarget: () => this._taskRunner.getBuildTarget(),
      setBuildTarget: buildTarget => this._taskRunner.setBuildTarget(buildTarget),
      setDeploymentTarget: preferredNames => this._taskRunner.setDeploymentTarget(preferredNames),
      onDidCompleteTask: callback => {
        return new (_UniversalDisposable().default)(this._taskRunner.getCompletedTasks().subscribe(callback));
      }
    };
  }

  providePlatformService() {
    return this._taskRunner.getPlatformService();
  }

  provideClangConfiguration() {
    return (0, _BuckClangProvider().getClangProvider)(this._taskRunner, () => this._busySignalService, () => this._printToConsole);
  }

}

(0, _createPackage().default)(module.exports, Activation);