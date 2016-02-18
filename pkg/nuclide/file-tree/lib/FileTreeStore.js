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

var _remoteUri = require('../../remote-uri');

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
        var filePath = (0, _remoteUri.getPath)(file.getPath());
        var repository = (0, _hgGitBridge.repositoryForPath)(file.getPath());
        if (repository != null && repository.getType() === 'hg') {
          var hgRepository = repository;
          var success = yield hgRepository.remove(filePath);
          if (success) {
            return;
          } else {
            atom.notifications.addError('Failed to remove ' + filePath + ' from version control.  The file will still get ' + 'deleted but you will have to remove it from your VCS yourself.');
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
//# sourceMappingURL=data:application/json;base64,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LENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFDOztBQUVyRSxZQUFJLENBQUMsdUJBQXVCLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDckUsWUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7T0FDdEIsTUFBTTtBQUNMLFlBQUksQ0FBQyx1QkFBdUIsR0FBRyxJQUFJLENBQUM7QUFDcEMsWUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7T0FDdEI7O0FBRUQsYUFBTztLQUNSOzs7V0FFRyxnQkFBbUI7QUFDckIsVUFBTSxzQkFBc0IsR0FBRyxJQUFJLENBQUMsdUJBQXVCLENBQUM7QUFDNUQsVUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLElBQUksc0JBQXNCLEVBQUU7QUFDNUMsWUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLG9CQUFvQixDQUN0RCxJQUFJLENBQUMsUUFBUSxFQUNiLHNCQUFzQixDQUFDLENBQ3hCLElBQUksQ0FBQyxJQUFJLENBQUMsd0JBQXdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7T0FDakQ7QUFDRCxhQUFPLElBQUksQ0FBQyxRQUFRLENBQUM7S0FDdEI7OztXQUVZLHlCQUFZO0FBQ3ZCLGFBQU8sSUFBSSxDQUFDLHVCQUF1QixDQUFDO0tBQ3JDOzs7U0F0REcsd0JBQXdCOzs7QUF5RDlCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsYUFBYSxDQUFDIiwiZmlsZSI6IkZpbGVUcmVlU3RvcmUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7SGdSZXBvc2l0b3J5Q2xpZW50fSBmcm9tICcuLi8uLi9oZy1yZXBvc2l0b3J5LWNsaWVudCc7XG5pbXBvcnQgdHlwZSB7XG4gIFJlbW90ZURpcmVjdG9yeSxcbiAgUmVtb3RlRmlsZSxcbn0gZnJvbSAnLi4vLi4vcmVtb3RlLWNvbm5lY3Rpb24nO1xuXG5pbXBvcnQgRmlsZVRyZWVEaXNwYXRjaGVyIGZyb20gJy4vRmlsZVRyZWVEaXNwYXRjaGVyJztcbmltcG9ydCBGaWxlVHJlZUhlbHBlcnMgZnJvbSAnLi9GaWxlVHJlZUhlbHBlcnMnO1xuaW1wb3J0IEZpbGVUcmVlTm9kZSBmcm9tICcuL0ZpbGVUcmVlTm9kZSc7XG5pbXBvcnQgSW1tdXRhYmxlIGZyb20gJ2ltbXV0YWJsZSc7XG5pbXBvcnQge0FjdGlvblR5cGV9IGZyb20gJy4vRmlsZVRyZWVDb25zdGFudHMnO1xuaW1wb3J0IHtEaXNwb3NhYmxlLCBFbWl0dGVyfSBmcm9tICdhdG9tJztcbmltcG9ydCB7TWluaW1hdGNofSBmcm9tICdtaW5pbWF0Y2gnO1xuaW1wb3J0IHtnZXRQYXRofSBmcm9tICcuLi8uLi9yZW1vdGUtdXJpJztcbmltcG9ydCB7cmVwb3NpdG9yeUNvbnRhaW5zUGF0aH0gZnJvbSAnLi4vLi4vaGctZ2l0LWJyaWRnZSc7XG5pbXBvcnQge3JlcG9zaXRvcnlGb3JQYXRofSBmcm9tICcuLi8uLi9oZy1naXQtYnJpZGdlJztcblxuaW1wb3J0IHthcnJheX0gZnJvbSAnLi4vLi4vY29tbW9ucyc7XG5pbXBvcnQge2dldExvZ2dlcn0gZnJvbSAnLi4vLi4vbG9nZ2luZyc7XG5pbXBvcnQge29iamVjdCBhcyBvYmplY3RVdGlsfSBmcm9tICcuLi8uLi9jb21tb25zJztcbmltcG9ydCBzaGVsbCBmcm9tICdzaGVsbCc7XG5pbXBvcnQgbWVtb2l6ZSBmcm9tICdsb2Rhc2gubWVtb2l6ZSc7XG5cbi8vIFVzZWQgdG8gZW5zdXJlIHRoZSB2ZXJzaW9uIHdlIHNlcmlhbGl6ZWQgaXMgdGhlIHNhbWUgdmVyc2lvbiB3ZSBhcmUgZGVzZXJpYWxpemluZy5cbmNvbnN0IFZFUlNJT04gPSAxO1xuXG5pbXBvcnQgdHlwZSB7RGlzcGF0Y2hlcn0gZnJvbSAnZmx1eCc7XG5pbXBvcnQgdHlwZSB7TnVjbGlkZVVyaX0gZnJvbSAnLi4vLi4vcmVtb3RlLXVyaSc7XG5cbnR5cGUgQWN0aW9uUGF5bG9hZCA9IE9iamVjdDtcbnR5cGUgQ2hhbmdlTGlzdGVuZXIgPSAoKSA9PiBtaXhlZDtcbnR5cGUgRmlsZVRyZWVOb2RlRGF0YSA9IHtcbiAgbm9kZUtleTogc3RyaW5nLFxuICByb290S2V5OiBzdHJpbmcsXG59XG5cbnR5cGUgU3RvcmVEYXRhID0ge1xuICBjaGlsZEtleU1hcDogeyBba2V5OiBzdHJpbmddOiBBcnJheTxzdHJpbmc+IH0sXG4gIGlzRGlydHlNYXA6IHsgW2tleTogc3RyaW5nXTogYm9vbGVhbiB9LFxuICBleHBhbmRlZEtleXNCeVJvb3Q6IHsgW2tleTogc3RyaW5nXTogSW1tdXRhYmxlLlNldDxzdHJpbmc+IH0sXG4gIHRyYWNrZWROb2RlOiA/RmlsZVRyZWVOb2RlRGF0YSxcbiAgLy8gU2F2ZXMgYSBsaXN0IG9mIGNoaWxkIG5vZGVzIHRoYXQgc2hvdWxkIGJlIGV4cGFuZGUgd2hlbiBhIGdpdmVuIGtleSBpcyBleHBhbmRlZC5cbiAgLy8gTG9va3MgbGlrZTogeyByb290S2V5OiB7IG5vZGVLZXk6IFtjaGlsZEtleTEsIGNoaWxkS2V5Ml0gfSB9LlxuICBwcmV2aW91c2x5RXhwYW5kZWQ6IHsgW3Jvb3RLZXk6IHN0cmluZ106IEltbXV0YWJsZS5NYXA8c3RyaW5nLCBBcnJheTxTdHJpbmc+PiB9LFxuICBpc0xvYWRpbmdNYXA6IHsgW2tleTogc3RyaW5nXTogP1Byb21pc2UgfSxcbiAgcm9vdEtleXM6IEFycmF5PHN0cmluZz4sXG4gIHNlbGVjdGVkS2V5c0J5Um9vdDogeyBba2V5OiBzdHJpbmddOiBJbW11dGFibGUuT3JkZXJlZFNldDxzdHJpbmc+IH0sXG4gIHN1YnNjcmlwdGlvbk1hcDogeyBba2V5OiBzdHJpbmddOiBEaXNwb3NhYmxlIH0sXG4gIHZjc1N0YXR1c2VzQnlSb290OiB7IFtrZXk6IHN0cmluZ106IEltbXV0YWJsZS5NYXA8c3RyaW5nLCBudW1iZXI+IH0sXG4gIGlnbm9yZWRQYXR0ZXJuczogSW1tdXRhYmxlLlNldDxNaW5pbWF0Y2g+LFxuICBoaWRlSWdub3JlZE5hbWVzOiBib29sZWFuLFxuICBleGNsdWRlVmNzSWdub3JlZFBhdGhzOiBib29sZWFuLFxuICB1c2VQcmV2aWV3VGFiczogYm9vbGVhbixcbiAgcmVwb3NpdG9yaWVzOiBJbW11dGFibGUuU2V0PGF0b20kUmVwb3NpdG9yeT4sXG59O1xuXG5leHBvcnQgdHlwZSBFeHBvcnRTdG9yZURhdGEgPSB7XG4gIGNoaWxkS2V5TWFwOiB7IFtrZXk6IHN0cmluZ106IEFycmF5PHN0cmluZz4gfSxcbiAgZXhwYW5kZWRLZXlzQnlSb290OiB7IFtrZXk6IHN0cmluZ106IEFycmF5PHN0cmluZz4gfSxcbiAgcm9vdEtleXM6IEFycmF5PHN0cmluZz4sXG4gIHNlbGVjdGVkS2V5c0J5Um9vdDogeyBba2V5OiBzdHJpbmddOiBBcnJheTxzdHJpbmc+IH0sXG4gIHZlcnNpb246IG51bWJlcixcbn07XG5cbmxldCBpbnN0YW5jZTogP09iamVjdDtcblxuLyoqXG4gKiBJbXBsZW1lbnRzIHRoZSBGbHV4IHBhdHRlcm4gZm9yIG91ciBmaWxlIHRyZWUuIEFsbCBzdGF0ZSBmb3IgdGhlIGZpbGUgdHJlZSB3aWxsIGJlIGtlcHQgaW5cbiAqIEZpbGVUcmVlU3RvcmUgYW5kIHRoZSBvbmx5IHdheSB0byB1cGRhdGUgdGhlIHN0b3JlIGlzIHRocm91Z2ggbWV0aG9kcyBvbiBGaWxlVHJlZUFjdGlvbnMuIFRoZVxuICogZGlzcGF0Y2hlciBpcyBhIG1lY2hhbmlzbSB0aHJvdWdoIHdoaWNoIEZpbGVUcmVlQWN0aW9ucyBpbnRlcmZhY2VzIHdpdGggRmlsZVRyZWVTdG9yZS5cbiAqL1xuY2xhc3MgRmlsZVRyZWVTdG9yZSB7XG4gIF9kYXRhOiBTdG9yZURhdGE7XG4gIF9kaXNwYXRjaGVyOiBEaXNwYXRjaGVyO1xuICBfZW1pdHRlcjogRW1pdHRlcjtcbiAgX2xvZ2dlcjogYW55O1xuICBfdGltZXI6ID9PYmplY3Q7XG4gIF9yZXBvc2l0b3J5Rm9yUGF0aDogKHBhdGg6IE51Y2xpZGVVcmkpID0+ID9hdG9tJFJlcG9zaXRvcnk7XG5cbiAgc3RhdGljIGdldEluc3RhbmNlKCk6IEZpbGVUcmVlU3RvcmUge1xuICAgIGlmICghaW5zdGFuY2UpIHtcbiAgICAgIGluc3RhbmNlID0gbmV3IEZpbGVUcmVlU3RvcmUoKTtcbiAgICB9XG4gICAgcmV0dXJuIGluc3RhbmNlO1xuICB9XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5fZGF0YSA9IHRoaXMuX2dldERlZmF1bHRzKCk7XG4gICAgdGhpcy5fZGlzcGF0Y2hlciA9IEZpbGVUcmVlRGlzcGF0Y2hlci5nZXRJbnN0YW5jZSgpO1xuICAgIHRoaXMuX2VtaXR0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIucmVnaXN0ZXIoXG4gICAgICBwYXlsb2FkID0+IHRoaXMuX29uRGlzcGF0Y2gocGF5bG9hZClcbiAgICApO1xuICAgIHRoaXMuX2xvZ2dlciA9IGdldExvZ2dlcigpO1xuICAgIHRoaXMuX3JlcG9zaXRvcnlGb3JQYXRoID0gbWVtb2l6ZSh0aGlzLl9yZXBvc2l0b3J5Rm9yUGF0aCk7XG4gIH1cblxuICAvKipcbiAgICogVE9ETzogTW92ZSB0byBhIFtzZXJpYWxpemF0aW9uIGNsYXNzXVsxXSBhbmQgdXNlIHRoZSBidWlsdC1pbiB2ZXJzaW9uaW5nIG1lY2hhbmlzbS4gVGhpcyBtaWdodFxuICAgKiBuZWVkIHRvIGJlIGRvbmUgb25lIGxldmVsIGhpZ2hlciB3aXRoaW4gbWFpbi5qcy5cbiAgICpcbiAgICogWzFdOiBodHRwczovL2F0b20uaW8vZG9jcy9sYXRlc3QvYmVoaW5kLWF0b20tc2VyaWFsaXphdGlvbi1pbi1hdG9tXG4gICAqL1xuICBleHBvcnREYXRhKCk6IEV4cG9ydFN0b3JlRGF0YSB7XG4gICAgY29uc3QgZGF0YSA9IHRoaXMuX2RhdGE7XG4gICAgLy8gR3JhYiB0aGUgY2hpbGQga2V5cyBvZiBvbmx5IHRoZSBleHBhbmRlZCBub2Rlcy5cbiAgICBjb25zdCBjaGlsZEtleU1hcCA9IHt9O1xuICAgIE9iamVjdC5rZXlzKGRhdGEuZXhwYW5kZWRLZXlzQnlSb290KS5mb3JFYWNoKHJvb3RLZXkgPT4ge1xuICAgICAgY29uc3QgZXhwYW5kZWRLZXlTZXQgPSBkYXRhLmV4cGFuZGVkS2V5c0J5Um9vdFtyb290S2V5XTtcbiAgICAgIGZvciAoY29uc3Qgbm9kZUtleSBvZiBleHBhbmRlZEtleVNldCkge1xuICAgICAgICBjaGlsZEtleU1hcFtub2RlS2V5XSA9IGRhdGEuY2hpbGRLZXlNYXBbbm9kZUtleV07XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHtcbiAgICAgIHZlcnNpb246IFZFUlNJT04sXG4gICAgICBjaGlsZEtleU1hcDogY2hpbGRLZXlNYXAsXG4gICAgICBleHBhbmRlZEtleXNCeVJvb3Q6IG1hcFZhbHVlcyhkYXRhLmV4cGFuZGVkS2V5c0J5Um9vdCwga2V5U2V0ID0+IGtleVNldC50b0FycmF5KCkpLFxuICAgICAgcm9vdEtleXM6IGRhdGEucm9vdEtleXMsXG4gICAgICBzZWxlY3RlZEtleXNCeVJvb3Q6IG1hcFZhbHVlcyhkYXRhLnNlbGVjdGVkS2V5c0J5Um9vdCwga2V5U2V0ID0+IGtleVNldC50b0FycmF5KCkpLFxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogSW1wb3J0cyBzdG9yZSBkYXRhIGZyb20gYSBwcmV2aW91cyBleHBvcnQuXG4gICAqL1xuICBsb2FkRGF0YShkYXRhOiBFeHBvcnRTdG9yZURhdGEpOiB2b2lkIHtcbiAgICAvLyBFbnN1cmUgd2UgYXJlIG5vdCB0cnlpbmcgdG8gbG9hZCBkYXRhIGZyb20gYW4gZWFybGllciB2ZXJzaW9uIG9mIHRoaXMgcGFja2FnZS5cbiAgICBpZiAoZGF0YS52ZXJzaW9uICE9PSBWRVJTSU9OKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuX2RhdGEgPSB7XG4gICAgICAuLi50aGlzLl9nZXREZWZhdWx0cygpLFxuICAgICAgY2hpbGRLZXlNYXA6IGRhdGEuY2hpbGRLZXlNYXAsXG4gICAgICBleHBhbmRlZEtleXNCeVJvb3Q6IG1hcFZhbHVlcyhkYXRhLmV4cGFuZGVkS2V5c0J5Um9vdCwga2V5cyA9PiBuZXcgSW1tdXRhYmxlLlNldChrZXlzKSksXG4gICAgICByb290S2V5czogZGF0YS5yb290S2V5cyxcbiAgICAgIHNlbGVjdGVkS2V5c0J5Um9vdDpcbiAgICAgICAgbWFwVmFsdWVzKGRhdGEuc2VsZWN0ZWRLZXlzQnlSb290LCBrZXlzID0+IG5ldyBJbW11dGFibGUuT3JkZXJlZFNldChrZXlzKSksXG4gICAgfTtcbiAgICBPYmplY3Qua2V5cyhkYXRhLmNoaWxkS2V5TWFwKS5mb3JFYWNoKG5vZGVLZXkgPT4ge1xuICAgICAgdGhpcy5fYWRkU3Vic2NyaXB0aW9uKG5vZGVLZXkpO1xuICAgICAgdGhpcy5fZmV0Y2hDaGlsZEtleXMobm9kZUtleSk7XG4gICAgfSk7XG4gIH1cblxuICBfc2V0RXhjbHVkZVZjc0lnbm9yZWRQYXRocyhleGNsdWRlVmNzSWdub3JlZFBhdGhzOiBib29sZWFuKTogdm9pZCB7XG4gICAgdGhpcy5fc2V0KCdleGNsdWRlVmNzSWdub3JlZFBhdGhzJywgZXhjbHVkZVZjc0lnbm9yZWRQYXRocyk7XG4gIH1cblxuICBfc2V0SGlkZUlnbm9yZWROYW1lcyhoaWRlSWdub3JlZE5hbWVzOiBib29sZWFuKTogdm9pZCB7XG4gICAgdGhpcy5fc2V0KCdoaWRlSWdub3JlZE5hbWVzJywgaGlkZUlnbm9yZWROYW1lcyk7XG4gIH1cblxuICAvKipcbiAgICogR2l2ZW4gYSBsaXN0IG9mIG5hbWVzIHRvIGlnbm9yZSwgY29tcGlsZSB0aGVtIGludG8gbWluaW1hdGNoIHBhdHRlcm5zIGFuZFxuICAgKiB1cGRhdGUgdGhlIHN0b3JlIHdpdGggdGhlbS5cbiAgICovXG4gIF9zZXRJZ25vcmVkTmFtZXMoaWdub3JlZE5hbWVzOiBBcnJheTxzdHJpbmc+KSB7XG4gICAgY29uc3QgaWdub3JlZFBhdHRlcm5zID0gSW1tdXRhYmxlLlNldChpZ25vcmVkTmFtZXMpXG4gICAgICAubWFwKGlnbm9yZWROYW1lID0+IHtcbiAgICAgICAgaWYgKGlnbm9yZWROYW1lID09PSAnJykge1xuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgcmV0dXJuIG5ldyBNaW5pbWF0Y2goaWdub3JlZE5hbWUsIHttYXRjaEJhc2U6IHRydWUsIGRvdDogdHJ1ZX0pO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKFxuICAgICAgICAgICAgYEVycm9yIHBhcnNpbmcgcGF0dGVybiAnJHtpZ25vcmVkTmFtZX0nIGZyb20gXCJTZXR0aW5nc1wiID4gXCJJZ25vcmVkIE5hbWVzXCJgLFxuICAgICAgICAgICAge2RldGFpbDogZXJyb3IubWVzc2FnZX0sXG4gICAgICAgICAgKTtcbiAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIC5maWx0ZXIocGF0dGVybiA9PiBwYXR0ZXJuICE9IG51bGwpO1xuICAgIHRoaXMuX3NldCgnaWdub3JlZFBhdHRlcm5zJywgaWdub3JlZFBhdHRlcm5zKTtcbiAgfVxuXG4gIF9nZXREZWZhdWx0cygpOiBTdG9yZURhdGEge1xuICAgIHJldHVybiB7XG4gICAgICBjaGlsZEtleU1hcDoge30sXG4gICAgICBpc0RpcnR5TWFwOiB7fSxcbiAgICAgIGV4cGFuZGVkS2V5c0J5Um9vdDoge30sXG4gICAgICB0cmFja2VkTm9kZTogbnVsbCxcbiAgICAgIHByZXZpb3VzbHlFeHBhbmRlZDoge30sXG4gICAgICBpc0xvYWRpbmdNYXA6IHt9LFxuICAgICAgcm9vdEtleXM6IFtdLFxuICAgICAgc2VsZWN0ZWRLZXlzQnlSb290OiB7fSxcbiAgICAgIHN1YnNjcmlwdGlvbk1hcDoge30sXG4gICAgICB2Y3NTdGF0dXNlc0J5Um9vdDoge30sXG4gICAgICBpZ25vcmVkUGF0dGVybnM6IEltbXV0YWJsZS5TZXQoKSxcbiAgICAgIGhpZGVJZ25vcmVkTmFtZXM6IHRydWUsXG4gICAgICBleGNsdWRlVmNzSWdub3JlZFBhdGhzOiB0cnVlLFxuICAgICAgdXNlUHJldmlld1RhYnM6IGZhbHNlLFxuICAgICAgcmVwb3NpdG9yaWVzOiBJbW11dGFibGUuU2V0KCksXG4gICAgfTtcbiAgfVxuXG4gIF9vbkRpc3BhdGNoKHBheWxvYWQ6IEFjdGlvblBheWxvYWQpOiB2b2lkIHtcbiAgICBzd2l0Y2ggKHBheWxvYWQuYWN0aW9uVHlwZSkge1xuICAgICAgY2FzZSBBY3Rpb25UeXBlLkRFTEVURV9TRUxFQ1RFRF9OT0RFUzpcbiAgICAgICAgdGhpcy5fZGVsZXRlU2VsZWN0ZWROb2RlcygpLmNhdGNoKGVycm9yID0+IHtcbiAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoJ0RlbGV0aW5nIG5vZGVzIGZhaWxlZCB3aXRoIGFuIGVycm9yOiAnICsgZXJyb3IudG9TdHJpbmcoKSk7XG4gICAgICAgIH0pO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQWN0aW9uVHlwZS5TRVRfVFJBQ0tFRF9OT0RFOlxuICAgICAgICB0aGlzLl9zZXRUcmFja2VkTm9kZShwYXlsb2FkLnJvb3RLZXksIHBheWxvYWQubm9kZUtleSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBBY3Rpb25UeXBlLlNFVF9ST09UX0tFWVM6XG4gICAgICAgIHRoaXMuX3NldFJvb3RLZXlzKHBheWxvYWQucm9vdEtleXMpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQWN0aW9uVHlwZS5FWFBBTkRfTk9ERTpcbiAgICAgICAgdGhpcy5fZXhwYW5kTm9kZShwYXlsb2FkLnJvb3RLZXksIHBheWxvYWQubm9kZUtleSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBBY3Rpb25UeXBlLkVYUEFORF9OT0RFX0RFRVA6XG4gICAgICAgIHRoaXMuX2V4cGFuZE5vZGVEZWVwKHBheWxvYWQucm9vdEtleSwgcGF5bG9hZC5ub2RlS2V5KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEFjdGlvblR5cGUuQ09MTEFQU0VfTk9ERTpcbiAgICAgICAgdGhpcy5fY29sbGFwc2VOb2RlKHBheWxvYWQucm9vdEtleSwgcGF5bG9hZC5ub2RlS2V5KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEFjdGlvblR5cGUuU0VUX0VYQ0xVREVfVkNTX0lHTk9SRURfUEFUSFM6XG4gICAgICAgIHRoaXMuX3NldEV4Y2x1ZGVWY3NJZ25vcmVkUGF0aHMocGF5bG9hZC5leGNsdWRlVmNzSWdub3JlZFBhdGhzKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEFjdGlvblR5cGUuU0VUX1VTRV9QUkVWSUVXX1RBQlM6XG4gICAgICAgIHRoaXMuX3NldFVzZVByZXZpZXdUYWJzKHBheWxvYWQudXNlUHJldmlld1RhYnMpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQWN0aW9uVHlwZS5DT0xMQVBTRV9OT0RFX0RFRVA6XG4gICAgICAgIHRoaXMuX3B1cmdlRGlyZWN0b3J5V2l0aGluQVJvb3QocGF5bG9hZC5yb290S2V5LCBwYXlsb2FkLm5vZGVLZXksIC8qIHVuc2VsZWN0ICovZmFsc2UpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQWN0aW9uVHlwZS5TRVRfSElERV9JR05PUkVEX05BTUVTOlxuICAgICAgICB0aGlzLl9zZXRIaWRlSWdub3JlZE5hbWVzKHBheWxvYWQuaGlkZUlnbm9yZWROYW1lcyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBBY3Rpb25UeXBlLlNFVF9JR05PUkVEX05BTUVTOlxuICAgICAgICB0aGlzLl9zZXRJZ25vcmVkTmFtZXMocGF5bG9hZC5pZ25vcmVkTmFtZXMpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQWN0aW9uVHlwZS5TRVRfU0VMRUNURURfTk9ERVNfRk9SX1JPT1Q6XG4gICAgICAgIHRoaXMuX3NldFNlbGVjdGVkS2V5cyhwYXlsb2FkLnJvb3RLZXksIHBheWxvYWQubm9kZUtleXMpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQWN0aW9uVHlwZS5TRVRfU0VMRUNURURfTk9ERVNfRk9SX1RSRUU6XG4gICAgICAgIHRoaXMuX3NldFNlbGVjdGVkS2V5c0J5Um9vdChwYXlsb2FkLnNlbGVjdGVkS2V5c0J5Um9vdCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBBY3Rpb25UeXBlLkNSRUFURV9DSElMRDpcbiAgICAgICAgdGhpcy5fY3JlYXRlQ2hpbGQocGF5bG9hZC5ub2RlS2V5LCBwYXlsb2FkLmNoaWxkS2V5KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEFjdGlvblR5cGUuU0VUX1ZDU19TVEFUVVNFUzpcbiAgICAgICAgdGhpcy5fc2V0VmNzU3RhdHVzZXMocGF5bG9hZC5yb290S2V5LCBwYXlsb2FkLnZjc1N0YXR1c2VzKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEFjdGlvblR5cGUuU0VUX1JFUE9TSVRPUklFUzpcbiAgICAgICAgdGhpcy5fc2V0UmVwb3NpdG9yaWVzKHBheWxvYWQucmVwb3NpdG9yaWVzKTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFRoaXMgaXMgYSBwcml2YXRlIG1ldGhvZCBiZWNhdXNlIGluIEZsdXggd2Ugc2hvdWxkIG5ldmVyIGV4dGVybmFsbHkgd3JpdGUgdG8gdGhlIGRhdGEgc3RvcmUuXG4gICAqIE9ubHkgYnkgcmVjZWl2aW5nIGFjdGlvbnMgKGZyb20gZGlzcGF0Y2hlcikgc2hvdWxkIHRoZSBkYXRhIHN0b3JlIGJlIGNoYW5nZWQuXG4gICAqIE5vdGU6IGBfc2V0YCBjYW4gYmUgY2FsbGVkIG11bHRpcGxlIHRpbWVzIHdpdGhpbiBvbmUgaXRlcmF0aW9uIG9mIGFuIGV2ZW50IGxvb3Agd2l0aG91dFxuICAgKiB0aHJhc2hpbmcgdGhlIFVJIGJlY2F1c2Ugd2UgYXJlIHVzaW5nIHNldEltbWVkaWF0ZSB0byBiYXRjaCBjaGFuZ2Ugbm90aWZpY2F0aW9ucywgZWZmZWN0aXZlbHlcbiAgICogbGV0dGluZyBvdXIgdmlld3MgcmUtcmVuZGVyIG9uY2UgZm9yIG11bHRpcGxlIGNvbnNlY3V0aXZlIHdyaXRlcy5cbiAgICovXG4gIF9zZXQoa2V5OiBzdHJpbmcsIHZhbHVlOiBtaXhlZCwgZmx1c2g6IGJvb2xlYW4gPSBmYWxzZSk6IHZvaWQge1xuICAgIGNvbnN0IG9sZERhdGEgPSB0aGlzLl9kYXRhO1xuICAgIC8vIEltbXV0YWJpbGl0eSBmb3IgdGhlIHdpbiFcbiAgICBjb25zdCBuZXdEYXRhID0gc2V0UHJvcGVydHkodGhpcy5fZGF0YSwga2V5LCB2YWx1ZSk7XG4gICAgaWYgKG5ld0RhdGEgIT09IG9sZERhdGEpIHtcbiAgICAgIHRoaXMuX2RhdGEgPSBuZXdEYXRhO1xuICAgICAgY2xlYXJJbW1lZGlhdGUodGhpcy5fdGltZXIpO1xuICAgICAgaWYgKGZsdXNoKSB7XG4gICAgICAgIC8vIElmIGBmbHVzaGAgaXMgdHJ1ZSwgZW1pdCB0aGUgY2hhbmdlIGltbWVkaWF0ZWx5LlxuICAgICAgICB0aGlzLl9lbWl0dGVyLmVtaXQoJ2NoYW5nZScpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gSWYgbm90IGZsdXNoaW5nLCBkZS1ib3VuY2UgdG8gcHJldmVudCBzdWNjZXNzaXZlIHVwZGF0ZXMgaW4gdGhlIHNhbWUgZXZlbnQgbG9vcC5cbiAgICAgICAgdGhpcy5fdGltZXIgPSBzZXRJbW1lZGlhdGUoKCkgPT4ge1xuICAgICAgICAgIHRoaXMuX2VtaXR0ZXIuZW1pdCgnY2hhbmdlJyk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGdldFRyYWNrZWROb2RlKCk6ID9GaWxlVHJlZU5vZGVEYXRhIHtcbiAgICByZXR1cm4gdGhpcy5fZGF0YS50cmFja2VkTm9kZTtcbiAgfVxuXG4gIGdldFJlcG9zaXRvcmllcygpOiBJbW11dGFibGUuU2V0PGF0b20kUmVwb3NpdG9yeT4ge1xuICAgIHJldHVybiB0aGlzLl9kYXRhLnJlcG9zaXRvcmllcztcbiAgfVxuXG4gIGdldFJvb3RLZXlzKCk6IEFycmF5PHN0cmluZz4ge1xuICAgIHJldHVybiB0aGlzLl9kYXRhLnJvb3RLZXlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGtleSBvZiB0aGUgKmZpcnN0KiByb290IG5vZGUgY29udGFpbmluZyB0aGUgZ2l2ZW4gbm9kZS5cbiAgICovXG4gIGdldFJvb3RGb3JLZXkobm9kZUtleTogc3RyaW5nKTogP3N0cmluZyB7XG4gICAgcmV0dXJuIGFycmF5LmZpbmQodGhpcy5fZGF0YS5yb290S2V5cywgcm9vdEtleSA9PiBub2RlS2V5LnN0YXJ0c1dpdGgocm9vdEtleSkpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgc3RvcmUgaGFzIG5vIGRhdGEsIGkuZS4gbm8gcm9vdHMsIG5vIGNoaWxkcmVuLlxuICAgKi9cbiAgaXNFbXB0eSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5nZXRSb290S2V5cygpLmxlbmd0aCA9PT0gMDtcbiAgfVxuXG4gIC8qKlxuICAgKiBOb3RlOiBXZSBhY3R1YWxseSBkb24ndCBuZWVkIHJvb3RLZXkgKGltcGxlbWVudGF0aW9uIGRldGFpbCkgYnV0IHdlIHRha2UgaXQgZm9yIGNvbnNpc3RlbmN5LlxuICAgKi9cbiAgaXNMb2FkaW5nKHJvb3RLZXk6IHN0cmluZywgbm9kZUtleTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuICEhdGhpcy5fZ2V0TG9hZGluZyhub2RlS2V5KTtcbiAgfVxuXG4gIGlzRXhwYW5kZWQocm9vdEtleTogc3RyaW5nLCBub2RlS2V5OiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0RXhwYW5kZWRLZXlzKHJvb3RLZXkpLmhhcyhub2RlS2V5KTtcbiAgfVxuXG4gIGlzUm9vdEtleShub2RlS2V5OiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fZGF0YS5yb290S2V5cy5pbmRleE9mKG5vZGVLZXkpICE9PSAtMTtcbiAgfVxuXG4gIGlzU2VsZWN0ZWQocm9vdEtleTogc3RyaW5nLCBub2RlS2V5OiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5nZXRTZWxlY3RlZEtleXMocm9vdEtleSkuaGFzKG5vZGVLZXkpO1xuICB9XG5cbiAgX3NldFZjc1N0YXR1c2VzKHJvb3RLZXk6IHN0cmluZywgdmNzU3RhdHVzZXM6IHtbcGF0aDogc3RyaW5nXTogbnVtYmVyfSkge1xuICAgIGNvbnN0IGltbXV0YWJsZVZjc1N0YXR1c2VzID0gbmV3IEltbXV0YWJsZS5NYXAodmNzU3RhdHVzZXMpO1xuICAgIGlmICghSW1tdXRhYmxlLmlzKGltbXV0YWJsZVZjc1N0YXR1c2VzLCB0aGlzLl9kYXRhLnZjc1N0YXR1c2VzQnlSb290W3Jvb3RLZXldKSkge1xuICAgICAgdGhpcy5fc2V0KFxuICAgICAgICAndmNzU3RhdHVzZXNCeVJvb3QnLFxuICAgICAgICBzZXRQcm9wZXJ0eSh0aGlzLl9kYXRhLnZjc1N0YXR1c2VzQnlSb290LCByb290S2V5LCBpbW11dGFibGVWY3NTdGF0dXNlcylcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgZ2V0VmNzU3RhdHVzQ29kZShyb290S2V5OiBzdHJpbmcsIG5vZGVLZXk6IHN0cmluZyk6ID9udW1iZXIge1xuICAgIGNvbnN0IG1hcCA9IHRoaXMuX2RhdGEudmNzU3RhdHVzZXNCeVJvb3Rbcm9vdEtleV07XG4gICAgaWYgKG1hcCkge1xuICAgICAgcmV0dXJuIG1hcC5nZXQobm9kZUtleSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuXG4gIF9zZXRVc2VQcmV2aWV3VGFicyh1c2VQcmV2aWV3VGFiczogYm9vbGVhbikge1xuICAgIHRoaXMuX3NldCgndXNlUHJldmlld1RhYnMnLCB1c2VQcmV2aWV3VGFicyk7XG4gIH1cblxuICB1c2VQcmV2aWV3VGFicygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fZGF0YS51c2VQcmV2aWV3VGFicztcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGtub3duIGNoaWxkIGtleXMgZm9yIHRoZSBnaXZlbiBgbm9kZUtleWAgYnV0IGRvZXMgbm90IHF1ZXVlIGEgZmV0Y2ggZm9yIG1pc3NpbmdcbiAgICogY2hpbGRyZW4gbGlrZSBgOjpnZXRDaGlsZEtleXNgLlxuICAgKi9cbiAgZ2V0Q2FjaGVkQ2hpbGRLZXlzKHJvb3RLZXk6IHN0cmluZywgbm9kZUtleTogc3RyaW5nKTogQXJyYXk8c3RyaW5nPiB7XG4gICAgcmV0dXJuIHRoaXMuX29taXRIaWRkZW5QYXRocyh0aGlzLl9kYXRhLmNoaWxkS2V5TWFwW25vZGVLZXldIHx8IFtdKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgbm9kZSBjaGlsZCBrZXlzIG1heSBlaXRoZXIgYmUgIGF2YWlsYWJsZSBpbW1lZGlhdGVseSAoY2FjaGVkKSwgb3JcbiAgICogcmVxdWlyZSBhbiBhc3luYyBmZXRjaC4gSWYgYWxsIG9mIHRoZSBjaGlsZHJlbiBhcmUgbmVlZGVkIGl0J3MgZWFzaWVyIHRvXG4gICAqIHJldHVybiBhcyBwcm9taXNlLCB0byBtYWtlIHRoZSBjYWxsZXIgb2JsaXZpb3VzIHRvIHRoZSB3YXkgY2hpbGRyZW4gd2VyZVxuICAgKiBmZXRjaGVkLlxuICAgKi9cbiAgcHJvbWlzZU5vZGVDaGlsZEtleXMocm9vdEtleTogc3RyaW5nLCBub2RlS2V5OiBzdHJpbmcpOiBQcm9taXNlIHtcbiAgICBjb25zdCBjYWNoZWRDaGlsZEtleXMgPSB0aGlzLmdldENoaWxkS2V5cyhyb290S2V5LCBub2RlS2V5KTtcbiAgICBpZiAoY2FjaGVkQ2hpbGRLZXlzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShjYWNoZWRDaGlsZEtleXMpO1xuICAgIH1cblxuICAgIGNvbnN0IHByb21pc2UgPSB0aGlzLl9nZXRMb2FkaW5nKG5vZGVLZXkpIHx8IFByb21pc2UucmVzb2x2ZSgpO1xuICAgIHJldHVybiBwcm9taXNlLnRoZW4oKCkgPT4gdGhpcy5nZXRDYWNoZWRDaGlsZEtleXMocm9vdEtleSwgbm9kZUtleSkpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMga25vd24gY2hpbGQga2V5cyBmb3IgdGhlIGdpdmVuIGBub2RlS2V5YCBhbmQgcXVldWVzIGEgZmV0Y2ggaWYgY2hpbGRyZW4gYXJlIG1pc3NpbmcuXG4gICAqL1xuICBnZXRDaGlsZEtleXMocm9vdEtleTogc3RyaW5nLCBub2RlS2V5OiBzdHJpbmcpOiBBcnJheTxzdHJpbmc+IHtcbiAgICBjb25zdCBjaGlsZEtleXMgPSB0aGlzLl9kYXRhLmNoaWxkS2V5TWFwW25vZGVLZXldO1xuICAgIGlmIChjaGlsZEtleXMgPT0gbnVsbCB8fCB0aGlzLl9kYXRhLmlzRGlydHlNYXBbbm9kZUtleV0pIHtcbiAgICAgIHRoaXMuX2ZldGNoQ2hpbGRLZXlzKG5vZGVLZXkpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvKlxuICAgICAgICogSWYgbm8gZGF0YSBuZWVkcyB0byBiZSBmZXRjaGVkLCB3aXBlIG91dCB0aGUgc2Nyb2xsaW5nIHN0YXRlIGJlY2F1c2Ugc3Vic2VxdWVudCB1cGRhdGVzXG4gICAgICAgKiBzaG91bGQgbm8gbG9uZ2VyIHNjcm9sbCB0aGUgdHJlZS4gVGhlIG5vZGUgd2lsbCBoYXZlIGFscmVhZHkgYmVlbiBmbHVzaGVkIHRvIHRoZSB2aWV3IGFuZFxuICAgICAgICogc2Nyb2xsZWQgdG8uXG4gICAgICAgKi9cbiAgICAgIHRoaXMuX2NoZWNrVHJhY2tlZE5vZGUoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX29taXRIaWRkZW5QYXRocyhjaGlsZEtleXMgfHwgW10pO1xuICB9XG5cbiAgZ2V0U2VsZWN0ZWRLZXlzKHJvb3RLZXk/OiBzdHJpbmcpOiBJbW11dGFibGUuT3JkZXJlZFNldDxzdHJpbmc+IHtcbiAgICBsZXQgc2VsZWN0ZWRLZXlzO1xuICAgIGlmIChyb290S2V5ID09IG51bGwpIHtcbiAgICAgIHNlbGVjdGVkS2V5cyA9IG5ldyBJbW11dGFibGUuT3JkZXJlZFNldCgpO1xuICAgICAgZm9yIChjb25zdCByb290IGluIHRoaXMuX2RhdGEuc2VsZWN0ZWRLZXlzQnlSb290KSB7XG4gICAgICAgIGlmICh0aGlzLl9kYXRhLnNlbGVjdGVkS2V5c0J5Um9vdC5oYXNPd25Qcm9wZXJ0eShyb290KSkge1xuICAgICAgICAgIHNlbGVjdGVkS2V5cyA9IHNlbGVjdGVkS2V5cy5tZXJnZSh0aGlzLl9kYXRhLnNlbGVjdGVkS2V5c0J5Um9vdFtyb290XSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gSWYgdGhlIGdpdmVuIGByb290S2V5YCBoYXMgbm8gc2VsZWN0ZWQga2V5cywgYXNzaWduIGFuIGVtcHR5IHNldCB0byBtYWludGFpbiBhIG5vbi1udWxsXG4gICAgICAvLyByZXR1cm4gdmFsdWUuXG4gICAgICBzZWxlY3RlZEtleXMgPSB0aGlzLl9kYXRhLnNlbGVjdGVkS2V5c0J5Um9vdFtyb290S2V5XSB8fCBuZXcgSW1tdXRhYmxlLk9yZGVyZWRTZXQoKTtcbiAgICB9XG4gICAgcmV0dXJuIHNlbGVjdGVkS2V5cztcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgbGlzdCBvZiB0aGUgbm9kZXMgdGhhdCBhcmUgY3VycmVudGx5IHZpc2libGUvZXhwYW5kZWQgaW4gdGhlIGZpbGUgdHJlZS5cbiAgICpcbiAgICogVGhpcyBtZXRob2QgcmV0dXJucyBhbiBhcnJheSBzeW5jaHJvbm91c2x5IChyYXRoZXIgdGhhbiBhbiBpdGVyYXRvcikgdG8gZW5zdXJlIHRoZSBjYWxsZXJcbiAgICogZ2V0cyBhIGNvbnNpc3RlbnQgc25hcHNob3Qgb2YgdGhlIGN1cnJlbnQgc3RhdGUgb2YgdGhlIGZpbGUgdHJlZS5cbiAgICovXG4gIGdldFZpc2libGVOb2Rlcyhyb290S2V5OiBzdHJpbmcpOiBBcnJheTxGaWxlVHJlZU5vZGU+IHtcbiAgICAvLyBEbyBzb21lIGJhc2ljIGNoZWNrcyB0byBlbnN1cmUgdGhhdCByb290S2V5IGNvcnJlc3BvbmRzIHRvIGEgcm9vdCBhbmQgaXMgZXhwYW5kZWQuIElmIG5vdCxcbiAgICAvLyByZXR1cm4gdGhlIGFwcHJvcHJpYXRlIGFycmF5LlxuICAgIGlmICghdGhpcy5pc1Jvb3RLZXkocm9vdEtleSkpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gICAgaWYgKCF0aGlzLmlzRXhwYW5kZWQocm9vdEtleSwgcm9vdEtleSkpIHtcbiAgICAgIHJldHVybiBbdGhpcy5nZXROb2RlKHJvb3RLZXksIHJvb3RLZXkpXTtcbiAgICB9XG5cbiAgICAvLyBOb3RlIHRoYXQgd2UgY291bGQgY2FjaGUgdGhlIHZpc2libGVOb2RlcyBhcnJheSBzbyB0aGF0IHdlIGRvIG5vdCBoYXZlIHRvIGNyZWF0ZSBpdCBmcm9tXG4gICAgLy8gc2NyYXRjaCBlYWNoIHRpbWUgdGhpcyBpcyBjYWxsZWQsIGJ1dCBpdCBkb2VzIG5vdCBhcHBlYXIgdG8gYmUgYSBib3R0bGVuZWNrIGF0IHByZXNlbnQuXG4gICAgY29uc3QgdmlzaWJsZU5vZGVzID0gW107XG4gICAgY29uc3Qgcm9vdEtleXNGb3JEaXJlY3Rvcmllc1RvRXhwbG9yZSA9IFtyb290S2V5XTtcbiAgICB3aGlsZSAocm9vdEtleXNGb3JEaXJlY3Rvcmllc1RvRXhwbG9yZS5sZW5ndGggIT09IDApIHtcbiAgICAgIGNvbnN0IGtleSA9IHJvb3RLZXlzRm9yRGlyZWN0b3JpZXNUb0V4cGxvcmUucG9wKCk7XG4gICAgICB2aXNpYmxlTm9kZXMucHVzaCh0aGlzLmdldE5vZGUoa2V5LCBrZXkpKTtcbiAgICAgIGNvbnN0IGNoaWxkS2V5cyA9IHRoaXMuX2RhdGEuY2hpbGRLZXlNYXBba2V5XTtcbiAgICAgIGlmIChjaGlsZEtleXMgPT0gbnVsbCB8fCB0aGlzLl9kYXRhLmlzRGlydHlNYXBba2V5XSkge1xuICAgICAgICAvLyBUaGlzIGlzIHdoZXJlIGdldENoaWxkS2V5cygpIHdvdWxkIGZldGNoLCBidXQgd2UgZG8gbm90IHdhbnQgdG8gZG8gdGhhdC5cbiAgICAgICAgLy8gVE9ETzogSWYga2V5IGlzIGluIGlzRGlydHlNYXAsIHRoZW4gcmV0cnkgd2hlbiBpdCBpcyBub3QgZGlydHk/XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBmb3IgKGNvbnN0IGNoaWxkS2V5IG9mIGNoaWxkS2V5cykge1xuICAgICAgICBpZiAoRmlsZVRyZWVIZWxwZXJzLmlzRGlyS2V5KGNoaWxkS2V5KSkge1xuICAgICAgICAgIGlmICh0aGlzLmlzRXhwYW5kZWQocm9vdEtleSwga2V5KSkge1xuICAgICAgICAgICAgcm9vdEtleXNGb3JEaXJlY3Rvcmllc1RvRXhwbG9yZS5wdXNoKGNoaWxkS2V5KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmlzaWJsZU5vZGVzLnB1c2godGhpcy5nZXROb2RlKGtleSwgY2hpbGRLZXkpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdmlzaWJsZU5vZGVzO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYWxsIHNlbGVjdGVkIG5vZGVzIGFjcm9zcyBhbGwgcm9vdHMgaW4gdGhlIHRyZWUuXG4gICAqL1xuICBnZXRTZWxlY3RlZE5vZGVzKCk6IEltbXV0YWJsZS5PcmRlcmVkU2V0PEZpbGVUcmVlTm9kZT4ge1xuICAgIGxldCBzZWxlY3RlZE5vZGVzID0gbmV3IEltbXV0YWJsZS5PcmRlcmVkU2V0KCk7XG4gICAgdGhpcy5fZGF0YS5yb290S2V5cy5mb3JFYWNoKHJvb3RLZXkgPT4ge1xuICAgICAgdGhpcy5nZXRTZWxlY3RlZEtleXMocm9vdEtleSkuZm9yRWFjaChub2RlS2V5ID0+IHtcbiAgICAgICAgc2VsZWN0ZWROb2RlcyA9IHNlbGVjdGVkTm9kZXMuYWRkKHRoaXMuZ2V0Tm9kZShyb290S2V5LCBub2RlS2V5KSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICByZXR1cm4gc2VsZWN0ZWROb2RlcztcbiAgfVxuXG4gIGdldFNpbmdsZVNlbGVjdGVkTm9kZSgpOiA/RmlsZVRyZWVOb2RlIHtcbiAgICBjb25zdCBzZWxlY3RlZFJvb3RzID0gT2JqZWN0LmtleXModGhpcy5fZGF0YS5zZWxlY3RlZEtleXNCeVJvb3QpO1xuICAgIGlmIChzZWxlY3RlZFJvb3RzLmxlbmd0aCAhPT0gMSkge1xuICAgICAgLy8gVGhlcmUgaXMgbW9yZSB0aGFuIG9uZSByb290IHdpdGggc2VsZWN0ZWQgbm9kZXMuIE5vIGJ1ZW5vLlxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IHJvb3RLZXkgPSBzZWxlY3RlZFJvb3RzWzBdO1xuICAgIGNvbnN0IHNlbGVjdGVkS2V5cyA9IHRoaXMuZ2V0U2VsZWN0ZWRLZXlzKHJvb3RLZXkpO1xuICAgIC8qXG4gICAgICogTm90ZTogVGhpcyBkb2VzIG5vdCBjYWxsIGBnZXRTZWxlY3RlZE5vZGVzYCB0byBwcmV2ZW50IGNyZWF0aW5nIG5vZGVzIHRoYXQgd291bGQgYmUgdGhyb3duXG4gICAgICogYXdheSBpZiB0aGVyZSBpcyBtb3JlIHRoYW4gMSBzZWxlY3RlZCBub2RlLlxuICAgICAqL1xuICAgIHJldHVybiAoc2VsZWN0ZWRLZXlzLnNpemUgPT09IDEpID8gdGhpcy5nZXROb2RlKHJvb3RLZXksIHNlbGVjdGVkS2V5cy5maXJzdCgpKSA6IG51bGw7XG4gIH1cblxuICBnZXRSb290Tm9kZShyb290S2V5OiBzdHJpbmcpOiBGaWxlVHJlZU5vZGUge1xuICAgIHJldHVybiB0aGlzLmdldE5vZGUocm9vdEtleSwgcm9vdEtleSk7XG4gIH1cblxuICBnZXROb2RlKHJvb3RLZXk6IHN0cmluZywgbm9kZUtleTogc3RyaW5nKTogRmlsZVRyZWVOb2RlIHtcbiAgICByZXR1cm4gbmV3IEZpbGVUcmVlTm9kZSh0aGlzLCByb290S2V5LCBub2RlS2V5KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJZiBhIGZldGNoIGlzIG5vdCBhbHJlYWR5IGluIHByb2dyZXNzIGluaXRpYXRlIGEgZmV0Y2ggbm93LlxuICAgKi9cbiAgX2ZldGNoQ2hpbGRLZXlzKG5vZGVLZXk6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IGV4aXN0aW5nUHJvbWlzZSA9IHRoaXMuX2dldExvYWRpbmcobm9kZUtleSk7XG4gICAgaWYgKGV4aXN0aW5nUHJvbWlzZSkge1xuICAgICAgcmV0dXJuIGV4aXN0aW5nUHJvbWlzZTtcbiAgICB9XG5cbiAgICBjb25zdCBwcm9taXNlID0gRmlsZVRyZWVIZWxwZXJzLmZldGNoQ2hpbGRyZW4obm9kZUtleSkuY2F0Y2goZXJyb3IgPT4ge1xuICAgICAgdGhpcy5fbG9nZ2VyLmVycm9yKGBVbmFibGUgdG8gZmV0Y2ggY2hpbGRyZW4gZm9yIFwiJHtub2RlS2V5fVwiLmApO1xuICAgICAgdGhpcy5fbG9nZ2VyLmVycm9yKCdPcmlnaW5hbCBlcnJvcjogJywgZXJyb3IpO1xuICAgICAgLy8gQ29sbGFwc2UgdGhlIG5vZGUgYW5kIGNsZWFyIGl0cyBsb2FkaW5nIHN0YXRlIG9uIGVycm9yIHNvIHRoZSB1c2VyIGNhbiByZXRyeSBleHBhbmRpbmcgaXQuXG4gICAgICBjb25zdCByb290S2V5ID0gdGhpcy5nZXRSb290Rm9yS2V5KG5vZGVLZXkpO1xuICAgICAgaWYgKHJvb3RLZXkgIT0gbnVsbCkge1xuICAgICAgICB0aGlzLl9jb2xsYXBzZU5vZGUocm9vdEtleSwgbm9kZUtleSk7XG4gICAgICB9XG4gICAgICB0aGlzLl9jbGVhckxvYWRpbmcobm9kZUtleSk7XG4gICAgfSkudGhlbihjaGlsZEtleXMgPT4ge1xuICAgICAgLy8gSWYgdGhpcyBub2RlJ3Mgcm9vdCB3ZW50IGF3YXkgd2hpbGUgdGhlIFByb21pc2Ugd2FzIHJlc29sdmluZywgZG8gbm8gbW9yZSB3b3JrLiBUaGlzIG5vZGVcbiAgICAgIC8vIGlzIG5vIGxvbmdlciBuZWVkZWQgaW4gdGhlIHN0b3JlLlxuICAgICAgaWYgKHRoaXMuZ2V0Um9vdEZvcktleShub2RlS2V5KSA9PSBudWxsKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRoaXMuX3NldENoaWxkS2V5cyhub2RlS2V5LCBjaGlsZEtleXMpO1xuICAgICAgdGhpcy5fYWRkU3Vic2NyaXB0aW9uKG5vZGVLZXkpO1xuICAgICAgdGhpcy5fY2xlYXJMb2FkaW5nKG5vZGVLZXkpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5fc2V0TG9hZGluZyhub2RlS2V5LCBwcm9taXNlKTtcbiAgICByZXR1cm4gcHJvbWlzZTtcbiAgfVxuXG4gIF9nZXRMb2FkaW5nKG5vZGVLZXk6IHN0cmluZyk6ID9Qcm9taXNlIHtcbiAgICByZXR1cm4gdGhpcy5fZGF0YS5pc0xvYWRpbmdNYXBbbm9kZUtleV07XG4gIH1cblxuICBfc2V0TG9hZGluZyhub2RlS2V5OiBzdHJpbmcsIHZhbHVlOiBQcm9taXNlKTogdm9pZCB7XG4gICAgdGhpcy5fc2V0KCdpc0xvYWRpbmdNYXAnLCBzZXRQcm9wZXJ0eSh0aGlzLl9kYXRhLmlzTG9hZGluZ01hcCwgbm9kZUtleSwgdmFsdWUpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXNldHMgdGhlIG5vZGUgdG8gYmUga2VwdCBpbiB2aWV3IGlmIG5vIG1vcmUgZGF0YSBpcyBiZWluZyBhd2FpdGVkLiBTYWZlIHRvIGNhbGwgbWFueSB0aW1lc1xuICAgKiBiZWNhdXNlIGl0IG9ubHkgY2hhbmdlcyBzdGF0ZSBpZiBhIG5vZGUgaXMgYmVpbmcgdHJhY2tlZC5cbiAgICovXG4gIF9jaGVja1RyYWNrZWROb2RlKCk6IHZvaWQge1xuICAgIGlmIChcbiAgICAgIHRoaXMuX2RhdGEudHJhY2tlZE5vZGUgIT0gbnVsbCAmJlxuICAgICAgLypcbiAgICAgICAqIFRoZSBsb2FkaW5nIG1hcCBiZWluZyBlbXB0eSBpcyBhIGhldXJpc3RpYyBmb3Igd2hlbiBsb2FkaW5nIGhhcyBjb21wbGV0ZWQuIEl0IGlzIGluZXhhY3RcbiAgICAgICAqIGJlY2F1c2UgdGhlIGxvYWRpbmcgbWlnaHQgYmUgdW5yZWxhdGVkIHRvIHRoZSB0cmFja2VkIG5vZGUsIGhvd2V2ZXIgaXQgaXMgY2hlYXAgYW5kIGZhbHNlXG4gICAgICAgKiBwb3NpdGl2ZXMgd2lsbCBvbmx5IGxhc3QgdW50aWwgbG9hZGluZyBpcyBjb21wbGV0ZSBvciB1bnRpbCB0aGUgdXNlciBjbGlja3MgYW5vdGhlciBub2RlIGluXG4gICAgICAgKiB0aGUgdHJlZS5cbiAgICAgICAqL1xuICAgICAgb2JqZWN0VXRpbC5pc0VtcHR5KHRoaXMuX2RhdGEuaXNMb2FkaW5nTWFwKVxuICAgICkge1xuICAgICAgLy8gTG9hZGluZyBoYXMgY29tcGxldGVkLiBBbGxvdyBzY3JvbGxpbmcgdG8gcHJvY2VlZCBhcyB1c3VhbC5cbiAgICAgIHRoaXMuX3NldCgndHJhY2tlZE5vZGUnLCBudWxsKTtcbiAgICB9XG4gIH1cblxuICBfY2xlYXJMb2FkaW5nKG5vZGVLZXk6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuX3NldCgnaXNMb2FkaW5nTWFwJywgZGVsZXRlUHJvcGVydHkodGhpcy5fZGF0YS5pc0xvYWRpbmdNYXAsIG5vZGVLZXkpKTtcbiAgICB0aGlzLl9jaGVja1RyYWNrZWROb2RlKCk7XG4gIH1cblxuICBhc3luYyBfZGVsZXRlU2VsZWN0ZWROb2RlcygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBzZWxlY3RlZE5vZGVzID0gdGhpcy5nZXRTZWxlY3RlZE5vZGVzKCk7XG4gICAgYXdhaXQgUHJvbWlzZS5hbGwoc2VsZWN0ZWROb2Rlcy5tYXAoYXN5bmMgbm9kZSA9PiB7XG4gICAgICBjb25zdCBmaWxlID0gRmlsZVRyZWVIZWxwZXJzLmdldEZpbGVCeUtleShub2RlLm5vZGVLZXkpO1xuICAgICAgaWYgKGZpbGUgPT0gbnVsbCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjb25zdCBmaWxlUGF0aCA9IGdldFBhdGgoZmlsZS5nZXRQYXRoKCkpO1xuICAgICAgY29uc3QgcmVwb3NpdG9yeSA9IHJlcG9zaXRvcnlGb3JQYXRoKGZpbGUuZ2V0UGF0aCgpKTtcbiAgICAgIGlmIChyZXBvc2l0b3J5ICE9IG51bGwgJiYgcmVwb3NpdG9yeS5nZXRUeXBlKCkgPT09ICdoZycpIHtcbiAgICAgICAgY29uc3QgaGdSZXBvc2l0b3J5ID0gKChyZXBvc2l0b3J5OiBhbnkpOiBIZ1JlcG9zaXRvcnlDbGllbnQpO1xuICAgICAgICBjb25zdCBzdWNjZXNzID0gYXdhaXQgaGdSZXBvc2l0b3J5LnJlbW92ZShmaWxlUGF0aCk7XG4gICAgICAgIGlmIChzdWNjZXNzKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihcbiAgICAgICAgICAgICdGYWlsZWQgdG8gcmVtb3ZlICcgKyBmaWxlUGF0aCArICcgZnJvbSB2ZXJzaW9uIGNvbnRyb2wuICBUaGUgZmlsZSB3aWxsIHN0aWxsIGdldCAnICtcbiAgICAgICAgICAgICdkZWxldGVkIGJ1dCB5b3Ugd2lsbCBoYXZlIHRvIHJlbW92ZSBpdCBmcm9tIHlvdXIgVkNTIHlvdXJzZWxmLidcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoRmlsZVRyZWVIZWxwZXJzLmlzTG9jYWxGaWxlKGZpbGUpKSB7XG4gICAgICAgIC8vIFRPRE86IFRoaXMgc3BlY2lhbC1jYXNlIGNhbiBiZSBlbGltaW5hdGVkIG9uY2UgYGRlbGV0ZSgpYCBpcyBhZGRlZCB0byBgRGlyZWN0b3J5YFxuICAgICAgICAvLyBhbmQgYEZpbGVgLlxuICAgICAgICBzaGVsbC5tb3ZlSXRlbVRvVHJhc2gobm9kZS5ub2RlUGF0aCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCByZW1vdGVGaWxlID0gKChmaWxlOiBhbnkpOiAoUmVtb3RlRGlyZWN0b3J5IHwgUmVtb3RlRmlsZSkpO1xuICAgICAgICBhd2FpdCByZW1vdGVGaWxlLmRlbGV0ZSgpO1xuICAgICAgfVxuICAgIH0pKTtcbiAgfVxuXG4gIF9leHBhbmROb2RlKHJvb3RLZXk6IHN0cmluZywgbm9kZUtleTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5fc2V0RXhwYW5kZWRLZXlzKHJvb3RLZXksIHRoaXMuX2dldEV4cGFuZGVkS2V5cyhyb290S2V5KS5hZGQobm9kZUtleSkpO1xuICAgIC8vIElmIHdlIGhhdmUgY2hpbGQgbm9kZXMgdGhhdCBzaG91bGQgYWxzbyBiZSBleHBhbmRlZCwgZXhwYW5kIHRoZW0gbm93LlxuICAgIGxldCBwcmV2aW91c2x5RXhwYW5kZWQgPSB0aGlzLl9nZXRQcmV2aW91c2x5RXhwYW5kZWQocm9vdEtleSk7XG4gICAgaWYgKHByZXZpb3VzbHlFeHBhbmRlZC5oYXMobm9kZUtleSkpIHtcbiAgICAgIGZvciAoY29uc3QgY2hpbGRLZXkgb2YgcHJldmlvdXNseUV4cGFuZGVkLmdldChub2RlS2V5KSkge1xuICAgICAgICB0aGlzLl9leHBhbmROb2RlKHJvb3RLZXksIGNoaWxkS2V5KTtcbiAgICAgIH1cbiAgICAgIC8vIENsZWFyIHRoZSBwcmV2aW91c2x5RXhwYW5kZWQgbGlzdCBzaW5jZSB3ZSdyZSBkb25lIHdpdGggaXQuXG4gICAgICBwcmV2aW91c2x5RXhwYW5kZWQgPSBwcmV2aW91c2x5RXhwYW5kZWQuZGVsZXRlKG5vZGVLZXkpO1xuICAgICAgdGhpcy5fc2V0UHJldmlvdXNseUV4cGFuZGVkKHJvb3RLZXksIHByZXZpb3VzbHlFeHBhbmRlZCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFBlcmZvcm1lcyBhIGRlZXAgQkZTIHNjYW5uaW5nIGV4cGFuZCBvZiBjb250YWluZWQgbm9kZXMuXG4gICAqIHJldHVybnMgLSBhIHByb21pc2UgZnVsZmlsbGVkIHdoZW4gdGhlIGV4cGFuZCBvcGVyYXRpb24gaXMgZmluaXNoZWRcbiAgICovXG4gIF9leHBhbmROb2RlRGVlcChyb290S2V5OiBzdHJpbmcsIG5vZGVLZXk6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIC8vIFN0b3AgdGhlIHRyYXZlcnNhbCBhZnRlciAxMDAgbm9kZXMgd2VyZSBhZGRlZCB0byB0aGUgdHJlZVxuICAgIGNvbnN0IGl0Tm9kZXMgPSBuZXcgRmlsZVRyZWVTdG9yZUJmc0l0ZXJhdG9yKHRoaXMsIHJvb3RLZXksIG5vZGVLZXksIC8qIGxpbWl0Ki8gMTAwKTtcbiAgICBjb25zdCBwcm9taXNlID0gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICBjb25zdCBleHBhbmQgPSAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHRyYXZlcnNlZE5vZGVLZXkgPSBpdE5vZGVzLnRyYXZlcnNlZE5vZGUoKTtcbiAgICAgICAgaWYgKHRyYXZlcnNlZE5vZGVLZXkpIHtcbiAgICAgICAgICB0aGlzLl9zZXRFeHBhbmRlZEtleXMocm9vdEtleSwgdGhpcy5fZ2V0RXhwYW5kZWRLZXlzKHJvb3RLZXkpLmFkZCh0cmF2ZXJzZWROb2RlS2V5KSk7XG4gICAgICAgICAgLyoqXG4gICAgICAgICAgICogRXZlbiBpZiB0aGVyZSB3ZXJlIHByZXZpb3VzbHkgZXhwYW5kZWQgbm9kZXMgaXQgZG9lc24ndCBtYXR0ZXIgYXNcbiAgICAgICAgICAgKiB3ZSdsbCBleHBhbmQgYWxsIG9mIHRoZSBjaGlsZHJlbi5cbiAgICAgICAgICAgKi9cbiAgICAgICAgICBsZXQgcHJldmlvdXNseUV4cGFuZGVkID0gdGhpcy5fZ2V0UHJldmlvdXNseUV4cGFuZGVkKHJvb3RLZXkpO1xuICAgICAgICAgIHByZXZpb3VzbHlFeHBhbmRlZCA9IHByZXZpb3VzbHlFeHBhbmRlZC5kZWxldGUodHJhdmVyc2VkTm9kZUtleSk7XG4gICAgICAgICAgdGhpcy5fc2V0UHJldmlvdXNseUV4cGFuZGVkKHJvb3RLZXksIHByZXZpb3VzbHlFeHBhbmRlZCk7XG5cbiAgICAgICAgICBjb25zdCBuZXh0UHJvbWlzZSA9IGl0Tm9kZXMubmV4dCgpO1xuICAgICAgICAgIGlmIChuZXh0UHJvbWlzZSkge1xuICAgICAgICAgICAgbmV4dFByb21pc2UudGhlbihleHBhbmQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIGV4cGFuZCgpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHByb21pc2U7XG4gIH1cblxuICAvKipcbiAgICogV2hlbiB3ZSBjb2xsYXBzZSBhIG5vZGUgd2UgbmVlZCB0byBkbyBzb21lIGNsZWFudXAgcmVtb3Zpbmcgc3Vic2NyaXB0aW9ucyBhbmQgc2VsZWN0aW9uLlxuICAgKi9cbiAgX2NvbGxhcHNlTm9kZShyb290S2V5OiBzdHJpbmcsIG5vZGVLZXk6IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IGNoaWxkS2V5cyA9IHRoaXMuX2RhdGEuY2hpbGRLZXlNYXBbbm9kZUtleV07XG4gICAgbGV0IHNlbGVjdGVkS2V5cyA9IHRoaXMuX2RhdGEuc2VsZWN0ZWRLZXlzQnlSb290W3Jvb3RLZXldO1xuICAgIGNvbnN0IGV4cGFuZGVkQ2hpbGRLZXlzID0gW107XG4gICAgaWYgKGNoaWxkS2V5cykge1xuICAgICAgY2hpbGRLZXlzLmZvckVhY2goY2hpbGRLZXkgPT4ge1xuICAgICAgICAvLyBVbnNlbGVjdCBlYWNoIGNoaWxkLlxuICAgICAgICBpZiAoc2VsZWN0ZWRLZXlzICYmIHNlbGVjdGVkS2V5cy5oYXMoY2hpbGRLZXkpKSB7XG4gICAgICAgICAgc2VsZWN0ZWRLZXlzID0gc2VsZWN0ZWRLZXlzLmRlbGV0ZShjaGlsZEtleSk7XG4gICAgICAgICAgLypcbiAgICAgICAgICAgKiBTZXQgdGhlIHNlbGVjdGVkIGtleXMgKmJlZm9yZSogdGhlIHJlY3Vyc2l2ZSBgX2NvbGxhcHNlTm9kZWAgY2FsbCBzbyBlYWNoIGNhbGwgc3RvcmVzXG4gICAgICAgICAgICogaXRzIGNoYW5nZXMgYW5kIGlzbid0IHdpcGVkIG91dCBieSB0aGUgbmV4dCBjYWxsIGJ5IGtlZXBpbmcgYW4gb3V0ZGF0ZWQgYHNlbGVjdGVkS2V5c2BcbiAgICAgICAgICAgKiBpbiB0aGUgY2FsbCBzdGFjay5cbiAgICAgICAgICAgKi9cbiAgICAgICAgICB0aGlzLl9zZXRTZWxlY3RlZEtleXMocm9vdEtleSwgc2VsZWN0ZWRLZXlzKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBDb2xsYXBzZSBlYWNoIGNoaWxkIGRpcmVjdG9yeS5cbiAgICAgICAgaWYgKEZpbGVUcmVlSGVscGVycy5pc0RpcktleShjaGlsZEtleSkpIHtcbiAgICAgICAgICBpZiAodGhpcy5pc0V4cGFuZGVkKHJvb3RLZXksIGNoaWxkS2V5KSkge1xuICAgICAgICAgICAgZXhwYW5kZWRDaGlsZEtleXMucHVzaChjaGlsZEtleSk7XG4gICAgICAgICAgICB0aGlzLl9jb2xsYXBzZU5vZGUocm9vdEtleSwgY2hpbGRLZXkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICAgIC8qXG4gICAgICogU2F2ZSB0aGUgbGlzdCBvZiBleHBhbmRlZCBjaGlsZCBub2RlcyBzbyBuZXh0IHRpbWUgd2UgZXhwYW5kIHRoaXMgbm9kZSB3ZSBjYW4gZXhwYW5kIHRoZXNlXG4gICAgICogY2hpbGRyZW4uXG4gICAgICovXG4gICAgbGV0IHByZXZpb3VzbHlFeHBhbmRlZCA9IHRoaXMuX2dldFByZXZpb3VzbHlFeHBhbmRlZChyb290S2V5KTtcbiAgICBpZiAoZXhwYW5kZWRDaGlsZEtleXMubGVuZ3RoICE9PSAwKSB7XG4gICAgICBwcmV2aW91c2x5RXhwYW5kZWQgPSBwcmV2aW91c2x5RXhwYW5kZWQuc2V0KG5vZGVLZXksIGV4cGFuZGVkQ2hpbGRLZXlzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcHJldmlvdXNseUV4cGFuZGVkID0gcHJldmlvdXNseUV4cGFuZGVkLmRlbGV0ZShub2RlS2V5KTtcbiAgICB9XG4gICAgdGhpcy5fc2V0UHJldmlvdXNseUV4cGFuZGVkKHJvb3RLZXksIHByZXZpb3VzbHlFeHBhbmRlZCk7XG4gICAgdGhpcy5fc2V0RXhwYW5kZWRLZXlzKHJvb3RLZXksIHRoaXMuX2dldEV4cGFuZGVkS2V5cyhyb290S2V5KS5kZWxldGUobm9kZUtleSkpO1xuICAgIHRoaXMuX3JlbW92ZVN1YnNjcmlwdGlvbihyb290S2V5LCBub2RlS2V5KTtcbiAgfVxuXG4gIF9nZXRQcmV2aW91c2x5RXhwYW5kZWQocm9vdEtleTogc3RyaW5nKTogSW1tdXRhYmxlLk1hcDxzdHJpbmcsIEFycmF5PHN0cmluZz4+IHtcbiAgICByZXR1cm4gdGhpcy5fZGF0YS5wcmV2aW91c2x5RXhwYW5kZWRbcm9vdEtleV0gfHwgbmV3IEltbXV0YWJsZS5NYXAoKTtcbiAgfVxuXG4gIF9zZXRQcmV2aW91c2x5RXhwYW5kZWQocm9vdEtleTogc3RyaW5nLFxuICAgIHByZXZpb3VzbHlFeHBhbmRlZDogSW1tdXRhYmxlLk1hcDxzdHJpbmcsIEFycmF5PHN0cmluZz4+KTogdm9pZCB7XG4gICAgdGhpcy5fc2V0KFxuICAgICAgJ3ByZXZpb3VzbHlFeHBhbmRlZCcsXG4gICAgICBzZXRQcm9wZXJ0eSh0aGlzLl9kYXRhLnByZXZpb3VzbHlFeHBhbmRlZCwgcm9vdEtleSwgcHJldmlvdXNseUV4cGFuZGVkKVxuICAgICk7XG4gIH1cblxuICBfZ2V0RXhwYW5kZWRLZXlzKHJvb3RLZXk6IHN0cmluZyk6IEltbXV0YWJsZS5TZXQ8c3RyaW5nPiB7XG4gICAgcmV0dXJuIHRoaXMuX2RhdGEuZXhwYW5kZWRLZXlzQnlSb290W3Jvb3RLZXldIHx8IG5ldyBJbW11dGFibGUuU2V0KCk7XG4gIH1cblxuICAvKipcbiAgICogVGhpcyBpcyBqdXN0IGV4cG9zZWQgc28gaXQgY2FuIGJlIG1vY2tlZCBpbiB0aGUgdGVzdHMuIE5vdCBpZGVhbCwgYnV0IGEgbG90IGxlc3MgbWVzc3kgdGhhbiB0aGVcbiAgICogYWx0ZXJuYXRpdmVzLiBGb3IgZXhhbXBsZSwgcGFzc2luZyBvcHRpb25zIHdoZW4gY29uc3RydWN0aW5nIGFuIGluc3RhbmNlIG9mIGEgc2luZ2xldG9uIHdvdWxkXG4gICAqIG1ha2UgZnV0dXJlIGludm9jYXRpb25zIG9mIGBnZXRJbnN0YW5jZWAgdW5wcmVkaWN0YWJsZS5cbiAgICovXG4gIF9yZXBvc2l0b3J5Rm9yUGF0aChwYXRoOiBOdWNsaWRlVXJpKTogP2F0b20kUmVwb3NpdG9yeSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0UmVwb3NpdG9yaWVzKCkuZmluZChyZXBvID0+IHJlcG9zaXRvcnlDb250YWluc1BhdGgocmVwbywgcGF0aCkpO1xuICB9XG5cbiAgX3NldEV4cGFuZGVkS2V5cyhyb290S2V5OiBzdHJpbmcsIGV4cGFuZGVkS2V5czogSW1tdXRhYmxlLlNldDxzdHJpbmc+KTogdm9pZCB7XG4gICAgdGhpcy5fc2V0KFxuICAgICAgJ2V4cGFuZGVkS2V5c0J5Um9vdCcsXG4gICAgICBzZXRQcm9wZXJ0eSh0aGlzLl9kYXRhLmV4cGFuZGVkS2V5c0J5Um9vdCwgcm9vdEtleSwgZXhwYW5kZWRLZXlzKVxuICAgICk7XG4gIH1cblxuICBfZGVsZXRlU2VsZWN0ZWRLZXlzKHJvb3RLZXk6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuX3NldCgnc2VsZWN0ZWRLZXlzQnlSb290JywgZGVsZXRlUHJvcGVydHkodGhpcy5fZGF0YS5zZWxlY3RlZEtleXNCeVJvb3QsIHJvb3RLZXkpKTtcbiAgfVxuXG4gIF9zZXRTZWxlY3RlZEtleXMocm9vdEtleTogc3RyaW5nLCBzZWxlY3RlZEtleXM6IEltbXV0YWJsZS5PcmRlcmVkU2V0PHN0cmluZz4pOiB2b2lkIHtcbiAgICAvKlxuICAgICAqIE5ldyBzZWxlY3Rpb24gbWVhbnMgcHJldmlvdXMgbm9kZSBzaG91bGQgbm90IGJlIGtlcHQgaW4gdmlldy4gRG8gdGhpcyB3aXRob3V0IGRlLWJvdW5jaW5nXG4gICAgICogYmVjYXVzZSB0aGUgcHJldmlvdXMgc3RhdGUgaXMgaXJyZWxldmFudC4gSWYgdGhlIHVzZXIgY2hvc2UgYSBuZXcgc2VsZWN0aW9uLCB0aGUgcHJldmlvdXMgb25lXG4gICAgICogc2hvdWxkIG5vdCBiZSBzY3JvbGxlZCBpbnRvIHZpZXcuXG4gICAgICovXG4gICAgdGhpcy5fc2V0KCd0cmFja2VkTm9kZScsIG51bGwpO1xuICAgIHRoaXMuX3NldChcbiAgICAgICdzZWxlY3RlZEtleXNCeVJvb3QnLFxuICAgICAgc2V0UHJvcGVydHkodGhpcy5fZGF0YS5zZWxlY3RlZEtleXNCeVJvb3QsIHJvb3RLZXksIHNlbGVjdGVkS2V5cylcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIHNlbGVjdGVkIGtleXMgaW4gYWxsIHJvb3RzIG9mIHRoZSB0cmVlLiBUaGUgc2VsZWN0ZWQga2V5cyBvZiByb290IGtleXMgbm90IGluXG4gICAqIGBzZWxlY3RlZEtleXNCeVJvb3RgIGFyZSBkZWxldGVkICh0aGUgcm9vdCBpcyBsZWZ0IHdpdGggbm8gc2VsZWN0aW9uKS5cbiAgICovXG4gIF9zZXRTZWxlY3RlZEtleXNCeVJvb3Qoc2VsZWN0ZWRLZXlzQnlSb290OiB7W2tleTogc3RyaW5nXTogSW1tdXRhYmxlLk9yZGVyZWRTZXQ8c3RyaW5nPn0pOiB2b2lkIHtcbiAgICB0aGlzLmdldFJvb3RLZXlzKCkuZm9yRWFjaChyb290S2V5ID0+IHtcbiAgICAgIGlmIChzZWxlY3RlZEtleXNCeVJvb3QuaGFzT3duUHJvcGVydHkocm9vdEtleSkpIHtcbiAgICAgICAgdGhpcy5fc2V0U2VsZWN0ZWRLZXlzKHJvb3RLZXksIHNlbGVjdGVkS2V5c0J5Um9vdFtyb290S2V5XSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9kZWxldGVTZWxlY3RlZEtleXMocm9vdEtleSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBfc2V0Um9vdEtleXMocm9vdEtleXM6IEFycmF5PHN0cmluZz4pOiB2b2lkIHtcbiAgICBjb25zdCBvbGRSb290S2V5cyA9IHRoaXMuX2RhdGEucm9vdEtleXM7XG4gICAgY29uc3QgbmV3Um9vdEtleXMgPSBuZXcgSW1tdXRhYmxlLlNldChyb290S2V5cyk7XG4gICAgY29uc3QgcmVtb3ZlZFJvb3RLZXlzID0gbmV3IEltbXV0YWJsZS5TZXQob2xkUm9vdEtleXMpLnN1YnRyYWN0KG5ld1Jvb3RLZXlzKTtcbiAgICByZW1vdmVkUm9vdEtleXMuZm9yRWFjaCh0aGlzLl9wdXJnZVJvb3QuYmluZCh0aGlzKSk7XG4gICAgdGhpcy5fc2V0KCdyb290S2V5cycsIHJvb3RLZXlzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIGEgc2luZ2xlIGNoaWxkIG5vZGUuIEl0J3MgdXNlZnVsIHdoZW4gZXhwYW5kaW5nIHRvIGEgZGVlcGx5IG5lc3RlZCBub2RlLlxuICAgKi9cbiAgX2NyZWF0ZUNoaWxkKG5vZGVLZXk6IHN0cmluZywgY2hpbGRLZXk6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuX3NldENoaWxkS2V5cyhub2RlS2V5LCBbY2hpbGRLZXldKTtcbiAgICAvKlxuICAgICAqIE1hcmsgdGhlIG5vZGUgYXMgZGlydHkgc28gaXRzIGFuY2VzdG9ycyBhcmUgZmV0Y2hlZCBhZ2FpbiBvbiByZWxvYWQgb2YgdGhlIHRyZWUuXG4gICAgICovXG4gICAgdGhpcy5fc2V0KCdpc0RpcnR5TWFwJywgc2V0UHJvcGVydHkodGhpcy5fZGF0YS5pc0RpcnR5TWFwLCBub2RlS2V5LCB0cnVlKSk7XG4gIH1cblxuICBfc2V0Q2hpbGRLZXlzKG5vZGVLZXk6IHN0cmluZywgY2hpbGRLZXlzOiBBcnJheTxzdHJpbmc+KTogdm9pZCB7XG4gICAgY29uc3Qgb2xkQ2hpbGRLZXlzID0gdGhpcy5fZGF0YS5jaGlsZEtleU1hcFtub2RlS2V5XTtcbiAgICBpZiAob2xkQ2hpbGRLZXlzKSB7XG4gICAgICBjb25zdCBuZXdDaGlsZEtleXMgPSBuZXcgSW1tdXRhYmxlLlNldChjaGlsZEtleXMpO1xuICAgICAgY29uc3QgcmVtb3ZlZERpcmVjdG9yeUtleXMgPSBuZXcgSW1tdXRhYmxlLlNldChvbGRDaGlsZEtleXMpXG4gICAgICAgIC5zdWJ0cmFjdChuZXdDaGlsZEtleXMpXG4gICAgICAgIC5maWx0ZXIoRmlsZVRyZWVIZWxwZXJzLmlzRGlyS2V5KTtcbiAgICAgIHJlbW92ZWREaXJlY3RvcnlLZXlzLmZvckVhY2godGhpcy5fcHVyZ2VEaXJlY3RvcnkuYmluZCh0aGlzKSk7XG4gICAgfVxuICAgIHRoaXMuX3NldCgnY2hpbGRLZXlNYXAnLCBzZXRQcm9wZXJ0eSh0aGlzLl9kYXRhLmNoaWxkS2V5TWFwLCBub2RlS2V5LCBjaGlsZEtleXMpKTtcbiAgfVxuXG4gIF9vbkRpcmVjdG9yeUNoYW5nZShub2RlS2V5OiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLl9mZXRjaENoaWxkS2V5cyhub2RlS2V5KTtcbiAgfVxuXG4gIF9hZGRTdWJzY3JpcHRpb24obm9kZUtleTogc3RyaW5nKTogdm9pZCB7XG4gICAgY29uc3QgZGlyZWN0b3J5ID0gRmlsZVRyZWVIZWxwZXJzLmdldERpcmVjdG9yeUJ5S2V5KG5vZGVLZXkpO1xuICAgIGlmICghZGlyZWN0b3J5KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLypcbiAgICAgKiBSZW1vdmUgdGhlIGRpcmVjdG9yeSdzIGRpcnR5IG1hcmtlciByZWdhcmRsZXNzIG9mIHdoZXRoZXIgYSBzdWJzY3JpcHRpb24gYWxyZWFkeSBleGlzdHNcbiAgICAgKiBiZWNhdXNlIHRoZXJlIGlzIG5vdGhpbmcgZnVydGhlciBtYWtpbmcgaXQgZGlydHkuXG4gICAgICovXG4gICAgdGhpcy5fc2V0KCdpc0RpcnR5TWFwJywgZGVsZXRlUHJvcGVydHkodGhpcy5fZGF0YS5pc0RpcnR5TWFwLCBub2RlS2V5KSk7XG5cbiAgICAvLyBEb24ndCBjcmVhdGUgYSBuZXcgc3Vic2NyaXB0aW9uIGlmIG9uZSBhbHJlYWR5IGV4aXN0cy5cbiAgICBpZiAodGhpcy5fZGF0YS5zdWJzY3JpcHRpb25NYXBbbm9kZUtleV0pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgc3Vic2NyaXB0aW9uO1xuICAgIHRyeSB7XG4gICAgICAvLyBUaGlzIGNhbGwgbWlnaHQgZmFpbCBpZiB3ZSB0cnkgdG8gd2F0Y2ggYSBub24tZXhpc3RpbmcgZGlyZWN0b3J5LCBvciBpZiBwZXJtaXNzaW9uIGRlbmllZC5cbiAgICAgIHN1YnNjcmlwdGlvbiA9IGRpcmVjdG9yeS5vbkRpZENoYW5nZSgoKSA9PiB7XG4gICAgICAgIHRoaXMuX29uRGlyZWN0b3J5Q2hhbmdlKG5vZGVLZXkpO1xuICAgICAgfSk7XG4gICAgfSBjYXRjaCAoZXgpIHtcbiAgICAgIC8qXG4gICAgICAgKiBMb2cgZXJyb3IgYW5kIG1hcmsgdGhlIGRpcmVjdG9yeSBhcyBkaXJ0eSBzbyB0aGUgZmFpbGVkIHN1YnNjcmlwdGlvbiB3aWxsIGJlIGF0dGVtcHRlZFxuICAgICAgICogYWdhaW4gbmV4dCB0aW1lIHRoZSBkaXJlY3RvcnkgaXMgZXhwYW5kZWQuXG4gICAgICAgKi9cbiAgICAgIHRoaXMuX2xvZ2dlci5lcnJvcihgQ2Fubm90IHN1YnNjcmliZSB0byBkaXJlY3RvcnkgXCIke25vZGVLZXl9XCJgLCBleCk7XG4gICAgICB0aGlzLl9zZXQoJ2lzRGlydHlNYXAnLCBzZXRQcm9wZXJ0eSh0aGlzLl9kYXRhLmlzRGlydHlNYXAsIG5vZGVLZXkpKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5fc2V0KCdzdWJzY3JpcHRpb25NYXAnLCBzZXRQcm9wZXJ0eSh0aGlzLl9kYXRhLnN1YnNjcmlwdGlvbk1hcCwgbm9kZUtleSwgc3Vic2NyaXB0aW9uKSk7XG4gIH1cblxuICBfcmVtb3ZlU3Vic2NyaXB0aW9uKHJvb3RLZXk6IHN0cmluZywgbm9kZUtleTogc3RyaW5nKTogdm9pZCB7XG4gICAgbGV0IGhhc1JlbWFpbmluZ1N1YnNjcmliZXJzO1xuICAgIGNvbnN0IHN1YnNjcmlwdGlvbiA9IHRoaXMuX2RhdGEuc3Vic2NyaXB0aW9uTWFwW25vZGVLZXldO1xuXG4gICAgaWYgKHN1YnNjcmlwdGlvbiAhPSBudWxsKSB7XG4gICAgICBoYXNSZW1haW5pbmdTdWJzY3JpYmVycyA9IHRoaXMuX2RhdGEucm9vdEtleXMuc29tZShvdGhlclJvb3RLZXkgPT4gKFxuICAgICAgICBvdGhlclJvb3RLZXkgIT09IHJvb3RLZXkgJiYgdGhpcy5pc0V4cGFuZGVkKG90aGVyUm9vdEtleSwgbm9kZUtleSlcbiAgICAgICkpO1xuICAgICAgaWYgKCFoYXNSZW1haW5pbmdTdWJzY3JpYmVycykge1xuICAgICAgICBzdWJzY3JpcHRpb24uZGlzcG9zZSgpO1xuICAgICAgICB0aGlzLl9zZXQoJ3N1YnNjcmlwdGlvbk1hcCcsIGRlbGV0ZVByb3BlcnR5KHRoaXMuX2RhdGEuc3Vic2NyaXB0aW9uTWFwLCBub2RlS2V5KSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHN1YnNjcmlwdGlvbiA9PSBudWxsIHx8IGhhc1JlbWFpbmluZ1N1YnNjcmliZXJzID09PSBmYWxzZSkge1xuICAgICAgLy8gU2luY2Ugd2UncmUgbm8gbG9uZ2VyIGdldHRpbmcgbm90aWZpY2F0aW9ucyB3aGVuIHRoZSBkaXJlY3RvcnkgY29udGVudHMgY2hhbmdlLCBhc3N1bWUgdGhlXG4gICAgICAvLyBjaGlsZCBsaXN0IGlzIGRpcnR5LlxuICAgICAgdGhpcy5fc2V0KCdpc0RpcnR5TWFwJywgc2V0UHJvcGVydHkodGhpcy5fZGF0YS5pc0RpcnR5TWFwLCBub2RlS2V5LCB0cnVlKSk7XG4gICAgfVxuICB9XG5cbiAgX3JlbW92ZUFsbFN1YnNjcmlwdGlvbnMobm9kZUtleTogc3RyaW5nKTogdm9pZCB7XG4gICAgY29uc3Qgc3Vic2NyaXB0aW9uID0gdGhpcy5fZGF0YS5zdWJzY3JpcHRpb25NYXBbbm9kZUtleV07XG4gICAgaWYgKHN1YnNjcmlwdGlvbikge1xuICAgICAgc3Vic2NyaXB0aW9uLmRpc3Bvc2UoKTtcbiAgICAgIHRoaXMuX3NldCgnc3Vic2NyaXB0aW9uTWFwJywgZGVsZXRlUHJvcGVydHkodGhpcy5fZGF0YS5zdWJzY3JpcHRpb25NYXAsIG5vZGVLZXkpKTtcbiAgICB9XG4gIH1cblxuICBfcHVyZ2VOb2RlKHJvb3RLZXk6IHN0cmluZywgbm9kZUtleTogc3RyaW5nLCB1bnNlbGVjdDogYm9vbGVhbik6IHZvaWQge1xuICAgIGNvbnN0IGV4cGFuZGVkS2V5cyA9IHRoaXMuX2dldEV4cGFuZGVkS2V5cyhyb290S2V5KTtcbiAgICBpZiAoZXhwYW5kZWRLZXlzLmhhcyhub2RlS2V5KSkge1xuICAgICAgdGhpcy5fc2V0RXhwYW5kZWRLZXlzKHJvb3RLZXksIGV4cGFuZGVkS2V5cy5kZWxldGUobm9kZUtleSkpO1xuICAgIH1cblxuICAgIGlmICh1bnNlbGVjdCkge1xuICAgICAgY29uc3Qgc2VsZWN0ZWRLZXlzID0gdGhpcy5nZXRTZWxlY3RlZEtleXMocm9vdEtleSk7XG4gICAgICBpZiAoc2VsZWN0ZWRLZXlzLmhhcyhub2RlS2V5KSkge1xuICAgICAgICB0aGlzLl9zZXRTZWxlY3RlZEtleXMocm9vdEtleSwgc2VsZWN0ZWRLZXlzLmRlbGV0ZShub2RlS2V5KSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgcHJldmlvdXNseUV4cGFuZGVkID0gdGhpcy5fZ2V0UHJldmlvdXNseUV4cGFuZGVkKHJvb3RLZXkpO1xuICAgIGlmIChwcmV2aW91c2x5RXhwYW5kZWQuaGFzKG5vZGVLZXkpKSB7XG4gICAgICB0aGlzLl9zZXRQcmV2aW91c2x5RXhwYW5kZWQocm9vdEtleSwgcHJldmlvdXNseUV4cGFuZGVkLmRlbGV0ZShub2RlS2V5KSk7XG4gICAgfVxuICB9XG5cbiAgX3B1cmdlRGlyZWN0b3J5V2l0aGluQVJvb3Qocm9vdEtleTogc3RyaW5nLCBub2RlS2V5OiBzdHJpbmcsIHVuc2VsZWN0OiBib29sZWFuKTogdm9pZCB7XG4gICAgY29uc3QgY2hpbGRLZXlzID0gdGhpcy5fZGF0YS5jaGlsZEtleU1hcFtub2RlS2V5XTtcbiAgICBpZiAoY2hpbGRLZXlzKSB7XG4gICAgICBjaGlsZEtleXMuZm9yRWFjaChjaGlsZEtleSA9PiB7XG4gICAgICAgIGlmIChGaWxlVHJlZUhlbHBlcnMuaXNEaXJLZXkoY2hpbGRLZXkpKSB7XG4gICAgICAgICAgdGhpcy5fcHVyZ2VEaXJlY3RvcnlXaXRoaW5BUm9vdChyb290S2V5LCBjaGlsZEtleSwgLyogdW5zZWxlY3QgKi8gdHJ1ZSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgICB0aGlzLl9yZW1vdmVTdWJzY3JpcHRpb24ocm9vdEtleSwgbm9kZUtleSk7XG4gICAgdGhpcy5fcHVyZ2VOb2RlKHJvb3RLZXksIG5vZGVLZXksIHVuc2VsZWN0KTtcbiAgfVxuXG4gIC8vIFRoaXMgaXMgY2FsbGVkIHdoZW4gYSBkaXJjdG9yeSBpcyBwaHlzaWNhbGx5IHJlbW92ZWQgZnJvbSBkaXNrLiBXaGVuIHdlIHB1cmdlIGEgZGlyZWN0b3J5LFxuICAvLyB3ZSBuZWVkIHRvIHB1cmdlIGl0J3MgY2hpbGQgZGlyZWN0b3JpZXMgYWxzby4gUHVyZ2luZyByZW1vdmVzIHN0dWZmIGZyb20gdGhlIGRhdGEgc3RvcmVcbiAgLy8gaW5jbHVkaW5nIGxpc3Qgb2YgY2hpbGQgbm9kZXMsIHN1YnNjcmlwdGlvbnMsIGV4cGFuZGVkIGRpcmVjdG9yaWVzIGFuZCBzZWxlY3RlZCBkaXJlY3Rvcmllcy5cbiAgX3B1cmdlRGlyZWN0b3J5KG5vZGVLZXk6IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IGNoaWxkS2V5cyA9IHRoaXMuX2RhdGEuY2hpbGRLZXlNYXBbbm9kZUtleV07XG4gICAgaWYgKGNoaWxkS2V5cykge1xuICAgICAgY2hpbGRLZXlzLmZvckVhY2goY2hpbGRLZXkgPT4ge1xuICAgICAgICBpZiAoRmlsZVRyZWVIZWxwZXJzLmlzRGlyS2V5KGNoaWxkS2V5KSkge1xuICAgICAgICAgIHRoaXMuX3B1cmdlRGlyZWN0b3J5KGNoaWxkS2V5KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICB0aGlzLl9zZXQoJ2NoaWxkS2V5TWFwJywgZGVsZXRlUHJvcGVydHkodGhpcy5fZGF0YS5jaGlsZEtleU1hcCwgbm9kZUtleSkpO1xuICAgIH1cblxuICAgIHRoaXMuX3JlbW92ZUFsbFN1YnNjcmlwdGlvbnMobm9kZUtleSk7XG4gICAgdGhpcy5nZXRSb290S2V5cygpLmZvckVhY2gocm9vdEtleSA9PiB7XG4gICAgICB0aGlzLl9wdXJnZU5vZGUocm9vdEtleSwgbm9kZUtleSwgLyogdW5zZWxlY3QgKi8gdHJ1ZSk7XG4gICAgfSk7XG4gIH1cblxuICAvLyBUT0RPOiBTaG91bGQgd2UgY2xlYW4gdXAgaXNMb2FkaW5nTWFwPyBJdCBjb250YWlucyBwcm9taXNlcyB3aGljaCBjYW5ub3QgYmUgY2FuY2VsbGVkLCBzbyB0aGlzXG4gIC8vIG1pZ2h0IGJlIHRyaWNreS5cbiAgX3B1cmdlUm9vdChyb290S2V5OiBzdHJpbmcpOiB2b2lkIHtcbiAgICBjb25zdCBleHBhbmRlZEtleXMgPSB0aGlzLl9kYXRhLmV4cGFuZGVkS2V5c0J5Um9vdFtyb290S2V5XTtcbiAgICBpZiAoZXhwYW5kZWRLZXlzKSB7XG4gICAgICBleHBhbmRlZEtleXMuZm9yRWFjaChub2RlS2V5ID0+IHtcbiAgICAgICAgdGhpcy5fcmVtb3ZlU3Vic2NyaXB0aW9uKHJvb3RLZXksIG5vZGVLZXkpO1xuICAgICAgfSk7XG4gICAgICB0aGlzLl9zZXQoJ2V4cGFuZGVkS2V5c0J5Um9vdCcsIGRlbGV0ZVByb3BlcnR5KHRoaXMuX2RhdGEuZXhwYW5kZWRLZXlzQnlSb290LCByb290S2V5KSk7XG4gICAgfVxuICAgIHRoaXMuX3NldCgnc2VsZWN0ZWRLZXlzQnlSb290JywgZGVsZXRlUHJvcGVydHkodGhpcy5fZGF0YS5zZWxlY3RlZEtleXNCeVJvb3QsIHJvb3RLZXkpKTtcbiAgICAvLyBSZW1vdmUgYWxsIGNoaWxkIGtleXMgc28gdGhhdCBvbiByZS1hZGRpdGlvbiBvZiB0aGlzIHJvb3QgdGhlIGNoaWxkcmVuIHdpbGwgYmUgZmV0Y2hlZCBhZ2Fpbi5cbiAgICBjb25zdCBjaGlsZEtleXMgPSB0aGlzLl9kYXRhLmNoaWxkS2V5TWFwW3Jvb3RLZXldO1xuICAgIGlmIChjaGlsZEtleXMpIHtcbiAgICAgIGNoaWxkS2V5cy5mb3JFYWNoKGNoaWxkS2V5ID0+IHtcbiAgICAgICAgaWYgKEZpbGVUcmVlSGVscGVycy5pc0RpcktleShjaGlsZEtleSkpIHtcbiAgICAgICAgICB0aGlzLl9zZXQoJ2NoaWxkS2V5TWFwJywgZGVsZXRlUHJvcGVydHkodGhpcy5fZGF0YS5jaGlsZEtleU1hcCwgY2hpbGRLZXkpKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICB0aGlzLl9zZXQoJ2NoaWxkS2V5TWFwJywgZGVsZXRlUHJvcGVydHkodGhpcy5fZGF0YS5jaGlsZEtleU1hcCwgcm9vdEtleSkpO1xuICAgIH1cbiAgICB0aGlzLl9zZXQoJ3Zjc1N0YXR1c2VzQnlSb290JywgZGVsZXRlUHJvcGVydHkodGhpcy5fZGF0YS52Y3NTdGF0dXNlc0J5Um9vdCwgcm9vdEtleSkpO1xuICB9XG5cbiAgX3NldFRyYWNrZWROb2RlKHJvb3RLZXk6IHN0cmluZywgbm9kZUtleTogc3RyaW5nKTogdm9pZCB7XG4gICAgLy8gRmx1c2ggdGhlIHZhbHVlIHRvIGVuc3VyZSBjbGllbnRzIHNlZSB0aGUgdmFsdWUgYXQgbGVhc3Qgb25jZSBhbmQgc2Nyb2xsIGFwcHJvcHJpYXRlbHkuXG4gICAgdGhpcy5fc2V0KCd0cmFja2VkTm9kZScsIHtub2RlS2V5LCByb290S2V5fSwgdHJ1ZSk7XG4gIH1cblxuICBfc2V0UmVwb3NpdG9yaWVzKHJlcG9zaXRvcmllczogSW1tdXRhYmxlLlNldDxhdG9tJFJlcG9zaXRvcnk+KTogdm9pZCB7XG4gICAgdGhpcy5fc2V0KCdyZXBvc2l0b3JpZXMnLCByZXBvc2l0b3JpZXMpO1xuXG4gICAgLy8gV2hlbmV2ZXIgYSBuZXcgc2V0IG9mIHJlcG9zaXRvcmllcyBjb21lcyBpbiwgaW52YWxpZGF0ZSBvdXIgcGF0aHMgY2FjaGUgYnkgcmVzZXR0aW5nIGl0c1xuICAgIC8vIGBjYWNoZWAgcHJvcGVydHkgKGNyZWF0ZWQgYnkgbG9kYXNoLm1lbW9pemUpIHRvIGFuIGVtcHR5IG1hcC5cbiAgICB0aGlzLl9yZXBvc2l0b3J5Rm9yUGF0aC5jYWNoZSA9IG5ldyBNYXAoKTtcbiAgfVxuXG4gIF9vbWl0SGlkZGVuUGF0aHMobm9kZUtleXM6IEFycmF5PHN0cmluZz4pOiBBcnJheTxzdHJpbmc+IHtcbiAgICBpZiAoIXRoaXMuX2RhdGEuaGlkZUlnbm9yZWROYW1lcyAmJiAhdGhpcy5fZGF0YS5leGNsdWRlVmNzSWdub3JlZFBhdGhzKSB7XG4gICAgICByZXR1cm4gbm9kZUtleXM7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5vZGVLZXlzLmZpbHRlcihub2RlS2V5ID0+ICF0aGlzLl9zaG91bGRIaWRlUGF0aChub2RlS2V5KSk7XG4gIH1cblxuICBfc2hvdWxkSGlkZVBhdGgobm9kZUtleTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgY29uc3Qge2hpZGVJZ25vcmVkTmFtZXMsIGV4Y2x1ZGVWY3NJZ25vcmVkUGF0aHMsIGlnbm9yZWRQYXR0ZXJuc30gPSB0aGlzLl9kYXRhO1xuICAgIGlmIChoaWRlSWdub3JlZE5hbWVzICYmIG1hdGNoZXNTb21lKG5vZGVLZXksIGlnbm9yZWRQYXR0ZXJucykpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBpZiAoZXhjbHVkZVZjc0lnbm9yZWRQYXRocyAmJiBpc1Zjc0lnbm9yZWQobm9kZUtleSwgdGhpcy5fcmVwb3NpdG9yeUZvclBhdGgobm9kZUtleSkpKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcmVzZXQoKTogdm9pZCB7XG4gICAgY29uc3Qgc3Vic2NyaXB0aW9uTWFwID0gdGhpcy5fZGF0YS5zdWJzY3JpcHRpb25NYXA7XG4gICAgZm9yIChjb25zdCBub2RlS2V5IG9mIE9iamVjdC5rZXlzKHN1YnNjcmlwdGlvbk1hcCkpIHtcbiAgICAgIGNvbnN0IHN1YnNjcmlwdGlvbiA9IHN1YnNjcmlwdGlvbk1hcFtub2RlS2V5XTtcbiAgICAgIGlmIChzdWJzY3JpcHRpb24pIHtcbiAgICAgICAgc3Vic2NyaXB0aW9uLmRpc3Bvc2UoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBSZXNldCBkYXRhIHN0b3JlLlxuICAgIHRoaXMuX2RhdGEgPSB0aGlzLl9nZXREZWZhdWx0cygpO1xuICB9XG5cbiAgc3Vic2NyaWJlKGxpc3RlbmVyOiBDaGFuZ2VMaXN0ZW5lcik6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5fZW1pdHRlci5vbignY2hhbmdlJywgbGlzdGVuZXIpO1xuICB9XG59XG5cbi8vIEEgaGVscGVyIHRvIGRlbGV0ZSBhIHByb3BlcnR5IGluIGFuIG9iamVjdCB1c2luZyBzaGFsbG93IGNvcHkgcmF0aGVyIHRoYW4gbXV0YXRpb25cbmZ1bmN0aW9uIGRlbGV0ZVByb3BlcnR5KG9iamVjdDogT2JqZWN0LCBrZXk6IHN0cmluZyk6IE9iamVjdCB7XG4gIGlmICghb2JqZWN0Lmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICByZXR1cm4gb2JqZWN0O1xuICB9XG4gIGNvbnN0IG5ld09iamVjdCA9IHsuLi5vYmplY3R9O1xuICBkZWxldGUgbmV3T2JqZWN0W2tleV07XG4gIHJldHVybiBuZXdPYmplY3Q7XG59XG5cbi8vIEEgaGVscGVyIHRvIHNldCBhIHByb3BlcnR5IGluIGFuIG9iamVjdCB1c2luZyBzaGFsbG93IGNvcHkgcmF0aGVyIHRoYW4gbXV0YXRpb25cbmZ1bmN0aW9uIHNldFByb3BlcnR5KG9iamVjdDogT2JqZWN0LCBrZXk6IHN0cmluZywgbmV3VmFsdWU6IG1peGVkKTogT2JqZWN0IHtcbiAgY29uc3Qgb2xkVmFsdWUgPSBvYmplY3Rba2V5XTtcbiAgaWYgKG9sZFZhbHVlID09PSBuZXdWYWx1ZSkge1xuICAgIHJldHVybiBvYmplY3Q7XG4gIH1cbiAgY29uc3QgbmV3T2JqZWN0ID0gey4uLm9iamVjdH07XG4gIG5ld09iamVjdFtrZXldID0gbmV3VmFsdWU7XG4gIHJldHVybiBuZXdPYmplY3Q7XG59XG5cbi8vIENyZWF0ZSBhIG5ldyBvYmplY3QgYnkgbWFwcGluZyBvdmVyIHRoZSBwcm9wZXJ0aWVzIG9mIGEgZ2l2ZW4gb2JqZWN0LCBjYWxsaW5nIHRoZSBnaXZlblxuLy8gZnVuY3Rpb24gb24gZWFjaCBvbmUuXG5mdW5jdGlvbiBtYXBWYWx1ZXMob2JqZWN0OiBPYmplY3QsIGZuOiBGdW5jdGlvbik6IE9iamVjdCB7XG4gIGNvbnN0IG5ld09iamVjdCA9IHt9O1xuICBPYmplY3Qua2V5cyhvYmplY3QpLmZvckVhY2goa2V5ID0+IHtcbiAgICBuZXdPYmplY3Rba2V5XSA9IGZuKG9iamVjdFtrZXldLCBrZXkpO1xuICB9KTtcbiAgcmV0dXJuIG5ld09iamVjdDtcbn1cblxuLy8gRGV0ZXJtaW5lIHdoZXRoZXIgdGhlIGdpdmVuIHN0cmluZyBtYXRjaGVzIGFueSBvZiBhIHNldCBvZiBwYXR0ZXJucy5cbmZ1bmN0aW9uIG1hdGNoZXNTb21lKHN0cjogc3RyaW5nLCBwYXR0ZXJuczogSW1tdXRhYmxlLlNldDxNaW5pbWF0Y2g+KSB7XG4gIHJldHVybiBwYXR0ZXJucy5zb21lKHBhdHRlcm4gPT4gcGF0dGVybi5tYXRjaChzdHIpKTtcbn1cblxuZnVuY3Rpb24gaXNWY3NJZ25vcmVkKG5vZGVLZXk6IHN0cmluZywgcmVwbzogP2F0b20kUmVwb3NpdG9yeSkge1xuICByZXR1cm4gcmVwbyAmJiByZXBvLmlzUHJvamVjdEF0Um9vdCgpICYmIHJlcG8uaXNQYXRoSWdub3JlZChub2RlS2V5KTtcbn1cblxuXG4vKipcbiAqIFBlcmZvcm1zIGEgYnJlYWR0aC1maXJzdCBpdGVyYXRpb24gb3ZlciB0aGUgZGlyZWN0b3JpZXMgb2YgdGhlIHRyZWUgc3RhcnRpbmdcbiAqIHdpdGggYSBnaXZlbiBub2RlLiBUaGUgaXRlcmF0aW9uIHN0b3BzIG9uY2UgYSBnaXZlbiBsaW1pdCBvZiBub2RlcyAoYm90aCBkaXJlY3Rvcmllc1xuICogYW5kIGZpbGVzKSB3ZXJlIHRyYXZlcnNlZC5cbiAqIFRoZSBub2RlIGJlaW5nIGN1cnJlbnRseSB0cmF2ZXJzZWQgY2FuIGJlIG9idGFpbmVkIGJ5IGNhbGxpbmcgLnRyYXZlcnNlZE5vZGUoKVxuICogLm5leHQoKSByZXR1cm5zIGEgcHJvbWlzZSB0aGF0IGlzIGZ1bGZpbGxlZCB3aGVuIHRoZSB0cmF2ZXJzYWwgbW92ZXMgb24gdG9cbiAqIHRoZSBuZXh0IGRpcmVjdG9yeS5cbiAqL1xuY2xhc3MgRmlsZVRyZWVTdG9yZUJmc0l0ZXJhdG9yIHtcbiAgX2ZpbGVUcmVlU3RvcmU6IEZpbGVUcmVlU3RvcmU7XG4gIF9yb290S2V5OiBzdHJpbmc7XG4gIF9ub2Rlc1RvVHJhdmVyc2U6IEFycmF5PHN0cmluZz47XG4gIF9jdXJyZW50bHlUcmF2ZXJzZWROb2RlOiA/c3RyaW5nO1xuICBfbGltaXQ6IG51bWJlcjtcbiAgX251bU5vZGVzVHJhdmVyc2VkOiBudW1iZXI7XG4gIF9wcm9taXNlOiA/UHJvbWlzZTx2b2lkPjtcbiAgX2NvdW50OiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBmaWxlVHJlZVN0b3JlOiBGaWxlVHJlZVN0b3JlLFxuICAgICAgcm9vdEtleTogc3RyaW5nLFxuICAgICAgbm9kZUtleTogc3RyaW5nLFxuICAgICAgbGltaXQ6IG51bWJlcikge1xuICAgIHRoaXMuX2ZpbGVUcmVlU3RvcmUgPSBmaWxlVHJlZVN0b3JlO1xuICAgIHRoaXMuX3Jvb3RLZXkgPSByb290S2V5O1xuICAgIHRoaXMuX25vZGVzVG9UcmF2ZXJzZSA9IFtdO1xuICAgIHRoaXMuX2N1cnJlbnRseVRyYXZlcnNlZE5vZGUgPSBub2RlS2V5O1xuICAgIHRoaXMuX2xpbWl0ID0gbGltaXQ7XG4gICAgdGhpcy5fbnVtTm9kZXNUcmF2ZXJzZWQgPSAwO1xuICAgIHRoaXMuX3Byb21pc2UgPSBudWxsO1xuICAgIHRoaXMuX2NvdW50ID0gMDtcbiAgfVxuXG4gIF9oYW5kbGVQcm9taXNlUmVzb2x1dGlvbihjaGlsZHJlbktleXM6IEFycmF5PHN0cmluZz4pOiB2b2lkIHtcbiAgICB0aGlzLl9udW1Ob2Rlc1RyYXZlcnNlZCArPSBjaGlsZHJlbktleXMubGVuZ3RoO1xuICAgIGlmICh0aGlzLl9udW1Ob2Rlc1RyYXZlcnNlZCA8IHRoaXMuX2xpbWl0KSB7XG4gICAgICBjb25zdCBuZXh0TGV2ZWxOb2RlcyA9IGNoaWxkcmVuS2V5cy5maWx0ZXIoY2hpbGRLZXkgPT4gRmlsZVRyZWVIZWxwZXJzLmlzRGlyS2V5KGNoaWxkS2V5KSk7XG4gICAgICB0aGlzLl9ub2Rlc1RvVHJhdmVyc2UgPSB0aGlzLl9ub2Rlc1RvVHJhdmVyc2UuY29uY2F0KG5leHRMZXZlbE5vZGVzKTtcblxuICAgICAgdGhpcy5fY3VycmVudGx5VHJhdmVyc2VkTm9kZSA9IHRoaXMuX25vZGVzVG9UcmF2ZXJzZS5zcGxpY2UoMCwgMSlbMF07XG4gICAgICB0aGlzLl9wcm9taXNlID0gbnVsbDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fY3VycmVudGx5VHJhdmVyc2VkTm9kZSA9IG51bGw7XG4gICAgICB0aGlzLl9wcm9taXNlID0gbnVsbDtcbiAgICB9XG5cbiAgICByZXR1cm47XG4gIH1cblxuICBuZXh0KCk6ID9Qcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBjdXJyZW50bHlUcmF2ZXJzZWROb2RlID0gdGhpcy5fY3VycmVudGx5VHJhdmVyc2VkTm9kZTtcbiAgICBpZiAoIXRoaXMuX3Byb21pc2UgJiYgY3VycmVudGx5VHJhdmVyc2VkTm9kZSkge1xuICAgICAgdGhpcy5fcHJvbWlzZSA9IHRoaXMuX2ZpbGVUcmVlU3RvcmUucHJvbWlzZU5vZGVDaGlsZEtleXMoXG4gICAgICAgIHRoaXMuX3Jvb3RLZXksXG4gICAgICAgIGN1cnJlbnRseVRyYXZlcnNlZE5vZGUpXG4gICAgICAudGhlbih0aGlzLl9oYW5kbGVQcm9taXNlUmVzb2x1dGlvbi5iaW5kKHRoaXMpKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX3Byb21pc2U7XG4gIH1cblxuICB0cmF2ZXJzZWROb2RlKCk6ID9zdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9jdXJyZW50bHlUcmF2ZXJzZWROb2RlO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRmlsZVRyZWVTdG9yZTtcbiJdfQ==