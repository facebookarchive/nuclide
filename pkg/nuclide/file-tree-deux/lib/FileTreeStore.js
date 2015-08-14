'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {Emitter} = require('atom');
var {ActionType} = require('./FileTreeActions');
var FileTreeDispatcher = require('./FileTreeDispatcher');

import type {Dispatcher} from 'flux';
import type {Disposable} from 'atom';

type Payload = Object;
type ChangeListener = () => mixed;
type StoreData = {
  rootDirectories: Array<string>,
};

var instance: FileTreeStore;

/*
 * Implements the Flux pattern for our file tree. All state for the file tree will be kept in
 * FileTreeStore and the only way to update the store is through methods on FileTreeActions. The
 * dispatcher is a mechanism through which FileTreeActions interfaces with FileTreeStore.
 */
class FileTreeStore {
  _data: StoreData;
  _dispatcher: Dispatcher;
  _emitter: Emitter;

  static getInstance(): FileTreeStore {
    if (!instance) {
      instance = new FileTreeStore();
    }
    return instance;
  }

  constructor() {
    this._data = this._getDefaults();
    this._dispatcher = FileTreeDispatcher.getInstance();
    this._emitter = new Emitter();
    this._dispatcher.register(
      payload => this._onDispatch(payload)
    );
  }

  _getDefaults(): StoreData {
    return {
      rootDirectories: [],
    };
  }

  _onDispatch(payload: Payload): void {
    switch (payload.actionType) {
      case ActionType.SET_ROOT_DIRECTORIES:
        this._set('rootDirectories', payload.directories);
        break;
    }
  }

  // This is a private method because in Flux we should never externally write to the data store.
  // Only by receiving actions (from dispatcher) should the data store be changed.
  _set(key: string, value: mixed): void {
    var oldValue = this._data[key];
    if (value !== oldValue) {
      // shallow copy rather than mutate
      this._data = {...this._data};
      this._data[key] = value;
      this._emitter.emit('change');
    }
  }

  get(key: string): mixed {
    return this._data[key];
  }

  getRootDirectories(): Array<atom$Directory> {
    return this._data.rootDirectories;
  }

  subscribe(listener: ChangeListener): Disposable {
    return this._emitter.on('change', listener);
  }
}

module.exports = FileTreeStore;
