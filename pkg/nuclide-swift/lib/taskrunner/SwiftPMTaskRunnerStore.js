'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {SwiftPMTaskRunnerStoreState} from './SwiftPMTaskRunnerStoreState';

import {Emitter} from 'atom';
import {Dispatcher} from 'flux';
import SwiftPMTaskRunnerActions from './SwiftPMTaskRunnerActions';

export default class SwiftPMTaskRunnerStore {
  _dispatcher: Dispatcher;
  _emitter: Emitter;
  _chdir: string;
  _configuration: string;
  _buildPath: string;
  _flag: string;
  _Xcc: string;
  _Xlinker: string;
  _Xswiftc: string;
  _testBuildPath: string;
  _compileCommands: Promise<Map<string, string>>;

  constructor(dispatcher: Dispatcher, initialState: ?SwiftPMTaskRunnerStoreState) {
    this._dispatcher = dispatcher;
    this._emitter = new Emitter();

    if (initialState) {
      this._chdir = initialState.chdir ? initialState.chdir : '';
      this._configuration = initialState.configuration ? initialState.configuration : 'debug';
      this._buildPath = initialState.buildPath ? initialState.buildPath : '';
      this._Xcc = initialState.Xcc ? initialState.Xcc : '';
      this._Xlinker = initialState.Xlinker ? initialState.Xlinker : '';
      this._Xswiftc = initialState.Xswiftc ? initialState.Xswiftc : '';
      this._testBuildPath = initialState.testBuildPath ? initialState.testBuildPath : '';
    } else {
      this._chdir = '';
      this._configuration = 'debug';
      this._buildPath = '';
      this._Xcc = '';
      this._Xlinker = '';
      this._Xswiftc = '';
      this._testBuildPath = '';
    }

    this._dispatcher.register(action => {
      switch (action.actionType) {
        case SwiftPMTaskRunnerActions.ActionType.UPDATE_CHDIR:
          this._chdir = action.chdir;
          break;
        case SwiftPMTaskRunnerActions.ActionType.UPDATE_BUILD_SETTINGS:
          this._configuration = action.configuration;
          this._Xcc = action.Xcc;
          this._Xlinker = action.Xlinker;
          this._Xswiftc = action.Xswiftc;
          this._buildPath = action.buildPath;
          break;
        case SwiftPMTaskRunnerActions.ActionType.UPDATE_TEST_SETTINGS:
          this._testBuildPath = action.buildPath;
          break;
      }
    });
  }

  dispose() {
    this._emitter.dispose();
  }

  serialize(): SwiftPMTaskRunnerStoreState {
    return {
      chdir: this.getChdir(),
      configuration: this.getConfiguration(),
      buildPath: this.getBuildPath(),
      Xcc: this.getXcc(),
      Xlinker: this.getXlinker(),
      Xswiftc: this.getXswiftc(),
      testBuildPath: this.getTestBuildPath(),
    };
  }

  subscribe(callback: () => void): IDisposable {
    return this._emitter.on('change', callback);
  }

  emitChange(): void {
    this._emitter.emit('change');
  }

  getChdir(): string {
    return this._chdir;
  }

  getConfiguration(): string {
    return this._configuration;
  }

  getBuildPath(): string {
    return this._buildPath;
  }

  getFlag(): string {
    return this._flag;
  }

  getXcc(): string {
    return this._Xcc;
  }

  getXlinker(): string {
    return this._Xlinker;
  }

  getXswiftc(): string {
    return this._Xswiftc;
  }

  getTestBuildPath(): string {
    return this._testBuildPath;
  }
}
