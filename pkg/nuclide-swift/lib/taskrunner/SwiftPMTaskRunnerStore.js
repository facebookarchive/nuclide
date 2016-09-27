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

var _commonsNodeCollection2;

function _commonsNodeCollection() {
  return _commonsNodeCollection2 = require('../../../commons-node/collection');
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _SwiftPMTaskRunnerDispatcher2;

function _SwiftPMTaskRunnerDispatcher() {
  return _SwiftPMTaskRunnerDispatcher2 = require('./SwiftPMTaskRunnerDispatcher');
}

var SwiftPMTaskRunnerStore = (function () {
  function SwiftPMTaskRunnerStore(dispatcher, initialState) {
    var _this = this;

    _classCallCheck(this, SwiftPMTaskRunnerStore);

    this._dispatcher = dispatcher;
    this._emitter = new (_atom2 || _atom()).Emitter();

    if (initialState) {
      this._chdir = initialState.chdir ? initialState.chdir : '';
      this._configuration = initialState.configuration ? initialState.configuration : 'debug';
      this._buildPath = initialState.buildPath ? initialState.buildPath : '';
      this._Xcc = initialState.Xcc ? initialState.Xcc : '';
      this._Xlinker = initialState.Xlinker ? initialState.Xlinker : '';
      this._Xswiftc = initialState.Xswiftc ? initialState.Xswiftc : '';
      this._testBuildPath = initialState.testBuildPath ? initialState.testBuildPath : '';
      this._compileCommands = initialState.compileCommands ? new Map((0, (_commonsNodeCollection2 || _commonsNodeCollection()).objectEntries)(initialState.compileCommands)) : new Map();
    } else {
      this._chdir = '';
      this._configuration = 'debug';
      this._buildPath = '';
      this._Xcc = '';
      this._Xlinker = '';
      this._Xswiftc = '';
      this._testBuildPath = '';
      this._compileCommands = new Map();
    }

    this._dispatcher.register(function (action) {
      switch (action.actionType) {
        case (_SwiftPMTaskRunnerDispatcher2 || _SwiftPMTaskRunnerDispatcher()).ActionTypes.UPDATE_CHDIR:
          _this._chdir = action.chdir;
          break;
        case (_SwiftPMTaskRunnerDispatcher2 || _SwiftPMTaskRunnerDispatcher()).ActionTypes.UPDATE_BUILD_SETTINGS:
          _this._configuration = action.configuration;
          _this._Xcc = action.Xcc;
          _this._Xlinker = action.Xlinker;
          _this._Xswiftc = action.Xswiftc;
          _this._buildPath = action.buildPath;
          break;
        case (_SwiftPMTaskRunnerDispatcher2 || _SwiftPMTaskRunnerDispatcher()).ActionTypes.UPDATE_TEST_SETTINGS:
          _this._testBuildPath = action.buildPath;
          break;
        case (_SwiftPMTaskRunnerDispatcher2 || _SwiftPMTaskRunnerDispatcher()).ActionTypes.UPDATE_COMPILE_COMMANDS:
          _this._compileCommands = action.compileCommands;
          break;
      }
    });
  }

  _createClass(SwiftPMTaskRunnerStore, [{
    key: 'dispose',
    value: function dispose() {
      this._emitter.dispose();
    }
  }, {
    key: 'serialize',
    value: function serialize() {
      return {
        chdir: this.getChdir(),
        configuration: this.getConfiguration(),
        buildPath: this.getBuildPath(),
        Xcc: this.getXcc(),
        Xlinker: this.getXlinker(),
        Xswiftc: this.getXswiftc(),
        compileCommands: (0, (_commonsNodeCollection2 || _commonsNodeCollection()).objectFromMap)(this.getCompileCommands()),
        testBuildPath: this.getTestBuildPath()
      };
    }
  }, {
    key: 'subscribe',
    value: function subscribe(callback) {
      return this._emitter.on('change', callback);
    }
  }, {
    key: 'emitChange',
    value: function emitChange() {
      this._emitter.emit('change');
    }
  }, {
    key: 'getChdir',
    value: function getChdir() {
      return this._chdir;
    }
  }, {
    key: 'getConfiguration',
    value: function getConfiguration() {
      return this._configuration;
    }
  }, {
    key: 'getBuildPath',
    value: function getBuildPath() {
      return this._buildPath;
    }
  }, {
    key: 'getFlag',
    value: function getFlag() {
      return this._flag;
    }
  }, {
    key: 'getXcc',
    value: function getXcc() {
      return this._Xcc;
    }
  }, {
    key: 'getXlinker',
    value: function getXlinker() {
      return this._Xlinker;
    }
  }, {
    key: 'getXswiftc',
    value: function getXswiftc() {
      return this._Xswiftc;
    }
  }, {
    key: 'getTestBuildPath',
    value: function getTestBuildPath() {
      return this._testBuildPath;
    }
  }, {
    key: 'getCompileCommands',
    value: function getCompileCommands() {
      return this._compileCommands;
    }
  }]);

  return SwiftPMTaskRunnerStore;
})();

exports.default = SwiftPMTaskRunnerStore;
module.exports = exports.default;