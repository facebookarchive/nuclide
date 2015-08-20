'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {ActionType} = require('./FileTreeConstants');
var {Disposable, Emitter} = require('atom');
var FileTreeDispatcher = require('./FileTreeDispatcher');
var FileTreeHelpers = require('./FileTreeHelpers');
var FileTreeNode = require('./FileTreeNode');
var Immutable = require('immutable');
var Logging = require('nuclide-logging');

var {array} = require('nuclide-commons');

import type {Dispatcher} from 'flux';

type ActionPayload = Object;
type ChangeListener = () => mixed;
type StoreData = {
  childKeyMap: { [key: string]: Array<string> },
  expandedKeysByRoot: { [key: string]: Immutable.Set<string> },
  isLoadingMap: { [key: string]: ?Promise },
  rootKeys: Array<string>,
  selectedKeysByRoot: { [key: string]: Immutable.Set<string> },
  subscriptionMap: { [key: string]: Disposable },
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
  _logger: any;
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
    this._logger = Logging.getLogger();
  }

  _getDefaults(): StoreData {
    return {
      childKeyMap: {},
      expandedKeysByRoot: {},
      isLoadingMap: {},
      rootKeys: [],
      selectedKeysByRoot: {},
      subscriptionMap: {},
    };
  }

  _onDispatch(payload: ActionPayload): void {
    switch (payload.actionType) {
      case ActionType.SET_ROOT_KEYS:
        this._setRootKeys(payload.rootKeys);
        break;
      case ActionType.EXPAND_NODE:
        var rootKey = payload.rootKey;
        this._setExpandedKeys(rootKey, this._getExpandedKeys(rootKey).add(payload.nodeKey));
        break;
      case ActionType.COLLAPSE_NODE:
        var rootKey = payload.rootKey;
        this._setExpandedKeys(rootKey, this._getExpandedKeys(rootKey).delete(payload.nodeKey));
        break;
      case ActionType.SET_SELECTED_NODES:
        var rootKey = payload.rootKey;
        this._setSelectedKeys(rootKey, payload.nodeKeys);
        break;
      case ActionType.CREATE_CHILD:
        this._setChildKeys(payload.nodeKey, [payload.childKey]);
        break;
    }
  }

  // This is a private method because in Flux we should never externally write to the data store.
  // Only by receiving actions (from dispatcher) should the data store be changed.
  // Note: `_set` can be called multiple times within one iteration of an event loop without
  // thrashing the UI because we are using setImmediate to batch change notifications, effectively
  // letting our views re-render once for multiple consecutive writes.
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

  // Get the key of the *first* root node containing the given node.
  getRootForKey(nodeKey: string): ?string {
    return array.find(this._data.rootKeys, rootKey => nodeKey.startsWith(rootKey));
  }

  // Note: We actually don't need rootKey (implementation detail) but we take it for consistency.
  isLoading(rootKey: string, nodeKey: string): boolean {
    return !!this._getLoading(nodeKey);
  }

  isExpanded(rootKey: string, nodeKey: string): boolean {
    return this._getExpandedKeys(rootKey).has(nodeKey);
  }

  isSelected(rootKey: string, nodeKey: string): boolean {
    return this.getSelectedKeys(rootKey).has(nodeKey);
  }

  getChildKeys(rootKey: string, nodeKey: string): Array<string> {
    var childKeys = this._data.childKeyMap[nodeKey];
    if (childKeys == null) {
      this._fetchChildKeys(nodeKey);
    }
    return childKeys || [];
  }

  getSelectedKeys(rootKey: string): Immutable.Set<string> {
    return this._data.selectedKeysByRoot[rootKey] || new Immutable.Set();
  }

  getRootNode(rootKey: string): FileTreeNode {
    return this.getNode(rootKey, rootKey);
  }

  getNode(rootKey: string, nodeKey: string): FileTreeNode {
    return new FileTreeNode(this, rootKey, nodeKey);
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

  _setSelectedKeys(rootKey: string, selectedKeys: Immutable.Set<string>): void {
    this._set(
      'selectedKeysByRoot',
      setProperty(this._data.selectedKeysByRoot, rootKey, selectedKeys)
    );
  }

  _setRootKeys(rootKeys: Array<string>): void {
    var oldRootKeys = this._data.rootKeys;
    var newRootKeySet = new Set(rootKeys);
    oldRootKeys.forEach((rootKey) => {
      if (!newRootKeySet.has(rootKey)) {
        this._purgeDirectory(rootKey);
      }
    });
    var oldRootKeySet = new Set(oldRootKeys);
    rootKeys.forEach((rootKey) => {
      if (!oldRootKeySet.has(rootKey)) {
        this._addSubscription(rootKey);
      }
    });
    this._set('rootKeys', rootKeys);
  }

  _setChildKeys(nodeKey: string, childKeys: ?Array<string>): void {
    var oldChildKeys = this._data.childKeyMap[nodeKey];
    if (oldChildKeys) {
      var newChildKeySet = childKeys ? new Set(childKeys) : new Set();
      oldChildKeys.forEach((childKey) => {
        // if it's a directory and it doesn't exist in the new set of child keys
        if (FileTreeHelpers.isDirKey(childKey) && !newChildKeySet.has(childKey)) {
          this._purgeDirectory(childKey);
        }
      });
    }
    if (childKeys) {
      var oldChildKeySet = oldChildKeys ? new Set(oldChildKeys) : new Set();
      childKeys.forEach((childKey) => {
        // if it's a directory and it doesn't exist in the old set of child keys
        if (FileTreeHelpers.isDirKey(childKey) && !oldChildKeySet.has(childKey)) {
          this._addSubscription(childKey);
        }
      });
    }
    this._set('childKeyMap', setProperty(this._data.childKeyMap, nodeKey, childKeys));
  }

  _onDirectoryChange(nodeKey: string): void {
    this._fetchChildKeys(nodeKey);
  }

  _addSubscription(nodeKey: string): void {
    var directory = FileTreeHelpers.getDirectoryByKey(nodeKey);
    if (!directory) {
      return;
    }
    var subscription;
    try {
      // this call might fail if we try to watch a non-existing directory, or if
      // permission denied
      subscription = directory.onDidChange(() => {
        this._onDirectoryChange(nodeKey);
      });
    } catch (ex) {
      // Log error but proceed un-interrupted because there's not much else we can do here.
      this._logger.error(`Cannot subscribe to directory "${nodeKey}"`, ex);
      return;
    }
    this._set('subscriptionMap', setProperty(this._data.subscriptionMap, nodeKey, subscription));
  }

  _removeSubscription(nodeKey: string): void {
    var subscription = this._data.subscriptionMap[nodeKey];
    if (subscription) {
      subscription.dispose();
      this._set('subscriptionMap', setProperty(this._data.subscriptionMap, nodeKey, null));
    }
  }

  // If we purge a directory, then we need to purge it's descendent directoriess also. Purging
  // removes stuff from the data store including cached list of child nodes, subscriptions,
  // expanded directories and selected directories.
  _purgeDirectory(nodeKey: string): void {
    var childKeys = this._data.childKeyMap[nodeKey];
    if (childKeys) {
      childKeys.forEach((childKey) => {
        if (FileTreeHelpers.isDirKey(childKey)) {
          this._purgeDirectory(childKey);
        }
      });
      this._set('childKeyMap', setProperty(this._data.childKeyMap, nodeKey, null));
    }
    this._removeSubscription(nodeKey);
    var expandedKeysByRoot = this._data.expandedKeysByRoot;
    Object.keys(expandedKeysByRoot).forEach((rootKey) => {
      var expandedKeys = expandedKeysByRoot[rootKey];
      if (expandedKeys.has(nodeKey)) {
        this._setExpandedKeys(rootKey, expandedKeys.delete(nodeKey));
      }
    });
    var selectedKeysByRoot = this._data.selectedKeysByRoot;
    Object.keys(selectedKeysByRoot).forEach((rootKey) => {
      var selectedKeys = selectedKeysByRoot[rootKey];
      if (selectedKeys.has(nodeKey)) {
        this._setSelectedKeys(rootKey, selectedKeys.delete(nodeKey));
      }
    });
  }

  reset(): void {
    var subscriptionMap = this._data.subscriptionMap;
    for (var nodeKey of Object.keys(subscriptionMap)) {
      var subscription = subscriptionMap[nodeKey];
      if (subscription) {
        subscription.dispose();
      }
    }
    // Reset data store.
    this._data = this._getDefaults();
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
