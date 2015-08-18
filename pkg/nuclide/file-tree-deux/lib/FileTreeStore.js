'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {Disposable, Emitter} = require('atom');
var {ActionType} = require('./FileTreeConstants');
var FileTreeDispatcher = require('./FileTreeDispatcher');
var FileTreeHelpers = require('./FileTreeHelpers');
var FileTreeNode = require('./FileTreeNode');
var Immutable = require('immutable');

import type {Dispatcher} from 'flux';

type ActionPayload = Object;
type ChangeListener = () => mixed;
type StoreData = {
  childKeyMap: { [key: string]: Array<string> },
  expandedKeysByRoot: { [key: string]: Immutable.Set<string> },
  isLoadingMap: { [key: string]: ?Promise },
  rootKeys: Array<string>,
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
      childKeyMap: {},
      expandedKeysByRoot: {},
      isLoadingMap: {},
      rootKeys: [],
    };
  }

  _onDispatch(payload: ActionPayload): void {
    switch (payload.actionType) {
      case ActionType.SET_ROOT_KEYS:
        this._set('rootKeys', payload.rootKeys);
        break;
      case ActionType.EXPAND_NODE:
        var rootKey = payload.rootKey;
        this._setExpandedKeys(rootKey, this._getExpandedKeys(rootKey).add(payload.nodeKey));
        break;
      case ActionType.COLLAPSE_NODE:
        var rootKey = payload.rootKey;
        this._setExpandedKeys(rootKey, this._getExpandedKeys(rootKey).delete(payload.nodeKey));
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

  getRootKeys(): Array<string> {
    return this._data.rootKeys;
  }

  // Note: We actually don't need rootKey (implementation detail) but we take it for consistency.
  isLoading(rootKey: string, nodeKey: string): boolean {
    return !!this._getLoading(nodeKey);
  }

  isExpanded(rootKey: string, nodeKey: string): boolean {
    return this._getExpandedKeys(rootKey).has(nodeKey);
  }

  getChildKeys(rootKey: string, nodeKey: string): Array<string> {
    var childKeys = this._data.childKeyMap[nodeKey];
    if (childKeys == null) {
      this._fetchChildKeys(nodeKey);
    }
    return childKeys || [];
  }

  // If a fetch is not already in progress initiate a fetch now.
  _fetchChildKeys(nodeKey: string): Promise {
    var existingPromise = this._getLoading(nodeKey);
    if (existingPromise) {
      return existingPromise;
    }
    var promise = FileTreeHelpers.fetchChildren(nodeKey);
    // TODO: onReject
    promise = promise.then((keys) => {
      this._setChildKeys(nodeKey, keys);
      this._setLoading(nodeKey, null);
    });
    this._setLoading(nodeKey, promise);
    return promise;
  }

  getRootNode(rootKey: string): FileTreeNode {
    return this.getNode(rootKey, rootKey);
  }

  getNode(rootKey: string, nodeKey: string): FileTreeNode {
    return new FileTreeNode(this, rootKey, nodeKey);
  }

  _getLoading(nodeKey: string): ?Promise {
    return this._data.isLoadingMap[nodeKey];
  }

  _setLoading(nodeKey: string, value: ?Promise): void {
    this._set('isLoadingMap', setProperty(this._data.isLoadingMap, nodeKey, value));
  }

  _getExpandedKeys(rootKey: string): Immutable.Set<string> {
    return this._data.expandedKeysByRoot[rootKey] || new Immutable.Set();
  }

  _setExpandedKeys(rootKey: string, expandedKeys: Immutable.Set<string>): void {
    this._set(
      'expandedKeysByRoot',
      setProperty(this._data.expandedKeysByRoot, rootKey, expandedKeys)
    );
  }

  _setChildKeys(nodeKey: string, childKeys: ?Array<string>): void {
    var oldChildKeys = this._data.childKeyMap[nodeKey];
    if (oldChildKeys && oldChildKeys.length) {
      // TODO: cleanup removed children
    }
    this._set('childKeyMap', setProperty(this._data.childKeyMap, nodeKey, childKeys));
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
