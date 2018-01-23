'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _collection;

function _load_collection() {
  return _collection = require('nuclide-commons/collection');
}

var _atom = require('atom');

var _SwiftPMTaskRunnerDispatcher;

function _load_SwiftPMTaskRunnerDispatcher() {
  return _SwiftPMTaskRunnerDispatcher = require('./SwiftPMTaskRunnerDispatcher');
}

class SwiftPMTaskRunnerStore {

  constructor(dispatcher, initialState) {
    this._dispatcher = dispatcher;
    this._emitter = new _atom.Emitter();

    if (initialState) {
      this._configuration = initialState.configuration ? initialState.configuration : 'debug';
      this._buildPath = initialState.buildPath ? initialState.buildPath : '';
      this._Xcc = initialState.Xcc ? initialState.Xcc : '';
      this._Xlinker = initialState.Xlinker ? initialState.Xlinker : '';
      this._Xswiftc = initialState.Xswiftc ? initialState.Xswiftc : '';
      this._compileCommands = initialState.compileCommands ? new Map((0, (_collection || _load_collection()).objectEntries)(initialState.compileCommands)) : new Map();
    } else {
      this._configuration = 'debug';
      this._buildPath = '';
      this._Xcc = '';
      this._Xlinker = '';
      this._Xswiftc = '';
      this._compileCommands = new Map();
    }

    this._dispatcher.register(action => {
      switch (action.actionType) {
        case (_SwiftPMTaskRunnerDispatcher || _load_SwiftPMTaskRunnerDispatcher()).ActionTypes.UPDATE_PROJECT_ROOT:
          this._projectRoot = action.projectRoot;
          break;
        case (_SwiftPMTaskRunnerDispatcher || _load_SwiftPMTaskRunnerDispatcher()).ActionTypes.UPDATE_SETTINGS:
          this._configuration = action.configuration;
          this._Xcc = action.Xcc;
          this._Xlinker = action.Xlinker;
          this._Xswiftc = action.Xswiftc;
          this._buildPath = action.buildPath;
          break;
        case (_SwiftPMTaskRunnerDispatcher || _load_SwiftPMTaskRunnerDispatcher()).ActionTypes.UPDATE_COMPILE_COMMANDS:
          this._compileCommands = action.compileCommands;
          break;
      }
      this.emitChange();
    });
  }

  dispose() {
    this._emitter.dispose();
  }

  serialize() {
    return {
      configuration: this.getConfiguration(),
      buildPath: this.getBuildPath(),
      Xcc: this.getXcc(),
      Xlinker: this.getXlinker(),
      Xswiftc: this.getXswiftc(),
      compileCommands: (0, (_collection || _load_collection()).objectFromMap)(this.getCompileCommands())
    };
  }

  subscribe(callback) {
    return this._emitter.on('change', callback);
  }

  emitChange() {
    this._emitter.emit('change');
  }

  getConfiguration() {
    return this._configuration;
  }

  getBuildPath() {
    return this._buildPath;
  }

  getProjectRoot() {
    return this._projectRoot;
  }

  getFlag() {
    return this._flag;
  }

  getXcc() {
    return this._Xcc;
  }

  getXlinker() {
    return this._Xlinker;
  }

  getXswiftc() {
    return this._Xswiftc;
  }

  getCompileCommands() {
    return this._compileCommands;
  }
}
exports.default = SwiftPMTaskRunnerStore; /**
                                           * Copyright (c) 2015-present, Facebook, Inc.
                                           * All rights reserved.
                                           *
                                           * This source code is licensed under the license found in the LICENSE file in
                                           * the root directory of this source tree.
                                           *
                                           * 
                                           * @format
                                           */