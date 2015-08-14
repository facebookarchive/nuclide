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
var {ActionType} = require('./FileTreeConstants');
var FileTreeDispatcher = require('./FileTreeDispatcher');
var FileTreeHelpers = require('./FileTreeHelpers');

import type {Dispatcher} from 'flux';

type ActionPayload = Object;
type ChangeListener = () => mixed;
type StoreData = {
  childrenMap: { [key: string]: Array<string> },
  isLoadingMap: { [key: string]: ?Promise },
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
  _timer: ?Object;

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
      childrenMap: {},
      isLoadingMap: {},
      rootDirectories: [],
    };
  }

  _onDispatch(payload: ActionPayload): void {
    switch (payload.actionType) {
      case ActionType.SET_ROOT_DIRECTORIES:
        this._set('rootDirectories', payload.rootDirectories);
        break;
    }
  }

  // This is a private method because in Flux we should never externally write to the data store.
  // Only by receiving actions (from dispatcher) should the data store be changed.
  _set(key: string, value: mixed): void {
    var oldData = this._data;
    // Immutability for the win!
    var newData = setProperty(this._data, key, value);
    if (newData !== oldData) {
      this._data = newData;
      // de-bounce to prevent successive application updates in the same event loop
      clearImmediate(this._timer);
      this._timer = setImmediate(() => {
        this._emitter.emit('change');
      });
    }
  }

  // Used only for testing
  getData(): StoreData {
    return this._data;
  }

  getRootDirectories(): Array<string> {
    return this._data.rootDirectories;
  }

  // Note: We actually don't need the first parameter (implementation detail) but we take it
  // for consistency.
  isLoading(rootKey: string, nodeKey: string): boolean {
    return !!this._getLoading(nodeKey);
  }

  isExpanded(rootKey: string, nodeKey: string): boolean {
    return true; // for now
  }

  getChildren(rootKey: string, nodeKey: string): Array<string> {
    // Note: `children` and `isLoading` are not organized by `rootKey`.
    var children = this._data.childrenMap[nodeKey];
    if (children == null) {
      // If a fetch is not already in progress we need to initiate now.
      if (!this._getLoading(nodeKey)) {
        var promise = FileTreeHelpers.fetchChildren(nodeKey);
        // TODO: onReject
        promise = promise.then((childKeys) => {
          this._setChildren(nodeKey, childKeys);
          this._setLoading(nodeKey, null);
        });
        this._setLoading(nodeKey, promise);
      }
    }
    return children || [];
  }

  _getLoading(nodeKey: string): ?Promise {
    return this._data.isLoadingMap[nodeKey];
  }

  _setLoading(nodeKey: string, promise: ?Promise): void {
    this._set('isLoadingMap', setProperty(this._data.isLoadingMap, nodeKey, promise));
  }

  _setChildren(nodeKey: string, children: ?Array<string>): void {
    this._set('childrenMap', setProperty(this._data.childrenMap, nodeKey, children));
  }

  subscribe(listener: ChangeListener): Disposable {
    return this._emitter.on('change', listener);
  }
}

// An easy way to set a property in an object using shallow copy rather than mutation
function setProperty(object: Object, key: string, newValue: mixed) {
  var oldValue = object[key];
  if (oldValue === newValue) {
    return object;
  }
  var newObject = {...object};
  newObject[key] = newValue;
  return newObject;
}

module.exports = FileTreeStore;
