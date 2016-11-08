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

var _LlbuildYamlParser;

function _load_LlbuildYamlParser() {
  return _LlbuildYamlParser = require('./LlbuildYamlParser');
}

var _SwiftPMTaskRunnerDispatcher;

function _load_SwiftPMTaskRunnerDispatcher() {
  return _SwiftPMTaskRunnerDispatcher = require('./SwiftPMTaskRunnerDispatcher');
}

let SwiftPMTaskRunnerActions = class SwiftPMTaskRunnerActions {

  constructor(dispatcher) {
    this._dispatcher = dispatcher;
  }

  updateChdir(chdir) {
    this._dispatcher.dispatch({
      actionType: (_SwiftPMTaskRunnerDispatcher || _load_SwiftPMTaskRunnerDispatcher()).ActionTypes.UPDATE_CHDIR,
      chdir: chdir
    });
  }

  updateBuildSettings(configuration, Xcc, Xlinker, Xswiftc, buildPath) {
    this._dispatcher.dispatch({
      actionType: (_SwiftPMTaskRunnerDispatcher || _load_SwiftPMTaskRunnerDispatcher()).ActionTypes.UPDATE_BUILD_SETTINGS,
      configuration: configuration,
      Xcc: Xcc,
      Xlinker: Xlinker,
      Xswiftc: Xswiftc,
      buildPath: buildPath
    });
  }

  updateTestSettings(buildPath) {
    this._dispatcher.dispatch({
      actionType: (_SwiftPMTaskRunnerDispatcher || _load_SwiftPMTaskRunnerDispatcher()).ActionTypes.UPDATE_TEST_SETTINGS,
      buildPath: buildPath
    });
  }

  updateCompileCommands(chdir, configuration, buildPath) {
    const yamlPath = (0, (_LlbuildYamlParser || _load_LlbuildYamlParser()).llbuildYamlPath)(chdir, configuration, buildPath);
    let compileCommandsPromise;
    try {
      compileCommandsPromise = (0, (_LlbuildYamlParser || _load_LlbuildYamlParser()).readCompileCommands)(yamlPath);
    } catch (e) {
      atom.notifications.addError('The YAML produced by the Swift package manager is malformed', {
        description: `Nuclide could not parse the YAML file at \`${ yamlPath }\`. ` + 'Please file a bug, and include the contents of the file in ' + 'your report.'
      });
      return;
    }
    compileCommandsPromise.then(compileCommands => {
      this._dispatcher.dispatch({
        actionType: (_SwiftPMTaskRunnerDispatcher || _load_SwiftPMTaskRunnerDispatcher()).ActionTypes.UPDATE_COMPILE_COMMANDS,
        compileCommands: compileCommands
      });
    });
  }
};
exports.default = SwiftPMTaskRunnerActions;
module.exports = exports['default'];