'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _LlbuildYamlParser;

function _load_LlbuildYamlParser() {
  return _LlbuildYamlParser = require('./LlbuildYamlParser');
}

var _SwiftPMTaskRunnerDispatcher;

function _load_SwiftPMTaskRunnerDispatcher() {
  return _SwiftPMTaskRunnerDispatcher = require('./SwiftPMTaskRunnerDispatcher');
}

class SwiftPMTaskRunnerActions {

  constructor(dispatcher) {
    this._dispatcher = dispatcher;
  }

  updateProjectRoot(projectRoot) {
    this._dispatcher.dispatch({
      actionType: (_SwiftPMTaskRunnerDispatcher || _load_SwiftPMTaskRunnerDispatcher()).ActionTypes.UPDATE_PROJECT_ROOT,
      projectRoot
    });
  }

  updateSettings(configuration, Xcc, Xlinker, Xswiftc, buildPath) {
    this._dispatcher.dispatch({
      actionType: (_SwiftPMTaskRunnerDispatcher || _load_SwiftPMTaskRunnerDispatcher()).ActionTypes.UPDATE_SETTINGS,
      configuration,
      Xcc,
      Xlinker,
      Xswiftc,
      buildPath
    });
  }

  updateCompileCommands(chdir, configuration, buildPath) {
    const yamlPath = (0, (_LlbuildYamlParser || _load_LlbuildYamlParser()).llbuildYamlPath)(chdir, configuration, buildPath);
    let compileCommandsPromise;
    try {
      compileCommandsPromise = (0, (_LlbuildYamlParser || _load_LlbuildYamlParser()).readCompileCommands)(yamlPath);
    } catch (e) {
      atom.notifications.addError('The YAML produced by the Swift package manager is malformed', {
        description: `Nuclide could not parse the YAML file at \`${yamlPath}\`. ` + 'Please file a bug, and include the contents of the file in ' + 'your report.'
      });
      return;
    }
    compileCommandsPromise.then(compileCommands => {
      this._dispatcher.dispatch({
        actionType: (_SwiftPMTaskRunnerDispatcher || _load_SwiftPMTaskRunnerDispatcher()).ActionTypes.UPDATE_COMPILE_COMMANDS,
        compileCommands
      });
    });
  }
}
exports.default = SwiftPMTaskRunnerActions; /**
                                             * Copyright (c) 2015-present, Facebook, Inc.
                                             * All rights reserved.
                                             *
                                             * This source code is licensed under the license found in the LICENSE file in
                                             * the root directory of this source tree.
                                             *
                                             * 
                                             * @format
                                             */