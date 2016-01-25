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

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _FileTreeConstants = require('./FileTreeConstants');

var _atom = require('atom');

var _FileTreeDispatcher = require('./FileTreeDispatcher');

var _FileTreeDispatcher2 = _interopRequireDefault(_FileTreeDispatcher);

var _FileTreeHelpers = require('./FileTreeHelpers');

var _FileTreeHelpers2 = _interopRequireDefault(_FileTreeHelpers);

var _FileTreeNode = require('./FileTreeNode');

var _FileTreeNode2 = _interopRequireDefault(_FileTreeNode);

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _minimatch = require('minimatch');

var _hgGitBridge = require('../../hg-git-bridge');

var _commons = require('../../commons');

var _logging = require('../../logging');

var _shell = require('shell');

var _shell2 = _interopRequireDefault(_shell);

var _lodashMemoize = require('lodash.memoize');

var _lodashMemoize2 = _interopRequireDefault(_lodashMemoize);

// Used to ensure the version we serialized is the same version we are deserializing.
var VERSION = 1;

var instance = undefined;

/**
 * Implements the Flux pattern for our file tree. All state for the file tree will be kept in
 * FileTreeStore and the only way to update the store is through methods on FileTreeActions. The
 * dispatcher is a mechanism through which FileTreeActions interfaces with FileTreeStore.
 */

var FileTreeStore = (function () {
  _createClass(FileTreeStore, null, [{
    key: 'getInstance',
    value: function getInstance() {
      if (!instance) {
        instance = new FileTreeStore();
      }
      return instance;
    }
  }]);

  function FileTreeStore() {
    var _this = this;

    _classCallCheck(this, FileTreeStore);

    this._data = this._getDefaults();
    this._dispatcher = _FileTreeDispatcher2['default'].getInstance();
    this._emitter = new _atom.Emitter();
    this._dispatcher.register(function (payload) {
      return _this._onDispatch(payload);
    });
    this._logger = (0, _logging.getLogger)();
    this._repositoryForPath = (0, _lodashMemoize2['default'])(this._repositoryForPath);
  }

  // A helper to delete a property in an object using shallow copy rather than mutation

  /**
   * TODO: Move to a [serialization class][1] and use the built-in versioning mechanism. This might
   * need to be done one level higher within main.js.
   *
   * [1]: https://atom.io/docs/latest/behind-atom-serialization-in-atom
   */

  _createClass(FileTreeStore, [{
    key: 'exportData',
    value: function exportData() {
      var data = this._data;
      // Grab the child keys of only the expanded nodes.
      var childKeyMap = {};
      Object.keys(data.expandedKeysByRoot).forEach(function (rootKey) {
        var expandedKeySet = data.expandedKeysByRoot[rootKey];
        for (var _nodeKey of expandedKeySet) {
          childKeyMap[_nodeKey] = data.childKeyMap[_nodeKey];
        }
      });
      return {
        version: VERSION,
        childKeyMap: childKeyMap,
        expandedKeysByRoot: mapValues(data.expandedKeysByRoot, function (keySet) {
          return keySet.toArray();
        }),
        rootKeys: data.rootKeys,
        selectedKeysByRoot: mapValues(data.selectedKeysByRoot, function (keySet) {
          return keySet.toArray();
        })
      };
    }

    /**
     * Imports store data from a previous export.
     */
  }, {
    key: 'loadData',
    value: function loadData(data) {
      var _this2 = this;

      // Ensure we are not trying to load data from an earlier version of this package.
      if (data.version !== VERSION) {
        return;
      }
      this._data = _extends({}, this._getDefaults(), {
        childKeyMap: data.childKeyMap,
        expandedKeysByRoot: mapValues(data.expandedKeysByRoot, function (keys) {
          return new _immutable2['default'].Set(keys);
        }),
        rootKeys: data.rootKeys,
        selectedKeysByRoot: mapValues(data.selectedKeysByRoot, function (keys) {
          return new _immutable2['default'].OrderedSet(keys);
        })
      });
      Object.keys(data.childKeyMap).forEach(function (nodeKey) {
        _this2._addSubscription(nodeKey);
        _this2._fetchChildKeys(nodeKey);
      });
    }
  }, {
    key: '_setExcludeVcsIgnoredPaths',
    value: function _setExcludeVcsIgnoredPaths(excludeVcsIgnoredPaths) {
      this._set('excludeVcsIgnoredPaths', excludeVcsIgnoredPaths);
    }
  }, {
    key: '_setHideIgnoredNames',
    value: function _setHideIgnoredNames(hideIgnoredNames) {
      this._set('hideIgnoredNames', hideIgnoredNames);
    }

    /**
     * Given a list of names to ignore, compile them into minimatch patterns and
     * update the store with them.
     */
  }, {
    key: '_setIgnoredNames',
    value: function _setIgnoredNames(ignoredNames) {
      var ignoredPatterns = _immutable2['default'].Set(ignoredNames).map(function (ignoredName) {
        if (ignoredName === '') {
          return null;
        }
        try {
          return new _minimatch.Minimatch(ignoredName, { matchBase: true, dot: true });
        } catch (error) {
          atom.notifications.addWarning('Error parsing pattern \'' + ignoredName + '\' from "Settings" > "Ignored Names"', { detail: error.message });
          return null;
        }
      }).filter(function (pattern) {
        return pattern != null;
      });
      this._set('ignoredPatterns', ignoredPatterns);
    }
  }, {
    key: '_getDefaults',
    value: function _getDefaults() {
      return {
        childKeyMap: {},
        isDirtyMap: {},
        expandedKeysByRoot: {},
        trackedNode: null,
        previouslyExpanded: {},
        isLoadingMap: {},
        rootKeys: [],
        selectedKeysByRoot: {},
        subscriptionMap: {},
        vcsStatusesByRoot: {},
        ignoredPatterns: _immutable2['default'].Set(),
        hideIgnoredNames: true,
        excludeVcsIgnoredPaths: true,
        usePreviewTabs: false,
        repositories: _immutable2['default'].Set()
      };
    }
  }, {
    key: '_onDispatch',
    value: function _onDispatch(payload) {
      switch (payload.actionType) {
        case _FileTreeConstants.ActionType.DELETE_SELECTED_NODES:
          this._deleteSelectedNodes();
          break;
        case _FileTreeConstants.ActionType.SET_TRACKED_NODE:
          this._setTrackedNode(payload.rootKey, payload.nodeKey);
          break;
        case _FileTreeConstants.ActionType.SET_ROOT_KEYS:
          this._setRootKeys(payload.rootKeys);
          break;
        case _FileTreeConstants.ActionType.EXPAND_NODE:
          this._expandNode(payload.rootKey, payload.nodeKey);
          break;
        case _FileTreeConstants.ActionType.EXPAND_NODE_DEEP:
          this._expandNodeDeep(payload.rootKey, payload.nodeKey);
          break;
        case _FileTreeConstants.ActionType.COLLAPSE_NODE:
          this._collapseNode(payload.rootKey, payload.nodeKey);
          break;
        case _FileTreeConstants.ActionType.SET_EXCLUDE_VCS_IGNORED_PATHS:
          this._setExcludeVcsIgnoredPaths(payload.excludeVcsIgnoredPaths);
          break;
        case _FileTreeConstants.ActionType.SET_USE_PREVIEW_TABS:
          this._setUsePreviewTabs(payload.usePreviewTabs);
          break;
        case _FileTreeConstants.ActionType.COLLAPSE_NODE_DEEP:
          this._purgeDirectoryWithinARoot(payload.rootKey, payload.nodeKey, /* unselect */false);
          break;
        case _FileTreeConstants.ActionType.SET_HIDE_IGNORED_NAMES:
          this._setHideIgnoredNames(payload.hideIgnoredNames);
          break;
        case _FileTreeConstants.ActionType.SET_IGNORED_NAMES:
          this._setIgnoredNames(payload.ignoredNames);
          break;
        case _FileTreeConstants.ActionType.SET_SELECTED_NODES_FOR_ROOT:
          this._setSelectedKeys(payload.rootKey, payload.nodeKeys);
          break;
        case _FileTreeConstants.ActionType.SET_SELECTED_NODES_FOR_TREE:
          this._setSelectedKeysByRoot(payload.selectedKeysByRoot);
          break;
        case _FileTreeConstants.ActionType.CREATE_CHILD:
          this._createChild(payload.nodeKey, payload.childKey);
          break;
        case _FileTreeConstants.ActionType.SET_VCS_STATUSES:
          this._setVcsStatuses(payload.rootKey, payload.vcsStatuses);
          break;
        case _FileTreeConstants.ActionType.SET_REPOSITORIES:
          this._setRepositories(payload.repositories);
          break;
      }
    }

    /**
     * This is a private method because in Flux we should never externally write to the data store.
     * Only by receiving actions (from dispatcher) should the data store be changed.
     * Note: `_set` can be called multiple times within one iteration of an event loop without
     * thrashing the UI because we are using setImmediate to batch change notifications, effectively
     * letting our views re-render once for multiple consecutive writes.
     */
  }, {
    key: '_set',
    value: function _set(key, value) {
      var _this3 = this;

      var flush = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

      var oldData = this._data;
      // Immutability for the win!
      var newData = setProperty(this._data, key, value);
      if (newData !== oldData) {
        this._data = newData;
        clearImmediate(this._timer);
        if (flush) {
          // If `flush` is true, emit the change immediately.
          this._emitter.emit('change');
        } else {
          // If not flushing, de-bounce to prevent successive updates in the same event loop.
          this._timer = setImmediate(function () {
            _this3._emitter.emit('change');
          });
        }
      }
    }
  }, {
    key: 'getTrackedNode',
    value: function getTrackedNode() {
      return this._data.trackedNode;
    }
  }, {
    key: 'getRepositories',
    value: function getRepositories() {
      return this._data.repositories;
    }
  }, {
    key: 'getRootKeys',
    value: function getRootKeys() {
      return this._data.rootKeys;
    }

    /**
     * Returns the key of the *first* root node containing the given node.
     */
  }, {
    key: 'getRootForKey',
    value: function getRootForKey(nodeKey) {
      return _commons.array.find(this._data.rootKeys, function (rootKey) {
        return nodeKey.startsWith(rootKey);
      });
    }

    /**
     * Returns true if the store has no data, i.e. no roots, no children.
     */
  }, {
    key: 'isEmpty',
    value: function isEmpty() {
      return this.getRootKeys().length === 0;
    }

    /**
     * Note: We actually don't need rootKey (implementation detail) but we take it for consistency.
     */
  }, {
    key: 'isLoading',
    value: function isLoading(rootKey, nodeKey) {
      return !!this._getLoading(nodeKey);
    }
  }, {
    key: 'isExpanded',
    value: function isExpanded(rootKey, nodeKey) {
      return this._getExpandedKeys(rootKey).has(nodeKey);
    }
  }, {
    key: 'isRootKey',
    value: function isRootKey(nodeKey) {
      return this._data.rootKeys.indexOf(nodeKey) !== -1;
    }
  }, {
    key: 'isSelected',
    value: function isSelected(rootKey, nodeKey) {
      return this.getSelectedKeys(rootKey).has(nodeKey);
    }
  }, {
    key: '_setVcsStatuses',
    value: function _setVcsStatuses(rootKey, vcsStatuses) {
      var immutableVcsStatuses = new _immutable2['default'].Map(vcsStatuses);
      if (!_immutable2['default'].is(immutableVcsStatuses, this._data.vcsStatusesByRoot[rootKey])) {
        this._set('vcsStatusesByRoot', setProperty(this._data.vcsStatusesByRoot, rootKey, immutableVcsStatuses));
      }
    }
  }, {
    key: 'getVcsStatusCode',
    value: function getVcsStatusCode(rootKey, nodeKey) {
      var map = this._data.vcsStatusesByRoot[rootKey];
      if (map) {
        return map.get(nodeKey);
      } else {
        return null;
      }
    }
  }, {
    key: '_setUsePreviewTabs',
    value: function _setUsePreviewTabs(usePreviewTabs) {
      this._set('usePreviewTabs', usePreviewTabs);
    }
  }, {
    key: 'usePreviewTabs',
    value: function usePreviewTabs() {
      return this._data.usePreviewTabs;
    }

    /**
     * Returns known child keys for the given `nodeKey` but does not queue a fetch for missing
     * children like `::getChildKeys`.
     */
  }, {
    key: 'getCachedChildKeys',
    value: function getCachedChildKeys(rootKey, nodeKey) {
      return this._omitHiddenPaths(this._data.childKeyMap[nodeKey] || []);
    }

    /**
     * The node child keys may either be  available immediately (cached), or
     * require an async fetch. If all of the children are needed it's easier to
     * return as promise, to make the caller oblivious to the way children were
     * fetched.
     */
  }, {
    key: 'promiseNodeChildKeys',
    value: function promiseNodeChildKeys(rootKey, nodeKey) {
      var _this4 = this;

      var cachedChildKeys = this.getChildKeys(rootKey, nodeKey);
      if (cachedChildKeys.length) {
        return Promise.resolve(cachedChildKeys);
      }

      var promise = this._getLoading(nodeKey) || Promise.resolve();
      return promise.then(function () {
        return _this4.getCachedChildKeys(rootKey, nodeKey);
      });
    }

    /**
     * Returns known child keys for the given `nodeKey` and queues a fetch if children are missing.
     */
  }, {
    key: 'getChildKeys',
    value: function getChildKeys(rootKey, nodeKey) {
      var childKeys = this._data.childKeyMap[nodeKey];
      if (childKeys == null || this._data.isDirtyMap[nodeKey]) {
        this._fetchChildKeys(nodeKey);
      } else {
        /*
         * If no data needs to be fetched, wipe out the scrolling state because subsequent updates
         * should no longer scroll the tree. The node will have already been flushed to the view and
         * scrolled to.
         */
        this._checkTrackedNode();
      }
      return this._omitHiddenPaths(childKeys || []);
    }
  }, {
    key: 'getSelectedKeys',
    value: function getSelectedKeys(rootKey) {
      var selectedKeys = undefined;
      if (rootKey == null) {
        selectedKeys = new _immutable2['default'].OrderedSet();
        for (var root in this._data.selectedKeysByRoot) {
          if (this._data.selectedKeysByRoot.hasOwnProperty(root)) {
            selectedKeys = selectedKeys.merge(this._data.selectedKeysByRoot[root]);
          }
        }
      } else {
        // If the given `rootKey` has no selected keys, assign an empty set to maintain a non-null
        // return value.
        selectedKeys = this._data.selectedKeysByRoot[rootKey] || new _immutable2['default'].OrderedSet();
      }
      return selectedKeys;
    }

    /**
     * Returns a list of the nodes that are currently visible/expanded in the file tree.
     *
     * This method returns an array synchronously (rather than an iterator) to ensure the caller
     * gets a consistent snapshot of the current state of the file tree.
     */
  }, {
    key: 'getVisibleNodes',
    value: function getVisibleNodes(rootKey) {
      // Do some basic checks to ensure that rootKey corresponds to a root and is expanded. If not,
      // return the appropriate array.
      if (!this.isRootKey(rootKey)) {
        return [];
      }
      if (!this.isExpanded(rootKey, rootKey)) {
        return [this.getNode(rootKey, rootKey)];
      }

      // Note that we could cache the visibleNodes array so that we do not have to create it from
      // scratch each time this is called, but it does not appear to be a bottleneck at present.
      var visibleNodes = [];
      var rootKeysForDirectoriesToExplore = [rootKey];
      while (rootKeysForDirectoriesToExplore.length !== 0) {
        var _key = rootKeysForDirectoriesToExplore.pop();
        visibleNodes.push(this.getNode(_key, _key));
        var childKeys = this._data.childKeyMap[_key];
        if (childKeys == null || this._data.isDirtyMap[_key]) {
          // This is where getChildKeys() would fetch, but we do not want to do that.
          // TODO: If key is in isDirtyMap, then retry when it is not dirty?
          continue;
        }

        for (var childKey of childKeys) {
          if (_FileTreeHelpers2['default'].isDirKey(childKey)) {
            if (this.isExpanded(rootKey, _key)) {
              rootKeysForDirectoriesToExplore.push(childKey);
            }
          } else {
            visibleNodes.push(this.getNode(_key, childKey));
          }
        }
      }
      return visibleNodes;
    }

    /**
     * Returns all selected nodes across all roots in the tree.
     */
  }, {
    key: 'getSelectedNodes',
    value: function getSelectedNodes() {
      var _this5 = this;

      var selectedNodes = new _immutable2['default'].OrderedSet();
      this._data.rootKeys.forEach(function (rootKey) {
        _this5.getSelectedKeys(rootKey).forEach(function (nodeKey) {
          selectedNodes = selectedNodes.add(_this5.getNode(rootKey, nodeKey));
        });
      });
      return selectedNodes;
    }
  }, {
    key: 'getSingleSelectedNode',
    value: function getSingleSelectedNode() {
      var selectedRoots = Object.keys(this._data.selectedKeysByRoot);
      if (selectedRoots.length !== 1) {
        // There is more than one root with selected nodes. No bueno.
        return null;
      }
      var rootKey = selectedRoots[0];
      var selectedKeys = this.getSelectedKeys(rootKey);
      /*
       * Note: This does not call `getSelectedNodes` to prevent creating nodes that would be thrown
       * away if there is more than 1 selected node.
       */
      return selectedKeys.size === 1 ? this.getNode(rootKey, selectedKeys.first()) : null;
    }
  }, {
    key: 'getRootNode',
    value: function getRootNode(rootKey) {
      return this.getNode(rootKey, rootKey);
    }
  }, {
    key: 'getNode',
    value: function getNode(rootKey, nodeKey) {
      return new _FileTreeNode2['default'](this, rootKey, nodeKey);
    }

    /**
     * If a fetch is not already in progress initiate a fetch now.
     */
  }, {
    key: '_fetchChildKeys',
    value: function _fetchChildKeys(nodeKey) {
      var _this6 = this;

      var existingPromise = this._getLoading(nodeKey);
      if (existingPromise) {
        return existingPromise;
      }

      var promise = _FileTreeHelpers2['default'].fetchChildren(nodeKey)['catch'](function (error) {
        _this6._logger.error('Unable to fetch children for "' + nodeKey + '".');
        _this6._logger.error('Original error: ', error);
        // Collapse the node and clear its loading state on error so the user can retry expanding it.
        var rootKey = _this6.getRootForKey(nodeKey);
        if (rootKey != null) {
          _this6._collapseNode(rootKey, nodeKey);
        }
        _this6._clearLoading(nodeKey);
      }).then(function (childKeys) {
        // If this node's root went away while the Promise was resolving, do no more work. This node
        // is no longer needed in the store.
        if (_this6.getRootForKey(nodeKey) == null) {
          return;
        }
        _this6._setChildKeys(nodeKey, childKeys);
        _this6._addSubscription(nodeKey);
        _this6._clearLoading(nodeKey);
      });

      this._setLoading(nodeKey, promise);
      return promise;
    }
  }, {
    key: '_getLoading',
    value: function _getLoading(nodeKey) {
      return this._data.isLoadingMap[nodeKey];
    }
  }, {
    key: '_setLoading',
    value: function _setLoading(nodeKey, value) {
      this._set('isLoadingMap', setProperty(this._data.isLoadingMap, nodeKey, value));
    }

    /**
     * Resets the node to be kept in view if no more data is being awaited. Safe to call many times
     * because it only changes state if a node is being tracked.
     */
  }, {
    key: '_checkTrackedNode',
    value: function _checkTrackedNode() {
      if (this._data.trackedNode != null &&
      /*
       * The loading map being empty is a heuristic for when loading has completed. It is inexact
       * because the loading might be unrelated to the tracked node, however it is cheap and false
       * positives will only last until loading is complete or until the user clicks another node in
       * the tree.
       */
      _commons.object.isEmpty(this._data.isLoadingMap)) {
        // Loading has completed. Allow scrolling to proceed as usual.
        this._set('trackedNode', null);
      }
    }
  }, {
    key: '_clearLoading',
    value: function _clearLoading(nodeKey) {
      this._set('isLoadingMap', deleteProperty(this._data.isLoadingMap, nodeKey));
      this._checkTrackedNode();
    }
  }, {
    key: '_deleteSelectedNodes',
    value: function _deleteSelectedNodes() {
      var selectedNodes = this.getSelectedNodes();
      selectedNodes.forEach(function (node) {
        var file = _FileTreeHelpers2['default'].getFileByKey(node.nodeKey);
        if (file != null) {
          if (_FileTreeHelpers2['default'].isLocalFile(file)) {
            // TODO: This special-case can be eliminated once `delete()` is added to `Directory`
            // and `File`.
            _shell2['default'].moveItemToTrash(node.nodePath);
          } else {
            file['delete']();
          }
        }
      });
    }
  }, {
    key: '_expandNode',
    value: function _expandNode(rootKey, nodeKey) {
      this._setExpandedKeys(rootKey, this._getExpandedKeys(rootKey).add(nodeKey));
      // If we have child nodes that should also be expanded, expand them now.
      var previouslyExpanded = this._getPreviouslyExpanded(rootKey);
      if (previouslyExpanded.has(nodeKey)) {
        for (var childKey of previouslyExpanded.get(nodeKey)) {
          this._expandNode(rootKey, childKey);
        }
        // Clear the previouslyExpanded list since we're done with it.
        previouslyExpanded = previouslyExpanded['delete'](nodeKey);
        this._setPreviouslyExpanded(rootKey, previouslyExpanded);
      }
    }

    /**
     * Performes a deep BFS scanning expand of contained nodes.
     * returns - a promise fulfilled when the expand operation is finished
     */
  }, {
    key: '_expandNodeDeep',
    value: function _expandNodeDeep(rootKey, nodeKey) {
      var _this7 = this;

      // Stop the traversal after 100 nodes were added to the tree
      var itNodes = new FileTreeStoreBfsIterator(this, rootKey, nodeKey, /* limit*/100);
      var promise = new Promise(function (resolve) {
        var expand = function expand() {
          var traversedNodeKey = itNodes.traversedNode();
          if (traversedNodeKey) {
            _this7._setExpandedKeys(rootKey, _this7._getExpandedKeys(rootKey).add(traversedNodeKey));
            /**
             * Even if there were previously expanded nodes it doesn't matter as
             * we'll expand all of the children.
             */
            var _previouslyExpanded = _this7._getPreviouslyExpanded(rootKey);
            _previouslyExpanded = _previouslyExpanded['delete'](traversedNodeKey);
            _this7._setPreviouslyExpanded(rootKey, _previouslyExpanded);

            var nextPromise = itNodes.next();
            if (nextPromise) {
              nextPromise.then(expand);
            }
          } else {
            resolve();
          }
        };

        expand();
      });

      return promise;
    }

    /**
     * When we collapse a node we need to do some cleanup removing subscriptions and selection.
     */
  }, {
    key: '_collapseNode',
    value: function _collapseNode(rootKey, nodeKey) {
      var _this8 = this;

      var childKeys = this._data.childKeyMap[nodeKey];
      var selectedKeys = this._data.selectedKeysByRoot[rootKey];
      var expandedChildKeys = [];
      if (childKeys) {
        childKeys.forEach(function (childKey) {
          // Unselect each child.
          if (selectedKeys && selectedKeys.has(childKey)) {
            selectedKeys = selectedKeys['delete'](childKey);
            /*
             * Set the selected keys *before* the recursive `_collapseNode` call so each call stores
             * its changes and isn't wiped out by the next call by keeping an outdated `selectedKeys`
             * in the call stack.
             */
            _this8._setSelectedKeys(rootKey, selectedKeys);
          }
          // Collapse each child directory.
          if (_FileTreeHelpers2['default'].isDirKey(childKey)) {
            if (_this8.isExpanded(rootKey, childKey)) {
              expandedChildKeys.push(childKey);
              _this8._collapseNode(rootKey, childKey);
            }
          }
        });
      }
      /*
       * Save the list of expanded child nodes so next time we expand this node we can expand these
       * children.
       */
      var previouslyExpanded = this._getPreviouslyExpanded(rootKey);
      if (expandedChildKeys.length !== 0) {
        previouslyExpanded = previouslyExpanded.set(nodeKey, expandedChildKeys);
      } else {
        previouslyExpanded = previouslyExpanded['delete'](nodeKey);
      }
      this._setPreviouslyExpanded(rootKey, previouslyExpanded);
      this._setExpandedKeys(rootKey, this._getExpandedKeys(rootKey)['delete'](nodeKey));
      this._removeSubscription(rootKey, nodeKey);
    }
  }, {
    key: '_getPreviouslyExpanded',
    value: function _getPreviouslyExpanded(rootKey) {
      return this._data.previouslyExpanded[rootKey] || new _immutable2['default'].Map();
    }
  }, {
    key: '_setPreviouslyExpanded',
    value: function _setPreviouslyExpanded(rootKey, previouslyExpanded) {
      this._set('previouslyExpanded', setProperty(this._data.previouslyExpanded, rootKey, previouslyExpanded));
    }
  }, {
    key: '_getExpandedKeys',
    value: function _getExpandedKeys(rootKey) {
      return this._data.expandedKeysByRoot[rootKey] || new _immutable2['default'].Set();
    }

    /**
     * This is just exposed so it can be mocked in the tests. Not ideal, but a lot less messy than the
     * alternatives. For example, passing options when constructing an instance of a singleton would
     * make future invocations of `getInstance` unpredictable.
     */
  }, {
    key: '_repositoryForPath',
    value: function _repositoryForPath(path) {
      return this.getRepositories().find(function (repo) {
        return (0, _hgGitBridge.repositoryContainsPath)(repo, path);
      });
    }
  }, {
    key: '_setExpandedKeys',
    value: function _setExpandedKeys(rootKey, expandedKeys) {
      this._set('expandedKeysByRoot', setProperty(this._data.expandedKeysByRoot, rootKey, expandedKeys));
    }
  }, {
    key: '_deleteSelectedKeys',
    value: function _deleteSelectedKeys(rootKey) {
      this._set('selectedKeysByRoot', deleteProperty(this._data.selectedKeysByRoot, rootKey));
    }
  }, {
    key: '_setSelectedKeys',
    value: function _setSelectedKeys(rootKey, selectedKeys) {
      /*
       * New selection means previous node should not be kept in view. Do this without de-bouncing
       * because the previous state is irrelevant. If the user chose a new selection, the previous one
       * should not be scrolled into view.
       */
      this._set('trackedNode', null);
      this._set('selectedKeysByRoot', setProperty(this._data.selectedKeysByRoot, rootKey, selectedKeys));
    }

    /**
     * Sets the selected keys in all roots of the tree. The selected keys of root keys not in
     * `selectedKeysByRoot` are deleted (the root is left with no selection).
     */
  }, {
    key: '_setSelectedKeysByRoot',
    value: function _setSelectedKeysByRoot(selectedKeysByRoot) {
      var _this9 = this;

      this.getRootKeys().forEach(function (rootKey) {
        if (selectedKeysByRoot.hasOwnProperty(rootKey)) {
          _this9._setSelectedKeys(rootKey, selectedKeysByRoot[rootKey]);
        } else {
          _this9._deleteSelectedKeys(rootKey);
        }
      });
    }
  }, {
    key: '_setRootKeys',
    value: function _setRootKeys(rootKeys) {
      var oldRootKeys = this._data.rootKeys;
      var newRootKeys = new _immutable2['default'].Set(rootKeys);
      var removedRootKeys = new _immutable2['default'].Set(oldRootKeys).subtract(newRootKeys);
      removedRootKeys.forEach(this._purgeRoot.bind(this));
      this._set('rootKeys', rootKeys);
    }

    /**
     * Sets a single child node. It's useful when expanding to a deeply nested node.
     */
  }, {
    key: '_createChild',
    value: function _createChild(nodeKey, childKey) {
      this._setChildKeys(nodeKey, [childKey]);
      /*
       * Mark the node as dirty so its ancestors are fetched again on reload of the tree.
       */
      this._set('isDirtyMap', setProperty(this._data.isDirtyMap, nodeKey, true));
    }
  }, {
    key: '_setChildKeys',
    value: function _setChildKeys(nodeKey, childKeys) {
      var oldChildKeys = this._data.childKeyMap[nodeKey];
      if (oldChildKeys) {
        var newChildKeys = new _immutable2['default'].Set(childKeys);
        var removedDirectoryKeys = new _immutable2['default'].Set(oldChildKeys).subtract(newChildKeys).filter(_FileTreeHelpers2['default'].isDirKey);
        removedDirectoryKeys.forEach(this._purgeDirectory.bind(this));
      }
      this._set('childKeyMap', setProperty(this._data.childKeyMap, nodeKey, childKeys));
    }
  }, {
    key: '_onDirectoryChange',
    value: function _onDirectoryChange(nodeKey) {
      this._fetchChildKeys(nodeKey);
    }
  }, {
    key: '_addSubscription',
    value: function _addSubscription(nodeKey) {
      var _this10 = this;

      var directory = _FileTreeHelpers2['default'].getDirectoryByKey(nodeKey);
      if (!directory) {
        return;
      }

      /*
       * Remove the directory's dirty marker regardless of whether a subscription already exists
       * because there is nothing further making it dirty.
       */
      this._set('isDirtyMap', deleteProperty(this._data.isDirtyMap, nodeKey));

      // Don't create a new subscription if one already exists.
      if (this._data.subscriptionMap[nodeKey]) {
        return;
      }

      var subscription = undefined;
      try {
        // This call might fail if we try to watch a non-existing directory, or if permission denied.
        subscription = directory.onDidChange(function () {
          _this10._onDirectoryChange(nodeKey);
        });
      } catch (ex) {
        /*
         * Log error and mark the directory as dirty so the failed subscription will be attempted
         * again next time the directory is expanded.
         */
        this._logger.error('Cannot subscribe to directory "' + nodeKey + '"', ex);
        this._set('isDirtyMap', setProperty(this._data.isDirtyMap, nodeKey));
        return;
      }
      this._set('subscriptionMap', setProperty(this._data.subscriptionMap, nodeKey, subscription));
    }
  }, {
    key: '_removeSubscription',
    value: function _removeSubscription(rootKey, nodeKey) {
      var _this11 = this;

      var hasRemainingSubscribers = undefined;
      var subscription = this._data.subscriptionMap[nodeKey];

      if (subscription != null) {
        hasRemainingSubscribers = this._data.rootKeys.some(function (otherRootKey) {
          return otherRootKey !== rootKey && _this11.isExpanded(otherRootKey, nodeKey);
        });
        if (!hasRemainingSubscribers) {
          subscription.dispose();
          this._set('subscriptionMap', deleteProperty(this._data.subscriptionMap, nodeKey));
        }
      }

      if (subscription == null || hasRemainingSubscribers === false) {
        // Since we're no longer getting notifications when the directory contents change, assume the
        // child list is dirty.
        this._set('isDirtyMap', setProperty(this._data.isDirtyMap, nodeKey, true));
      }
    }
  }, {
    key: '_removeAllSubscriptions',
    value: function _removeAllSubscriptions(nodeKey) {
      var subscription = this._data.subscriptionMap[nodeKey];
      if (subscription) {
        subscription.dispose();
        this._set('subscriptionMap', deleteProperty(this._data.subscriptionMap, nodeKey));
      }
    }
  }, {
    key: '_purgeNode',
    value: function _purgeNode(rootKey, nodeKey, unselect) {
      var expandedKeys = this._getExpandedKeys(rootKey);
      if (expandedKeys.has(nodeKey)) {
        this._setExpandedKeys(rootKey, expandedKeys['delete'](nodeKey));
      }

      if (unselect) {
        var selectedKeys = this.getSelectedKeys(rootKey);
        if (selectedKeys.has(nodeKey)) {
          this._setSelectedKeys(rootKey, selectedKeys['delete'](nodeKey));
        }
      }

      var previouslyExpanded = this._getPreviouslyExpanded(rootKey);
      if (previouslyExpanded.has(nodeKey)) {
        this._setPreviouslyExpanded(rootKey, previouslyExpanded['delete'](nodeKey));
      }
    }
  }, {
    key: '_purgeDirectoryWithinARoot',
    value: function _purgeDirectoryWithinARoot(rootKey, nodeKey, unselect) {
      var _this12 = this;

      var childKeys = this._data.childKeyMap[nodeKey];
      if (childKeys) {
        childKeys.forEach(function (childKey) {
          if (_FileTreeHelpers2['default'].isDirKey(childKey)) {
            _this12._purgeDirectoryWithinARoot(rootKey, childKey, /* unselect */true);
          }
        });
      }
      this._removeSubscription(rootKey, nodeKey);
      this._purgeNode(rootKey, nodeKey, unselect);
    }

    // This is called when a dirctory is physically removed from disk. When we purge a directory,
    // we need to purge it's child directories also. Purging removes stuff from the data store
    // including list of child nodes, subscriptions, expanded directories and selected directories.
  }, {
    key: '_purgeDirectory',
    value: function _purgeDirectory(nodeKey) {
      var _this13 = this;

      var childKeys = this._data.childKeyMap[nodeKey];
      if (childKeys) {
        childKeys.forEach(function (childKey) {
          if (_FileTreeHelpers2['default'].isDirKey(childKey)) {
            _this13._purgeDirectory(childKey);
          }
        });
        this._set('childKeyMap', deleteProperty(this._data.childKeyMap, nodeKey));
      }

      this._removeAllSubscriptions(nodeKey);
      this.getRootKeys().forEach(function (rootKey) {
        _this13._purgeNode(rootKey, nodeKey, /* unselect */true);
      });
    }

    // TODO: Should we clean up isLoadingMap? It contains promises which cannot be cancelled, so this
    // might be tricky.
  }, {
    key: '_purgeRoot',
    value: function _purgeRoot(rootKey) {
      var _this14 = this;

      var expandedKeys = this._data.expandedKeysByRoot[rootKey];
      if (expandedKeys) {
        expandedKeys.forEach(function (nodeKey) {
          _this14._removeSubscription(rootKey, nodeKey);
        });
        this._set('expandedKeysByRoot', deleteProperty(this._data.expandedKeysByRoot, rootKey));
      }
      this._set('selectedKeysByRoot', deleteProperty(this._data.selectedKeysByRoot, rootKey));
      // Remove all child keys so that on re-addition of this root the children will be fetched again.
      var childKeys = this._data.childKeyMap[rootKey];
      if (childKeys) {
        childKeys.forEach(function (childKey) {
          if (_FileTreeHelpers2['default'].isDirKey(childKey)) {
            _this14._set('childKeyMap', deleteProperty(_this14._data.childKeyMap, childKey));
          }
        });
        this._set('childKeyMap', deleteProperty(this._data.childKeyMap, rootKey));
      }
      this._set('vcsStatusesByRoot', deleteProperty(this._data.vcsStatusesByRoot, rootKey));
    }
  }, {
    key: '_setTrackedNode',
    value: function _setTrackedNode(rootKey, nodeKey) {
      // Flush the value to ensure clients see the value at least once and scroll appropriately.
      this._set('trackedNode', { nodeKey: nodeKey, rootKey: rootKey }, true);
    }
  }, {
    key: '_setRepositories',
    value: function _setRepositories(repositories) {
      this._set('repositories', repositories);

      // Whenever a new set of repositories comes in, invalidate our paths cache by resetting its
      // `cache` property (created by lodash.memoize) to an empty map.
      this._repositoryForPath.cache = new Map();
    }
  }, {
    key: '_omitHiddenPaths',
    value: function _omitHiddenPaths(nodeKeys) {
      var _this15 = this;

      if (!this._data.hideIgnoredNames && !this._data.excludeVcsIgnoredPaths) {
        return nodeKeys;
      }

      return nodeKeys.filter(function (nodeKey) {
        return !_this15._shouldHidePath(nodeKey);
      });
    }
  }, {
    key: '_shouldHidePath',
    value: function _shouldHidePath(nodeKey) {
      var _data = this._data;
      var hideIgnoredNames = _data.hideIgnoredNames;
      var excludeVcsIgnoredPaths = _data.excludeVcsIgnoredPaths;
      var ignoredPatterns = _data.ignoredPatterns;

      if (hideIgnoredNames && matchesSome(nodeKey, ignoredPatterns)) {
        return true;
      }
      if (excludeVcsIgnoredPaths && isVcsIgnored(nodeKey, this._repositoryForPath(nodeKey))) {
        return true;
      }
      return false;
    }
  }, {
    key: 'reset',
    value: function reset() {
      var subscriptionMap = this._data.subscriptionMap;
      for (var _nodeKey2 of Object.keys(subscriptionMap)) {
        var subscription = subscriptionMap[_nodeKey2];
        if (subscription) {
          subscription.dispose();
        }
      }

      // Reset data store.
      this._data = this._getDefaults();
    }
  }, {
    key: 'subscribe',
    value: function subscribe(listener) {
      return this._emitter.on('change', listener);
    }
  }]);

  return FileTreeStore;
})();

function deleteProperty(object, key) {
  if (!object.hasOwnProperty(key)) {
    return object;
  }
  var newObject = _extends({}, object);
  delete newObject[key];
  return newObject;
}

// A helper to set a property in an object using shallow copy rather than mutation
function setProperty(object, key, newValue) {
  var oldValue = object[key];
  if (oldValue === newValue) {
    return object;
  }
  var newObject = _extends({}, object);
  newObject[key] = newValue;
  return newObject;
}

// Create a new object by mapping over the properties of a given object, calling the given
// function on each one.
function mapValues(object, fn) {
  var newObject = {};
  Object.keys(object).forEach(function (key) {
    newObject[key] = fn(object[key], key);
  });
  return newObject;
}

// Determine whether the given string matches any of a set of patterns.
function matchesSome(str, patterns) {
  return patterns.some(function (pattern) {
    return pattern.match(str);
  });
}

function isVcsIgnored(nodeKey, repo) {
  return repo && repo.isProjectAtRoot() && repo.isPathIgnored(nodeKey);
}

/**
 * Performs a breadth-first iteration over the directories of the tree starting
 * with a given node. The iteration stops once a given limit of nodes (both directories
 * and files) were traversed.
 * The node being currently traversed can be obtained by calling .traversedNode()
 * .next() returns a promise that is fulfilled when the traversal moves on to
 * the next directory.
 */

var FileTreeStoreBfsIterator = (function () {
  function FileTreeStoreBfsIterator(fileTreeStore, rootKey, nodeKey, limit) {
    _classCallCheck(this, FileTreeStoreBfsIterator);

    this._fileTreeStore = fileTreeStore;
    this._rootKey = rootKey;
    this._nodesToTraverse = [];
    this._currentlyTraversedNode = nodeKey;
    this._limit = limit;
    this._numNodesTraversed = 0;
    this._promise = null;
    this._count = 0;
  }

  _createClass(FileTreeStoreBfsIterator, [{
    key: '_handlePromiseResolution',
    value: function _handlePromiseResolution(childrenKeys) {
      this._numNodesTraversed += childrenKeys.length;
      if (this._numNodesTraversed < this._limit) {
        var nextLevelNodes = childrenKeys.filter(function (childKey) {
          return _FileTreeHelpers2['default'].isDirKey(childKey);
        });
        this._nodesToTraverse = this._nodesToTraverse.concat(nextLevelNodes);

        this._currentlyTraversedNode = this._nodesToTraverse.splice(0, 1)[0];
        this._promise = null;
      } else {
        this._currentlyTraversedNode = null;
        this._promise = null;
      }

      return;
    }
  }, {
    key: 'next',
    value: function next() {
      var currentlyTraversedNode = this._currentlyTraversedNode;
      if (!this._promise && currentlyTraversedNode) {
        this._promise = this._fileTreeStore.promiseNodeChildKeys(this._rootKey, currentlyTraversedNode).then(this._handlePromiseResolution.bind(this));
      }
      return this._promise;
    }
  }, {
    key: 'traversedNode',
    value: function traversedNode() {
      return this._currentlyTraversedNode;
    }
  }]);

  return FileTreeStoreBfsIterator;
})();

module.exports = FileTreeStore;

// Saves a list of child nodes that should be expande when a given key is expanded.
// Looks like: { rootKey: { nodeKey: [childKey1, childKey2] } }.
//# sourceMappingURL=data:application/json;base64,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QXVCLENBQUM7S0FDckM7OztTQXZERyx3QkFBd0I7OztBQTBEOUIsTUFBTSxDQUFDLE9BQU8sR0FBRyxhQUFhLENBQUMiLCJmaWxlIjoiRmlsZVRyZWVTdG9yZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtcbiAgUmVtb3RlRGlyZWN0b3J5LFxuICBSZW1vdGVGaWxlLFxufSBmcm9tICcuLi8uLi9yZW1vdGUtY29ubmVjdGlvbic7XG5cbmltcG9ydCB7QWN0aW9uVHlwZX0gZnJvbSAnLi9GaWxlVHJlZUNvbnN0YW50cyc7XG5pbXBvcnQge0Rpc3Bvc2FibGUsIEVtaXR0ZXJ9IGZyb20gJ2F0b20nO1xuaW1wb3J0IEZpbGVUcmVlRGlzcGF0Y2hlciBmcm9tICcuL0ZpbGVUcmVlRGlzcGF0Y2hlcic7XG5pbXBvcnQgRmlsZVRyZWVIZWxwZXJzIGZyb20gJy4vRmlsZVRyZWVIZWxwZXJzJztcbmltcG9ydCBGaWxlVHJlZU5vZGUgZnJvbSAnLi9GaWxlVHJlZU5vZGUnO1xuaW1wb3J0IEltbXV0YWJsZSBmcm9tICdpbW11dGFibGUnO1xuaW1wb3J0IHtNaW5pbWF0Y2h9IGZyb20gJ21pbmltYXRjaCc7XG5pbXBvcnQge3JlcG9zaXRvcnlDb250YWluc1BhdGh9IGZyb20gJy4uLy4uL2hnLWdpdC1icmlkZ2UnO1xuXG5pbXBvcnQge2FycmF5fSBmcm9tICcuLi8uLi9jb21tb25zJztcbmltcG9ydCB7Z2V0TG9nZ2VyfSBmcm9tICcuLi8uLi9sb2dnaW5nJztcbmltcG9ydCB7b2JqZWN0IGFzIG9iamVjdFV0aWx9IGZyb20gJy4uLy4uL2NvbW1vbnMnO1xuaW1wb3J0IHNoZWxsIGZyb20gJ3NoZWxsJztcbmltcG9ydCBtZW1vaXplIGZyb20gJ2xvZGFzaC5tZW1vaXplJztcblxuLy8gVXNlZCB0byBlbnN1cmUgdGhlIHZlcnNpb24gd2Ugc2VyaWFsaXplZCBpcyB0aGUgc2FtZSB2ZXJzaW9uIHdlIGFyZSBkZXNlcmlhbGl6aW5nLlxuY29uc3QgVkVSU0lPTiA9IDE7XG5cbmltcG9ydCB0eXBlIHtEaXNwYXRjaGVyfSBmcm9tICdmbHV4JztcbmltcG9ydCB0eXBlIHtOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9yZW1vdGUtdXJpJztcblxudHlwZSBBY3Rpb25QYXlsb2FkID0gT2JqZWN0O1xudHlwZSBDaGFuZ2VMaXN0ZW5lciA9ICgpID0+IG1peGVkO1xudHlwZSBGaWxlVHJlZU5vZGVEYXRhID0ge1xuICBub2RlS2V5OiBzdHJpbmc7XG4gIHJvb3RLZXk6IHN0cmluZztcbn1cblxudHlwZSBTdG9yZURhdGEgPSB7XG4gIGNoaWxkS2V5TWFwOiB7IFtrZXk6IHN0cmluZ106IEFycmF5PHN0cmluZz4gfTtcbiAgaXNEaXJ0eU1hcDogeyBba2V5OiBzdHJpbmddOiBib29sZWFuIH07XG4gIGV4cGFuZGVkS2V5c0J5Um9vdDogeyBba2V5OiBzdHJpbmddOiBJbW11dGFibGUuU2V0PHN0cmluZz4gfTtcbiAgdHJhY2tlZE5vZGU6ID9GaWxlVHJlZU5vZGVEYXRhO1xuICAvLyBTYXZlcyBhIGxpc3Qgb2YgY2hpbGQgbm9kZXMgdGhhdCBzaG91bGQgYmUgZXhwYW5kZSB3aGVuIGEgZ2l2ZW4ga2V5IGlzIGV4cGFuZGVkLlxuICAvLyBMb29rcyBsaWtlOiB7IHJvb3RLZXk6IHsgbm9kZUtleTogW2NoaWxkS2V5MSwgY2hpbGRLZXkyXSB9IH0uXG4gIHByZXZpb3VzbHlFeHBhbmRlZDogeyBbcm9vdEtleTogc3RyaW5nXTogSW1tdXRhYmxlLk1hcDxzdHJpbmcsIEFycmF5PFN0cmluZz4+IH07XG4gIGlzTG9hZGluZ01hcDogeyBba2V5OiBzdHJpbmddOiA/UHJvbWlzZSB9O1xuICByb290S2V5czogQXJyYXk8c3RyaW5nPjtcbiAgc2VsZWN0ZWRLZXlzQnlSb290OiB7IFtrZXk6IHN0cmluZ106IEltbXV0YWJsZS5PcmRlcmVkU2V0PHN0cmluZz4gfTtcbiAgc3Vic2NyaXB0aW9uTWFwOiB7IFtrZXk6IHN0cmluZ106IERpc3Bvc2FibGUgfTtcbiAgdmNzU3RhdHVzZXNCeVJvb3Q6IHsgW2tleTogc3RyaW5nXTogSW1tdXRhYmxlLk1hcDxzdHJpbmcsIG51bWJlcj4gfTtcbiAgaWdub3JlZFBhdHRlcm5zOiBJbW11dGFibGUuU2V0PE1pbmltYXRjaD47XG4gIGhpZGVJZ25vcmVkTmFtZXM6IGJvb2xlYW47XG4gIGV4Y2x1ZGVWY3NJZ25vcmVkUGF0aHM6IGJvb2xlYW47XG4gIHVzZVByZXZpZXdUYWJzOiBib29sZWFuO1xuICByZXBvc2l0b3JpZXM6IEltbXV0YWJsZS5TZXQ8YXRvbSRSZXBvc2l0b3J5Pjtcbn07XG5cbmV4cG9ydCB0eXBlIEV4cG9ydFN0b3JlRGF0YSA9IHtcbiAgY2hpbGRLZXlNYXA6IHsgW2tleTogc3RyaW5nXTogQXJyYXk8c3RyaW5nPiB9O1xuICBleHBhbmRlZEtleXNCeVJvb3Q6IHsgW2tleTogc3RyaW5nXTogQXJyYXk8c3RyaW5nPiB9O1xuICByb290S2V5czogQXJyYXk8c3RyaW5nPjtcbiAgc2VsZWN0ZWRLZXlzQnlSb290OiB7IFtrZXk6IHN0cmluZ106IEFycmF5PHN0cmluZz4gfTtcbn07XG5cbmxldCBpbnN0YW5jZTogP09iamVjdDtcblxuLyoqXG4gKiBJbXBsZW1lbnRzIHRoZSBGbHV4IHBhdHRlcm4gZm9yIG91ciBmaWxlIHRyZWUuIEFsbCBzdGF0ZSBmb3IgdGhlIGZpbGUgdHJlZSB3aWxsIGJlIGtlcHQgaW5cbiAqIEZpbGVUcmVlU3RvcmUgYW5kIHRoZSBvbmx5IHdheSB0byB1cGRhdGUgdGhlIHN0b3JlIGlzIHRocm91Z2ggbWV0aG9kcyBvbiBGaWxlVHJlZUFjdGlvbnMuIFRoZVxuICogZGlzcGF0Y2hlciBpcyBhIG1lY2hhbmlzbSB0aHJvdWdoIHdoaWNoIEZpbGVUcmVlQWN0aW9ucyBpbnRlcmZhY2VzIHdpdGggRmlsZVRyZWVTdG9yZS5cbiAqL1xuY2xhc3MgRmlsZVRyZWVTdG9yZSB7XG4gIF9kYXRhOiBTdG9yZURhdGE7XG4gIF9kaXNwYXRjaGVyOiBEaXNwYXRjaGVyO1xuICBfZW1pdHRlcjogRW1pdHRlcjtcbiAgX2xvZ2dlcjogYW55O1xuICBfdGltZXI6ID9PYmplY3Q7XG4gIF9yZXBvc2l0b3J5Rm9yUGF0aDogKHBhdGg6IE51Y2xpZGVVcmkpID0+ID9hdG9tJFJlcG9zaXRvcnk7XG5cbiAgc3RhdGljIGdldEluc3RhbmNlKCk6IEZpbGVUcmVlU3RvcmUge1xuICAgIGlmICghaW5zdGFuY2UpIHtcbiAgICAgIGluc3RhbmNlID0gbmV3IEZpbGVUcmVlU3RvcmUoKTtcbiAgICB9XG4gICAgcmV0dXJuIGluc3RhbmNlO1xuICB9XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5fZGF0YSA9IHRoaXMuX2dldERlZmF1bHRzKCk7XG4gICAgdGhpcy5fZGlzcGF0Y2hlciA9IEZpbGVUcmVlRGlzcGF0Y2hlci5nZXRJbnN0YW5jZSgpO1xuICAgIHRoaXMuX2VtaXR0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIucmVnaXN0ZXIoXG4gICAgICBwYXlsb2FkID0+IHRoaXMuX29uRGlzcGF0Y2gocGF5bG9hZClcbiAgICApO1xuICAgIHRoaXMuX2xvZ2dlciA9IGdldExvZ2dlcigpO1xuICAgIHRoaXMuX3JlcG9zaXRvcnlGb3JQYXRoID0gbWVtb2l6ZSh0aGlzLl9yZXBvc2l0b3J5Rm9yUGF0aCk7XG4gIH1cblxuICAvKipcbiAgICogVE9ETzogTW92ZSB0byBhIFtzZXJpYWxpemF0aW9uIGNsYXNzXVsxXSBhbmQgdXNlIHRoZSBidWlsdC1pbiB2ZXJzaW9uaW5nIG1lY2hhbmlzbS4gVGhpcyBtaWdodFxuICAgKiBuZWVkIHRvIGJlIGRvbmUgb25lIGxldmVsIGhpZ2hlciB3aXRoaW4gbWFpbi5qcy5cbiAgICpcbiAgICogWzFdOiBodHRwczovL2F0b20uaW8vZG9jcy9sYXRlc3QvYmVoaW5kLWF0b20tc2VyaWFsaXphdGlvbi1pbi1hdG9tXG4gICAqL1xuICBleHBvcnREYXRhKCk6IEV4cG9ydFN0b3JlRGF0YSB7XG4gICAgY29uc3QgZGF0YSA9IHRoaXMuX2RhdGE7XG4gICAgLy8gR3JhYiB0aGUgY2hpbGQga2V5cyBvZiBvbmx5IHRoZSBleHBhbmRlZCBub2Rlcy5cbiAgICBjb25zdCBjaGlsZEtleU1hcCA9IHt9O1xuICAgIE9iamVjdC5rZXlzKGRhdGEuZXhwYW5kZWRLZXlzQnlSb290KS5mb3JFYWNoKChyb290S2V5KSA9PiB7XG4gICAgICBjb25zdCBleHBhbmRlZEtleVNldCA9IGRhdGEuZXhwYW5kZWRLZXlzQnlSb290W3Jvb3RLZXldO1xuICAgICAgZm9yIChjb25zdCBub2RlS2V5IG9mIGV4cGFuZGVkS2V5U2V0KSB7XG4gICAgICAgIGNoaWxkS2V5TWFwW25vZGVLZXldID0gZGF0YS5jaGlsZEtleU1hcFtub2RlS2V5XTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4ge1xuICAgICAgdmVyc2lvbjogVkVSU0lPTixcbiAgICAgIGNoaWxkS2V5TWFwOiBjaGlsZEtleU1hcCxcbiAgICAgIGV4cGFuZGVkS2V5c0J5Um9vdDogbWFwVmFsdWVzKGRhdGEuZXhwYW5kZWRLZXlzQnlSb290LCAoa2V5U2V0KSA9PiBrZXlTZXQudG9BcnJheSgpKSxcbiAgICAgIHJvb3RLZXlzOiBkYXRhLnJvb3RLZXlzLFxuICAgICAgc2VsZWN0ZWRLZXlzQnlSb290OiBtYXBWYWx1ZXMoZGF0YS5zZWxlY3RlZEtleXNCeVJvb3QsIChrZXlTZXQpID0+IGtleVNldC50b0FycmF5KCkpLFxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogSW1wb3J0cyBzdG9yZSBkYXRhIGZyb20gYSBwcmV2aW91cyBleHBvcnQuXG4gICAqL1xuICBsb2FkRGF0YShkYXRhOiBFeHBvcnRTdG9yZURhdGEpOiB2b2lkIHtcbiAgICAvLyBFbnN1cmUgd2UgYXJlIG5vdCB0cnlpbmcgdG8gbG9hZCBkYXRhIGZyb20gYW4gZWFybGllciB2ZXJzaW9uIG9mIHRoaXMgcGFja2FnZS5cbiAgICBpZiAoZGF0YS52ZXJzaW9uICE9PSBWRVJTSU9OKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuX2RhdGEgPSB7XG4gICAgICAuLi50aGlzLl9nZXREZWZhdWx0cygpLFxuICAgICAgLi4ue1xuICAgICAgICBjaGlsZEtleU1hcDogZGF0YS5jaGlsZEtleU1hcCxcbiAgICAgICAgZXhwYW5kZWRLZXlzQnlSb290OiBtYXBWYWx1ZXMoZGF0YS5leHBhbmRlZEtleXNCeVJvb3QsIChrZXlzKSA9PiBuZXcgSW1tdXRhYmxlLlNldChrZXlzKSksXG4gICAgICAgIHJvb3RLZXlzOiBkYXRhLnJvb3RLZXlzLFxuICAgICAgICBzZWxlY3RlZEtleXNCeVJvb3Q6XG4gICAgICAgICAgbWFwVmFsdWVzKGRhdGEuc2VsZWN0ZWRLZXlzQnlSb290LCAoa2V5cykgPT4gbmV3IEltbXV0YWJsZS5PcmRlcmVkU2V0KGtleXMpKSxcbiAgICAgIH0sXG4gICAgfTtcbiAgICBPYmplY3Qua2V5cyhkYXRhLmNoaWxkS2V5TWFwKS5mb3JFYWNoKChub2RlS2V5KSA9PiB7XG4gICAgICB0aGlzLl9hZGRTdWJzY3JpcHRpb24obm9kZUtleSk7XG4gICAgICB0aGlzLl9mZXRjaENoaWxkS2V5cyhub2RlS2V5KTtcbiAgICB9KTtcbiAgfVxuXG4gIF9zZXRFeGNsdWRlVmNzSWdub3JlZFBhdGhzKGV4Y2x1ZGVWY3NJZ25vcmVkUGF0aHM6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB0aGlzLl9zZXQoJ2V4Y2x1ZGVWY3NJZ25vcmVkUGF0aHMnLCBleGNsdWRlVmNzSWdub3JlZFBhdGhzKTtcbiAgfVxuXG4gIF9zZXRIaWRlSWdub3JlZE5hbWVzKGhpZGVJZ25vcmVkTmFtZXM6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB0aGlzLl9zZXQoJ2hpZGVJZ25vcmVkTmFtZXMnLCBoaWRlSWdub3JlZE5hbWVzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHaXZlbiBhIGxpc3Qgb2YgbmFtZXMgdG8gaWdub3JlLCBjb21waWxlIHRoZW0gaW50byBtaW5pbWF0Y2ggcGF0dGVybnMgYW5kXG4gICAqIHVwZGF0ZSB0aGUgc3RvcmUgd2l0aCB0aGVtLlxuICAgKi9cbiAgX3NldElnbm9yZWROYW1lcyhpZ25vcmVkTmFtZXM6IEFycmF5PHN0cmluZz4pIHtcbiAgICBjb25zdCBpZ25vcmVkUGF0dGVybnMgPSBJbW11dGFibGUuU2V0KGlnbm9yZWROYW1lcylcbiAgICAgIC5tYXAoaWdub3JlZE5hbWUgPT4ge1xuICAgICAgICBpZiAoaWdub3JlZE5hbWUgPT09ICcnKSB7XG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICByZXR1cm4gbmV3IE1pbmltYXRjaChpZ25vcmVkTmFtZSwge21hdGNoQmFzZTogdHJ1ZSwgZG90OiB0cnVlfSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcoXG4gICAgICAgICAgICBgRXJyb3IgcGFyc2luZyBwYXR0ZXJuICcke2lnbm9yZWROYW1lfScgZnJvbSBcIlNldHRpbmdzXCIgPiBcIklnbm9yZWQgTmFtZXNcImAsXG4gICAgICAgICAgICB7ZGV0YWlsOiBlcnJvci5tZXNzYWdlfSxcbiAgICAgICAgICApO1xuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgLmZpbHRlcihwYXR0ZXJuID0+IHBhdHRlcm4gIT0gbnVsbCk7XG4gICAgdGhpcy5fc2V0KCdpZ25vcmVkUGF0dGVybnMnLCBpZ25vcmVkUGF0dGVybnMpO1xuICB9XG5cbiAgX2dldERlZmF1bHRzKCk6IFN0b3JlRGF0YSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNoaWxkS2V5TWFwOiB7fSxcbiAgICAgIGlzRGlydHlNYXA6IHt9LFxuICAgICAgZXhwYW5kZWRLZXlzQnlSb290OiB7fSxcbiAgICAgIHRyYWNrZWROb2RlOiBudWxsLFxuICAgICAgcHJldmlvdXNseUV4cGFuZGVkOiB7fSxcbiAgICAgIGlzTG9hZGluZ01hcDoge30sXG4gICAgICByb290S2V5czogW10sXG4gICAgICBzZWxlY3RlZEtleXNCeVJvb3Q6IHt9LFxuICAgICAgc3Vic2NyaXB0aW9uTWFwOiB7fSxcbiAgICAgIHZjc1N0YXR1c2VzQnlSb290OiB7fSxcbiAgICAgIGlnbm9yZWRQYXR0ZXJuczogSW1tdXRhYmxlLlNldCgpLFxuICAgICAgaGlkZUlnbm9yZWROYW1lczogdHJ1ZSxcbiAgICAgIGV4Y2x1ZGVWY3NJZ25vcmVkUGF0aHM6IHRydWUsXG4gICAgICB1c2VQcmV2aWV3VGFiczogZmFsc2UsXG4gICAgICByZXBvc2l0b3JpZXM6IEltbXV0YWJsZS5TZXQoKSxcbiAgICB9O1xuICB9XG5cbiAgX29uRGlzcGF0Y2gocGF5bG9hZDogQWN0aW9uUGF5bG9hZCk6IHZvaWQge1xuICAgIHN3aXRjaCAocGF5bG9hZC5hY3Rpb25UeXBlKSB7XG4gICAgICBjYXNlIEFjdGlvblR5cGUuREVMRVRFX1NFTEVDVEVEX05PREVTOlxuICAgICAgICB0aGlzLl9kZWxldGVTZWxlY3RlZE5vZGVzKCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBBY3Rpb25UeXBlLlNFVF9UUkFDS0VEX05PREU6XG4gICAgICAgIHRoaXMuX3NldFRyYWNrZWROb2RlKHBheWxvYWQucm9vdEtleSwgcGF5bG9hZC5ub2RlS2V5KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEFjdGlvblR5cGUuU0VUX1JPT1RfS0VZUzpcbiAgICAgICAgdGhpcy5fc2V0Um9vdEtleXMocGF5bG9hZC5yb290S2V5cyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBBY3Rpb25UeXBlLkVYUEFORF9OT0RFOlxuICAgICAgICB0aGlzLl9leHBhbmROb2RlKHBheWxvYWQucm9vdEtleSwgcGF5bG9hZC5ub2RlS2V5KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEFjdGlvblR5cGUuRVhQQU5EX05PREVfREVFUDpcbiAgICAgICAgdGhpcy5fZXhwYW5kTm9kZURlZXAocGF5bG9hZC5yb290S2V5LCBwYXlsb2FkLm5vZGVLZXkpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQWN0aW9uVHlwZS5DT0xMQVBTRV9OT0RFOlxuICAgICAgICB0aGlzLl9jb2xsYXBzZU5vZGUocGF5bG9hZC5yb290S2V5LCBwYXlsb2FkLm5vZGVLZXkpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQWN0aW9uVHlwZS5TRVRfRVhDTFVERV9WQ1NfSUdOT1JFRF9QQVRIUzpcbiAgICAgICAgdGhpcy5fc2V0RXhjbHVkZVZjc0lnbm9yZWRQYXRocyhwYXlsb2FkLmV4Y2x1ZGVWY3NJZ25vcmVkUGF0aHMpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQWN0aW9uVHlwZS5TRVRfVVNFX1BSRVZJRVdfVEFCUzpcbiAgICAgICAgdGhpcy5fc2V0VXNlUHJldmlld1RhYnMocGF5bG9hZC51c2VQcmV2aWV3VGFicyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBBY3Rpb25UeXBlLkNPTExBUFNFX05PREVfREVFUDpcbiAgICAgICAgdGhpcy5fcHVyZ2VEaXJlY3RvcnlXaXRoaW5BUm9vdChwYXlsb2FkLnJvb3RLZXksIHBheWxvYWQubm9kZUtleSwgLyogdW5zZWxlY3QgKi9mYWxzZSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBBY3Rpb25UeXBlLlNFVF9ISURFX0lHTk9SRURfTkFNRVM6XG4gICAgICAgIHRoaXMuX3NldEhpZGVJZ25vcmVkTmFtZXMocGF5bG9hZC5oaWRlSWdub3JlZE5hbWVzKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEFjdGlvblR5cGUuU0VUX0lHTk9SRURfTkFNRVM6XG4gICAgICAgIHRoaXMuX3NldElnbm9yZWROYW1lcyhwYXlsb2FkLmlnbm9yZWROYW1lcyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBBY3Rpb25UeXBlLlNFVF9TRUxFQ1RFRF9OT0RFU19GT1JfUk9PVDpcbiAgICAgICAgdGhpcy5fc2V0U2VsZWN0ZWRLZXlzKHBheWxvYWQucm9vdEtleSwgcGF5bG9hZC5ub2RlS2V5cyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBBY3Rpb25UeXBlLlNFVF9TRUxFQ1RFRF9OT0RFU19GT1JfVFJFRTpcbiAgICAgICAgdGhpcy5fc2V0U2VsZWN0ZWRLZXlzQnlSb290KHBheWxvYWQuc2VsZWN0ZWRLZXlzQnlSb290KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEFjdGlvblR5cGUuQ1JFQVRFX0NISUxEOlxuICAgICAgICB0aGlzLl9jcmVhdGVDaGlsZChwYXlsb2FkLm5vZGVLZXksIHBheWxvYWQuY2hpbGRLZXkpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQWN0aW9uVHlwZS5TRVRfVkNTX1NUQVRVU0VTOlxuICAgICAgICB0aGlzLl9zZXRWY3NTdGF0dXNlcyhwYXlsb2FkLnJvb3RLZXksIHBheWxvYWQudmNzU3RhdHVzZXMpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQWN0aW9uVHlwZS5TRVRfUkVQT1NJVE9SSUVTOlxuICAgICAgICB0aGlzLl9zZXRSZXBvc2l0b3JpZXMocGF5bG9hZC5yZXBvc2l0b3JpZXMpO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVGhpcyBpcyBhIHByaXZhdGUgbWV0aG9kIGJlY2F1c2UgaW4gRmx1eCB3ZSBzaG91bGQgbmV2ZXIgZXh0ZXJuYWxseSB3cml0ZSB0byB0aGUgZGF0YSBzdG9yZS5cbiAgICogT25seSBieSByZWNlaXZpbmcgYWN0aW9ucyAoZnJvbSBkaXNwYXRjaGVyKSBzaG91bGQgdGhlIGRhdGEgc3RvcmUgYmUgY2hhbmdlZC5cbiAgICogTm90ZTogYF9zZXRgIGNhbiBiZSBjYWxsZWQgbXVsdGlwbGUgdGltZXMgd2l0aGluIG9uZSBpdGVyYXRpb24gb2YgYW4gZXZlbnQgbG9vcCB3aXRob3V0XG4gICAqIHRocmFzaGluZyB0aGUgVUkgYmVjYXVzZSB3ZSBhcmUgdXNpbmcgc2V0SW1tZWRpYXRlIHRvIGJhdGNoIGNoYW5nZSBub3RpZmljYXRpb25zLCBlZmZlY3RpdmVseVxuICAgKiBsZXR0aW5nIG91ciB2aWV3cyByZS1yZW5kZXIgb25jZSBmb3IgbXVsdGlwbGUgY29uc2VjdXRpdmUgd3JpdGVzLlxuICAgKi9cbiAgX3NldChrZXk6IHN0cmluZywgdmFsdWU6IG1peGVkLCBmbHVzaDogYm9vbGVhbiA9IGZhbHNlKTogdm9pZCB7XG4gICAgY29uc3Qgb2xkRGF0YSA9IHRoaXMuX2RhdGE7XG4gICAgLy8gSW1tdXRhYmlsaXR5IGZvciB0aGUgd2luIVxuICAgIGNvbnN0IG5ld0RhdGEgPSBzZXRQcm9wZXJ0eSh0aGlzLl9kYXRhLCBrZXksIHZhbHVlKTtcbiAgICBpZiAobmV3RGF0YSAhPT0gb2xkRGF0YSkge1xuICAgICAgdGhpcy5fZGF0YSA9IG5ld0RhdGE7XG4gICAgICBjbGVhckltbWVkaWF0ZSh0aGlzLl90aW1lcik7XG4gICAgICBpZiAoZmx1c2gpIHtcbiAgICAgICAgLy8gSWYgYGZsdXNoYCBpcyB0cnVlLCBlbWl0IHRoZSBjaGFuZ2UgaW1tZWRpYXRlbHkuXG4gICAgICAgIHRoaXMuX2VtaXR0ZXIuZW1pdCgnY2hhbmdlJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBJZiBub3QgZmx1c2hpbmcsIGRlLWJvdW5jZSB0byBwcmV2ZW50IHN1Y2Nlc3NpdmUgdXBkYXRlcyBpbiB0aGUgc2FtZSBldmVudCBsb29wLlxuICAgICAgICB0aGlzLl90aW1lciA9IHNldEltbWVkaWF0ZSgoKSA9PiB7XG4gICAgICAgICAgdGhpcy5fZW1pdHRlci5lbWl0KCdjaGFuZ2UnKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZ2V0VHJhY2tlZE5vZGUoKTogP0ZpbGVUcmVlTm9kZURhdGEge1xuICAgIHJldHVybiB0aGlzLl9kYXRhLnRyYWNrZWROb2RlO1xuICB9XG5cbiAgZ2V0UmVwb3NpdG9yaWVzKCk6IEltbXV0YWJsZS5TZXQ8YXRvbSRSZXBvc2l0b3J5PiB7XG4gICAgcmV0dXJuIHRoaXMuX2RhdGEucmVwb3NpdG9yaWVzO1xuICB9XG5cbiAgZ2V0Um9vdEtleXMoKTogQXJyYXk8c3RyaW5nPiB7XG4gICAgcmV0dXJuIHRoaXMuX2RhdGEucm9vdEtleXM7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUga2V5IG9mIHRoZSAqZmlyc3QqIHJvb3Qgbm9kZSBjb250YWluaW5nIHRoZSBnaXZlbiBub2RlLlxuICAgKi9cbiAgZ2V0Um9vdEZvcktleShub2RlS2V5OiBzdHJpbmcpOiA/c3RyaW5nIHtcbiAgICByZXR1cm4gYXJyYXkuZmluZCh0aGlzLl9kYXRhLnJvb3RLZXlzLCByb290S2V5ID0+IG5vZGVLZXkuc3RhcnRzV2l0aChyb290S2V5KSk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0cnVlIGlmIHRoZSBzdG9yZSBoYXMgbm8gZGF0YSwgaS5lLiBubyByb290cywgbm8gY2hpbGRyZW4uXG4gICAqL1xuICBpc0VtcHR5KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmdldFJvb3RLZXlzKCkubGVuZ3RoID09PSAwO1xuICB9XG5cbiAgLyoqXG4gICAqIE5vdGU6IFdlIGFjdHVhbGx5IGRvbid0IG5lZWQgcm9vdEtleSAoaW1wbGVtZW50YXRpb24gZGV0YWlsKSBidXQgd2UgdGFrZSBpdCBmb3IgY29uc2lzdGVuY3kuXG4gICAqL1xuICBpc0xvYWRpbmcocm9vdEtleTogc3RyaW5nLCBub2RlS2V5OiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gISF0aGlzLl9nZXRMb2FkaW5nKG5vZGVLZXkpO1xuICB9XG5cbiAgaXNFeHBhbmRlZChyb290S2V5OiBzdHJpbmcsIG5vZGVLZXk6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9nZXRFeHBhbmRlZEtleXMocm9vdEtleSkuaGFzKG5vZGVLZXkpO1xuICB9XG5cbiAgaXNSb290S2V5KG5vZGVLZXk6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9kYXRhLnJvb3RLZXlzLmluZGV4T2Yobm9kZUtleSkgIT09IC0xO1xuICB9XG5cbiAgaXNTZWxlY3RlZChyb290S2V5OiBzdHJpbmcsIG5vZGVLZXk6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmdldFNlbGVjdGVkS2V5cyhyb290S2V5KS5oYXMobm9kZUtleSk7XG4gIH1cblxuICBfc2V0VmNzU3RhdHVzZXMocm9vdEtleTogc3RyaW5nLCB2Y3NTdGF0dXNlczoge1twYXRoOiBzdHJpbmddOiBudW1iZXJ9KSB7XG4gICAgY29uc3QgaW1tdXRhYmxlVmNzU3RhdHVzZXMgPSBuZXcgSW1tdXRhYmxlLk1hcCh2Y3NTdGF0dXNlcyk7XG4gICAgaWYgKCFJbW11dGFibGUuaXMoaW1tdXRhYmxlVmNzU3RhdHVzZXMsIHRoaXMuX2RhdGEudmNzU3RhdHVzZXNCeVJvb3Rbcm9vdEtleV0pKSB7XG4gICAgICB0aGlzLl9zZXQoXG4gICAgICAgICd2Y3NTdGF0dXNlc0J5Um9vdCcsXG4gICAgICAgIHNldFByb3BlcnR5KHRoaXMuX2RhdGEudmNzU3RhdHVzZXNCeVJvb3QsIHJvb3RLZXksIGltbXV0YWJsZVZjc1N0YXR1c2VzKVxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICBnZXRWY3NTdGF0dXNDb2RlKHJvb3RLZXk6IHN0cmluZywgbm9kZUtleTogc3RyaW5nKTogP251bWJlciB7XG4gICAgY29uc3QgbWFwID0gdGhpcy5fZGF0YS52Y3NTdGF0dXNlc0J5Um9vdFtyb290S2V5XTtcbiAgICBpZiAobWFwKSB7XG4gICAgICByZXR1cm4gbWFwLmdldChub2RlS2V5KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG5cbiAgX3NldFVzZVByZXZpZXdUYWJzKHVzZVByZXZpZXdUYWJzOiBib29sZWFuKSB7XG4gICAgdGhpcy5fc2V0KCd1c2VQcmV2aWV3VGFicycsIHVzZVByZXZpZXdUYWJzKTtcbiAgfVxuXG4gIHVzZVByZXZpZXdUYWJzKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9kYXRhLnVzZVByZXZpZXdUYWJzO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMga25vd24gY2hpbGQga2V5cyBmb3IgdGhlIGdpdmVuIGBub2RlS2V5YCBidXQgZG9lcyBub3QgcXVldWUgYSBmZXRjaCBmb3IgbWlzc2luZ1xuICAgKiBjaGlsZHJlbiBsaWtlIGA6OmdldENoaWxkS2V5c2AuXG4gICAqL1xuICBnZXRDYWNoZWRDaGlsZEtleXMocm9vdEtleTogc3RyaW5nLCBub2RlS2V5OiBzdHJpbmcpOiBBcnJheTxzdHJpbmc+IHtcbiAgICByZXR1cm4gdGhpcy5fb21pdEhpZGRlblBhdGhzKHRoaXMuX2RhdGEuY2hpbGRLZXlNYXBbbm9kZUtleV0gfHwgW10pO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBub2RlIGNoaWxkIGtleXMgbWF5IGVpdGhlciBiZSAgYXZhaWxhYmxlIGltbWVkaWF0ZWx5IChjYWNoZWQpLCBvclxuICAgKiByZXF1aXJlIGFuIGFzeW5jIGZldGNoLiBJZiBhbGwgb2YgdGhlIGNoaWxkcmVuIGFyZSBuZWVkZWQgaXQncyBlYXNpZXIgdG9cbiAgICogcmV0dXJuIGFzIHByb21pc2UsIHRvIG1ha2UgdGhlIGNhbGxlciBvYmxpdmlvdXMgdG8gdGhlIHdheSBjaGlsZHJlbiB3ZXJlXG4gICAqIGZldGNoZWQuXG4gICAqL1xuICBwcm9taXNlTm9kZUNoaWxkS2V5cyhyb290S2V5OiBzdHJpbmcsIG5vZGVLZXk6IHN0cmluZyk6IFByb21pc2Uge1xuICAgIGNvbnN0IGNhY2hlZENoaWxkS2V5cyA9IHRoaXMuZ2V0Q2hpbGRLZXlzKHJvb3RLZXksIG5vZGVLZXkpO1xuICAgIGlmIChjYWNoZWRDaGlsZEtleXMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGNhY2hlZENoaWxkS2V5cyk7XG4gICAgfVxuXG4gICAgY29uc3QgcHJvbWlzZSA9IHRoaXMuX2dldExvYWRpbmcobm9kZUtleSkgfHwgUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgcmV0dXJuIHByb21pc2UudGhlbigoKSA9PiB0aGlzLmdldENhY2hlZENoaWxkS2V5cyhyb290S2V5LCBub2RlS2V5KSk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBrbm93biBjaGlsZCBrZXlzIGZvciB0aGUgZ2l2ZW4gYG5vZGVLZXlgIGFuZCBxdWV1ZXMgYSBmZXRjaCBpZiBjaGlsZHJlbiBhcmUgbWlzc2luZy5cbiAgICovXG4gIGdldENoaWxkS2V5cyhyb290S2V5OiBzdHJpbmcsIG5vZGVLZXk6IHN0cmluZyk6IEFycmF5PHN0cmluZz4ge1xuICAgIGNvbnN0IGNoaWxkS2V5cyA9IHRoaXMuX2RhdGEuY2hpbGRLZXlNYXBbbm9kZUtleV07XG4gICAgaWYgKGNoaWxkS2V5cyA9PSBudWxsIHx8IHRoaXMuX2RhdGEuaXNEaXJ0eU1hcFtub2RlS2V5XSkge1xuICAgICAgdGhpcy5fZmV0Y2hDaGlsZEtleXMobm9kZUtleSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8qXG4gICAgICAgKiBJZiBubyBkYXRhIG5lZWRzIHRvIGJlIGZldGNoZWQsIHdpcGUgb3V0IHRoZSBzY3JvbGxpbmcgc3RhdGUgYmVjYXVzZSBzdWJzZXF1ZW50IHVwZGF0ZXNcbiAgICAgICAqIHNob3VsZCBubyBsb25nZXIgc2Nyb2xsIHRoZSB0cmVlLiBUaGUgbm9kZSB3aWxsIGhhdmUgYWxyZWFkeSBiZWVuIGZsdXNoZWQgdG8gdGhlIHZpZXcgYW5kXG4gICAgICAgKiBzY3JvbGxlZCB0by5cbiAgICAgICAqL1xuICAgICAgdGhpcy5fY2hlY2tUcmFja2VkTm9kZSgpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fb21pdEhpZGRlblBhdGhzKGNoaWxkS2V5cyB8fCBbXSk7XG4gIH1cblxuICBnZXRTZWxlY3RlZEtleXMocm9vdEtleT86IHN0cmluZyk6IEltbXV0YWJsZS5PcmRlcmVkU2V0PHN0cmluZz4ge1xuICAgIGxldCBzZWxlY3RlZEtleXM7XG4gICAgaWYgKHJvb3RLZXkgPT0gbnVsbCkge1xuICAgICAgc2VsZWN0ZWRLZXlzID0gbmV3IEltbXV0YWJsZS5PcmRlcmVkU2V0KCk7XG4gICAgICBmb3IgKGNvbnN0IHJvb3QgaW4gdGhpcy5fZGF0YS5zZWxlY3RlZEtleXNCeVJvb3QpIHtcbiAgICAgICAgaWYgKHRoaXMuX2RhdGEuc2VsZWN0ZWRLZXlzQnlSb290Lmhhc093blByb3BlcnR5KHJvb3QpKSB7XG4gICAgICAgICAgc2VsZWN0ZWRLZXlzID0gc2VsZWN0ZWRLZXlzLm1lcmdlKHRoaXMuX2RhdGEuc2VsZWN0ZWRLZXlzQnlSb290W3Jvb3RdKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBJZiB0aGUgZ2l2ZW4gYHJvb3RLZXlgIGhhcyBubyBzZWxlY3RlZCBrZXlzLCBhc3NpZ24gYW4gZW1wdHkgc2V0IHRvIG1haW50YWluIGEgbm9uLW51bGxcbiAgICAgIC8vIHJldHVybiB2YWx1ZS5cbiAgICAgIHNlbGVjdGVkS2V5cyA9IHRoaXMuX2RhdGEuc2VsZWN0ZWRLZXlzQnlSb290W3Jvb3RLZXldIHx8IG5ldyBJbW11dGFibGUuT3JkZXJlZFNldCgpO1xuICAgIH1cbiAgICByZXR1cm4gc2VsZWN0ZWRLZXlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBsaXN0IG9mIHRoZSBub2RlcyB0aGF0IGFyZSBjdXJyZW50bHkgdmlzaWJsZS9leHBhbmRlZCBpbiB0aGUgZmlsZSB0cmVlLlxuICAgKlxuICAgKiBUaGlzIG1ldGhvZCByZXR1cm5zIGFuIGFycmF5IHN5bmNocm9ub3VzbHkgKHJhdGhlciB0aGFuIGFuIGl0ZXJhdG9yKSB0byBlbnN1cmUgdGhlIGNhbGxlclxuICAgKiBnZXRzIGEgY29uc2lzdGVudCBzbmFwc2hvdCBvZiB0aGUgY3VycmVudCBzdGF0ZSBvZiB0aGUgZmlsZSB0cmVlLlxuICAgKi9cbiAgZ2V0VmlzaWJsZU5vZGVzKHJvb3RLZXk6IHN0cmluZyk6IEFycmF5PEZpbGVUcmVlTm9kZT4ge1xuICAgIC8vIERvIHNvbWUgYmFzaWMgY2hlY2tzIHRvIGVuc3VyZSB0aGF0IHJvb3RLZXkgY29ycmVzcG9uZHMgdG8gYSByb290IGFuZCBpcyBleHBhbmRlZC4gSWYgbm90LFxuICAgIC8vIHJldHVybiB0aGUgYXBwcm9wcmlhdGUgYXJyYXkuXG4gICAgaWYgKCF0aGlzLmlzUm9vdEtleShyb290S2V5KSkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICBpZiAoIXRoaXMuaXNFeHBhbmRlZChyb290S2V5LCByb290S2V5KSkge1xuICAgICAgcmV0dXJuIFt0aGlzLmdldE5vZGUocm9vdEtleSwgcm9vdEtleSldO1xuICAgIH1cblxuICAgIC8vIE5vdGUgdGhhdCB3ZSBjb3VsZCBjYWNoZSB0aGUgdmlzaWJsZU5vZGVzIGFycmF5IHNvIHRoYXQgd2UgZG8gbm90IGhhdmUgdG8gY3JlYXRlIGl0IGZyb21cbiAgICAvLyBzY3JhdGNoIGVhY2ggdGltZSB0aGlzIGlzIGNhbGxlZCwgYnV0IGl0IGRvZXMgbm90IGFwcGVhciB0byBiZSBhIGJvdHRsZW5lY2sgYXQgcHJlc2VudC5cbiAgICBjb25zdCB2aXNpYmxlTm9kZXMgPSBbXTtcbiAgICBjb25zdCByb290S2V5c0ZvckRpcmVjdG9yaWVzVG9FeHBsb3JlID0gW3Jvb3RLZXldO1xuICAgIHdoaWxlIChyb290S2V5c0ZvckRpcmVjdG9yaWVzVG9FeHBsb3JlLmxlbmd0aCAhPT0gMCkge1xuICAgICAgY29uc3Qga2V5ID0gcm9vdEtleXNGb3JEaXJlY3Rvcmllc1RvRXhwbG9yZS5wb3AoKTtcbiAgICAgIHZpc2libGVOb2Rlcy5wdXNoKHRoaXMuZ2V0Tm9kZShrZXksIGtleSkpO1xuICAgICAgY29uc3QgY2hpbGRLZXlzID0gdGhpcy5fZGF0YS5jaGlsZEtleU1hcFtrZXldO1xuICAgICAgaWYgKGNoaWxkS2V5cyA9PSBudWxsIHx8IHRoaXMuX2RhdGEuaXNEaXJ0eU1hcFtrZXldKSB7XG4gICAgICAgIC8vIFRoaXMgaXMgd2hlcmUgZ2V0Q2hpbGRLZXlzKCkgd291bGQgZmV0Y2gsIGJ1dCB3ZSBkbyBub3Qgd2FudCB0byBkbyB0aGF0LlxuICAgICAgICAvLyBUT0RPOiBJZiBrZXkgaXMgaW4gaXNEaXJ0eU1hcCwgdGhlbiByZXRyeSB3aGVuIGl0IGlzIG5vdCBkaXJ0eT9cbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGZvciAoY29uc3QgY2hpbGRLZXkgb2YgY2hpbGRLZXlzKSB7XG4gICAgICAgIGlmIChGaWxlVHJlZUhlbHBlcnMuaXNEaXJLZXkoY2hpbGRLZXkpKSB7XG4gICAgICAgICAgaWYgKHRoaXMuaXNFeHBhbmRlZChyb290S2V5LCBrZXkpKSB7XG4gICAgICAgICAgICByb290S2V5c0ZvckRpcmVjdG9yaWVzVG9FeHBsb3JlLnB1c2goY2hpbGRLZXkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2aXNpYmxlTm9kZXMucHVzaCh0aGlzLmdldE5vZGUoa2V5LCBjaGlsZEtleSkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB2aXNpYmxlTm9kZXM7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhbGwgc2VsZWN0ZWQgbm9kZXMgYWNyb3NzIGFsbCByb290cyBpbiB0aGUgdHJlZS5cbiAgICovXG4gIGdldFNlbGVjdGVkTm9kZXMoKTogSW1tdXRhYmxlLk9yZGVyZWRTZXQ8RmlsZVRyZWVOb2RlPiB7XG4gICAgbGV0IHNlbGVjdGVkTm9kZXMgPSBuZXcgSW1tdXRhYmxlLk9yZGVyZWRTZXQoKTtcbiAgICB0aGlzLl9kYXRhLnJvb3RLZXlzLmZvckVhY2gocm9vdEtleSA9PiB7XG4gICAgICB0aGlzLmdldFNlbGVjdGVkS2V5cyhyb290S2V5KS5mb3JFYWNoKG5vZGVLZXkgPT4ge1xuICAgICAgICBzZWxlY3RlZE5vZGVzID0gc2VsZWN0ZWROb2Rlcy5hZGQodGhpcy5nZXROb2RlKHJvb3RLZXksIG5vZGVLZXkpKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIHJldHVybiBzZWxlY3RlZE5vZGVzO1xuICB9XG5cbiAgZ2V0U2luZ2xlU2VsZWN0ZWROb2RlKCk6ID9GaWxlVHJlZU5vZGUge1xuICAgIGNvbnN0IHNlbGVjdGVkUm9vdHMgPSBPYmplY3Qua2V5cyh0aGlzLl9kYXRhLnNlbGVjdGVkS2V5c0J5Um9vdCk7XG4gICAgaWYgKHNlbGVjdGVkUm9vdHMubGVuZ3RoICE9PSAxKSB7XG4gICAgICAvLyBUaGVyZSBpcyBtb3JlIHRoYW4gb25lIHJvb3Qgd2l0aCBzZWxlY3RlZCBub2Rlcy4gTm8gYnVlbm8uXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3Qgcm9vdEtleSA9IHNlbGVjdGVkUm9vdHNbMF07XG4gICAgY29uc3Qgc2VsZWN0ZWRLZXlzID0gdGhpcy5nZXRTZWxlY3RlZEtleXMocm9vdEtleSk7XG4gICAgLypcbiAgICAgKiBOb3RlOiBUaGlzIGRvZXMgbm90IGNhbGwgYGdldFNlbGVjdGVkTm9kZXNgIHRvIHByZXZlbnQgY3JlYXRpbmcgbm9kZXMgdGhhdCB3b3VsZCBiZSB0aHJvd25cbiAgICAgKiBhd2F5IGlmIHRoZXJlIGlzIG1vcmUgdGhhbiAxIHNlbGVjdGVkIG5vZGUuXG4gICAgICovXG4gICAgcmV0dXJuIChzZWxlY3RlZEtleXMuc2l6ZSA9PT0gMSkgPyB0aGlzLmdldE5vZGUocm9vdEtleSwgc2VsZWN0ZWRLZXlzLmZpcnN0KCkpIDogbnVsbDtcbiAgfVxuXG4gIGdldFJvb3ROb2RlKHJvb3RLZXk6IHN0cmluZyk6IEZpbGVUcmVlTm9kZSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0Tm9kZShyb290S2V5LCByb290S2V5KTtcbiAgfVxuXG4gIGdldE5vZGUocm9vdEtleTogc3RyaW5nLCBub2RlS2V5OiBzdHJpbmcpOiBGaWxlVHJlZU5vZGUge1xuICAgIHJldHVybiBuZXcgRmlsZVRyZWVOb2RlKHRoaXMsIHJvb3RLZXksIG5vZGVLZXkpO1xuICB9XG5cbiAgLyoqXG4gICAqIElmIGEgZmV0Y2ggaXMgbm90IGFscmVhZHkgaW4gcHJvZ3Jlc3MgaW5pdGlhdGUgYSBmZXRjaCBub3cuXG4gICAqL1xuICBfZmV0Y2hDaGlsZEtleXMobm9kZUtleTogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgZXhpc3RpbmdQcm9taXNlID0gdGhpcy5fZ2V0TG9hZGluZyhub2RlS2V5KTtcbiAgICBpZiAoZXhpc3RpbmdQcm9taXNlKSB7XG4gICAgICByZXR1cm4gZXhpc3RpbmdQcm9taXNlO1xuICAgIH1cblxuICAgIGNvbnN0IHByb21pc2UgPSBGaWxlVHJlZUhlbHBlcnMuZmV0Y2hDaGlsZHJlbihub2RlS2V5KS5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgIHRoaXMuX2xvZ2dlci5lcnJvcihgVW5hYmxlIHRvIGZldGNoIGNoaWxkcmVuIGZvciBcIiR7bm9kZUtleX1cIi5gKTtcbiAgICAgIHRoaXMuX2xvZ2dlci5lcnJvcignT3JpZ2luYWwgZXJyb3I6ICcsIGVycm9yKTtcbiAgICAgIC8vIENvbGxhcHNlIHRoZSBub2RlIGFuZCBjbGVhciBpdHMgbG9hZGluZyBzdGF0ZSBvbiBlcnJvciBzbyB0aGUgdXNlciBjYW4gcmV0cnkgZXhwYW5kaW5nIGl0LlxuICAgICAgY29uc3Qgcm9vdEtleSA9IHRoaXMuZ2V0Um9vdEZvcktleShub2RlS2V5KTtcbiAgICAgIGlmIChyb290S2V5ICE9IG51bGwpIHtcbiAgICAgICAgdGhpcy5fY29sbGFwc2VOb2RlKHJvb3RLZXksIG5vZGVLZXkpO1xuICAgICAgfVxuICAgICAgdGhpcy5fY2xlYXJMb2FkaW5nKG5vZGVLZXkpO1xuICAgIH0pLnRoZW4oY2hpbGRLZXlzID0+IHtcbiAgICAgIC8vIElmIHRoaXMgbm9kZSdzIHJvb3Qgd2VudCBhd2F5IHdoaWxlIHRoZSBQcm9taXNlIHdhcyByZXNvbHZpbmcsIGRvIG5vIG1vcmUgd29yay4gVGhpcyBub2RlXG4gICAgICAvLyBpcyBubyBsb25nZXIgbmVlZGVkIGluIHRoZSBzdG9yZS5cbiAgICAgIGlmICh0aGlzLmdldFJvb3RGb3JLZXkobm9kZUtleSkgPT0gbnVsbCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0aGlzLl9zZXRDaGlsZEtleXMobm9kZUtleSwgY2hpbGRLZXlzKTtcbiAgICAgIHRoaXMuX2FkZFN1YnNjcmlwdGlvbihub2RlS2V5KTtcbiAgICAgIHRoaXMuX2NsZWFyTG9hZGluZyhub2RlS2V5KTtcbiAgICB9KTtcblxuICAgIHRoaXMuX3NldExvYWRpbmcobm9kZUtleSwgcHJvbWlzZSk7XG4gICAgcmV0dXJuIHByb21pc2U7XG4gIH1cblxuICBfZ2V0TG9hZGluZyhub2RlS2V5OiBzdHJpbmcpOiA/UHJvbWlzZSB7XG4gICAgcmV0dXJuIHRoaXMuX2RhdGEuaXNMb2FkaW5nTWFwW25vZGVLZXldO1xuICB9XG5cbiAgX3NldExvYWRpbmcobm9kZUtleTogc3RyaW5nLCB2YWx1ZTogUHJvbWlzZSk6IHZvaWQge1xuICAgIHRoaXMuX3NldCgnaXNMb2FkaW5nTWFwJywgc2V0UHJvcGVydHkodGhpcy5fZGF0YS5pc0xvYWRpbmdNYXAsIG5vZGVLZXksIHZhbHVlKSk7XG4gIH1cblxuICAvKipcbiAgICogUmVzZXRzIHRoZSBub2RlIHRvIGJlIGtlcHQgaW4gdmlldyBpZiBubyBtb3JlIGRhdGEgaXMgYmVpbmcgYXdhaXRlZC4gU2FmZSB0byBjYWxsIG1hbnkgdGltZXNcbiAgICogYmVjYXVzZSBpdCBvbmx5IGNoYW5nZXMgc3RhdGUgaWYgYSBub2RlIGlzIGJlaW5nIHRyYWNrZWQuXG4gICAqL1xuICBfY2hlY2tUcmFja2VkTm9kZSgpOiB2b2lkIHtcbiAgICBpZiAoXG4gICAgICB0aGlzLl9kYXRhLnRyYWNrZWROb2RlICE9IG51bGwgJiZcbiAgICAgIC8qXG4gICAgICAgKiBUaGUgbG9hZGluZyBtYXAgYmVpbmcgZW1wdHkgaXMgYSBoZXVyaXN0aWMgZm9yIHdoZW4gbG9hZGluZyBoYXMgY29tcGxldGVkLiBJdCBpcyBpbmV4YWN0XG4gICAgICAgKiBiZWNhdXNlIHRoZSBsb2FkaW5nIG1pZ2h0IGJlIHVucmVsYXRlZCB0byB0aGUgdHJhY2tlZCBub2RlLCBob3dldmVyIGl0IGlzIGNoZWFwIGFuZCBmYWxzZVxuICAgICAgICogcG9zaXRpdmVzIHdpbGwgb25seSBsYXN0IHVudGlsIGxvYWRpbmcgaXMgY29tcGxldGUgb3IgdW50aWwgdGhlIHVzZXIgY2xpY2tzIGFub3RoZXIgbm9kZSBpblxuICAgICAgICogdGhlIHRyZWUuXG4gICAgICAgKi9cbiAgICAgIG9iamVjdFV0aWwuaXNFbXB0eSh0aGlzLl9kYXRhLmlzTG9hZGluZ01hcClcbiAgICApIHtcbiAgICAgIC8vIExvYWRpbmcgaGFzIGNvbXBsZXRlZC4gQWxsb3cgc2Nyb2xsaW5nIHRvIHByb2NlZWQgYXMgdXN1YWwuXG4gICAgICB0aGlzLl9zZXQoJ3RyYWNrZWROb2RlJywgbnVsbCk7XG4gICAgfVxuICB9XG5cbiAgX2NsZWFyTG9hZGluZyhub2RlS2V5OiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLl9zZXQoJ2lzTG9hZGluZ01hcCcsIGRlbGV0ZVByb3BlcnR5KHRoaXMuX2RhdGEuaXNMb2FkaW5nTWFwLCBub2RlS2V5KSk7XG4gICAgdGhpcy5fY2hlY2tUcmFja2VkTm9kZSgpO1xuICB9XG5cbiAgX2RlbGV0ZVNlbGVjdGVkTm9kZXMoKTogdm9pZCB7XG4gICAgY29uc3Qgc2VsZWN0ZWROb2RlcyA9IHRoaXMuZ2V0U2VsZWN0ZWROb2RlcygpO1xuICAgIHNlbGVjdGVkTm9kZXMuZm9yRWFjaChub2RlID0+IHtcbiAgICAgIGNvbnN0IGZpbGUgPSBGaWxlVHJlZUhlbHBlcnMuZ2V0RmlsZUJ5S2V5KG5vZGUubm9kZUtleSk7XG4gICAgICBpZiAoZmlsZSAhPSBudWxsKSB7XG4gICAgICAgIGlmIChGaWxlVHJlZUhlbHBlcnMuaXNMb2NhbEZpbGUoZmlsZSkpIHtcbiAgICAgICAgICAvLyBUT0RPOiBUaGlzIHNwZWNpYWwtY2FzZSBjYW4gYmUgZWxpbWluYXRlZCBvbmNlIGBkZWxldGUoKWAgaXMgYWRkZWQgdG8gYERpcmVjdG9yeWBcbiAgICAgICAgICAvLyBhbmQgYEZpbGVgLlxuICAgICAgICAgIHNoZWxsLm1vdmVJdGVtVG9UcmFzaChub2RlLm5vZGVQYXRoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAoKGZpbGU6IGFueSk6IChSZW1vdGVEaXJlY3RvcnkgfCBSZW1vdGVGaWxlKSkuZGVsZXRlKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIF9leHBhbmROb2RlKHJvb3RLZXk6IHN0cmluZywgbm9kZUtleTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5fc2V0RXhwYW5kZWRLZXlzKHJvb3RLZXksIHRoaXMuX2dldEV4cGFuZGVkS2V5cyhyb290S2V5KS5hZGQobm9kZUtleSkpO1xuICAgIC8vIElmIHdlIGhhdmUgY2hpbGQgbm9kZXMgdGhhdCBzaG91bGQgYWxzbyBiZSBleHBhbmRlZCwgZXhwYW5kIHRoZW0gbm93LlxuICAgIGxldCBwcmV2aW91c2x5RXhwYW5kZWQgPSB0aGlzLl9nZXRQcmV2aW91c2x5RXhwYW5kZWQocm9vdEtleSk7XG4gICAgaWYgKHByZXZpb3VzbHlFeHBhbmRlZC5oYXMobm9kZUtleSkpIHtcbiAgICAgIGZvciAoY29uc3QgY2hpbGRLZXkgb2YgcHJldmlvdXNseUV4cGFuZGVkLmdldChub2RlS2V5KSkge1xuICAgICAgICB0aGlzLl9leHBhbmROb2RlKHJvb3RLZXksIGNoaWxkS2V5KTtcbiAgICAgIH1cbiAgICAgIC8vIENsZWFyIHRoZSBwcmV2aW91c2x5RXhwYW5kZWQgbGlzdCBzaW5jZSB3ZSdyZSBkb25lIHdpdGggaXQuXG4gICAgICBwcmV2aW91c2x5RXhwYW5kZWQgPSBwcmV2aW91c2x5RXhwYW5kZWQuZGVsZXRlKG5vZGVLZXkpO1xuICAgICAgdGhpcy5fc2V0UHJldmlvdXNseUV4cGFuZGVkKHJvb3RLZXksIHByZXZpb3VzbHlFeHBhbmRlZCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFBlcmZvcm1lcyBhIGRlZXAgQkZTIHNjYW5uaW5nIGV4cGFuZCBvZiBjb250YWluZWQgbm9kZXMuXG4gICAqIHJldHVybnMgLSBhIHByb21pc2UgZnVsZmlsbGVkIHdoZW4gdGhlIGV4cGFuZCBvcGVyYXRpb24gaXMgZmluaXNoZWRcbiAgICovXG4gIF9leHBhbmROb2RlRGVlcChyb290S2V5OiBzdHJpbmcsIG5vZGVLZXk6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIC8vIFN0b3AgdGhlIHRyYXZlcnNhbCBhZnRlciAxMDAgbm9kZXMgd2VyZSBhZGRlZCB0byB0aGUgdHJlZVxuICAgIGNvbnN0IGl0Tm9kZXMgPSBuZXcgRmlsZVRyZWVTdG9yZUJmc0l0ZXJhdG9yKHRoaXMsIHJvb3RLZXksIG5vZGVLZXksIC8qIGxpbWl0Ki8gMTAwKTtcbiAgICBjb25zdCBwcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgIGNvbnN0IGV4cGFuZCA9ICgpID0+IHtcbiAgICAgICAgY29uc3QgdHJhdmVyc2VkTm9kZUtleSA9IGl0Tm9kZXMudHJhdmVyc2VkTm9kZSgpO1xuICAgICAgICBpZiAodHJhdmVyc2VkTm9kZUtleSkge1xuICAgICAgICAgIHRoaXMuX3NldEV4cGFuZGVkS2V5cyhyb290S2V5LCB0aGlzLl9nZXRFeHBhbmRlZEtleXMocm9vdEtleSkuYWRkKHRyYXZlcnNlZE5vZGVLZXkpKTtcbiAgICAgICAgICAvKipcbiAgICAgICAgICAgKiBFdmVuIGlmIHRoZXJlIHdlcmUgcHJldmlvdXNseSBleHBhbmRlZCBub2RlcyBpdCBkb2Vzbid0IG1hdHRlciBhc1xuICAgICAgICAgICAqIHdlJ2xsIGV4cGFuZCBhbGwgb2YgdGhlIGNoaWxkcmVuLlxuICAgICAgICAgICAqL1xuICAgICAgICAgIGxldCBwcmV2aW91c2x5RXhwYW5kZWQgPSB0aGlzLl9nZXRQcmV2aW91c2x5RXhwYW5kZWQocm9vdEtleSk7XG4gICAgICAgICAgcHJldmlvdXNseUV4cGFuZGVkID0gcHJldmlvdXNseUV4cGFuZGVkLmRlbGV0ZSh0cmF2ZXJzZWROb2RlS2V5KTtcbiAgICAgICAgICB0aGlzLl9zZXRQcmV2aW91c2x5RXhwYW5kZWQocm9vdEtleSwgcHJldmlvdXNseUV4cGFuZGVkKTtcblxuICAgICAgICAgIGNvbnN0IG5leHRQcm9taXNlID0gaXROb2Rlcy5uZXh0KCk7XG4gICAgICAgICAgaWYgKG5leHRQcm9taXNlKSB7XG4gICAgICAgICAgICBuZXh0UHJvbWlzZS50aGVuKGV4cGFuZCk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgZXhwYW5kKCk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gcHJvbWlzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBXaGVuIHdlIGNvbGxhcHNlIGEgbm9kZSB3ZSBuZWVkIHRvIGRvIHNvbWUgY2xlYW51cCByZW1vdmluZyBzdWJzY3JpcHRpb25zIGFuZCBzZWxlY3Rpb24uXG4gICAqL1xuICBfY29sbGFwc2VOb2RlKHJvb3RLZXk6IHN0cmluZywgbm9kZUtleTogc3RyaW5nKTogdm9pZCB7XG4gICAgY29uc3QgY2hpbGRLZXlzID0gdGhpcy5fZGF0YS5jaGlsZEtleU1hcFtub2RlS2V5XTtcbiAgICBsZXQgc2VsZWN0ZWRLZXlzID0gdGhpcy5fZGF0YS5zZWxlY3RlZEtleXNCeVJvb3Rbcm9vdEtleV07XG4gICAgY29uc3QgZXhwYW5kZWRDaGlsZEtleXMgPSBbXTtcbiAgICBpZiAoY2hpbGRLZXlzKSB7XG4gICAgICBjaGlsZEtleXMuZm9yRWFjaCgoY2hpbGRLZXkpID0+IHtcbiAgICAgICAgLy8gVW5zZWxlY3QgZWFjaCBjaGlsZC5cbiAgICAgICAgaWYgKHNlbGVjdGVkS2V5cyAmJiBzZWxlY3RlZEtleXMuaGFzKGNoaWxkS2V5KSkge1xuICAgICAgICAgIHNlbGVjdGVkS2V5cyA9IHNlbGVjdGVkS2V5cy5kZWxldGUoY2hpbGRLZXkpO1xuICAgICAgICAgIC8qXG4gICAgICAgICAgICogU2V0IHRoZSBzZWxlY3RlZCBrZXlzICpiZWZvcmUqIHRoZSByZWN1cnNpdmUgYF9jb2xsYXBzZU5vZGVgIGNhbGwgc28gZWFjaCBjYWxsIHN0b3Jlc1xuICAgICAgICAgICAqIGl0cyBjaGFuZ2VzIGFuZCBpc24ndCB3aXBlZCBvdXQgYnkgdGhlIG5leHQgY2FsbCBieSBrZWVwaW5nIGFuIG91dGRhdGVkIGBzZWxlY3RlZEtleXNgXG4gICAgICAgICAgICogaW4gdGhlIGNhbGwgc3RhY2suXG4gICAgICAgICAgICovXG4gICAgICAgICAgdGhpcy5fc2V0U2VsZWN0ZWRLZXlzKHJvb3RLZXksIHNlbGVjdGVkS2V5cyk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gQ29sbGFwc2UgZWFjaCBjaGlsZCBkaXJlY3RvcnkuXG4gICAgICAgIGlmIChGaWxlVHJlZUhlbHBlcnMuaXNEaXJLZXkoY2hpbGRLZXkpKSB7XG4gICAgICAgICAgaWYgKHRoaXMuaXNFeHBhbmRlZChyb290S2V5LCBjaGlsZEtleSkpIHtcbiAgICAgICAgICAgIGV4cGFuZGVkQ2hpbGRLZXlzLnB1c2goY2hpbGRLZXkpO1xuICAgICAgICAgICAgdGhpcy5fY29sbGFwc2VOb2RlKHJvb3RLZXksIGNoaWxkS2V5KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgICAvKlxuICAgICAqIFNhdmUgdGhlIGxpc3Qgb2YgZXhwYW5kZWQgY2hpbGQgbm9kZXMgc28gbmV4dCB0aW1lIHdlIGV4cGFuZCB0aGlzIG5vZGUgd2UgY2FuIGV4cGFuZCB0aGVzZVxuICAgICAqIGNoaWxkcmVuLlxuICAgICAqL1xuICAgIGxldCBwcmV2aW91c2x5RXhwYW5kZWQgPSB0aGlzLl9nZXRQcmV2aW91c2x5RXhwYW5kZWQocm9vdEtleSk7XG4gICAgaWYgKGV4cGFuZGVkQ2hpbGRLZXlzLmxlbmd0aCAhPT0gMCkge1xuICAgICAgcHJldmlvdXNseUV4cGFuZGVkID0gcHJldmlvdXNseUV4cGFuZGVkLnNldChub2RlS2V5LCBleHBhbmRlZENoaWxkS2V5cyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHByZXZpb3VzbHlFeHBhbmRlZCA9IHByZXZpb3VzbHlFeHBhbmRlZC5kZWxldGUobm9kZUtleSk7XG4gICAgfVxuICAgIHRoaXMuX3NldFByZXZpb3VzbHlFeHBhbmRlZChyb290S2V5LCBwcmV2aW91c2x5RXhwYW5kZWQpO1xuICAgIHRoaXMuX3NldEV4cGFuZGVkS2V5cyhyb290S2V5LCB0aGlzLl9nZXRFeHBhbmRlZEtleXMocm9vdEtleSkuZGVsZXRlKG5vZGVLZXkpKTtcbiAgICB0aGlzLl9yZW1vdmVTdWJzY3JpcHRpb24ocm9vdEtleSwgbm9kZUtleSk7XG4gIH1cblxuICBfZ2V0UHJldmlvdXNseUV4cGFuZGVkKHJvb3RLZXk6IHN0cmluZyk6IEltbXV0YWJsZS5NYXA8c3RyaW5nLCBBcnJheTxzdHJpbmc+PiB7XG4gICAgcmV0dXJuIHRoaXMuX2RhdGEucHJldmlvdXNseUV4cGFuZGVkW3Jvb3RLZXldIHx8IG5ldyBJbW11dGFibGUuTWFwKCk7XG4gIH1cblxuICBfc2V0UHJldmlvdXNseUV4cGFuZGVkKHJvb3RLZXk6IHN0cmluZyxcbiAgICBwcmV2aW91c2x5RXhwYW5kZWQ6IEltbXV0YWJsZS5NYXA8c3RyaW5nLCBBcnJheTxzdHJpbmc+Pik6IHZvaWQge1xuICAgIHRoaXMuX3NldChcbiAgICAgICdwcmV2aW91c2x5RXhwYW5kZWQnLFxuICAgICAgc2V0UHJvcGVydHkodGhpcy5fZGF0YS5wcmV2aW91c2x5RXhwYW5kZWQsIHJvb3RLZXksIHByZXZpb3VzbHlFeHBhbmRlZClcbiAgICApO1xuICB9XG5cbiAgX2dldEV4cGFuZGVkS2V5cyhyb290S2V5OiBzdHJpbmcpOiBJbW11dGFibGUuU2V0PHN0cmluZz4ge1xuICAgIHJldHVybiB0aGlzLl9kYXRhLmV4cGFuZGVkS2V5c0J5Um9vdFtyb290S2V5XSB8fCBuZXcgSW1tdXRhYmxlLlNldCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoaXMgaXMganVzdCBleHBvc2VkIHNvIGl0IGNhbiBiZSBtb2NrZWQgaW4gdGhlIHRlc3RzLiBOb3QgaWRlYWwsIGJ1dCBhIGxvdCBsZXNzIG1lc3N5IHRoYW4gdGhlXG4gICAqIGFsdGVybmF0aXZlcy4gRm9yIGV4YW1wbGUsIHBhc3Npbmcgb3B0aW9ucyB3aGVuIGNvbnN0cnVjdGluZyBhbiBpbnN0YW5jZSBvZiBhIHNpbmdsZXRvbiB3b3VsZFxuICAgKiBtYWtlIGZ1dHVyZSBpbnZvY2F0aW9ucyBvZiBgZ2V0SW5zdGFuY2VgIHVucHJlZGljdGFibGUuXG4gICAqL1xuICBfcmVwb3NpdG9yeUZvclBhdGgocGF0aDogTnVjbGlkZVVyaSk6ID9hdG9tJFJlcG9zaXRvcnkge1xuICAgIHJldHVybiB0aGlzLmdldFJlcG9zaXRvcmllcygpLmZpbmQocmVwbyA9PiByZXBvc2l0b3J5Q29udGFpbnNQYXRoKHJlcG8sIHBhdGgpKTtcbiAgfVxuXG4gIF9zZXRFeHBhbmRlZEtleXMocm9vdEtleTogc3RyaW5nLCBleHBhbmRlZEtleXM6IEltbXV0YWJsZS5TZXQ8c3RyaW5nPik6IHZvaWQge1xuICAgIHRoaXMuX3NldChcbiAgICAgICdleHBhbmRlZEtleXNCeVJvb3QnLFxuICAgICAgc2V0UHJvcGVydHkodGhpcy5fZGF0YS5leHBhbmRlZEtleXNCeVJvb3QsIHJvb3RLZXksIGV4cGFuZGVkS2V5cylcbiAgICApO1xuICB9XG5cbiAgX2RlbGV0ZVNlbGVjdGVkS2V5cyhyb290S2V5OiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLl9zZXQoJ3NlbGVjdGVkS2V5c0J5Um9vdCcsIGRlbGV0ZVByb3BlcnR5KHRoaXMuX2RhdGEuc2VsZWN0ZWRLZXlzQnlSb290LCByb290S2V5KSk7XG4gIH1cblxuICBfc2V0U2VsZWN0ZWRLZXlzKHJvb3RLZXk6IHN0cmluZywgc2VsZWN0ZWRLZXlzOiBJbW11dGFibGUuT3JkZXJlZFNldDxzdHJpbmc+KTogdm9pZCB7XG4gICAgLypcbiAgICAgKiBOZXcgc2VsZWN0aW9uIG1lYW5zIHByZXZpb3VzIG5vZGUgc2hvdWxkIG5vdCBiZSBrZXB0IGluIHZpZXcuIERvIHRoaXMgd2l0aG91dCBkZS1ib3VuY2luZ1xuICAgICAqIGJlY2F1c2UgdGhlIHByZXZpb3VzIHN0YXRlIGlzIGlycmVsZXZhbnQuIElmIHRoZSB1c2VyIGNob3NlIGEgbmV3IHNlbGVjdGlvbiwgdGhlIHByZXZpb3VzIG9uZVxuICAgICAqIHNob3VsZCBub3QgYmUgc2Nyb2xsZWQgaW50byB2aWV3LlxuICAgICAqL1xuICAgIHRoaXMuX3NldCgndHJhY2tlZE5vZGUnLCBudWxsKTtcbiAgICB0aGlzLl9zZXQoXG4gICAgICAnc2VsZWN0ZWRLZXlzQnlSb290JyxcbiAgICAgIHNldFByb3BlcnR5KHRoaXMuX2RhdGEuc2VsZWN0ZWRLZXlzQnlSb290LCByb290S2V5LCBzZWxlY3RlZEtleXMpXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBzZWxlY3RlZCBrZXlzIGluIGFsbCByb290cyBvZiB0aGUgdHJlZS4gVGhlIHNlbGVjdGVkIGtleXMgb2Ygcm9vdCBrZXlzIG5vdCBpblxuICAgKiBgc2VsZWN0ZWRLZXlzQnlSb290YCBhcmUgZGVsZXRlZCAodGhlIHJvb3QgaXMgbGVmdCB3aXRoIG5vIHNlbGVjdGlvbikuXG4gICAqL1xuICBfc2V0U2VsZWN0ZWRLZXlzQnlSb290KHNlbGVjdGVkS2V5c0J5Um9vdDoge1trZXk6IHN0cmluZ106IEltbXV0YWJsZS5PcmRlcmVkU2V0PHN0cmluZz59KTogdm9pZCB7XG4gICAgdGhpcy5nZXRSb290S2V5cygpLmZvckVhY2gocm9vdEtleSA9PiB7XG4gICAgICBpZiAoc2VsZWN0ZWRLZXlzQnlSb290Lmhhc093blByb3BlcnR5KHJvb3RLZXkpKSB7XG4gICAgICAgIHRoaXMuX3NldFNlbGVjdGVkS2V5cyhyb290S2V5LCBzZWxlY3RlZEtleXNCeVJvb3Rbcm9vdEtleV0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fZGVsZXRlU2VsZWN0ZWRLZXlzKHJvb3RLZXkpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgX3NldFJvb3RLZXlzKHJvb3RLZXlzOiBBcnJheTxzdHJpbmc+KTogdm9pZCB7XG4gICAgY29uc3Qgb2xkUm9vdEtleXMgPSB0aGlzLl9kYXRhLnJvb3RLZXlzO1xuICAgIGNvbnN0IG5ld1Jvb3RLZXlzID0gbmV3IEltbXV0YWJsZS5TZXQocm9vdEtleXMpO1xuICAgIGNvbnN0IHJlbW92ZWRSb290S2V5cyA9IG5ldyBJbW11dGFibGUuU2V0KG9sZFJvb3RLZXlzKS5zdWJ0cmFjdChuZXdSb290S2V5cyk7XG4gICAgcmVtb3ZlZFJvb3RLZXlzLmZvckVhY2godGhpcy5fcHVyZ2VSb290LmJpbmQodGhpcykpO1xuICAgIHRoaXMuX3NldCgncm9vdEtleXMnLCByb290S2V5cyk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyBhIHNpbmdsZSBjaGlsZCBub2RlLiBJdCdzIHVzZWZ1bCB3aGVuIGV4cGFuZGluZyB0byBhIGRlZXBseSBuZXN0ZWQgbm9kZS5cbiAgICovXG4gIF9jcmVhdGVDaGlsZChub2RlS2V5OiBzdHJpbmcsIGNoaWxkS2V5OiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLl9zZXRDaGlsZEtleXMobm9kZUtleSwgW2NoaWxkS2V5XSk7XG4gICAgLypcbiAgICAgKiBNYXJrIHRoZSBub2RlIGFzIGRpcnR5IHNvIGl0cyBhbmNlc3RvcnMgYXJlIGZldGNoZWQgYWdhaW4gb24gcmVsb2FkIG9mIHRoZSB0cmVlLlxuICAgICAqL1xuICAgIHRoaXMuX3NldCgnaXNEaXJ0eU1hcCcsIHNldFByb3BlcnR5KHRoaXMuX2RhdGEuaXNEaXJ0eU1hcCwgbm9kZUtleSwgdHJ1ZSkpO1xuICB9XG5cbiAgX3NldENoaWxkS2V5cyhub2RlS2V5OiBzdHJpbmcsIGNoaWxkS2V5czogQXJyYXk8c3RyaW5nPik6IHZvaWQge1xuICAgIGNvbnN0IG9sZENoaWxkS2V5cyA9IHRoaXMuX2RhdGEuY2hpbGRLZXlNYXBbbm9kZUtleV07XG4gICAgaWYgKG9sZENoaWxkS2V5cykge1xuICAgICAgY29uc3QgbmV3Q2hpbGRLZXlzID0gbmV3IEltbXV0YWJsZS5TZXQoY2hpbGRLZXlzKTtcbiAgICAgIGNvbnN0IHJlbW92ZWREaXJlY3RvcnlLZXlzID0gbmV3IEltbXV0YWJsZS5TZXQob2xkQ2hpbGRLZXlzKVxuICAgICAgICAuc3VidHJhY3QobmV3Q2hpbGRLZXlzKVxuICAgICAgICAuZmlsdGVyKEZpbGVUcmVlSGVscGVycy5pc0RpcktleSk7XG4gICAgICByZW1vdmVkRGlyZWN0b3J5S2V5cy5mb3JFYWNoKHRoaXMuX3B1cmdlRGlyZWN0b3J5LmJpbmQodGhpcykpO1xuICAgIH1cbiAgICB0aGlzLl9zZXQoJ2NoaWxkS2V5TWFwJywgc2V0UHJvcGVydHkodGhpcy5fZGF0YS5jaGlsZEtleU1hcCwgbm9kZUtleSwgY2hpbGRLZXlzKSk7XG4gIH1cblxuICBfb25EaXJlY3RvcnlDaGFuZ2Uobm9kZUtleTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5fZmV0Y2hDaGlsZEtleXMobm9kZUtleSk7XG4gIH1cblxuICBfYWRkU3Vic2NyaXB0aW9uKG5vZGVLZXk6IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IGRpcmVjdG9yeSA9IEZpbGVUcmVlSGVscGVycy5nZXREaXJlY3RvcnlCeUtleShub2RlS2V5KTtcbiAgICBpZiAoIWRpcmVjdG9yeSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8qXG4gICAgICogUmVtb3ZlIHRoZSBkaXJlY3RvcnkncyBkaXJ0eSBtYXJrZXIgcmVnYXJkbGVzcyBvZiB3aGV0aGVyIGEgc3Vic2NyaXB0aW9uIGFscmVhZHkgZXhpc3RzXG4gICAgICogYmVjYXVzZSB0aGVyZSBpcyBub3RoaW5nIGZ1cnRoZXIgbWFraW5nIGl0IGRpcnR5LlxuICAgICAqL1xuICAgIHRoaXMuX3NldCgnaXNEaXJ0eU1hcCcsIGRlbGV0ZVByb3BlcnR5KHRoaXMuX2RhdGEuaXNEaXJ0eU1hcCwgbm9kZUtleSkpO1xuXG4gICAgLy8gRG9uJ3QgY3JlYXRlIGEgbmV3IHN1YnNjcmlwdGlvbiBpZiBvbmUgYWxyZWFkeSBleGlzdHMuXG4gICAgaWYgKHRoaXMuX2RhdGEuc3Vic2NyaXB0aW9uTWFwW25vZGVLZXldKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbGV0IHN1YnNjcmlwdGlvbjtcbiAgICB0cnkge1xuICAgICAgLy8gVGhpcyBjYWxsIG1pZ2h0IGZhaWwgaWYgd2UgdHJ5IHRvIHdhdGNoIGEgbm9uLWV4aXN0aW5nIGRpcmVjdG9yeSwgb3IgaWYgcGVybWlzc2lvbiBkZW5pZWQuXG4gICAgICBzdWJzY3JpcHRpb24gPSBkaXJlY3Rvcnkub25EaWRDaGFuZ2UoKCkgPT4ge1xuICAgICAgICB0aGlzLl9vbkRpcmVjdG9yeUNoYW5nZShub2RlS2V5KTtcbiAgICAgIH0pO1xuICAgIH0gY2F0Y2ggKGV4KSB7XG4gICAgICAvKlxuICAgICAgICogTG9nIGVycm9yIGFuZCBtYXJrIHRoZSBkaXJlY3RvcnkgYXMgZGlydHkgc28gdGhlIGZhaWxlZCBzdWJzY3JpcHRpb24gd2lsbCBiZSBhdHRlbXB0ZWRcbiAgICAgICAqIGFnYWluIG5leHQgdGltZSB0aGUgZGlyZWN0b3J5IGlzIGV4cGFuZGVkLlxuICAgICAgICovXG4gICAgICB0aGlzLl9sb2dnZXIuZXJyb3IoYENhbm5vdCBzdWJzY3JpYmUgdG8gZGlyZWN0b3J5IFwiJHtub2RlS2V5fVwiYCwgZXgpO1xuICAgICAgdGhpcy5fc2V0KCdpc0RpcnR5TWFwJywgc2V0UHJvcGVydHkodGhpcy5fZGF0YS5pc0RpcnR5TWFwLCBub2RlS2V5KSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuX3NldCgnc3Vic2NyaXB0aW9uTWFwJywgc2V0UHJvcGVydHkodGhpcy5fZGF0YS5zdWJzY3JpcHRpb25NYXAsIG5vZGVLZXksIHN1YnNjcmlwdGlvbikpO1xuICB9XG5cbiAgX3JlbW92ZVN1YnNjcmlwdGlvbihyb290S2V5OiBzdHJpbmcsIG5vZGVLZXk6IHN0cmluZyk6IHZvaWQge1xuICAgIGxldCBoYXNSZW1haW5pbmdTdWJzY3JpYmVycztcbiAgICBjb25zdCBzdWJzY3JpcHRpb24gPSB0aGlzLl9kYXRhLnN1YnNjcmlwdGlvbk1hcFtub2RlS2V5XTtcblxuICAgIGlmIChzdWJzY3JpcHRpb24gIT0gbnVsbCkge1xuICAgICAgaGFzUmVtYWluaW5nU3Vic2NyaWJlcnMgPSB0aGlzLl9kYXRhLnJvb3RLZXlzLnNvbWUoKG90aGVyUm9vdEtleSkgPT4gKFxuICAgICAgICBvdGhlclJvb3RLZXkgIT09IHJvb3RLZXkgJiYgdGhpcy5pc0V4cGFuZGVkKG90aGVyUm9vdEtleSwgbm9kZUtleSlcbiAgICAgICkpO1xuICAgICAgaWYgKCFoYXNSZW1haW5pbmdTdWJzY3JpYmVycykge1xuICAgICAgICBzdWJzY3JpcHRpb24uZGlzcG9zZSgpO1xuICAgICAgICB0aGlzLl9zZXQoJ3N1YnNjcmlwdGlvbk1hcCcsIGRlbGV0ZVByb3BlcnR5KHRoaXMuX2RhdGEuc3Vic2NyaXB0aW9uTWFwLCBub2RlS2V5KSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHN1YnNjcmlwdGlvbiA9PSBudWxsIHx8IGhhc1JlbWFpbmluZ1N1YnNjcmliZXJzID09PSBmYWxzZSkge1xuICAgICAgLy8gU2luY2Ugd2UncmUgbm8gbG9uZ2VyIGdldHRpbmcgbm90aWZpY2F0aW9ucyB3aGVuIHRoZSBkaXJlY3RvcnkgY29udGVudHMgY2hhbmdlLCBhc3N1bWUgdGhlXG4gICAgICAvLyBjaGlsZCBsaXN0IGlzIGRpcnR5LlxuICAgICAgdGhpcy5fc2V0KCdpc0RpcnR5TWFwJywgc2V0UHJvcGVydHkodGhpcy5fZGF0YS5pc0RpcnR5TWFwLCBub2RlS2V5LCB0cnVlKSk7XG4gICAgfVxuICB9XG5cbiAgX3JlbW92ZUFsbFN1YnNjcmlwdGlvbnMobm9kZUtleTogc3RyaW5nKTogdm9pZCB7XG4gICAgY29uc3Qgc3Vic2NyaXB0aW9uID0gdGhpcy5fZGF0YS5zdWJzY3JpcHRpb25NYXBbbm9kZUtleV07XG4gICAgaWYgKHN1YnNjcmlwdGlvbikge1xuICAgICAgc3Vic2NyaXB0aW9uLmRpc3Bvc2UoKTtcbiAgICAgIHRoaXMuX3NldCgnc3Vic2NyaXB0aW9uTWFwJywgZGVsZXRlUHJvcGVydHkodGhpcy5fZGF0YS5zdWJzY3JpcHRpb25NYXAsIG5vZGVLZXkpKTtcbiAgICB9XG4gIH1cblxuICBfcHVyZ2VOb2RlKHJvb3RLZXk6IHN0cmluZywgbm9kZUtleTogc3RyaW5nLCB1bnNlbGVjdDogYm9vbGVhbik6IHZvaWQge1xuICAgIGNvbnN0IGV4cGFuZGVkS2V5cyA9IHRoaXMuX2dldEV4cGFuZGVkS2V5cyhyb290S2V5KTtcbiAgICBpZiAoZXhwYW5kZWRLZXlzLmhhcyhub2RlS2V5KSkge1xuICAgICAgdGhpcy5fc2V0RXhwYW5kZWRLZXlzKHJvb3RLZXksIGV4cGFuZGVkS2V5cy5kZWxldGUobm9kZUtleSkpO1xuICAgIH1cblxuICAgIGlmICh1bnNlbGVjdCkge1xuICAgICAgY29uc3Qgc2VsZWN0ZWRLZXlzID0gdGhpcy5nZXRTZWxlY3RlZEtleXMocm9vdEtleSk7XG4gICAgICBpZiAoc2VsZWN0ZWRLZXlzLmhhcyhub2RlS2V5KSkge1xuICAgICAgICB0aGlzLl9zZXRTZWxlY3RlZEtleXMocm9vdEtleSwgc2VsZWN0ZWRLZXlzLmRlbGV0ZShub2RlS2V5KSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgcHJldmlvdXNseUV4cGFuZGVkID0gdGhpcy5fZ2V0UHJldmlvdXNseUV4cGFuZGVkKHJvb3RLZXkpO1xuICAgIGlmIChwcmV2aW91c2x5RXhwYW5kZWQuaGFzKG5vZGVLZXkpKSB7XG4gICAgICB0aGlzLl9zZXRQcmV2aW91c2x5RXhwYW5kZWQocm9vdEtleSwgcHJldmlvdXNseUV4cGFuZGVkLmRlbGV0ZShub2RlS2V5KSk7XG4gICAgfVxuICB9XG5cbiAgX3B1cmdlRGlyZWN0b3J5V2l0aGluQVJvb3Qocm9vdEtleTogc3RyaW5nLCBub2RlS2V5OiBzdHJpbmcsIHVuc2VsZWN0OiBib29sZWFuKTogdm9pZCB7XG4gICAgY29uc3QgY2hpbGRLZXlzID0gdGhpcy5fZGF0YS5jaGlsZEtleU1hcFtub2RlS2V5XTtcbiAgICBpZiAoY2hpbGRLZXlzKSB7XG4gICAgICBjaGlsZEtleXMuZm9yRWFjaCgoY2hpbGRLZXkpID0+IHtcbiAgICAgICAgaWYgKEZpbGVUcmVlSGVscGVycy5pc0RpcktleShjaGlsZEtleSkpIHtcbiAgICAgICAgICB0aGlzLl9wdXJnZURpcmVjdG9yeVdpdGhpbkFSb290KHJvb3RLZXksIGNoaWxkS2V5LCAvKiB1bnNlbGVjdCAqLyB0cnVlKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICAgIHRoaXMuX3JlbW92ZVN1YnNjcmlwdGlvbihyb290S2V5LCBub2RlS2V5KTtcbiAgICB0aGlzLl9wdXJnZU5vZGUocm9vdEtleSwgbm9kZUtleSwgdW5zZWxlY3QpO1xuICB9XG5cbiAgLy8gVGhpcyBpcyBjYWxsZWQgd2hlbiBhIGRpcmN0b3J5IGlzIHBoeXNpY2FsbHkgcmVtb3ZlZCBmcm9tIGRpc2suIFdoZW4gd2UgcHVyZ2UgYSBkaXJlY3RvcnksXG4gIC8vIHdlIG5lZWQgdG8gcHVyZ2UgaXQncyBjaGlsZCBkaXJlY3RvcmllcyBhbHNvLiBQdXJnaW5nIHJlbW92ZXMgc3R1ZmYgZnJvbSB0aGUgZGF0YSBzdG9yZVxuICAvLyBpbmNsdWRpbmcgbGlzdCBvZiBjaGlsZCBub2Rlcywgc3Vic2NyaXB0aW9ucywgZXhwYW5kZWQgZGlyZWN0b3JpZXMgYW5kIHNlbGVjdGVkIGRpcmVjdG9yaWVzLlxuICBfcHVyZ2VEaXJlY3Rvcnkobm9kZUtleTogc3RyaW5nKTogdm9pZCB7XG4gICAgY29uc3QgY2hpbGRLZXlzID0gdGhpcy5fZGF0YS5jaGlsZEtleU1hcFtub2RlS2V5XTtcbiAgICBpZiAoY2hpbGRLZXlzKSB7XG4gICAgICBjaGlsZEtleXMuZm9yRWFjaCgoY2hpbGRLZXkpID0+IHtcbiAgICAgICAgaWYgKEZpbGVUcmVlSGVscGVycy5pc0RpcktleShjaGlsZEtleSkpIHtcbiAgICAgICAgICB0aGlzLl9wdXJnZURpcmVjdG9yeShjaGlsZEtleSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgdGhpcy5fc2V0KCdjaGlsZEtleU1hcCcsIGRlbGV0ZVByb3BlcnR5KHRoaXMuX2RhdGEuY2hpbGRLZXlNYXAsIG5vZGVLZXkpKTtcbiAgICB9XG5cbiAgICB0aGlzLl9yZW1vdmVBbGxTdWJzY3JpcHRpb25zKG5vZGVLZXkpO1xuICAgIHRoaXMuZ2V0Um9vdEtleXMoKS5mb3JFYWNoKHJvb3RLZXkgPT4ge1xuICAgICAgdGhpcy5fcHVyZ2VOb2RlKHJvb3RLZXksIG5vZGVLZXksIC8qIHVuc2VsZWN0ICovIHRydWUpO1xuICAgIH0pO1xuICB9XG5cbiAgLy8gVE9ETzogU2hvdWxkIHdlIGNsZWFuIHVwIGlzTG9hZGluZ01hcD8gSXQgY29udGFpbnMgcHJvbWlzZXMgd2hpY2ggY2Fubm90IGJlIGNhbmNlbGxlZCwgc28gdGhpc1xuICAvLyBtaWdodCBiZSB0cmlja3kuXG4gIF9wdXJnZVJvb3Qocm9vdEtleTogc3RyaW5nKTogdm9pZCB7XG4gICAgY29uc3QgZXhwYW5kZWRLZXlzID0gdGhpcy5fZGF0YS5leHBhbmRlZEtleXNCeVJvb3Rbcm9vdEtleV07XG4gICAgaWYgKGV4cGFuZGVkS2V5cykge1xuICAgICAgZXhwYW5kZWRLZXlzLmZvckVhY2goKG5vZGVLZXkpID0+IHtcbiAgICAgICAgdGhpcy5fcmVtb3ZlU3Vic2NyaXB0aW9uKHJvb3RLZXksIG5vZGVLZXkpO1xuICAgICAgfSk7XG4gICAgICB0aGlzLl9zZXQoJ2V4cGFuZGVkS2V5c0J5Um9vdCcsIGRlbGV0ZVByb3BlcnR5KHRoaXMuX2RhdGEuZXhwYW5kZWRLZXlzQnlSb290LCByb290S2V5KSk7XG4gICAgfVxuICAgIHRoaXMuX3NldCgnc2VsZWN0ZWRLZXlzQnlSb290JywgZGVsZXRlUHJvcGVydHkodGhpcy5fZGF0YS5zZWxlY3RlZEtleXNCeVJvb3QsIHJvb3RLZXkpKTtcbiAgICAvLyBSZW1vdmUgYWxsIGNoaWxkIGtleXMgc28gdGhhdCBvbiByZS1hZGRpdGlvbiBvZiB0aGlzIHJvb3QgdGhlIGNoaWxkcmVuIHdpbGwgYmUgZmV0Y2hlZCBhZ2Fpbi5cbiAgICBjb25zdCBjaGlsZEtleXMgPSB0aGlzLl9kYXRhLmNoaWxkS2V5TWFwW3Jvb3RLZXldO1xuICAgIGlmIChjaGlsZEtleXMpIHtcbiAgICAgIGNoaWxkS2V5cy5mb3JFYWNoKChjaGlsZEtleSkgPT4ge1xuICAgICAgICBpZiAoRmlsZVRyZWVIZWxwZXJzLmlzRGlyS2V5KGNoaWxkS2V5KSkge1xuICAgICAgICAgIHRoaXMuX3NldCgnY2hpbGRLZXlNYXAnLCBkZWxldGVQcm9wZXJ0eSh0aGlzLl9kYXRhLmNoaWxkS2V5TWFwLCBjaGlsZEtleSkpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHRoaXMuX3NldCgnY2hpbGRLZXlNYXAnLCBkZWxldGVQcm9wZXJ0eSh0aGlzLl9kYXRhLmNoaWxkS2V5TWFwLCByb290S2V5KSk7XG4gICAgfVxuICAgIHRoaXMuX3NldCgndmNzU3RhdHVzZXNCeVJvb3QnLCBkZWxldGVQcm9wZXJ0eSh0aGlzLl9kYXRhLnZjc1N0YXR1c2VzQnlSb290LCByb290S2V5KSk7XG4gIH1cblxuICBfc2V0VHJhY2tlZE5vZGUocm9vdEtleTogc3RyaW5nLCBub2RlS2V5OiBzdHJpbmcpOiB2b2lkIHtcbiAgICAvLyBGbHVzaCB0aGUgdmFsdWUgdG8gZW5zdXJlIGNsaWVudHMgc2VlIHRoZSB2YWx1ZSBhdCBsZWFzdCBvbmNlIGFuZCBzY3JvbGwgYXBwcm9wcmlhdGVseS5cbiAgICB0aGlzLl9zZXQoJ3RyYWNrZWROb2RlJywge25vZGVLZXksIHJvb3RLZXl9LCB0cnVlKTtcbiAgfVxuXG4gIF9zZXRSZXBvc2l0b3JpZXMocmVwb3NpdG9yaWVzOiBJbW11dGFibGUuU2V0PGF0b20kUmVwb3NpdG9yeT4pOiB2b2lkIHtcbiAgICB0aGlzLl9zZXQoJ3JlcG9zaXRvcmllcycsIHJlcG9zaXRvcmllcyk7XG5cbiAgICAvLyBXaGVuZXZlciBhIG5ldyBzZXQgb2YgcmVwb3NpdG9yaWVzIGNvbWVzIGluLCBpbnZhbGlkYXRlIG91ciBwYXRocyBjYWNoZSBieSByZXNldHRpbmcgaXRzXG4gICAgLy8gYGNhY2hlYCBwcm9wZXJ0eSAoY3JlYXRlZCBieSBsb2Rhc2gubWVtb2l6ZSkgdG8gYW4gZW1wdHkgbWFwLlxuICAgIHRoaXMuX3JlcG9zaXRvcnlGb3JQYXRoLmNhY2hlID0gbmV3IE1hcCgpO1xuICB9XG5cbiAgX29taXRIaWRkZW5QYXRocyhub2RlS2V5czogQXJyYXk8c3RyaW5nPik6IEFycmF5PHN0cmluZz4ge1xuICAgIGlmICghdGhpcy5fZGF0YS5oaWRlSWdub3JlZE5hbWVzICYmICF0aGlzLl9kYXRhLmV4Y2x1ZGVWY3NJZ25vcmVkUGF0aHMpIHtcbiAgICAgIHJldHVybiBub2RlS2V5cztcbiAgICB9XG5cbiAgICByZXR1cm4gbm9kZUtleXMuZmlsdGVyKG5vZGVLZXkgPT4gIXRoaXMuX3Nob3VsZEhpZGVQYXRoKG5vZGVLZXkpKTtcbiAgfVxuXG4gIF9zaG91bGRIaWRlUGF0aChub2RlS2V5OiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICBjb25zdCB7aGlkZUlnbm9yZWROYW1lcywgZXhjbHVkZVZjc0lnbm9yZWRQYXRocywgaWdub3JlZFBhdHRlcm5zfSA9IHRoaXMuX2RhdGE7XG4gICAgaWYgKGhpZGVJZ25vcmVkTmFtZXMgJiYgbWF0Y2hlc1NvbWUobm9kZUtleSwgaWdub3JlZFBhdHRlcm5zKSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGlmIChleGNsdWRlVmNzSWdub3JlZFBhdGhzICYmIGlzVmNzSWdub3JlZChub2RlS2V5LCB0aGlzLl9yZXBvc2l0b3J5Rm9yUGF0aChub2RlS2V5KSkpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICByZXNldCgpOiB2b2lkIHtcbiAgICBjb25zdCBzdWJzY3JpcHRpb25NYXAgPSB0aGlzLl9kYXRhLnN1YnNjcmlwdGlvbk1hcDtcbiAgICBmb3IgKGNvbnN0IG5vZGVLZXkgb2YgT2JqZWN0LmtleXMoc3Vic2NyaXB0aW9uTWFwKSkge1xuICAgICAgY29uc3Qgc3Vic2NyaXB0aW9uID0gc3Vic2NyaXB0aW9uTWFwW25vZGVLZXldO1xuICAgICAgaWYgKHN1YnNjcmlwdGlvbikge1xuICAgICAgICBzdWJzY3JpcHRpb24uZGlzcG9zZSgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFJlc2V0IGRhdGEgc3RvcmUuXG4gICAgdGhpcy5fZGF0YSA9IHRoaXMuX2dldERlZmF1bHRzKCk7XG4gIH1cblxuICBzdWJzY3JpYmUobGlzdGVuZXI6IENoYW5nZUxpc3RlbmVyKTogRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuX2VtaXR0ZXIub24oJ2NoYW5nZScsIGxpc3RlbmVyKTtcbiAgfVxufVxuXG4vLyBBIGhlbHBlciB0byBkZWxldGUgYSBwcm9wZXJ0eSBpbiBhbiBvYmplY3QgdXNpbmcgc2hhbGxvdyBjb3B5IHJhdGhlciB0aGFuIG11dGF0aW9uXG5mdW5jdGlvbiBkZWxldGVQcm9wZXJ0eShvYmplY3Q6IE9iamVjdCwga2V5OiBzdHJpbmcpOiBPYmplY3Qge1xuICBpZiAoIW9iamVjdC5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgcmV0dXJuIG9iamVjdDtcbiAgfVxuICBjb25zdCBuZXdPYmplY3QgPSB7Li4ub2JqZWN0fTtcbiAgZGVsZXRlIG5ld09iamVjdFtrZXldO1xuICByZXR1cm4gbmV3T2JqZWN0O1xufVxuXG4vLyBBIGhlbHBlciB0byBzZXQgYSBwcm9wZXJ0eSBpbiBhbiBvYmplY3QgdXNpbmcgc2hhbGxvdyBjb3B5IHJhdGhlciB0aGFuIG11dGF0aW9uXG5mdW5jdGlvbiBzZXRQcm9wZXJ0eShvYmplY3Q6IE9iamVjdCwga2V5OiBzdHJpbmcsIG5ld1ZhbHVlOiBtaXhlZCk6IE9iamVjdCB7XG4gIGNvbnN0IG9sZFZhbHVlID0gb2JqZWN0W2tleV07XG4gIGlmIChvbGRWYWx1ZSA9PT0gbmV3VmFsdWUpIHtcbiAgICByZXR1cm4gb2JqZWN0O1xuICB9XG4gIGNvbnN0IG5ld09iamVjdCA9IHsuLi5vYmplY3R9O1xuICBuZXdPYmplY3Rba2V5XSA9IG5ld1ZhbHVlO1xuICByZXR1cm4gbmV3T2JqZWN0O1xufVxuXG4vLyBDcmVhdGUgYSBuZXcgb2JqZWN0IGJ5IG1hcHBpbmcgb3ZlciB0aGUgcHJvcGVydGllcyBvZiBhIGdpdmVuIG9iamVjdCwgY2FsbGluZyB0aGUgZ2l2ZW5cbi8vIGZ1bmN0aW9uIG9uIGVhY2ggb25lLlxuZnVuY3Rpb24gbWFwVmFsdWVzKG9iamVjdDogT2JqZWN0LCBmbjogRnVuY3Rpb24pOiBPYmplY3Qge1xuICBjb25zdCBuZXdPYmplY3QgPSB7fTtcbiAgT2JqZWN0LmtleXMob2JqZWN0KS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICBuZXdPYmplY3Rba2V5XSA9IGZuKG9iamVjdFtrZXldLCBrZXkpO1xuICB9KTtcbiAgcmV0dXJuIG5ld09iamVjdDtcbn1cblxuLy8gRGV0ZXJtaW5lIHdoZXRoZXIgdGhlIGdpdmVuIHN0cmluZyBtYXRjaGVzIGFueSBvZiBhIHNldCBvZiBwYXR0ZXJucy5cbmZ1bmN0aW9uIG1hdGNoZXNTb21lKHN0cjogc3RyaW5nLCBwYXR0ZXJuczogSW1tdXRhYmxlLlNldDxNaW5pbWF0Y2g+KSB7XG4gIHJldHVybiBwYXR0ZXJucy5zb21lKHBhdHRlcm4gPT4gcGF0dGVybi5tYXRjaChzdHIpKTtcbn1cblxuZnVuY3Rpb24gaXNWY3NJZ25vcmVkKG5vZGVLZXk6IHN0cmluZywgcmVwbzogP2F0b20kUmVwb3NpdG9yeSkge1xuICByZXR1cm4gcmVwbyAmJiByZXBvLmlzUHJvamVjdEF0Um9vdCgpICYmIHJlcG8uaXNQYXRoSWdub3JlZChub2RlS2V5KTtcbn1cblxuXG4vKipcbiAqIFBlcmZvcm1zIGEgYnJlYWR0aC1maXJzdCBpdGVyYXRpb24gb3ZlciB0aGUgZGlyZWN0b3JpZXMgb2YgdGhlIHRyZWUgc3RhcnRpbmdcbiAqIHdpdGggYSBnaXZlbiBub2RlLiBUaGUgaXRlcmF0aW9uIHN0b3BzIG9uY2UgYSBnaXZlbiBsaW1pdCBvZiBub2RlcyAoYm90aCBkaXJlY3Rvcmllc1xuICogYW5kIGZpbGVzKSB3ZXJlIHRyYXZlcnNlZC5cbiAqIFRoZSBub2RlIGJlaW5nIGN1cnJlbnRseSB0cmF2ZXJzZWQgY2FuIGJlIG9idGFpbmVkIGJ5IGNhbGxpbmcgLnRyYXZlcnNlZE5vZGUoKVxuICogLm5leHQoKSByZXR1cm5zIGEgcHJvbWlzZSB0aGF0IGlzIGZ1bGZpbGxlZCB3aGVuIHRoZSB0cmF2ZXJzYWwgbW92ZXMgb24gdG9cbiAqIHRoZSBuZXh0IGRpcmVjdG9yeS5cbiAqL1xuY2xhc3MgRmlsZVRyZWVTdG9yZUJmc0l0ZXJhdG9yIHtcbiAgX2ZpbGVUcmVlU3RvcmU6IEZpbGVUcmVlU3RvcmU7XG4gIF9yb290S2V5OiBzdHJpbmc7XG4gIF9ub2Rlc1RvVHJhdmVyc2U6IEFycmF5PHN0cmluZz47XG4gIF9jdXJyZW50bHlUcmF2ZXJzZWROb2RlOiA/c3RyaW5nO1xuICBfbGltaXQ6IG51bWJlcjtcbiAgX251bU5vZGVzVHJhdmVyc2VkOiBudW1iZXI7XG4gIF9wcm9taXNlOiA/UHJvbWlzZTx2b2lkPjtcbiAgX2NvdW50OiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBmaWxlVHJlZVN0b3JlOiBGaWxlVHJlZVN0b3JlLFxuICAgICAgcm9vdEtleTogc3RyaW5nLFxuICAgICAgbm9kZUtleTogc3RyaW5nLFxuICAgICAgbGltaXQ6IG51bWJlcikge1xuICAgIHRoaXMuX2ZpbGVUcmVlU3RvcmUgPSBmaWxlVHJlZVN0b3JlO1xuICAgIHRoaXMuX3Jvb3RLZXkgPSByb290S2V5O1xuICAgIHRoaXMuX25vZGVzVG9UcmF2ZXJzZSA9IFtdO1xuICAgIHRoaXMuX2N1cnJlbnRseVRyYXZlcnNlZE5vZGUgPSBub2RlS2V5O1xuICAgIHRoaXMuX2xpbWl0ID0gbGltaXQ7XG4gICAgdGhpcy5fbnVtTm9kZXNUcmF2ZXJzZWQgPSAwO1xuICAgIHRoaXMuX3Byb21pc2UgPSBudWxsO1xuICAgIHRoaXMuX2NvdW50ID0gMDtcbiAgfVxuXG4gIF9oYW5kbGVQcm9taXNlUmVzb2x1dGlvbihjaGlsZHJlbktleXM6IEFycmF5PHN0cmluZz4pOiB2b2lkIHtcbiAgICB0aGlzLl9udW1Ob2Rlc1RyYXZlcnNlZCArPSBjaGlsZHJlbktleXMubGVuZ3RoO1xuICAgIGlmICh0aGlzLl9udW1Ob2Rlc1RyYXZlcnNlZCA8IHRoaXMuX2xpbWl0KSB7XG4gICAgICBjb25zdCBuZXh0TGV2ZWxOb2RlcyA9IGNoaWxkcmVuS2V5cy5maWx0ZXIoY2hpbGRLZXkgPT4gRmlsZVRyZWVIZWxwZXJzLmlzRGlyS2V5KGNoaWxkS2V5KSk7XG4gICAgICB0aGlzLl9ub2Rlc1RvVHJhdmVyc2UgPSB0aGlzLl9ub2Rlc1RvVHJhdmVyc2UuY29uY2F0KG5leHRMZXZlbE5vZGVzKTtcblxuICAgICAgdGhpcy5fY3VycmVudGx5VHJhdmVyc2VkTm9kZSA9IHRoaXMuX25vZGVzVG9UcmF2ZXJzZS5zcGxpY2UoMCwgMSlbMF07XG4gICAgICB0aGlzLl9wcm9taXNlID0gbnVsbDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB0aGlzLl9jdXJyZW50bHlUcmF2ZXJzZWROb2RlID0gbnVsbDtcbiAgICAgIHRoaXMuX3Byb21pc2UgPSBudWxsO1xuICAgIH1cblxuICAgIHJldHVybjtcbiAgfVxuXG4gIG5leHQoKTogP1Byb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IGN1cnJlbnRseVRyYXZlcnNlZE5vZGUgPSB0aGlzLl9jdXJyZW50bHlUcmF2ZXJzZWROb2RlO1xuICAgIGlmICghdGhpcy5fcHJvbWlzZSAmJiBjdXJyZW50bHlUcmF2ZXJzZWROb2RlKSB7XG4gICAgICB0aGlzLl9wcm9taXNlID0gdGhpcy5fZmlsZVRyZWVTdG9yZS5wcm9taXNlTm9kZUNoaWxkS2V5cyhcbiAgICAgICAgdGhpcy5fcm9vdEtleSxcbiAgICAgICAgY3VycmVudGx5VHJhdmVyc2VkTm9kZSlcbiAgICAgIC50aGVuKHRoaXMuX2hhbmRsZVByb21pc2VSZXNvbHV0aW9uLmJpbmQodGhpcykpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fcHJvbWlzZTtcbiAgfVxuXG4gIHRyYXZlcnNlZE5vZGUoKTogP3N0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX2N1cnJlbnRseVRyYXZlcnNlZE5vZGU7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBGaWxlVHJlZVN0b3JlO1xuIl19