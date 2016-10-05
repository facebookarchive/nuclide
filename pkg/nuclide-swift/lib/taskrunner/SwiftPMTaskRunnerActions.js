Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _LlbuildYamlParser2;

function _LlbuildYamlParser() {
  return _LlbuildYamlParser2 = require('./LlbuildYamlParser');
}

var _SwiftPMTaskRunnerDispatcher2;

function _SwiftPMTaskRunnerDispatcher() {
  return _SwiftPMTaskRunnerDispatcher2 = require('./SwiftPMTaskRunnerDispatcher');
}

var SwiftPMTaskRunnerActions = (function () {
  function SwiftPMTaskRunnerActions(dispatcher) {
    _classCallCheck(this, SwiftPMTaskRunnerActions);

    this._dispatcher = dispatcher;
  }

  _createClass(SwiftPMTaskRunnerActions, [{
    key: 'updateChdir',
    value: function updateChdir(chdir) {
      this._dispatcher.dispatch({
        actionType: (_SwiftPMTaskRunnerDispatcher2 || _SwiftPMTaskRunnerDispatcher()).ActionTypes.UPDATE_CHDIR,
        chdir: chdir
      });
    }
  }, {
    key: 'updateBuildSettings',
    value: function updateBuildSettings(configuration, Xcc, Xlinker, Xswiftc, buildPath) {
      this._dispatcher.dispatch({
        actionType: (_SwiftPMTaskRunnerDispatcher2 || _SwiftPMTaskRunnerDispatcher()).ActionTypes.UPDATE_BUILD_SETTINGS,
        configuration: configuration,
        Xcc: Xcc,
        Xlinker: Xlinker,
        Xswiftc: Xswiftc,
        buildPath: buildPath
      });
    }
  }, {
    key: 'updateTestSettings',
    value: function updateTestSettings(buildPath) {
      this._dispatcher.dispatch({
        actionType: (_SwiftPMTaskRunnerDispatcher2 || _SwiftPMTaskRunnerDispatcher()).ActionTypes.UPDATE_TEST_SETTINGS,
        buildPath: buildPath
      });
    }
  }, {
    key: 'updateCompileCommands',
    value: function updateCompileCommands(chdir, configuration, buildPath) {
      var _this = this;

      var yamlPath = (0, (_LlbuildYamlParser2 || _LlbuildYamlParser()).llbuildYamlPath)(chdir, configuration, buildPath);
      var compileCommandsPromise = undefined;
      try {
        compileCommandsPromise = (0, (_LlbuildYamlParser2 || _LlbuildYamlParser()).readCompileCommands)(yamlPath);
      } catch (e) {
        atom.notifications.addError('The YAML produced by the Swift package manager is malformed', {
          description: 'Nuclide could not parse the YAML file at `' + yamlPath + '`. ' + 'Please file a bug, and include the contents of the file in ' + 'your report.'
        });
        return;
      }
      compileCommandsPromise.then(function (compileCommands) {
        _this._dispatcher.dispatch({
          actionType: (_SwiftPMTaskRunnerDispatcher2 || _SwiftPMTaskRunnerDispatcher()).ActionTypes.UPDATE_COMPILE_COMMANDS,
          compileCommands: compileCommands
        });
      });
    }
  }]);

  return SwiftPMTaskRunnerActions;
})();

exports.default = SwiftPMTaskRunnerActions;
module.exports = exports.default;