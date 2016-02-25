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

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _FileTreeDispatcher = require('./FileTreeDispatcher');

var _FileTreeDispatcher2 = _interopRequireDefault(_FileTreeDispatcher);

var _FileTreeHelpers = require('./FileTreeHelpers');

var _FileTreeHelpers2 = _interopRequireDefault(_FileTreeHelpers);

var _FileTreeNode = require('./FileTreeNode');

var _FileTreeNode2 = _interopRequireDefault(_FileTreeNode);

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _FileTreeConstants = require('./FileTreeConstants');

var _atom = require('atom');

var _minimatch = require('minimatch');

var _hgGitBridge = require('../../hg-git-bridge');

var _hgRepositoryBaseLibHgConstants = require('../../hg-repository-base/lib/hg-constants');

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
          this._deleteSelectedNodes()['catch'](function (error) {
            atom.notifications.addError('Deleting nodes failed with an error: ' + error.toString());
          });
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
    value: _asyncToGenerator(function* () {
      var selectedNodes = this.getSelectedNodes();
      yield Promise.all(selectedNodes.map(_asyncToGenerator(function* (node) {
        var file = _FileTreeHelpers2['default'].getFileByKey(node.nodeKey);
        if (file == null) {
          return;
        }
        var repository = (0, _hgGitBridge.repositoryForPath)(file.getPath());
        if (repository != null && repository.getType() === 'hg') {
          var hgRepository = repository;
          try {
            yield hgRepository.remove(file.getPath());
          } catch (e) {
            var statuses = yield hgRepository.getStatuses([file.getPath()]);
            var pathStatus = statuses.get(file.getPath());
            if (pathStatus !== _hgRepositoryBaseLibHgConstants.StatusCodeNumber.UNTRACKED) {
              atom.notifications.addError('Failed to remove ' + file.getPath() + ' from version control.  The file will ' + 'still get deleted but you will have to remove it from your VCS yourself.  Error: ' + e.toString());
            }
          }
        }
        if (_FileTreeHelpers2['default'].isLocalFile(file)) {
          // TODO: This special-case can be eliminated once `delete()` is added to `Directory`
          // and `File`.
          _shell2['default'].moveItemToTrash(node.nodePath);
        } else {
          var remoteFile = file;
          yield remoteFile['delete']();
        }
      })));
    })
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkZpbGVUcmVlU3RvcmUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztrQ0FpQitCLHNCQUFzQjs7OzsrQkFDekIsbUJBQW1COzs7OzRCQUN0QixnQkFBZ0I7Ozs7eUJBQ25CLFdBQVc7Ozs7aUNBQ1IscUJBQXFCOztvQkFDWixNQUFNOzt5QkFDaEIsV0FBVzs7MkJBQ0UscUJBQXFCOzs4Q0FFM0IsMkNBQTJDOzt1QkFFdEQsZUFBZTs7dUJBQ1gsZUFBZTs7cUJBRXJCLE9BQU87Ozs7NkJBQ0wsZ0JBQWdCOzs7OztBQUdwQyxJQUFNLE9BQU8sR0FBRyxDQUFDLENBQUM7O0FBd0NsQixJQUFJLFFBQWlCLFlBQUEsQ0FBQzs7Ozs7Ozs7SUFPaEIsYUFBYTtlQUFiLGFBQWE7O1dBUUMsdUJBQWtCO0FBQ2xDLFVBQUksQ0FBQyxRQUFRLEVBQUU7QUFDYixnQkFBUSxHQUFHLElBQUksYUFBYSxFQUFFLENBQUM7T0FDaEM7QUFDRCxhQUFPLFFBQVEsQ0FBQztLQUNqQjs7O0FBRVUsV0FmUCxhQUFhLEdBZUg7OzswQkFmVixhQUFhOztBQWdCZixRQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztBQUNqQyxRQUFJLENBQUMsV0FBVyxHQUFHLGdDQUFtQixXQUFXLEVBQUUsQ0FBQztBQUNwRCxRQUFJLENBQUMsUUFBUSxHQUFHLG1CQUFhLENBQUM7QUFDOUIsUUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQ3ZCLFVBQUEsT0FBTzthQUFJLE1BQUssV0FBVyxDQUFDLE9BQU8sQ0FBQztLQUFBLENBQ3JDLENBQUM7QUFDRixRQUFJLENBQUMsT0FBTyxHQUFHLHlCQUFXLENBQUM7QUFDM0IsUUFBSSxDQUFDLGtCQUFrQixHQUFHLGdDQUFRLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0dBQzVEOzs7Ozs7Ozs7OztlQXhCRyxhQUFhOztXQWdDUCxzQkFBb0I7QUFDNUIsVUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQzs7QUFFeEIsVUFBTSxXQUFXLEdBQUcsRUFBRSxDQUFDO0FBQ3ZCLFlBQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsT0FBTyxDQUFDLFVBQUEsT0FBTyxFQUFJO0FBQ3RELFlBQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUN4RCxhQUFLLElBQU0sUUFBTyxJQUFJLGNBQWMsRUFBRTtBQUNwQyxxQkFBVyxDQUFDLFFBQU8sQ0FBQyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBTyxDQUFDLENBQUM7U0FDbEQ7T0FDRixDQUFDLENBQUM7QUFDSCxhQUFPO0FBQ0wsZUFBTyxFQUFFLE9BQU87QUFDaEIsbUJBQVcsRUFBRSxXQUFXO0FBQ3hCLDBCQUFrQixFQUFFLFNBQVMsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsVUFBQSxNQUFNO2lCQUFJLE1BQU0sQ0FBQyxPQUFPLEVBQUU7U0FBQSxDQUFDO0FBQ2xGLGdCQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVE7QUFDdkIsMEJBQWtCLEVBQUUsU0FBUyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxVQUFBLE1BQU07aUJBQUksTUFBTSxDQUFDLE9BQU8sRUFBRTtTQUFBLENBQUM7T0FDbkYsQ0FBQztLQUNIOzs7Ozs7O1dBS08sa0JBQUMsSUFBcUIsRUFBUTs7OztBQUVwQyxVQUFJLElBQUksQ0FBQyxPQUFPLEtBQUssT0FBTyxFQUFFO0FBQzVCLGVBQU87T0FDUjtBQUNELFVBQUksQ0FBQyxLQUFLLGdCQUNMLElBQUksQ0FBQyxZQUFZLEVBQUU7QUFDdEIsbUJBQVcsRUFBRSxJQUFJLENBQUMsV0FBVztBQUM3QiwwQkFBa0IsRUFBRSxTQUFTLENBQUMsSUFBSSxDQUFDLGtCQUFrQixFQUFFLFVBQUEsSUFBSTtpQkFBSSxJQUFJLHVCQUFVLEdBQUcsQ0FBQyxJQUFJLENBQUM7U0FBQSxDQUFDO0FBQ3ZGLGdCQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVE7QUFDdkIsMEJBQWtCLEVBQ2hCLFNBQVMsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsVUFBQSxJQUFJO2lCQUFJLElBQUksdUJBQVUsVUFBVSxDQUFDLElBQUksQ0FBQztTQUFBLENBQUM7UUFDN0UsQ0FBQztBQUNGLFlBQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFBLE9BQU8sRUFBSTtBQUMvQyxlQUFLLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQy9CLGVBQUssZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDO09BQy9CLENBQUMsQ0FBQztLQUNKOzs7V0FFeUIsb0NBQUMsc0JBQStCLEVBQVE7QUFDaEUsVUFBSSxDQUFDLElBQUksQ0FBQyx3QkFBd0IsRUFBRSxzQkFBc0IsQ0FBQyxDQUFDO0tBQzdEOzs7V0FFbUIsOEJBQUMsZ0JBQXlCLEVBQVE7QUFDcEQsVUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO0tBQ2pEOzs7Ozs7OztXQU1lLDBCQUFDLFlBQTJCLEVBQUU7QUFDNUMsVUFBTSxlQUFlLEdBQUcsdUJBQVUsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUNoRCxHQUFHLENBQUMsVUFBQSxXQUFXLEVBQUk7QUFDbEIsWUFBSSxXQUFXLEtBQUssRUFBRSxFQUFFO0FBQ3RCLGlCQUFPLElBQUksQ0FBQztTQUNiO0FBQ0QsWUFBSTtBQUNGLGlCQUFPLHlCQUFjLFdBQVcsRUFBRSxFQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7U0FDakUsQ0FBQyxPQUFPLEtBQUssRUFBRTtBQUNkLGNBQUksQ0FBQyxhQUFhLENBQUMsVUFBVSw4QkFDRCxXQUFXLDJDQUNyQyxFQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsT0FBTyxFQUFDLENBQ3hCLENBQUM7QUFDRixpQkFBTyxJQUFJLENBQUM7U0FDYjtPQUNGLENBQUMsQ0FDRCxNQUFNLENBQUMsVUFBQSxPQUFPO2VBQUksT0FBTyxJQUFJLElBQUk7T0FBQSxDQUFDLENBQUM7QUFDdEMsVUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxlQUFlLENBQUMsQ0FBQztLQUMvQzs7O1dBRVcsd0JBQWM7QUFDeEIsYUFBTztBQUNMLG1CQUFXLEVBQUUsRUFBRTtBQUNmLGtCQUFVLEVBQUUsRUFBRTtBQUNkLDBCQUFrQixFQUFFLEVBQUU7QUFDdEIsbUJBQVcsRUFBRSxJQUFJO0FBQ2pCLDBCQUFrQixFQUFFLEVBQUU7QUFDdEIsb0JBQVksRUFBRSxFQUFFO0FBQ2hCLGdCQUFRLEVBQUUsRUFBRTtBQUNaLDBCQUFrQixFQUFFLEVBQUU7QUFDdEIsdUJBQWUsRUFBRSxFQUFFO0FBQ25CLHlCQUFpQixFQUFFLEVBQUU7QUFDckIsdUJBQWUsRUFBRSx1QkFBVSxHQUFHLEVBQUU7QUFDaEMsd0JBQWdCLEVBQUUsSUFBSTtBQUN0Qiw4QkFBc0IsRUFBRSxJQUFJO0FBQzVCLHNCQUFjLEVBQUUsS0FBSztBQUNyQixvQkFBWSxFQUFFLHVCQUFVLEdBQUcsRUFBRTtPQUM5QixDQUFDO0tBQ0g7OztXQUVVLHFCQUFDLE9BQXNCLEVBQVE7QUFDeEMsY0FBUSxPQUFPLENBQUMsVUFBVTtBQUN4QixhQUFLLDhCQUFXLHFCQUFxQjtBQUNuQyxjQUFJLENBQUMsb0JBQW9CLEVBQUUsU0FBTSxDQUFDLFVBQUEsS0FBSyxFQUFJO0FBQ3pDLGdCQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyx1Q0FBdUMsR0FBRyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztXQUN6RixDQUFDLENBQUM7QUFDSCxnQkFBTTtBQUFBLEFBQ1IsYUFBSyw4QkFBVyxnQkFBZ0I7QUFDOUIsY0FBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUN2RCxnQkFBTTtBQUFBLEFBQ1IsYUFBSyw4QkFBVyxhQUFhO0FBQzNCLGNBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3BDLGdCQUFNO0FBQUEsQUFDUixhQUFLLDhCQUFXLFdBQVc7QUFDekIsY0FBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUNuRCxnQkFBTTtBQUFBLEFBQ1IsYUFBSyw4QkFBVyxnQkFBZ0I7QUFDOUIsY0FBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUN2RCxnQkFBTTtBQUFBLEFBQ1IsYUFBSyw4QkFBVyxhQUFhO0FBQzNCLGNBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDckQsZ0JBQU07QUFBQSxBQUNSLGFBQUssOEJBQVcsNkJBQTZCO0FBQzNDLGNBQUksQ0FBQywwQkFBMEIsQ0FBQyxPQUFPLENBQUMsc0JBQXNCLENBQUMsQ0FBQztBQUNoRSxnQkFBTTtBQUFBLEFBQ1IsYUFBSyw4QkFBVyxvQkFBb0I7QUFDbEMsY0FBSSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUNoRCxnQkFBTTtBQUFBLEFBQ1IsYUFBSyw4QkFBVyxrQkFBa0I7QUFDaEMsY0FBSSxDQUFDLDBCQUEwQixDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLE9BQU8sZ0JBQWdCLEtBQUssQ0FBQyxDQUFDO0FBQ3ZGLGdCQUFNO0FBQUEsQUFDUixhQUFLLDhCQUFXLHNCQUFzQjtBQUNwQyxjQUFJLENBQUMsb0JBQW9CLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUM7QUFDcEQsZ0JBQU07QUFBQSxBQUNSLGFBQUssOEJBQVcsaUJBQWlCO0FBQy9CLGNBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDNUMsZ0JBQU07QUFBQSxBQUNSLGFBQUssOEJBQVcsMkJBQTJCO0FBQ3pDLGNBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUN6RCxnQkFBTTtBQUFBLEFBQ1IsYUFBSyw4QkFBVywyQkFBMkI7QUFDekMsY0FBSSxDQUFDLHNCQUFzQixDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0FBQ3hELGdCQUFNO0FBQUEsQUFDUixhQUFLLDhCQUFXLFlBQVk7QUFDMUIsY0FBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNyRCxnQkFBTTtBQUFBLEFBQ1IsYUFBSyw4QkFBVyxnQkFBZ0I7QUFDOUIsY0FBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUMzRCxnQkFBTTtBQUFBLEFBQ1IsYUFBSyw4QkFBVyxnQkFBZ0I7QUFDOUIsY0FBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUM1QyxnQkFBTTtBQUFBLE9BQ1Q7S0FDRjs7Ozs7Ozs7Ozs7V0FTRyxjQUFDLEdBQVcsRUFBRSxLQUFZLEVBQWdDOzs7VUFBOUIsS0FBYyx5REFBRyxLQUFLOztBQUNwRCxVQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDOztBQUUzQixVQUFNLE9BQU8sR0FBRyxXQUFXLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDcEQsVUFBSSxPQUFPLEtBQUssT0FBTyxFQUFFO0FBQ3ZCLFlBQUksQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDO0FBQ3JCLHNCQUFjLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzVCLFlBQUksS0FBSyxFQUFFOztBQUVULGNBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQzlCLE1BQU07O0FBRUwsY0FBSSxDQUFDLE1BQU0sR0FBRyxZQUFZLENBQUMsWUFBTTtBQUMvQixtQkFBSyxRQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1dBQzlCLENBQUMsQ0FBQztTQUNKO09BQ0Y7S0FDRjs7O1dBRWEsMEJBQXNCO0FBQ2xDLGFBQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUM7S0FDL0I7OztXQUVjLDJCQUFtQztBQUNoRCxhQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDO0tBQ2hDOzs7V0FFVSx1QkFBa0I7QUFDM0IsYUFBTyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQztLQUM1Qjs7Ozs7OztXQUtZLHVCQUFDLE9BQWUsRUFBVztBQUN0QyxhQUFPLGVBQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLFVBQUEsT0FBTztlQUFJLE9BQU8sQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDO09BQUEsQ0FBQyxDQUFDO0tBQ2hGOzs7Ozs7O1dBS00sbUJBQVk7QUFDakIsYUFBTyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQztLQUN4Qzs7Ozs7OztXQUtRLG1CQUFDLE9BQWUsRUFBRSxPQUFlLEVBQVc7QUFDbkQsYUFBTyxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztLQUNwQzs7O1dBRVMsb0JBQUMsT0FBZSxFQUFFLE9BQWUsRUFBVztBQUNwRCxhQUFPLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7S0FDcEQ7OztXQUVRLG1CQUFDLE9BQWUsRUFBVztBQUNsQyxhQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztLQUNwRDs7O1dBRVMsb0JBQUMsT0FBZSxFQUFFLE9BQWUsRUFBVztBQUNwRCxhQUFPLElBQUksQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0tBQ25EOzs7V0FFYyx5QkFBQyxPQUFlLEVBQUUsV0FBcUMsRUFBRTtBQUN0RSxVQUFNLG9CQUFvQixHQUFHLElBQUksdUJBQVUsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQzVELFVBQUksQ0FBQyx1QkFBVSxFQUFFLENBQUMsb0JBQW9CLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFO0FBQzlFLFlBQUksQ0FBQyxJQUFJLENBQ1AsbUJBQW1CLEVBQ25CLFdBQVcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLGlCQUFpQixFQUFFLE9BQU8sRUFBRSxvQkFBb0IsQ0FBQyxDQUN6RSxDQUFDO09BQ0g7S0FDRjs7O1dBRWUsMEJBQUMsT0FBZSxFQUFFLE9BQWUsRUFBVztBQUMxRCxVQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ2xELFVBQUksR0FBRyxFQUFFO0FBQ1AsZUFBTyxHQUFHLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO09BQ3pCLE1BQU07QUFDTCxlQUFPLElBQUksQ0FBQztPQUNiO0tBQ0Y7OztXQUVpQiw0QkFBQyxjQUF1QixFQUFFO0FBQzFDLFVBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsY0FBYyxDQUFDLENBQUM7S0FDN0M7OztXQUVhLDBCQUFZO0FBQ3hCLGFBQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUM7S0FDbEM7Ozs7Ozs7O1dBTWlCLDRCQUFDLE9BQWUsRUFBRSxPQUFlLEVBQWlCO0FBQ2xFLGFBQU8sSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO0tBQ3JFOzs7Ozs7Ozs7O1dBUW1CLDhCQUFDLE9BQWUsRUFBRSxPQUFlLEVBQVc7OztBQUM5RCxVQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztBQUM1RCxVQUFJLGVBQWUsQ0FBQyxNQUFNLEVBQUU7QUFDMUIsZUFBTyxPQUFPLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDO09BQ3pDOztBQUVELFVBQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLElBQUksT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQy9ELGFBQU8sT0FBTyxDQUFDLElBQUksQ0FBQztlQUFNLE9BQUssa0JBQWtCLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQztPQUFBLENBQUMsQ0FBQztLQUN0RTs7Ozs7OztXQUtXLHNCQUFDLE9BQWUsRUFBRSxPQUFlLEVBQWlCO0FBQzVELFVBQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ2xELFVBQUksU0FBUyxJQUFJLElBQUksSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsRUFBRTtBQUN2RCxZQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDO09BQy9CLE1BQU07Ozs7OztBQU1MLFlBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO09BQzFCO0FBQ0QsYUFBTyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxJQUFJLEVBQUUsQ0FBQyxDQUFDO0tBQy9DOzs7V0FFYyx5QkFBQyxPQUFnQixFQUFnQztBQUM5RCxVQUFJLFlBQVksWUFBQSxDQUFDO0FBQ2pCLFVBQUksT0FBTyxJQUFJLElBQUksRUFBRTtBQUNuQixvQkFBWSxHQUFHLElBQUksdUJBQVUsVUFBVSxFQUFFLENBQUM7QUFDMUMsYUFBSyxJQUFNLElBQUksSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLGtCQUFrQixFQUFFO0FBQ2hELGNBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLEVBQUU7QUFDdEQsd0JBQVksR0FBRyxZQUFZLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztXQUN4RTtTQUNGO09BQ0YsTUFBTTs7O0FBR0wsb0JBQVksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxJQUFJLElBQUksdUJBQVUsVUFBVSxFQUFFLENBQUM7T0FDckY7QUFDRCxhQUFPLFlBQVksQ0FBQztLQUNyQjs7Ozs7Ozs7OztXQVFjLHlCQUFDLE9BQWUsRUFBdUI7OztBQUdwRCxVQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsRUFBRTtBQUM1QixlQUFPLEVBQUUsQ0FBQztPQUNYO0FBQ0QsVUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxFQUFFO0FBQ3RDLGVBQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO09BQ3pDOzs7O0FBSUQsVUFBTSxZQUFZLEdBQUcsRUFBRSxDQUFDO0FBQ3hCLFVBQU0sK0JBQStCLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUNsRCxhQUFPLCtCQUErQixDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7QUFDbkQsWUFBTSxJQUFHLEdBQUcsK0JBQStCLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDbEQsb0JBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFHLEVBQUUsSUFBRyxDQUFDLENBQUMsQ0FBQztBQUMxQyxZQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxJQUFHLENBQUMsQ0FBQztBQUM5QyxZQUFJLFNBQVMsSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsSUFBRyxDQUFDLEVBQUU7OztBQUduRCxtQkFBUztTQUNWOztBQUVELGFBQUssSUFBTSxRQUFRLElBQUksU0FBUyxFQUFFO0FBQ2hDLGNBQUksNkJBQWdCLFFBQVEsQ0FBQyxRQUFRLENBQUMsRUFBRTtBQUN0QyxnQkFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxJQUFHLENBQUMsRUFBRTtBQUNqQyw2Q0FBK0IsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7YUFDaEQ7V0FDRixNQUFNO0FBQ0wsd0JBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFHLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQztXQUNoRDtTQUNGO09BQ0Y7QUFDRCxhQUFPLFlBQVksQ0FBQztLQUNyQjs7Ozs7OztXQUtlLDRCQUF1Qzs7O0FBQ3JELFVBQUksYUFBYSxHQUFHLElBQUksdUJBQVUsVUFBVSxFQUFFLENBQUM7QUFDL0MsVUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLFVBQUEsT0FBTyxFQUFJO0FBQ3JDLGVBQUssZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFBLE9BQU8sRUFBSTtBQUMvQyx1QkFBYSxHQUFHLGFBQWEsQ0FBQyxHQUFHLENBQUMsT0FBSyxPQUFPLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7U0FDbkUsQ0FBQyxDQUFDO09BQ0osQ0FBQyxDQUFDO0FBQ0gsYUFBTyxhQUFhLENBQUM7S0FDdEI7OztXQUVvQixpQ0FBa0I7QUFDckMsVUFBTSxhQUFhLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLGtCQUFrQixDQUFDLENBQUM7QUFDakUsVUFBSSxhQUFhLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTs7QUFFOUIsZUFBTyxJQUFJLENBQUM7T0FDYjtBQUNELFVBQU0sT0FBTyxHQUFHLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNqQyxVQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDOzs7OztBQUtuRCxhQUFPLEFBQUMsWUFBWSxDQUFDLElBQUksS0FBSyxDQUFDLEdBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsWUFBWSxDQUFDLEtBQUssRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDO0tBQ3ZGOzs7V0FFVSxxQkFBQyxPQUFlLEVBQWdCO0FBQ3pDLGFBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7S0FDdkM7OztXQUVNLGlCQUFDLE9BQWUsRUFBRSxPQUFlLEVBQWdCO0FBQ3RELGFBQU8sOEJBQWlCLElBQUksRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7S0FDakQ7Ozs7Ozs7V0FLYyx5QkFBQyxPQUFlLEVBQWlCOzs7QUFDOUMsVUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUNsRCxVQUFJLGVBQWUsRUFBRTtBQUNuQixlQUFPLGVBQWUsQ0FBQztPQUN4Qjs7QUFFRCxVQUFNLE9BQU8sR0FBRyw2QkFBZ0IsYUFBYSxDQUFDLE9BQU8sQ0FBQyxTQUFNLENBQUMsVUFBQSxLQUFLLEVBQUk7QUFDcEUsZUFBSyxPQUFPLENBQUMsS0FBSyxvQ0FBa0MsT0FBTyxRQUFLLENBQUM7QUFDakUsZUFBSyxPQUFPLENBQUMsS0FBSyxDQUFDLGtCQUFrQixFQUFFLEtBQUssQ0FBQyxDQUFDOztBQUU5QyxZQUFNLE9BQU8sR0FBRyxPQUFLLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUM1QyxZQUFJLE9BQU8sSUFBSSxJQUFJLEVBQUU7QUFDbkIsaUJBQUssYUFBYSxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztTQUN0QztBQUNELGVBQUssYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO09BQzdCLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBQSxTQUFTLEVBQUk7OztBQUduQixZQUFJLE9BQUssYUFBYSxDQUFDLE9BQU8sQ0FBQyxJQUFJLElBQUksRUFBRTtBQUN2QyxpQkFBTztTQUNSO0FBQ0QsZUFBSyxhQUFhLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDO0FBQ3ZDLGVBQUssZ0JBQWdCLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDL0IsZUFBSyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7T0FDN0IsQ0FBQyxDQUFDOztBQUVILFVBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQ25DLGFBQU8sT0FBTyxDQUFDO0tBQ2hCOzs7V0FFVSxxQkFBQyxPQUFlLEVBQVk7QUFDckMsYUFBTyxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQztLQUN6Qzs7O1dBRVUscUJBQUMsT0FBZSxFQUFFLEtBQWMsRUFBUTtBQUNqRCxVQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxXQUFXLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLEVBQUUsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7S0FDakY7Ozs7Ozs7O1dBTWdCLDZCQUFTO0FBQ3hCLFVBQ0UsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLElBQUksSUFBSTs7Ozs7OztBQU85QixzQkFBVyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsRUFDM0M7O0FBRUEsWUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLENBQUM7T0FDaEM7S0FDRjs7O1dBRVksdUJBQUMsT0FBZSxFQUFRO0FBQ25DLFVBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLGNBQWMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO0FBQzVFLFVBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO0tBQzFCOzs7NkJBRXlCLGFBQWtCO0FBQzFDLFVBQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0FBQzlDLFlBQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsR0FBRyxtQkFBQyxXQUFNLElBQUksRUFBSTtBQUNoRCxZQUFNLElBQUksR0FBRyw2QkFBZ0IsWUFBWSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUN4RCxZQUFJLElBQUksSUFBSSxJQUFJLEVBQUU7QUFDaEIsaUJBQU87U0FDUjtBQUNELFlBQU0sVUFBVSxHQUFHLG9DQUFrQixJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztBQUNyRCxZQUFJLFVBQVUsSUFBSSxJQUFJLElBQUksVUFBVSxDQUFDLE9BQU8sRUFBRSxLQUFLLElBQUksRUFBRTtBQUN2RCxjQUFNLFlBQVksR0FBSyxVQUFVLEFBQTJCLENBQUM7QUFDN0QsY0FBSTtBQUNGLGtCQUFNLFlBQVksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7V0FDM0MsQ0FBQyxPQUFPLENBQUMsRUFBRTtBQUNWLGdCQUFNLFFBQVEsR0FBRyxNQUFNLFlBQVksQ0FBQyxXQUFXLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ2xFLGdCQUFNLFVBQVUsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO0FBQ2hELGdCQUFJLFVBQVUsS0FBSyxpREFBaUIsU0FBUyxFQUFFO0FBQzdDLGtCQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FDekIsbUJBQW1CLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxHQUFHLHdDQUF3QyxHQUMvRSxtRkFBbUYsR0FDbkYsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUNiLENBQUM7YUFDSDtXQUNGO1NBQ0Y7QUFDRCxZQUFJLDZCQUFnQixXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUU7OztBQUdyQyw2QkFBTSxlQUFlLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQ3RDLE1BQU07QUFDTCxjQUFNLFVBQVUsR0FBSyxJQUFJLEFBQXVDLENBQUM7QUFDakUsZ0JBQU0sVUFBVSxVQUFPLEVBQUUsQ0FBQztTQUMzQjtPQUNGLEVBQUMsQ0FBQyxDQUFDO0tBQ0w7OztXQUVVLHFCQUFDLE9BQWUsRUFBRSxPQUFlLEVBQVE7QUFDbEQsVUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7O0FBRTVFLFVBQUksa0JBQWtCLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQzlELFVBQUksa0JBQWtCLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxFQUFFO0FBQ25DLGFBQUssSUFBTSxRQUFRLElBQUksa0JBQWtCLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxFQUFFO0FBQ3RELGNBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1NBQ3JDOztBQUVELDBCQUFrQixHQUFHLGtCQUFrQixVQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDeEQsWUFBSSxDQUFDLHNCQUFzQixDQUFDLE9BQU8sRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO09BQzFEO0tBQ0Y7Ozs7Ozs7O1dBTWMseUJBQUMsT0FBZSxFQUFFLE9BQWUsRUFBaUI7Ozs7QUFFL0QsVUFBTSxPQUFPLEdBQUcsSUFBSSx3QkFBd0IsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLE9BQU8sWUFBYSxHQUFHLENBQUMsQ0FBQztBQUNyRixVQUFNLE9BQU8sR0FBRyxJQUFJLE9BQU8sQ0FBQyxVQUFBLE9BQU8sRUFBSTtBQUNyQyxZQUFNLE1BQU0sR0FBRyxTQUFULE1BQU0sR0FBUztBQUNuQixjQUFNLGdCQUFnQixHQUFHLE9BQU8sQ0FBQyxhQUFhLEVBQUUsQ0FBQztBQUNqRCxjQUFJLGdCQUFnQixFQUFFO0FBQ3BCLG1CQUFLLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxPQUFLLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM7Ozs7O0FBS3JGLGdCQUFJLG1CQUFrQixHQUFHLE9BQUssc0JBQXNCLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDOUQsK0JBQWtCLEdBQUcsbUJBQWtCLFVBQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0FBQ2pFLG1CQUFLLHNCQUFzQixDQUFDLE9BQU8sRUFBRSxtQkFBa0IsQ0FBQyxDQUFDOztBQUV6RCxnQkFBTSxXQUFXLEdBQUcsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ25DLGdCQUFJLFdBQVcsRUFBRTtBQUNmLHlCQUFXLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2FBQzFCO1dBQ0YsTUFBTTtBQUNMLG1CQUFPLEVBQUUsQ0FBQztXQUNYO1NBQ0YsQ0FBQzs7QUFFRixjQUFNLEVBQUUsQ0FBQztPQUNWLENBQUMsQ0FBQzs7QUFFSCxhQUFPLE9BQU8sQ0FBQztLQUNoQjs7Ozs7OztXQUtZLHVCQUFDLE9BQWUsRUFBRSxPQUFlLEVBQVE7OztBQUNwRCxVQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUNsRCxVQUFJLFlBQVksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQzFELFVBQU0saUJBQWlCLEdBQUcsRUFBRSxDQUFDO0FBQzdCLFVBQUksU0FBUyxFQUFFO0FBQ2IsaUJBQVMsQ0FBQyxPQUFPLENBQUMsVUFBQSxRQUFRLEVBQUk7O0FBRTVCLGNBQUksWUFBWSxJQUFJLFlBQVksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUU7QUFDOUMsd0JBQVksR0FBRyxZQUFZLFVBQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQzs7Ozs7O0FBTTdDLG1CQUFLLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxZQUFZLENBQUMsQ0FBQztXQUM5Qzs7QUFFRCxjQUFJLDZCQUFnQixRQUFRLENBQUMsUUFBUSxDQUFDLEVBQUU7QUFDdEMsZ0JBQUksT0FBSyxVQUFVLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxFQUFFO0FBQ3RDLCtCQUFpQixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNqQyxxQkFBSyxhQUFhLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDO2FBQ3ZDO1dBQ0Y7U0FDRixDQUFDLENBQUM7T0FDSjs7Ozs7QUFLRCxVQUFJLGtCQUFrQixHQUFHLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUM5RCxVQUFJLGlCQUFpQixDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7QUFDbEMsMEJBQWtCLEdBQUcsa0JBQWtCLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO09BQ3pFLE1BQU07QUFDTCwwQkFBa0IsR0FBRyxrQkFBa0IsVUFBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO09BQ3pEO0FBQ0QsVUFBSSxDQUFDLHNCQUFzQixDQUFDLE9BQU8sRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO0FBQ3pELFVBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxVQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztBQUMvRSxVQUFJLENBQUMsbUJBQW1CLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0tBQzVDOzs7V0FFcUIsZ0NBQUMsT0FBZSxFQUF3QztBQUM1RSxhQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsT0FBTyxDQUFDLElBQUksSUFBSSx1QkFBVSxHQUFHLEVBQUUsQ0FBQztLQUN0RTs7O1dBRXFCLGdDQUFDLE9BQWUsRUFDcEMsa0JBQXdELEVBQVE7QUFDaEUsVUFBSSxDQUFDLElBQUksQ0FDUCxvQkFBb0IsRUFDcEIsV0FBVyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsa0JBQWtCLEVBQUUsT0FBTyxFQUFFLGtCQUFrQixDQUFDLENBQ3hFLENBQUM7S0FDSDs7O1dBRWUsMEJBQUMsT0FBZSxFQUF5QjtBQUN2RCxhQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsT0FBTyxDQUFDLElBQUksSUFBSSx1QkFBVSxHQUFHLEVBQUUsQ0FBQztLQUN0RTs7Ozs7Ozs7O1dBT2lCLDRCQUFDLElBQWdCLEVBQW9CO0FBQ3JELGFBQU8sSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFBLElBQUk7ZUFBSSx5Q0FBdUIsSUFBSSxFQUFFLElBQUksQ0FBQztPQUFBLENBQUMsQ0FBQztLQUNoRjs7O1dBRWUsMEJBQUMsT0FBZSxFQUFFLFlBQW1DLEVBQVE7QUFDM0UsVUFBSSxDQUFDLElBQUksQ0FDUCxvQkFBb0IsRUFDcEIsV0FBVyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsa0JBQWtCLEVBQUUsT0FBTyxFQUFFLFlBQVksQ0FBQyxDQUNsRSxDQUFDO0tBQ0g7OztXQUVrQiw2QkFBQyxPQUFlLEVBQVE7QUFDekMsVUFBSSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxjQUFjLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO0tBQ3pGOzs7V0FFZSwwQkFBQyxPQUFlLEVBQUUsWUFBMEMsRUFBUTs7Ozs7O0FBTWxGLFVBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQy9CLFVBQUksQ0FBQyxJQUFJLENBQ1Asb0JBQW9CLEVBQ3BCLFdBQVcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLGtCQUFrQixFQUFFLE9BQU8sRUFBRSxZQUFZLENBQUMsQ0FDbEUsQ0FBQztLQUNIOzs7Ozs7OztXQU1xQixnQ0FBQyxrQkFBaUUsRUFBUTs7O0FBQzlGLFVBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxPQUFPLENBQUMsVUFBQSxPQUFPLEVBQUk7QUFDcEMsWUFBSSxrQkFBa0IsQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLEVBQUU7QUFDOUMsaUJBQUssZ0JBQWdCLENBQUMsT0FBTyxFQUFFLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7U0FDN0QsTUFBTTtBQUNMLGlCQUFLLG1CQUFtQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQ25DO09BQ0YsQ0FBQyxDQUFDO0tBQ0o7OztXQUVXLHNCQUFDLFFBQXVCLEVBQVE7QUFDMUMsVUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUM7QUFDeEMsVUFBTSxXQUFXLEdBQUcsSUFBSSx1QkFBVSxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDaEQsVUFBTSxlQUFlLEdBQUcsSUFBSSx1QkFBVSxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQzdFLHFCQUFlLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDcEQsVUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsUUFBUSxDQUFDLENBQUM7S0FDakM7Ozs7Ozs7V0FLVyxzQkFBQyxPQUFlLEVBQUUsUUFBZ0IsRUFBUTtBQUNwRCxVQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7Ozs7QUFJeEMsVUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsV0FBVyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0tBQzVFOzs7V0FFWSx1QkFBQyxPQUFlLEVBQUUsU0FBd0IsRUFBUTtBQUM3RCxVQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUNyRCxVQUFJLFlBQVksRUFBRTtBQUNoQixZQUFNLFlBQVksR0FBRyxJQUFJLHVCQUFVLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUNsRCxZQUFNLG9CQUFvQixHQUFHLElBQUksdUJBQVUsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUN6RCxRQUFRLENBQUMsWUFBWSxDQUFDLENBQ3RCLE1BQU0sQ0FBQyw2QkFBZ0IsUUFBUSxDQUFDLENBQUM7QUFDcEMsNEJBQW9CLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7T0FDL0Q7QUFDRCxVQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxXQUFXLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7S0FDbkY7OztXQUVpQiw0QkFBQyxPQUFlLEVBQVE7QUFDeEMsVUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQztLQUMvQjs7O1dBRWUsMEJBQUMsT0FBZSxFQUFROzs7QUFDdEMsVUFBTSxTQUFTLEdBQUcsNkJBQWdCLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQzdELFVBQUksQ0FBQyxTQUFTLEVBQUU7QUFDZCxlQUFPO09BQ1I7Ozs7OztBQU1ELFVBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLGNBQWMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDOzs7QUFHeEUsVUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsRUFBRTtBQUN2QyxlQUFPO09BQ1I7O0FBRUQsVUFBSSxZQUFZLFlBQUEsQ0FBQztBQUNqQixVQUFJOztBQUVGLG9CQUFZLEdBQUcsU0FBUyxDQUFDLFdBQVcsQ0FBQyxZQUFNO0FBQ3pDLGtCQUFLLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQ2xDLENBQUMsQ0FBQztPQUNKLENBQUMsT0FBTyxFQUFFLEVBQUU7Ozs7O0FBS1gsWUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLHFDQUFtQyxPQUFPLFFBQUssRUFBRSxDQUFDLENBQUM7QUFDckUsWUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsV0FBVyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7QUFDckUsZUFBTztPQUNSO0FBQ0QsVUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxXQUFXLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxlQUFlLEVBQUUsT0FBTyxFQUFFLFlBQVksQ0FBQyxDQUFDLENBQUM7S0FDOUY7OztXQUVrQiw2QkFBQyxPQUFlLEVBQUUsT0FBZSxFQUFROzs7QUFDMUQsVUFBSSx1QkFBdUIsWUFBQSxDQUFDO0FBQzVCLFVBQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDOztBQUV6RCxVQUFJLFlBQVksSUFBSSxJQUFJLEVBQUU7QUFDeEIsK0JBQXVCLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFVBQUEsWUFBWTtpQkFDN0QsWUFBWSxLQUFLLE9BQU8sSUFBSSxRQUFLLFVBQVUsQ0FBQyxZQUFZLEVBQUUsT0FBTyxDQUFDO1NBQ25FLENBQUMsQ0FBQztBQUNILFlBQUksQ0FBQyx1QkFBdUIsRUFBRTtBQUM1QixzQkFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ3ZCLGNBQUksQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsY0FBYyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsZUFBZSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7U0FDbkY7T0FDRjs7QUFFRCxVQUFJLFlBQVksSUFBSSxJQUFJLElBQUksdUJBQXVCLEtBQUssS0FBSyxFQUFFOzs7QUFHN0QsWUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsV0FBVyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO09BQzVFO0tBQ0Y7OztXQUVzQixpQ0FBQyxPQUFlLEVBQVE7QUFDN0MsVUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDekQsVUFBSSxZQUFZLEVBQUU7QUFDaEIsb0JBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUN2QixZQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLGNBQWMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLGVBQWUsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO09BQ25GO0tBQ0Y7OztXQUVTLG9CQUFDLE9BQWUsRUFBRSxPQUFlLEVBQUUsUUFBaUIsRUFBUTtBQUNwRSxVQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDcEQsVUFBSSxZQUFZLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxFQUFFO0FBQzdCLFlBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsWUFBWSxVQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztPQUM5RDs7QUFFRCxVQUFJLFFBQVEsRUFBRTtBQUNaLFlBQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDbkQsWUFBSSxZQUFZLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxFQUFFO0FBQzdCLGNBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsWUFBWSxVQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztTQUM5RDtPQUNGOztBQUVELFVBQU0sa0JBQWtCLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ2hFLFVBQUksa0JBQWtCLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxFQUFFO0FBQ25DLFlBQUksQ0FBQyxzQkFBc0IsQ0FBQyxPQUFPLEVBQUUsa0JBQWtCLFVBQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO09BQzFFO0tBQ0Y7OztXQUV5QixvQ0FBQyxPQUFlLEVBQUUsT0FBZSxFQUFFLFFBQWlCLEVBQVE7OztBQUNwRixVQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUNsRCxVQUFJLFNBQVMsRUFBRTtBQUNiLGlCQUFTLENBQUMsT0FBTyxDQUFDLFVBQUEsUUFBUSxFQUFJO0FBQzVCLGNBQUksNkJBQWdCLFFBQVEsQ0FBQyxRQUFRLENBQUMsRUFBRTtBQUN0QyxvQkFBSywwQkFBMEIsQ0FBQyxPQUFPLEVBQUUsUUFBUSxnQkFBaUIsSUFBSSxDQUFDLENBQUM7V0FDekU7U0FDRixDQUFDLENBQUM7T0FDSjtBQUNELFVBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDM0MsVUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0tBQzdDOzs7Ozs7O1dBS2MseUJBQUMsT0FBZSxFQUFROzs7QUFDckMsVUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDbEQsVUFBSSxTQUFTLEVBQUU7QUFDYixpQkFBUyxDQUFDLE9BQU8sQ0FBQyxVQUFBLFFBQVEsRUFBSTtBQUM1QixjQUFJLDZCQUFnQixRQUFRLENBQUMsUUFBUSxDQUFDLEVBQUU7QUFDdEMsb0JBQUssZUFBZSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1dBQ2hDO1NBQ0YsQ0FBQyxDQUFDO0FBQ0gsWUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsY0FBYyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7T0FDM0U7O0FBRUQsVUFBSSxDQUFDLHVCQUF1QixDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ3RDLFVBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxPQUFPLENBQUMsVUFBQSxPQUFPLEVBQUk7QUFDcEMsZ0JBQUssVUFBVSxDQUFDLE9BQU8sRUFBRSxPQUFPLGdCQUFpQixJQUFJLENBQUMsQ0FBQztPQUN4RCxDQUFDLENBQUM7S0FDSjs7Ozs7O1dBSVMsb0JBQUMsT0FBZSxFQUFROzs7QUFDaEMsVUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUM1RCxVQUFJLFlBQVksRUFBRTtBQUNoQixvQkFBWSxDQUFDLE9BQU8sQ0FBQyxVQUFBLE9BQU8sRUFBSTtBQUM5QixrQkFBSyxtQkFBbUIsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7U0FDNUMsQ0FBQyxDQUFDO0FBQ0gsWUFBSSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxjQUFjLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO09BQ3pGO0FBQ0QsVUFBSSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxjQUFjLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDOztBQUV4RixVQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUNsRCxVQUFJLFNBQVMsRUFBRTtBQUNiLGlCQUFTLENBQUMsT0FBTyxDQUFDLFVBQUEsUUFBUSxFQUFJO0FBQzVCLGNBQUksNkJBQWdCLFFBQVEsQ0FBQyxRQUFRLENBQUMsRUFBRTtBQUN0QyxvQkFBSyxJQUFJLENBQUMsYUFBYSxFQUFFLGNBQWMsQ0FBQyxRQUFLLEtBQUssQ0FBQyxXQUFXLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQztXQUM1RTtTQUNGLENBQUMsQ0FBQztBQUNILFlBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLGNBQWMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO09BQzNFO0FBQ0QsVUFBSSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxjQUFjLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO0tBQ3ZGOzs7V0FFYyx5QkFBQyxPQUFlLEVBQUUsT0FBZSxFQUFROztBQUV0RCxVQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxFQUFDLE9BQU8sRUFBUCxPQUFPLEVBQUUsT0FBTyxFQUFQLE9BQU8sRUFBQyxFQUFFLElBQUksQ0FBQyxDQUFDO0tBQ3BEOzs7V0FFZSwwQkFBQyxZQUE0QyxFQUFRO0FBQ25FLFVBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLFlBQVksQ0FBQyxDQUFDOzs7O0FBSXhDLFVBQUksQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztLQUMzQzs7O1dBRWUsMEJBQUMsUUFBdUIsRUFBaUI7OztBQUN2RCxVQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsc0JBQXNCLEVBQUU7QUFDdEUsZUFBTyxRQUFRLENBQUM7T0FDakI7O0FBRUQsYUFBTyxRQUFRLENBQUMsTUFBTSxDQUFDLFVBQUEsT0FBTztlQUFJLENBQUMsUUFBSyxlQUFlLENBQUMsT0FBTyxDQUFDO09BQUEsQ0FBQyxDQUFDO0tBQ25FOzs7V0FFYyx5QkFBQyxPQUFlLEVBQVc7a0JBQzRCLElBQUksQ0FBQyxLQUFLO1VBQXZFLGdCQUFnQixTQUFoQixnQkFBZ0I7VUFBRSxzQkFBc0IsU0FBdEIsc0JBQXNCO1VBQUUsZUFBZSxTQUFmLGVBQWU7O0FBQ2hFLFVBQUksZ0JBQWdCLElBQUksV0FBVyxDQUFDLE9BQU8sRUFBRSxlQUFlLENBQUMsRUFBRTtBQUM3RCxlQUFPLElBQUksQ0FBQztPQUNiO0FBQ0QsVUFBSSxzQkFBc0IsSUFBSSxZQUFZLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFO0FBQ3JGLGVBQU8sSUFBSSxDQUFDO09BQ2I7QUFDRCxhQUFPLEtBQUssQ0FBQztLQUNkOzs7V0FFSSxpQkFBUztBQUNaLFVBQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDO0FBQ25ELFdBQUssSUFBTSxTQUFPLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsRUFBRTtBQUNsRCxZQUFNLFlBQVksR0FBRyxlQUFlLENBQUMsU0FBTyxDQUFDLENBQUM7QUFDOUMsWUFBSSxZQUFZLEVBQUU7QUFDaEIsc0JBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQztTQUN4QjtPQUNGOzs7QUFHRCxVQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztLQUNsQzs7O1dBRVEsbUJBQUMsUUFBd0IsRUFBZTtBQUMvQyxhQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztLQUM3Qzs7O1NBOTNCRyxhQUFhOzs7QUFrNEJuQixTQUFTLGNBQWMsQ0FBQyxNQUFjLEVBQUUsR0FBVyxFQUFVO0FBQzNELE1BQUksQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxFQUFFO0FBQy9CLFdBQU8sTUFBTSxDQUFDO0dBQ2Y7QUFDRCxNQUFNLFNBQVMsZ0JBQU8sTUFBTSxDQUFDLENBQUM7QUFDOUIsU0FBTyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDdEIsU0FBTyxTQUFTLENBQUM7Q0FDbEI7OztBQUdELFNBQVMsV0FBVyxDQUFDLE1BQWMsRUFBRSxHQUFXLEVBQUUsUUFBZSxFQUFVO0FBQ3pFLE1BQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUM3QixNQUFJLFFBQVEsS0FBSyxRQUFRLEVBQUU7QUFDekIsV0FBTyxNQUFNLENBQUM7R0FDZjtBQUNELE1BQU0sU0FBUyxnQkFBTyxNQUFNLENBQUMsQ0FBQztBQUM5QixXQUFTLENBQUMsR0FBRyxDQUFDLEdBQUcsUUFBUSxDQUFDO0FBQzFCLFNBQU8sU0FBUyxDQUFDO0NBQ2xCOzs7O0FBSUQsU0FBUyxTQUFTLENBQUMsTUFBYyxFQUFFLEVBQVksRUFBVTtBQUN2RCxNQUFNLFNBQVMsR0FBRyxFQUFFLENBQUM7QUFDckIsUUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBQSxHQUFHLEVBQUk7QUFDakMsYUFBUyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7R0FDdkMsQ0FBQyxDQUFDO0FBQ0gsU0FBTyxTQUFTLENBQUM7Q0FDbEI7OztBQUdELFNBQVMsV0FBVyxDQUFDLEdBQVcsRUFBRSxRQUFrQyxFQUFFO0FBQ3BFLFNBQU8sUUFBUSxDQUFDLElBQUksQ0FBQyxVQUFBLE9BQU87V0FBSSxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQztHQUFBLENBQUMsQ0FBQztDQUNyRDs7QUFFRCxTQUFTLFlBQVksQ0FBQyxPQUFlLEVBQUUsSUFBc0IsRUFBRTtBQUM3RCxTQUFPLElBQUksSUFBSSxJQUFJLENBQUMsZUFBZSxFQUFFLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztDQUN0RTs7Ozs7Ozs7Ozs7SUFXSyx3QkFBd0I7QUFVakIsV0FWUCx3QkFBd0IsQ0FXeEIsYUFBNEIsRUFDNUIsT0FBZSxFQUNmLE9BQWUsRUFDZixLQUFhLEVBQUU7MEJBZGYsd0JBQXdCOztBQWUxQixRQUFJLENBQUMsY0FBYyxHQUFHLGFBQWEsQ0FBQztBQUNwQyxRQUFJLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQztBQUN4QixRQUFJLENBQUMsZ0JBQWdCLEdBQUcsRUFBRSxDQUFDO0FBQzNCLFFBQUksQ0FBQyx1QkFBdUIsR0FBRyxPQUFPLENBQUM7QUFDdkMsUUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7QUFDcEIsUUFBSSxDQUFDLGtCQUFrQixHQUFHLENBQUMsQ0FBQztBQUM1QixRQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztBQUNyQixRQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztHQUNqQjs7ZUF2Qkcsd0JBQXdCOztXQXlCSixrQ0FBQyxZQUEyQixFQUFRO0FBQzFELFVBQUksQ0FBQyxrQkFBa0IsSUFBSSxZQUFZLENBQUMsTUFBTSxDQUFDO0FBQy9DLFVBQUksSUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUU7QUFDekMsWUFBTSxjQUFjLEdBQUcsWUFBWSxDQUFDLE1BQU0sQ0FBQyxVQUFBLFFBQVE7aUJBQUksNkJBQWdCLFFBQVEsQ0FBQyxRQUFRLENBQUM7U0FBQSxDQUFDLENBQUM7QUFDM0YsWUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLENBQUM7O0FBRXJFLFlBQUksQ0FBQyx1QkFBdUIsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNyRSxZQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztPQUN0QixNQUFNO0FBQ0wsWUFBSSxDQUFDLHVCQUF1QixHQUFHLElBQUksQ0FBQztBQUNwQyxZQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztPQUN0Qjs7QUFFRCxhQUFPO0tBQ1I7OztXQUVHLGdCQUFtQjtBQUNyQixVQUFNLHNCQUFzQixHQUFHLElBQUksQ0FBQyx1QkFBdUIsQ0FBQztBQUM1RCxVQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsSUFBSSxzQkFBc0IsRUFBRTtBQUM1QyxZQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsb0JBQW9CLENBQ3RELElBQUksQ0FBQyxRQUFRLEVBQ2Isc0JBQXNCLENBQUMsQ0FDeEIsSUFBSSxDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztPQUNqRDtBQUNELGFBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztLQUN0Qjs7O1dBRVkseUJBQVk7QUFDdkIsYUFBTyxJQUFJLENBQUMsdUJBQXVCLENBQUM7S0FDckM7OztTQXRERyx3QkFBd0I7OztBQXlEOUIsTUFBTSxDQUFDLE9BQU8sR0FBRyxhQUFhLENBQUMiLCJmaWxlIjoiRmlsZVRyZWVTdG9yZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtIZ1JlcG9zaXRvcnlDbGllbnR9IGZyb20gJy4uLy4uL2hnLXJlcG9zaXRvcnktY2xpZW50JztcbmltcG9ydCB0eXBlIHtcbiAgUmVtb3RlRGlyZWN0b3J5LFxuICBSZW1vdGVGaWxlLFxufSBmcm9tICcuLi8uLi9yZW1vdGUtY29ubmVjdGlvbic7XG5cbmltcG9ydCBGaWxlVHJlZURpc3BhdGNoZXIgZnJvbSAnLi9GaWxlVHJlZURpc3BhdGNoZXInO1xuaW1wb3J0IEZpbGVUcmVlSGVscGVycyBmcm9tICcuL0ZpbGVUcmVlSGVscGVycyc7XG5pbXBvcnQgRmlsZVRyZWVOb2RlIGZyb20gJy4vRmlsZVRyZWVOb2RlJztcbmltcG9ydCBJbW11dGFibGUgZnJvbSAnaW1tdXRhYmxlJztcbmltcG9ydCB7QWN0aW9uVHlwZX0gZnJvbSAnLi9GaWxlVHJlZUNvbnN0YW50cyc7XG5pbXBvcnQge0Rpc3Bvc2FibGUsIEVtaXR0ZXJ9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHtNaW5pbWF0Y2h9IGZyb20gJ21pbmltYXRjaCc7XG5pbXBvcnQge3JlcG9zaXRvcnlDb250YWluc1BhdGh9IGZyb20gJy4uLy4uL2hnLWdpdC1icmlkZ2UnO1xuaW1wb3J0IHtyZXBvc2l0b3J5Rm9yUGF0aH0gZnJvbSAnLi4vLi4vaGctZ2l0LWJyaWRnZSc7XG5pbXBvcnQge1N0YXR1c0NvZGVOdW1iZXJ9IGZyb20gJy4uLy4uL2hnLXJlcG9zaXRvcnktYmFzZS9saWIvaGctY29uc3RhbnRzJztcblxuaW1wb3J0IHthcnJheX0gZnJvbSAnLi4vLi4vY29tbW9ucyc7XG5pbXBvcnQge2dldExvZ2dlcn0gZnJvbSAnLi4vLi4vbG9nZ2luZyc7XG5pbXBvcnQge29iamVjdCBhcyBvYmplY3RVdGlsfSBmcm9tICcuLi8uLi9jb21tb25zJztcbmltcG9ydCBzaGVsbCBmcm9tICdzaGVsbCc7XG5pbXBvcnQgbWVtb2l6ZSBmcm9tICdsb2Rhc2gubWVtb2l6ZSc7XG5cbi8vIFVzZWQgdG8gZW5zdXJlIHRoZSB2ZXJzaW9uIHdlIHNlcmlhbGl6ZWQgaXMgdGhlIHNhbWUgdmVyc2lvbiB3ZSBhcmUgZGVzZXJpYWxpemluZy5cbmNvbnN0IFZFUlNJT04gPSAxO1xuXG5pbXBvcnQgdHlwZSB7RGlzcGF0Y2hlcn0gZnJvbSAnZmx1eCc7XG5pbXBvcnQgdHlwZSB7TnVjbGlkZVVyaX0gZnJvbSAnLi4vLi4vcmVtb3RlLXVyaSc7XG5cbnR5cGUgQWN0aW9uUGF5bG9hZCA9IE9iamVjdDtcbnR5cGUgQ2hhbmdlTGlzdGVuZXIgPSAoKSA9PiBtaXhlZDtcbmV4cG9ydCB0eXBlIEZpbGVUcmVlTm9kZURhdGEgPSB7XG4gIG5vZGVLZXk6IHN0cmluZztcbiAgcm9vdEtleTogc3RyaW5nO1xufVxuXG50eXBlIFN0b3JlRGF0YSA9IHtcbiAgY2hpbGRLZXlNYXA6IHsgW2tleTogc3RyaW5nXTogQXJyYXk8c3RyaW5nPiB9O1xuICBpc0RpcnR5TWFwOiB7IFtrZXk6IHN0cmluZ106IGJvb2xlYW4gfTtcbiAgZXhwYW5kZWRLZXlzQnlSb290OiB7IFtrZXk6IHN0cmluZ106IEltbXV0YWJsZS5TZXQ8c3RyaW5nPiB9O1xuICB0cmFja2VkTm9kZTogP0ZpbGVUcmVlTm9kZURhdGE7XG4gIC8vIFNhdmVzIGEgbGlzdCBvZiBjaGlsZCBub2RlcyB0aGF0IHNob3VsZCBiZSBleHBhbmRlIHdoZW4gYSBnaXZlbiBrZXkgaXMgZXhwYW5kZWQuXG4gIC8vIExvb2tzIGxpa2U6IHsgcm9vdEtleTogeyBub2RlS2V5OiBbY2hpbGRLZXkxLCBjaGlsZEtleTJdIH0gfS5cbiAgcHJldmlvdXNseUV4cGFuZGVkOiB7IFtyb290S2V5OiBzdHJpbmddOiBJbW11dGFibGUuTWFwPHN0cmluZywgQXJyYXk8U3RyaW5nPj4gfTtcbiAgaXNMb2FkaW5nTWFwOiB7IFtrZXk6IHN0cmluZ106ID9Qcm9taXNlIH07XG4gIHJvb3RLZXlzOiBBcnJheTxzdHJpbmc+O1xuICBzZWxlY3RlZEtleXNCeVJvb3Q6IHsgW2tleTogc3RyaW5nXTogSW1tdXRhYmxlLk9yZGVyZWRTZXQ8c3RyaW5nPiB9O1xuICBzdWJzY3JpcHRpb25NYXA6IHsgW2tleTogc3RyaW5nXTogRGlzcG9zYWJsZSB9O1xuICB2Y3NTdGF0dXNlc0J5Um9vdDogeyBba2V5OiBzdHJpbmddOiBJbW11dGFibGUuTWFwPHN0cmluZywgbnVtYmVyPiB9O1xuICBpZ25vcmVkUGF0dGVybnM6IEltbXV0YWJsZS5TZXQ8TWluaW1hdGNoPjtcbiAgaGlkZUlnbm9yZWROYW1lczogYm9vbGVhbjtcbiAgZXhjbHVkZVZjc0lnbm9yZWRQYXRoczogYm9vbGVhbjtcbiAgdXNlUHJldmlld1RhYnM6IGJvb2xlYW47XG4gIHJlcG9zaXRvcmllczogSW1tdXRhYmxlLlNldDxhdG9tJFJlcG9zaXRvcnk+O1xufTtcblxuZXhwb3J0IHR5cGUgRXhwb3J0U3RvcmVEYXRhID0ge1xuICBjaGlsZEtleU1hcDogeyBba2V5OiBzdHJpbmddOiBBcnJheTxzdHJpbmc+IH07XG4gIGV4cGFuZGVkS2V5c0J5Um9vdDogeyBba2V5OiBzdHJpbmddOiBBcnJheTxzdHJpbmc+IH07XG4gIHJvb3RLZXlzOiBBcnJheTxzdHJpbmc+O1xuICBzZWxlY3RlZEtleXNCeVJvb3Q6IHsgW2tleTogc3RyaW5nXTogQXJyYXk8c3RyaW5nPiB9O1xuICB2ZXJzaW9uOiBudW1iZXI7XG59O1xuXG5sZXQgaW5zdGFuY2U6ID9PYmplY3Q7XG5cbi8qKlxuICogSW1wbGVtZW50cyB0aGUgRmx1eCBwYXR0ZXJuIGZvciBvdXIgZmlsZSB0cmVlLiBBbGwgc3RhdGUgZm9yIHRoZSBmaWxlIHRyZWUgd2lsbCBiZSBrZXB0IGluXG4gKiBGaWxlVHJlZVN0b3JlIGFuZCB0aGUgb25seSB3YXkgdG8gdXBkYXRlIHRoZSBzdG9yZSBpcyB0aHJvdWdoIG1ldGhvZHMgb24gRmlsZVRyZWVBY3Rpb25zLiBUaGVcbiAqIGRpc3BhdGNoZXIgaXMgYSBtZWNoYW5pc20gdGhyb3VnaCB3aGljaCBGaWxlVHJlZUFjdGlvbnMgaW50ZXJmYWNlcyB3aXRoIEZpbGVUcmVlU3RvcmUuXG4gKi9cbmNsYXNzIEZpbGVUcmVlU3RvcmUge1xuICBfZGF0YTogU3RvcmVEYXRhO1xuICBfZGlzcGF0Y2hlcjogRGlzcGF0Y2hlcjtcbiAgX2VtaXR0ZXI6IEVtaXR0ZXI7XG4gIF9sb2dnZXI6IGFueTtcbiAgX3RpbWVyOiA/T2JqZWN0O1xuICBfcmVwb3NpdG9yeUZvclBhdGg6IChwYXRoOiBOdWNsaWRlVXJpKSA9PiA/YXRvbSRSZXBvc2l0b3J5O1xuXG4gIHN0YXRpYyBnZXRJbnN0YW5jZSgpOiBGaWxlVHJlZVN0b3JlIHtcbiAgICBpZiAoIWluc3RhbmNlKSB7XG4gICAgICBpbnN0YW5jZSA9IG5ldyBGaWxlVHJlZVN0b3JlKCk7XG4gICAgfVxuICAgIHJldHVybiBpbnN0YW5jZTtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX2RhdGEgPSB0aGlzLl9nZXREZWZhdWx0cygpO1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIgPSBGaWxlVHJlZURpc3BhdGNoZXIuZ2V0SW5zdGFuY2UoKTtcbiAgICB0aGlzLl9lbWl0dGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICB0aGlzLl9kaXNwYXRjaGVyLnJlZ2lzdGVyKFxuICAgICAgcGF5bG9hZCA9PiB0aGlzLl9vbkRpc3BhdGNoKHBheWxvYWQpXG4gICAgKTtcbiAgICB0aGlzLl9sb2dnZXIgPSBnZXRMb2dnZXIoKTtcbiAgICB0aGlzLl9yZXBvc2l0b3J5Rm9yUGF0aCA9IG1lbW9pemUodGhpcy5fcmVwb3NpdG9yeUZvclBhdGgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRPRE86IE1vdmUgdG8gYSBbc2VyaWFsaXphdGlvbiBjbGFzc11bMV0gYW5kIHVzZSB0aGUgYnVpbHQtaW4gdmVyc2lvbmluZyBtZWNoYW5pc20uIFRoaXMgbWlnaHRcbiAgICogbmVlZCB0byBiZSBkb25lIG9uZSBsZXZlbCBoaWdoZXIgd2l0aGluIG1haW4uanMuXG4gICAqXG4gICAqIFsxXTogaHR0cHM6Ly9hdG9tLmlvL2RvY3MvbGF0ZXN0L2JlaGluZC1hdG9tLXNlcmlhbGl6YXRpb24taW4tYXRvbVxuICAgKi9cbiAgZXhwb3J0RGF0YSgpOiBFeHBvcnRTdG9yZURhdGEge1xuICAgIGNvbnN0IGRhdGEgPSB0aGlzLl9kYXRhO1xuICAgIC8vIEdyYWIgdGhlIGNoaWxkIGtleXMgb2Ygb25seSB0aGUgZXhwYW5kZWQgbm9kZXMuXG4gICAgY29uc3QgY2hpbGRLZXlNYXAgPSB7fTtcbiAgICBPYmplY3Qua2V5cyhkYXRhLmV4cGFuZGVkS2V5c0J5Um9vdCkuZm9yRWFjaChyb290S2V5ID0+IHtcbiAgICAgIGNvbnN0IGV4cGFuZGVkS2V5U2V0ID0gZGF0YS5leHBhbmRlZEtleXNCeVJvb3Rbcm9vdEtleV07XG4gICAgICBmb3IgKGNvbnN0IG5vZGVLZXkgb2YgZXhwYW5kZWRLZXlTZXQpIHtcbiAgICAgICAgY2hpbGRLZXlNYXBbbm9kZUtleV0gPSBkYXRhLmNoaWxkS2V5TWFwW25vZGVLZXldO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiB7XG4gICAgICB2ZXJzaW9uOiBWRVJTSU9OLFxuICAgICAgY2hpbGRLZXlNYXA6IGNoaWxkS2V5TWFwLFxuICAgICAgZXhwYW5kZWRLZXlzQnlSb290OiBtYXBWYWx1ZXMoZGF0YS5leHBhbmRlZEtleXNCeVJvb3QsIGtleVNldCA9PiBrZXlTZXQudG9BcnJheSgpKSxcbiAgICAgIHJvb3RLZXlzOiBkYXRhLnJvb3RLZXlzLFxuICAgICAgc2VsZWN0ZWRLZXlzQnlSb290OiBtYXBWYWx1ZXMoZGF0YS5zZWxlY3RlZEtleXNCeVJvb3QsIGtleVNldCA9PiBrZXlTZXQudG9BcnJheSgpKSxcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIEltcG9ydHMgc3RvcmUgZGF0YSBmcm9tIGEgcHJldmlvdXMgZXhwb3J0LlxuICAgKi9cbiAgbG9hZERhdGEoZGF0YTogRXhwb3J0U3RvcmVEYXRhKTogdm9pZCB7XG4gICAgLy8gRW5zdXJlIHdlIGFyZSBub3QgdHJ5aW5nIHRvIGxvYWQgZGF0YSBmcm9tIGFuIGVhcmxpZXIgdmVyc2lvbiBvZiB0aGlzIHBhY2thZ2UuXG4gICAgaWYgKGRhdGEudmVyc2lvbiAhPT0gVkVSU0lPTikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLl9kYXRhID0ge1xuICAgICAgLi4udGhpcy5fZ2V0RGVmYXVsdHMoKSxcbiAgICAgIGNoaWxkS2V5TWFwOiBkYXRhLmNoaWxkS2V5TWFwLFxuICAgICAgZXhwYW5kZWRLZXlzQnlSb290OiBtYXBWYWx1ZXMoZGF0YS5leHBhbmRlZEtleXNCeVJvb3QsIGtleXMgPT4gbmV3IEltbXV0YWJsZS5TZXQoa2V5cykpLFxuICAgICAgcm9vdEtleXM6IGRhdGEucm9vdEtleXMsXG4gICAgICBzZWxlY3RlZEtleXNCeVJvb3Q6XG4gICAgICAgIG1hcFZhbHVlcyhkYXRhLnNlbGVjdGVkS2V5c0J5Um9vdCwga2V5cyA9PiBuZXcgSW1tdXRhYmxlLk9yZGVyZWRTZXQoa2V5cykpLFxuICAgIH07XG4gICAgT2JqZWN0LmtleXMoZGF0YS5jaGlsZEtleU1hcCkuZm9yRWFjaChub2RlS2V5ID0+IHtcbiAgICAgIHRoaXMuX2FkZFN1YnNjcmlwdGlvbihub2RlS2V5KTtcbiAgICAgIHRoaXMuX2ZldGNoQ2hpbGRLZXlzKG5vZGVLZXkpO1xuICAgIH0pO1xuICB9XG5cbiAgX3NldEV4Y2x1ZGVWY3NJZ25vcmVkUGF0aHMoZXhjbHVkZVZjc0lnbm9yZWRQYXRoczogYm9vbGVhbik6IHZvaWQge1xuICAgIHRoaXMuX3NldCgnZXhjbHVkZVZjc0lnbm9yZWRQYXRocycsIGV4Y2x1ZGVWY3NJZ25vcmVkUGF0aHMpO1xuICB9XG5cbiAgX3NldEhpZGVJZ25vcmVkTmFtZXMoaGlkZUlnbm9yZWROYW1lczogYm9vbGVhbik6IHZvaWQge1xuICAgIHRoaXMuX3NldCgnaGlkZUlnbm9yZWROYW1lcycsIGhpZGVJZ25vcmVkTmFtZXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdpdmVuIGEgbGlzdCBvZiBuYW1lcyB0byBpZ25vcmUsIGNvbXBpbGUgdGhlbSBpbnRvIG1pbmltYXRjaCBwYXR0ZXJucyBhbmRcbiAgICogdXBkYXRlIHRoZSBzdG9yZSB3aXRoIHRoZW0uXG4gICAqL1xuICBfc2V0SWdub3JlZE5hbWVzKGlnbm9yZWROYW1lczogQXJyYXk8c3RyaW5nPikge1xuICAgIGNvbnN0IGlnbm9yZWRQYXR0ZXJucyA9IEltbXV0YWJsZS5TZXQoaWdub3JlZE5hbWVzKVxuICAgICAgLm1hcChpZ25vcmVkTmFtZSA9PiB7XG4gICAgICAgIGlmIChpZ25vcmVkTmFtZSA9PT0gJycpIHtcbiAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICB0cnkge1xuICAgICAgICAgIHJldHVybiBuZXcgTWluaW1hdGNoKGlnbm9yZWROYW1lLCB7bWF0Y2hCYXNlOiB0cnVlLCBkb3Q6IHRydWV9KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZyhcbiAgICAgICAgICAgIGBFcnJvciBwYXJzaW5nIHBhdHRlcm4gJyR7aWdub3JlZE5hbWV9JyBmcm9tIFwiU2V0dGluZ3NcIiA+IFwiSWdub3JlZCBOYW1lc1wiYCxcbiAgICAgICAgICAgIHtkZXRhaWw6IGVycm9yLm1lc3NhZ2V9LFxuICAgICAgICAgICk7XG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICAuZmlsdGVyKHBhdHRlcm4gPT4gcGF0dGVybiAhPSBudWxsKTtcbiAgICB0aGlzLl9zZXQoJ2lnbm9yZWRQYXR0ZXJucycsIGlnbm9yZWRQYXR0ZXJucyk7XG4gIH1cblxuICBfZ2V0RGVmYXVsdHMoKTogU3RvcmVEYXRhIHtcbiAgICByZXR1cm4ge1xuICAgICAgY2hpbGRLZXlNYXA6IHt9LFxuICAgICAgaXNEaXJ0eU1hcDoge30sXG4gICAgICBleHBhbmRlZEtleXNCeVJvb3Q6IHt9LFxuICAgICAgdHJhY2tlZE5vZGU6IG51bGwsXG4gICAgICBwcmV2aW91c2x5RXhwYW5kZWQ6IHt9LFxuICAgICAgaXNMb2FkaW5nTWFwOiB7fSxcbiAgICAgIHJvb3RLZXlzOiBbXSxcbiAgICAgIHNlbGVjdGVkS2V5c0J5Um9vdDoge30sXG4gICAgICBzdWJzY3JpcHRpb25NYXA6IHt9LFxuICAgICAgdmNzU3RhdHVzZXNCeVJvb3Q6IHt9LFxuICAgICAgaWdub3JlZFBhdHRlcm5zOiBJbW11dGFibGUuU2V0KCksXG4gICAgICBoaWRlSWdub3JlZE5hbWVzOiB0cnVlLFxuICAgICAgZXhjbHVkZVZjc0lnbm9yZWRQYXRoczogdHJ1ZSxcbiAgICAgIHVzZVByZXZpZXdUYWJzOiBmYWxzZSxcbiAgICAgIHJlcG9zaXRvcmllczogSW1tdXRhYmxlLlNldCgpLFxuICAgIH07XG4gIH1cblxuICBfb25EaXNwYXRjaChwYXlsb2FkOiBBY3Rpb25QYXlsb2FkKTogdm9pZCB7XG4gICAgc3dpdGNoIChwYXlsb2FkLmFjdGlvblR5cGUpIHtcbiAgICAgIGNhc2UgQWN0aW9uVHlwZS5ERUxFVEVfU0VMRUNURURfTk9ERVM6XG4gICAgICAgIHRoaXMuX2RlbGV0ZVNlbGVjdGVkTm9kZXMoKS5jYXRjaChlcnJvciA9PiB7XG4gICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKCdEZWxldGluZyBub2RlcyBmYWlsZWQgd2l0aCBhbiBlcnJvcjogJyArIGVycm9yLnRvU3RyaW5nKCkpO1xuICAgICAgICB9KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEFjdGlvblR5cGUuU0VUX1RSQUNLRURfTk9ERTpcbiAgICAgICAgdGhpcy5fc2V0VHJhY2tlZE5vZGUocGF5bG9hZC5yb290S2V5LCBwYXlsb2FkLm5vZGVLZXkpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQWN0aW9uVHlwZS5TRVRfUk9PVF9LRVlTOlxuICAgICAgICB0aGlzLl9zZXRSb290S2V5cyhwYXlsb2FkLnJvb3RLZXlzKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEFjdGlvblR5cGUuRVhQQU5EX05PREU6XG4gICAgICAgIHRoaXMuX2V4cGFuZE5vZGUocGF5bG9hZC5yb290S2V5LCBwYXlsb2FkLm5vZGVLZXkpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQWN0aW9uVHlwZS5FWFBBTkRfTk9ERV9ERUVQOlxuICAgICAgICB0aGlzLl9leHBhbmROb2RlRGVlcChwYXlsb2FkLnJvb3RLZXksIHBheWxvYWQubm9kZUtleSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBBY3Rpb25UeXBlLkNPTExBUFNFX05PREU6XG4gICAgICAgIHRoaXMuX2NvbGxhcHNlTm9kZShwYXlsb2FkLnJvb3RLZXksIHBheWxvYWQubm9kZUtleSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBBY3Rpb25UeXBlLlNFVF9FWENMVURFX1ZDU19JR05PUkVEX1BBVEhTOlxuICAgICAgICB0aGlzLl9zZXRFeGNsdWRlVmNzSWdub3JlZFBhdGhzKHBheWxvYWQuZXhjbHVkZVZjc0lnbm9yZWRQYXRocyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBBY3Rpb25UeXBlLlNFVF9VU0VfUFJFVklFV19UQUJTOlxuICAgICAgICB0aGlzLl9zZXRVc2VQcmV2aWV3VGFicyhwYXlsb2FkLnVzZVByZXZpZXdUYWJzKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEFjdGlvblR5cGUuQ09MTEFQU0VfTk9ERV9ERUVQOlxuICAgICAgICB0aGlzLl9wdXJnZURpcmVjdG9yeVdpdGhpbkFSb290KHBheWxvYWQucm9vdEtleSwgcGF5bG9hZC5ub2RlS2V5LCAvKiB1bnNlbGVjdCAqL2ZhbHNlKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEFjdGlvblR5cGUuU0VUX0hJREVfSUdOT1JFRF9OQU1FUzpcbiAgICAgICAgdGhpcy5fc2V0SGlkZUlnbm9yZWROYW1lcyhwYXlsb2FkLmhpZGVJZ25vcmVkTmFtZXMpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQWN0aW9uVHlwZS5TRVRfSUdOT1JFRF9OQU1FUzpcbiAgICAgICAgdGhpcy5fc2V0SWdub3JlZE5hbWVzKHBheWxvYWQuaWdub3JlZE5hbWVzKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEFjdGlvblR5cGUuU0VUX1NFTEVDVEVEX05PREVTX0ZPUl9ST09UOlxuICAgICAgICB0aGlzLl9zZXRTZWxlY3RlZEtleXMocGF5bG9hZC5yb290S2V5LCBwYXlsb2FkLm5vZGVLZXlzKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEFjdGlvblR5cGUuU0VUX1NFTEVDVEVEX05PREVTX0ZPUl9UUkVFOlxuICAgICAgICB0aGlzLl9zZXRTZWxlY3RlZEtleXNCeVJvb3QocGF5bG9hZC5zZWxlY3RlZEtleXNCeVJvb3QpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQWN0aW9uVHlwZS5DUkVBVEVfQ0hJTEQ6XG4gICAgICAgIHRoaXMuX2NyZWF0ZUNoaWxkKHBheWxvYWQubm9kZUtleSwgcGF5bG9hZC5jaGlsZEtleSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBBY3Rpb25UeXBlLlNFVF9WQ1NfU1RBVFVTRVM6XG4gICAgICAgIHRoaXMuX3NldFZjc1N0YXR1c2VzKHBheWxvYWQucm9vdEtleSwgcGF5bG9hZC52Y3NTdGF0dXNlcyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBBY3Rpb25UeXBlLlNFVF9SRVBPU0lUT1JJRVM6XG4gICAgICAgIHRoaXMuX3NldFJlcG9zaXRvcmllcyhwYXlsb2FkLnJlcG9zaXRvcmllcyk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIGlzIGEgcHJpdmF0ZSBtZXRob2QgYmVjYXVzZSBpbiBGbHV4IHdlIHNob3VsZCBuZXZlciBleHRlcm5hbGx5IHdyaXRlIHRvIHRoZSBkYXRhIHN0b3JlLlxuICAgKiBPbmx5IGJ5IHJlY2VpdmluZyBhY3Rpb25zIChmcm9tIGRpc3BhdGNoZXIpIHNob3VsZCB0aGUgZGF0YSBzdG9yZSBiZSBjaGFuZ2VkLlxuICAgKiBOb3RlOiBgX3NldGAgY2FuIGJlIGNhbGxlZCBtdWx0aXBsZSB0aW1lcyB3aXRoaW4gb25lIGl0ZXJhdGlvbiBvZiBhbiBldmVudCBsb29wIHdpdGhvdXRcbiAgICogdGhyYXNoaW5nIHRoZSBVSSBiZWNhdXNlIHdlIGFyZSB1c2luZyBzZXRJbW1lZGlhdGUgdG8gYmF0Y2ggY2hhbmdlIG5vdGlmaWNhdGlvbnMsIGVmZmVjdGl2ZWx5XG4gICAqIGxldHRpbmcgb3VyIHZpZXdzIHJlLXJlbmRlciBvbmNlIGZvciBtdWx0aXBsZSBjb25zZWN1dGl2ZSB3cml0ZXMuXG4gICAqL1xuICBfc2V0KGtleTogc3RyaW5nLCB2YWx1ZTogbWl4ZWQsIGZsdXNoOiBib29sZWFuID0gZmFsc2UpOiB2b2lkIHtcbiAgICBjb25zdCBvbGREYXRhID0gdGhpcy5fZGF0YTtcbiAgICAvLyBJbW11dGFiaWxpdHkgZm9yIHRoZSB3aW4hXG4gICAgY29uc3QgbmV3RGF0YSA9IHNldFByb3BlcnR5KHRoaXMuX2RhdGEsIGtleSwgdmFsdWUpO1xuICAgIGlmIChuZXdEYXRhICE9PSBvbGREYXRhKSB7XG4gICAgICB0aGlzLl9kYXRhID0gbmV3RGF0YTtcbiAgICAgIGNsZWFySW1tZWRpYXRlKHRoaXMuX3RpbWVyKTtcbiAgICAgIGlmIChmbHVzaCkge1xuICAgICAgICAvLyBJZiBgZmx1c2hgIGlzIHRydWUsIGVtaXQgdGhlIGNoYW5nZSBpbW1lZGlhdGVseS5cbiAgICAgICAgdGhpcy5fZW1pdHRlci5lbWl0KCdjaGFuZ2UnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIElmIG5vdCBmbHVzaGluZywgZGUtYm91bmNlIHRvIHByZXZlbnQgc3VjY2Vzc2l2ZSB1cGRhdGVzIGluIHRoZSBzYW1lIGV2ZW50IGxvb3AuXG4gICAgICAgIHRoaXMuX3RpbWVyID0gc2V0SW1tZWRpYXRlKCgpID0+IHtcbiAgICAgICAgICB0aGlzLl9lbWl0dGVyLmVtaXQoJ2NoYW5nZScpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBnZXRUcmFja2VkTm9kZSgpOiA/RmlsZVRyZWVOb2RlRGF0YSB7XG4gICAgcmV0dXJuIHRoaXMuX2RhdGEudHJhY2tlZE5vZGU7XG4gIH1cblxuICBnZXRSZXBvc2l0b3JpZXMoKTogSW1tdXRhYmxlLlNldDxhdG9tJFJlcG9zaXRvcnk+IHtcbiAgICByZXR1cm4gdGhpcy5fZGF0YS5yZXBvc2l0b3JpZXM7XG4gIH1cblxuICBnZXRSb290S2V5cygpOiBBcnJheTxzdHJpbmc+IHtcbiAgICByZXR1cm4gdGhpcy5fZGF0YS5yb290S2V5cztcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBrZXkgb2YgdGhlICpmaXJzdCogcm9vdCBub2RlIGNvbnRhaW5pbmcgdGhlIGdpdmVuIG5vZGUuXG4gICAqL1xuICBnZXRSb290Rm9yS2V5KG5vZGVLZXk6IHN0cmluZyk6ID9zdHJpbmcge1xuICAgIHJldHVybiBhcnJheS5maW5kKHRoaXMuX2RhdGEucm9vdEtleXMsIHJvb3RLZXkgPT4gbm9kZUtleS5zdGFydHNXaXRoKHJvb3RLZXkpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRydWUgaWYgdGhlIHN0b3JlIGhhcyBubyBkYXRhLCBpLmUuIG5vIHJvb3RzLCBubyBjaGlsZHJlbi5cbiAgICovXG4gIGlzRW1wdHkoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0Um9vdEtleXMoKS5sZW5ndGggPT09IDA7XG4gIH1cblxuICAvKipcbiAgICogTm90ZTogV2UgYWN0dWFsbHkgZG9uJ3QgbmVlZCByb290S2V5IChpbXBsZW1lbnRhdGlvbiBkZXRhaWwpIGJ1dCB3ZSB0YWtlIGl0IGZvciBjb25zaXN0ZW5jeS5cbiAgICovXG4gIGlzTG9hZGluZyhyb290S2V5OiBzdHJpbmcsIG5vZGVLZXk6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAhIXRoaXMuX2dldExvYWRpbmcobm9kZUtleSk7XG4gIH1cblxuICBpc0V4cGFuZGVkKHJvb3RLZXk6IHN0cmluZywgbm9kZUtleTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2dldEV4cGFuZGVkS2V5cyhyb290S2V5KS5oYXMobm9kZUtleSk7XG4gIH1cblxuICBpc1Jvb3RLZXkobm9kZUtleTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2RhdGEucm9vdEtleXMuaW5kZXhPZihub2RlS2V5KSAhPT0gLTE7XG4gIH1cblxuICBpc1NlbGVjdGVkKHJvb3RLZXk6IHN0cmluZywgbm9kZUtleTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0U2VsZWN0ZWRLZXlzKHJvb3RLZXkpLmhhcyhub2RlS2V5KTtcbiAgfVxuXG4gIF9zZXRWY3NTdGF0dXNlcyhyb290S2V5OiBzdHJpbmcsIHZjc1N0YXR1c2VzOiB7W3BhdGg6IHN0cmluZ106IG51bWJlcn0pIHtcbiAgICBjb25zdCBpbW11dGFibGVWY3NTdGF0dXNlcyA9IG5ldyBJbW11dGFibGUuTWFwKHZjc1N0YXR1c2VzKTtcbiAgICBpZiAoIUltbXV0YWJsZS5pcyhpbW11dGFibGVWY3NTdGF0dXNlcywgdGhpcy5fZGF0YS52Y3NTdGF0dXNlc0J5Um9vdFtyb290S2V5XSkpIHtcbiAgICAgIHRoaXMuX3NldChcbiAgICAgICAgJ3Zjc1N0YXR1c2VzQnlSb290JyxcbiAgICAgICAgc2V0UHJvcGVydHkodGhpcy5fZGF0YS52Y3NTdGF0dXNlc0J5Um9vdCwgcm9vdEtleSwgaW1tdXRhYmxlVmNzU3RhdHVzZXMpXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIGdldFZjc1N0YXR1c0NvZGUocm9vdEtleTogc3RyaW5nLCBub2RlS2V5OiBzdHJpbmcpOiA/bnVtYmVyIHtcbiAgICBjb25zdCBtYXAgPSB0aGlzLl9kYXRhLnZjc1N0YXR1c2VzQnlSb290W3Jvb3RLZXldO1xuICAgIGlmIChtYXApIHtcbiAgICAgIHJldHVybiBtYXAuZ2V0KG5vZGVLZXkpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cblxuICBfc2V0VXNlUHJldmlld1RhYnModXNlUHJldmlld1RhYnM6IGJvb2xlYW4pIHtcbiAgICB0aGlzLl9zZXQoJ3VzZVByZXZpZXdUYWJzJywgdXNlUHJldmlld1RhYnMpO1xuICB9XG5cbiAgdXNlUHJldmlld1RhYnMoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2RhdGEudXNlUHJldmlld1RhYnM7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBrbm93biBjaGlsZCBrZXlzIGZvciB0aGUgZ2l2ZW4gYG5vZGVLZXlgIGJ1dCBkb2VzIG5vdCBxdWV1ZSBhIGZldGNoIGZvciBtaXNzaW5nXG4gICAqIGNoaWxkcmVuIGxpa2UgYDo6Z2V0Q2hpbGRLZXlzYC5cbiAgICovXG4gIGdldENhY2hlZENoaWxkS2V5cyhyb290S2V5OiBzdHJpbmcsIG5vZGVLZXk6IHN0cmluZyk6IEFycmF5PHN0cmluZz4ge1xuICAgIHJldHVybiB0aGlzLl9vbWl0SGlkZGVuUGF0aHModGhpcy5fZGF0YS5jaGlsZEtleU1hcFtub2RlS2V5XSB8fCBbXSk7XG4gIH1cblxuICAvKipcbiAgICogVGhlIG5vZGUgY2hpbGQga2V5cyBtYXkgZWl0aGVyIGJlICBhdmFpbGFibGUgaW1tZWRpYXRlbHkgKGNhY2hlZCksIG9yXG4gICAqIHJlcXVpcmUgYW4gYXN5bmMgZmV0Y2guIElmIGFsbCBvZiB0aGUgY2hpbGRyZW4gYXJlIG5lZWRlZCBpdCdzIGVhc2llciB0b1xuICAgKiByZXR1cm4gYXMgcHJvbWlzZSwgdG8gbWFrZSB0aGUgY2FsbGVyIG9ibGl2aW91cyB0byB0aGUgd2F5IGNoaWxkcmVuIHdlcmVcbiAgICogZmV0Y2hlZC5cbiAgICovXG4gIHByb21pc2VOb2RlQ2hpbGRLZXlzKHJvb3RLZXk6IHN0cmluZywgbm9kZUtleTogc3RyaW5nKTogUHJvbWlzZSB7XG4gICAgY29uc3QgY2FjaGVkQ2hpbGRLZXlzID0gdGhpcy5nZXRDaGlsZEtleXMocm9vdEtleSwgbm9kZUtleSk7XG4gICAgaWYgKGNhY2hlZENoaWxkS2V5cy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoY2FjaGVkQ2hpbGRLZXlzKTtcbiAgICB9XG5cbiAgICBjb25zdCBwcm9taXNlID0gdGhpcy5fZ2V0TG9hZGluZyhub2RlS2V5KSB8fCBQcm9taXNlLnJlc29sdmUoKTtcbiAgICByZXR1cm4gcHJvbWlzZS50aGVuKCgpID0+IHRoaXMuZ2V0Q2FjaGVkQ2hpbGRLZXlzKHJvb3RLZXksIG5vZGVLZXkpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGtub3duIGNoaWxkIGtleXMgZm9yIHRoZSBnaXZlbiBgbm9kZUtleWAgYW5kIHF1ZXVlcyBhIGZldGNoIGlmIGNoaWxkcmVuIGFyZSBtaXNzaW5nLlxuICAgKi9cbiAgZ2V0Q2hpbGRLZXlzKHJvb3RLZXk6IHN0cmluZywgbm9kZUtleTogc3RyaW5nKTogQXJyYXk8c3RyaW5nPiB7XG4gICAgY29uc3QgY2hpbGRLZXlzID0gdGhpcy5fZGF0YS5jaGlsZEtleU1hcFtub2RlS2V5XTtcbiAgICBpZiAoY2hpbGRLZXlzID09IG51bGwgfHwgdGhpcy5fZGF0YS5pc0RpcnR5TWFwW25vZGVLZXldKSB7XG4gICAgICB0aGlzLl9mZXRjaENoaWxkS2V5cyhub2RlS2V5KTtcbiAgICB9IGVsc2Uge1xuICAgICAgLypcbiAgICAgICAqIElmIG5vIGRhdGEgbmVlZHMgdG8gYmUgZmV0Y2hlZCwgd2lwZSBvdXQgdGhlIHNjcm9sbGluZyBzdGF0ZSBiZWNhdXNlIHN1YnNlcXVlbnQgdXBkYXRlc1xuICAgICAgICogc2hvdWxkIG5vIGxvbmdlciBzY3JvbGwgdGhlIHRyZWUuIFRoZSBub2RlIHdpbGwgaGF2ZSBhbHJlYWR5IGJlZW4gZmx1c2hlZCB0byB0aGUgdmlldyBhbmRcbiAgICAgICAqIHNjcm9sbGVkIHRvLlxuICAgICAgICovXG4gICAgICB0aGlzLl9jaGVja1RyYWNrZWROb2RlKCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9vbWl0SGlkZGVuUGF0aHMoY2hpbGRLZXlzIHx8IFtdKTtcbiAgfVxuXG4gIGdldFNlbGVjdGVkS2V5cyhyb290S2V5Pzogc3RyaW5nKTogSW1tdXRhYmxlLk9yZGVyZWRTZXQ8c3RyaW5nPiB7XG4gICAgbGV0IHNlbGVjdGVkS2V5cztcbiAgICBpZiAocm9vdEtleSA9PSBudWxsKSB7XG4gICAgICBzZWxlY3RlZEtleXMgPSBuZXcgSW1tdXRhYmxlLk9yZGVyZWRTZXQoKTtcbiAgICAgIGZvciAoY29uc3Qgcm9vdCBpbiB0aGlzLl9kYXRhLnNlbGVjdGVkS2V5c0J5Um9vdCkge1xuICAgICAgICBpZiAodGhpcy5fZGF0YS5zZWxlY3RlZEtleXNCeVJvb3QuaGFzT3duUHJvcGVydHkocm9vdCkpIHtcbiAgICAgICAgICBzZWxlY3RlZEtleXMgPSBzZWxlY3RlZEtleXMubWVyZ2UodGhpcy5fZGF0YS5zZWxlY3RlZEtleXNCeVJvb3Rbcm9vdF0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIElmIHRoZSBnaXZlbiBgcm9vdEtleWAgaGFzIG5vIHNlbGVjdGVkIGtleXMsIGFzc2lnbiBhbiBlbXB0eSBzZXQgdG8gbWFpbnRhaW4gYSBub24tbnVsbFxuICAgICAgLy8gcmV0dXJuIHZhbHVlLlxuICAgICAgc2VsZWN0ZWRLZXlzID0gdGhpcy5fZGF0YS5zZWxlY3RlZEtleXNCeVJvb3Rbcm9vdEtleV0gfHwgbmV3IEltbXV0YWJsZS5PcmRlcmVkU2V0KCk7XG4gICAgfVxuICAgIHJldHVybiBzZWxlY3RlZEtleXM7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIGxpc3Qgb2YgdGhlIG5vZGVzIHRoYXQgYXJlIGN1cnJlbnRseSB2aXNpYmxlL2V4cGFuZGVkIGluIHRoZSBmaWxlIHRyZWUuXG4gICAqXG4gICAqIFRoaXMgbWV0aG9kIHJldHVybnMgYW4gYXJyYXkgc3luY2hyb25vdXNseSAocmF0aGVyIHRoYW4gYW4gaXRlcmF0b3IpIHRvIGVuc3VyZSB0aGUgY2FsbGVyXG4gICAqIGdldHMgYSBjb25zaXN0ZW50IHNuYXBzaG90IG9mIHRoZSBjdXJyZW50IHN0YXRlIG9mIHRoZSBmaWxlIHRyZWUuXG4gICAqL1xuICBnZXRWaXNpYmxlTm9kZXMocm9vdEtleTogc3RyaW5nKTogQXJyYXk8RmlsZVRyZWVOb2RlPiB7XG4gICAgLy8gRG8gc29tZSBiYXNpYyBjaGVja3MgdG8gZW5zdXJlIHRoYXQgcm9vdEtleSBjb3JyZXNwb25kcyB0byBhIHJvb3QgYW5kIGlzIGV4cGFuZGVkLiBJZiBub3QsXG4gICAgLy8gcmV0dXJuIHRoZSBhcHByb3ByaWF0ZSBhcnJheS5cbiAgICBpZiAoIXRoaXMuaXNSb290S2V5KHJvb3RLZXkpKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIGlmICghdGhpcy5pc0V4cGFuZGVkKHJvb3RLZXksIHJvb3RLZXkpKSB7XG4gICAgICByZXR1cm4gW3RoaXMuZ2V0Tm9kZShyb290S2V5LCByb290S2V5KV07XG4gICAgfVxuXG4gICAgLy8gTm90ZSB0aGF0IHdlIGNvdWxkIGNhY2hlIHRoZSB2aXNpYmxlTm9kZXMgYXJyYXkgc28gdGhhdCB3ZSBkbyBub3QgaGF2ZSB0byBjcmVhdGUgaXQgZnJvbVxuICAgIC8vIHNjcmF0Y2ggZWFjaCB0aW1lIHRoaXMgaXMgY2FsbGVkLCBidXQgaXQgZG9lcyBub3QgYXBwZWFyIHRvIGJlIGEgYm90dGxlbmVjayBhdCBwcmVzZW50LlxuICAgIGNvbnN0IHZpc2libGVOb2RlcyA9IFtdO1xuICAgIGNvbnN0IHJvb3RLZXlzRm9yRGlyZWN0b3JpZXNUb0V4cGxvcmUgPSBbcm9vdEtleV07XG4gICAgd2hpbGUgKHJvb3RLZXlzRm9yRGlyZWN0b3JpZXNUb0V4cGxvcmUubGVuZ3RoICE9PSAwKSB7XG4gICAgICBjb25zdCBrZXkgPSByb290S2V5c0ZvckRpcmVjdG9yaWVzVG9FeHBsb3JlLnBvcCgpO1xuICAgICAgdmlzaWJsZU5vZGVzLnB1c2godGhpcy5nZXROb2RlKGtleSwga2V5KSk7XG4gICAgICBjb25zdCBjaGlsZEtleXMgPSB0aGlzLl9kYXRhLmNoaWxkS2V5TWFwW2tleV07XG4gICAgICBpZiAoY2hpbGRLZXlzID09IG51bGwgfHwgdGhpcy5fZGF0YS5pc0RpcnR5TWFwW2tleV0pIHtcbiAgICAgICAgLy8gVGhpcyBpcyB3aGVyZSBnZXRDaGlsZEtleXMoKSB3b3VsZCBmZXRjaCwgYnV0IHdlIGRvIG5vdCB3YW50IHRvIGRvIHRoYXQuXG4gICAgICAgIC8vIFRPRE86IElmIGtleSBpcyBpbiBpc0RpcnR5TWFwLCB0aGVuIHJldHJ5IHdoZW4gaXQgaXMgbm90IGRpcnR5P1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgZm9yIChjb25zdCBjaGlsZEtleSBvZiBjaGlsZEtleXMpIHtcbiAgICAgICAgaWYgKEZpbGVUcmVlSGVscGVycy5pc0RpcktleShjaGlsZEtleSkpIHtcbiAgICAgICAgICBpZiAodGhpcy5pc0V4cGFuZGVkKHJvb3RLZXksIGtleSkpIHtcbiAgICAgICAgICAgIHJvb3RLZXlzRm9yRGlyZWN0b3JpZXNUb0V4cGxvcmUucHVzaChjaGlsZEtleSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZpc2libGVOb2Rlcy5wdXNoKHRoaXMuZ2V0Tm9kZShrZXksIGNoaWxkS2V5KSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHZpc2libGVOb2RlcztcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFsbCBzZWxlY3RlZCBub2RlcyBhY3Jvc3MgYWxsIHJvb3RzIGluIHRoZSB0cmVlLlxuICAgKi9cbiAgZ2V0U2VsZWN0ZWROb2RlcygpOiBJbW11dGFibGUuT3JkZXJlZFNldDxGaWxlVHJlZU5vZGU+IHtcbiAgICBsZXQgc2VsZWN0ZWROb2RlcyA9IG5ldyBJbW11dGFibGUuT3JkZXJlZFNldCgpO1xuICAgIHRoaXMuX2RhdGEucm9vdEtleXMuZm9yRWFjaChyb290S2V5ID0+IHtcbiAgICAgIHRoaXMuZ2V0U2VsZWN0ZWRLZXlzKHJvb3RLZXkpLmZvckVhY2gobm9kZUtleSA9PiB7XG4gICAgICAgIHNlbGVjdGVkTm9kZXMgPSBzZWxlY3RlZE5vZGVzLmFkZCh0aGlzLmdldE5vZGUocm9vdEtleSwgbm9kZUtleSkpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHNlbGVjdGVkTm9kZXM7XG4gIH1cblxuICBnZXRTaW5nbGVTZWxlY3RlZE5vZGUoKTogP0ZpbGVUcmVlTm9kZSB7XG4gICAgY29uc3Qgc2VsZWN0ZWRSb290cyA9IE9iamVjdC5rZXlzKHRoaXMuX2RhdGEuc2VsZWN0ZWRLZXlzQnlSb290KTtcbiAgICBpZiAoc2VsZWN0ZWRSb290cy5sZW5ndGggIT09IDEpIHtcbiAgICAgIC8vIFRoZXJlIGlzIG1vcmUgdGhhbiBvbmUgcm9vdCB3aXRoIHNlbGVjdGVkIG5vZGVzLiBObyBidWVuby5cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCByb290S2V5ID0gc2VsZWN0ZWRSb290c1swXTtcbiAgICBjb25zdCBzZWxlY3RlZEtleXMgPSB0aGlzLmdldFNlbGVjdGVkS2V5cyhyb290S2V5KTtcbiAgICAvKlxuICAgICAqIE5vdGU6IFRoaXMgZG9lcyBub3QgY2FsbCBgZ2V0U2VsZWN0ZWROb2Rlc2AgdG8gcHJldmVudCBjcmVhdGluZyBub2RlcyB0aGF0IHdvdWxkIGJlIHRocm93blxuICAgICAqIGF3YXkgaWYgdGhlcmUgaXMgbW9yZSB0aGFuIDEgc2VsZWN0ZWQgbm9kZS5cbiAgICAgKi9cbiAgICByZXR1cm4gKHNlbGVjdGVkS2V5cy5zaXplID09PSAxKSA/IHRoaXMuZ2V0Tm9kZShyb290S2V5LCBzZWxlY3RlZEtleXMuZmlyc3QoKSkgOiBudWxsO1xuICB9XG5cbiAgZ2V0Um9vdE5vZGUocm9vdEtleTogc3RyaW5nKTogRmlsZVRyZWVOb2RlIHtcbiAgICByZXR1cm4gdGhpcy5nZXROb2RlKHJvb3RLZXksIHJvb3RLZXkpO1xuICB9XG5cbiAgZ2V0Tm9kZShyb290S2V5OiBzdHJpbmcsIG5vZGVLZXk6IHN0cmluZyk6IEZpbGVUcmVlTm9kZSB7XG4gICAgcmV0dXJuIG5ldyBGaWxlVHJlZU5vZGUodGhpcywgcm9vdEtleSwgbm9kZUtleSk7XG4gIH1cblxuICAvKipcbiAgICogSWYgYSBmZXRjaCBpcyBub3QgYWxyZWFkeSBpbiBwcm9ncmVzcyBpbml0aWF0ZSBhIGZldGNoIG5vdy5cbiAgICovXG4gIF9mZXRjaENoaWxkS2V5cyhub2RlS2V5OiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBleGlzdGluZ1Byb21pc2UgPSB0aGlzLl9nZXRMb2FkaW5nKG5vZGVLZXkpO1xuICAgIGlmIChleGlzdGluZ1Byb21pc2UpIHtcbiAgICAgIHJldHVybiBleGlzdGluZ1Byb21pc2U7XG4gICAgfVxuXG4gICAgY29uc3QgcHJvbWlzZSA9IEZpbGVUcmVlSGVscGVycy5mZXRjaENoaWxkcmVuKG5vZGVLZXkpLmNhdGNoKGVycm9yID0+IHtcbiAgICAgIHRoaXMuX2xvZ2dlci5lcnJvcihgVW5hYmxlIHRvIGZldGNoIGNoaWxkcmVuIGZvciBcIiR7bm9kZUtleX1cIi5gKTtcbiAgICAgIHRoaXMuX2xvZ2dlci5lcnJvcignT3JpZ2luYWwgZXJyb3I6ICcsIGVycm9yKTtcbiAgICAgIC8vIENvbGxhcHNlIHRoZSBub2RlIGFuZCBjbGVhciBpdHMgbG9hZGluZyBzdGF0ZSBvbiBlcnJvciBzbyB0aGUgdXNlciBjYW4gcmV0cnkgZXhwYW5kaW5nIGl0LlxuICAgICAgY29uc3Qgcm9vdEtleSA9IHRoaXMuZ2V0Um9vdEZvcktleShub2RlS2V5KTtcbiAgICAgIGlmIChyb290S2V5ICE9IG51bGwpIHtcbiAgICAgICAgdGhpcy5fY29sbGFwc2VOb2RlKHJvb3RLZXksIG5vZGVLZXkpO1xuICAgICAgfVxuICAgICAgdGhpcy5fY2xlYXJMb2FkaW5nKG5vZGVLZXkpO1xuICAgIH0pLnRoZW4oY2hpbGRLZXlzID0+IHtcbiAgICAgIC8vIElmIHRoaXMgbm9kZSdzIHJvb3Qgd2VudCBhd2F5IHdoaWxlIHRoZSBQcm9taXNlIHdhcyByZXNvbHZpbmcsIGRvIG5vIG1vcmUgd29yay4gVGhpcyBub2RlXG4gICAgICAvLyBpcyBubyBsb25nZXIgbmVlZGVkIGluIHRoZSBzdG9yZS5cbiAgICAgIGlmICh0aGlzLmdldFJvb3RGb3JLZXkobm9kZUtleSkgPT0gbnVsbCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0aGlzLl9zZXRDaGlsZEtleXMobm9kZUtleSwgY2hpbGRLZXlzKTtcbiAgICAgIHRoaXMuX2FkZFN1YnNjcmlwdGlvbihub2RlS2V5KTtcbiAgICAgIHRoaXMuX2NsZWFyTG9hZGluZyhub2RlS2V5KTtcbiAgICB9KTtcblxuICAgIHRoaXMuX3NldExvYWRpbmcobm9kZUtleSwgcHJvbWlzZSk7XG4gICAgcmV0dXJuIHByb21pc2U7XG4gIH1cblxuICBfZ2V0TG9hZGluZyhub2RlS2V5OiBzdHJpbmcpOiA/UHJvbWlzZSB7XG4gICAgcmV0dXJuIHRoaXMuX2RhdGEuaXNMb2FkaW5nTWFwW25vZGVLZXldO1xuICB9XG5cbiAgX3NldExvYWRpbmcobm9kZUtleTogc3RyaW5nLCB2YWx1ZTogUHJvbWlzZSk6IHZvaWQge1xuICAgIHRoaXMuX3NldCgnaXNMb2FkaW5nTWFwJywgc2V0UHJvcGVydHkodGhpcy5fZGF0YS5pc0xvYWRpbmdNYXAsIG5vZGVLZXksIHZhbHVlKSk7XG4gIH1cblxuICAvKipcbiAgICogUmVzZXRzIHRoZSBub2RlIHRvIGJlIGtlcHQgaW4gdmlldyBpZiBubyBtb3JlIGRhdGEgaXMgYmVpbmcgYXdhaXRlZC4gU2FmZSB0byBjYWxsIG1hbnkgdGltZXNcbiAgICogYmVjYXVzZSBpdCBvbmx5IGNoYW5nZXMgc3RhdGUgaWYgYSBub2RlIGlzIGJlaW5nIHRyYWNrZWQuXG4gICAqL1xuICBfY2hlY2tUcmFja2VkTm9kZSgpOiB2b2lkIHtcbiAgICBpZiAoXG4gICAgICB0aGlzLl9kYXRhLnRyYWNrZWROb2RlICE9IG51bGwgJiZcbiAgICAgIC8qXG4gICAgICAgKiBUaGUgbG9hZGluZyBtYXAgYmVpbmcgZW1wdHkgaXMgYSBoZXVyaXN0aWMgZm9yIHdoZW4gbG9hZGluZyBoYXMgY29tcGxldGVkLiBJdCBpcyBpbmV4YWN0XG4gICAgICAgKiBiZWNhdXNlIHRoZSBsb2FkaW5nIG1pZ2h0IGJlIHVucmVsYXRlZCB0byB0aGUgdHJhY2tlZCBub2RlLCBob3dldmVyIGl0IGlzIGNoZWFwIGFuZCBmYWxzZVxuICAgICAgICogcG9zaXRpdmVzIHdpbGwgb25seSBsYXN0IHVudGlsIGxvYWRpbmcgaXMgY29tcGxldGUgb3IgdW50aWwgdGhlIHVzZXIgY2xpY2tzIGFub3RoZXIgbm9kZSBpblxuICAgICAgICogdGhlIHRyZWUuXG4gICAgICAgKi9cbiAgICAgIG9iamVjdFV0aWwuaXNFbXB0eSh0aGlzLl9kYXRhLmlzTG9hZGluZ01hcClcbiAgICApIHtcbiAgICAgIC8vIExvYWRpbmcgaGFzIGNvbXBsZXRlZC4gQWxsb3cgc2Nyb2xsaW5nIHRvIHByb2NlZWQgYXMgdXN1YWwuXG4gICAgICB0aGlzLl9zZXQoJ3RyYWNrZWROb2RlJywgbnVsbCk7XG4gICAgfVxuICB9XG5cbiAgX2NsZWFyTG9hZGluZyhub2RlS2V5OiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLl9zZXQoJ2lzTG9hZGluZ01hcCcsIGRlbGV0ZVByb3BlcnR5KHRoaXMuX2RhdGEuaXNMb2FkaW5nTWFwLCBub2RlS2V5KSk7XG4gICAgdGhpcy5fY2hlY2tUcmFja2VkTm9kZSgpO1xuICB9XG5cbiAgYXN5bmMgX2RlbGV0ZVNlbGVjdGVkTm9kZXMoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3Qgc2VsZWN0ZWROb2RlcyA9IHRoaXMuZ2V0U2VsZWN0ZWROb2RlcygpO1xuICAgIGF3YWl0IFByb21pc2UuYWxsKHNlbGVjdGVkTm9kZXMubWFwKGFzeW5jIG5vZGUgPT4ge1xuICAgICAgY29uc3QgZmlsZSA9IEZpbGVUcmVlSGVscGVycy5nZXRGaWxlQnlLZXkobm9kZS5ub2RlS2V5KTtcbiAgICAgIGlmIChmaWxlID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgY29uc3QgcmVwb3NpdG9yeSA9IHJlcG9zaXRvcnlGb3JQYXRoKGZpbGUuZ2V0UGF0aCgpKTtcbiAgICAgIGlmIChyZXBvc2l0b3J5ICE9IG51bGwgJiYgcmVwb3NpdG9yeS5nZXRUeXBlKCkgPT09ICdoZycpIHtcbiAgICAgICAgY29uc3QgaGdSZXBvc2l0b3J5ID0gKChyZXBvc2l0b3J5OiBhbnkpOiBIZ1JlcG9zaXRvcnlDbGllbnQpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGF3YWl0IGhnUmVwb3NpdG9yeS5yZW1vdmUoZmlsZS5nZXRQYXRoKCkpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgY29uc3Qgc3RhdHVzZXMgPSBhd2FpdCBoZ1JlcG9zaXRvcnkuZ2V0U3RhdHVzZXMoW2ZpbGUuZ2V0UGF0aCgpXSk7XG4gICAgICAgICAgY29uc3QgcGF0aFN0YXR1cyA9IHN0YXR1c2VzLmdldChmaWxlLmdldFBhdGgoKSk7XG4gICAgICAgICAgaWYgKHBhdGhTdGF0dXMgIT09IFN0YXR1c0NvZGVOdW1iZXIuVU5UUkFDS0VEKSB7XG4gICAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoXG4gICAgICAgICAgICAgICdGYWlsZWQgdG8gcmVtb3ZlICcgKyBmaWxlLmdldFBhdGgoKSArICcgZnJvbSB2ZXJzaW9uIGNvbnRyb2wuICBUaGUgZmlsZSB3aWxsICcgK1xuICAgICAgICAgICAgICAnc3RpbGwgZ2V0IGRlbGV0ZWQgYnV0IHlvdSB3aWxsIGhhdmUgdG8gcmVtb3ZlIGl0IGZyb20geW91ciBWQ1MgeW91cnNlbGYuICBFcnJvcjogJyArXG4gICAgICAgICAgICAgIGUudG9TdHJpbmcoKSxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoRmlsZVRyZWVIZWxwZXJzLmlzTG9jYWxGaWxlKGZpbGUpKSB7XG4gICAgICAgIC8vIFRPRE86IFRoaXMgc3BlY2lhbC1jYXNlIGNhbiBiZSBlbGltaW5hdGVkIG9uY2UgYGRlbGV0ZSgpYCBpcyBhZGRlZCB0byBgRGlyZWN0b3J5YFxuICAgICAgICAvLyBhbmQgYEZpbGVgLlxuICAgICAgICBzaGVsbC5tb3ZlSXRlbVRvVHJhc2gobm9kZS5ub2RlUGF0aCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCByZW1vdGVGaWxlID0gKChmaWxlOiBhbnkpOiAoUmVtb3RlRGlyZWN0b3J5IHwgUmVtb3RlRmlsZSkpO1xuICAgICAgICBhd2FpdCByZW1vdGVGaWxlLmRlbGV0ZSgpO1xuICAgICAgfVxuICAgIH0pKTtcbiAgfVxuXG4gIF9leHBhbmROb2RlKHJvb3RLZXk6IHN0cmluZywgbm9kZUtleTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5fc2V0RXhwYW5kZWRLZXlzKHJvb3RLZXksIHRoaXMuX2dldEV4cGFuZGVkS2V5cyhyb290S2V5KS5hZGQobm9kZUtleSkpO1xuICAgIC8vIElmIHdlIGhhdmUgY2hpbGQgbm9kZXMgdGhhdCBzaG91bGQgYWxzbyBiZSBleHBhbmRlZCwgZXhwYW5kIHRoZW0gbm93LlxuICAgIGxldCBwcmV2aW91c2x5RXhwYW5kZWQgPSB0aGlzLl9nZXRQcmV2aW91c2x5RXhwYW5kZWQocm9vdEtleSk7XG4gICAgaWYgKHByZXZpb3VzbHlFeHBhbmRlZC5oYXMobm9kZUtleSkpIHtcbiAgICAgIGZvciAoY29uc3QgY2hpbGRLZXkgb2YgcHJldmlvdXNseUV4cGFuZGVkLmdldChub2RlS2V5KSkge1xuICAgICAgICB0aGlzLl9leHBhbmROb2RlKHJvb3RLZXksIGNoaWxkS2V5KTtcbiAgICAgIH1cbiAgICAgIC8vIENsZWFyIHRoZSBwcmV2aW91c2x5RXhwYW5kZWQgbGlzdCBzaW5jZSB3ZSdyZSBkb25lIHdpdGggaXQuXG4gICAgICBwcmV2aW91c2x5RXhwYW5kZWQgPSBwcmV2aW91c2x5RXhwYW5kZWQuZGVsZXRlKG5vZGVLZXkpO1xuICAgICAgdGhpcy5fc2V0UHJldmlvdXNseUV4cGFuZGVkKHJvb3RLZXksIHByZXZpb3VzbHlFeHBhbmRlZCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFBlcmZvcm1lcyBhIGRlZXAgQkZTIHNjYW5uaW5nIGV4cGFuZCBvZiBjb250YWluZWQgbm9kZXMuXG4gICAqIHJldHVybnMgLSBhIHByb21pc2UgZnVsZmlsbGVkIHdoZW4gdGhlIGV4cGFuZCBvcGVyYXRpb24gaXMgZmluaXNoZWRcbiAgICovXG4gIF9leHBhbmROb2RlRGVlcChyb290S2V5OiBzdHJpbmcsIG5vZGVLZXk6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIC8vIFN0b3AgdGhlIHRyYXZlcnNhbCBhZnRlciAxMDAgbm9kZXMgd2VyZSBhZGRlZCB0byB0aGUgdHJlZVxuICAgIGNvbnN0IGl0Tm9kZXMgPSBuZXcgRmlsZVRyZWVTdG9yZUJmc0l0ZXJhdG9yKHRoaXMsIHJvb3RLZXksIG5vZGVLZXksIC8qIGxpbWl0Ki8gMTAwKTtcbiAgICBjb25zdCBwcm9taXNlID0gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICBjb25zdCBleHBhbmQgPSAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHRyYXZlcnNlZE5vZGVLZXkgPSBpdE5vZGVzLnRyYXZlcnNlZE5vZGUoKTtcbiAgICAgICAgaWYgKHRyYXZlcnNlZE5vZGVLZXkpIHtcbiAgICAgICAgICB0aGlzLl9zZXRFeHBhbmRlZEtleXMocm9vdEtleSwgdGhpcy5fZ2V0RXhwYW5kZWRLZXlzKHJvb3RLZXkpLmFkZCh0cmF2ZXJzZWROb2RlS2V5KSk7XG4gICAgICAgICAgLyoqXG4gICAgICAgICAgICogRXZlbiBpZiB0aGVyZSB3ZXJlIHByZXZpb3VzbHkgZXhwYW5kZWQgbm9kZXMgaXQgZG9lc24ndCBtYXR0ZXIgYXNcbiAgICAgICAgICAgKiB3ZSdsbCBleHBhbmQgYWxsIG9mIHRoZSBjaGlsZHJlbi5cbiAgICAgICAgICAgKi9cbiAgICAgICAgICBsZXQgcHJldmlvdXNseUV4cGFuZGVkID0gdGhpcy5fZ2V0UHJldmlvdXNseUV4cGFuZGVkKHJvb3RLZXkpO1xuICAgICAgICAgIHByZXZpb3VzbHlFeHBhbmRlZCA9IHByZXZpb3VzbHlFeHBhbmRlZC5kZWxldGUodHJhdmVyc2VkTm9kZUtleSk7XG4gICAgICAgICAgdGhpcy5fc2V0UHJldmlvdXNseUV4cGFuZGVkKHJvb3RLZXksIHByZXZpb3VzbHlFeHBhbmRlZCk7XG5cbiAgICAgICAgICBjb25zdCBuZXh0UHJvbWlzZSA9IGl0Tm9kZXMubmV4dCgpO1xuICAgICAgICAgIGlmIChuZXh0UHJvbWlzZSkge1xuICAgICAgICAgICAgbmV4dFByb21pc2UudGhlbihleHBhbmQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIGV4cGFuZCgpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHByb21pc2U7XG4gIH1cblxuICAvKipcbiAgICogV2hlbiB3ZSBjb2xsYXBzZSBhIG5vZGUgd2UgbmVlZCB0byBkbyBzb21lIGNsZWFudXAgcmVtb3Zpbmcgc3Vic2NyaXB0aW9ucyBhbmQgc2VsZWN0aW9uLlxuICAgKi9cbiAgX2NvbGxhcHNlTm9kZShyb290S2V5OiBzdHJpbmcsIG5vZGVLZXk6IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IGNoaWxkS2V5cyA9IHRoaXMuX2RhdGEuY2hpbGRLZXlNYXBbbm9kZUtleV07XG4gICAgbGV0IHNlbGVjdGVkS2V5cyA9IHRoaXMuX2RhdGEuc2VsZWN0ZWRLZXlzQnlSb290W3Jvb3RLZXldO1xuICAgIGNvbnN0IGV4cGFuZGVkQ2hpbGRLZXlzID0gW107XG4gICAgaWYgKGNoaWxkS2V5cykge1xuICAgICAgY2hpbGRLZXlzLmZvckVhY2goY2hpbGRLZXkgPT4ge1xuICAgICAgICAvLyBVbnNlbGVjdCBlYWNoIGNoaWxkLlxuICAgICAgICBpZiAoc2VsZWN0ZWRLZXlzICYmIHNlbGVjdGVkS2V5cy5oYXMoY2hpbGRLZXkpKSB7XG4gICAgICAgICAgc2VsZWN0ZWRLZXlzID0gc2VsZWN0ZWRLZXlzLmRlbGV0ZShjaGlsZEtleSk7XG4gICAgICAgICAgLypcbiAgICAgICAgICAgKiBTZXQgdGhlIHNlbGVjdGVkIGtleXMgKmJlZm9yZSogdGhlIHJlY3Vyc2l2ZSBgX2NvbGxhcHNlTm9kZWAgY2FsbCBzbyBlYWNoIGNhbGwgc3RvcmVzXG4gICAgICAgICAgICogaXRzIGNoYW5nZXMgYW5kIGlzbid0IHdpcGVkIG91dCBieSB0aGUgbmV4dCBjYWxsIGJ5IGtlZXBpbmcgYW4gb3V0ZGF0ZWQgYHNlbGVjdGVkS2V5c2BcbiAgICAgICAgICAgKiBpbiB0aGUgY2FsbCBzdGFjay5cbiAgICAgICAgICAgKi9cbiAgICAgICAgICB0aGlzLl9zZXRTZWxlY3RlZEtleXMocm9vdEtleSwgc2VsZWN0ZWRLZXlzKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBDb2xsYXBzZSBlYWNoIGNoaWxkIGRpcmVjdG9yeS5cbiAgICAgICAgaWYgKEZpbGVUcmVlSGVscGVycy5pc0RpcktleShjaGlsZEtleSkpIHtcbiAgICAgICAgICBpZiAodGhpcy5pc0V4cGFuZGVkKHJvb3RLZXksIGNoaWxkS2V5KSkge1xuICAgICAgICAgICAgZXhwYW5kZWRDaGlsZEtleXMucHVzaChjaGlsZEtleSk7XG4gICAgICAgICAgICB0aGlzLl9jb2xsYXBzZU5vZGUocm9vdEtleSwgY2hpbGRLZXkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICAgIC8qXG4gICAgICogU2F2ZSB0aGUgbGlzdCBvZiBleHBhbmRlZCBjaGlsZCBub2RlcyBzbyBuZXh0IHRpbWUgd2UgZXhwYW5kIHRoaXMgbm9kZSB3ZSBjYW4gZXhwYW5kIHRoZXNlXG4gICAgICogY2hpbGRyZW4uXG4gICAgICovXG4gICAgbGV0IHByZXZpb3VzbHlFeHBhbmRlZCA9IHRoaXMuX2dldFByZXZpb3VzbHlFeHBhbmRlZChyb290S2V5KTtcbiAgICBpZiAoZXhwYW5kZWRDaGlsZEtleXMubGVuZ3RoICE9PSAwKSB7XG4gICAgICBwcmV2aW91c2x5RXhwYW5kZWQgPSBwcmV2aW91c2x5RXhwYW5kZWQuc2V0KG5vZGVLZXksIGV4cGFuZGVkQ2hpbGRLZXlzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcHJldmlvdXNseUV4cGFuZGVkID0gcHJldmlvdXNseUV4cGFuZGVkLmRlbGV0ZShub2RlS2V5KTtcbiAgICB9XG4gICAgdGhpcy5fc2V0UHJldmlvdXNseUV4cGFuZGVkKHJvb3RLZXksIHByZXZpb3VzbHlFeHBhbmRlZCk7XG4gICAgdGhpcy5fc2V0RXhwYW5kZWRLZXlzKHJvb3RLZXksIHRoaXMuX2dldEV4cGFuZGVkS2V5cyhyb290S2V5KS5kZWxldGUobm9kZUtleSkpO1xuICAgIHRoaXMuX3JlbW92ZVN1YnNjcmlwdGlvbihyb290S2V5LCBub2RlS2V5KTtcbiAgfVxuXG4gIF9nZXRQcmV2aW91c2x5RXhwYW5kZWQocm9vdEtleTogc3RyaW5nKTogSW1tdXRhYmxlLk1hcDxzdHJpbmcsIEFycmF5PHN0cmluZz4+IHtcbiAgICByZXR1cm4gdGhpcy5fZGF0YS5wcmV2aW91c2x5RXhwYW5kZWRbcm9vdEtleV0gfHwgbmV3IEltbXV0YWJsZS5NYXAoKTtcbiAgfVxuXG4gIF9zZXRQcmV2aW91c2x5RXhwYW5kZWQocm9vdEtleTogc3RyaW5nLFxuICAgIHByZXZpb3VzbHlFeHBhbmRlZDogSW1tdXRhYmxlLk1hcDxzdHJpbmcsIEFycmF5PHN0cmluZz4+KTogdm9pZCB7XG4gICAgdGhpcy5fc2V0KFxuICAgICAgJ3ByZXZpb3VzbHlFeHBhbmRlZCcsXG4gICAgICBzZXRQcm9wZXJ0eSh0aGlzLl9kYXRhLnByZXZpb3VzbHlFeHBhbmRlZCwgcm9vdEtleSwgcHJldmlvdXNseUV4cGFuZGVkKVxuICAgICk7XG4gIH1cblxuICBfZ2V0RXhwYW5kZWRLZXlzKHJvb3RLZXk6IHN0cmluZyk6IEltbXV0YWJsZS5TZXQ8c3RyaW5nPiB7XG4gICAgcmV0dXJuIHRoaXMuX2RhdGEuZXhwYW5kZWRLZXlzQnlSb290W3Jvb3RLZXldIHx8IG5ldyBJbW11dGFibGUuU2V0KCk7XG4gIH1cblxuICAvKipcbiAgICogVGhpcyBpcyBqdXN0IGV4cG9zZWQgc28gaXQgY2FuIGJlIG1vY2tlZCBpbiB0aGUgdGVzdHMuIE5vdCBpZGVhbCwgYnV0IGEgbG90IGxlc3MgbWVzc3kgdGhhbiB0aGVcbiAgICogYWx0ZXJuYXRpdmVzLiBGb3IgZXhhbXBsZSwgcGFzc2luZyBvcHRpb25zIHdoZW4gY29uc3RydWN0aW5nIGFuIGluc3RhbmNlIG9mIGEgc2luZ2xldG9uIHdvdWxkXG4gICAqIG1ha2UgZnV0dXJlIGludm9jYXRpb25zIG9mIGBnZXRJbnN0YW5jZWAgdW5wcmVkaWN0YWJsZS5cbiAgICovXG4gIF9yZXBvc2l0b3J5Rm9yUGF0aChwYXRoOiBOdWNsaWRlVXJpKTogP2F0b20kUmVwb3NpdG9yeSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0UmVwb3NpdG9yaWVzKCkuZmluZChyZXBvID0+IHJlcG9zaXRvcnlDb250YWluc1BhdGgocmVwbywgcGF0aCkpO1xuICB9XG5cbiAgX3NldEV4cGFuZGVkS2V5cyhyb290S2V5OiBzdHJpbmcsIGV4cGFuZGVkS2V5czogSW1tdXRhYmxlLlNldDxzdHJpbmc+KTogdm9pZCB7XG4gICAgdGhpcy5fc2V0KFxuICAgICAgJ2V4cGFuZGVkS2V5c0J5Um9vdCcsXG4gICAgICBzZXRQcm9wZXJ0eSh0aGlzLl9kYXRhLmV4cGFuZGVkS2V5c0J5Um9vdCwgcm9vdEtleSwgZXhwYW5kZWRLZXlzKVxuICAgICk7XG4gIH1cblxuICBfZGVsZXRlU2VsZWN0ZWRLZXlzKHJvb3RLZXk6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuX3NldCgnc2VsZWN0ZWRLZXlzQnlSb290JywgZGVsZXRlUHJvcGVydHkodGhpcy5fZGF0YS5zZWxlY3RlZEtleXNCeVJvb3QsIHJvb3RLZXkpKTtcbiAgfVxuXG4gIF9zZXRTZWxlY3RlZEtleXMocm9vdEtleTogc3RyaW5nLCBzZWxlY3RlZEtleXM6IEltbXV0YWJsZS5PcmRlcmVkU2V0PHN0cmluZz4pOiB2b2lkIHtcbiAgICAvKlxuICAgICAqIE5ldyBzZWxlY3Rpb24gbWVhbnMgcHJldmlvdXMgbm9kZSBzaG91bGQgbm90IGJlIGtlcHQgaW4gdmlldy4gRG8gdGhpcyB3aXRob3V0IGRlLWJvdW5jaW5nXG4gICAgICogYmVjYXVzZSB0aGUgcHJldmlvdXMgc3RhdGUgaXMgaXJyZWxldmFudC4gSWYgdGhlIHVzZXIgY2hvc2UgYSBuZXcgc2VsZWN0aW9uLCB0aGUgcHJldmlvdXMgb25lXG4gICAgICogc2hvdWxkIG5vdCBiZSBzY3JvbGxlZCBpbnRvIHZpZXcuXG4gICAgICovXG4gICAgdGhpcy5fc2V0KCd0cmFja2VkTm9kZScsIG51bGwpO1xuICAgIHRoaXMuX3NldChcbiAgICAgICdzZWxlY3RlZEtleXNCeVJvb3QnLFxuICAgICAgc2V0UHJvcGVydHkodGhpcy5fZGF0YS5zZWxlY3RlZEtleXNCeVJvb3QsIHJvb3RLZXksIHNlbGVjdGVkS2V5cylcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIHNlbGVjdGVkIGtleXMgaW4gYWxsIHJvb3RzIG9mIHRoZSB0cmVlLiBUaGUgc2VsZWN0ZWQga2V5cyBvZiByb290IGtleXMgbm90IGluXG4gICAqIGBzZWxlY3RlZEtleXNCeVJvb3RgIGFyZSBkZWxldGVkICh0aGUgcm9vdCBpcyBsZWZ0IHdpdGggbm8gc2VsZWN0aW9uKS5cbiAgICovXG4gIF9zZXRTZWxlY3RlZEtleXNCeVJvb3Qoc2VsZWN0ZWRLZXlzQnlSb290OiB7W2tleTogc3RyaW5nXTogSW1tdXRhYmxlLk9yZGVyZWRTZXQ8c3RyaW5nPn0pOiB2b2lkIHtcbiAgICB0aGlzLmdldFJvb3RLZXlzKCkuZm9yRWFjaChyb290S2V5ID0+IHtcbiAgICAgIGlmIChzZWxlY3RlZEtleXNCeVJvb3QuaGFzT3duUHJvcGVydHkocm9vdEtleSkpIHtcbiAgICAgICAgdGhpcy5fc2V0U2VsZWN0ZWRLZXlzKHJvb3RLZXksIHNlbGVjdGVkS2V5c0J5Um9vdFtyb290S2V5XSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9kZWxldGVTZWxlY3RlZEtleXMocm9vdEtleSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBfc2V0Um9vdEtleXMocm9vdEtleXM6IEFycmF5PHN0cmluZz4pOiB2b2lkIHtcbiAgICBjb25zdCBvbGRSb290S2V5cyA9IHRoaXMuX2RhdGEucm9vdEtleXM7XG4gICAgY29uc3QgbmV3Um9vdEtleXMgPSBuZXcgSW1tdXRhYmxlLlNldChyb290S2V5cyk7XG4gICAgY29uc3QgcmVtb3ZlZFJvb3RLZXlzID0gbmV3IEltbXV0YWJsZS5TZXQob2xkUm9vdEtleXMpLnN1YnRyYWN0KG5ld1Jvb3RLZXlzKTtcbiAgICByZW1vdmVkUm9vdEtleXMuZm9yRWFjaCh0aGlzLl9wdXJnZVJvb3QuYmluZCh0aGlzKSk7XG4gICAgdGhpcy5fc2V0KCdyb290S2V5cycsIHJvb3RLZXlzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIGEgc2luZ2xlIGNoaWxkIG5vZGUuIEl0J3MgdXNlZnVsIHdoZW4gZXhwYW5kaW5nIHRvIGEgZGVlcGx5IG5lc3RlZCBub2RlLlxuICAgKi9cbiAgX2NyZWF0ZUNoaWxkKG5vZGVLZXk6IHN0cmluZywgY2hpbGRLZXk6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuX3NldENoaWxkS2V5cyhub2RlS2V5LCBbY2hpbGRLZXldKTtcbiAgICAvKlxuICAgICAqIE1hcmsgdGhlIG5vZGUgYXMgZGlydHkgc28gaXRzIGFuY2VzdG9ycyBhcmUgZmV0Y2hlZCBhZ2FpbiBvbiByZWxvYWQgb2YgdGhlIHRyZWUuXG4gICAgICovXG4gICAgdGhpcy5fc2V0KCdpc0RpcnR5TWFwJywgc2V0UHJvcGVydHkodGhpcy5fZGF0YS5pc0RpcnR5TWFwLCBub2RlS2V5LCB0cnVlKSk7XG4gIH1cblxuICBfc2V0Q2hpbGRLZXlzKG5vZGVLZXk6IHN0cmluZywgY2hpbGRLZXlzOiBBcnJheTxzdHJpbmc+KTogdm9pZCB7XG4gICAgY29uc3Qgb2xkQ2hpbGRLZXlzID0gdGhpcy5fZGF0YS5jaGlsZEtleU1hcFtub2RlS2V5XTtcbiAgICBpZiAob2xkQ2hpbGRLZXlzKSB7XG4gICAgICBjb25zdCBuZXdDaGlsZEtleXMgPSBuZXcgSW1tdXRhYmxlLlNldChjaGlsZEtleXMpO1xuICAgICAgY29uc3QgcmVtb3ZlZERpcmVjdG9yeUtleXMgPSBuZXcgSW1tdXRhYmxlLlNldChvbGRDaGlsZEtleXMpXG4gICAgICAgIC5zdWJ0cmFjdChuZXdDaGlsZEtleXMpXG4gICAgICAgIC5maWx0ZXIoRmlsZVRyZWVIZWxwZXJzLmlzRGlyS2V5KTtcbiAgICAgIHJlbW92ZWREaXJlY3RvcnlLZXlzLmZvckVhY2godGhpcy5fcHVyZ2VEaXJlY3RvcnkuYmluZCh0aGlzKSk7XG4gICAgfVxuICAgIHRoaXMuX3NldCgnY2hpbGRLZXlNYXAnLCBzZXRQcm9wZXJ0eSh0aGlzLl9kYXRhLmNoaWxkS2V5TWFwLCBub2RlS2V5LCBjaGlsZEtleXMpKTtcbiAgfVxuXG4gIF9vbkRpcmVjdG9yeUNoYW5nZShub2RlS2V5OiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLl9mZXRjaENoaWxkS2V5cyhub2RlS2V5KTtcbiAgfVxuXG4gIF9hZGRTdWJzY3JpcHRpb24obm9kZUtleTogc3RyaW5nKTogdm9pZCB7XG4gICAgY29uc3QgZGlyZWN0b3J5ID0gRmlsZVRyZWVIZWxwZXJzLmdldERpcmVjdG9yeUJ5S2V5KG5vZGVLZXkpO1xuICAgIGlmICghZGlyZWN0b3J5KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLypcbiAgICAgKiBSZW1vdmUgdGhlIGRpcmVjdG9yeSdzIGRpcnR5IG1hcmtlciByZWdhcmRsZXNzIG9mIHdoZXRoZXIgYSBzdWJzY3JpcHRpb24gYWxyZWFkeSBleGlzdHNcbiAgICAgKiBiZWNhdXNlIHRoZXJlIGlzIG5vdGhpbmcgZnVydGhlciBtYWtpbmcgaXQgZGlydHkuXG4gICAgICovXG4gICAgdGhpcy5fc2V0KCdpc0RpcnR5TWFwJywgZGVsZXRlUHJvcGVydHkodGhpcy5fZGF0YS5pc0RpcnR5TWFwLCBub2RlS2V5KSk7XG5cbiAgICAvLyBEb24ndCBjcmVhdGUgYSBuZXcgc3Vic2NyaXB0aW9uIGlmIG9uZSBhbHJlYWR5IGV4aXN0cy5cbiAgICBpZiAodGhpcy5fZGF0YS5zdWJzY3JpcHRpb25NYXBbbm9kZUtleV0pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgc3Vic2NyaXB0aW9uO1xuICAgIHRyeSB7XG4gICAgICAvLyBUaGlzIGNhbGwgbWlnaHQgZmFpbCBpZiB3ZSB0cnkgdG8gd2F0Y2ggYSBub24tZXhpc3RpbmcgZGlyZWN0b3J5LCBvciBpZiBwZXJtaXNzaW9uIGRlbmllZC5cbiAgICAgIHN1YnNjcmlwdGlvbiA9IGRpcmVjdG9yeS5vbkRpZENoYW5nZSgoKSA9PiB7XG4gICAgICAgIHRoaXMuX29uRGlyZWN0b3J5Q2hhbmdlKG5vZGVLZXkpO1xuICAgICAgfSk7XG4gICAgfSBjYXRjaCAoZXgpIHtcbiAgICAgIC8qXG4gICAgICAgKiBMb2cgZXJyb3IgYW5kIG1hcmsgdGhlIGRpcmVjdG9yeSBhcyBkaXJ0eSBzbyB0aGUgZmFpbGVkIHN1YnNjcmlwdGlvbiB3aWxsIGJlIGF0dGVtcHRlZFxuICAgICAgICogYWdhaW4gbmV4dCB0aW1lIHRoZSBkaXJlY3RvcnkgaXMgZXhwYW5kZWQuXG4gICAgICAgKi9cbiAgICAgIHRoaXMuX2xvZ2dlci5lcnJvcihgQ2Fubm90IHN1YnNjcmliZSB0byBkaXJlY3RvcnkgXCIke25vZGVLZXl9XCJgLCBleCk7XG4gICAgICB0aGlzLl9zZXQoJ2lzRGlydHlNYXAnLCBzZXRQcm9wZXJ0eSh0aGlzLl9kYXRhLmlzRGlydHlNYXAsIG5vZGVLZXkpKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5fc2V0KCdzdWJzY3JpcHRpb25NYXAnLCBzZXRQcm9wZXJ0eSh0aGlzLl9kYXRhLnN1YnNjcmlwdGlvbk1hcCwgbm9kZUtleSwgc3Vic2NyaXB0aW9uKSk7XG4gIH1cblxuICBfcmVtb3ZlU3Vic2NyaXB0aW9uKHJvb3RLZXk6IHN0cmluZywgbm9kZUtleTogc3RyaW5nKTogdm9pZCB7XG4gICAgbGV0IGhhc1JlbWFpbmluZ1N1YnNjcmliZXJzO1xuICAgIGNvbnN0IHN1YnNjcmlwdGlvbiA9IHRoaXMuX2RhdGEuc3Vic2NyaXB0aW9uTWFwW25vZGVLZXldO1xuXG4gICAgaWYgKHN1YnNjcmlwdGlvbiAhPSBudWxsKSB7XG4gICAgICBoYXNSZW1haW5pbmdTdWJzY3JpYmVycyA9IHRoaXMuX2RhdGEucm9vdEtleXMuc29tZShvdGhlclJvb3RLZXkgPT4gKFxuICAgICAgICBvdGhlclJvb3RLZXkgIT09IHJvb3RLZXkgJiYgdGhpcy5pc0V4cGFuZGVkKG90aGVyUm9vdEtleSwgbm9kZUtleSlcbiAgICAgICkpO1xuICAgICAgaWYgKCFoYXNSZW1haW5pbmdTdWJzY3JpYmVycykge1xuICAgICAgICBzdWJzY3JpcHRpb24uZGlzcG9zZSgpO1xuICAgICAgICB0aGlzLl9zZXQoJ3N1YnNjcmlwdGlvbk1hcCcsIGRlbGV0ZVByb3BlcnR5KHRoaXMuX2RhdGEuc3Vic2NyaXB0aW9uTWFwLCBub2RlS2V5KSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHN1YnNjcmlwdGlvbiA9PSBudWxsIHx8IGhhc1JlbWFpbmluZ1N1YnNjcmliZXJzID09PSBmYWxzZSkge1xuICAgICAgLy8gU2luY2Ugd2UncmUgbm8gbG9uZ2VyIGdldHRpbmcgbm90aWZpY2F0aW9ucyB3aGVuIHRoZSBkaXJlY3RvcnkgY29udGVudHMgY2hhbmdlLCBhc3N1bWUgdGhlXG4gICAgICAvLyBjaGlsZCBsaXN0IGlzIGRpcnR5LlxuICAgICAgdGhpcy5fc2V0KCdpc0RpcnR5TWFwJywgc2V0UHJvcGVydHkodGhpcy5fZGF0YS5pc0RpcnR5TWFwLCBub2RlS2V5LCB0cnVlKSk7XG4gICAgfVxuICB9XG5cbiAgX3JlbW92ZUFsbFN1YnNjcmlwdGlvbnMobm9kZUtleTogc3RyaW5nKTogdm9pZCB7XG4gICAgY29uc3Qgc3Vic2NyaXB0aW9uID0gdGhpcy5fZGF0YS5zdWJzY3JpcHRpb25NYXBbbm9kZUtleV07XG4gICAgaWYgKHN1YnNjcmlwdGlvbikge1xuICAgICAgc3Vic2NyaXB0aW9uLmRpc3Bvc2UoKTtcbiAgICAgIHRoaXMuX3NldCgnc3Vic2NyaXB0aW9uTWFwJywgZGVsZXRlUHJvcGVydHkodGhpcy5fZGF0YS5zdWJzY3JpcHRpb25NYXAsIG5vZGVLZXkpKTtcbiAgICB9XG4gIH1cblxuICBfcHVyZ2VOb2RlKHJvb3RLZXk6IHN0cmluZywgbm9kZUtleTogc3RyaW5nLCB1bnNlbGVjdDogYm9vbGVhbik6IHZvaWQge1xuICAgIGNvbnN0IGV4cGFuZGVkS2V5cyA9IHRoaXMuX2dldEV4cGFuZGVkS2V5cyhyb290S2V5KTtcbiAgICBpZiAoZXhwYW5kZWRLZXlzLmhhcyhub2RlS2V5KSkge1xuICAgICAgdGhpcy5fc2V0RXhwYW5kZWRLZXlzKHJvb3RLZXksIGV4cGFuZGVkS2V5cy5kZWxldGUobm9kZUtleSkpO1xuICAgIH1cblxuICAgIGlmICh1bnNlbGVjdCkge1xuICAgICAgY29uc3Qgc2VsZWN0ZWRLZXlzID0gdGhpcy5nZXRTZWxlY3RlZEtleXMocm9vdEtleSk7XG4gICAgICBpZiAoc2VsZWN0ZWRLZXlzLmhhcyhub2RlS2V5KSkge1xuICAgICAgICB0aGlzLl9zZXRTZWxlY3RlZEtleXMocm9vdEtleSwgc2VsZWN0ZWRLZXlzLmRlbGV0ZShub2RlS2V5KSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgcHJldmlvdXNseUV4cGFuZGVkID0gdGhpcy5fZ2V0UHJldmlvdXNseUV4cGFuZGVkKHJvb3RLZXkpO1xuICAgIGlmIChwcmV2aW91c2x5RXhwYW5kZWQuaGFzKG5vZGVLZXkpKSB7XG4gICAgICB0aGlzLl9zZXRQcmV2aW91c2x5RXhwYW5kZWQocm9vdEtleSwgcHJldmlvdXNseUV4cGFuZGVkLmRlbGV0ZShub2RlS2V5KSk7XG4gICAgfVxuICB9XG5cbiAgX3B1cmdlRGlyZWN0b3J5V2l0aGluQVJvb3Qocm9vdEtleTogc3RyaW5nLCBub2RlS2V5OiBzdHJpbmcsIHVuc2VsZWN0OiBib29sZWFuKTogdm9pZCB7XG4gICAgY29uc3QgY2hpbGRLZXlzID0gdGhpcy5fZGF0YS5jaGlsZEtleU1hcFtub2RlS2V5XTtcbiAgICBpZiAoY2hpbGRLZXlzKSB7XG4gICAgICBjaGlsZEtleXMuZm9yRWFjaChjaGlsZEtleSA9PiB7XG4gICAgICAgIGlmIChGaWxlVHJlZUhlbHBlcnMuaXNEaXJLZXkoY2hpbGRLZXkpKSB7XG4gICAgICAgICAgdGhpcy5fcHVyZ2VEaXJlY3RvcnlXaXRoaW5BUm9vdChyb290S2V5LCBjaGlsZEtleSwgLyogdW5zZWxlY3QgKi8gdHJ1ZSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgICB0aGlzLl9yZW1vdmVTdWJzY3JpcHRpb24ocm9vdEtleSwgbm9kZUtleSk7XG4gICAgdGhpcy5fcHVyZ2VOb2RlKHJvb3RLZXksIG5vZGVLZXksIHVuc2VsZWN0KTtcbiAgfVxuXG4gIC8vIFRoaXMgaXMgY2FsbGVkIHdoZW4gYSBkaXJjdG9yeSBpcyBwaHlzaWNhbGx5IHJlbW92ZWQgZnJvbSBkaXNrLiBXaGVuIHdlIHB1cmdlIGEgZGlyZWN0b3J5LFxuICAvLyB3ZSBuZWVkIHRvIHB1cmdlIGl0J3MgY2hpbGQgZGlyZWN0b3JpZXMgYWxzby4gUHVyZ2luZyByZW1vdmVzIHN0dWZmIGZyb20gdGhlIGRhdGEgc3RvcmVcbiAgLy8gaW5jbHVkaW5nIGxpc3Qgb2YgY2hpbGQgbm9kZXMsIHN1YnNjcmlwdGlvbnMsIGV4cGFuZGVkIGRpcmVjdG9yaWVzIGFuZCBzZWxlY3RlZCBkaXJlY3Rvcmllcy5cbiAgX3B1cmdlRGlyZWN0b3J5KG5vZGVLZXk6IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IGNoaWxkS2V5cyA9IHRoaXMuX2RhdGEuY2hpbGRLZXlNYXBbbm9kZUtleV07XG4gICAgaWYgKGNoaWxkS2V5cykge1xuICAgICAgY2hpbGRLZXlzLmZvckVhY2goY2hpbGRLZXkgPT4ge1xuICAgICAgICBpZiAoRmlsZVRyZWVIZWxwZXJzLmlzRGlyS2V5KGNoaWxkS2V5KSkge1xuICAgICAgICAgIHRoaXMuX3B1cmdlRGlyZWN0b3J5KGNoaWxkS2V5KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICB0aGlzLl9zZXQoJ2NoaWxkS2V5TWFwJywgZGVsZXRlUHJvcGVydHkodGhpcy5fZGF0YS5jaGlsZEtleU1hcCwgbm9kZUtleSkpO1xuICAgIH1cblxuICAgIHRoaXMuX3JlbW92ZUFsbFN1YnNjcmlwdGlvbnMobm9kZUtleSk7XG4gICAgdGhpcy5nZXRSb290S2V5cygpLmZvckVhY2gocm9vdEtleSA9PiB7XG4gICAgICB0aGlzLl9wdXJnZU5vZGUocm9vdEtleSwgbm9kZUtleSwgLyogdW5zZWxlY3QgKi8gdHJ1ZSk7XG4gICAgfSk7XG4gIH1cblxuICAvLyBUT0RPOiBTaG91bGQgd2UgY2xlYW4gdXAgaXNMb2FkaW5nTWFwPyBJdCBjb250YWlucyBwcm9taXNlcyB3aGljaCBjYW5ub3QgYmUgY2FuY2VsbGVkLCBzbyB0aGlzXG4gIC8vIG1pZ2h0IGJlIHRyaWNreS5cbiAgX3B1cmdlUm9vdChyb290S2V5OiBzdHJpbmcpOiB2b2lkIHtcbiAgICBjb25zdCBleHBhbmRlZEtleXMgPSB0aGlzLl9kYXRhLmV4cGFuZGVkS2V5c0J5Um9vdFtyb290S2V5XTtcbiAgICBpZiAoZXhwYW5kZWRLZXlzKSB7XG4gICAgICBleHBhbmRlZEtleXMuZm9yRWFjaChub2RlS2V5ID0+IHtcbiAgICAgICAgdGhpcy5fcmVtb3ZlU3Vic2NyaXB0aW9uKHJvb3RLZXksIG5vZGVLZXkpO1xuICAgICAgfSk7XG4gICAgICB0aGlzLl9zZXQoJ2V4cGFuZGVkS2V5c0J5Um9vdCcsIGRlbGV0ZVByb3BlcnR5KHRoaXMuX2RhdGEuZXhwYW5kZWRLZXlzQnlSb290LCByb290S2V5KSk7XG4gICAgfVxuICAgIHRoaXMuX3NldCgnc2VsZWN0ZWRLZXlzQnlSb290JywgZGVsZXRlUHJvcGVydHkodGhpcy5fZGF0YS5zZWxlY3RlZEtleXNCeVJvb3QsIHJvb3RLZXkpKTtcbiAgICAvLyBSZW1vdmUgYWxsIGNoaWxkIGtleXMgc28gdGhhdCBvbiByZS1hZGRpdGlvbiBvZiB0aGlzIHJvb3QgdGhlIGNoaWxkcmVuIHdpbGwgYmUgZmV0Y2hlZCBhZ2Fpbi5cbiAgICBjb25zdCBjaGlsZEtleXMgPSB0aGlzLl9kYXRhLmNoaWxkS2V5TWFwW3Jvb3RLZXldO1xuICAgIGlmIChjaGlsZEtleXMpIHtcbiAgICAgIGNoaWxkS2V5cy5mb3JFYWNoKGNoaWxkS2V5ID0+IHtcbiAgICAgICAgaWYgKEZpbGVUcmVlSGVscGVycy5pc0RpcktleShjaGlsZEtleSkpIHtcbiAgICAgICAgICB0aGlzLl9zZXQoJ2NoaWxkS2V5TWFwJywgZGVsZXRlUHJvcGVydHkodGhpcy5fZGF0YS5jaGlsZEtleU1hcCwgY2hpbGRLZXkpKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICB0aGlzLl9zZXQoJ2NoaWxkS2V5TWFwJywgZGVsZXRlUHJvcGVydHkodGhpcy5fZGF0YS5jaGlsZEtleU1hcCwgcm9vdEtleSkpO1xuICAgIH1cbiAgICB0aGlzLl9zZXQoJ3Zjc1N0YXR1c2VzQnlSb290JywgZGVsZXRlUHJvcGVydHkodGhpcy5fZGF0YS52Y3NTdGF0dXNlc0J5Um9vdCwgcm9vdEtleSkpO1xuICB9XG5cbiAgX3NldFRyYWNrZWROb2RlKHJvb3RLZXk6IHN0cmluZywgbm9kZUtleTogc3RyaW5nKTogdm9pZCB7XG4gICAgLy8gRmx1c2ggdGhlIHZhbHVlIHRvIGVuc3VyZSBjbGllbnRzIHNlZSB0aGUgdmFsdWUgYXQgbGVhc3Qgb25jZSBhbmQgc2Nyb2xsIGFwcHJvcHJpYXRlbHkuXG4gICAgdGhpcy5fc2V0KCd0cmFja2VkTm9kZScsIHtub2RlS2V5LCByb290S2V5fSwgdHJ1ZSk7XG4gIH1cblxuICBfc2V0UmVwb3NpdG9yaWVzKHJlcG9zaXRvcmllczogSW1tdXRhYmxlLlNldDxhdG9tJFJlcG9zaXRvcnk+KTogdm9pZCB7XG4gICAgdGhpcy5fc2V0KCdyZXBvc2l0b3JpZXMnLCByZXBvc2l0b3JpZXMpO1xuXG4gICAgLy8gV2hlbmV2ZXIgYSBuZXcgc2V0IG9mIHJlcG9zaXRvcmllcyBjb21lcyBpbiwgaW52YWxpZGF0ZSBvdXIgcGF0aHMgY2FjaGUgYnkgcmVzZXR0aW5nIGl0c1xuICAgIC8vIGBjYWNoZWAgcHJvcGVydHkgKGNyZWF0ZWQgYnkgbG9kYXNoLm1lbW9pemUpIHRvIGFuIGVtcHR5IG1hcC5cbiAgICB0aGlzLl9yZXBvc2l0b3J5Rm9yUGF0aC5jYWNoZSA9IG5ldyBNYXAoKTtcbiAgfVxuXG4gIF9vbWl0SGlkZGVuUGF0aHMobm9kZUtleXM6IEFycmF5PHN0cmluZz4pOiBBcnJheTxzdHJpbmc+IHtcbiAgICBpZiAoIXRoaXMuX2RhdGEuaGlkZUlnbm9yZWROYW1lcyAmJiAhdGhpcy5fZGF0YS5leGNsdWRlVmNzSWdub3JlZFBhdGhzKSB7XG4gICAgICByZXR1cm4gbm9kZUtleXM7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5vZGVLZXlzLmZpbHRlcihub2RlS2V5ID0+ICF0aGlzLl9zaG91bGRIaWRlUGF0aChub2RlS2V5KSk7XG4gIH1cblxuICBfc2hvdWxkSGlkZVBhdGgobm9kZUtleTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgY29uc3Qge2hpZGVJZ25vcmVkTmFtZXMsIGV4Y2x1ZGVWY3NJZ25vcmVkUGF0aHMsIGlnbm9yZWRQYXR0ZXJuc30gPSB0aGlzLl9kYXRhO1xuICAgIGlmIChoaWRlSWdub3JlZE5hbWVzICYmIG1hdGNoZXNTb21lKG5vZGVLZXksIGlnbm9yZWRQYXR0ZXJucykpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBpZiAoZXhjbHVkZVZjc0lnbm9yZWRQYXRocyAmJiBpc1Zjc0lnbm9yZWQobm9kZUtleSwgdGhpcy5fcmVwb3NpdG9yeUZvclBhdGgobm9kZUtleSkpKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcmVzZXQoKTogdm9pZCB7XG4gICAgY29uc3Qgc3Vic2NyaXB0aW9uTWFwID0gdGhpcy5fZGF0YS5zdWJzY3JpcHRpb25NYXA7XG4gICAgZm9yIChjb25zdCBub2RlS2V5IG9mIE9iamVjdC5rZXlzKHN1YnNjcmlwdGlvbk1hcCkpIHtcbiAgICAgIGNvbnN0IHN1YnNjcmlwdGlvbiA9IHN1YnNjcmlwdGlvbk1hcFtub2RlS2V5XTtcbiAgICAgIGlmIChzdWJzY3JpcHRpb24pIHtcbiAgICAgICAgc3Vic2NyaXB0aW9uLmRpc3Bvc2UoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBSZXNldCBkYXRhIHN0b3JlLlxuICAgIHRoaXMuX2RhdGEgPSB0aGlzLl9nZXREZWZhdWx0cygpO1xuICB9XG5cbiAgc3Vic2NyaWJlKGxpc3RlbmVyOiBDaGFuZ2VMaXN0ZW5lcik6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5fZW1pdHRlci5vbignY2hhbmdlJywgbGlzdGVuZXIpO1xuICB9XG59XG5cbi8vIEEgaGVscGVyIHRvIGRlbGV0ZSBhIHByb3BlcnR5IGluIGFuIG9iamVjdCB1c2luZyBzaGFsbG93IGNvcHkgcmF0aGVyIHRoYW4gbXV0YXRpb25cbmZ1bmN0aW9uIGRlbGV0ZVByb3BlcnR5KG9iamVjdDogT2JqZWN0LCBrZXk6IHN0cmluZyk6IE9iamVjdCB7XG4gIGlmICghb2JqZWN0Lmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICByZXR1cm4gb2JqZWN0O1xuICB9XG4gIGNvbnN0IG5ld09iamVjdCA9IHsuLi5vYmplY3R9O1xuICBkZWxldGUgbmV3T2JqZWN0W2tleV07XG4gIHJldHVybiBuZXdPYmplY3Q7XG59XG5cbi8vIEEgaGVscGVyIHRvIHNldCBhIHByb3BlcnR5IGluIGFuIG9iamVjdCB1c2luZyBzaGFsbG93IGNvcHkgcmF0aGVyIHRoYW4gbXV0YXRpb25cbmZ1bmN0aW9uIHNldFByb3BlcnR5KG9iamVjdDogT2JqZWN0LCBrZXk6IHN0cmluZywgbmV3VmFsdWU6IG1peGVkKTogT2JqZWN0IHtcbiAgY29uc3Qgb2xkVmFsdWUgPSBvYmplY3Rba2V5XTtcbiAgaWYgKG9sZFZhbHVlID09PSBuZXdWYWx1ZSkge1xuICAgIHJldHVybiBvYmplY3Q7XG4gIH1cbiAgY29uc3QgbmV3T2JqZWN0ID0gey4uLm9iamVjdH07XG4gIG5ld09iamVjdFtrZXldID0gbmV3VmFsdWU7XG4gIHJldHVybiBuZXdPYmplY3Q7XG59XG5cbi8vIENyZWF0ZSBhIG5ldyBvYmplY3QgYnkgbWFwcGluZyBvdmVyIHRoZSBwcm9wZXJ0aWVzIG9mIGEgZ2l2ZW4gb2JqZWN0LCBjYWxsaW5nIHRoZSBnaXZlblxuLy8gZnVuY3Rpb24gb24gZWFjaCBvbmUuXG5mdW5jdGlvbiBtYXBWYWx1ZXMob2JqZWN0OiBPYmplY3QsIGZuOiBGdW5jdGlvbik6IE9iamVjdCB7XG4gIGNvbnN0IG5ld09iamVjdCA9IHt9O1xuICBPYmplY3Qua2V5cyhvYmplY3QpLmZvckVhY2goa2V5ID0+IHtcbiAgICBuZXdPYmplY3Rba2V5XSA9IGZuKG9iamVjdFtrZXldLCBrZXkpO1xuICB9KTtcbiAgcmV0dXJuIG5ld09iamVjdDtcbn1cblxuLy8gRGV0ZXJtaW5lIHdoZXRoZXIgdGhlIGdpdmVuIHN0cmluZyBtYXRjaGVzIGFueSBvZiBhIHNldCBvZiBwYXR0ZXJucy5cbmZ1bmN0aW9uIG1hdGNoZXNTb21lKHN0cjogc3RyaW5nLCBwYXR0ZXJuczogSW1tdXRhYmxlLlNldDxNaW5pbWF0Y2g+KSB7XG4gIHJldHVybiBwYXR0ZXJucy5zb21lKHBhdHRlcm4gPT4gcGF0dGVybi5tYXRjaChzdHIpKTtcbn1cblxuZnVuY3Rpb24gaXNWY3NJZ25vcmVkKG5vZGVLZXk6IHN0cmluZywgcmVwbzogP2F0b20kUmVwb3NpdG9yeSkge1xuICByZXR1cm4gcmVwbyAmJiByZXBvLmlzUHJvamVjdEF0Um9vdCgpICYmIHJlcG8uaXNQYXRoSWdub3JlZChub2RlS2V5KTtcbn1cblxuXG4vKipcbiAqIFBlcmZvcm1zIGEgYnJlYWR0aC1maXJzdCBpdGVyYXRpb24gb3ZlciB0aGUgZGlyZWN0b3JpZXMgb2YgdGhlIHRyZWUgc3RhcnRpbmdcbiAqIHdpdGggYSBnaXZlbiBub2RlLiBUaGUgaXRlcmF0aW9uIHN0b3BzIG9uY2UgYSBnaXZlbiBsaW1pdCBvZiBub2RlcyAoYm90aCBkaXJlY3Rvcmllc1xuICogYW5kIGZpbGVzKSB3ZXJlIHRyYXZlcnNlZC5cbiAqIFRoZSBub2RlIGJlaW5nIGN1cnJlbnRseSB0cmF2ZXJzZWQgY2FuIGJlIG9idGFpbmVkIGJ5IGNhbGxpbmcgLnRyYXZlcnNlZE5vZGUoKVxuICogLm5leHQoKSByZXR1cm5zIGEgcHJvbWlzZSB0aGF0IGlzIGZ1bGZpbGxlZCB3aGVuIHRoZSB0cmF2ZXJzYWwgbW92ZXMgb24gdG9cbiAqIHRoZSBuZXh0IGRpcmVjdG9yeS5cbiAqL1xuY2xhc3MgRmlsZVRyZWVTdG9yZUJmc0l0ZXJhdG9yIHtcbiAgX2ZpbGVUcmVlU3RvcmU6IEZpbGVUcmVlU3RvcmU7XG4gIF9yb290S2V5OiBzdHJpbmc7XG4gIF9ub2Rlc1RvVHJhdmVyc2U6IEFycmF5PHN0cmluZz47XG4gIF9jdXJyZW50bHlUcmF2ZXJzZWROb2RlOiA/c3RyaW5nO1xuICBfbGltaXQ6IG51bWJlcjtcbiAgX251bU5vZGVzVHJhdmVyc2VkOiBudW1iZXI7XG4gIF9wcm9taXNlOiA/UHJvbWlzZTx2b2lkPjtcbiAgX2NvdW50OiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBmaWxlVHJlZVN0b3JlOiBGaWxlVHJlZVN0b3JlLFxuICAgICAgcm9vdEtleTogc3RyaW5nLFxuICAgICAgbm9kZUtleTogc3RyaW5nLFxuICAgICAgbGltaXQ6IG51bWJlcikge1xuICAgIHRoaXMuX2ZpbGVUcmVlU3RvcmUgPSBmaWxlVHJlZVN0b3JlO1xuICAgIHRoaXMuX3Jvb3RLZXkgPSByb290S2V5O1xuICAgIHRoaXMuX25vZGVzVG9UcmF2ZXJzZSA9IFtdO1xuICAgIHRoaXMuX2N1cnJlbnRseVRyYXZlcnNlZE5vZGUgPSBub2RlS2V5O1xuICAgIHRoaXMuX2xpbWl0ID0gbGltaXQ7XG4gICAgdGhpcy5fbnVtTm9kZXNUcmF2ZXJzZWQgPSAwO1xuICAgIHRoaXMuX3Byb21pc2UgPSBudWxsO1xuICAgIHRoaXMuX2NvdW50ID0gMDtcbiAgfVxuXG4gIF9oYW5kbGVQcm9taXNlUmVzb2x1dGlvbihjaGlsZHJlbktleXM6IEFycmF5PHN0cmluZz4pOiB2b2lkIHtcbiAgICB0aGlzLl9udW1Ob2Rlc1RyYXZlcnNlZCArPSBjaGlsZHJlbktleXMubGVuZ3RoO1xuICAgIGlmICh0aGlzLl9udW1Ob2Rlc1RyYXZlcnNlZCA8IHRoaXMuX2xpbWl0KSB7XG4gICAgICBjb25zdCBuZXh0TGV2ZWxOb2RlcyA9IGNoaWxkcmVuS2V5cy5maWx0ZXIoY2hpbGRLZXkgPT4gRmlsZVRyZWVIZWxwZXJzLmlzRGlyS2V5KGNoaWxkS2V5KSk7XG4gICAgICB0aGlzLl9ub2Rlc1RvVHJhdmVyc2UgPSB0aGlzLl9ub2Rlc1RvVHJhdmVyc2UuY29uY2F0KG5leHRMZXZlbE5vZGVzKTtcblxuICAgICAgdGhpcy5fY3VycmVudGx5VHJhdmVyc2VkTm9kZSA9IHRoaXMuX25vZGVzVG9UcmF2ZXJzZS5zcGxpY2UoMCwgMSlbMF07XG4gICAgICB0aGlzLl9wcm9taXNlID0gbnVsbDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fY3VycmVudGx5VHJhdmVyc2VkTm9kZSA9IG51bGw7XG4gICAgICB0aGlzLl9wcm9taXNlID0gbnVsbDtcbiAgICB9XG5cbiAgICByZXR1cm47XG4gIH1cblxuICBuZXh0KCk6ID9Qcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBjdXJyZW50bHlUcmF2ZXJzZWROb2RlID0gdGhpcy5fY3VycmVudGx5VHJhdmVyc2VkTm9kZTtcbiAgICBpZiAoIXRoaXMuX3Byb21pc2UgJiYgY3VycmVudGx5VHJhdmVyc2VkTm9kZSkge1xuICAgICAgdGhpcy5fcHJvbWlzZSA9IHRoaXMuX2ZpbGVUcmVlU3RvcmUucHJvbWlzZU5vZGVDaGlsZEtleXMoXG4gICAgICAgIHRoaXMuX3Jvb3RLZXksXG4gICAgICAgIGN1cnJlbnRseVRyYXZlcnNlZE5vZGUpXG4gICAgICAudGhlbih0aGlzLl9oYW5kbGVQcm9taXNlUmVzb2x1dGlvbi5iaW5kKHRoaXMpKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX3Byb21pc2U7XG4gIH1cblxuICB0cmF2ZXJzZWROb2RlKCk6ID9zdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9jdXJyZW50bHlUcmF2ZXJzZWROb2RlO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRmlsZVRyZWVTdG9yZTtcbiJdfQ==