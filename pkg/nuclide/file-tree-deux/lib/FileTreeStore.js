'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

 import type {
   RemoteDirectory,
   RemoteFile,
 } from 'nuclide-remote-connection';

var {ActionType} = require('./FileTreeConstants');
var {Disposable, Emitter} = require('atom');
var FileTreeDispatcher = require('./FileTreeDispatcher');
var FileTreeHelpers = require('./FileTreeHelpers');
var FileTreeNode = require('./FileTreeNode');
var Immutable = require('immutable');
var Logging = require('nuclide-logging');

var {array} = require('nuclide-commons');
var shell = require('shell');

// Used to ensure the version we serialized is the same version we are deserializing.
var VERSION = 1;

import type {Dispatcher} from 'flux';

type ActionPayload = Object;
type ChangeListener = () => mixed;
type StoreData = {
  childKeyMap: { [key: string]: Array<string> };
  isDirtyMap: { [key: string]: boolean };
  expandedKeysByRoot: { [key: string]: Immutable.Set<string> };
  // Saves a list of child nodes that should be expande when a given key is expanded.
  // Looks like: { rootKey: { nodeKey: [childKey1, childKey2] } }
  previouslyExpanded: { [key: string]: { [key: string]: Array<string> } };
  focusedRootKey: ?string;
  isLoadingMap: { [key: string]: ?Promise };
  rootKeys: Array<string>;
  selectedKeysByRoot: { [key: string]: Immutable.Set<string> };
  subscriptionMap: { [key: string]: Disposable };
};
export type ExportStoreData = {
  childKeyMap: { [key: string]: Array<string> };
  expandedKeysByRoot: { [key: string]: Array<string> };
  rootKeys: Array<string>;
  selectedKeysByRoot: { [key: string]: Array<string> };
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

  // TODO: Move to a serialization class [1] and use the built-in versioning mechanism. This might
  // need to be done one level higher within main.js.
  // 1: https://atom.io/docs/latest/behind-atom-serialization-in-atom
  exportData(): ExportStoreData {
    var data = this._data;
    // Grab the child keys of only the expanded nodes.
    var childKeyMap = {};
    Object.keys(data.expandedKeysByRoot).forEach((rootKey) => {
      var expandedKeySet = data.expandedKeysByRoot[rootKey];
      for (var nodeKey of expandedKeySet) {
        childKeyMap[nodeKey] = data.childKeyMap[nodeKey];
      }
    });
    return {
      version: VERSION,
      childKeyMap: childKeyMap,
      expandedKeysByRoot: mapValues(data.expandedKeysByRoot, (keySet) => keySet.toArray()),
      rootKeys: data.rootKeys,
      selectedKeysByRoot: mapValues(data.selectedKeysByRoot, (keySet) => keySet.toArray()),
    };
  }

  // This is used to import store data from a previous export
  loadData(data: ExportStoreData): void {
    // Ensure we are not trying to load data from an earlier version of this package.
    if (data.version !== VERSION) {
      return;
    }
    this._data = {
      childKeyMap: data.childKeyMap,
      isDirtyMap: {},
      expandedKeysByRoot: mapValues(data.expandedKeysByRoot, (keys) => new Immutable.Set(keys)),
      previouslyExpanded: {},
      focusedRootKey: null,
      isLoadingMap: {},
      rootKeys: data.rootKeys,
      selectedKeysByRoot: mapValues(data.selectedKeysByRoot, (keys) => new Immutable.Set(keys)),
      subscriptionMap: {},
    };
    Object.keys(data.childKeyMap).forEach((nodeKey) => {
      this._addSubscription(nodeKey);
      this._fetchChildKeys(nodeKey);
    });
  }

  _getDefaults(): StoreData {
    return {
      childKeyMap: {},
      isDirtyMap: {},
      expandedKeysByRoot: {},
      previouslyExpanded: {},
      focusedRootKey: null,
      isLoadingMap: {},
      rootKeys: [],
      selectedKeysByRoot: {},
      subscriptionMap: {},
    };
  }

  _onDispatch(payload: ActionPayload): void {
    switch (payload.actionType) {
      case ActionType.DELETE_SELECTED_NODES:
        this._deleteSelectedNodes();
        break;
      case ActionType.SET_ROOT_KEYS:
        this._setRootKeys(payload.rootKeys);
        break;
      case ActionType.SET_FOCUSED_ROOT:
        this._set('focusedRootKey', payload.rootKey);
        break;
      case ActionType.EXPAND_NODE:
        this._expandNode(payload.rootKey, payload.nodeKey);
        break;
      case ActionType.COLLAPSE_NODE:
        this._collapseNode(payload.rootKey, payload.nodeKey);
        break;
      case ActionType.SET_SELECTED_NODES_FOR_ROOT:
        this._setSelectedKeys(payload.rootKey, payload.nodeKeys);
        break;
      case ActionType.SET_SELECTED_NODES_FOR_TREE:
        this._setSelectedKeysByRoot(payload.selectedKeysByRoot);
        break;
      case ActionType.CREATE_CHILD:
        this._createChild(payload.nodeKey, payload.childKey);
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

  getFocusedRootKey(): ?string {
    return this._data.focusedRootKey || this._data.rootKeys[0];
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
    if (childKeys == null || this._data.isDirtyMap[nodeKey]) {
      this._fetchChildKeys(nodeKey);
    }
    return childKeys || [];
  }

  getSelectedKeys(rootKey: string): Immutable.Set<string> {
    return this._data.selectedKeysByRoot[rootKey] || new Immutable.Set();
  }

  getSelectedNodes(): Array<FileTreeNode> {
    var rootKey = this.getFocusedRootKey();
    if (!rootKey) {
      return [];
    }
    var selectedKeys = this.getSelectedKeys(rootKey).toArray();
    return selectedKeys.map(nodeKey => this.getNode(rootKey, nodeKey));
  }

  getSingleSelectedNode(): ?FileTreeNode {
    var rootKey = this.getFocusedRootKey();
    if (!rootKey) {
      return null;
    }
    var selectedKeys = this.getSelectedKeys(rootKey);
    /*
     * Note: This does not call `getSelectedNodes` to prevent creating nodes that would be thrown
     * away if there is more than 1 selected node.
     */
    return (selectedKeys.size === 1) ? this.getNode(rootKey, selectedKeys.first()) : null;
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
    promise.catch((error) => {
      this._logger.error(`Error fetching children for "${nodeKey}"`, error);
      // TODO: Notify the user and/or retry.
    });
    promise = promise.then(childKeys => {
      this._setChildKeys(nodeKey, childKeys);
      this._addSubscription(nodeKey);
      this._clearLoading(nodeKey);
    });
    this._setLoading(nodeKey, promise);
    return promise;
  }

  _getLoading(nodeKey: string): ?Promise {
    return this._data.isLoadingMap[nodeKey];
  }

  _setLoading(nodeKey: string, value: Promise): void {
    this._set('isLoadingMap', setProperty(this._data.isLoadingMap, nodeKey, value));
  }

  _clearLoading(nodeKey: string): void {
    this._set('isLoadingMap', deleteProperty(this._data.isLoadingMap, nodeKey));
  }

  _deleteSelectedNodes(): void {
    var selectedNodes = this.getSelectedNodes();
    selectedNodes.forEach(node => {
      var file = FileTreeHelpers.getFileByKey(node.nodeKey);
      if (file != null) {
        if (FileTreeHelpers.isLocalFile(file)) {
          // TODO: This special-case can be eliminated once `delete()` is added to `Directory`
          // and `File`.
          shell.moveItemToTrash(node.nodePath);
        } else {
          (file: (RemoteDirectory | RemoteFile)).delete();
        }
      }
    });
  }

  _expandNode(rootKey: string, nodeKey: string): void {
    this._setExpandedKeys(rootKey, this._getExpandedKeys(rootKey).add(nodeKey));
    // If we have child nodes that should also be expanded, expand them now.
    var previouslyExpanded = this._data.previouslyExpanded[rootKey] || {};
    if (previouslyExpanded[nodeKey]) {
      for (var childKey of previouslyExpanded[nodeKey]) {
        this._expandNode(rootKey, childKey);
      }
      // Clear the previouslyExpanded list since we're done with it.
      previouslyExpanded = deleteProperty(previouslyExpanded, nodeKey);
      this._set(
        'previouslyExpanded',
        setProperty(this._data.previouslyExpanded, rootKey, previouslyExpanded)
      );

    }
  }

  // When we collapse a node we need to do some cleanup removing subscriptions and selection.
  _collapseNode(rootKey: string, nodeKey: string): void {
    var childKeys = this._data.childKeyMap[nodeKey];
    var selectedKeys = this._data.selectedKeysByRoot[rootKey];
    var expandedChildKeys = [];
    if (childKeys) {
      childKeys.forEach((childKey) => {
        // Unselect each child.
        if (selectedKeys && selectedKeys.has(childKey)) {
          selectedKeys = selectedKeys.delete(childKey);
        }
        // Collapse each child directory.
        if (FileTreeHelpers.isDirKey(childKey)) {
          if (this.isExpanded(rootKey, childKey)) {
            expandedChildKeys.push(childKey);
            this._collapseNode(rootKey, childKey);
          }
        }
      });
    }
    // Save the list of expanded child nodes so next time we expand this node we can expand these
    // children.
    var previouslyExpanded = this._data.previouslyExpanded[rootKey] || {};
    if (expandedChildKeys.length !== 0) {
      previouslyExpanded = setProperty(previouslyExpanded, nodeKey, expandedChildKeys);
    } else {
      previouslyExpanded = deleteProperty(previouslyExpanded, nodeKey);
    }
    this._set(
      'previouslyExpanded',
      setProperty(this._data.previouslyExpanded, rootKey, previouslyExpanded)
    );
    this._setSelectedKeys(rootKey, selectedKeys);
    this._setExpandedKeys(rootKey, this._getExpandedKeys(rootKey).delete(nodeKey));
    this._removeSubscription(rootKey, nodeKey);
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

  _deleteSelectedKeys(rootKey: string): void {
    this._set('selectedKeysByRoot', deleteProperty(this._data.selectedKeysByRoot, rootKey));
  }

  _setSelectedKeys(rootKey: string, selectedKeys: Immutable.Set<string>): void {
    this._set(
      'selectedKeysByRoot',
      setProperty(this._data.selectedKeysByRoot, rootKey, selectedKeys)
    );
  }

  /**
   * Sets the selected keys in all roots of the tree. The selected keys of root keys not in
   * `selectedKeysByRoot` are deleted (the root is left with no selection).
   */
  _setSelectedKeysByRoot(selectedKeysByRoot: {[key: string]: Immutable.Set<string>}): void {
    this.getRootKeys().forEach(rootKey => {
      if (selectedKeysByRoot.hasOwnProperty(rootKey)) {
        this._setSelectedKeys(rootKey, selectedKeysByRoot[rootKey]);
      } else {
        this._deleteSelectedKeys(rootKey);
      }
    });
  }

  _setRootKeys(rootKeys: Array<string>): void {
    var oldRootKeys = this._data.rootKeys;
    var newRootKeySet = new Set(rootKeys);
    oldRootKeys.forEach((rootKey) => {
      if (!newRootKeySet.has(rootKey)) {
        this._purgeRoot(rootKey);
      }
    });
    this._set('rootKeys', rootKeys);
  }

  // This sets a single child node. It's useful when expanding to a deeply nested node.
  _createChild(nodeKey: string, childKey: string): void {
    this._setChildKeys(nodeKey, [childKey]);
    this._set('isDirtyMap', deleteProperty(this._data.isDirtyMap, nodeKey));
  }

  _setChildKeys(nodeKey: string, childKeys: Array<string>): void {
    var oldChildKeys = this._data.childKeyMap[nodeKey];
    if (oldChildKeys) {
      var newChildKeySet = new Set(childKeys);
      oldChildKeys.forEach((childKey) => {
        // if it's a directory and it doesn't exist in the new set of child keys
        if (FileTreeHelpers.isDirKey(childKey) && !newChildKeySet.has(childKey)) {
          this._purgeDirectory(childKey);
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
    // Don't create a new subscription if one already exists.
    if (this._data.subscriptionMap[nodeKey]) {
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
    this._set('isDirtyMap', deleteProperty(this._data.isDirtyMap, nodeKey));
  }

  _removeSubscription(rootKey: string, nodeKey: string): void {
    var subscription = this._data.subscriptionMap[nodeKey];
    if (!subscription) {
      return;
    }
    var hasRemainingSubscribers = this._data.rootKeys.some((otherRootKey) => (
      otherRootKey !== rootKey && this.isExpanded(otherRootKey, nodeKey)
    ));
    if (!hasRemainingSubscribers) {
      subscription.dispose();
      this._set('subscriptionMap', deleteProperty(this._data.subscriptionMap, nodeKey));
      // Since we're no longer getting notifications when the directory contents change, go ahead
      // and assume our child list is dirty.
      this._set('isDirtyMap', setProperty(this._data.isDirtyMap, nodeKey, true));
    }
  }

  _removeAllSubscriptions(nodeKey: string): void {
    var subscription = this._data.subscriptionMap[nodeKey];
    if (subscription) {
      subscription.dispose();
      this._set('subscriptionMap', deleteProperty(this._data.subscriptionMap, nodeKey));
    }
  }

  // This is called when a dirctory is physically removed from disk. When we purge a directory,
  // we need to purge it's child directories also. Purging removes stuff from the data store
  // including list of child nodes, subscriptions, expanded directories and selected directories.
  _purgeDirectory(nodeKey: string): void {
    var childKeys = this._data.childKeyMap[nodeKey];
    if (childKeys) {
      childKeys.forEach((childKey) => {
        if (FileTreeHelpers.isDirKey(childKey)) {
          this._purgeDirectory(childKey);
        }
      });
      this._set('childKeyMap', deleteProperty(this._data.childKeyMap, nodeKey));
    }
    this._removeAllSubscriptions(nodeKey);
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

  // TODO: Should we clean up isLoadingMap? It contains promises which cannot be cancelled, so this
  // might be tricky.
  _purgeRoot(rootKey: string): void {
    var expandedKeys = this._data.expandedKeysByRoot[rootKey];
    if (expandedKeys) {
      expandedKeys.forEach((nodeKey) => {
        this._removeSubscription(rootKey, nodeKey);
      });
      this._set('expandedKeysByRoot', deleteProperty(this._data.expandedKeysByRoot, rootKey));
    }
    this._set('selectedKeysByRoot', deleteProperty(this._data.selectedKeysByRoot, rootKey));
    // Remove all child keys so that on re-addition of this root the children will be fetched again.
    var childKeys = this._data.childKeyMap[rootKey];
    if (childKeys) {
      childKeys.forEach((childKey) => {
        if (FileTreeHelpers.isDirKey(childKey)) {
          this._set('childKeyMap', deleteProperty(this._data.childKeyMap, childKey));
        }
      });
      this._set('childKeyMap', deleteProperty(this._data.childKeyMap, rootKey));
    }
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

// A helper to delete a property in an object using shallow copy rather than mutation
function deleteProperty(object: Object, key: string): Object {
  if (!object.hasOwnProperty(key)) {
    return object;
  }
  var newObject = {...object};
  delete newObject[key];
  return newObject;
}

// A helper to set a property in an object using shallow copy rather than mutation
function setProperty(object: Object, key: string, newValue: mixed): Object {
  var oldValue = object[key];
  if (oldValue === newValue) {
    return object;
  }
  var newObject = {...object};
  newObject[key] = newValue;
  return newObject;
}

// Create a new object by mapping over the properties of a given object, calling the given
// function on each one.
function mapValues(object: Object, fn: Function): Object {
  var newObject = {};
  Object.keys(object).forEach((key) => {
    newObject[key] = fn(object[key], key);
  });
  return newObject;
}

module.exports = FileTreeStore;
