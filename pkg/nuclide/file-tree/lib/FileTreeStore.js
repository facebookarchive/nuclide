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

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

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

var _workingSets = require('../../working-sets');

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
        usePrefixNav: true,
        repositories: _immutable2['default'].Set(),
        workingSet: new _workingSets.WorkingSet(),
        openFilesWorkingSet: new _workingSets.WorkingSet(),
        workingSetsStore: null,
        isEditingWorkingSet: false,
        editedWorkingSet: new _workingSets.WorkingSet()
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
        case _FileTreeConstants.ActionType.SET_USE_PREFIX_NAV:
          this._setUsePrefixNav(payload.usePrefixNav);
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
        case _FileTreeConstants.ActionType.SET_WORKING_SET:
          this._setWorkingSet(payload.workingSet);
          break;
        case _FileTreeConstants.ActionType.SET_OPEN_FILES_WORKING_SET:
          this._setOpenFilesWorkingSet(payload.openFilesWorkingSet);
          break;
        case _FileTreeConstants.ActionType.SET_WORKING_SETS_STORE:
          this._setWorkingSetsStore(payload.workingSetsStore);
          break;
        case _FileTreeConstants.ActionType.START_EDITING_WORKING_SET:
          this._startEditingWorkingSet(payload.editedWorkingSet);
          break;
        case _FileTreeConstants.ActionType.FINISH_EDITING_WORKING_SET:
          this._finishEditingWorkingSet();
          break;
        case _FileTreeConstants.ActionType.CHECK_NODE:
          this._checkNode(payload.rootKey, payload.nodeKey);
          break;
        case _FileTreeConstants.ActionType.UNCHECK_NODE:
          this._uncheckNode(payload.rootKey, payload.nodeKey);
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
    key: 'getWorkingSet',
    value: function getWorkingSet() {
      return this._data.workingSet;
    }
  }, {
    key: 'getOpenFilesWorkingSet',
    value: function getOpenFilesWorkingSet() {
      return this._data.openFilesWorkingSet;
    }
  }, {
    key: 'getWorkingSetsStore',
    value: function getWorkingSetsStore() {
      return this._data.workingSetsStore;
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
    key: '_setUsePrefixNav',
    value: function _setUsePrefixNav(usePrefixNav) {
      this._set('usePrefixNav', usePrefixNav);
    }
  }, {
    key: 'usePreviewTabs',
    value: function usePreviewTabs() {
      return this._data.usePreviewTabs;
    }
  }, {
    key: 'usePrefixNav',
    value: function usePrefixNav() {
      return this._data.usePrefixNav;
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
  }, {
    key: 'isEditingWorkingSet',
    value: function isEditingWorkingSet() {
      return this._data.isEditingWorkingSet;
    }
  }, {
    key: 'getEditedWorkingSet',
    value: function getEditedWorkingSet() {
      return this._data.editedWorkingSet;
    }
  }, {
    key: '_setEditedWorkingSet',
    value: function _setEditedWorkingSet(editedWorkingSet) {
      this._set('editedWorkingSet', editedWorkingSet);
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
    key: '_setWorkingSet',
    value: function _setWorkingSet(workingSet) {
      this._set('workingSet', workingSet);
    }
  }, {
    key: '_setOpenFilesWorkingSet',
    value: function _setOpenFilesWorkingSet(openFilesWorkingSet) {
      this._set('openFilesWorkingSet', openFilesWorkingSet);
    }
  }, {
    key: '_setWorkingSetsStore',
    value: function _setWorkingSetsStore(workingSetsStore) {
      this._set('workingSetsStore', workingSetsStore);
    }
  }, {
    key: '_startEditingWorkingSet',
    value: function _startEditingWorkingSet(editedWorkingSet) {
      if (!this._data.isEditingWorkingSet) {
        this._set('isEditingWorkingSet', true);
        this._setEditedWorkingSet(editedWorkingSet);
      }
    }
  }, {
    key: '_finishEditingWorkingSet',
    value: function _finishEditingWorkingSet() {
      if (this._data.isEditingWorkingSet) {
        this._set('isEditingWorkingSet', false);
        this._setEditedWorkingSet(new _workingSets.WorkingSet());
      }
    }
  }, {
    key: '_checkNode',
    value: function _checkNode(rootKey, nodeKey) {
      if (!this._data.isEditingWorkingSet) {
        return;
      }

      var editedWorkingSet = this._data.editedWorkingSet.append(nodeKey);

      var node = this.getNode(rootKey, nodeKey);
      if (node.isRoot) {
        this._setEditedWorkingSet(editedWorkingSet);
        return;
      }

      var parent = node.getParentNode();
      var childrenKeys = this.getCachedChildKeys(rootKey, parent.nodeKey);
      if (childrenKeys.every(function (ck) {
        return editedWorkingSet.containsFile(ck);
      })) {
        this._checkNode(rootKey, parent.nodeKey);
      } else {
        this._setEditedWorkingSet(editedWorkingSet);
      }
    }
  }, {
    key: '_uncheckNode',
    value: function _uncheckNode(rootKey, nodeKey) {
      if (!this._data.isEditingWorkingSet) {
        return;
      }

      var node = this.getNode(rootKey, nodeKey);
      if (node.isRoot) {
        this._setEditedWorkingSet(this._data.editedWorkingSet.remove(nodeKey));
        return;
      }

      var parent = node.getParentNode();
      if (this._data.editedWorkingSet.containsFile(parent.nodeKey)) {
        var _data$editedWorkingSet;

        this._uncheckNode(rootKey, parent.nodeKey);
        var childrenKeys = this.getCachedChildKeys(rootKey, parent.nodeKey);
        var siblingsKeys = childrenKeys.filter(function (ck) {
          return ck !== nodeKey;
        });

        this._setEditedWorkingSet((_data$editedWorkingSet = this._data.editedWorkingSet).append.apply(_data$editedWorkingSet, _toConsumableArray(siblingsKeys)));
      } else {
        this._setEditedWorkingSet(this._data.editedWorkingSet.remove(nodeKey));
      }
    }
  }, {
    key: '_omitHiddenPaths',
    value: function _omitHiddenPaths(nodeKeys) {
      var _this15 = this;

      if (!this._data.hideIgnoredNames && !this._data.excludeVcsIgnoredPaths && this._data.workingSet.isEmpty()) {
        return nodeKeys;
      }

      return nodeKeys.filter(function (nodeKey) {
        return !_this15._shouldHidePath(nodeKey);
      });
    }
  }, {
    key: '_shouldHidePath',
    value: function _shouldHidePath(nodeKey) {
      var isIgnoredPath = this._isIgnoredPath(nodeKey);
      var isExcludedFromWs = this._isExcludedFromWorkingSet(nodeKey);
      var isExcludedFromOpenFilesWs = this._isExcludedFromOpenFilesWorkingSet(nodeKey);

      if (isIgnoredPath) {
        return true;
      }

      return isExcludedFromWs && isExcludedFromOpenFilesWs;
    }
  }, {
    key: '_isIgnoredPath',
    value: function _isIgnoredPath(nodeKey) {
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
    key: '_isExcludedFromWorkingSet',
    value: function _isExcludedFromWorkingSet(nodeKey) {
      var _data2 = this._data;
      var workingSet = _data2.workingSet;
      var isEditingWorkingSet = _data2.isEditingWorkingSet;

      if (!isEditingWorkingSet) {
        if (_FileTreeHelpers2['default'].isDirKey(nodeKey)) {
          return !workingSet.containsDir(nodeKey);
        } else {
          return !workingSet.containsFile(nodeKey);
        }
      }

      return false;
    }
  }, {
    key: '_isExcludedFromOpenFilesWorkingSet',
    value: function _isExcludedFromOpenFilesWorkingSet(nodeKey) {
      var _data3 = this._data;
      var openFilesWorkingSet = _data3.openFilesWorkingSet;
      var isEditingWorkingSet = _data3.isEditingWorkingSet;

      if (isEditingWorkingSet) {
        return false;
      }

      if (openFilesWorkingSet.isEmpty()) {
        return true;
      }

      if (_FileTreeHelpers2['default'].isDirKey(nodeKey)) {
        return !openFilesWorkingSet.containsDir(nodeKey);
      } else {
        return !openFilesWorkingSet.containsFile(nodeKey);
      }
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
//# sourceMappingURL=data:application/json;base64,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O1dBRVkseUJBQVk7QUFDdkIsYUFBTyxJQUFJLENBQUMsdUJBQXVCLENBQUM7S0FDckM7OztTQXRERyx3QkFBd0I7OztBQXlEOUIsTUFBTSxDQUFDLE9BQU8sR0FBRyxhQUFhLENBQUMiLCJmaWxlIjoiRmlsZVRyZWVTdG9yZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtIZ1JlcG9zaXRvcnlDbGllbnR9IGZyb20gJy4uLy4uL2hnLXJlcG9zaXRvcnktY2xpZW50JztcbmltcG9ydCB0eXBlIHtcbiAgUmVtb3RlRGlyZWN0b3J5LFxuICBSZW1vdGVGaWxlLFxufSBmcm9tICcuLi8uLi9yZW1vdGUtY29ubmVjdGlvbic7XG5cbmltcG9ydCBGaWxlVHJlZURpc3BhdGNoZXIgZnJvbSAnLi9GaWxlVHJlZURpc3BhdGNoZXInO1xuaW1wb3J0IEZpbGVUcmVlSGVscGVycyBmcm9tICcuL0ZpbGVUcmVlSGVscGVycyc7XG5pbXBvcnQgRmlsZVRyZWVOb2RlIGZyb20gJy4vRmlsZVRyZWVOb2RlJztcbmltcG9ydCBJbW11dGFibGUgZnJvbSAnaW1tdXRhYmxlJztcbmltcG9ydCB7QWN0aW9uVHlwZX0gZnJvbSAnLi9GaWxlVHJlZUNvbnN0YW50cyc7XG5pbXBvcnQge0Rpc3Bvc2FibGUsIEVtaXR0ZXJ9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHtNaW5pbWF0Y2h9IGZyb20gJ21pbmltYXRjaCc7XG5pbXBvcnQge3JlcG9zaXRvcnlDb250YWluc1BhdGh9IGZyb20gJy4uLy4uL2hnLWdpdC1icmlkZ2UnO1xuaW1wb3J0IHtyZXBvc2l0b3J5Rm9yUGF0aH0gZnJvbSAnLi4vLi4vaGctZ2l0LWJyaWRnZSc7XG5pbXBvcnQge1N0YXR1c0NvZGVOdW1iZXJ9IGZyb20gJy4uLy4uL2hnLXJlcG9zaXRvcnktYmFzZS9saWIvaGctY29uc3RhbnRzJztcblxuaW1wb3J0IHthcnJheX0gZnJvbSAnLi4vLi4vY29tbW9ucyc7XG5pbXBvcnQge2dldExvZ2dlcn0gZnJvbSAnLi4vLi4vbG9nZ2luZyc7XG5pbXBvcnQge29iamVjdCBhcyBvYmplY3RVdGlsfSBmcm9tICcuLi8uLi9jb21tb25zJztcbmltcG9ydCBzaGVsbCBmcm9tICdzaGVsbCc7XG5pbXBvcnQgbWVtb2l6ZSBmcm9tICdsb2Rhc2gubWVtb2l6ZSc7XG5cbmltcG9ydCB7V29ya2luZ1NldH0gZnJvbSAnLi4vLi4vd29ya2luZy1zZXRzJztcblxuLy8gVXNlZCB0byBlbnN1cmUgdGhlIHZlcnNpb24gd2Ugc2VyaWFsaXplZCBpcyB0aGUgc2FtZSB2ZXJzaW9uIHdlIGFyZSBkZXNlcmlhbGl6aW5nLlxuY29uc3QgVkVSU0lPTiA9IDE7XG5cbmltcG9ydCB0eXBlIHtEaXNwYXRjaGVyfSBmcm9tICdmbHV4JztcbmltcG9ydCB0eXBlIHtOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9yZW1vdGUtdXJpJztcbmltcG9ydCB0eXBlIHtXb3JraW5nU2V0c1N0b3JlfSBmcm9tICcuLi8uLi93b3JraW5nLXNldHMvbGliL1dvcmtpbmdTZXRzU3RvcmUnO1xuXG5cbnR5cGUgQWN0aW9uUGF5bG9hZCA9IE9iamVjdDtcbnR5cGUgQ2hhbmdlTGlzdGVuZXIgPSAoKSA9PiBtaXhlZDtcbmV4cG9ydCB0eXBlIEZpbGVUcmVlTm9kZURhdGEgPSB7XG4gIG5vZGVLZXk6IHN0cmluZztcbiAgcm9vdEtleTogc3RyaW5nO1xufVxuXG50eXBlIFN0b3JlRGF0YSA9IHtcbiAgY2hpbGRLZXlNYXA6IHsgW2tleTogc3RyaW5nXTogQXJyYXk8c3RyaW5nPiB9O1xuICBpc0RpcnR5TWFwOiB7IFtrZXk6IHN0cmluZ106IGJvb2xlYW4gfTtcbiAgZXhwYW5kZWRLZXlzQnlSb290OiB7IFtrZXk6IHN0cmluZ106IEltbXV0YWJsZS5TZXQ8c3RyaW5nPiB9O1xuICB0cmFja2VkTm9kZTogP0ZpbGVUcmVlTm9kZURhdGE7XG4gIC8vIFNhdmVzIGEgbGlzdCBvZiBjaGlsZCBub2RlcyB0aGF0IHNob3VsZCBiZSBleHBhbmRlIHdoZW4gYSBnaXZlbiBrZXkgaXMgZXhwYW5kZWQuXG4gIC8vIExvb2tzIGxpa2U6IHsgcm9vdEtleTogeyBub2RlS2V5OiBbY2hpbGRLZXkxLCBjaGlsZEtleTJdIH0gfS5cbiAgcHJldmlvdXNseUV4cGFuZGVkOiB7IFtyb290S2V5OiBzdHJpbmddOiBJbW11dGFibGUuTWFwPHN0cmluZywgQXJyYXk8U3RyaW5nPj4gfTtcbiAgaXNMb2FkaW5nTWFwOiB7IFtrZXk6IHN0cmluZ106ID9Qcm9taXNlIH07XG4gIHJvb3RLZXlzOiBBcnJheTxzdHJpbmc+O1xuICBzZWxlY3RlZEtleXNCeVJvb3Q6IHsgW2tleTogc3RyaW5nXTogSW1tdXRhYmxlLk9yZGVyZWRTZXQ8c3RyaW5nPiB9O1xuICBzdWJzY3JpcHRpb25NYXA6IHsgW2tleTogc3RyaW5nXTogRGlzcG9zYWJsZSB9O1xuICB2Y3NTdGF0dXNlc0J5Um9vdDogeyBba2V5OiBzdHJpbmddOiBJbW11dGFibGUuTWFwPHN0cmluZywgbnVtYmVyPiB9O1xuICBpZ25vcmVkUGF0dGVybnM6IEltbXV0YWJsZS5TZXQ8TWluaW1hdGNoPjtcbiAgaGlkZUlnbm9yZWROYW1lczogYm9vbGVhbjtcbiAgZXhjbHVkZVZjc0lnbm9yZWRQYXRoczogYm9vbGVhbjtcbiAgdXNlUHJldmlld1RhYnM6IGJvb2xlYW47XG4gIHVzZVByZWZpeE5hdjogYm9vbGVhbjtcbiAgcmVwb3NpdG9yaWVzOiBJbW11dGFibGUuU2V0PGF0b20kUmVwb3NpdG9yeT47XG4gIHdvcmtpbmdTZXQ6IFdvcmtpbmdTZXQ7XG4gIG9wZW5GaWxlc1dvcmtpbmdTZXQ6IFdvcmtpbmdTZXQ7XG4gIHdvcmtpbmdTZXRzU3RvcmU6ID9Xb3JraW5nU2V0c1N0b3JlO1xuICBpc0VkaXRpbmdXb3JraW5nU2V0OiBib29sZWFuO1xuICBlZGl0ZWRXb3JraW5nU2V0OiBXb3JraW5nU2V0O1xufTtcblxuZXhwb3J0IHR5cGUgRXhwb3J0U3RvcmVEYXRhID0ge1xuICBjaGlsZEtleU1hcDogeyBba2V5OiBzdHJpbmddOiBBcnJheTxzdHJpbmc+IH07XG4gIGV4cGFuZGVkS2V5c0J5Um9vdDogeyBba2V5OiBzdHJpbmddOiBBcnJheTxzdHJpbmc+IH07XG4gIHJvb3RLZXlzOiBBcnJheTxzdHJpbmc+O1xuICBzZWxlY3RlZEtleXNCeVJvb3Q6IHsgW2tleTogc3RyaW5nXTogQXJyYXk8c3RyaW5nPiB9O1xuICB2ZXJzaW9uOiBudW1iZXI7XG59O1xuXG5sZXQgaW5zdGFuY2U6ID9PYmplY3Q7XG5cbi8qKlxuICogSW1wbGVtZW50cyB0aGUgRmx1eCBwYXR0ZXJuIGZvciBvdXIgZmlsZSB0cmVlLiBBbGwgc3RhdGUgZm9yIHRoZSBmaWxlIHRyZWUgd2lsbCBiZSBrZXB0IGluXG4gKiBGaWxlVHJlZVN0b3JlIGFuZCB0aGUgb25seSB3YXkgdG8gdXBkYXRlIHRoZSBzdG9yZSBpcyB0aHJvdWdoIG1ldGhvZHMgb24gRmlsZVRyZWVBY3Rpb25zLiBUaGVcbiAqIGRpc3BhdGNoZXIgaXMgYSBtZWNoYW5pc20gdGhyb3VnaCB3aGljaCBGaWxlVHJlZUFjdGlvbnMgaW50ZXJmYWNlcyB3aXRoIEZpbGVUcmVlU3RvcmUuXG4gKi9cbmNsYXNzIEZpbGVUcmVlU3RvcmUge1xuICBfZGF0YTogU3RvcmVEYXRhO1xuICBfZGlzcGF0Y2hlcjogRGlzcGF0Y2hlcjtcbiAgX2VtaXR0ZXI6IEVtaXR0ZXI7XG4gIF9sb2dnZXI6IGFueTtcbiAgX3RpbWVyOiA/T2JqZWN0O1xuICBfcmVwb3NpdG9yeUZvclBhdGg6IChwYXRoOiBOdWNsaWRlVXJpKSA9PiA/YXRvbSRSZXBvc2l0b3J5O1xuXG4gIHN0YXRpYyBnZXRJbnN0YW5jZSgpOiBGaWxlVHJlZVN0b3JlIHtcbiAgICBpZiAoIWluc3RhbmNlKSB7XG4gICAgICBpbnN0YW5jZSA9IG5ldyBGaWxlVHJlZVN0b3JlKCk7XG4gICAgfVxuICAgIHJldHVybiBpbnN0YW5jZTtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX2RhdGEgPSB0aGlzLl9nZXREZWZhdWx0cygpO1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIgPSBGaWxlVHJlZURpc3BhdGNoZXIuZ2V0SW5zdGFuY2UoKTtcbiAgICB0aGlzLl9lbWl0dGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICB0aGlzLl9kaXNwYXRjaGVyLnJlZ2lzdGVyKFxuICAgICAgcGF5bG9hZCA9PiB0aGlzLl9vbkRpc3BhdGNoKHBheWxvYWQpXG4gICAgKTtcbiAgICB0aGlzLl9sb2dnZXIgPSBnZXRMb2dnZXIoKTtcbiAgICB0aGlzLl9yZXBvc2l0b3J5Rm9yUGF0aCA9IG1lbW9pemUodGhpcy5fcmVwb3NpdG9yeUZvclBhdGgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRPRE86IE1vdmUgdG8gYSBbc2VyaWFsaXphdGlvbiBjbGFzc11bMV0gYW5kIHVzZSB0aGUgYnVpbHQtaW4gdmVyc2lvbmluZyBtZWNoYW5pc20uIFRoaXMgbWlnaHRcbiAgICogbmVlZCB0byBiZSBkb25lIG9uZSBsZXZlbCBoaWdoZXIgd2l0aGluIG1haW4uanMuXG4gICAqXG4gICAqIFsxXTogaHR0cHM6Ly9hdG9tLmlvL2RvY3MvbGF0ZXN0L2JlaGluZC1hdG9tLXNlcmlhbGl6YXRpb24taW4tYXRvbVxuICAgKi9cbiAgZXhwb3J0RGF0YSgpOiBFeHBvcnRTdG9yZURhdGEge1xuICAgIGNvbnN0IGRhdGEgPSB0aGlzLl9kYXRhO1xuICAgIC8vIEdyYWIgdGhlIGNoaWxkIGtleXMgb2Ygb25seSB0aGUgZXhwYW5kZWQgbm9kZXMuXG4gICAgY29uc3QgY2hpbGRLZXlNYXAgPSB7fTtcbiAgICBPYmplY3Qua2V5cyhkYXRhLmV4cGFuZGVkS2V5c0J5Um9vdCkuZm9yRWFjaChyb290S2V5ID0+IHtcbiAgICAgIGNvbnN0IGV4cGFuZGVkS2V5U2V0ID0gZGF0YS5leHBhbmRlZEtleXNCeVJvb3Rbcm9vdEtleV07XG4gICAgICBmb3IgKGNvbnN0IG5vZGVLZXkgb2YgZXhwYW5kZWRLZXlTZXQpIHtcbiAgICAgICAgY2hpbGRLZXlNYXBbbm9kZUtleV0gPSBkYXRhLmNoaWxkS2V5TWFwW25vZGVLZXldO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiB7XG4gICAgICB2ZXJzaW9uOiBWRVJTSU9OLFxuICAgICAgY2hpbGRLZXlNYXA6IGNoaWxkS2V5TWFwLFxuICAgICAgZXhwYW5kZWRLZXlzQnlSb290OiBtYXBWYWx1ZXMoZGF0YS5leHBhbmRlZEtleXNCeVJvb3QsIGtleVNldCA9PiBrZXlTZXQudG9BcnJheSgpKSxcbiAgICAgIHJvb3RLZXlzOiBkYXRhLnJvb3RLZXlzLFxuICAgICAgc2VsZWN0ZWRLZXlzQnlSb290OiBtYXBWYWx1ZXMoZGF0YS5zZWxlY3RlZEtleXNCeVJvb3QsIGtleVNldCA9PiBrZXlTZXQudG9BcnJheSgpKSxcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIEltcG9ydHMgc3RvcmUgZGF0YSBmcm9tIGEgcHJldmlvdXMgZXhwb3J0LlxuICAgKi9cbiAgbG9hZERhdGEoZGF0YTogRXhwb3J0U3RvcmVEYXRhKTogdm9pZCB7XG4gICAgLy8gRW5zdXJlIHdlIGFyZSBub3QgdHJ5aW5nIHRvIGxvYWQgZGF0YSBmcm9tIGFuIGVhcmxpZXIgdmVyc2lvbiBvZiB0aGlzIHBhY2thZ2UuXG4gICAgaWYgKGRhdGEudmVyc2lvbiAhPT0gVkVSU0lPTikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLl9kYXRhID0ge1xuICAgICAgLi4udGhpcy5fZ2V0RGVmYXVsdHMoKSxcbiAgICAgIGNoaWxkS2V5TWFwOiBkYXRhLmNoaWxkS2V5TWFwLFxuICAgICAgZXhwYW5kZWRLZXlzQnlSb290OiBtYXBWYWx1ZXMoZGF0YS5leHBhbmRlZEtleXNCeVJvb3QsIGtleXMgPT4gbmV3IEltbXV0YWJsZS5TZXQoa2V5cykpLFxuICAgICAgcm9vdEtleXM6IGRhdGEucm9vdEtleXMsXG4gICAgICBzZWxlY3RlZEtleXNCeVJvb3Q6XG4gICAgICAgIG1hcFZhbHVlcyhkYXRhLnNlbGVjdGVkS2V5c0J5Um9vdCwga2V5cyA9PiBuZXcgSW1tdXRhYmxlLk9yZGVyZWRTZXQoa2V5cykpLFxuICAgIH07XG4gICAgT2JqZWN0LmtleXMoZGF0YS5jaGlsZEtleU1hcCkuZm9yRWFjaChub2RlS2V5ID0+IHtcbiAgICAgIHRoaXMuX2FkZFN1YnNjcmlwdGlvbihub2RlS2V5KTtcbiAgICAgIHRoaXMuX2ZldGNoQ2hpbGRLZXlzKG5vZGVLZXkpO1xuICAgIH0pO1xuICB9XG5cbiAgX3NldEV4Y2x1ZGVWY3NJZ25vcmVkUGF0aHMoZXhjbHVkZVZjc0lnbm9yZWRQYXRoczogYm9vbGVhbik6IHZvaWQge1xuICAgIHRoaXMuX3NldCgnZXhjbHVkZVZjc0lnbm9yZWRQYXRocycsIGV4Y2x1ZGVWY3NJZ25vcmVkUGF0aHMpO1xuICB9XG5cbiAgX3NldEhpZGVJZ25vcmVkTmFtZXMoaGlkZUlnbm9yZWROYW1lczogYm9vbGVhbik6IHZvaWQge1xuICAgIHRoaXMuX3NldCgnaGlkZUlnbm9yZWROYW1lcycsIGhpZGVJZ25vcmVkTmFtZXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdpdmVuIGEgbGlzdCBvZiBuYW1lcyB0byBpZ25vcmUsIGNvbXBpbGUgdGhlbSBpbnRvIG1pbmltYXRjaCBwYXR0ZXJucyBhbmRcbiAgICogdXBkYXRlIHRoZSBzdG9yZSB3aXRoIHRoZW0uXG4gICAqL1xuICBfc2V0SWdub3JlZE5hbWVzKGlnbm9yZWROYW1lczogQXJyYXk8c3RyaW5nPikge1xuICAgIGNvbnN0IGlnbm9yZWRQYXR0ZXJucyA9IEltbXV0YWJsZS5TZXQoaWdub3JlZE5hbWVzKVxuICAgICAgLm1hcChpZ25vcmVkTmFtZSA9PiB7XG4gICAgICAgIGlmIChpZ25vcmVkTmFtZSA9PT0gJycpIHtcbiAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICB0cnkge1xuICAgICAgICAgIHJldHVybiBuZXcgTWluaW1hdGNoKGlnbm9yZWROYW1lLCB7bWF0Y2hCYXNlOiB0cnVlLCBkb3Q6IHRydWV9KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZyhcbiAgICAgICAgICAgIGBFcnJvciBwYXJzaW5nIHBhdHRlcm4gJyR7aWdub3JlZE5hbWV9JyBmcm9tIFwiU2V0dGluZ3NcIiA+IFwiSWdub3JlZCBOYW1lc1wiYCxcbiAgICAgICAgICAgIHtkZXRhaWw6IGVycm9yLm1lc3NhZ2V9LFxuICAgICAgICAgICk7XG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICAuZmlsdGVyKHBhdHRlcm4gPT4gcGF0dGVybiAhPSBudWxsKTtcbiAgICB0aGlzLl9zZXQoJ2lnbm9yZWRQYXR0ZXJucycsIGlnbm9yZWRQYXR0ZXJucyk7XG4gIH1cblxuICBfZ2V0RGVmYXVsdHMoKTogU3RvcmVEYXRhIHtcbiAgICByZXR1cm4ge1xuICAgICAgY2hpbGRLZXlNYXA6IHt9LFxuICAgICAgaXNEaXJ0eU1hcDoge30sXG4gICAgICBleHBhbmRlZEtleXNCeVJvb3Q6IHt9LFxuICAgICAgdHJhY2tlZE5vZGU6IG51bGwsXG4gICAgICBwcmV2aW91c2x5RXhwYW5kZWQ6IHt9LFxuICAgICAgaXNMb2FkaW5nTWFwOiB7fSxcbiAgICAgIHJvb3RLZXlzOiBbXSxcbiAgICAgIHNlbGVjdGVkS2V5c0J5Um9vdDoge30sXG4gICAgICBzdWJzY3JpcHRpb25NYXA6IHt9LFxuICAgICAgdmNzU3RhdHVzZXNCeVJvb3Q6IHt9LFxuICAgICAgaWdub3JlZFBhdHRlcm5zOiBJbW11dGFibGUuU2V0KCksXG4gICAgICBoaWRlSWdub3JlZE5hbWVzOiB0cnVlLFxuICAgICAgZXhjbHVkZVZjc0lnbm9yZWRQYXRoczogdHJ1ZSxcbiAgICAgIHVzZVByZXZpZXdUYWJzOiBmYWxzZSxcbiAgICAgIHVzZVByZWZpeE5hdjogdHJ1ZSxcbiAgICAgIHJlcG9zaXRvcmllczogSW1tdXRhYmxlLlNldCgpLFxuICAgICAgd29ya2luZ1NldDogbmV3IFdvcmtpbmdTZXQoKSxcbiAgICAgIG9wZW5GaWxlc1dvcmtpbmdTZXQ6IG5ldyBXb3JraW5nU2V0KCksXG4gICAgICB3b3JraW5nU2V0c1N0b3JlOiBudWxsLFxuICAgICAgaXNFZGl0aW5nV29ya2luZ1NldDogZmFsc2UsXG4gICAgICBlZGl0ZWRXb3JraW5nU2V0OiBuZXcgV29ya2luZ1NldCgpLFxuICAgIH07XG4gIH1cblxuICBfb25EaXNwYXRjaChwYXlsb2FkOiBBY3Rpb25QYXlsb2FkKTogdm9pZCB7XG4gICAgc3dpdGNoIChwYXlsb2FkLmFjdGlvblR5cGUpIHtcbiAgICAgIGNhc2UgQWN0aW9uVHlwZS5ERUxFVEVfU0VMRUNURURfTk9ERVM6XG4gICAgICAgIHRoaXMuX2RlbGV0ZVNlbGVjdGVkTm9kZXMoKS5jYXRjaChlcnJvciA9PiB7XG4gICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKCdEZWxldGluZyBub2RlcyBmYWlsZWQgd2l0aCBhbiBlcnJvcjogJyArIGVycm9yLnRvU3RyaW5nKCkpO1xuICAgICAgICB9KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEFjdGlvblR5cGUuU0VUX1RSQUNLRURfTk9ERTpcbiAgICAgICAgdGhpcy5fc2V0VHJhY2tlZE5vZGUocGF5bG9hZC5yb290S2V5LCBwYXlsb2FkLm5vZGVLZXkpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQWN0aW9uVHlwZS5TRVRfUk9PVF9LRVlTOlxuICAgICAgICB0aGlzLl9zZXRSb290S2V5cyhwYXlsb2FkLnJvb3RLZXlzKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEFjdGlvblR5cGUuRVhQQU5EX05PREU6XG4gICAgICAgIHRoaXMuX2V4cGFuZE5vZGUocGF5bG9hZC5yb290S2V5LCBwYXlsb2FkLm5vZGVLZXkpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQWN0aW9uVHlwZS5FWFBBTkRfTk9ERV9ERUVQOlxuICAgICAgICB0aGlzLl9leHBhbmROb2RlRGVlcChwYXlsb2FkLnJvb3RLZXksIHBheWxvYWQubm9kZUtleSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBBY3Rpb25UeXBlLkNPTExBUFNFX05PREU6XG4gICAgICAgIHRoaXMuX2NvbGxhcHNlTm9kZShwYXlsb2FkLnJvb3RLZXksIHBheWxvYWQubm9kZUtleSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBBY3Rpb25UeXBlLlNFVF9FWENMVURFX1ZDU19JR05PUkVEX1BBVEhTOlxuICAgICAgICB0aGlzLl9zZXRFeGNsdWRlVmNzSWdub3JlZFBhdGhzKHBheWxvYWQuZXhjbHVkZVZjc0lnbm9yZWRQYXRocyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBBY3Rpb25UeXBlLlNFVF9VU0VfUFJFVklFV19UQUJTOlxuICAgICAgICB0aGlzLl9zZXRVc2VQcmV2aWV3VGFicyhwYXlsb2FkLnVzZVByZXZpZXdUYWJzKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEFjdGlvblR5cGUuU0VUX1VTRV9QUkVGSVhfTkFWOlxuICAgICAgICB0aGlzLl9zZXRVc2VQcmVmaXhOYXYocGF5bG9hZC51c2VQcmVmaXhOYXYpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQWN0aW9uVHlwZS5DT0xMQVBTRV9OT0RFX0RFRVA6XG4gICAgICAgIHRoaXMuX3B1cmdlRGlyZWN0b3J5V2l0aGluQVJvb3QocGF5bG9hZC5yb290S2V5LCBwYXlsb2FkLm5vZGVLZXksIC8qIHVuc2VsZWN0ICovZmFsc2UpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQWN0aW9uVHlwZS5TRVRfSElERV9JR05PUkVEX05BTUVTOlxuICAgICAgICB0aGlzLl9zZXRIaWRlSWdub3JlZE5hbWVzKHBheWxvYWQuaGlkZUlnbm9yZWROYW1lcyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBBY3Rpb25UeXBlLlNFVF9JR05PUkVEX05BTUVTOlxuICAgICAgICB0aGlzLl9zZXRJZ25vcmVkTmFtZXMocGF5bG9hZC5pZ25vcmVkTmFtZXMpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQWN0aW9uVHlwZS5TRVRfU0VMRUNURURfTk9ERVNfRk9SX1JPT1Q6XG4gICAgICAgIHRoaXMuX3NldFNlbGVjdGVkS2V5cyhwYXlsb2FkLnJvb3RLZXksIHBheWxvYWQubm9kZUtleXMpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQWN0aW9uVHlwZS5TRVRfU0VMRUNURURfTk9ERVNfRk9SX1RSRUU6XG4gICAgICAgIHRoaXMuX3NldFNlbGVjdGVkS2V5c0J5Um9vdChwYXlsb2FkLnNlbGVjdGVkS2V5c0J5Um9vdCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBBY3Rpb25UeXBlLkNSRUFURV9DSElMRDpcbiAgICAgICAgdGhpcy5fY3JlYXRlQ2hpbGQocGF5bG9hZC5ub2RlS2V5LCBwYXlsb2FkLmNoaWxkS2V5KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEFjdGlvblR5cGUuU0VUX1ZDU19TVEFUVVNFUzpcbiAgICAgICAgdGhpcy5fc2V0VmNzU3RhdHVzZXMocGF5bG9hZC5yb290S2V5LCBwYXlsb2FkLnZjc1N0YXR1c2VzKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEFjdGlvblR5cGUuU0VUX1JFUE9TSVRPUklFUzpcbiAgICAgICAgdGhpcy5fc2V0UmVwb3NpdG9yaWVzKHBheWxvYWQucmVwb3NpdG9yaWVzKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEFjdGlvblR5cGUuU0VUX1dPUktJTkdfU0VUOlxuICAgICAgICB0aGlzLl9zZXRXb3JraW5nU2V0KHBheWxvYWQud29ya2luZ1NldCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBBY3Rpb25UeXBlLlNFVF9PUEVOX0ZJTEVTX1dPUktJTkdfU0VUOlxuICAgICAgICB0aGlzLl9zZXRPcGVuRmlsZXNXb3JraW5nU2V0KHBheWxvYWQub3BlbkZpbGVzV29ya2luZ1NldCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBBY3Rpb25UeXBlLlNFVF9XT1JLSU5HX1NFVFNfU1RPUkU6XG4gICAgICAgIHRoaXMuX3NldFdvcmtpbmdTZXRzU3RvcmUocGF5bG9hZC53b3JraW5nU2V0c1N0b3JlKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEFjdGlvblR5cGUuU1RBUlRfRURJVElOR19XT1JLSU5HX1NFVDpcbiAgICAgICAgdGhpcy5fc3RhcnRFZGl0aW5nV29ya2luZ1NldChwYXlsb2FkLmVkaXRlZFdvcmtpbmdTZXQpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQWN0aW9uVHlwZS5GSU5JU0hfRURJVElOR19XT1JLSU5HX1NFVDpcbiAgICAgICAgdGhpcy5fZmluaXNoRWRpdGluZ1dvcmtpbmdTZXQoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEFjdGlvblR5cGUuQ0hFQ0tfTk9ERTpcbiAgICAgICAgdGhpcy5fY2hlY2tOb2RlKHBheWxvYWQucm9vdEtleSwgcGF5bG9hZC5ub2RlS2V5KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEFjdGlvblR5cGUuVU5DSEVDS19OT0RFOlxuICAgICAgICB0aGlzLl91bmNoZWNrTm9kZShwYXlsb2FkLnJvb3RLZXksIHBheWxvYWQubm9kZUtleSk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIGlzIGEgcHJpdmF0ZSBtZXRob2QgYmVjYXVzZSBpbiBGbHV4IHdlIHNob3VsZCBuZXZlciBleHRlcm5hbGx5IHdyaXRlIHRvIHRoZSBkYXRhIHN0b3JlLlxuICAgKiBPbmx5IGJ5IHJlY2VpdmluZyBhY3Rpb25zIChmcm9tIGRpc3BhdGNoZXIpIHNob3VsZCB0aGUgZGF0YSBzdG9yZSBiZSBjaGFuZ2VkLlxuICAgKiBOb3RlOiBgX3NldGAgY2FuIGJlIGNhbGxlZCBtdWx0aXBsZSB0aW1lcyB3aXRoaW4gb25lIGl0ZXJhdGlvbiBvZiBhbiBldmVudCBsb29wIHdpdGhvdXRcbiAgICogdGhyYXNoaW5nIHRoZSBVSSBiZWNhdXNlIHdlIGFyZSB1c2luZyBzZXRJbW1lZGlhdGUgdG8gYmF0Y2ggY2hhbmdlIG5vdGlmaWNhdGlvbnMsIGVmZmVjdGl2ZWx5XG4gICAqIGxldHRpbmcgb3VyIHZpZXdzIHJlLXJlbmRlciBvbmNlIGZvciBtdWx0aXBsZSBjb25zZWN1dGl2ZSB3cml0ZXMuXG4gICAqL1xuICBfc2V0KGtleTogc3RyaW5nLCB2YWx1ZTogbWl4ZWQsIGZsdXNoOiBib29sZWFuID0gZmFsc2UpOiB2b2lkIHtcbiAgICBjb25zdCBvbGREYXRhID0gdGhpcy5fZGF0YTtcbiAgICAvLyBJbW11dGFiaWxpdHkgZm9yIHRoZSB3aW4hXG4gICAgY29uc3QgbmV3RGF0YSA9IHNldFByb3BlcnR5KHRoaXMuX2RhdGEsIGtleSwgdmFsdWUpO1xuICAgIGlmIChuZXdEYXRhICE9PSBvbGREYXRhKSB7XG4gICAgICB0aGlzLl9kYXRhID0gbmV3RGF0YTtcbiAgICAgIGNsZWFySW1tZWRpYXRlKHRoaXMuX3RpbWVyKTtcbiAgICAgIGlmIChmbHVzaCkge1xuICAgICAgICAvLyBJZiBgZmx1c2hgIGlzIHRydWUsIGVtaXQgdGhlIGNoYW5nZSBpbW1lZGlhdGVseS5cbiAgICAgICAgdGhpcy5fZW1pdHRlci5lbWl0KCdjaGFuZ2UnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIElmIG5vdCBmbHVzaGluZywgZGUtYm91bmNlIHRvIHByZXZlbnQgc3VjY2Vzc2l2ZSB1cGRhdGVzIGluIHRoZSBzYW1lIGV2ZW50IGxvb3AuXG4gICAgICAgIHRoaXMuX3RpbWVyID0gc2V0SW1tZWRpYXRlKCgpID0+IHtcbiAgICAgICAgICB0aGlzLl9lbWl0dGVyLmVtaXQoJ2NoYW5nZScpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBnZXRUcmFja2VkTm9kZSgpOiA/RmlsZVRyZWVOb2RlRGF0YSB7XG4gICAgcmV0dXJuIHRoaXMuX2RhdGEudHJhY2tlZE5vZGU7XG4gIH1cblxuICBnZXRSZXBvc2l0b3JpZXMoKTogSW1tdXRhYmxlLlNldDxhdG9tJFJlcG9zaXRvcnk+IHtcbiAgICByZXR1cm4gdGhpcy5fZGF0YS5yZXBvc2l0b3JpZXM7XG4gIH1cblxuICBnZXRXb3JraW5nU2V0KCk6IFdvcmtpbmdTZXQge1xuICAgIHJldHVybiB0aGlzLl9kYXRhLndvcmtpbmdTZXQ7XG4gIH1cblxuICBnZXRPcGVuRmlsZXNXb3JraW5nU2V0KCk6IFdvcmtpbmdTZXQge1xuICAgIHJldHVybiB0aGlzLl9kYXRhLm9wZW5GaWxlc1dvcmtpbmdTZXQ7XG4gIH1cblxuICBnZXRXb3JraW5nU2V0c1N0b3JlKCk6ID9Xb3JraW5nU2V0c1N0b3JlIHtcbiAgICByZXR1cm4gdGhpcy5fZGF0YS53b3JraW5nU2V0c1N0b3JlO1xuICB9XG5cbiAgZ2V0Um9vdEtleXMoKTogQXJyYXk8c3RyaW5nPiB7XG4gICAgcmV0dXJuIHRoaXMuX2RhdGEucm9vdEtleXM7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUga2V5IG9mIHRoZSAqZmlyc3QqIHJvb3Qgbm9kZSBjb250YWluaW5nIHRoZSBnaXZlbiBub2RlLlxuICAgKi9cbiAgZ2V0Um9vdEZvcktleShub2RlS2V5OiBzdHJpbmcpOiA/c3RyaW5nIHtcbiAgICByZXR1cm4gYXJyYXkuZmluZCh0aGlzLl9kYXRhLnJvb3RLZXlzLCByb290S2V5ID0+IG5vZGVLZXkuc3RhcnRzV2l0aChyb290S2V5KSk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0cnVlIGlmIHRoZSBzdG9yZSBoYXMgbm8gZGF0YSwgaS5lLiBubyByb290cywgbm8gY2hpbGRyZW4uXG4gICAqL1xuICBpc0VtcHR5KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmdldFJvb3RLZXlzKCkubGVuZ3RoID09PSAwO1xuICB9XG5cbiAgLyoqXG4gICAqIE5vdGU6IFdlIGFjdHVhbGx5IGRvbid0IG5lZWQgcm9vdEtleSAoaW1wbGVtZW50YXRpb24gZGV0YWlsKSBidXQgd2UgdGFrZSBpdCBmb3IgY29uc2lzdGVuY3kuXG4gICAqL1xuICBpc0xvYWRpbmcocm9vdEtleTogc3RyaW5nLCBub2RlS2V5OiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gISF0aGlzLl9nZXRMb2FkaW5nKG5vZGVLZXkpO1xuICB9XG5cbiAgaXNFeHBhbmRlZChyb290S2V5OiBzdHJpbmcsIG5vZGVLZXk6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9nZXRFeHBhbmRlZEtleXMocm9vdEtleSkuaGFzKG5vZGVLZXkpO1xuICB9XG5cbiAgaXNSb290S2V5KG5vZGVLZXk6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9kYXRhLnJvb3RLZXlzLmluZGV4T2Yobm9kZUtleSkgIT09IC0xO1xuICB9XG5cbiAgaXNTZWxlY3RlZChyb290S2V5OiBzdHJpbmcsIG5vZGVLZXk6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmdldFNlbGVjdGVkS2V5cyhyb290S2V5KS5oYXMobm9kZUtleSk7XG4gIH1cblxuICBfc2V0VmNzU3RhdHVzZXMocm9vdEtleTogc3RyaW5nLCB2Y3NTdGF0dXNlczoge1twYXRoOiBzdHJpbmddOiBudW1iZXJ9KSB7XG4gICAgY29uc3QgaW1tdXRhYmxlVmNzU3RhdHVzZXMgPSBuZXcgSW1tdXRhYmxlLk1hcCh2Y3NTdGF0dXNlcyk7XG4gICAgaWYgKCFJbW11dGFibGUuaXMoaW1tdXRhYmxlVmNzU3RhdHVzZXMsIHRoaXMuX2RhdGEudmNzU3RhdHVzZXNCeVJvb3Rbcm9vdEtleV0pKSB7XG4gICAgICB0aGlzLl9zZXQoXG4gICAgICAgICd2Y3NTdGF0dXNlc0J5Um9vdCcsXG4gICAgICAgIHNldFByb3BlcnR5KHRoaXMuX2RhdGEudmNzU3RhdHVzZXNCeVJvb3QsIHJvb3RLZXksIGltbXV0YWJsZVZjc1N0YXR1c2VzKVxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICBnZXRWY3NTdGF0dXNDb2RlKHJvb3RLZXk6IHN0cmluZywgbm9kZUtleTogc3RyaW5nKTogP251bWJlciB7XG4gICAgY29uc3QgbWFwID0gdGhpcy5fZGF0YS52Y3NTdGF0dXNlc0J5Um9vdFtyb290S2V5XTtcbiAgICBpZiAobWFwKSB7XG4gICAgICByZXR1cm4gbWFwLmdldChub2RlS2V5KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG5cbiAgX3NldFVzZVByZXZpZXdUYWJzKHVzZVByZXZpZXdUYWJzOiBib29sZWFuKSB7XG4gICAgdGhpcy5fc2V0KCd1c2VQcmV2aWV3VGFicycsIHVzZVByZXZpZXdUYWJzKTtcbiAgfVxuXG4gIF9zZXRVc2VQcmVmaXhOYXYodXNlUHJlZml4TmF2OiBib29sZWFuKSB7XG4gICAgdGhpcy5fc2V0KCd1c2VQcmVmaXhOYXYnLCB1c2VQcmVmaXhOYXYpO1xuICB9XG5cbiAgdXNlUHJldmlld1RhYnMoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2RhdGEudXNlUHJldmlld1RhYnM7XG4gIH1cblxuICB1c2VQcmVmaXhOYXYoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2RhdGEudXNlUHJlZml4TmF2O1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMga25vd24gY2hpbGQga2V5cyBmb3IgdGhlIGdpdmVuIGBub2RlS2V5YCBidXQgZG9lcyBub3QgcXVldWUgYSBmZXRjaCBmb3IgbWlzc2luZ1xuICAgKiBjaGlsZHJlbiBsaWtlIGA6OmdldENoaWxkS2V5c2AuXG4gICAqL1xuICBnZXRDYWNoZWRDaGlsZEtleXMocm9vdEtleTogc3RyaW5nLCBub2RlS2V5OiBzdHJpbmcpOiBBcnJheTxzdHJpbmc+IHtcbiAgICByZXR1cm4gdGhpcy5fb21pdEhpZGRlblBhdGhzKHRoaXMuX2RhdGEuY2hpbGRLZXlNYXBbbm9kZUtleV0gfHwgW10pO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBub2RlIGNoaWxkIGtleXMgbWF5IGVpdGhlciBiZSAgYXZhaWxhYmxlIGltbWVkaWF0ZWx5IChjYWNoZWQpLCBvclxuICAgKiByZXF1aXJlIGFuIGFzeW5jIGZldGNoLiBJZiBhbGwgb2YgdGhlIGNoaWxkcmVuIGFyZSBuZWVkZWQgaXQncyBlYXNpZXIgdG9cbiAgICogcmV0dXJuIGFzIHByb21pc2UsIHRvIG1ha2UgdGhlIGNhbGxlciBvYmxpdmlvdXMgdG8gdGhlIHdheSBjaGlsZHJlbiB3ZXJlXG4gICAqIGZldGNoZWQuXG4gICAqL1xuICBwcm9taXNlTm9kZUNoaWxkS2V5cyhyb290S2V5OiBzdHJpbmcsIG5vZGVLZXk6IHN0cmluZyk6IFByb21pc2Uge1xuICAgIGNvbnN0IGNhY2hlZENoaWxkS2V5cyA9IHRoaXMuZ2V0Q2hpbGRLZXlzKHJvb3RLZXksIG5vZGVLZXkpO1xuICAgIGlmIChjYWNoZWRDaGlsZEtleXMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGNhY2hlZENoaWxkS2V5cyk7XG4gICAgfVxuXG4gICAgY29uc3QgcHJvbWlzZSA9IHRoaXMuX2dldExvYWRpbmcobm9kZUtleSkgfHwgUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgcmV0dXJuIHByb21pc2UudGhlbigoKSA9PiB0aGlzLmdldENhY2hlZENoaWxkS2V5cyhyb290S2V5LCBub2RlS2V5KSk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBrbm93biBjaGlsZCBrZXlzIGZvciB0aGUgZ2l2ZW4gYG5vZGVLZXlgIGFuZCBxdWV1ZXMgYSBmZXRjaCBpZiBjaGlsZHJlbiBhcmUgbWlzc2luZy5cbiAgICovXG4gIGdldENoaWxkS2V5cyhyb290S2V5OiBzdHJpbmcsIG5vZGVLZXk6IHN0cmluZyk6IEFycmF5PHN0cmluZz4ge1xuICAgIGNvbnN0IGNoaWxkS2V5cyA9IHRoaXMuX2RhdGEuY2hpbGRLZXlNYXBbbm9kZUtleV07XG4gICAgaWYgKGNoaWxkS2V5cyA9PSBudWxsIHx8IHRoaXMuX2RhdGEuaXNEaXJ0eU1hcFtub2RlS2V5XSkge1xuICAgICAgdGhpcy5fZmV0Y2hDaGlsZEtleXMobm9kZUtleSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8qXG4gICAgICAgKiBJZiBubyBkYXRhIG5lZWRzIHRvIGJlIGZldGNoZWQsIHdpcGUgb3V0IHRoZSBzY3JvbGxpbmcgc3RhdGUgYmVjYXVzZSBzdWJzZXF1ZW50IHVwZGF0ZXNcbiAgICAgICAqIHNob3VsZCBubyBsb25nZXIgc2Nyb2xsIHRoZSB0cmVlLiBUaGUgbm9kZSB3aWxsIGhhdmUgYWxyZWFkeSBiZWVuIGZsdXNoZWQgdG8gdGhlIHZpZXcgYW5kXG4gICAgICAgKiBzY3JvbGxlZCB0by5cbiAgICAgICAqL1xuICAgICAgdGhpcy5fY2hlY2tUcmFja2VkTm9kZSgpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fb21pdEhpZGRlblBhdGhzKGNoaWxkS2V5cyB8fCBbXSk7XG4gIH1cblxuICBnZXRTZWxlY3RlZEtleXMocm9vdEtleT86IHN0cmluZyk6IEltbXV0YWJsZS5PcmRlcmVkU2V0PHN0cmluZz4ge1xuICAgIGxldCBzZWxlY3RlZEtleXM7XG4gICAgaWYgKHJvb3RLZXkgPT0gbnVsbCkge1xuICAgICAgc2VsZWN0ZWRLZXlzID0gbmV3IEltbXV0YWJsZS5PcmRlcmVkU2V0KCk7XG4gICAgICBmb3IgKGNvbnN0IHJvb3QgaW4gdGhpcy5fZGF0YS5zZWxlY3RlZEtleXNCeVJvb3QpIHtcbiAgICAgICAgaWYgKHRoaXMuX2RhdGEuc2VsZWN0ZWRLZXlzQnlSb290Lmhhc093blByb3BlcnR5KHJvb3QpKSB7XG4gICAgICAgICAgc2VsZWN0ZWRLZXlzID0gc2VsZWN0ZWRLZXlzLm1lcmdlKHRoaXMuX2RhdGEuc2VsZWN0ZWRLZXlzQnlSb290W3Jvb3RdKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBJZiB0aGUgZ2l2ZW4gYHJvb3RLZXlgIGhhcyBubyBzZWxlY3RlZCBrZXlzLCBhc3NpZ24gYW4gZW1wdHkgc2V0IHRvIG1haW50YWluIGEgbm9uLW51bGxcbiAgICAgIC8vIHJldHVybiB2YWx1ZS5cbiAgICAgIHNlbGVjdGVkS2V5cyA9IHRoaXMuX2RhdGEuc2VsZWN0ZWRLZXlzQnlSb290W3Jvb3RLZXldIHx8IG5ldyBJbW11dGFibGUuT3JkZXJlZFNldCgpO1xuICAgIH1cbiAgICByZXR1cm4gc2VsZWN0ZWRLZXlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBsaXN0IG9mIHRoZSBub2RlcyB0aGF0IGFyZSBjdXJyZW50bHkgdmlzaWJsZS9leHBhbmRlZCBpbiB0aGUgZmlsZSB0cmVlLlxuICAgKlxuICAgKiBUaGlzIG1ldGhvZCByZXR1cm5zIGFuIGFycmF5IHN5bmNocm9ub3VzbHkgKHJhdGhlciB0aGFuIGFuIGl0ZXJhdG9yKSB0byBlbnN1cmUgdGhlIGNhbGxlclxuICAgKiBnZXRzIGEgY29uc2lzdGVudCBzbmFwc2hvdCBvZiB0aGUgY3VycmVudCBzdGF0ZSBvZiB0aGUgZmlsZSB0cmVlLlxuICAgKi9cbiAgZ2V0VmlzaWJsZU5vZGVzKHJvb3RLZXk6IHN0cmluZyk6IEFycmF5PEZpbGVUcmVlTm9kZT4ge1xuICAgIC8vIERvIHNvbWUgYmFzaWMgY2hlY2tzIHRvIGVuc3VyZSB0aGF0IHJvb3RLZXkgY29ycmVzcG9uZHMgdG8gYSByb290IGFuZCBpcyBleHBhbmRlZC4gSWYgbm90LFxuICAgIC8vIHJldHVybiB0aGUgYXBwcm9wcmlhdGUgYXJyYXkuXG4gICAgaWYgKCF0aGlzLmlzUm9vdEtleShyb290S2V5KSkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICBpZiAoIXRoaXMuaXNFeHBhbmRlZChyb290S2V5LCByb290S2V5KSkge1xuICAgICAgcmV0dXJuIFt0aGlzLmdldE5vZGUocm9vdEtleSwgcm9vdEtleSldO1xuICAgIH1cblxuICAgIC8vIE5vdGUgdGhhdCB3ZSBjb3VsZCBjYWNoZSB0aGUgdmlzaWJsZU5vZGVzIGFycmF5IHNvIHRoYXQgd2UgZG8gbm90IGhhdmUgdG8gY3JlYXRlIGl0IGZyb21cbiAgICAvLyBzY3JhdGNoIGVhY2ggdGltZSB0aGlzIGlzIGNhbGxlZCwgYnV0IGl0IGRvZXMgbm90IGFwcGVhciB0byBiZSBhIGJvdHRsZW5lY2sgYXQgcHJlc2VudC5cbiAgICBjb25zdCB2aXNpYmxlTm9kZXMgPSBbXTtcbiAgICBjb25zdCByb290S2V5c0ZvckRpcmVjdG9yaWVzVG9FeHBsb3JlID0gW3Jvb3RLZXldO1xuICAgIHdoaWxlIChyb290S2V5c0ZvckRpcmVjdG9yaWVzVG9FeHBsb3JlLmxlbmd0aCAhPT0gMCkge1xuICAgICAgY29uc3Qga2V5ID0gcm9vdEtleXNGb3JEaXJlY3Rvcmllc1RvRXhwbG9yZS5wb3AoKTtcbiAgICAgIHZpc2libGVOb2Rlcy5wdXNoKHRoaXMuZ2V0Tm9kZShrZXksIGtleSkpO1xuICAgICAgY29uc3QgY2hpbGRLZXlzID0gdGhpcy5fZGF0YS5jaGlsZEtleU1hcFtrZXldO1xuICAgICAgaWYgKGNoaWxkS2V5cyA9PSBudWxsIHx8IHRoaXMuX2RhdGEuaXNEaXJ0eU1hcFtrZXldKSB7XG4gICAgICAgIC8vIFRoaXMgaXMgd2hlcmUgZ2V0Q2hpbGRLZXlzKCkgd291bGQgZmV0Y2gsIGJ1dCB3ZSBkbyBub3Qgd2FudCB0byBkbyB0aGF0LlxuICAgICAgICAvLyBUT0RPOiBJZiBrZXkgaXMgaW4gaXNEaXJ0eU1hcCwgdGhlbiByZXRyeSB3aGVuIGl0IGlzIG5vdCBkaXJ0eT9cbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGZvciAoY29uc3QgY2hpbGRLZXkgb2YgY2hpbGRLZXlzKSB7XG4gICAgICAgIGlmIChGaWxlVHJlZUhlbHBlcnMuaXNEaXJLZXkoY2hpbGRLZXkpKSB7XG4gICAgICAgICAgaWYgKHRoaXMuaXNFeHBhbmRlZChyb290S2V5LCBrZXkpKSB7XG4gICAgICAgICAgICByb290S2V5c0ZvckRpcmVjdG9yaWVzVG9FeHBsb3JlLnB1c2goY2hpbGRLZXkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2aXNpYmxlTm9kZXMucHVzaCh0aGlzLmdldE5vZGUoa2V5LCBjaGlsZEtleSkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB2aXNpYmxlTm9kZXM7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhbGwgc2VsZWN0ZWQgbm9kZXMgYWNyb3NzIGFsbCByb290cyBpbiB0aGUgdHJlZS5cbiAgICovXG4gIGdldFNlbGVjdGVkTm9kZXMoKTogSW1tdXRhYmxlLk9yZGVyZWRTZXQ8RmlsZVRyZWVOb2RlPiB7XG4gICAgbGV0IHNlbGVjdGVkTm9kZXMgPSBuZXcgSW1tdXRhYmxlLk9yZGVyZWRTZXQoKTtcbiAgICB0aGlzLl9kYXRhLnJvb3RLZXlzLmZvckVhY2gocm9vdEtleSA9PiB7XG4gICAgICB0aGlzLmdldFNlbGVjdGVkS2V5cyhyb290S2V5KS5mb3JFYWNoKG5vZGVLZXkgPT4ge1xuICAgICAgICBzZWxlY3RlZE5vZGVzID0gc2VsZWN0ZWROb2Rlcy5hZGQodGhpcy5nZXROb2RlKHJvb3RLZXksIG5vZGVLZXkpKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIHJldHVybiBzZWxlY3RlZE5vZGVzO1xuICB9XG5cbiAgZ2V0U2luZ2xlU2VsZWN0ZWROb2RlKCk6ID9GaWxlVHJlZU5vZGUge1xuICAgIGNvbnN0IHNlbGVjdGVkUm9vdHMgPSBPYmplY3Qua2V5cyh0aGlzLl9kYXRhLnNlbGVjdGVkS2V5c0J5Um9vdCk7XG4gICAgaWYgKHNlbGVjdGVkUm9vdHMubGVuZ3RoICE9PSAxKSB7XG4gICAgICAvLyBUaGVyZSBpcyBtb3JlIHRoYW4gb25lIHJvb3Qgd2l0aCBzZWxlY3RlZCBub2Rlcy4gTm8gYnVlbm8uXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3Qgcm9vdEtleSA9IHNlbGVjdGVkUm9vdHNbMF07XG4gICAgY29uc3Qgc2VsZWN0ZWRLZXlzID0gdGhpcy5nZXRTZWxlY3RlZEtleXMocm9vdEtleSk7XG4gICAgLypcbiAgICAgKiBOb3RlOiBUaGlzIGRvZXMgbm90IGNhbGwgYGdldFNlbGVjdGVkTm9kZXNgIHRvIHByZXZlbnQgY3JlYXRpbmcgbm9kZXMgdGhhdCB3b3VsZCBiZSB0aHJvd25cbiAgICAgKiBhd2F5IGlmIHRoZXJlIGlzIG1vcmUgdGhhbiAxIHNlbGVjdGVkIG5vZGUuXG4gICAgICovXG4gICAgcmV0dXJuIChzZWxlY3RlZEtleXMuc2l6ZSA9PT0gMSkgPyB0aGlzLmdldE5vZGUocm9vdEtleSwgc2VsZWN0ZWRLZXlzLmZpcnN0KCkpIDogbnVsbDtcbiAgfVxuXG4gIGdldFJvb3ROb2RlKHJvb3RLZXk6IHN0cmluZyk6IEZpbGVUcmVlTm9kZSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0Tm9kZShyb290S2V5LCByb290S2V5KTtcbiAgfVxuXG4gIGdldE5vZGUocm9vdEtleTogc3RyaW5nLCBub2RlS2V5OiBzdHJpbmcpOiBGaWxlVHJlZU5vZGUge1xuICAgIHJldHVybiBuZXcgRmlsZVRyZWVOb2RlKHRoaXMsIHJvb3RLZXksIG5vZGVLZXkpO1xuICB9XG5cbiAgaXNFZGl0aW5nV29ya2luZ1NldCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fZGF0YS5pc0VkaXRpbmdXb3JraW5nU2V0O1xuICB9XG5cbiAgZ2V0RWRpdGVkV29ya2luZ1NldCgpOiBXb3JraW5nU2V0IHtcbiAgICByZXR1cm4gdGhpcy5fZGF0YS5lZGl0ZWRXb3JraW5nU2V0O1xuICB9XG5cbiAgX3NldEVkaXRlZFdvcmtpbmdTZXQoZWRpdGVkV29ya2luZ1NldDogV29ya2luZ1NldCk6IHZvaWQge1xuICAgIHRoaXMuX3NldCgnZWRpdGVkV29ya2luZ1NldCcsIGVkaXRlZFdvcmtpbmdTZXQpO1xuICB9XG5cbiAgLyoqXG4gICAqIElmIGEgZmV0Y2ggaXMgbm90IGFscmVhZHkgaW4gcHJvZ3Jlc3MgaW5pdGlhdGUgYSBmZXRjaCBub3cuXG4gICAqL1xuICBfZmV0Y2hDaGlsZEtleXMobm9kZUtleTogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgZXhpc3RpbmdQcm9taXNlID0gdGhpcy5fZ2V0TG9hZGluZyhub2RlS2V5KTtcbiAgICBpZiAoZXhpc3RpbmdQcm9taXNlKSB7XG4gICAgICByZXR1cm4gZXhpc3RpbmdQcm9taXNlO1xuICAgIH1cblxuICAgIGNvbnN0IHByb21pc2UgPSBGaWxlVHJlZUhlbHBlcnMuZmV0Y2hDaGlsZHJlbihub2RlS2V5KS5jYXRjaChlcnJvciA9PiB7XG4gICAgICB0aGlzLl9sb2dnZXIuZXJyb3IoYFVuYWJsZSB0byBmZXRjaCBjaGlsZHJlbiBmb3IgXCIke25vZGVLZXl9XCIuYCk7XG4gICAgICB0aGlzLl9sb2dnZXIuZXJyb3IoJ09yaWdpbmFsIGVycm9yOiAnLCBlcnJvcik7XG4gICAgICAvLyBDb2xsYXBzZSB0aGUgbm9kZSBhbmQgY2xlYXIgaXRzIGxvYWRpbmcgc3RhdGUgb24gZXJyb3Igc28gdGhlIHVzZXIgY2FuIHJldHJ5IGV4cGFuZGluZyBpdC5cbiAgICAgIGNvbnN0IHJvb3RLZXkgPSB0aGlzLmdldFJvb3RGb3JLZXkobm9kZUtleSk7XG4gICAgICBpZiAocm9vdEtleSAhPSBudWxsKSB7XG4gICAgICAgIHRoaXMuX2NvbGxhcHNlTm9kZShyb290S2V5LCBub2RlS2V5KTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX2NsZWFyTG9hZGluZyhub2RlS2V5KTtcbiAgICB9KS50aGVuKGNoaWxkS2V5cyA9PiB7XG4gICAgICAvLyBJZiB0aGlzIG5vZGUncyByb290IHdlbnQgYXdheSB3aGlsZSB0aGUgUHJvbWlzZSB3YXMgcmVzb2x2aW5nLCBkbyBubyBtb3JlIHdvcmsuIFRoaXMgbm9kZVxuICAgICAgLy8gaXMgbm8gbG9uZ2VyIG5lZWRlZCBpbiB0aGUgc3RvcmUuXG4gICAgICBpZiAodGhpcy5nZXRSb290Rm9yS2V5KG5vZGVLZXkpID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGhpcy5fc2V0Q2hpbGRLZXlzKG5vZGVLZXksIGNoaWxkS2V5cyk7XG4gICAgICB0aGlzLl9hZGRTdWJzY3JpcHRpb24obm9kZUtleSk7XG4gICAgICB0aGlzLl9jbGVhckxvYWRpbmcobm9kZUtleSk7XG4gICAgfSk7XG5cbiAgICB0aGlzLl9zZXRMb2FkaW5nKG5vZGVLZXksIHByb21pc2UpO1xuICAgIHJldHVybiBwcm9taXNlO1xuICB9XG5cbiAgX2dldExvYWRpbmcobm9kZUtleTogc3RyaW5nKTogP1Byb21pc2Uge1xuICAgIHJldHVybiB0aGlzLl9kYXRhLmlzTG9hZGluZ01hcFtub2RlS2V5XTtcbiAgfVxuXG4gIF9zZXRMb2FkaW5nKG5vZGVLZXk6IHN0cmluZywgdmFsdWU6IFByb21pc2UpOiB2b2lkIHtcbiAgICB0aGlzLl9zZXQoJ2lzTG9hZGluZ01hcCcsIHNldFByb3BlcnR5KHRoaXMuX2RhdGEuaXNMb2FkaW5nTWFwLCBub2RlS2V5LCB2YWx1ZSkpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlc2V0cyB0aGUgbm9kZSB0byBiZSBrZXB0IGluIHZpZXcgaWYgbm8gbW9yZSBkYXRhIGlzIGJlaW5nIGF3YWl0ZWQuIFNhZmUgdG8gY2FsbCBtYW55IHRpbWVzXG4gICAqIGJlY2F1c2UgaXQgb25seSBjaGFuZ2VzIHN0YXRlIGlmIGEgbm9kZSBpcyBiZWluZyB0cmFja2VkLlxuICAgKi9cbiAgX2NoZWNrVHJhY2tlZE5vZGUoKTogdm9pZCB7XG4gICAgaWYgKFxuICAgICAgdGhpcy5fZGF0YS50cmFja2VkTm9kZSAhPSBudWxsICYmXG4gICAgICAvKlxuICAgICAgICogVGhlIGxvYWRpbmcgbWFwIGJlaW5nIGVtcHR5IGlzIGEgaGV1cmlzdGljIGZvciB3aGVuIGxvYWRpbmcgaGFzIGNvbXBsZXRlZC4gSXQgaXMgaW5leGFjdFxuICAgICAgICogYmVjYXVzZSB0aGUgbG9hZGluZyBtaWdodCBiZSB1bnJlbGF0ZWQgdG8gdGhlIHRyYWNrZWQgbm9kZSwgaG93ZXZlciBpdCBpcyBjaGVhcCBhbmQgZmFsc2VcbiAgICAgICAqIHBvc2l0aXZlcyB3aWxsIG9ubHkgbGFzdCB1bnRpbCBsb2FkaW5nIGlzIGNvbXBsZXRlIG9yIHVudGlsIHRoZSB1c2VyIGNsaWNrcyBhbm90aGVyIG5vZGUgaW5cbiAgICAgICAqIHRoZSB0cmVlLlxuICAgICAgICovXG4gICAgICBvYmplY3RVdGlsLmlzRW1wdHkodGhpcy5fZGF0YS5pc0xvYWRpbmdNYXApXG4gICAgKSB7XG4gICAgICAvLyBMb2FkaW5nIGhhcyBjb21wbGV0ZWQuIEFsbG93IHNjcm9sbGluZyB0byBwcm9jZWVkIGFzIHVzdWFsLlxuICAgICAgdGhpcy5fc2V0KCd0cmFja2VkTm9kZScsIG51bGwpO1xuICAgIH1cbiAgfVxuXG4gIF9jbGVhckxvYWRpbmcobm9kZUtleTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5fc2V0KCdpc0xvYWRpbmdNYXAnLCBkZWxldGVQcm9wZXJ0eSh0aGlzLl9kYXRhLmlzTG9hZGluZ01hcCwgbm9kZUtleSkpO1xuICAgIHRoaXMuX2NoZWNrVHJhY2tlZE5vZGUoKTtcbiAgfVxuXG4gIGFzeW5jIF9kZWxldGVTZWxlY3RlZE5vZGVzKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHNlbGVjdGVkTm9kZXMgPSB0aGlzLmdldFNlbGVjdGVkTm9kZXMoKTtcbiAgICBhd2FpdCBQcm9taXNlLmFsbChzZWxlY3RlZE5vZGVzLm1hcChhc3luYyBub2RlID0+IHtcbiAgICAgIGNvbnN0IGZpbGUgPSBGaWxlVHJlZUhlbHBlcnMuZ2V0RmlsZUJ5S2V5KG5vZGUubm9kZUtleSk7XG4gICAgICBpZiAoZmlsZSA9PSBudWxsKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHJlcG9zaXRvcnkgPSByZXBvc2l0b3J5Rm9yUGF0aChmaWxlLmdldFBhdGgoKSk7XG4gICAgICBpZiAocmVwb3NpdG9yeSAhPSBudWxsICYmIHJlcG9zaXRvcnkuZ2V0VHlwZSgpID09PSAnaGcnKSB7XG4gICAgICAgIGNvbnN0IGhnUmVwb3NpdG9yeSA9ICgocmVwb3NpdG9yeTogYW55KTogSGdSZXBvc2l0b3J5Q2xpZW50KTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBhd2FpdCBoZ1JlcG9zaXRvcnkucmVtb3ZlKGZpbGUuZ2V0UGF0aCgpKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIGNvbnN0IHN0YXR1c2VzID0gYXdhaXQgaGdSZXBvc2l0b3J5LmdldFN0YXR1c2VzKFtmaWxlLmdldFBhdGgoKV0pO1xuICAgICAgICAgIGNvbnN0IHBhdGhTdGF0dXMgPSBzdGF0dXNlcy5nZXQoZmlsZS5nZXRQYXRoKCkpO1xuICAgICAgICAgIGlmIChwYXRoU3RhdHVzICE9PSBTdGF0dXNDb2RlTnVtYmVyLlVOVFJBQ0tFRCkge1xuICAgICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKFxuICAgICAgICAgICAgICAnRmFpbGVkIHRvIHJlbW92ZSAnICsgZmlsZS5nZXRQYXRoKCkgKyAnIGZyb20gdmVyc2lvbiBjb250cm9sLiAgVGhlIGZpbGUgd2lsbCAnICtcbiAgICAgICAgICAgICAgJ3N0aWxsIGdldCBkZWxldGVkIGJ1dCB5b3Ugd2lsbCBoYXZlIHRvIHJlbW92ZSBpdCBmcm9tIHlvdXIgVkNTIHlvdXJzZWxmLiAgRXJyb3I6ICcgK1xuICAgICAgICAgICAgICBlLnRvU3RyaW5nKCksXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKEZpbGVUcmVlSGVscGVycy5pc0xvY2FsRmlsZShmaWxlKSkge1xuICAgICAgICAvLyBUT0RPOiBUaGlzIHNwZWNpYWwtY2FzZSBjYW4gYmUgZWxpbWluYXRlZCBvbmNlIGBkZWxldGUoKWAgaXMgYWRkZWQgdG8gYERpcmVjdG9yeWBcbiAgICAgICAgLy8gYW5kIGBGaWxlYC5cbiAgICAgICAgc2hlbGwubW92ZUl0ZW1Ub1RyYXNoKG5vZGUubm9kZVBhdGgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgcmVtb3RlRmlsZSA9ICgoZmlsZTogYW55KTogKFJlbW90ZURpcmVjdG9yeSB8IFJlbW90ZUZpbGUpKTtcbiAgICAgICAgYXdhaXQgcmVtb3RlRmlsZS5kZWxldGUoKTtcbiAgICAgIH1cbiAgICB9KSk7XG4gIH1cblxuICBfZXhwYW5kTm9kZShyb290S2V5OiBzdHJpbmcsIG5vZGVLZXk6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuX3NldEV4cGFuZGVkS2V5cyhyb290S2V5LCB0aGlzLl9nZXRFeHBhbmRlZEtleXMocm9vdEtleSkuYWRkKG5vZGVLZXkpKTtcbiAgICAvLyBJZiB3ZSBoYXZlIGNoaWxkIG5vZGVzIHRoYXQgc2hvdWxkIGFsc28gYmUgZXhwYW5kZWQsIGV4cGFuZCB0aGVtIG5vdy5cbiAgICBsZXQgcHJldmlvdXNseUV4cGFuZGVkID0gdGhpcy5fZ2V0UHJldmlvdXNseUV4cGFuZGVkKHJvb3RLZXkpO1xuICAgIGlmIChwcmV2aW91c2x5RXhwYW5kZWQuaGFzKG5vZGVLZXkpKSB7XG4gICAgICBmb3IgKGNvbnN0IGNoaWxkS2V5IG9mIHByZXZpb3VzbHlFeHBhbmRlZC5nZXQobm9kZUtleSkpIHtcbiAgICAgICAgdGhpcy5fZXhwYW5kTm9kZShyb290S2V5LCBjaGlsZEtleSk7XG4gICAgICB9XG4gICAgICAvLyBDbGVhciB0aGUgcHJldmlvdXNseUV4cGFuZGVkIGxpc3Qgc2luY2Ugd2UncmUgZG9uZSB3aXRoIGl0LlxuICAgICAgcHJldmlvdXNseUV4cGFuZGVkID0gcHJldmlvdXNseUV4cGFuZGVkLmRlbGV0ZShub2RlS2V5KTtcbiAgICAgIHRoaXMuX3NldFByZXZpb3VzbHlFeHBhbmRlZChyb290S2V5LCBwcmV2aW91c2x5RXhwYW5kZWQpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBQZXJmb3JtZXMgYSBkZWVwIEJGUyBzY2FubmluZyBleHBhbmQgb2YgY29udGFpbmVkIG5vZGVzLlxuICAgKiByZXR1cm5zIC0gYSBwcm9taXNlIGZ1bGZpbGxlZCB3aGVuIHRoZSBleHBhbmQgb3BlcmF0aW9uIGlzIGZpbmlzaGVkXG4gICAqL1xuICBfZXhwYW5kTm9kZURlZXAocm9vdEtleTogc3RyaW5nLCBub2RlS2V5OiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAvLyBTdG9wIHRoZSB0cmF2ZXJzYWwgYWZ0ZXIgMTAwIG5vZGVzIHdlcmUgYWRkZWQgdG8gdGhlIHRyZWVcbiAgICBjb25zdCBpdE5vZGVzID0gbmV3IEZpbGVUcmVlU3RvcmVCZnNJdGVyYXRvcih0aGlzLCByb290S2V5LCBub2RlS2V5LCAvKiBsaW1pdCovIDEwMCk7XG4gICAgY29uc3QgcHJvbWlzZSA9IG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgY29uc3QgZXhwYW5kID0gKCkgPT4ge1xuICAgICAgICBjb25zdCB0cmF2ZXJzZWROb2RlS2V5ID0gaXROb2Rlcy50cmF2ZXJzZWROb2RlKCk7XG4gICAgICAgIGlmICh0cmF2ZXJzZWROb2RlS2V5KSB7XG4gICAgICAgICAgdGhpcy5fc2V0RXhwYW5kZWRLZXlzKHJvb3RLZXksIHRoaXMuX2dldEV4cGFuZGVkS2V5cyhyb290S2V5KS5hZGQodHJhdmVyc2VkTm9kZUtleSkpO1xuICAgICAgICAgIC8qKlxuICAgICAgICAgICAqIEV2ZW4gaWYgdGhlcmUgd2VyZSBwcmV2aW91c2x5IGV4cGFuZGVkIG5vZGVzIGl0IGRvZXNuJ3QgbWF0dGVyIGFzXG4gICAgICAgICAgICogd2UnbGwgZXhwYW5kIGFsbCBvZiB0aGUgY2hpbGRyZW4uXG4gICAgICAgICAgICovXG4gICAgICAgICAgbGV0IHByZXZpb3VzbHlFeHBhbmRlZCA9IHRoaXMuX2dldFByZXZpb3VzbHlFeHBhbmRlZChyb290S2V5KTtcbiAgICAgICAgICBwcmV2aW91c2x5RXhwYW5kZWQgPSBwcmV2aW91c2x5RXhwYW5kZWQuZGVsZXRlKHRyYXZlcnNlZE5vZGVLZXkpO1xuICAgICAgICAgIHRoaXMuX3NldFByZXZpb3VzbHlFeHBhbmRlZChyb290S2V5LCBwcmV2aW91c2x5RXhwYW5kZWQpO1xuXG4gICAgICAgICAgY29uc3QgbmV4dFByb21pc2UgPSBpdE5vZGVzLm5leHQoKTtcbiAgICAgICAgICBpZiAobmV4dFByb21pc2UpIHtcbiAgICAgICAgICAgIG5leHRQcm9taXNlLnRoZW4oZXhwYW5kKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICBleHBhbmQoKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBwcm9taXNlO1xuICB9XG5cbiAgLyoqXG4gICAqIFdoZW4gd2UgY29sbGFwc2UgYSBub2RlIHdlIG5lZWQgdG8gZG8gc29tZSBjbGVhbnVwIHJlbW92aW5nIHN1YnNjcmlwdGlvbnMgYW5kIHNlbGVjdGlvbi5cbiAgICovXG4gIF9jb2xsYXBzZU5vZGUocm9vdEtleTogc3RyaW5nLCBub2RlS2V5OiBzdHJpbmcpOiB2b2lkIHtcbiAgICBjb25zdCBjaGlsZEtleXMgPSB0aGlzLl9kYXRhLmNoaWxkS2V5TWFwW25vZGVLZXldO1xuICAgIGxldCBzZWxlY3RlZEtleXMgPSB0aGlzLl9kYXRhLnNlbGVjdGVkS2V5c0J5Um9vdFtyb290S2V5XTtcbiAgICBjb25zdCBleHBhbmRlZENoaWxkS2V5cyA9IFtdO1xuICAgIGlmIChjaGlsZEtleXMpIHtcbiAgICAgIGNoaWxkS2V5cy5mb3JFYWNoKGNoaWxkS2V5ID0+IHtcbiAgICAgICAgLy8gVW5zZWxlY3QgZWFjaCBjaGlsZC5cbiAgICAgICAgaWYgKHNlbGVjdGVkS2V5cyAmJiBzZWxlY3RlZEtleXMuaGFzKGNoaWxkS2V5KSkge1xuICAgICAgICAgIHNlbGVjdGVkS2V5cyA9IHNlbGVjdGVkS2V5cy5kZWxldGUoY2hpbGRLZXkpO1xuICAgICAgICAgIC8qXG4gICAgICAgICAgICogU2V0IHRoZSBzZWxlY3RlZCBrZXlzICpiZWZvcmUqIHRoZSByZWN1cnNpdmUgYF9jb2xsYXBzZU5vZGVgIGNhbGwgc28gZWFjaCBjYWxsIHN0b3Jlc1xuICAgICAgICAgICAqIGl0cyBjaGFuZ2VzIGFuZCBpc24ndCB3aXBlZCBvdXQgYnkgdGhlIG5leHQgY2FsbCBieSBrZWVwaW5nIGFuIG91dGRhdGVkIGBzZWxlY3RlZEtleXNgXG4gICAgICAgICAgICogaW4gdGhlIGNhbGwgc3RhY2suXG4gICAgICAgICAgICovXG4gICAgICAgICAgdGhpcy5fc2V0U2VsZWN0ZWRLZXlzKHJvb3RLZXksIHNlbGVjdGVkS2V5cyk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gQ29sbGFwc2UgZWFjaCBjaGlsZCBkaXJlY3RvcnkuXG4gICAgICAgIGlmIChGaWxlVHJlZUhlbHBlcnMuaXNEaXJLZXkoY2hpbGRLZXkpKSB7XG4gICAgICAgICAgaWYgKHRoaXMuaXNFeHBhbmRlZChyb290S2V5LCBjaGlsZEtleSkpIHtcbiAgICAgICAgICAgIGV4cGFuZGVkQ2hpbGRLZXlzLnB1c2goY2hpbGRLZXkpO1xuICAgICAgICAgICAgdGhpcy5fY29sbGFwc2VOb2RlKHJvb3RLZXksIGNoaWxkS2V5KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgICAvKlxuICAgICAqIFNhdmUgdGhlIGxpc3Qgb2YgZXhwYW5kZWQgY2hpbGQgbm9kZXMgc28gbmV4dCB0aW1lIHdlIGV4cGFuZCB0aGlzIG5vZGUgd2UgY2FuIGV4cGFuZCB0aGVzZVxuICAgICAqIGNoaWxkcmVuLlxuICAgICAqL1xuICAgIGxldCBwcmV2aW91c2x5RXhwYW5kZWQgPSB0aGlzLl9nZXRQcmV2aW91c2x5RXhwYW5kZWQocm9vdEtleSk7XG4gICAgaWYgKGV4cGFuZGVkQ2hpbGRLZXlzLmxlbmd0aCAhPT0gMCkge1xuICAgICAgcHJldmlvdXNseUV4cGFuZGVkID0gcHJldmlvdXNseUV4cGFuZGVkLnNldChub2RlS2V5LCBleHBhbmRlZENoaWxkS2V5cyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHByZXZpb3VzbHlFeHBhbmRlZCA9IHByZXZpb3VzbHlFeHBhbmRlZC5kZWxldGUobm9kZUtleSk7XG4gICAgfVxuICAgIHRoaXMuX3NldFByZXZpb3VzbHlFeHBhbmRlZChyb290S2V5LCBwcmV2aW91c2x5RXhwYW5kZWQpO1xuICAgIHRoaXMuX3NldEV4cGFuZGVkS2V5cyhyb290S2V5LCB0aGlzLl9nZXRFeHBhbmRlZEtleXMocm9vdEtleSkuZGVsZXRlKG5vZGVLZXkpKTtcbiAgICB0aGlzLl9yZW1vdmVTdWJzY3JpcHRpb24ocm9vdEtleSwgbm9kZUtleSk7XG4gIH1cblxuICBfZ2V0UHJldmlvdXNseUV4cGFuZGVkKHJvb3RLZXk6IHN0cmluZyk6IEltbXV0YWJsZS5NYXA8c3RyaW5nLCBBcnJheTxzdHJpbmc+PiB7XG4gICAgcmV0dXJuIHRoaXMuX2RhdGEucHJldmlvdXNseUV4cGFuZGVkW3Jvb3RLZXldIHx8IG5ldyBJbW11dGFibGUuTWFwKCk7XG4gIH1cblxuICBfc2V0UHJldmlvdXNseUV4cGFuZGVkKHJvb3RLZXk6IHN0cmluZyxcbiAgICBwcmV2aW91c2x5RXhwYW5kZWQ6IEltbXV0YWJsZS5NYXA8c3RyaW5nLCBBcnJheTxzdHJpbmc+Pik6IHZvaWQge1xuICAgIHRoaXMuX3NldChcbiAgICAgICdwcmV2aW91c2x5RXhwYW5kZWQnLFxuICAgICAgc2V0UHJvcGVydHkodGhpcy5fZGF0YS5wcmV2aW91c2x5RXhwYW5kZWQsIHJvb3RLZXksIHByZXZpb3VzbHlFeHBhbmRlZClcbiAgICApO1xuICB9XG5cbiAgX2dldEV4cGFuZGVkS2V5cyhyb290S2V5OiBzdHJpbmcpOiBJbW11dGFibGUuU2V0PHN0cmluZz4ge1xuICAgIHJldHVybiB0aGlzLl9kYXRhLmV4cGFuZGVkS2V5c0J5Um9vdFtyb290S2V5XSB8fCBuZXcgSW1tdXRhYmxlLlNldCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoaXMgaXMganVzdCBleHBvc2VkIHNvIGl0IGNhbiBiZSBtb2NrZWQgaW4gdGhlIHRlc3RzLiBOb3QgaWRlYWwsIGJ1dCBhIGxvdCBsZXNzIG1lc3N5IHRoYW4gdGhlXG4gICAqIGFsdGVybmF0aXZlcy4gRm9yIGV4YW1wbGUsIHBhc3Npbmcgb3B0aW9ucyB3aGVuIGNvbnN0cnVjdGluZyBhbiBpbnN0YW5jZSBvZiBhIHNpbmdsZXRvbiB3b3VsZFxuICAgKiBtYWtlIGZ1dHVyZSBpbnZvY2F0aW9ucyBvZiBgZ2V0SW5zdGFuY2VgIHVucHJlZGljdGFibGUuXG4gICAqL1xuICBfcmVwb3NpdG9yeUZvclBhdGgocGF0aDogTnVjbGlkZVVyaSk6ID9hdG9tJFJlcG9zaXRvcnkge1xuICAgIHJldHVybiB0aGlzLmdldFJlcG9zaXRvcmllcygpLmZpbmQocmVwbyA9PiByZXBvc2l0b3J5Q29udGFpbnNQYXRoKHJlcG8sIHBhdGgpKTtcbiAgfVxuXG4gIF9zZXRFeHBhbmRlZEtleXMocm9vdEtleTogc3RyaW5nLCBleHBhbmRlZEtleXM6IEltbXV0YWJsZS5TZXQ8c3RyaW5nPik6IHZvaWQge1xuICAgIHRoaXMuX3NldChcbiAgICAgICdleHBhbmRlZEtleXNCeVJvb3QnLFxuICAgICAgc2V0UHJvcGVydHkodGhpcy5fZGF0YS5leHBhbmRlZEtleXNCeVJvb3QsIHJvb3RLZXksIGV4cGFuZGVkS2V5cylcbiAgICApO1xuICB9XG5cbiAgX2RlbGV0ZVNlbGVjdGVkS2V5cyhyb290S2V5OiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLl9zZXQoJ3NlbGVjdGVkS2V5c0J5Um9vdCcsIGRlbGV0ZVByb3BlcnR5KHRoaXMuX2RhdGEuc2VsZWN0ZWRLZXlzQnlSb290LCByb290S2V5KSk7XG4gIH1cblxuICBfc2V0U2VsZWN0ZWRLZXlzKHJvb3RLZXk6IHN0cmluZywgc2VsZWN0ZWRLZXlzOiBJbW11dGFibGUuT3JkZXJlZFNldDxzdHJpbmc+KTogdm9pZCB7XG4gICAgLypcbiAgICAgKiBOZXcgc2VsZWN0aW9uIG1lYW5zIHByZXZpb3VzIG5vZGUgc2hvdWxkIG5vdCBiZSBrZXB0IGluIHZpZXcuIERvIHRoaXMgd2l0aG91dCBkZS1ib3VuY2luZ1xuICAgICAqIGJlY2F1c2UgdGhlIHByZXZpb3VzIHN0YXRlIGlzIGlycmVsZXZhbnQuIElmIHRoZSB1c2VyIGNob3NlIGEgbmV3IHNlbGVjdGlvbiwgdGhlIHByZXZpb3VzIG9uZVxuICAgICAqIHNob3VsZCBub3QgYmUgc2Nyb2xsZWQgaW50byB2aWV3LlxuICAgICAqL1xuICAgIHRoaXMuX3NldCgndHJhY2tlZE5vZGUnLCBudWxsKTtcbiAgICB0aGlzLl9zZXQoXG4gICAgICAnc2VsZWN0ZWRLZXlzQnlSb290JyxcbiAgICAgIHNldFByb3BlcnR5KHRoaXMuX2RhdGEuc2VsZWN0ZWRLZXlzQnlSb290LCByb290S2V5LCBzZWxlY3RlZEtleXMpXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBzZWxlY3RlZCBrZXlzIGluIGFsbCByb290cyBvZiB0aGUgdHJlZS4gVGhlIHNlbGVjdGVkIGtleXMgb2Ygcm9vdCBrZXlzIG5vdCBpblxuICAgKiBgc2VsZWN0ZWRLZXlzQnlSb290YCBhcmUgZGVsZXRlZCAodGhlIHJvb3QgaXMgbGVmdCB3aXRoIG5vIHNlbGVjdGlvbikuXG4gICAqL1xuICBfc2V0U2VsZWN0ZWRLZXlzQnlSb290KHNlbGVjdGVkS2V5c0J5Um9vdDoge1trZXk6IHN0cmluZ106IEltbXV0YWJsZS5PcmRlcmVkU2V0PHN0cmluZz59KTogdm9pZCB7XG4gICAgdGhpcy5nZXRSb290S2V5cygpLmZvckVhY2gocm9vdEtleSA9PiB7XG4gICAgICBpZiAoc2VsZWN0ZWRLZXlzQnlSb290Lmhhc093blByb3BlcnR5KHJvb3RLZXkpKSB7XG4gICAgICAgIHRoaXMuX3NldFNlbGVjdGVkS2V5cyhyb290S2V5LCBzZWxlY3RlZEtleXNCeVJvb3Rbcm9vdEtleV0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fZGVsZXRlU2VsZWN0ZWRLZXlzKHJvb3RLZXkpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgX3NldFJvb3RLZXlzKHJvb3RLZXlzOiBBcnJheTxzdHJpbmc+KTogdm9pZCB7XG4gICAgY29uc3Qgb2xkUm9vdEtleXMgPSB0aGlzLl9kYXRhLnJvb3RLZXlzO1xuICAgIGNvbnN0IG5ld1Jvb3RLZXlzID0gbmV3IEltbXV0YWJsZS5TZXQocm9vdEtleXMpO1xuICAgIGNvbnN0IHJlbW92ZWRSb290S2V5cyA9IG5ldyBJbW11dGFibGUuU2V0KG9sZFJvb3RLZXlzKS5zdWJ0cmFjdChuZXdSb290S2V5cyk7XG4gICAgcmVtb3ZlZFJvb3RLZXlzLmZvckVhY2godGhpcy5fcHVyZ2VSb290LmJpbmQodGhpcykpO1xuICAgIHRoaXMuX3NldCgncm9vdEtleXMnLCByb290S2V5cyk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyBhIHNpbmdsZSBjaGlsZCBub2RlLiBJdCdzIHVzZWZ1bCB3aGVuIGV4cGFuZGluZyB0byBhIGRlZXBseSBuZXN0ZWQgbm9kZS5cbiAgICovXG4gIF9jcmVhdGVDaGlsZChub2RlS2V5OiBzdHJpbmcsIGNoaWxkS2V5OiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLl9zZXRDaGlsZEtleXMobm9kZUtleSwgW2NoaWxkS2V5XSk7XG4gICAgLypcbiAgICAgKiBNYXJrIHRoZSBub2RlIGFzIGRpcnR5IHNvIGl0cyBhbmNlc3RvcnMgYXJlIGZldGNoZWQgYWdhaW4gb24gcmVsb2FkIG9mIHRoZSB0cmVlLlxuICAgICAqL1xuICAgIHRoaXMuX3NldCgnaXNEaXJ0eU1hcCcsIHNldFByb3BlcnR5KHRoaXMuX2RhdGEuaXNEaXJ0eU1hcCwgbm9kZUtleSwgdHJ1ZSkpO1xuICB9XG5cbiAgX3NldENoaWxkS2V5cyhub2RlS2V5OiBzdHJpbmcsIGNoaWxkS2V5czogQXJyYXk8c3RyaW5nPik6IHZvaWQge1xuICAgIGNvbnN0IG9sZENoaWxkS2V5cyA9IHRoaXMuX2RhdGEuY2hpbGRLZXlNYXBbbm9kZUtleV07XG4gICAgaWYgKG9sZENoaWxkS2V5cykge1xuICAgICAgY29uc3QgbmV3Q2hpbGRLZXlzID0gbmV3IEltbXV0YWJsZS5TZXQoY2hpbGRLZXlzKTtcbiAgICAgIGNvbnN0IHJlbW92ZWREaXJlY3RvcnlLZXlzID0gbmV3IEltbXV0YWJsZS5TZXQob2xkQ2hpbGRLZXlzKVxuICAgICAgICAuc3VidHJhY3QobmV3Q2hpbGRLZXlzKVxuICAgICAgICAuZmlsdGVyKEZpbGVUcmVlSGVscGVycy5pc0RpcktleSk7XG4gICAgICByZW1vdmVkRGlyZWN0b3J5S2V5cy5mb3JFYWNoKHRoaXMuX3B1cmdlRGlyZWN0b3J5LmJpbmQodGhpcykpO1xuICAgIH1cbiAgICB0aGlzLl9zZXQoJ2NoaWxkS2V5TWFwJywgc2V0UHJvcGVydHkodGhpcy5fZGF0YS5jaGlsZEtleU1hcCwgbm9kZUtleSwgY2hpbGRLZXlzKSk7XG4gIH1cblxuICBfb25EaXJlY3RvcnlDaGFuZ2Uobm9kZUtleTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5fZmV0Y2hDaGlsZEtleXMobm9kZUtleSk7XG4gIH1cblxuICBfYWRkU3Vic2NyaXB0aW9uKG5vZGVLZXk6IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IGRpcmVjdG9yeSA9IEZpbGVUcmVlSGVscGVycy5nZXREaXJlY3RvcnlCeUtleShub2RlS2V5KTtcbiAgICBpZiAoIWRpcmVjdG9yeSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8qXG4gICAgICogUmVtb3ZlIHRoZSBkaXJlY3RvcnkncyBkaXJ0eSBtYXJrZXIgcmVnYXJkbGVzcyBvZiB3aGV0aGVyIGEgc3Vic2NyaXB0aW9uIGFscmVhZHkgZXhpc3RzXG4gICAgICogYmVjYXVzZSB0aGVyZSBpcyBub3RoaW5nIGZ1cnRoZXIgbWFraW5nIGl0IGRpcnR5LlxuICAgICAqL1xuICAgIHRoaXMuX3NldCgnaXNEaXJ0eU1hcCcsIGRlbGV0ZVByb3BlcnR5KHRoaXMuX2RhdGEuaXNEaXJ0eU1hcCwgbm9kZUtleSkpO1xuXG4gICAgLy8gRG9uJ3QgY3JlYXRlIGEgbmV3IHN1YnNjcmlwdGlvbiBpZiBvbmUgYWxyZWFkeSBleGlzdHMuXG4gICAgaWYgKHRoaXMuX2RhdGEuc3Vic2NyaXB0aW9uTWFwW25vZGVLZXldKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbGV0IHN1YnNjcmlwdGlvbjtcbiAgICB0cnkge1xuICAgICAgLy8gVGhpcyBjYWxsIG1pZ2h0IGZhaWwgaWYgd2UgdHJ5IHRvIHdhdGNoIGEgbm9uLWV4aXN0aW5nIGRpcmVjdG9yeSwgb3IgaWYgcGVybWlzc2lvbiBkZW5pZWQuXG4gICAgICBzdWJzY3JpcHRpb24gPSBkaXJlY3Rvcnkub25EaWRDaGFuZ2UoKCkgPT4ge1xuICAgICAgICB0aGlzLl9vbkRpcmVjdG9yeUNoYW5nZShub2RlS2V5KTtcbiAgICAgIH0pO1xuICAgIH0gY2F0Y2ggKGV4KSB7XG4gICAgICAvKlxuICAgICAgICogTG9nIGVycm9yIGFuZCBtYXJrIHRoZSBkaXJlY3RvcnkgYXMgZGlydHkgc28gdGhlIGZhaWxlZCBzdWJzY3JpcHRpb24gd2lsbCBiZSBhdHRlbXB0ZWRcbiAgICAgICAqIGFnYWluIG5leHQgdGltZSB0aGUgZGlyZWN0b3J5IGlzIGV4cGFuZGVkLlxuICAgICAgICovXG4gICAgICB0aGlzLl9sb2dnZXIuZXJyb3IoYENhbm5vdCBzdWJzY3JpYmUgdG8gZGlyZWN0b3J5IFwiJHtub2RlS2V5fVwiYCwgZXgpO1xuICAgICAgdGhpcy5fc2V0KCdpc0RpcnR5TWFwJywgc2V0UHJvcGVydHkodGhpcy5fZGF0YS5pc0RpcnR5TWFwLCBub2RlS2V5KSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuX3NldCgnc3Vic2NyaXB0aW9uTWFwJywgc2V0UHJvcGVydHkodGhpcy5fZGF0YS5zdWJzY3JpcHRpb25NYXAsIG5vZGVLZXksIHN1YnNjcmlwdGlvbikpO1xuICB9XG5cbiAgX3JlbW92ZVN1YnNjcmlwdGlvbihyb290S2V5OiBzdHJpbmcsIG5vZGVLZXk6IHN0cmluZyk6IHZvaWQge1xuICAgIGxldCBoYXNSZW1haW5pbmdTdWJzY3JpYmVycztcbiAgICBjb25zdCBzdWJzY3JpcHRpb24gPSB0aGlzLl9kYXRhLnN1YnNjcmlwdGlvbk1hcFtub2RlS2V5XTtcblxuICAgIGlmIChzdWJzY3JpcHRpb24gIT0gbnVsbCkge1xuICAgICAgaGFzUmVtYWluaW5nU3Vic2NyaWJlcnMgPSB0aGlzLl9kYXRhLnJvb3RLZXlzLnNvbWUob3RoZXJSb290S2V5ID0+IChcbiAgICAgICAgb3RoZXJSb290S2V5ICE9PSByb290S2V5ICYmIHRoaXMuaXNFeHBhbmRlZChvdGhlclJvb3RLZXksIG5vZGVLZXkpXG4gICAgICApKTtcbiAgICAgIGlmICghaGFzUmVtYWluaW5nU3Vic2NyaWJlcnMpIHtcbiAgICAgICAgc3Vic2NyaXB0aW9uLmRpc3Bvc2UoKTtcbiAgICAgICAgdGhpcy5fc2V0KCdzdWJzY3JpcHRpb25NYXAnLCBkZWxldGVQcm9wZXJ0eSh0aGlzLl9kYXRhLnN1YnNjcmlwdGlvbk1hcCwgbm9kZUtleSkpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChzdWJzY3JpcHRpb24gPT0gbnVsbCB8fCBoYXNSZW1haW5pbmdTdWJzY3JpYmVycyA9PT0gZmFsc2UpIHtcbiAgICAgIC8vIFNpbmNlIHdlJ3JlIG5vIGxvbmdlciBnZXR0aW5nIG5vdGlmaWNhdGlvbnMgd2hlbiB0aGUgZGlyZWN0b3J5IGNvbnRlbnRzIGNoYW5nZSwgYXNzdW1lIHRoZVxuICAgICAgLy8gY2hpbGQgbGlzdCBpcyBkaXJ0eS5cbiAgICAgIHRoaXMuX3NldCgnaXNEaXJ0eU1hcCcsIHNldFByb3BlcnR5KHRoaXMuX2RhdGEuaXNEaXJ0eU1hcCwgbm9kZUtleSwgdHJ1ZSkpO1xuICAgIH1cbiAgfVxuXG4gIF9yZW1vdmVBbGxTdWJzY3JpcHRpb25zKG5vZGVLZXk6IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IHN1YnNjcmlwdGlvbiA9IHRoaXMuX2RhdGEuc3Vic2NyaXB0aW9uTWFwW25vZGVLZXldO1xuICAgIGlmIChzdWJzY3JpcHRpb24pIHtcbiAgICAgIHN1YnNjcmlwdGlvbi5kaXNwb3NlKCk7XG4gICAgICB0aGlzLl9zZXQoJ3N1YnNjcmlwdGlvbk1hcCcsIGRlbGV0ZVByb3BlcnR5KHRoaXMuX2RhdGEuc3Vic2NyaXB0aW9uTWFwLCBub2RlS2V5KSk7XG4gICAgfVxuICB9XG5cbiAgX3B1cmdlTm9kZShyb290S2V5OiBzdHJpbmcsIG5vZGVLZXk6IHN0cmluZywgdW5zZWxlY3Q6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICBjb25zdCBleHBhbmRlZEtleXMgPSB0aGlzLl9nZXRFeHBhbmRlZEtleXMocm9vdEtleSk7XG4gICAgaWYgKGV4cGFuZGVkS2V5cy5oYXMobm9kZUtleSkpIHtcbiAgICAgIHRoaXMuX3NldEV4cGFuZGVkS2V5cyhyb290S2V5LCBleHBhbmRlZEtleXMuZGVsZXRlKG5vZGVLZXkpKTtcbiAgICB9XG5cbiAgICBpZiAodW5zZWxlY3QpIHtcbiAgICAgIGNvbnN0IHNlbGVjdGVkS2V5cyA9IHRoaXMuZ2V0U2VsZWN0ZWRLZXlzKHJvb3RLZXkpO1xuICAgICAgaWYgKHNlbGVjdGVkS2V5cy5oYXMobm9kZUtleSkpIHtcbiAgICAgICAgdGhpcy5fc2V0U2VsZWN0ZWRLZXlzKHJvb3RLZXksIHNlbGVjdGVkS2V5cy5kZWxldGUobm9kZUtleSkpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IHByZXZpb3VzbHlFeHBhbmRlZCA9IHRoaXMuX2dldFByZXZpb3VzbHlFeHBhbmRlZChyb290S2V5KTtcbiAgICBpZiAocHJldmlvdXNseUV4cGFuZGVkLmhhcyhub2RlS2V5KSkge1xuICAgICAgdGhpcy5fc2V0UHJldmlvdXNseUV4cGFuZGVkKHJvb3RLZXksIHByZXZpb3VzbHlFeHBhbmRlZC5kZWxldGUobm9kZUtleSkpO1xuICAgIH1cbiAgfVxuXG4gIF9wdXJnZURpcmVjdG9yeVdpdGhpbkFSb290KHJvb3RLZXk6IHN0cmluZywgbm9kZUtleTogc3RyaW5nLCB1bnNlbGVjdDogYm9vbGVhbik6IHZvaWQge1xuICAgIGNvbnN0IGNoaWxkS2V5cyA9IHRoaXMuX2RhdGEuY2hpbGRLZXlNYXBbbm9kZUtleV07XG4gICAgaWYgKGNoaWxkS2V5cykge1xuICAgICAgY2hpbGRLZXlzLmZvckVhY2goY2hpbGRLZXkgPT4ge1xuICAgICAgICBpZiAoRmlsZVRyZWVIZWxwZXJzLmlzRGlyS2V5KGNoaWxkS2V5KSkge1xuICAgICAgICAgIHRoaXMuX3B1cmdlRGlyZWN0b3J5V2l0aGluQVJvb3Qocm9vdEtleSwgY2hpbGRLZXksIC8qIHVuc2VsZWN0ICovIHRydWUpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gICAgdGhpcy5fcmVtb3ZlU3Vic2NyaXB0aW9uKHJvb3RLZXksIG5vZGVLZXkpO1xuICAgIHRoaXMuX3B1cmdlTm9kZShyb290S2V5LCBub2RlS2V5LCB1bnNlbGVjdCk7XG4gIH1cblxuICAvLyBUaGlzIGlzIGNhbGxlZCB3aGVuIGEgZGlyY3RvcnkgaXMgcGh5c2ljYWxseSByZW1vdmVkIGZyb20gZGlzay4gV2hlbiB3ZSBwdXJnZSBhIGRpcmVjdG9yeSxcbiAgLy8gd2UgbmVlZCB0byBwdXJnZSBpdCdzIGNoaWxkIGRpcmVjdG9yaWVzIGFsc28uIFB1cmdpbmcgcmVtb3ZlcyBzdHVmZiBmcm9tIHRoZSBkYXRhIHN0b3JlXG4gIC8vIGluY2x1ZGluZyBsaXN0IG9mIGNoaWxkIG5vZGVzLCBzdWJzY3JpcHRpb25zLCBleHBhbmRlZCBkaXJlY3RvcmllcyBhbmQgc2VsZWN0ZWQgZGlyZWN0b3JpZXMuXG4gIF9wdXJnZURpcmVjdG9yeShub2RlS2V5OiBzdHJpbmcpOiB2b2lkIHtcbiAgICBjb25zdCBjaGlsZEtleXMgPSB0aGlzLl9kYXRhLmNoaWxkS2V5TWFwW25vZGVLZXldO1xuICAgIGlmIChjaGlsZEtleXMpIHtcbiAgICAgIGNoaWxkS2V5cy5mb3JFYWNoKGNoaWxkS2V5ID0+IHtcbiAgICAgICAgaWYgKEZpbGVUcmVlSGVscGVycy5pc0RpcktleShjaGlsZEtleSkpIHtcbiAgICAgICAgICB0aGlzLl9wdXJnZURpcmVjdG9yeShjaGlsZEtleSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgdGhpcy5fc2V0KCdjaGlsZEtleU1hcCcsIGRlbGV0ZVByb3BlcnR5KHRoaXMuX2RhdGEuY2hpbGRLZXlNYXAsIG5vZGVLZXkpKTtcbiAgICB9XG5cbiAgICB0aGlzLl9yZW1vdmVBbGxTdWJzY3JpcHRpb25zKG5vZGVLZXkpO1xuICAgIHRoaXMuZ2V0Um9vdEtleXMoKS5mb3JFYWNoKHJvb3RLZXkgPT4ge1xuICAgICAgdGhpcy5fcHVyZ2VOb2RlKHJvb3RLZXksIG5vZGVLZXksIC8qIHVuc2VsZWN0ICovIHRydWUpO1xuICAgIH0pO1xuICB9XG5cbiAgLy8gVE9ETzogU2hvdWxkIHdlIGNsZWFuIHVwIGlzTG9hZGluZ01hcD8gSXQgY29udGFpbnMgcHJvbWlzZXMgd2hpY2ggY2Fubm90IGJlIGNhbmNlbGxlZCwgc28gdGhpc1xuICAvLyBtaWdodCBiZSB0cmlja3kuXG4gIF9wdXJnZVJvb3Qocm9vdEtleTogc3RyaW5nKTogdm9pZCB7XG4gICAgY29uc3QgZXhwYW5kZWRLZXlzID0gdGhpcy5fZGF0YS5leHBhbmRlZEtleXNCeVJvb3Rbcm9vdEtleV07XG4gICAgaWYgKGV4cGFuZGVkS2V5cykge1xuICAgICAgZXhwYW5kZWRLZXlzLmZvckVhY2gobm9kZUtleSA9PiB7XG4gICAgICAgIHRoaXMuX3JlbW92ZVN1YnNjcmlwdGlvbihyb290S2V5LCBub2RlS2V5KTtcbiAgICAgIH0pO1xuICAgICAgdGhpcy5fc2V0KCdleHBhbmRlZEtleXNCeVJvb3QnLCBkZWxldGVQcm9wZXJ0eSh0aGlzLl9kYXRhLmV4cGFuZGVkS2V5c0J5Um9vdCwgcm9vdEtleSkpO1xuICAgIH1cbiAgICB0aGlzLl9zZXQoJ3NlbGVjdGVkS2V5c0J5Um9vdCcsIGRlbGV0ZVByb3BlcnR5KHRoaXMuX2RhdGEuc2VsZWN0ZWRLZXlzQnlSb290LCByb290S2V5KSk7XG4gICAgLy8gUmVtb3ZlIGFsbCBjaGlsZCBrZXlzIHNvIHRoYXQgb24gcmUtYWRkaXRpb24gb2YgdGhpcyByb290IHRoZSBjaGlsZHJlbiB3aWxsIGJlIGZldGNoZWQgYWdhaW4uXG4gICAgY29uc3QgY2hpbGRLZXlzID0gdGhpcy5fZGF0YS5jaGlsZEtleU1hcFtyb290S2V5XTtcbiAgICBpZiAoY2hpbGRLZXlzKSB7XG4gICAgICBjaGlsZEtleXMuZm9yRWFjaChjaGlsZEtleSA9PiB7XG4gICAgICAgIGlmIChGaWxlVHJlZUhlbHBlcnMuaXNEaXJLZXkoY2hpbGRLZXkpKSB7XG4gICAgICAgICAgdGhpcy5fc2V0KCdjaGlsZEtleU1hcCcsIGRlbGV0ZVByb3BlcnR5KHRoaXMuX2RhdGEuY2hpbGRLZXlNYXAsIGNoaWxkS2V5KSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgdGhpcy5fc2V0KCdjaGlsZEtleU1hcCcsIGRlbGV0ZVByb3BlcnR5KHRoaXMuX2RhdGEuY2hpbGRLZXlNYXAsIHJvb3RLZXkpKTtcbiAgICB9XG4gICAgdGhpcy5fc2V0KCd2Y3NTdGF0dXNlc0J5Um9vdCcsIGRlbGV0ZVByb3BlcnR5KHRoaXMuX2RhdGEudmNzU3RhdHVzZXNCeVJvb3QsIHJvb3RLZXkpKTtcbiAgfVxuXG4gIF9zZXRUcmFja2VkTm9kZShyb290S2V5OiBzdHJpbmcsIG5vZGVLZXk6IHN0cmluZyk6IHZvaWQge1xuICAgIC8vIEZsdXNoIHRoZSB2YWx1ZSB0byBlbnN1cmUgY2xpZW50cyBzZWUgdGhlIHZhbHVlIGF0IGxlYXN0IG9uY2UgYW5kIHNjcm9sbCBhcHByb3ByaWF0ZWx5LlxuICAgIHRoaXMuX3NldCgndHJhY2tlZE5vZGUnLCB7bm9kZUtleSwgcm9vdEtleX0sIHRydWUpO1xuICB9XG5cbiAgX3NldFJlcG9zaXRvcmllcyhyZXBvc2l0b3JpZXM6IEltbXV0YWJsZS5TZXQ8YXRvbSRSZXBvc2l0b3J5Pik6IHZvaWQge1xuICAgIHRoaXMuX3NldCgncmVwb3NpdG9yaWVzJywgcmVwb3NpdG9yaWVzKTtcblxuICAgIC8vIFdoZW5ldmVyIGEgbmV3IHNldCBvZiByZXBvc2l0b3JpZXMgY29tZXMgaW4sIGludmFsaWRhdGUgb3VyIHBhdGhzIGNhY2hlIGJ5IHJlc2V0dGluZyBpdHNcbiAgICAvLyBgY2FjaGVgIHByb3BlcnR5IChjcmVhdGVkIGJ5IGxvZGFzaC5tZW1vaXplKSB0byBhbiBlbXB0eSBtYXAuXG4gICAgdGhpcy5fcmVwb3NpdG9yeUZvclBhdGguY2FjaGUgPSBuZXcgTWFwKCk7XG4gIH1cblxuICBfc2V0V29ya2luZ1NldCh3b3JraW5nU2V0OiBXb3JraW5nU2V0KTogdm9pZCB7XG4gICAgdGhpcy5fc2V0KCd3b3JraW5nU2V0Jywgd29ya2luZ1NldCk7XG4gIH1cblxuICBfc2V0T3BlbkZpbGVzV29ya2luZ1NldChvcGVuRmlsZXNXb3JraW5nU2V0OiBXb3JraW5nU2V0KTogdm9pZCB7XG4gICAgdGhpcy5fc2V0KCdvcGVuRmlsZXNXb3JraW5nU2V0Jywgb3BlbkZpbGVzV29ya2luZ1NldCk7XG4gIH1cblxuICBfc2V0V29ya2luZ1NldHNTdG9yZSh3b3JraW5nU2V0c1N0b3JlOiA/V29ya2luZ1NldHNTdG9yZSk6IHZvaWQge1xuICAgIHRoaXMuX3NldCgnd29ya2luZ1NldHNTdG9yZScsIHdvcmtpbmdTZXRzU3RvcmUpO1xuICB9XG5cbiAgX3N0YXJ0RWRpdGluZ1dvcmtpbmdTZXQoZWRpdGVkV29ya2luZ1NldDogV29ya2luZ1NldCk6IHZvaWQge1xuICAgIGlmICghdGhpcy5fZGF0YS5pc0VkaXRpbmdXb3JraW5nU2V0KSB7XG4gICAgICB0aGlzLl9zZXQoJ2lzRWRpdGluZ1dvcmtpbmdTZXQnLCB0cnVlKTtcbiAgICAgIHRoaXMuX3NldEVkaXRlZFdvcmtpbmdTZXQoZWRpdGVkV29ya2luZ1NldCk7XG4gICAgfVxuICB9XG5cbiAgX2ZpbmlzaEVkaXRpbmdXb3JraW5nU2V0KCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9kYXRhLmlzRWRpdGluZ1dvcmtpbmdTZXQpIHtcbiAgICAgIHRoaXMuX3NldCgnaXNFZGl0aW5nV29ya2luZ1NldCcsIGZhbHNlKTtcbiAgICAgIHRoaXMuX3NldEVkaXRlZFdvcmtpbmdTZXQobmV3IFdvcmtpbmdTZXQoKSk7XG4gICAgfVxuICB9XG5cbiAgX2NoZWNrTm9kZShyb290S2V5OiBzdHJpbmcsIG5vZGVLZXk6IHN0cmluZyk6IHZvaWQge1xuICAgIGlmICghdGhpcy5fZGF0YS5pc0VkaXRpbmdXb3JraW5nU2V0KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgZWRpdGVkV29ya2luZ1NldCA9IHRoaXMuX2RhdGEuZWRpdGVkV29ya2luZ1NldC5hcHBlbmQobm9kZUtleSk7XG5cbiAgICBjb25zdCBub2RlID0gdGhpcy5nZXROb2RlKHJvb3RLZXksIG5vZGVLZXkpO1xuICAgIGlmIChub2RlLmlzUm9vdCkge1xuICAgICAgdGhpcy5fc2V0RWRpdGVkV29ya2luZ1NldChlZGl0ZWRXb3JraW5nU2V0KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBwYXJlbnQgPSBub2RlLmdldFBhcmVudE5vZGUoKTtcbiAgICBjb25zdCBjaGlsZHJlbktleXMgPSB0aGlzLmdldENhY2hlZENoaWxkS2V5cyhyb290S2V5LCBwYXJlbnQubm9kZUtleSk7XG4gICAgaWYgKGNoaWxkcmVuS2V5cy5ldmVyeShjayA9PiBlZGl0ZWRXb3JraW5nU2V0LmNvbnRhaW5zRmlsZShjaykpKSB7XG4gICAgICB0aGlzLl9jaGVja05vZGUocm9vdEtleSwgcGFyZW50Lm5vZGVLZXkpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9zZXRFZGl0ZWRXb3JraW5nU2V0KGVkaXRlZFdvcmtpbmdTZXQpO1xuICAgIH1cbiAgfVxuXG4gIF91bmNoZWNrTm9kZShyb290S2V5OiBzdHJpbmcsIG5vZGVLZXk6IHN0cmluZyk6IHZvaWQge1xuICAgIGlmICghdGhpcy5fZGF0YS5pc0VkaXRpbmdXb3JraW5nU2V0KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qgbm9kZSA9IHRoaXMuZ2V0Tm9kZShyb290S2V5LCBub2RlS2V5KTtcbiAgICBpZiAobm9kZS5pc1Jvb3QpIHtcbiAgICAgIHRoaXMuX3NldEVkaXRlZFdvcmtpbmdTZXQodGhpcy5fZGF0YS5lZGl0ZWRXb3JraW5nU2V0LnJlbW92ZShub2RlS2V5KSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgcGFyZW50ID0gbm9kZS5nZXRQYXJlbnROb2RlKCk7XG4gICAgaWYgKHRoaXMuX2RhdGEuZWRpdGVkV29ya2luZ1NldC5jb250YWluc0ZpbGUocGFyZW50Lm5vZGVLZXkpKSB7XG4gICAgICB0aGlzLl91bmNoZWNrTm9kZShyb290S2V5LCBwYXJlbnQubm9kZUtleSk7XG4gICAgICBjb25zdCBjaGlsZHJlbktleXMgPSB0aGlzLmdldENhY2hlZENoaWxkS2V5cyhyb290S2V5LCBwYXJlbnQubm9kZUtleSk7XG4gICAgICBjb25zdCBzaWJsaW5nc0tleXMgPSBjaGlsZHJlbktleXMuZmlsdGVyKGNrID0+IGNrICE9PSBub2RlS2V5KTtcblxuICAgICAgdGhpcy5fc2V0RWRpdGVkV29ya2luZ1NldCh0aGlzLl9kYXRhLmVkaXRlZFdvcmtpbmdTZXQuYXBwZW5kKC4uLnNpYmxpbmdzS2V5cykpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9zZXRFZGl0ZWRXb3JraW5nU2V0KHRoaXMuX2RhdGEuZWRpdGVkV29ya2luZ1NldC5yZW1vdmUobm9kZUtleSkpO1xuICAgIH1cbiAgfVxuXG4gIF9vbWl0SGlkZGVuUGF0aHMobm9kZUtleXM6IEFycmF5PHN0cmluZz4pOiBBcnJheTxzdHJpbmc+IHtcbiAgICBpZiAoXG4gICAgICAhdGhpcy5fZGF0YS5oaWRlSWdub3JlZE5hbWVzICYmXG4gICAgICAhdGhpcy5fZGF0YS5leGNsdWRlVmNzSWdub3JlZFBhdGhzICYmXG4gICAgICB0aGlzLl9kYXRhLndvcmtpbmdTZXQuaXNFbXB0eSgpXG4gICAgKSB7XG4gICAgICByZXR1cm4gbm9kZUtleXM7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5vZGVLZXlzLmZpbHRlcihub2RlS2V5ID0+ICF0aGlzLl9zaG91bGRIaWRlUGF0aChub2RlS2V5KSk7XG4gIH1cblxuICBfc2hvdWxkSGlkZVBhdGgobm9kZUtleTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgY29uc3QgaXNJZ25vcmVkUGF0aCA9IHRoaXMuX2lzSWdub3JlZFBhdGgobm9kZUtleSk7XG4gICAgY29uc3QgaXNFeGNsdWRlZEZyb21XcyA9IHRoaXMuX2lzRXhjbHVkZWRGcm9tV29ya2luZ1NldChub2RlS2V5KTtcbiAgICBjb25zdCBpc0V4Y2x1ZGVkRnJvbU9wZW5GaWxlc1dzID0gdGhpcy5faXNFeGNsdWRlZEZyb21PcGVuRmlsZXNXb3JraW5nU2V0KG5vZGVLZXkpO1xuXG4gICAgaWYgKGlzSWdub3JlZFBhdGgpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHJldHVybiBpc0V4Y2x1ZGVkRnJvbVdzICYmIGlzRXhjbHVkZWRGcm9tT3BlbkZpbGVzV3M7XG4gIH1cblxuICBfaXNJZ25vcmVkUGF0aChub2RlS2V5OiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICBjb25zdCB7aGlkZUlnbm9yZWROYW1lcywgZXhjbHVkZVZjc0lnbm9yZWRQYXRocywgaWdub3JlZFBhdHRlcm5zfSA9IHRoaXMuX2RhdGE7XG5cbiAgICBpZiAoaGlkZUlnbm9yZWROYW1lcyAmJiBtYXRjaGVzU29tZShub2RlS2V5LCBpZ25vcmVkUGF0dGVybnMpKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKGV4Y2x1ZGVWY3NJZ25vcmVkUGF0aHMgJiYgaXNWY3NJZ25vcmVkKG5vZGVLZXksIHRoaXMuX3JlcG9zaXRvcnlGb3JQYXRoKG5vZGVLZXkpKSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgX2lzRXhjbHVkZWRGcm9tV29ya2luZ1NldChub2RlS2V5OiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICBjb25zdCB7d29ya2luZ1NldCwgaXNFZGl0aW5nV29ya2luZ1NldH0gPSB0aGlzLl9kYXRhO1xuXG4gICAgaWYgKCFpc0VkaXRpbmdXb3JraW5nU2V0KSB7XG4gICAgICBpZiAoRmlsZVRyZWVIZWxwZXJzLmlzRGlyS2V5KG5vZGVLZXkpKSB7XG4gICAgICAgIHJldHVybiAhd29ya2luZ1NldC5jb250YWluc0Rpcihub2RlS2V5KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiAhd29ya2luZ1NldC5jb250YWluc0ZpbGUobm9kZUtleSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgX2lzRXhjbHVkZWRGcm9tT3BlbkZpbGVzV29ya2luZ1NldChub2RlS2V5OiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICBjb25zdCB7b3BlbkZpbGVzV29ya2luZ1NldCwgaXNFZGl0aW5nV29ya2luZ1NldH0gPSB0aGlzLl9kYXRhO1xuXG4gICAgaWYgKGlzRWRpdGluZ1dvcmtpbmdTZXQpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAob3BlbkZpbGVzV29ya2luZ1NldC5pc0VtcHR5KCkpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIGlmIChGaWxlVHJlZUhlbHBlcnMuaXNEaXJLZXkobm9kZUtleSkpIHtcbiAgICAgIHJldHVybiAhb3BlbkZpbGVzV29ya2luZ1NldC5jb250YWluc0Rpcihub2RlS2V5KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuICFvcGVuRmlsZXNXb3JraW5nU2V0LmNvbnRhaW5zRmlsZShub2RlS2V5KTtcbiAgICB9XG4gIH1cblxuICByZXNldCgpOiB2b2lkIHtcbiAgICBjb25zdCBzdWJzY3JpcHRpb25NYXAgPSB0aGlzLl9kYXRhLnN1YnNjcmlwdGlvbk1hcDtcbiAgICBmb3IgKGNvbnN0IG5vZGVLZXkgb2YgT2JqZWN0LmtleXMoc3Vic2NyaXB0aW9uTWFwKSkge1xuICAgICAgY29uc3Qgc3Vic2NyaXB0aW9uID0gc3Vic2NyaXB0aW9uTWFwW25vZGVLZXldO1xuICAgICAgaWYgKHN1YnNjcmlwdGlvbikge1xuICAgICAgICBzdWJzY3JpcHRpb24uZGlzcG9zZSgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFJlc2V0IGRhdGEgc3RvcmUuXG4gICAgdGhpcy5fZGF0YSA9IHRoaXMuX2dldERlZmF1bHRzKCk7XG4gIH1cblxuICBzdWJzY3JpYmUobGlzdGVuZXI6IENoYW5nZUxpc3RlbmVyKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9lbWl0dGVyLm9uKCdjaGFuZ2UnLCBsaXN0ZW5lcik7XG4gIH1cbn1cblxuLy8gQSBoZWxwZXIgdG8gZGVsZXRlIGEgcHJvcGVydHkgaW4gYW4gb2JqZWN0IHVzaW5nIHNoYWxsb3cgY29weSByYXRoZXIgdGhhbiBtdXRhdGlvblxuZnVuY3Rpb24gZGVsZXRlUHJvcGVydHkob2JqZWN0OiBPYmplY3QsIGtleTogc3RyaW5nKTogT2JqZWN0IHtcbiAgaWYgKCFvYmplY3QuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgIHJldHVybiBvYmplY3Q7XG4gIH1cbiAgY29uc3QgbmV3T2JqZWN0ID0gey4uLm9iamVjdH07XG4gIGRlbGV0ZSBuZXdPYmplY3Rba2V5XTtcbiAgcmV0dXJuIG5ld09iamVjdDtcbn1cblxuLy8gQSBoZWxwZXIgdG8gc2V0IGEgcHJvcGVydHkgaW4gYW4gb2JqZWN0IHVzaW5nIHNoYWxsb3cgY29weSByYXRoZXIgdGhhbiBtdXRhdGlvblxuZnVuY3Rpb24gc2V0UHJvcGVydHkob2JqZWN0OiBPYmplY3QsIGtleTogc3RyaW5nLCBuZXdWYWx1ZTogbWl4ZWQpOiBPYmplY3Qge1xuICBjb25zdCBvbGRWYWx1ZSA9IG9iamVjdFtrZXldO1xuICBpZiAob2xkVmFsdWUgPT09IG5ld1ZhbHVlKSB7XG4gICAgcmV0dXJuIG9iamVjdDtcbiAgfVxuICBjb25zdCBuZXdPYmplY3QgPSB7Li4ub2JqZWN0fTtcbiAgbmV3T2JqZWN0W2tleV0gPSBuZXdWYWx1ZTtcbiAgcmV0dXJuIG5ld09iamVjdDtcbn1cblxuLy8gQ3JlYXRlIGEgbmV3IG9iamVjdCBieSBtYXBwaW5nIG92ZXIgdGhlIHByb3BlcnRpZXMgb2YgYSBnaXZlbiBvYmplY3QsIGNhbGxpbmcgdGhlIGdpdmVuXG4vLyBmdW5jdGlvbiBvbiBlYWNoIG9uZS5cbmZ1bmN0aW9uIG1hcFZhbHVlcyhvYmplY3Q6IE9iamVjdCwgZm46IEZ1bmN0aW9uKTogT2JqZWN0IHtcbiAgY29uc3QgbmV3T2JqZWN0ID0ge307XG4gIE9iamVjdC5rZXlzKG9iamVjdCkuZm9yRWFjaChrZXkgPT4ge1xuICAgIG5ld09iamVjdFtrZXldID0gZm4ob2JqZWN0W2tleV0sIGtleSk7XG4gIH0pO1xuICByZXR1cm4gbmV3T2JqZWN0O1xufVxuXG4vLyBEZXRlcm1pbmUgd2hldGhlciB0aGUgZ2l2ZW4gc3RyaW5nIG1hdGNoZXMgYW55IG9mIGEgc2V0IG9mIHBhdHRlcm5zLlxuZnVuY3Rpb24gbWF0Y2hlc1NvbWUoc3RyOiBzdHJpbmcsIHBhdHRlcm5zOiBJbW11dGFibGUuU2V0PE1pbmltYXRjaD4pIHtcbiAgcmV0dXJuIHBhdHRlcm5zLnNvbWUocGF0dGVybiA9PiBwYXR0ZXJuLm1hdGNoKHN0cikpO1xufVxuXG5mdW5jdGlvbiBpc1Zjc0lnbm9yZWQobm9kZUtleTogc3RyaW5nLCByZXBvOiA/YXRvbSRSZXBvc2l0b3J5KSB7XG4gIHJldHVybiByZXBvICYmIHJlcG8uaXNQcm9qZWN0QXRSb290KCkgJiYgcmVwby5pc1BhdGhJZ25vcmVkKG5vZGVLZXkpO1xufVxuXG5cbi8qKlxuICogUGVyZm9ybXMgYSBicmVhZHRoLWZpcnN0IGl0ZXJhdGlvbiBvdmVyIHRoZSBkaXJlY3RvcmllcyBvZiB0aGUgdHJlZSBzdGFydGluZ1xuICogd2l0aCBhIGdpdmVuIG5vZGUuIFRoZSBpdGVyYXRpb24gc3RvcHMgb25jZSBhIGdpdmVuIGxpbWl0IG9mIG5vZGVzIChib3RoIGRpcmVjdG9yaWVzXG4gKiBhbmQgZmlsZXMpIHdlcmUgdHJhdmVyc2VkLlxuICogVGhlIG5vZGUgYmVpbmcgY3VycmVudGx5IHRyYXZlcnNlZCBjYW4gYmUgb2J0YWluZWQgYnkgY2FsbGluZyAudHJhdmVyc2VkTm9kZSgpXG4gKiAubmV4dCgpIHJldHVybnMgYSBwcm9taXNlIHRoYXQgaXMgZnVsZmlsbGVkIHdoZW4gdGhlIHRyYXZlcnNhbCBtb3ZlcyBvbiB0b1xuICogdGhlIG5leHQgZGlyZWN0b3J5LlxuICovXG5jbGFzcyBGaWxlVHJlZVN0b3JlQmZzSXRlcmF0b3Ige1xuICBfZmlsZVRyZWVTdG9yZTogRmlsZVRyZWVTdG9yZTtcbiAgX3Jvb3RLZXk6IHN0cmluZztcbiAgX25vZGVzVG9UcmF2ZXJzZTogQXJyYXk8c3RyaW5nPjtcbiAgX2N1cnJlbnRseVRyYXZlcnNlZE5vZGU6ID9zdHJpbmc7XG4gIF9saW1pdDogbnVtYmVyO1xuICBfbnVtTm9kZXNUcmF2ZXJzZWQ6IG51bWJlcjtcbiAgX3Byb21pc2U6ID9Qcm9taXNlPHZvaWQ+O1xuICBfY291bnQ6IG51bWJlcjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIGZpbGVUcmVlU3RvcmU6IEZpbGVUcmVlU3RvcmUsXG4gICAgICByb290S2V5OiBzdHJpbmcsXG4gICAgICBub2RlS2V5OiBzdHJpbmcsXG4gICAgICBsaW1pdDogbnVtYmVyKSB7XG4gICAgdGhpcy5fZmlsZVRyZWVTdG9yZSA9IGZpbGVUcmVlU3RvcmU7XG4gICAgdGhpcy5fcm9vdEtleSA9IHJvb3RLZXk7XG4gICAgdGhpcy5fbm9kZXNUb1RyYXZlcnNlID0gW107XG4gICAgdGhpcy5fY3VycmVudGx5VHJhdmVyc2VkTm9kZSA9IG5vZGVLZXk7XG4gICAgdGhpcy5fbGltaXQgPSBsaW1pdDtcbiAgICB0aGlzLl9udW1Ob2Rlc1RyYXZlcnNlZCA9IDA7XG4gICAgdGhpcy5fcHJvbWlzZSA9IG51bGw7XG4gICAgdGhpcy5fY291bnQgPSAwO1xuICB9XG5cbiAgX2hhbmRsZVByb21pc2VSZXNvbHV0aW9uKGNoaWxkcmVuS2V5czogQXJyYXk8c3RyaW5nPik6IHZvaWQge1xuICAgIHRoaXMuX251bU5vZGVzVHJhdmVyc2VkICs9IGNoaWxkcmVuS2V5cy5sZW5ndGg7XG4gICAgaWYgKHRoaXMuX251bU5vZGVzVHJhdmVyc2VkIDwgdGhpcy5fbGltaXQpIHtcbiAgICAgIGNvbnN0IG5leHRMZXZlbE5vZGVzID0gY2hpbGRyZW5LZXlzLmZpbHRlcihjaGlsZEtleSA9PiBGaWxlVHJlZUhlbHBlcnMuaXNEaXJLZXkoY2hpbGRLZXkpKTtcbiAgICAgIHRoaXMuX25vZGVzVG9UcmF2ZXJzZSA9IHRoaXMuX25vZGVzVG9UcmF2ZXJzZS5jb25jYXQobmV4dExldmVsTm9kZXMpO1xuXG4gICAgICB0aGlzLl9jdXJyZW50bHlUcmF2ZXJzZWROb2RlID0gdGhpcy5fbm9kZXNUb1RyYXZlcnNlLnNwbGljZSgwLCAxKVswXTtcbiAgICAgIHRoaXMuX3Byb21pc2UgPSBudWxsO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9jdXJyZW50bHlUcmF2ZXJzZWROb2RlID0gbnVsbDtcbiAgICAgIHRoaXMuX3Byb21pc2UgPSBudWxsO1xuICAgIH1cblxuICAgIHJldHVybjtcbiAgfVxuXG4gIG5leHQoKTogP1Byb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IGN1cnJlbnRseVRyYXZlcnNlZE5vZGUgPSB0aGlzLl9jdXJyZW50bHlUcmF2ZXJzZWROb2RlO1xuICAgIGlmICghdGhpcy5fcHJvbWlzZSAmJiBjdXJyZW50bHlUcmF2ZXJzZWROb2RlKSB7XG4gICAgICB0aGlzLl9wcm9taXNlID0gdGhpcy5fZmlsZVRyZWVTdG9yZS5wcm9taXNlTm9kZUNoaWxkS2V5cyhcbiAgICAgICAgdGhpcy5fcm9vdEtleSxcbiAgICAgICAgY3VycmVudGx5VHJhdmVyc2VkTm9kZSlcbiAgICAgIC50aGVuKHRoaXMuX2hhbmRsZVByb21pc2VSZXNvbHV0aW9uLmJpbmQodGhpcykpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fcHJvbWlzZTtcbiAgfVxuXG4gIHRyYXZlcnNlZE5vZGUoKTogP3N0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX2N1cnJlbnRseVRyYXZlcnNlZE5vZGU7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBGaWxlVHJlZVN0b3JlO1xuIl19