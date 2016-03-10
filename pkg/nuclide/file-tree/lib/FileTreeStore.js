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
        cwdKey: null,
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
        case _FileTreeConstants.ActionType.SET_CWD:
          this._setCwdKey(payload.rootKey);
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
     * The node child keys may either be available immediately (cached), or
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
        // Collapse the node and clear its loading state on error so the
        // user can retry expanding it.
        var rootKey = _this6.getRootForKey(nodeKey);
        if (rootKey != null) {
          _this6._collapseNode(rootKey, nodeKey);
        }
        _this6._clearLoading(nodeKey);
      }).then(function (childKeys) {
        // If this node's root went away while the Promise was resolving, do
        // no more work. This is no longer needed in the store.
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
  }, {
    key: 'isCwd',
    value: function isCwd(nodeKey) {
      return nodeKey === this._data.cwdKey;
    }
  }, {
    key: 'hasCwd',
    value: function hasCwd() {
      return this._data.cwdKey != null;
    }
  }, {
    key: '_setCwdKey',
    value: function _setCwdKey(rootKey) {
      this._set('cwdKey', rootKey);
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
        var entry = _FileTreeHelpers2['default'].getEntryByKey(node.nodeKey);

        if (entry == null) {
          return;
        }
        var path = entry.getPath();
        var repository = (0, _hgGitBridge.repositoryForPath)(path);
        if (repository != null && repository.getType() === 'hg') {
          var hgRepository = repository;
          try {
            yield hgRepository.remove(path);
          } catch (e) {
            var statuses = yield hgRepository.getStatuses([path]);
            var pathStatus = statuses.get(path);
            var goodStatuses = [_hgRepositoryBaseLibHgConstants.StatusCodeNumber.ADDED, _hgRepositoryBaseLibHgConstants.StatusCodeNumber.CLEAN, _hgRepositoryBaseLibHgConstants.StatusCodeNumber.MODIFIED];
            if (goodStatuses.indexOf(pathStatus) !== -1) {
              atom.notifications.addError('Failed to remove ' + path + ' from version control.  The file will ' + 'still get deleted but you will have to remove it from your VCS yourself.  Error: ' + e.toString());
            }
          }
        }
        if (_FileTreeHelpers2['default'].isLocalEntry(entry)) {
          // TODO: This special-case can be eliminated once `delete()` is added to `Directory`
          // and `File`.
          _shell2['default'].moveItemToTrash(node.nodePath);
        } else {
          var remoteFile = entry;
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
      if (isIgnoredPath) {
        return true;
      }

      var isExcludedFromWs = this._isExcludedFromWorkingSet(nodeKey);
      return isExcludedFromWs && this._isExcludedFromOpenFilesWorkingSet(nodeKey);
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
//# sourceMappingURL=data:application/json;base64,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dUIsR0FBRyxJQUFJLENBQUM7QUFDcEMsWUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7T0FDdEI7O0FBRUQsYUFBTztLQUNSOzs7V0FFRyxnQkFBbUI7QUFDckIsVUFBTSxzQkFBc0IsR0FBRyxJQUFJLENBQUMsdUJBQXVCLENBQUM7QUFDNUQsVUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLElBQUksc0JBQXNCLEVBQUU7QUFDNUMsWUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLG9CQUFvQixDQUN0RCxJQUFJLENBQUMsUUFBUSxFQUNiLHNCQUFzQixDQUFDLENBQ3hCLElBQUksQ0FBQyxJQUFJLENBQUMsd0JBQXdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7T0FDakQ7QUFDRCxhQUFPLElBQUksQ0FBQyxRQUFRLENBQUM7S0FDdEI7OztXQUVZLHlCQUFZO0FBQ3ZCLGFBQU8sSUFBSSxDQUFDLHVCQUF1QixDQUFDO0tBQ3JDOzs7U0F0REcsd0JBQXdCOzs7QUF5RDlCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsYUFBYSxDQUFDIiwiZmlsZSI6IkZpbGVUcmVlU3RvcmUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7SGdSZXBvc2l0b3J5Q2xpZW50fSBmcm9tICcuLi8uLi9oZy1yZXBvc2l0b3J5LWNsaWVudCc7XG5pbXBvcnQgdHlwZSB7XG4gIFJlbW90ZURpcmVjdG9yeSxcbiAgUmVtb3RlRmlsZSxcbn0gZnJvbSAnLi4vLi4vcmVtb3RlLWNvbm5lY3Rpb24nO1xuXG5pbXBvcnQgRmlsZVRyZWVEaXNwYXRjaGVyIGZyb20gJy4vRmlsZVRyZWVEaXNwYXRjaGVyJztcbmltcG9ydCBGaWxlVHJlZUhlbHBlcnMgZnJvbSAnLi9GaWxlVHJlZUhlbHBlcnMnO1xuaW1wb3J0IEZpbGVUcmVlTm9kZSBmcm9tICcuL0ZpbGVUcmVlTm9kZSc7XG5pbXBvcnQgSW1tdXRhYmxlIGZyb20gJ2ltbXV0YWJsZSc7XG5pbXBvcnQge0FjdGlvblR5cGV9IGZyb20gJy4vRmlsZVRyZWVDb25zdGFudHMnO1xuaW1wb3J0IHtEaXNwb3NhYmxlLCBFbWl0dGVyfSBmcm9tICdhdG9tJztcbmltcG9ydCB7TWluaW1hdGNofSBmcm9tICdtaW5pbWF0Y2gnO1xuaW1wb3J0IHtyZXBvc2l0b3J5Q29udGFpbnNQYXRofSBmcm9tICcuLi8uLi9oZy1naXQtYnJpZGdlJztcbmltcG9ydCB7cmVwb3NpdG9yeUZvclBhdGh9IGZyb20gJy4uLy4uL2hnLWdpdC1icmlkZ2UnO1xuaW1wb3J0IHtTdGF0dXNDb2RlTnVtYmVyfSBmcm9tICcuLi8uLi9oZy1yZXBvc2l0b3J5LWJhc2UvbGliL2hnLWNvbnN0YW50cyc7XG5cbmltcG9ydCB7YXJyYXl9IGZyb20gJy4uLy4uL2NvbW1vbnMnO1xuaW1wb3J0IHtnZXRMb2dnZXJ9IGZyb20gJy4uLy4uL2xvZ2dpbmcnO1xuaW1wb3J0IHtvYmplY3QgYXMgb2JqZWN0VXRpbH0gZnJvbSAnLi4vLi4vY29tbW9ucyc7XG5pbXBvcnQgc2hlbGwgZnJvbSAnc2hlbGwnO1xuaW1wb3J0IG1lbW9pemUgZnJvbSAnbG9kYXNoLm1lbW9pemUnO1xuXG5pbXBvcnQge1dvcmtpbmdTZXR9IGZyb20gJy4uLy4uL3dvcmtpbmctc2V0cyc7XG5cbi8vIFVzZWQgdG8gZW5zdXJlIHRoZSB2ZXJzaW9uIHdlIHNlcmlhbGl6ZWQgaXMgdGhlIHNhbWUgdmVyc2lvbiB3ZSBhcmUgZGVzZXJpYWxpemluZy5cbmNvbnN0IFZFUlNJT04gPSAxO1xuXG5pbXBvcnQgdHlwZSB7RGlzcGF0Y2hlcn0gZnJvbSAnZmx1eCc7XG5pbXBvcnQgdHlwZSB7TnVjbGlkZVVyaX0gZnJvbSAnLi4vLi4vcmVtb3RlLXVyaSc7XG5pbXBvcnQgdHlwZSB7V29ya2luZ1NldHNTdG9yZX0gZnJvbSAnLi4vLi4vd29ya2luZy1zZXRzL2xpYi9Xb3JraW5nU2V0c1N0b3JlJztcblxuXG50eXBlIEFjdGlvblBheWxvYWQgPSBPYmplY3Q7XG50eXBlIENoYW5nZUxpc3RlbmVyID0gKCkgPT4gbWl4ZWQ7XG5cbmV4cG9ydCB0eXBlIEZpbGVUcmVlTm9kZURhdGEgPSB7XG4gIG5vZGVLZXk6IHN0cmluZztcbiAgcm9vdEtleTogc3RyaW5nO1xufVxuXG50eXBlIFN0b3JlRGF0YSA9IHtcbiAgY3dkS2V5OiA/c3RyaW5nO1xuICBjaGlsZEtleU1hcDogeyBba2V5OiBzdHJpbmddOiBBcnJheTxzdHJpbmc+IH07XG4gIGlzRGlydHlNYXA6IHsgW2tleTogc3RyaW5nXTogYm9vbGVhbiB9O1xuICBleHBhbmRlZEtleXNCeVJvb3Q6IHsgW2tleTogc3RyaW5nXTogSW1tdXRhYmxlLlNldDxzdHJpbmc+IH07XG4gIHRyYWNrZWROb2RlOiA/RmlsZVRyZWVOb2RlRGF0YTtcbiAgLy8gU2F2ZXMgYSBsaXN0IG9mIGNoaWxkIG5vZGVzIHRoYXQgc2hvdWxkIGJlIGV4cGFuZGUgd2hlbiBhIGdpdmVuIGtleSBpcyBleHBhbmRlZC5cbiAgLy8gTG9va3MgbGlrZTogeyByb290S2V5OiB7IG5vZGVLZXk6IFtjaGlsZEtleTEsIGNoaWxkS2V5Ml0gfSB9LlxuICBwcmV2aW91c2x5RXhwYW5kZWQ6IHsgW3Jvb3RLZXk6IHN0cmluZ106IEltbXV0YWJsZS5NYXA8c3RyaW5nLCBBcnJheTxTdHJpbmc+PiB9O1xuICBpc0xvYWRpbmdNYXA6IHsgW2tleTogc3RyaW5nXTogP1Byb21pc2UgfTtcbiAgcm9vdEtleXM6IEFycmF5PHN0cmluZz47XG4gIHNlbGVjdGVkS2V5c0J5Um9vdDogeyBba2V5OiBzdHJpbmddOiBJbW11dGFibGUuT3JkZXJlZFNldDxzdHJpbmc+IH07XG4gIHN1YnNjcmlwdGlvbk1hcDogeyBba2V5OiBzdHJpbmddOiBEaXNwb3NhYmxlIH07XG4gIHZjc1N0YXR1c2VzQnlSb290OiB7IFtrZXk6IHN0cmluZ106IEltbXV0YWJsZS5NYXA8c3RyaW5nLCBudW1iZXI+IH07XG4gIGlnbm9yZWRQYXR0ZXJuczogSW1tdXRhYmxlLlNldDxNaW5pbWF0Y2g+O1xuICBoaWRlSWdub3JlZE5hbWVzOiBib29sZWFuO1xuICBleGNsdWRlVmNzSWdub3JlZFBhdGhzOiBib29sZWFuO1xuICB1c2VQcmV2aWV3VGFiczogYm9vbGVhbjtcbiAgdXNlUHJlZml4TmF2OiBib29sZWFuO1xuICByZXBvc2l0b3JpZXM6IEltbXV0YWJsZS5TZXQ8YXRvbSRSZXBvc2l0b3J5PjtcbiAgd29ya2luZ1NldDogV29ya2luZ1NldDtcbiAgb3BlbkZpbGVzV29ya2luZ1NldDogV29ya2luZ1NldDtcbiAgd29ya2luZ1NldHNTdG9yZTogP1dvcmtpbmdTZXRzU3RvcmU7XG4gIGlzRWRpdGluZ1dvcmtpbmdTZXQ6IGJvb2xlYW47XG4gIGVkaXRlZFdvcmtpbmdTZXQ6IFdvcmtpbmdTZXQ7XG59O1xuXG5leHBvcnQgdHlwZSBFeHBvcnRTdG9yZURhdGEgPSB7XG4gIGNoaWxkS2V5TWFwOiB7IFtrZXk6IHN0cmluZ106IEFycmF5PHN0cmluZz4gfTtcbiAgZXhwYW5kZWRLZXlzQnlSb290OiB7IFtrZXk6IHN0cmluZ106IEFycmF5PHN0cmluZz4gfTtcbiAgcm9vdEtleXM6IEFycmF5PHN0cmluZz47XG4gIHNlbGVjdGVkS2V5c0J5Um9vdDogeyBba2V5OiBzdHJpbmddOiBBcnJheTxzdHJpbmc+IH07XG4gIHZlcnNpb246IG51bWJlcjtcbn07XG5cbmxldCBpbnN0YW5jZTogP09iamVjdDtcblxuLyoqXG4gKiBJbXBsZW1lbnRzIHRoZSBGbHV4IHBhdHRlcm4gZm9yIG91ciBmaWxlIHRyZWUuIEFsbCBzdGF0ZSBmb3IgdGhlIGZpbGUgdHJlZSB3aWxsIGJlIGtlcHQgaW5cbiAqIEZpbGVUcmVlU3RvcmUgYW5kIHRoZSBvbmx5IHdheSB0byB1cGRhdGUgdGhlIHN0b3JlIGlzIHRocm91Z2ggbWV0aG9kcyBvbiBGaWxlVHJlZUFjdGlvbnMuIFRoZVxuICogZGlzcGF0Y2hlciBpcyBhIG1lY2hhbmlzbSB0aHJvdWdoIHdoaWNoIEZpbGVUcmVlQWN0aW9ucyBpbnRlcmZhY2VzIHdpdGggRmlsZVRyZWVTdG9yZS5cbiAqL1xuY2xhc3MgRmlsZVRyZWVTdG9yZSB7XG4gIF9kYXRhOiBTdG9yZURhdGE7XG4gIF9kaXNwYXRjaGVyOiBEaXNwYXRjaGVyO1xuICBfZW1pdHRlcjogRW1pdHRlcjtcbiAgX2xvZ2dlcjogYW55O1xuICBfdGltZXI6ID9PYmplY3Q7XG4gIF9yZXBvc2l0b3J5Rm9yUGF0aDogKHBhdGg6IE51Y2xpZGVVcmkpID0+ID9hdG9tJFJlcG9zaXRvcnk7XG5cbiAgc3RhdGljIGdldEluc3RhbmNlKCk6IEZpbGVUcmVlU3RvcmUge1xuICAgIGlmICghaW5zdGFuY2UpIHtcbiAgICAgIGluc3RhbmNlID0gbmV3IEZpbGVUcmVlU3RvcmUoKTtcbiAgICB9XG4gICAgcmV0dXJuIGluc3RhbmNlO1xuICB9XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5fZGF0YSA9IHRoaXMuX2dldERlZmF1bHRzKCk7XG4gICAgdGhpcy5fZGlzcGF0Y2hlciA9IEZpbGVUcmVlRGlzcGF0Y2hlci5nZXRJbnN0YW5jZSgpO1xuICAgIHRoaXMuX2VtaXR0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIucmVnaXN0ZXIoXG4gICAgICBwYXlsb2FkID0+IHRoaXMuX29uRGlzcGF0Y2gocGF5bG9hZClcbiAgICApO1xuICAgIHRoaXMuX2xvZ2dlciA9IGdldExvZ2dlcigpO1xuICAgIHRoaXMuX3JlcG9zaXRvcnlGb3JQYXRoID0gbWVtb2l6ZSh0aGlzLl9yZXBvc2l0b3J5Rm9yUGF0aCk7XG4gIH1cblxuICAvKipcbiAgICogVE9ETzogTW92ZSB0byBhIFtzZXJpYWxpemF0aW9uIGNsYXNzXVsxXSBhbmQgdXNlIHRoZSBidWlsdC1pbiB2ZXJzaW9uaW5nIG1lY2hhbmlzbS4gVGhpcyBtaWdodFxuICAgKiBuZWVkIHRvIGJlIGRvbmUgb25lIGxldmVsIGhpZ2hlciB3aXRoaW4gbWFpbi5qcy5cbiAgICpcbiAgICogWzFdOiBodHRwczovL2F0b20uaW8vZG9jcy9sYXRlc3QvYmVoaW5kLWF0b20tc2VyaWFsaXphdGlvbi1pbi1hdG9tXG4gICAqL1xuICBleHBvcnREYXRhKCk6IEV4cG9ydFN0b3JlRGF0YSB7XG4gICAgY29uc3QgZGF0YSA9IHRoaXMuX2RhdGE7XG4gICAgLy8gR3JhYiB0aGUgY2hpbGQga2V5cyBvZiBvbmx5IHRoZSBleHBhbmRlZCBub2Rlcy5cbiAgICBjb25zdCBjaGlsZEtleU1hcCA9IHt9O1xuICAgIE9iamVjdC5rZXlzKGRhdGEuZXhwYW5kZWRLZXlzQnlSb290KS5mb3JFYWNoKHJvb3RLZXkgPT4ge1xuICAgICAgY29uc3QgZXhwYW5kZWRLZXlTZXQgPSBkYXRhLmV4cGFuZGVkS2V5c0J5Um9vdFtyb290S2V5XTtcbiAgICAgIGZvciAoY29uc3Qgbm9kZUtleSBvZiBleHBhbmRlZEtleVNldCkge1xuICAgICAgICBjaGlsZEtleU1hcFtub2RlS2V5XSA9IGRhdGEuY2hpbGRLZXlNYXBbbm9kZUtleV07XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHtcbiAgICAgIHZlcnNpb246IFZFUlNJT04sXG4gICAgICBjaGlsZEtleU1hcDogY2hpbGRLZXlNYXAsXG4gICAgICBleHBhbmRlZEtleXNCeVJvb3Q6IG1hcFZhbHVlcyhkYXRhLmV4cGFuZGVkS2V5c0J5Um9vdCwga2V5U2V0ID0+IGtleVNldC50b0FycmF5KCkpLFxuICAgICAgcm9vdEtleXM6IGRhdGEucm9vdEtleXMsXG4gICAgICBzZWxlY3RlZEtleXNCeVJvb3Q6IG1hcFZhbHVlcyhkYXRhLnNlbGVjdGVkS2V5c0J5Um9vdCwga2V5U2V0ID0+IGtleVNldC50b0FycmF5KCkpLFxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogSW1wb3J0cyBzdG9yZSBkYXRhIGZyb20gYSBwcmV2aW91cyBleHBvcnQuXG4gICAqL1xuICBsb2FkRGF0YShkYXRhOiBFeHBvcnRTdG9yZURhdGEpOiB2b2lkIHtcbiAgICAvLyBFbnN1cmUgd2UgYXJlIG5vdCB0cnlpbmcgdG8gbG9hZCBkYXRhIGZyb20gYW4gZWFybGllciB2ZXJzaW9uIG9mIHRoaXMgcGFja2FnZS5cbiAgICBpZiAoZGF0YS52ZXJzaW9uICE9PSBWRVJTSU9OKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuX2RhdGEgPSB7XG4gICAgICAuLi50aGlzLl9nZXREZWZhdWx0cygpLFxuICAgICAgY2hpbGRLZXlNYXA6IGRhdGEuY2hpbGRLZXlNYXAsXG4gICAgICBleHBhbmRlZEtleXNCeVJvb3Q6IG1hcFZhbHVlcyhkYXRhLmV4cGFuZGVkS2V5c0J5Um9vdCwga2V5cyA9PiBuZXcgSW1tdXRhYmxlLlNldChrZXlzKSksXG4gICAgICByb290S2V5czogZGF0YS5yb290S2V5cyxcbiAgICAgIHNlbGVjdGVkS2V5c0J5Um9vdDpcbiAgICAgICAgbWFwVmFsdWVzKGRhdGEuc2VsZWN0ZWRLZXlzQnlSb290LCBrZXlzID0+IG5ldyBJbW11dGFibGUuT3JkZXJlZFNldChrZXlzKSksXG4gICAgfTtcbiAgICBPYmplY3Qua2V5cyhkYXRhLmNoaWxkS2V5TWFwKS5mb3JFYWNoKG5vZGVLZXkgPT4ge1xuICAgICAgdGhpcy5fYWRkU3Vic2NyaXB0aW9uKG5vZGVLZXkpO1xuICAgICAgdGhpcy5fZmV0Y2hDaGlsZEtleXMobm9kZUtleSk7XG4gICAgfSk7XG4gIH1cblxuICBfc2V0RXhjbHVkZVZjc0lnbm9yZWRQYXRocyhleGNsdWRlVmNzSWdub3JlZFBhdGhzOiBib29sZWFuKTogdm9pZCB7XG4gICAgdGhpcy5fc2V0KCdleGNsdWRlVmNzSWdub3JlZFBhdGhzJywgZXhjbHVkZVZjc0lnbm9yZWRQYXRocyk7XG4gIH1cblxuICBfc2V0SGlkZUlnbm9yZWROYW1lcyhoaWRlSWdub3JlZE5hbWVzOiBib29sZWFuKTogdm9pZCB7XG4gICAgdGhpcy5fc2V0KCdoaWRlSWdub3JlZE5hbWVzJywgaGlkZUlnbm9yZWROYW1lcyk7XG4gIH1cblxuICAvKipcbiAgICogR2l2ZW4gYSBsaXN0IG9mIG5hbWVzIHRvIGlnbm9yZSwgY29tcGlsZSB0aGVtIGludG8gbWluaW1hdGNoIHBhdHRlcm5zIGFuZFxuICAgKiB1cGRhdGUgdGhlIHN0b3JlIHdpdGggdGhlbS5cbiAgICovXG4gIF9zZXRJZ25vcmVkTmFtZXMoaWdub3JlZE5hbWVzOiBBcnJheTxzdHJpbmc+KSB7XG4gICAgY29uc3QgaWdub3JlZFBhdHRlcm5zID0gSW1tdXRhYmxlLlNldChpZ25vcmVkTmFtZXMpXG4gICAgICAubWFwKGlnbm9yZWROYW1lID0+IHtcbiAgICAgICAgaWYgKGlnbm9yZWROYW1lID09PSAnJykge1xuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgcmV0dXJuIG5ldyBNaW5pbWF0Y2goaWdub3JlZE5hbWUsIHttYXRjaEJhc2U6IHRydWUsIGRvdDogdHJ1ZX0pO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKFxuICAgICAgICAgICAgYEVycm9yIHBhcnNpbmcgcGF0dGVybiAnJHtpZ25vcmVkTmFtZX0nIGZyb20gXCJTZXR0aW5nc1wiID4gXCJJZ25vcmVkIE5hbWVzXCJgLFxuICAgICAgICAgICAge2RldGFpbDogZXJyb3IubWVzc2FnZX0sXG4gICAgICAgICAgKTtcbiAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIC5maWx0ZXIocGF0dGVybiA9PiBwYXR0ZXJuICE9IG51bGwpO1xuICAgIHRoaXMuX3NldCgnaWdub3JlZFBhdHRlcm5zJywgaWdub3JlZFBhdHRlcm5zKTtcbiAgfVxuXG4gIF9nZXREZWZhdWx0cygpOiBTdG9yZURhdGEge1xuICAgIHJldHVybiB7XG4gICAgICBjd2RLZXk6IG51bGwsXG4gICAgICBjaGlsZEtleU1hcDoge30sXG4gICAgICBpc0RpcnR5TWFwOiB7fSxcbiAgICAgIGV4cGFuZGVkS2V5c0J5Um9vdDoge30sXG4gICAgICB0cmFja2VkTm9kZTogbnVsbCxcbiAgICAgIHByZXZpb3VzbHlFeHBhbmRlZDoge30sXG4gICAgICBpc0xvYWRpbmdNYXA6IHt9LFxuICAgICAgcm9vdEtleXM6IFtdLFxuICAgICAgc2VsZWN0ZWRLZXlzQnlSb290OiB7fSxcbiAgICAgIHN1YnNjcmlwdGlvbk1hcDoge30sXG4gICAgICB2Y3NTdGF0dXNlc0J5Um9vdDoge30sXG4gICAgICBpZ25vcmVkUGF0dGVybnM6IEltbXV0YWJsZS5TZXQoKSxcbiAgICAgIGhpZGVJZ25vcmVkTmFtZXM6IHRydWUsXG4gICAgICBleGNsdWRlVmNzSWdub3JlZFBhdGhzOiB0cnVlLFxuICAgICAgdXNlUHJldmlld1RhYnM6IGZhbHNlLFxuICAgICAgdXNlUHJlZml4TmF2OiB0cnVlLFxuICAgICAgcmVwb3NpdG9yaWVzOiBJbW11dGFibGUuU2V0KCksXG4gICAgICB3b3JraW5nU2V0OiBuZXcgV29ya2luZ1NldCgpLFxuICAgICAgb3BlbkZpbGVzV29ya2luZ1NldDogbmV3IFdvcmtpbmdTZXQoKSxcbiAgICAgIHdvcmtpbmdTZXRzU3RvcmU6IG51bGwsXG4gICAgICBpc0VkaXRpbmdXb3JraW5nU2V0OiBmYWxzZSxcbiAgICAgIGVkaXRlZFdvcmtpbmdTZXQ6IG5ldyBXb3JraW5nU2V0KCksXG4gICAgfTtcbiAgfVxuXG4gIF9vbkRpc3BhdGNoKHBheWxvYWQ6IEFjdGlvblBheWxvYWQpOiB2b2lkIHtcbiAgICBzd2l0Y2ggKHBheWxvYWQuYWN0aW9uVHlwZSkge1xuICAgICAgY2FzZSBBY3Rpb25UeXBlLkRFTEVURV9TRUxFQ1RFRF9OT0RFUzpcbiAgICAgICAgdGhpcy5fZGVsZXRlU2VsZWN0ZWROb2RlcygpLmNhdGNoKGVycm9yID0+IHtcbiAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoJ0RlbGV0aW5nIG5vZGVzIGZhaWxlZCB3aXRoIGFuIGVycm9yOiAnICsgZXJyb3IudG9TdHJpbmcoKSk7XG4gICAgICAgIH0pO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQWN0aW9uVHlwZS5TRVRfQ1dEOlxuICAgICAgICB0aGlzLl9zZXRDd2RLZXkocGF5bG9hZC5yb290S2V5KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEFjdGlvblR5cGUuU0VUX1RSQUNLRURfTk9ERTpcbiAgICAgICAgdGhpcy5fc2V0VHJhY2tlZE5vZGUocGF5bG9hZC5yb290S2V5LCBwYXlsb2FkLm5vZGVLZXkpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQWN0aW9uVHlwZS5TRVRfUk9PVF9LRVlTOlxuICAgICAgICB0aGlzLl9zZXRSb290S2V5cyhwYXlsb2FkLnJvb3RLZXlzKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEFjdGlvblR5cGUuRVhQQU5EX05PREU6XG4gICAgICAgIHRoaXMuX2V4cGFuZE5vZGUocGF5bG9hZC5yb290S2V5LCBwYXlsb2FkLm5vZGVLZXkpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQWN0aW9uVHlwZS5FWFBBTkRfTk9ERV9ERUVQOlxuICAgICAgICB0aGlzLl9leHBhbmROb2RlRGVlcChwYXlsb2FkLnJvb3RLZXksIHBheWxvYWQubm9kZUtleSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBBY3Rpb25UeXBlLkNPTExBUFNFX05PREU6XG4gICAgICAgIHRoaXMuX2NvbGxhcHNlTm9kZShwYXlsb2FkLnJvb3RLZXksIHBheWxvYWQubm9kZUtleSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBBY3Rpb25UeXBlLlNFVF9FWENMVURFX1ZDU19JR05PUkVEX1BBVEhTOlxuICAgICAgICB0aGlzLl9zZXRFeGNsdWRlVmNzSWdub3JlZFBhdGhzKHBheWxvYWQuZXhjbHVkZVZjc0lnbm9yZWRQYXRocyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBBY3Rpb25UeXBlLlNFVF9VU0VfUFJFVklFV19UQUJTOlxuICAgICAgICB0aGlzLl9zZXRVc2VQcmV2aWV3VGFicyhwYXlsb2FkLnVzZVByZXZpZXdUYWJzKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEFjdGlvblR5cGUuU0VUX1VTRV9QUkVGSVhfTkFWOlxuICAgICAgICB0aGlzLl9zZXRVc2VQcmVmaXhOYXYocGF5bG9hZC51c2VQcmVmaXhOYXYpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQWN0aW9uVHlwZS5DT0xMQVBTRV9OT0RFX0RFRVA6XG4gICAgICAgIHRoaXMuX3B1cmdlRGlyZWN0b3J5V2l0aGluQVJvb3QocGF5bG9hZC5yb290S2V5LCBwYXlsb2FkLm5vZGVLZXksIC8qIHVuc2VsZWN0ICovZmFsc2UpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQWN0aW9uVHlwZS5TRVRfSElERV9JR05PUkVEX05BTUVTOlxuICAgICAgICB0aGlzLl9zZXRIaWRlSWdub3JlZE5hbWVzKHBheWxvYWQuaGlkZUlnbm9yZWROYW1lcyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBBY3Rpb25UeXBlLlNFVF9JR05PUkVEX05BTUVTOlxuICAgICAgICB0aGlzLl9zZXRJZ25vcmVkTmFtZXMocGF5bG9hZC5pZ25vcmVkTmFtZXMpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQWN0aW9uVHlwZS5TRVRfU0VMRUNURURfTk9ERVNfRk9SX1JPT1Q6XG4gICAgICAgIHRoaXMuX3NldFNlbGVjdGVkS2V5cyhwYXlsb2FkLnJvb3RLZXksIHBheWxvYWQubm9kZUtleXMpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQWN0aW9uVHlwZS5TRVRfU0VMRUNURURfTk9ERVNfRk9SX1RSRUU6XG4gICAgICAgIHRoaXMuX3NldFNlbGVjdGVkS2V5c0J5Um9vdChwYXlsb2FkLnNlbGVjdGVkS2V5c0J5Um9vdCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBBY3Rpb25UeXBlLkNSRUFURV9DSElMRDpcbiAgICAgICAgdGhpcy5fY3JlYXRlQ2hpbGQocGF5bG9hZC5ub2RlS2V5LCBwYXlsb2FkLmNoaWxkS2V5KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEFjdGlvblR5cGUuU0VUX1ZDU19TVEFUVVNFUzpcbiAgICAgICAgdGhpcy5fc2V0VmNzU3RhdHVzZXMocGF5bG9hZC5yb290S2V5LCBwYXlsb2FkLnZjc1N0YXR1c2VzKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEFjdGlvblR5cGUuU0VUX1JFUE9TSVRPUklFUzpcbiAgICAgICAgdGhpcy5fc2V0UmVwb3NpdG9yaWVzKHBheWxvYWQucmVwb3NpdG9yaWVzKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEFjdGlvblR5cGUuU0VUX1dPUktJTkdfU0VUOlxuICAgICAgICB0aGlzLl9zZXRXb3JraW5nU2V0KHBheWxvYWQud29ya2luZ1NldCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBBY3Rpb25UeXBlLlNFVF9PUEVOX0ZJTEVTX1dPUktJTkdfU0VUOlxuICAgICAgICB0aGlzLl9zZXRPcGVuRmlsZXNXb3JraW5nU2V0KHBheWxvYWQub3BlbkZpbGVzV29ya2luZ1NldCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBBY3Rpb25UeXBlLlNFVF9XT1JLSU5HX1NFVFNfU1RPUkU6XG4gICAgICAgIHRoaXMuX3NldFdvcmtpbmdTZXRzU3RvcmUocGF5bG9hZC53b3JraW5nU2V0c1N0b3JlKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEFjdGlvblR5cGUuU1RBUlRfRURJVElOR19XT1JLSU5HX1NFVDpcbiAgICAgICAgdGhpcy5fc3RhcnRFZGl0aW5nV29ya2luZ1NldChwYXlsb2FkLmVkaXRlZFdvcmtpbmdTZXQpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQWN0aW9uVHlwZS5GSU5JU0hfRURJVElOR19XT1JLSU5HX1NFVDpcbiAgICAgICAgdGhpcy5fZmluaXNoRWRpdGluZ1dvcmtpbmdTZXQoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEFjdGlvblR5cGUuQ0hFQ0tfTk9ERTpcbiAgICAgICAgdGhpcy5fY2hlY2tOb2RlKHBheWxvYWQucm9vdEtleSwgcGF5bG9hZC5ub2RlS2V5KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEFjdGlvblR5cGUuVU5DSEVDS19OT0RFOlxuICAgICAgICB0aGlzLl91bmNoZWNrTm9kZShwYXlsb2FkLnJvb3RLZXksIHBheWxvYWQubm9kZUtleSk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIGlzIGEgcHJpdmF0ZSBtZXRob2QgYmVjYXVzZSBpbiBGbHV4IHdlIHNob3VsZCBuZXZlciBleHRlcm5hbGx5IHdyaXRlIHRvIHRoZSBkYXRhIHN0b3JlLlxuICAgKiBPbmx5IGJ5IHJlY2VpdmluZyBhY3Rpb25zIChmcm9tIGRpc3BhdGNoZXIpIHNob3VsZCB0aGUgZGF0YSBzdG9yZSBiZSBjaGFuZ2VkLlxuICAgKiBOb3RlOiBgX3NldGAgY2FuIGJlIGNhbGxlZCBtdWx0aXBsZSB0aW1lcyB3aXRoaW4gb25lIGl0ZXJhdGlvbiBvZiBhbiBldmVudCBsb29wIHdpdGhvdXRcbiAgICogdGhyYXNoaW5nIHRoZSBVSSBiZWNhdXNlIHdlIGFyZSB1c2luZyBzZXRJbW1lZGlhdGUgdG8gYmF0Y2ggY2hhbmdlIG5vdGlmaWNhdGlvbnMsIGVmZmVjdGl2ZWx5XG4gICAqIGxldHRpbmcgb3VyIHZpZXdzIHJlLXJlbmRlciBvbmNlIGZvciBtdWx0aXBsZSBjb25zZWN1dGl2ZSB3cml0ZXMuXG4gICAqL1xuICBfc2V0KGtleTogc3RyaW5nLCB2YWx1ZTogbWl4ZWQsIGZsdXNoOiBib29sZWFuID0gZmFsc2UpOiB2b2lkIHtcbiAgICBjb25zdCBvbGREYXRhID0gdGhpcy5fZGF0YTtcbiAgICAvLyBJbW11dGFiaWxpdHkgZm9yIHRoZSB3aW4hXG4gICAgY29uc3QgbmV3RGF0YSA9IHNldFByb3BlcnR5KHRoaXMuX2RhdGEsIGtleSwgdmFsdWUpO1xuICAgIGlmIChuZXdEYXRhICE9PSBvbGREYXRhKSB7XG4gICAgICB0aGlzLl9kYXRhID0gbmV3RGF0YTtcbiAgICAgIGNsZWFySW1tZWRpYXRlKHRoaXMuX3RpbWVyKTtcbiAgICAgIGlmIChmbHVzaCkge1xuICAgICAgICAvLyBJZiBgZmx1c2hgIGlzIHRydWUsIGVtaXQgdGhlIGNoYW5nZSBpbW1lZGlhdGVseS5cbiAgICAgICAgdGhpcy5fZW1pdHRlci5lbWl0KCdjaGFuZ2UnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIElmIG5vdCBmbHVzaGluZywgZGUtYm91bmNlIHRvIHByZXZlbnQgc3VjY2Vzc2l2ZSB1cGRhdGVzIGluIHRoZSBzYW1lIGV2ZW50IGxvb3AuXG4gICAgICAgIHRoaXMuX3RpbWVyID0gc2V0SW1tZWRpYXRlKCgpID0+IHtcbiAgICAgICAgICB0aGlzLl9lbWl0dGVyLmVtaXQoJ2NoYW5nZScpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBnZXRUcmFja2VkTm9kZSgpOiA/RmlsZVRyZWVOb2RlRGF0YSB7XG4gICAgcmV0dXJuIHRoaXMuX2RhdGEudHJhY2tlZE5vZGU7XG4gIH1cblxuICBnZXRSZXBvc2l0b3JpZXMoKTogSW1tdXRhYmxlLlNldDxhdG9tJFJlcG9zaXRvcnk+IHtcbiAgICByZXR1cm4gdGhpcy5fZGF0YS5yZXBvc2l0b3JpZXM7XG4gIH1cblxuICBnZXRXb3JraW5nU2V0KCk6IFdvcmtpbmdTZXQge1xuICAgIHJldHVybiB0aGlzLl9kYXRhLndvcmtpbmdTZXQ7XG4gIH1cblxuICBnZXRPcGVuRmlsZXNXb3JraW5nU2V0KCk6IFdvcmtpbmdTZXQge1xuICAgIHJldHVybiB0aGlzLl9kYXRhLm9wZW5GaWxlc1dvcmtpbmdTZXQ7XG4gIH1cblxuICBnZXRXb3JraW5nU2V0c1N0b3JlKCk6ID9Xb3JraW5nU2V0c1N0b3JlIHtcbiAgICByZXR1cm4gdGhpcy5fZGF0YS53b3JraW5nU2V0c1N0b3JlO1xuICB9XG5cbiAgZ2V0Um9vdEtleXMoKTogQXJyYXk8c3RyaW5nPiB7XG4gICAgcmV0dXJuIHRoaXMuX2RhdGEucm9vdEtleXM7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUga2V5IG9mIHRoZSAqZmlyc3QqIHJvb3Qgbm9kZSBjb250YWluaW5nIHRoZSBnaXZlbiBub2RlLlxuICAgKi9cbiAgZ2V0Um9vdEZvcktleShub2RlS2V5OiBzdHJpbmcpOiA/c3RyaW5nIHtcbiAgICByZXR1cm4gYXJyYXkuZmluZCh0aGlzLl9kYXRhLnJvb3RLZXlzLCByb290S2V5ID0+IG5vZGVLZXkuc3RhcnRzV2l0aChyb290S2V5KSk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0cnVlIGlmIHRoZSBzdG9yZSBoYXMgbm8gZGF0YSwgaS5lLiBubyByb290cywgbm8gY2hpbGRyZW4uXG4gICAqL1xuICBpc0VtcHR5KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmdldFJvb3RLZXlzKCkubGVuZ3RoID09PSAwO1xuICB9XG5cbiAgLyoqXG4gICAqIE5vdGU6IFdlIGFjdHVhbGx5IGRvbid0IG5lZWQgcm9vdEtleSAoaW1wbGVtZW50YXRpb24gZGV0YWlsKSBidXQgd2UgdGFrZSBpdCBmb3IgY29uc2lzdGVuY3kuXG4gICAqL1xuICBpc0xvYWRpbmcocm9vdEtleTogc3RyaW5nLCBub2RlS2V5OiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gISF0aGlzLl9nZXRMb2FkaW5nKG5vZGVLZXkpO1xuICB9XG5cbiAgaXNFeHBhbmRlZChyb290S2V5OiBzdHJpbmcsIG5vZGVLZXk6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9nZXRFeHBhbmRlZEtleXMocm9vdEtleSkuaGFzKG5vZGVLZXkpO1xuICB9XG5cbiAgaXNSb290S2V5KG5vZGVLZXk6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9kYXRhLnJvb3RLZXlzLmluZGV4T2Yobm9kZUtleSkgIT09IC0xO1xuICB9XG5cbiAgaXNTZWxlY3RlZChyb290S2V5OiBzdHJpbmcsIG5vZGVLZXk6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmdldFNlbGVjdGVkS2V5cyhyb290S2V5KS5oYXMobm9kZUtleSk7XG4gIH1cblxuICBfc2V0VmNzU3RhdHVzZXMocm9vdEtleTogc3RyaW5nLCB2Y3NTdGF0dXNlczoge1twYXRoOiBzdHJpbmddOiBudW1iZXJ9KSB7XG4gICAgY29uc3QgaW1tdXRhYmxlVmNzU3RhdHVzZXMgPSBuZXcgSW1tdXRhYmxlLk1hcCh2Y3NTdGF0dXNlcyk7XG4gICAgaWYgKCFJbW11dGFibGUuaXMoaW1tdXRhYmxlVmNzU3RhdHVzZXMsIHRoaXMuX2RhdGEudmNzU3RhdHVzZXNCeVJvb3Rbcm9vdEtleV0pKSB7XG4gICAgICB0aGlzLl9zZXQoXG4gICAgICAgICd2Y3NTdGF0dXNlc0J5Um9vdCcsXG4gICAgICAgIHNldFByb3BlcnR5KHRoaXMuX2RhdGEudmNzU3RhdHVzZXNCeVJvb3QsIHJvb3RLZXksIGltbXV0YWJsZVZjc1N0YXR1c2VzKVxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICBnZXRWY3NTdGF0dXNDb2RlKHJvb3RLZXk6IHN0cmluZywgbm9kZUtleTogc3RyaW5nKTogP251bWJlciB7XG4gICAgY29uc3QgbWFwID0gdGhpcy5fZGF0YS52Y3NTdGF0dXNlc0J5Um9vdFtyb290S2V5XTtcbiAgICBpZiAobWFwKSB7XG4gICAgICByZXR1cm4gbWFwLmdldChub2RlS2V5KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG5cbiAgX3NldFVzZVByZXZpZXdUYWJzKHVzZVByZXZpZXdUYWJzOiBib29sZWFuKSB7XG4gICAgdGhpcy5fc2V0KCd1c2VQcmV2aWV3VGFicycsIHVzZVByZXZpZXdUYWJzKTtcbiAgfVxuXG4gIF9zZXRVc2VQcmVmaXhOYXYodXNlUHJlZml4TmF2OiBib29sZWFuKSB7XG4gICAgdGhpcy5fc2V0KCd1c2VQcmVmaXhOYXYnLCB1c2VQcmVmaXhOYXYpO1xuICB9XG5cbiAgdXNlUHJldmlld1RhYnMoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2RhdGEudXNlUHJldmlld1RhYnM7XG4gIH1cblxuICB1c2VQcmVmaXhOYXYoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2RhdGEudXNlUHJlZml4TmF2O1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMga25vd24gY2hpbGQga2V5cyBmb3IgdGhlIGdpdmVuIGBub2RlS2V5YCBidXQgZG9lcyBub3QgcXVldWUgYSBmZXRjaCBmb3IgbWlzc2luZ1xuICAgKiBjaGlsZHJlbiBsaWtlIGA6OmdldENoaWxkS2V5c2AuXG4gICAqL1xuICBnZXRDYWNoZWRDaGlsZEtleXMocm9vdEtleTogc3RyaW5nLCBub2RlS2V5OiBzdHJpbmcpOiBBcnJheTxzdHJpbmc+IHtcbiAgICByZXR1cm4gdGhpcy5fb21pdEhpZGRlblBhdGhzKHRoaXMuX2RhdGEuY2hpbGRLZXlNYXBbbm9kZUtleV0gfHwgW10pO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBub2RlIGNoaWxkIGtleXMgbWF5IGVpdGhlciBiZSBhdmFpbGFibGUgaW1tZWRpYXRlbHkgKGNhY2hlZCksIG9yXG4gICAqIHJlcXVpcmUgYW4gYXN5bmMgZmV0Y2guIElmIGFsbCBvZiB0aGUgY2hpbGRyZW4gYXJlIG5lZWRlZCBpdCdzIGVhc2llciB0b1xuICAgKiByZXR1cm4gYXMgcHJvbWlzZSwgdG8gbWFrZSB0aGUgY2FsbGVyIG9ibGl2aW91cyB0byB0aGUgd2F5IGNoaWxkcmVuIHdlcmVcbiAgICogZmV0Y2hlZC5cbiAgICovXG4gIHByb21pc2VOb2RlQ2hpbGRLZXlzKHJvb3RLZXk6IHN0cmluZywgbm9kZUtleTogc3RyaW5nKTogUHJvbWlzZSB7XG4gICAgY29uc3QgY2FjaGVkQ2hpbGRLZXlzID0gdGhpcy5nZXRDaGlsZEtleXMocm9vdEtleSwgbm9kZUtleSk7XG4gICAgaWYgKGNhY2hlZENoaWxkS2V5cy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoY2FjaGVkQ2hpbGRLZXlzKTtcbiAgICB9XG5cbiAgICBjb25zdCBwcm9taXNlID0gdGhpcy5fZ2V0TG9hZGluZyhub2RlS2V5KSB8fCBQcm9taXNlLnJlc29sdmUoKTtcbiAgICByZXR1cm4gcHJvbWlzZS50aGVuKCgpID0+IHRoaXMuZ2V0Q2FjaGVkQ2hpbGRLZXlzKHJvb3RLZXksIG5vZGVLZXkpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGtub3duIGNoaWxkIGtleXMgZm9yIHRoZSBnaXZlbiBgbm9kZUtleWAgYW5kIHF1ZXVlcyBhIGZldGNoIGlmIGNoaWxkcmVuIGFyZSBtaXNzaW5nLlxuICAgKi9cbiAgZ2V0Q2hpbGRLZXlzKHJvb3RLZXk6IHN0cmluZywgbm9kZUtleTogc3RyaW5nKTogQXJyYXk8c3RyaW5nPiB7XG4gICAgY29uc3QgY2hpbGRLZXlzID0gdGhpcy5fZGF0YS5jaGlsZEtleU1hcFtub2RlS2V5XTtcbiAgICBpZiAoY2hpbGRLZXlzID09IG51bGwgfHwgdGhpcy5fZGF0YS5pc0RpcnR5TWFwW25vZGVLZXldKSB7XG4gICAgICB0aGlzLl9mZXRjaENoaWxkS2V5cyhub2RlS2V5KTtcbiAgICB9IGVsc2Uge1xuICAgICAgLypcbiAgICAgICAqIElmIG5vIGRhdGEgbmVlZHMgdG8gYmUgZmV0Y2hlZCwgd2lwZSBvdXQgdGhlIHNjcm9sbGluZyBzdGF0ZSBiZWNhdXNlIHN1YnNlcXVlbnQgdXBkYXRlc1xuICAgICAgICogc2hvdWxkIG5vIGxvbmdlciBzY3JvbGwgdGhlIHRyZWUuIFRoZSBub2RlIHdpbGwgaGF2ZSBhbHJlYWR5IGJlZW4gZmx1c2hlZCB0byB0aGUgdmlldyBhbmRcbiAgICAgICAqIHNjcm9sbGVkIHRvLlxuICAgICAgICovXG4gICAgICB0aGlzLl9jaGVja1RyYWNrZWROb2RlKCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9vbWl0SGlkZGVuUGF0aHMoY2hpbGRLZXlzIHx8IFtdKTtcbiAgfVxuXG4gIGdldFNlbGVjdGVkS2V5cyhyb290S2V5Pzogc3RyaW5nKTogSW1tdXRhYmxlLk9yZGVyZWRTZXQ8c3RyaW5nPiB7XG4gICAgbGV0IHNlbGVjdGVkS2V5cztcbiAgICBpZiAocm9vdEtleSA9PSBudWxsKSB7XG4gICAgICBzZWxlY3RlZEtleXMgPSBuZXcgSW1tdXRhYmxlLk9yZGVyZWRTZXQoKTtcbiAgICAgIGZvciAoY29uc3Qgcm9vdCBpbiB0aGlzLl9kYXRhLnNlbGVjdGVkS2V5c0J5Um9vdCkge1xuICAgICAgICBpZiAodGhpcy5fZGF0YS5zZWxlY3RlZEtleXNCeVJvb3QuaGFzT3duUHJvcGVydHkocm9vdCkpIHtcbiAgICAgICAgICBzZWxlY3RlZEtleXMgPSBzZWxlY3RlZEtleXMubWVyZ2UodGhpcy5fZGF0YS5zZWxlY3RlZEtleXNCeVJvb3Rbcm9vdF0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIElmIHRoZSBnaXZlbiBgcm9vdEtleWAgaGFzIG5vIHNlbGVjdGVkIGtleXMsIGFzc2lnbiBhbiBlbXB0eSBzZXQgdG8gbWFpbnRhaW4gYSBub24tbnVsbFxuICAgICAgLy8gcmV0dXJuIHZhbHVlLlxuICAgICAgc2VsZWN0ZWRLZXlzID0gdGhpcy5fZGF0YS5zZWxlY3RlZEtleXNCeVJvb3Rbcm9vdEtleV0gfHwgbmV3IEltbXV0YWJsZS5PcmRlcmVkU2V0KCk7XG4gICAgfVxuICAgIHJldHVybiBzZWxlY3RlZEtleXM7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIGxpc3Qgb2YgdGhlIG5vZGVzIHRoYXQgYXJlIGN1cnJlbnRseSB2aXNpYmxlL2V4cGFuZGVkIGluIHRoZSBmaWxlIHRyZWUuXG4gICAqXG4gICAqIFRoaXMgbWV0aG9kIHJldHVybnMgYW4gYXJyYXkgc3luY2hyb25vdXNseSAocmF0aGVyIHRoYW4gYW4gaXRlcmF0b3IpIHRvIGVuc3VyZSB0aGUgY2FsbGVyXG4gICAqIGdldHMgYSBjb25zaXN0ZW50IHNuYXBzaG90IG9mIHRoZSBjdXJyZW50IHN0YXRlIG9mIHRoZSBmaWxlIHRyZWUuXG4gICAqL1xuICBnZXRWaXNpYmxlTm9kZXMocm9vdEtleTogc3RyaW5nKTogQXJyYXk8RmlsZVRyZWVOb2RlPiB7XG4gICAgLy8gRG8gc29tZSBiYXNpYyBjaGVja3MgdG8gZW5zdXJlIHRoYXQgcm9vdEtleSBjb3JyZXNwb25kcyB0byBhIHJvb3QgYW5kIGlzIGV4cGFuZGVkLiBJZiBub3QsXG4gICAgLy8gcmV0dXJuIHRoZSBhcHByb3ByaWF0ZSBhcnJheS5cbiAgICBpZiAoIXRoaXMuaXNSb290S2V5KHJvb3RLZXkpKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIGlmICghdGhpcy5pc0V4cGFuZGVkKHJvb3RLZXksIHJvb3RLZXkpKSB7XG4gICAgICByZXR1cm4gW3RoaXMuZ2V0Tm9kZShyb290S2V5LCByb290S2V5KV07XG4gICAgfVxuXG4gICAgLy8gTm90ZSB0aGF0IHdlIGNvdWxkIGNhY2hlIHRoZSB2aXNpYmxlTm9kZXMgYXJyYXkgc28gdGhhdCB3ZSBkbyBub3QgaGF2ZSB0byBjcmVhdGUgaXQgZnJvbVxuICAgIC8vIHNjcmF0Y2ggZWFjaCB0aW1lIHRoaXMgaXMgY2FsbGVkLCBidXQgaXQgZG9lcyBub3QgYXBwZWFyIHRvIGJlIGEgYm90dGxlbmVjayBhdCBwcmVzZW50LlxuICAgIGNvbnN0IHZpc2libGVOb2RlcyA9IFtdO1xuICAgIGNvbnN0IHJvb3RLZXlzRm9yRGlyZWN0b3JpZXNUb0V4cGxvcmUgPSBbcm9vdEtleV07XG4gICAgd2hpbGUgKHJvb3RLZXlzRm9yRGlyZWN0b3JpZXNUb0V4cGxvcmUubGVuZ3RoICE9PSAwKSB7XG4gICAgICBjb25zdCBrZXkgPSByb290S2V5c0ZvckRpcmVjdG9yaWVzVG9FeHBsb3JlLnBvcCgpO1xuICAgICAgdmlzaWJsZU5vZGVzLnB1c2godGhpcy5nZXROb2RlKGtleSwga2V5KSk7XG4gICAgICBjb25zdCBjaGlsZEtleXMgPSB0aGlzLl9kYXRhLmNoaWxkS2V5TWFwW2tleV07XG4gICAgICBpZiAoY2hpbGRLZXlzID09IG51bGwgfHwgdGhpcy5fZGF0YS5pc0RpcnR5TWFwW2tleV0pIHtcbiAgICAgICAgLy8gVGhpcyBpcyB3aGVyZSBnZXRDaGlsZEtleXMoKSB3b3VsZCBmZXRjaCwgYnV0IHdlIGRvIG5vdCB3YW50IHRvIGRvIHRoYXQuXG4gICAgICAgIC8vIFRPRE86IElmIGtleSBpcyBpbiBpc0RpcnR5TWFwLCB0aGVuIHJldHJ5IHdoZW4gaXQgaXMgbm90IGRpcnR5P1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgZm9yIChjb25zdCBjaGlsZEtleSBvZiBjaGlsZEtleXMpIHtcbiAgICAgICAgaWYgKEZpbGVUcmVlSGVscGVycy5pc0RpcktleShjaGlsZEtleSkpIHtcbiAgICAgICAgICBpZiAodGhpcy5pc0V4cGFuZGVkKHJvb3RLZXksIGtleSkpIHtcbiAgICAgICAgICAgIHJvb3RLZXlzRm9yRGlyZWN0b3JpZXNUb0V4cGxvcmUucHVzaChjaGlsZEtleSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZpc2libGVOb2Rlcy5wdXNoKHRoaXMuZ2V0Tm9kZShrZXksIGNoaWxkS2V5KSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHZpc2libGVOb2RlcztcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFsbCBzZWxlY3RlZCBub2RlcyBhY3Jvc3MgYWxsIHJvb3RzIGluIHRoZSB0cmVlLlxuICAgKi9cbiAgZ2V0U2VsZWN0ZWROb2RlcygpOiBJbW11dGFibGUuT3JkZXJlZFNldDxGaWxlVHJlZU5vZGU+IHtcbiAgICBsZXQgc2VsZWN0ZWROb2RlcyA9IG5ldyBJbW11dGFibGUuT3JkZXJlZFNldCgpO1xuICAgIHRoaXMuX2RhdGEucm9vdEtleXMuZm9yRWFjaChyb290S2V5ID0+IHtcbiAgICAgIHRoaXMuZ2V0U2VsZWN0ZWRLZXlzKHJvb3RLZXkpLmZvckVhY2gobm9kZUtleSA9PiB7XG4gICAgICAgIHNlbGVjdGVkTm9kZXMgPSBzZWxlY3RlZE5vZGVzLmFkZCh0aGlzLmdldE5vZGUocm9vdEtleSwgbm9kZUtleSkpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHNlbGVjdGVkTm9kZXM7XG4gIH1cblxuICBnZXRTaW5nbGVTZWxlY3RlZE5vZGUoKTogP0ZpbGVUcmVlTm9kZSB7XG4gICAgY29uc3Qgc2VsZWN0ZWRSb290cyA9IE9iamVjdC5rZXlzKHRoaXMuX2RhdGEuc2VsZWN0ZWRLZXlzQnlSb290KTtcbiAgICBpZiAoc2VsZWN0ZWRSb290cy5sZW5ndGggIT09IDEpIHtcbiAgICAgIC8vIFRoZXJlIGlzIG1vcmUgdGhhbiBvbmUgcm9vdCB3aXRoIHNlbGVjdGVkIG5vZGVzLiBObyBidWVuby5cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCByb290S2V5ID0gc2VsZWN0ZWRSb290c1swXTtcbiAgICBjb25zdCBzZWxlY3RlZEtleXMgPSB0aGlzLmdldFNlbGVjdGVkS2V5cyhyb290S2V5KTtcbiAgICAvKlxuICAgICAqIE5vdGU6IFRoaXMgZG9lcyBub3QgY2FsbCBgZ2V0U2VsZWN0ZWROb2Rlc2AgdG8gcHJldmVudCBjcmVhdGluZyBub2RlcyB0aGF0IHdvdWxkIGJlIHRocm93blxuICAgICAqIGF3YXkgaWYgdGhlcmUgaXMgbW9yZSB0aGFuIDEgc2VsZWN0ZWQgbm9kZS5cbiAgICAgKi9cbiAgICByZXR1cm4gKHNlbGVjdGVkS2V5cy5zaXplID09PSAxKSA/IHRoaXMuZ2V0Tm9kZShyb290S2V5LCBzZWxlY3RlZEtleXMuZmlyc3QoKSkgOiBudWxsO1xuICB9XG5cbiAgZ2V0Um9vdE5vZGUocm9vdEtleTogc3RyaW5nKTogRmlsZVRyZWVOb2RlIHtcbiAgICByZXR1cm4gdGhpcy5nZXROb2RlKHJvb3RLZXksIHJvb3RLZXkpO1xuICB9XG5cbiAgZ2V0Tm9kZShyb290S2V5OiBzdHJpbmcsIG5vZGVLZXk6IHN0cmluZyk6IEZpbGVUcmVlTm9kZSB7XG4gICAgcmV0dXJuIG5ldyBGaWxlVHJlZU5vZGUodGhpcywgcm9vdEtleSwgbm9kZUtleSk7XG4gIH1cblxuICBpc0VkaXRpbmdXb3JraW5nU2V0KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9kYXRhLmlzRWRpdGluZ1dvcmtpbmdTZXQ7XG4gIH1cblxuICBnZXRFZGl0ZWRXb3JraW5nU2V0KCk6IFdvcmtpbmdTZXQge1xuICAgIHJldHVybiB0aGlzLl9kYXRhLmVkaXRlZFdvcmtpbmdTZXQ7XG4gIH1cblxuICBfc2V0RWRpdGVkV29ya2luZ1NldChlZGl0ZWRXb3JraW5nU2V0OiBXb3JraW5nU2V0KTogdm9pZCB7XG4gICAgdGhpcy5fc2V0KCdlZGl0ZWRXb3JraW5nU2V0JywgZWRpdGVkV29ya2luZ1NldCk7XG4gIH1cblxuICAvKipcbiAgICogSWYgYSBmZXRjaCBpcyBub3QgYWxyZWFkeSBpbiBwcm9ncmVzcyBpbml0aWF0ZSBhIGZldGNoIG5vdy5cbiAgICovXG4gIF9mZXRjaENoaWxkS2V5cyhub2RlS2V5OiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBleGlzdGluZ1Byb21pc2UgPSB0aGlzLl9nZXRMb2FkaW5nKG5vZGVLZXkpO1xuICAgIGlmIChleGlzdGluZ1Byb21pc2UpIHtcbiAgICAgIHJldHVybiBleGlzdGluZ1Byb21pc2U7XG4gICAgfVxuXG4gICAgY29uc3QgcHJvbWlzZSA9IEZpbGVUcmVlSGVscGVycy5mZXRjaENoaWxkcmVuKG5vZGVLZXkpXG4gICAgICAuY2F0Y2goZXJyb3IgPT4ge1xuICAgICAgICB0aGlzLl9sb2dnZXIuZXJyb3IoYFVuYWJsZSB0byBmZXRjaCBjaGlsZHJlbiBmb3IgXCIke25vZGVLZXl9XCIuYCk7XG4gICAgICAgIHRoaXMuX2xvZ2dlci5lcnJvcignT3JpZ2luYWwgZXJyb3I6ICcsIGVycm9yKTtcbiAgICAgICAgLy8gQ29sbGFwc2UgdGhlIG5vZGUgYW5kIGNsZWFyIGl0cyBsb2FkaW5nIHN0YXRlIG9uIGVycm9yIHNvIHRoZVxuICAgICAgICAvLyB1c2VyIGNhbiByZXRyeSBleHBhbmRpbmcgaXQuXG4gICAgICAgIGNvbnN0IHJvb3RLZXkgPSB0aGlzLmdldFJvb3RGb3JLZXkobm9kZUtleSk7XG4gICAgICAgIGlmIChyb290S2V5ICE9IG51bGwpIHtcbiAgICAgICAgICB0aGlzLl9jb2xsYXBzZU5vZGUocm9vdEtleSwgbm9kZUtleSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fY2xlYXJMb2FkaW5nKG5vZGVLZXkpO1xuICAgICAgfSlcbiAgICAgIC50aGVuKGNoaWxkS2V5cyA9PiB7XG4gICAgICAgIC8vIElmIHRoaXMgbm9kZSdzIHJvb3Qgd2VudCBhd2F5IHdoaWxlIHRoZSBQcm9taXNlIHdhcyByZXNvbHZpbmcsIGRvXG4gICAgICAgIC8vIG5vIG1vcmUgd29yay4gVGhpcyBpcyBubyBsb25nZXIgbmVlZGVkIGluIHRoZSBzdG9yZS5cbiAgICAgICAgaWYgKHRoaXMuZ2V0Um9vdEZvcktleShub2RlS2V5KSA9PSBudWxsKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3NldENoaWxkS2V5cyhub2RlS2V5LCBjaGlsZEtleXMpO1xuICAgICAgICB0aGlzLl9hZGRTdWJzY3JpcHRpb24obm9kZUtleSk7XG4gICAgICAgIHRoaXMuX2NsZWFyTG9hZGluZyhub2RlS2V5KTtcbiAgICAgIH0pO1xuXG4gICAgdGhpcy5fc2V0TG9hZGluZyhub2RlS2V5LCBwcm9taXNlKTtcbiAgICByZXR1cm4gcHJvbWlzZTtcbiAgfVxuXG4gIF9nZXRMb2FkaW5nKG5vZGVLZXk6IHN0cmluZyk6ID9Qcm9taXNlIHtcbiAgICByZXR1cm4gdGhpcy5fZGF0YS5pc0xvYWRpbmdNYXBbbm9kZUtleV07XG4gIH1cblxuICBfc2V0TG9hZGluZyhub2RlS2V5OiBzdHJpbmcsIHZhbHVlOiBQcm9taXNlKTogdm9pZCB7XG4gICAgdGhpcy5fc2V0KCdpc0xvYWRpbmdNYXAnLCBzZXRQcm9wZXJ0eSh0aGlzLl9kYXRhLmlzTG9hZGluZ01hcCwgbm9kZUtleSwgdmFsdWUpKTtcbiAgfVxuXG4gIGlzQ3dkKG5vZGVLZXk6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBub2RlS2V5ID09PSB0aGlzLl9kYXRhLmN3ZEtleTtcbiAgfVxuXG4gIGhhc0N3ZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fZGF0YS5jd2RLZXkgIT0gbnVsbDtcbiAgfVxuXG4gIF9zZXRDd2RLZXkocm9vdEtleTogP3N0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuX3NldCgnY3dkS2V5Jywgcm9vdEtleSk7XG4gIH1cblxuICAvKipcbiAgICogUmVzZXRzIHRoZSBub2RlIHRvIGJlIGtlcHQgaW4gdmlldyBpZiBubyBtb3JlIGRhdGEgaXMgYmVpbmcgYXdhaXRlZC4gU2FmZSB0byBjYWxsIG1hbnkgdGltZXNcbiAgICogYmVjYXVzZSBpdCBvbmx5IGNoYW5nZXMgc3RhdGUgaWYgYSBub2RlIGlzIGJlaW5nIHRyYWNrZWQuXG4gICAqL1xuICBfY2hlY2tUcmFja2VkTm9kZSgpOiB2b2lkIHtcbiAgICBpZiAoXG4gICAgICB0aGlzLl9kYXRhLnRyYWNrZWROb2RlICE9IG51bGwgJiZcbiAgICAgIC8qXG4gICAgICAgKiBUaGUgbG9hZGluZyBtYXAgYmVpbmcgZW1wdHkgaXMgYSBoZXVyaXN0aWMgZm9yIHdoZW4gbG9hZGluZyBoYXMgY29tcGxldGVkLiBJdCBpcyBpbmV4YWN0XG4gICAgICAgKiBiZWNhdXNlIHRoZSBsb2FkaW5nIG1pZ2h0IGJlIHVucmVsYXRlZCB0byB0aGUgdHJhY2tlZCBub2RlLCBob3dldmVyIGl0IGlzIGNoZWFwIGFuZCBmYWxzZVxuICAgICAgICogcG9zaXRpdmVzIHdpbGwgb25seSBsYXN0IHVudGlsIGxvYWRpbmcgaXMgY29tcGxldGUgb3IgdW50aWwgdGhlIHVzZXIgY2xpY2tzIGFub3RoZXIgbm9kZSBpblxuICAgICAgICogdGhlIHRyZWUuXG4gICAgICAgKi9cbiAgICAgIG9iamVjdFV0aWwuaXNFbXB0eSh0aGlzLl9kYXRhLmlzTG9hZGluZ01hcClcbiAgICApIHtcbiAgICAgIC8vIExvYWRpbmcgaGFzIGNvbXBsZXRlZC4gQWxsb3cgc2Nyb2xsaW5nIHRvIHByb2NlZWQgYXMgdXN1YWwuXG4gICAgICB0aGlzLl9zZXQoJ3RyYWNrZWROb2RlJywgbnVsbCk7XG4gICAgfVxuICB9XG5cbiAgX2NsZWFyTG9hZGluZyhub2RlS2V5OiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLl9zZXQoJ2lzTG9hZGluZ01hcCcsIGRlbGV0ZVByb3BlcnR5KHRoaXMuX2RhdGEuaXNMb2FkaW5nTWFwLCBub2RlS2V5KSk7XG4gICAgdGhpcy5fY2hlY2tUcmFja2VkTm9kZSgpO1xuICB9XG5cbiAgYXN5bmMgX2RlbGV0ZVNlbGVjdGVkTm9kZXMoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3Qgc2VsZWN0ZWROb2RlcyA9IHRoaXMuZ2V0U2VsZWN0ZWROb2RlcygpO1xuICAgIGF3YWl0IFByb21pc2UuYWxsKHNlbGVjdGVkTm9kZXMubWFwKGFzeW5jIG5vZGUgPT4ge1xuICAgICAgY29uc3QgZW50cnkgPSBGaWxlVHJlZUhlbHBlcnMuZ2V0RW50cnlCeUtleShub2RlLm5vZGVLZXkpO1xuXG4gICAgICBpZiAoZW50cnkgPT0gbnVsbCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjb25zdCBwYXRoID0gZW50cnkuZ2V0UGF0aCgpO1xuICAgICAgY29uc3QgcmVwb3NpdG9yeSA9IHJlcG9zaXRvcnlGb3JQYXRoKHBhdGgpO1xuICAgICAgaWYgKHJlcG9zaXRvcnkgIT0gbnVsbCAmJiByZXBvc2l0b3J5LmdldFR5cGUoKSA9PT0gJ2hnJykge1xuICAgICAgICBjb25zdCBoZ1JlcG9zaXRvcnkgPSAoKHJlcG9zaXRvcnk6IGFueSk6IEhnUmVwb3NpdG9yeUNsaWVudCk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgYXdhaXQgaGdSZXBvc2l0b3J5LnJlbW92ZShwYXRoKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIGNvbnN0IHN0YXR1c2VzID0gYXdhaXQgaGdSZXBvc2l0b3J5LmdldFN0YXR1c2VzKFtwYXRoXSk7XG4gICAgICAgICAgY29uc3QgcGF0aFN0YXR1cyA9IHN0YXR1c2VzLmdldChwYXRoKTtcbiAgICAgICAgICBjb25zdCBnb29kU3RhdHVzZXMgPSBbXG4gICAgICAgICAgICBTdGF0dXNDb2RlTnVtYmVyLkFEREVELFxuICAgICAgICAgICAgU3RhdHVzQ29kZU51bWJlci5DTEVBTixcbiAgICAgICAgICAgIFN0YXR1c0NvZGVOdW1iZXIuTU9ESUZJRUQsXG4gICAgICAgICAgXTtcbiAgICAgICAgICBpZiAoZ29vZFN0YXR1c2VzLmluZGV4T2YocGF0aFN0YXR1cykgIT09IC0xKSB7XG4gICAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoXG4gICAgICAgICAgICAgICdGYWlsZWQgdG8gcmVtb3ZlICcgKyBwYXRoICsgJyBmcm9tIHZlcnNpb24gY29udHJvbC4gIFRoZSBmaWxlIHdpbGwgJyArXG4gICAgICAgICAgICAgICdzdGlsbCBnZXQgZGVsZXRlZCBidXQgeW91IHdpbGwgaGF2ZSB0byByZW1vdmUgaXQgZnJvbSB5b3VyIFZDUyB5b3Vyc2VsZi4gIEVycm9yOiAnICtcbiAgICAgICAgICAgICAgZS50b1N0cmluZygpLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChGaWxlVHJlZUhlbHBlcnMuaXNMb2NhbEVudHJ5KGVudHJ5KSkge1xuICAgICAgICAvLyBUT0RPOiBUaGlzIHNwZWNpYWwtY2FzZSBjYW4gYmUgZWxpbWluYXRlZCBvbmNlIGBkZWxldGUoKWAgaXMgYWRkZWQgdG8gYERpcmVjdG9yeWBcbiAgICAgICAgLy8gYW5kIGBGaWxlYC5cbiAgICAgICAgc2hlbGwubW92ZUl0ZW1Ub1RyYXNoKG5vZGUubm9kZVBhdGgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgcmVtb3RlRmlsZSA9ICgoZW50cnk6IGFueSk6IChSZW1vdGVGaWxlIHwgUmVtb3RlRGlyZWN0b3J5KSk7XG4gICAgICAgIGF3YWl0IHJlbW90ZUZpbGUuZGVsZXRlKCk7XG4gICAgICB9XG4gICAgfSkpO1xuICB9XG5cbiAgX2V4cGFuZE5vZGUocm9vdEtleTogc3RyaW5nLCBub2RlS2V5OiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLl9zZXRFeHBhbmRlZEtleXMocm9vdEtleSwgdGhpcy5fZ2V0RXhwYW5kZWRLZXlzKHJvb3RLZXkpLmFkZChub2RlS2V5KSk7XG4gICAgLy8gSWYgd2UgaGF2ZSBjaGlsZCBub2RlcyB0aGF0IHNob3VsZCBhbHNvIGJlIGV4cGFuZGVkLCBleHBhbmQgdGhlbSBub3cuXG4gICAgbGV0IHByZXZpb3VzbHlFeHBhbmRlZCA9IHRoaXMuX2dldFByZXZpb3VzbHlFeHBhbmRlZChyb290S2V5KTtcbiAgICBpZiAocHJldmlvdXNseUV4cGFuZGVkLmhhcyhub2RlS2V5KSkge1xuICAgICAgZm9yIChjb25zdCBjaGlsZEtleSBvZiBwcmV2aW91c2x5RXhwYW5kZWQuZ2V0KG5vZGVLZXkpKSB7XG4gICAgICAgIHRoaXMuX2V4cGFuZE5vZGUocm9vdEtleSwgY2hpbGRLZXkpO1xuICAgICAgfVxuICAgICAgLy8gQ2xlYXIgdGhlIHByZXZpb3VzbHlFeHBhbmRlZCBsaXN0IHNpbmNlIHdlJ3JlIGRvbmUgd2l0aCBpdC5cbiAgICAgIHByZXZpb3VzbHlFeHBhbmRlZCA9IHByZXZpb3VzbHlFeHBhbmRlZC5kZWxldGUobm9kZUtleSk7XG4gICAgICB0aGlzLl9zZXRQcmV2aW91c2x5RXhwYW5kZWQocm9vdEtleSwgcHJldmlvdXNseUV4cGFuZGVkKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUGVyZm9ybWVzIGEgZGVlcCBCRlMgc2Nhbm5pbmcgZXhwYW5kIG9mIGNvbnRhaW5lZCBub2Rlcy5cbiAgICogcmV0dXJucyAtIGEgcHJvbWlzZSBmdWxmaWxsZWQgd2hlbiB0aGUgZXhwYW5kIG9wZXJhdGlvbiBpcyBmaW5pc2hlZFxuICAgKi9cbiAgX2V4cGFuZE5vZGVEZWVwKHJvb3RLZXk6IHN0cmluZywgbm9kZUtleTogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgLy8gU3RvcCB0aGUgdHJhdmVyc2FsIGFmdGVyIDEwMCBub2RlcyB3ZXJlIGFkZGVkIHRvIHRoZSB0cmVlXG4gICAgY29uc3QgaXROb2RlcyA9IG5ldyBGaWxlVHJlZVN0b3JlQmZzSXRlcmF0b3IodGhpcywgcm9vdEtleSwgbm9kZUtleSwgLyogbGltaXQqLyAxMDApO1xuICAgIGNvbnN0IHByb21pc2UgPSBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgIGNvbnN0IGV4cGFuZCA9ICgpID0+IHtcbiAgICAgICAgY29uc3QgdHJhdmVyc2VkTm9kZUtleSA9IGl0Tm9kZXMudHJhdmVyc2VkTm9kZSgpO1xuICAgICAgICBpZiAodHJhdmVyc2VkTm9kZUtleSkge1xuICAgICAgICAgIHRoaXMuX3NldEV4cGFuZGVkS2V5cyhyb290S2V5LCB0aGlzLl9nZXRFeHBhbmRlZEtleXMocm9vdEtleSkuYWRkKHRyYXZlcnNlZE5vZGVLZXkpKTtcbiAgICAgICAgICAvKipcbiAgICAgICAgICAgKiBFdmVuIGlmIHRoZXJlIHdlcmUgcHJldmlvdXNseSBleHBhbmRlZCBub2RlcyBpdCBkb2Vzbid0IG1hdHRlciBhc1xuICAgICAgICAgICAqIHdlJ2xsIGV4cGFuZCBhbGwgb2YgdGhlIGNoaWxkcmVuLlxuICAgICAgICAgICAqL1xuICAgICAgICAgIGxldCBwcmV2aW91c2x5RXhwYW5kZWQgPSB0aGlzLl9nZXRQcmV2aW91c2x5RXhwYW5kZWQocm9vdEtleSk7XG4gICAgICAgICAgcHJldmlvdXNseUV4cGFuZGVkID0gcHJldmlvdXNseUV4cGFuZGVkLmRlbGV0ZSh0cmF2ZXJzZWROb2RlS2V5KTtcbiAgICAgICAgICB0aGlzLl9zZXRQcmV2aW91c2x5RXhwYW5kZWQocm9vdEtleSwgcHJldmlvdXNseUV4cGFuZGVkKTtcblxuICAgICAgICAgIGNvbnN0IG5leHRQcm9taXNlID0gaXROb2Rlcy5uZXh0KCk7XG4gICAgICAgICAgaWYgKG5leHRQcm9taXNlKSB7XG4gICAgICAgICAgICBuZXh0UHJvbWlzZS50aGVuKGV4cGFuZCk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgZXhwYW5kKCk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gcHJvbWlzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBXaGVuIHdlIGNvbGxhcHNlIGEgbm9kZSB3ZSBuZWVkIHRvIGRvIHNvbWUgY2xlYW51cCByZW1vdmluZyBzdWJzY3JpcHRpb25zIGFuZCBzZWxlY3Rpb24uXG4gICAqL1xuICBfY29sbGFwc2VOb2RlKHJvb3RLZXk6IHN0cmluZywgbm9kZUtleTogc3RyaW5nKTogdm9pZCB7XG4gICAgY29uc3QgY2hpbGRLZXlzID0gdGhpcy5fZGF0YS5jaGlsZEtleU1hcFtub2RlS2V5XTtcbiAgICBsZXQgc2VsZWN0ZWRLZXlzID0gdGhpcy5fZGF0YS5zZWxlY3RlZEtleXNCeVJvb3Rbcm9vdEtleV07XG4gICAgY29uc3QgZXhwYW5kZWRDaGlsZEtleXMgPSBbXTtcbiAgICBpZiAoY2hpbGRLZXlzKSB7XG4gICAgICBjaGlsZEtleXMuZm9yRWFjaChjaGlsZEtleSA9PiB7XG4gICAgICAgIC8vIFVuc2VsZWN0IGVhY2ggY2hpbGQuXG4gICAgICAgIGlmIChzZWxlY3RlZEtleXMgJiYgc2VsZWN0ZWRLZXlzLmhhcyhjaGlsZEtleSkpIHtcbiAgICAgICAgICBzZWxlY3RlZEtleXMgPSBzZWxlY3RlZEtleXMuZGVsZXRlKGNoaWxkS2V5KTtcbiAgICAgICAgICAvKlxuICAgICAgICAgICAqIFNldCB0aGUgc2VsZWN0ZWQga2V5cyAqYmVmb3JlKiB0aGUgcmVjdXJzaXZlIGBfY29sbGFwc2VOb2RlYCBjYWxsIHNvIGVhY2ggY2FsbCBzdG9yZXNcbiAgICAgICAgICAgKiBpdHMgY2hhbmdlcyBhbmQgaXNuJ3Qgd2lwZWQgb3V0IGJ5IHRoZSBuZXh0IGNhbGwgYnkga2VlcGluZyBhbiBvdXRkYXRlZCBgc2VsZWN0ZWRLZXlzYFxuICAgICAgICAgICAqIGluIHRoZSBjYWxsIHN0YWNrLlxuICAgICAgICAgICAqL1xuICAgICAgICAgIHRoaXMuX3NldFNlbGVjdGVkS2V5cyhyb290S2V5LCBzZWxlY3RlZEtleXMpO1xuICAgICAgICB9XG4gICAgICAgIC8vIENvbGxhcHNlIGVhY2ggY2hpbGQgZGlyZWN0b3J5LlxuICAgICAgICBpZiAoRmlsZVRyZWVIZWxwZXJzLmlzRGlyS2V5KGNoaWxkS2V5KSkge1xuICAgICAgICAgIGlmICh0aGlzLmlzRXhwYW5kZWQocm9vdEtleSwgY2hpbGRLZXkpKSB7XG4gICAgICAgICAgICBleHBhbmRlZENoaWxkS2V5cy5wdXNoKGNoaWxkS2V5KTtcbiAgICAgICAgICAgIHRoaXMuX2NvbGxhcHNlTm9kZShyb290S2V5LCBjaGlsZEtleSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gICAgLypcbiAgICAgKiBTYXZlIHRoZSBsaXN0IG9mIGV4cGFuZGVkIGNoaWxkIG5vZGVzIHNvIG5leHQgdGltZSB3ZSBleHBhbmQgdGhpcyBub2RlIHdlIGNhbiBleHBhbmQgdGhlc2VcbiAgICAgKiBjaGlsZHJlbi5cbiAgICAgKi9cbiAgICBsZXQgcHJldmlvdXNseUV4cGFuZGVkID0gdGhpcy5fZ2V0UHJldmlvdXNseUV4cGFuZGVkKHJvb3RLZXkpO1xuICAgIGlmIChleHBhbmRlZENoaWxkS2V5cy5sZW5ndGggIT09IDApIHtcbiAgICAgIHByZXZpb3VzbHlFeHBhbmRlZCA9IHByZXZpb3VzbHlFeHBhbmRlZC5zZXQobm9kZUtleSwgZXhwYW5kZWRDaGlsZEtleXMpO1xuICAgIH0gZWxzZSB7XG4gICAgICBwcmV2aW91c2x5RXhwYW5kZWQgPSBwcmV2aW91c2x5RXhwYW5kZWQuZGVsZXRlKG5vZGVLZXkpO1xuICAgIH1cbiAgICB0aGlzLl9zZXRQcmV2aW91c2x5RXhwYW5kZWQocm9vdEtleSwgcHJldmlvdXNseUV4cGFuZGVkKTtcbiAgICB0aGlzLl9zZXRFeHBhbmRlZEtleXMocm9vdEtleSwgdGhpcy5fZ2V0RXhwYW5kZWRLZXlzKHJvb3RLZXkpLmRlbGV0ZShub2RlS2V5KSk7XG4gICAgdGhpcy5fcmVtb3ZlU3Vic2NyaXB0aW9uKHJvb3RLZXksIG5vZGVLZXkpO1xuICB9XG5cbiAgX2dldFByZXZpb3VzbHlFeHBhbmRlZChyb290S2V5OiBzdHJpbmcpOiBJbW11dGFibGUuTWFwPHN0cmluZywgQXJyYXk8c3RyaW5nPj4ge1xuICAgIHJldHVybiB0aGlzLl9kYXRhLnByZXZpb3VzbHlFeHBhbmRlZFtyb290S2V5XSB8fCBuZXcgSW1tdXRhYmxlLk1hcCgpO1xuICB9XG5cbiAgX3NldFByZXZpb3VzbHlFeHBhbmRlZChyb290S2V5OiBzdHJpbmcsXG4gICAgcHJldmlvdXNseUV4cGFuZGVkOiBJbW11dGFibGUuTWFwPHN0cmluZywgQXJyYXk8c3RyaW5nPj4pOiB2b2lkIHtcbiAgICB0aGlzLl9zZXQoXG4gICAgICAncHJldmlvdXNseUV4cGFuZGVkJyxcbiAgICAgIHNldFByb3BlcnR5KHRoaXMuX2RhdGEucHJldmlvdXNseUV4cGFuZGVkLCByb290S2V5LCBwcmV2aW91c2x5RXhwYW5kZWQpXG4gICAgKTtcbiAgfVxuXG4gIF9nZXRFeHBhbmRlZEtleXMocm9vdEtleTogc3RyaW5nKTogSW1tdXRhYmxlLlNldDxzdHJpbmc+IHtcbiAgICByZXR1cm4gdGhpcy5fZGF0YS5leHBhbmRlZEtleXNCeVJvb3Rbcm9vdEtleV0gfHwgbmV3IEltbXV0YWJsZS5TZXQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIGlzIGp1c3QgZXhwb3NlZCBzbyBpdCBjYW4gYmUgbW9ja2VkIGluIHRoZSB0ZXN0cy4gTm90IGlkZWFsLCBidXQgYSBsb3QgbGVzcyBtZXNzeSB0aGFuIHRoZVxuICAgKiBhbHRlcm5hdGl2ZXMuIEZvciBleGFtcGxlLCBwYXNzaW5nIG9wdGlvbnMgd2hlbiBjb25zdHJ1Y3RpbmcgYW4gaW5zdGFuY2Ugb2YgYSBzaW5nbGV0b24gd291bGRcbiAgICogbWFrZSBmdXR1cmUgaW52b2NhdGlvbnMgb2YgYGdldEluc3RhbmNlYCB1bnByZWRpY3RhYmxlLlxuICAgKi9cbiAgX3JlcG9zaXRvcnlGb3JQYXRoKHBhdGg6IE51Y2xpZGVVcmkpOiA/YXRvbSRSZXBvc2l0b3J5IHtcbiAgICByZXR1cm4gdGhpcy5nZXRSZXBvc2l0b3JpZXMoKS5maW5kKHJlcG8gPT4gcmVwb3NpdG9yeUNvbnRhaW5zUGF0aChyZXBvLCBwYXRoKSk7XG4gIH1cblxuICBfc2V0RXhwYW5kZWRLZXlzKHJvb3RLZXk6IHN0cmluZywgZXhwYW5kZWRLZXlzOiBJbW11dGFibGUuU2V0PHN0cmluZz4pOiB2b2lkIHtcbiAgICB0aGlzLl9zZXQoXG4gICAgICAnZXhwYW5kZWRLZXlzQnlSb290JyxcbiAgICAgIHNldFByb3BlcnR5KHRoaXMuX2RhdGEuZXhwYW5kZWRLZXlzQnlSb290LCByb290S2V5LCBleHBhbmRlZEtleXMpXG4gICAgKTtcbiAgfVxuXG4gIF9kZWxldGVTZWxlY3RlZEtleXMocm9vdEtleTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5fc2V0KCdzZWxlY3RlZEtleXNCeVJvb3QnLCBkZWxldGVQcm9wZXJ0eSh0aGlzLl9kYXRhLnNlbGVjdGVkS2V5c0J5Um9vdCwgcm9vdEtleSkpO1xuICB9XG5cbiAgX3NldFNlbGVjdGVkS2V5cyhyb290S2V5OiBzdHJpbmcsIHNlbGVjdGVkS2V5czogSW1tdXRhYmxlLk9yZGVyZWRTZXQ8c3RyaW5nPik6IHZvaWQge1xuICAgIC8qXG4gICAgICogTmV3IHNlbGVjdGlvbiBtZWFucyBwcmV2aW91cyBub2RlIHNob3VsZCBub3QgYmUga2VwdCBpbiB2aWV3LiBEbyB0aGlzIHdpdGhvdXQgZGUtYm91bmNpbmdcbiAgICAgKiBiZWNhdXNlIHRoZSBwcmV2aW91cyBzdGF0ZSBpcyBpcnJlbGV2YW50LiBJZiB0aGUgdXNlciBjaG9zZSBhIG5ldyBzZWxlY3Rpb24sIHRoZSBwcmV2aW91cyBvbmVcbiAgICAgKiBzaG91bGQgbm90IGJlIHNjcm9sbGVkIGludG8gdmlldy5cbiAgICAgKi9cbiAgICB0aGlzLl9zZXQoJ3RyYWNrZWROb2RlJywgbnVsbCk7XG4gICAgdGhpcy5fc2V0KFxuICAgICAgJ3NlbGVjdGVkS2V5c0J5Um9vdCcsXG4gICAgICBzZXRQcm9wZXJ0eSh0aGlzLl9kYXRhLnNlbGVjdGVkS2V5c0J5Um9vdCwgcm9vdEtleSwgc2VsZWN0ZWRLZXlzKVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgc2VsZWN0ZWQga2V5cyBpbiBhbGwgcm9vdHMgb2YgdGhlIHRyZWUuIFRoZSBzZWxlY3RlZCBrZXlzIG9mIHJvb3Qga2V5cyBub3QgaW5cbiAgICogYHNlbGVjdGVkS2V5c0J5Um9vdGAgYXJlIGRlbGV0ZWQgKHRoZSByb290IGlzIGxlZnQgd2l0aCBubyBzZWxlY3Rpb24pLlxuICAgKi9cbiAgX3NldFNlbGVjdGVkS2V5c0J5Um9vdChzZWxlY3RlZEtleXNCeVJvb3Q6IHtba2V5OiBzdHJpbmddOiBJbW11dGFibGUuT3JkZXJlZFNldDxzdHJpbmc+fSk6IHZvaWQge1xuICAgIHRoaXMuZ2V0Um9vdEtleXMoKS5mb3JFYWNoKHJvb3RLZXkgPT4ge1xuICAgICAgaWYgKHNlbGVjdGVkS2V5c0J5Um9vdC5oYXNPd25Qcm9wZXJ0eShyb290S2V5KSkge1xuICAgICAgICB0aGlzLl9zZXRTZWxlY3RlZEtleXMocm9vdEtleSwgc2VsZWN0ZWRLZXlzQnlSb290W3Jvb3RLZXldKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX2RlbGV0ZVNlbGVjdGVkS2V5cyhyb290S2V5KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIF9zZXRSb290S2V5cyhyb290S2V5czogQXJyYXk8c3RyaW5nPik6IHZvaWQge1xuICAgIGNvbnN0IG9sZFJvb3RLZXlzID0gdGhpcy5fZGF0YS5yb290S2V5cztcbiAgICBjb25zdCBuZXdSb290S2V5cyA9IG5ldyBJbW11dGFibGUuU2V0KHJvb3RLZXlzKTtcbiAgICBjb25zdCByZW1vdmVkUm9vdEtleXMgPSBuZXcgSW1tdXRhYmxlLlNldChvbGRSb290S2V5cykuc3VidHJhY3QobmV3Um9vdEtleXMpO1xuICAgIHJlbW92ZWRSb290S2V5cy5mb3JFYWNoKHRoaXMuX3B1cmdlUm9vdC5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLl9zZXQoJ3Jvb3RLZXlzJywgcm9vdEtleXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgYSBzaW5nbGUgY2hpbGQgbm9kZS4gSXQncyB1c2VmdWwgd2hlbiBleHBhbmRpbmcgdG8gYSBkZWVwbHkgbmVzdGVkIG5vZGUuXG4gICAqL1xuICBfY3JlYXRlQ2hpbGQobm9kZUtleTogc3RyaW5nLCBjaGlsZEtleTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5fc2V0Q2hpbGRLZXlzKG5vZGVLZXksIFtjaGlsZEtleV0pO1xuICAgIC8qXG4gICAgICogTWFyayB0aGUgbm9kZSBhcyBkaXJ0eSBzbyBpdHMgYW5jZXN0b3JzIGFyZSBmZXRjaGVkIGFnYWluIG9uIHJlbG9hZCBvZiB0aGUgdHJlZS5cbiAgICAgKi9cbiAgICB0aGlzLl9zZXQoJ2lzRGlydHlNYXAnLCBzZXRQcm9wZXJ0eSh0aGlzLl9kYXRhLmlzRGlydHlNYXAsIG5vZGVLZXksIHRydWUpKTtcbiAgfVxuXG4gIF9zZXRDaGlsZEtleXMobm9kZUtleTogc3RyaW5nLCBjaGlsZEtleXM6IEFycmF5PHN0cmluZz4pOiB2b2lkIHtcbiAgICBjb25zdCBvbGRDaGlsZEtleXMgPSB0aGlzLl9kYXRhLmNoaWxkS2V5TWFwW25vZGVLZXldO1xuICAgIGlmIChvbGRDaGlsZEtleXMpIHtcbiAgICAgIGNvbnN0IG5ld0NoaWxkS2V5cyA9IG5ldyBJbW11dGFibGUuU2V0KGNoaWxkS2V5cyk7XG4gICAgICBjb25zdCByZW1vdmVkRGlyZWN0b3J5S2V5cyA9IG5ldyBJbW11dGFibGUuU2V0KG9sZENoaWxkS2V5cylcbiAgICAgICAgLnN1YnRyYWN0KG5ld0NoaWxkS2V5cylcbiAgICAgICAgLmZpbHRlcihGaWxlVHJlZUhlbHBlcnMuaXNEaXJLZXkpO1xuICAgICAgcmVtb3ZlZERpcmVjdG9yeUtleXMuZm9yRWFjaCh0aGlzLl9wdXJnZURpcmVjdG9yeS5iaW5kKHRoaXMpKTtcbiAgICB9XG4gICAgdGhpcy5fc2V0KCdjaGlsZEtleU1hcCcsIHNldFByb3BlcnR5KHRoaXMuX2RhdGEuY2hpbGRLZXlNYXAsIG5vZGVLZXksIGNoaWxkS2V5cykpO1xuICB9XG5cbiAgX29uRGlyZWN0b3J5Q2hhbmdlKG5vZGVLZXk6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuX2ZldGNoQ2hpbGRLZXlzKG5vZGVLZXkpO1xuICB9XG5cbiAgX2FkZFN1YnNjcmlwdGlvbihub2RlS2V5OiBzdHJpbmcpOiB2b2lkIHtcbiAgICBjb25zdCBkaXJlY3RvcnkgPSBGaWxlVHJlZUhlbHBlcnMuZ2V0RGlyZWN0b3J5QnlLZXkobm9kZUtleSk7XG4gICAgaWYgKCFkaXJlY3RvcnkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvKlxuICAgICAqIFJlbW92ZSB0aGUgZGlyZWN0b3J5J3MgZGlydHkgbWFya2VyIHJlZ2FyZGxlc3Mgb2Ygd2hldGhlciBhIHN1YnNjcmlwdGlvbiBhbHJlYWR5IGV4aXN0c1xuICAgICAqIGJlY2F1c2UgdGhlcmUgaXMgbm90aGluZyBmdXJ0aGVyIG1ha2luZyBpdCBkaXJ0eS5cbiAgICAgKi9cbiAgICB0aGlzLl9zZXQoJ2lzRGlydHlNYXAnLCBkZWxldGVQcm9wZXJ0eSh0aGlzLl9kYXRhLmlzRGlydHlNYXAsIG5vZGVLZXkpKTtcblxuICAgIC8vIERvbid0IGNyZWF0ZSBhIG5ldyBzdWJzY3JpcHRpb24gaWYgb25lIGFscmVhZHkgZXhpc3RzLlxuICAgIGlmICh0aGlzLl9kYXRhLnN1YnNjcmlwdGlvbk1hcFtub2RlS2V5XSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGxldCBzdWJzY3JpcHRpb247XG4gICAgdHJ5IHtcbiAgICAgIC8vIFRoaXMgY2FsbCBtaWdodCBmYWlsIGlmIHdlIHRyeSB0byB3YXRjaCBhIG5vbi1leGlzdGluZyBkaXJlY3RvcnksIG9yIGlmIHBlcm1pc3Npb24gZGVuaWVkLlxuICAgICAgc3Vic2NyaXB0aW9uID0gZGlyZWN0b3J5Lm9uRGlkQ2hhbmdlKCgpID0+IHtcbiAgICAgICAgdGhpcy5fb25EaXJlY3RvcnlDaGFuZ2Uobm9kZUtleSk7XG4gICAgICB9KTtcbiAgICB9IGNhdGNoIChleCkge1xuICAgICAgLypcbiAgICAgICAqIExvZyBlcnJvciBhbmQgbWFyayB0aGUgZGlyZWN0b3J5IGFzIGRpcnR5IHNvIHRoZSBmYWlsZWQgc3Vic2NyaXB0aW9uIHdpbGwgYmUgYXR0ZW1wdGVkXG4gICAgICAgKiBhZ2FpbiBuZXh0IHRpbWUgdGhlIGRpcmVjdG9yeSBpcyBleHBhbmRlZC5cbiAgICAgICAqL1xuICAgICAgdGhpcy5fbG9nZ2VyLmVycm9yKGBDYW5ub3Qgc3Vic2NyaWJlIHRvIGRpcmVjdG9yeSBcIiR7bm9kZUtleX1cImAsIGV4KTtcbiAgICAgIHRoaXMuX3NldCgnaXNEaXJ0eU1hcCcsIHNldFByb3BlcnR5KHRoaXMuX2RhdGEuaXNEaXJ0eU1hcCwgbm9kZUtleSkpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLl9zZXQoJ3N1YnNjcmlwdGlvbk1hcCcsIHNldFByb3BlcnR5KHRoaXMuX2RhdGEuc3Vic2NyaXB0aW9uTWFwLCBub2RlS2V5LCBzdWJzY3JpcHRpb24pKTtcbiAgfVxuXG4gIF9yZW1vdmVTdWJzY3JpcHRpb24ocm9vdEtleTogc3RyaW5nLCBub2RlS2V5OiBzdHJpbmcpOiB2b2lkIHtcbiAgICBsZXQgaGFzUmVtYWluaW5nU3Vic2NyaWJlcnM7XG4gICAgY29uc3Qgc3Vic2NyaXB0aW9uID0gdGhpcy5fZGF0YS5zdWJzY3JpcHRpb25NYXBbbm9kZUtleV07XG5cbiAgICBpZiAoc3Vic2NyaXB0aW9uICE9IG51bGwpIHtcbiAgICAgIGhhc1JlbWFpbmluZ1N1YnNjcmliZXJzID0gdGhpcy5fZGF0YS5yb290S2V5cy5zb21lKG90aGVyUm9vdEtleSA9PiAoXG4gICAgICAgIG90aGVyUm9vdEtleSAhPT0gcm9vdEtleSAmJiB0aGlzLmlzRXhwYW5kZWQob3RoZXJSb290S2V5LCBub2RlS2V5KVxuICAgICAgKSk7XG4gICAgICBpZiAoIWhhc1JlbWFpbmluZ1N1YnNjcmliZXJzKSB7XG4gICAgICAgIHN1YnNjcmlwdGlvbi5kaXNwb3NlKCk7XG4gICAgICAgIHRoaXMuX3NldCgnc3Vic2NyaXB0aW9uTWFwJywgZGVsZXRlUHJvcGVydHkodGhpcy5fZGF0YS5zdWJzY3JpcHRpb25NYXAsIG5vZGVLZXkpKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoc3Vic2NyaXB0aW9uID09IG51bGwgfHwgaGFzUmVtYWluaW5nU3Vic2NyaWJlcnMgPT09IGZhbHNlKSB7XG4gICAgICAvLyBTaW5jZSB3ZSdyZSBubyBsb25nZXIgZ2V0dGluZyBub3RpZmljYXRpb25zIHdoZW4gdGhlIGRpcmVjdG9yeSBjb250ZW50cyBjaGFuZ2UsIGFzc3VtZSB0aGVcbiAgICAgIC8vIGNoaWxkIGxpc3QgaXMgZGlydHkuXG4gICAgICB0aGlzLl9zZXQoJ2lzRGlydHlNYXAnLCBzZXRQcm9wZXJ0eSh0aGlzLl9kYXRhLmlzRGlydHlNYXAsIG5vZGVLZXksIHRydWUpKTtcbiAgICB9XG4gIH1cblxuICBfcmVtb3ZlQWxsU3Vic2NyaXB0aW9ucyhub2RlS2V5OiBzdHJpbmcpOiB2b2lkIHtcbiAgICBjb25zdCBzdWJzY3JpcHRpb24gPSB0aGlzLl9kYXRhLnN1YnNjcmlwdGlvbk1hcFtub2RlS2V5XTtcbiAgICBpZiAoc3Vic2NyaXB0aW9uKSB7XG4gICAgICBzdWJzY3JpcHRpb24uZGlzcG9zZSgpO1xuICAgICAgdGhpcy5fc2V0KCdzdWJzY3JpcHRpb25NYXAnLCBkZWxldGVQcm9wZXJ0eSh0aGlzLl9kYXRhLnN1YnNjcmlwdGlvbk1hcCwgbm9kZUtleSkpO1xuICAgIH1cbiAgfVxuXG4gIF9wdXJnZU5vZGUocm9vdEtleTogc3RyaW5nLCBub2RlS2V5OiBzdHJpbmcsIHVuc2VsZWN0OiBib29sZWFuKTogdm9pZCB7XG4gICAgY29uc3QgZXhwYW5kZWRLZXlzID0gdGhpcy5fZ2V0RXhwYW5kZWRLZXlzKHJvb3RLZXkpO1xuICAgIGlmIChleHBhbmRlZEtleXMuaGFzKG5vZGVLZXkpKSB7XG4gICAgICB0aGlzLl9zZXRFeHBhbmRlZEtleXMocm9vdEtleSwgZXhwYW5kZWRLZXlzLmRlbGV0ZShub2RlS2V5KSk7XG4gICAgfVxuXG4gICAgaWYgKHVuc2VsZWN0KSB7XG4gICAgICBjb25zdCBzZWxlY3RlZEtleXMgPSB0aGlzLmdldFNlbGVjdGVkS2V5cyhyb290S2V5KTtcbiAgICAgIGlmIChzZWxlY3RlZEtleXMuaGFzKG5vZGVLZXkpKSB7XG4gICAgICAgIHRoaXMuX3NldFNlbGVjdGVkS2V5cyhyb290S2V5LCBzZWxlY3RlZEtleXMuZGVsZXRlKG5vZGVLZXkpKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBwcmV2aW91c2x5RXhwYW5kZWQgPSB0aGlzLl9nZXRQcmV2aW91c2x5RXhwYW5kZWQocm9vdEtleSk7XG4gICAgaWYgKHByZXZpb3VzbHlFeHBhbmRlZC5oYXMobm9kZUtleSkpIHtcbiAgICAgIHRoaXMuX3NldFByZXZpb3VzbHlFeHBhbmRlZChyb290S2V5LCBwcmV2aW91c2x5RXhwYW5kZWQuZGVsZXRlKG5vZGVLZXkpKTtcbiAgICB9XG4gIH1cblxuICBfcHVyZ2VEaXJlY3RvcnlXaXRoaW5BUm9vdChyb290S2V5OiBzdHJpbmcsIG5vZGVLZXk6IHN0cmluZywgdW5zZWxlY3Q6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICBjb25zdCBjaGlsZEtleXMgPSB0aGlzLl9kYXRhLmNoaWxkS2V5TWFwW25vZGVLZXldO1xuICAgIGlmIChjaGlsZEtleXMpIHtcbiAgICAgIGNoaWxkS2V5cy5mb3JFYWNoKGNoaWxkS2V5ID0+IHtcbiAgICAgICAgaWYgKEZpbGVUcmVlSGVscGVycy5pc0RpcktleShjaGlsZEtleSkpIHtcbiAgICAgICAgICB0aGlzLl9wdXJnZURpcmVjdG9yeVdpdGhpbkFSb290KHJvb3RLZXksIGNoaWxkS2V5LCAvKiB1bnNlbGVjdCAqLyB0cnVlKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICAgIHRoaXMuX3JlbW92ZVN1YnNjcmlwdGlvbihyb290S2V5LCBub2RlS2V5KTtcbiAgICB0aGlzLl9wdXJnZU5vZGUocm9vdEtleSwgbm9kZUtleSwgdW5zZWxlY3QpO1xuICB9XG5cbiAgLy8gVGhpcyBpcyBjYWxsZWQgd2hlbiBhIGRpcmN0b3J5IGlzIHBoeXNpY2FsbHkgcmVtb3ZlZCBmcm9tIGRpc2suIFdoZW4gd2UgcHVyZ2UgYSBkaXJlY3RvcnksXG4gIC8vIHdlIG5lZWQgdG8gcHVyZ2UgaXQncyBjaGlsZCBkaXJlY3RvcmllcyBhbHNvLiBQdXJnaW5nIHJlbW92ZXMgc3R1ZmYgZnJvbSB0aGUgZGF0YSBzdG9yZVxuICAvLyBpbmNsdWRpbmcgbGlzdCBvZiBjaGlsZCBub2Rlcywgc3Vic2NyaXB0aW9ucywgZXhwYW5kZWQgZGlyZWN0b3JpZXMgYW5kIHNlbGVjdGVkIGRpcmVjdG9yaWVzLlxuICBfcHVyZ2VEaXJlY3Rvcnkobm9kZUtleTogc3RyaW5nKTogdm9pZCB7XG4gICAgY29uc3QgY2hpbGRLZXlzID0gdGhpcy5fZGF0YS5jaGlsZEtleU1hcFtub2RlS2V5XTtcbiAgICBpZiAoY2hpbGRLZXlzKSB7XG4gICAgICBjaGlsZEtleXMuZm9yRWFjaChjaGlsZEtleSA9PiB7XG4gICAgICAgIGlmIChGaWxlVHJlZUhlbHBlcnMuaXNEaXJLZXkoY2hpbGRLZXkpKSB7XG4gICAgICAgICAgdGhpcy5fcHVyZ2VEaXJlY3RvcnkoY2hpbGRLZXkpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHRoaXMuX3NldCgnY2hpbGRLZXlNYXAnLCBkZWxldGVQcm9wZXJ0eSh0aGlzLl9kYXRhLmNoaWxkS2V5TWFwLCBub2RlS2V5KSk7XG4gICAgfVxuXG4gICAgdGhpcy5fcmVtb3ZlQWxsU3Vic2NyaXB0aW9ucyhub2RlS2V5KTtcbiAgICB0aGlzLmdldFJvb3RLZXlzKCkuZm9yRWFjaChyb290S2V5ID0+IHtcbiAgICAgIHRoaXMuX3B1cmdlTm9kZShyb290S2V5LCBub2RlS2V5LCAvKiB1bnNlbGVjdCAqLyB0cnVlKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8vIFRPRE86IFNob3VsZCB3ZSBjbGVhbiB1cCBpc0xvYWRpbmdNYXA/IEl0IGNvbnRhaW5zIHByb21pc2VzIHdoaWNoIGNhbm5vdCBiZSBjYW5jZWxsZWQsIHNvIHRoaXNcbiAgLy8gbWlnaHQgYmUgdHJpY2t5LlxuICBfcHVyZ2VSb290KHJvb3RLZXk6IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IGV4cGFuZGVkS2V5cyA9IHRoaXMuX2RhdGEuZXhwYW5kZWRLZXlzQnlSb290W3Jvb3RLZXldO1xuICAgIGlmIChleHBhbmRlZEtleXMpIHtcbiAgICAgIGV4cGFuZGVkS2V5cy5mb3JFYWNoKG5vZGVLZXkgPT4ge1xuICAgICAgICB0aGlzLl9yZW1vdmVTdWJzY3JpcHRpb24ocm9vdEtleSwgbm9kZUtleSk7XG4gICAgICB9KTtcbiAgICAgIHRoaXMuX3NldCgnZXhwYW5kZWRLZXlzQnlSb290JywgZGVsZXRlUHJvcGVydHkodGhpcy5fZGF0YS5leHBhbmRlZEtleXNCeVJvb3QsIHJvb3RLZXkpKTtcbiAgICB9XG4gICAgdGhpcy5fc2V0KCdzZWxlY3RlZEtleXNCeVJvb3QnLCBkZWxldGVQcm9wZXJ0eSh0aGlzLl9kYXRhLnNlbGVjdGVkS2V5c0J5Um9vdCwgcm9vdEtleSkpO1xuICAgIC8vIFJlbW92ZSBhbGwgY2hpbGQga2V5cyBzbyB0aGF0IG9uIHJlLWFkZGl0aW9uIG9mIHRoaXMgcm9vdCB0aGUgY2hpbGRyZW4gd2lsbCBiZSBmZXRjaGVkIGFnYWluLlxuICAgIGNvbnN0IGNoaWxkS2V5cyA9IHRoaXMuX2RhdGEuY2hpbGRLZXlNYXBbcm9vdEtleV07XG4gICAgaWYgKGNoaWxkS2V5cykge1xuICAgICAgY2hpbGRLZXlzLmZvckVhY2goY2hpbGRLZXkgPT4ge1xuICAgICAgICBpZiAoRmlsZVRyZWVIZWxwZXJzLmlzRGlyS2V5KGNoaWxkS2V5KSkge1xuICAgICAgICAgIHRoaXMuX3NldCgnY2hpbGRLZXlNYXAnLCBkZWxldGVQcm9wZXJ0eSh0aGlzLl9kYXRhLmNoaWxkS2V5TWFwLCBjaGlsZEtleSkpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHRoaXMuX3NldCgnY2hpbGRLZXlNYXAnLCBkZWxldGVQcm9wZXJ0eSh0aGlzLl9kYXRhLmNoaWxkS2V5TWFwLCByb290S2V5KSk7XG4gICAgfVxuICAgIHRoaXMuX3NldCgndmNzU3RhdHVzZXNCeVJvb3QnLCBkZWxldGVQcm9wZXJ0eSh0aGlzLl9kYXRhLnZjc1N0YXR1c2VzQnlSb290LCByb290S2V5KSk7XG4gIH1cblxuICBfc2V0VHJhY2tlZE5vZGUocm9vdEtleTogc3RyaW5nLCBub2RlS2V5OiBzdHJpbmcpOiB2b2lkIHtcbiAgICAvLyBGbHVzaCB0aGUgdmFsdWUgdG8gZW5zdXJlIGNsaWVudHMgc2VlIHRoZSB2YWx1ZSBhdCBsZWFzdCBvbmNlIGFuZCBzY3JvbGwgYXBwcm9wcmlhdGVseS5cbiAgICB0aGlzLl9zZXQoJ3RyYWNrZWROb2RlJywge25vZGVLZXksIHJvb3RLZXl9LCB0cnVlKTtcbiAgfVxuXG4gIF9zZXRSZXBvc2l0b3JpZXMocmVwb3NpdG9yaWVzOiBJbW11dGFibGUuU2V0PGF0b20kUmVwb3NpdG9yeT4pOiB2b2lkIHtcbiAgICB0aGlzLl9zZXQoJ3JlcG9zaXRvcmllcycsIHJlcG9zaXRvcmllcyk7XG5cbiAgICAvLyBXaGVuZXZlciBhIG5ldyBzZXQgb2YgcmVwb3NpdG9yaWVzIGNvbWVzIGluLCBpbnZhbGlkYXRlIG91ciBwYXRocyBjYWNoZSBieSByZXNldHRpbmcgaXRzXG4gICAgLy8gYGNhY2hlYCBwcm9wZXJ0eSAoY3JlYXRlZCBieSBsb2Rhc2gubWVtb2l6ZSkgdG8gYW4gZW1wdHkgbWFwLlxuICAgIHRoaXMuX3JlcG9zaXRvcnlGb3JQYXRoLmNhY2hlID0gbmV3IE1hcCgpO1xuICB9XG5cbiAgX3NldFdvcmtpbmdTZXQod29ya2luZ1NldDogV29ya2luZ1NldCk6IHZvaWQge1xuICAgIHRoaXMuX3NldCgnd29ya2luZ1NldCcsIHdvcmtpbmdTZXQpO1xuICB9XG5cbiAgX3NldE9wZW5GaWxlc1dvcmtpbmdTZXQob3BlbkZpbGVzV29ya2luZ1NldDogV29ya2luZ1NldCk6IHZvaWQge1xuICAgIHRoaXMuX3NldCgnb3BlbkZpbGVzV29ya2luZ1NldCcsIG9wZW5GaWxlc1dvcmtpbmdTZXQpO1xuICB9XG5cbiAgX3NldFdvcmtpbmdTZXRzU3RvcmUod29ya2luZ1NldHNTdG9yZTogP1dvcmtpbmdTZXRzU3RvcmUpOiB2b2lkIHtcbiAgICB0aGlzLl9zZXQoJ3dvcmtpbmdTZXRzU3RvcmUnLCB3b3JraW5nU2V0c1N0b3JlKTtcbiAgfVxuXG4gIF9zdGFydEVkaXRpbmdXb3JraW5nU2V0KGVkaXRlZFdvcmtpbmdTZXQ6IFdvcmtpbmdTZXQpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuX2RhdGEuaXNFZGl0aW5nV29ya2luZ1NldCkge1xuICAgICAgdGhpcy5fc2V0KCdpc0VkaXRpbmdXb3JraW5nU2V0JywgdHJ1ZSk7XG4gICAgICB0aGlzLl9zZXRFZGl0ZWRXb3JraW5nU2V0KGVkaXRlZFdvcmtpbmdTZXQpO1xuICAgIH1cbiAgfVxuXG4gIF9maW5pc2hFZGl0aW5nV29ya2luZ1NldCgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fZGF0YS5pc0VkaXRpbmdXb3JraW5nU2V0KSB7XG4gICAgICB0aGlzLl9zZXQoJ2lzRWRpdGluZ1dvcmtpbmdTZXQnLCBmYWxzZSk7XG4gICAgICB0aGlzLl9zZXRFZGl0ZWRXb3JraW5nU2V0KG5ldyBXb3JraW5nU2V0KCkpO1xuICAgIH1cbiAgfVxuXG4gIF9jaGVja05vZGUocm9vdEtleTogc3RyaW5nLCBub2RlS2V5OiBzdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuX2RhdGEuaXNFZGl0aW5nV29ya2luZ1NldCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGVkaXRlZFdvcmtpbmdTZXQgPSB0aGlzLl9kYXRhLmVkaXRlZFdvcmtpbmdTZXQuYXBwZW5kKG5vZGVLZXkpO1xuXG4gICAgY29uc3Qgbm9kZSA9IHRoaXMuZ2V0Tm9kZShyb290S2V5LCBub2RlS2V5KTtcbiAgICBpZiAobm9kZS5pc1Jvb3QpIHtcbiAgICAgIHRoaXMuX3NldEVkaXRlZFdvcmtpbmdTZXQoZWRpdGVkV29ya2luZ1NldCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgcGFyZW50ID0gbm9kZS5nZXRQYXJlbnROb2RlKCk7XG4gICAgY29uc3QgY2hpbGRyZW5LZXlzID0gdGhpcy5nZXRDYWNoZWRDaGlsZEtleXMocm9vdEtleSwgcGFyZW50Lm5vZGVLZXkpO1xuICAgIGlmIChjaGlsZHJlbktleXMuZXZlcnkoY2sgPT4gZWRpdGVkV29ya2luZ1NldC5jb250YWluc0ZpbGUoY2spKSkge1xuICAgICAgdGhpcy5fY2hlY2tOb2RlKHJvb3RLZXksIHBhcmVudC5ub2RlS2V5KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fc2V0RWRpdGVkV29ya2luZ1NldChlZGl0ZWRXb3JraW5nU2V0KTtcbiAgICB9XG4gIH1cblxuICBfdW5jaGVja05vZGUocm9vdEtleTogc3RyaW5nLCBub2RlS2V5OiBzdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuX2RhdGEuaXNFZGl0aW5nV29ya2luZ1NldCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IG5vZGUgPSB0aGlzLmdldE5vZGUocm9vdEtleSwgbm9kZUtleSk7XG4gICAgaWYgKG5vZGUuaXNSb290KSB7XG4gICAgICB0aGlzLl9zZXRFZGl0ZWRXb3JraW5nU2V0KHRoaXMuX2RhdGEuZWRpdGVkV29ya2luZ1NldC5yZW1vdmUobm9kZUtleSkpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHBhcmVudCA9IG5vZGUuZ2V0UGFyZW50Tm9kZSgpO1xuICAgIGlmICh0aGlzLl9kYXRhLmVkaXRlZFdvcmtpbmdTZXQuY29udGFpbnNGaWxlKHBhcmVudC5ub2RlS2V5KSkge1xuICAgICAgdGhpcy5fdW5jaGVja05vZGUocm9vdEtleSwgcGFyZW50Lm5vZGVLZXkpO1xuICAgICAgY29uc3QgY2hpbGRyZW5LZXlzID0gdGhpcy5nZXRDYWNoZWRDaGlsZEtleXMocm9vdEtleSwgcGFyZW50Lm5vZGVLZXkpO1xuICAgICAgY29uc3Qgc2libGluZ3NLZXlzID0gY2hpbGRyZW5LZXlzLmZpbHRlcihjayA9PiBjayAhPT0gbm9kZUtleSk7XG5cbiAgICAgIHRoaXMuX3NldEVkaXRlZFdvcmtpbmdTZXQodGhpcy5fZGF0YS5lZGl0ZWRXb3JraW5nU2V0LmFwcGVuZCguLi5zaWJsaW5nc0tleXMpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fc2V0RWRpdGVkV29ya2luZ1NldCh0aGlzLl9kYXRhLmVkaXRlZFdvcmtpbmdTZXQucmVtb3ZlKG5vZGVLZXkpKTtcbiAgICB9XG4gIH1cblxuICBfb21pdEhpZGRlblBhdGhzKG5vZGVLZXlzOiBBcnJheTxzdHJpbmc+KTogQXJyYXk8c3RyaW5nPiB7XG4gICAgaWYgKFxuICAgICAgIXRoaXMuX2RhdGEuaGlkZUlnbm9yZWROYW1lcyAmJlxuICAgICAgIXRoaXMuX2RhdGEuZXhjbHVkZVZjc0lnbm9yZWRQYXRocyAmJlxuICAgICAgdGhpcy5fZGF0YS53b3JraW5nU2V0LmlzRW1wdHkoKVxuICAgICkge1xuICAgICAgcmV0dXJuIG5vZGVLZXlzO1xuICAgIH1cblxuICAgIHJldHVybiBub2RlS2V5cy5maWx0ZXIobm9kZUtleSA9PiAhdGhpcy5fc2hvdWxkSGlkZVBhdGgobm9kZUtleSkpO1xuICB9XG5cbiAgX3Nob3VsZEhpZGVQYXRoKG5vZGVLZXk6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IGlzSWdub3JlZFBhdGggPSB0aGlzLl9pc0lnbm9yZWRQYXRoKG5vZGVLZXkpO1xuICAgIGlmIChpc0lnbm9yZWRQYXRoKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBjb25zdCBpc0V4Y2x1ZGVkRnJvbVdzID0gdGhpcy5faXNFeGNsdWRlZEZyb21Xb3JraW5nU2V0KG5vZGVLZXkpO1xuICAgIHJldHVybiBpc0V4Y2x1ZGVkRnJvbVdzICYmIHRoaXMuX2lzRXhjbHVkZWRGcm9tT3BlbkZpbGVzV29ya2luZ1NldChub2RlS2V5KTtcbiAgfVxuXG4gIF9pc0lnbm9yZWRQYXRoKG5vZGVLZXk6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHtoaWRlSWdub3JlZE5hbWVzLCBleGNsdWRlVmNzSWdub3JlZFBhdGhzLCBpZ25vcmVkUGF0dGVybnN9ID0gdGhpcy5fZGF0YTtcblxuICAgIGlmIChoaWRlSWdub3JlZE5hbWVzICYmIG1hdGNoZXNTb21lKG5vZGVLZXksIGlnbm9yZWRQYXR0ZXJucykpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBpZiAoZXhjbHVkZVZjc0lnbm9yZWRQYXRocyAmJiBpc1Zjc0lnbm9yZWQobm9kZUtleSwgdGhpcy5fcmVwb3NpdG9yeUZvclBhdGgobm9kZUtleSkpKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBfaXNFeGNsdWRlZEZyb21Xb3JraW5nU2V0KG5vZGVLZXk6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHt3b3JraW5nU2V0LCBpc0VkaXRpbmdXb3JraW5nU2V0fSA9IHRoaXMuX2RhdGE7XG5cbiAgICBpZiAoIWlzRWRpdGluZ1dvcmtpbmdTZXQpIHtcbiAgICAgIGlmIChGaWxlVHJlZUhlbHBlcnMuaXNEaXJLZXkobm9kZUtleSkpIHtcbiAgICAgICAgcmV0dXJuICF3b3JraW5nU2V0LmNvbnRhaW5zRGlyKG5vZGVLZXkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuICF3b3JraW5nU2V0LmNvbnRhaW5zRmlsZShub2RlS2V5KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBfaXNFeGNsdWRlZEZyb21PcGVuRmlsZXNXb3JraW5nU2V0KG5vZGVLZXk6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHtvcGVuRmlsZXNXb3JraW5nU2V0LCBpc0VkaXRpbmdXb3JraW5nU2V0fSA9IHRoaXMuX2RhdGE7XG5cbiAgICBpZiAoaXNFZGl0aW5nV29ya2luZ1NldCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlmIChvcGVuRmlsZXNXb3JraW5nU2V0LmlzRW1wdHkoKSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgaWYgKEZpbGVUcmVlSGVscGVycy5pc0RpcktleShub2RlS2V5KSkge1xuICAgICAgcmV0dXJuICFvcGVuRmlsZXNXb3JraW5nU2V0LmNvbnRhaW5zRGlyKG5vZGVLZXkpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gIW9wZW5GaWxlc1dvcmtpbmdTZXQuY29udGFpbnNGaWxlKG5vZGVLZXkpO1xuICAgIH1cbiAgfVxuXG4gIHJlc2V0KCk6IHZvaWQge1xuICAgIGNvbnN0IHN1YnNjcmlwdGlvbk1hcCA9IHRoaXMuX2RhdGEuc3Vic2NyaXB0aW9uTWFwO1xuICAgIGZvciAoY29uc3Qgbm9kZUtleSBvZiBPYmplY3Qua2V5cyhzdWJzY3JpcHRpb25NYXApKSB7XG4gICAgICBjb25zdCBzdWJzY3JpcHRpb24gPSBzdWJzY3JpcHRpb25NYXBbbm9kZUtleV07XG4gICAgICBpZiAoc3Vic2NyaXB0aW9uKSB7XG4gICAgICAgIHN1YnNjcmlwdGlvbi5kaXNwb3NlKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gUmVzZXQgZGF0YSBzdG9yZS5cbiAgICB0aGlzLl9kYXRhID0gdGhpcy5fZ2V0RGVmYXVsdHMoKTtcbiAgfVxuXG4gIHN1YnNjcmliZShsaXN0ZW5lcjogQ2hhbmdlTGlzdGVuZXIpOiBJRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuX2VtaXR0ZXIub24oJ2NoYW5nZScsIGxpc3RlbmVyKTtcbiAgfVxufVxuXG4vLyBBIGhlbHBlciB0byBkZWxldGUgYSBwcm9wZXJ0eSBpbiBhbiBvYmplY3QgdXNpbmcgc2hhbGxvdyBjb3B5IHJhdGhlciB0aGFuIG11dGF0aW9uXG5mdW5jdGlvbiBkZWxldGVQcm9wZXJ0eShvYmplY3Q6IE9iamVjdCwga2V5OiBzdHJpbmcpOiBPYmplY3Qge1xuICBpZiAoIW9iamVjdC5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgcmV0dXJuIG9iamVjdDtcbiAgfVxuICBjb25zdCBuZXdPYmplY3QgPSB7Li4ub2JqZWN0fTtcbiAgZGVsZXRlIG5ld09iamVjdFtrZXldO1xuICByZXR1cm4gbmV3T2JqZWN0O1xufVxuXG4vLyBBIGhlbHBlciB0byBzZXQgYSBwcm9wZXJ0eSBpbiBhbiBvYmplY3QgdXNpbmcgc2hhbGxvdyBjb3B5IHJhdGhlciB0aGFuIG11dGF0aW9uXG5mdW5jdGlvbiBzZXRQcm9wZXJ0eShvYmplY3Q6IE9iamVjdCwga2V5OiBzdHJpbmcsIG5ld1ZhbHVlOiBtaXhlZCk6IE9iamVjdCB7XG4gIGNvbnN0IG9sZFZhbHVlID0gb2JqZWN0W2tleV07XG4gIGlmIChvbGRWYWx1ZSA9PT0gbmV3VmFsdWUpIHtcbiAgICByZXR1cm4gb2JqZWN0O1xuICB9XG4gIGNvbnN0IG5ld09iamVjdCA9IHsuLi5vYmplY3R9O1xuICBuZXdPYmplY3Rba2V5XSA9IG5ld1ZhbHVlO1xuICByZXR1cm4gbmV3T2JqZWN0O1xufVxuXG4vLyBDcmVhdGUgYSBuZXcgb2JqZWN0IGJ5IG1hcHBpbmcgb3ZlciB0aGUgcHJvcGVydGllcyBvZiBhIGdpdmVuIG9iamVjdCwgY2FsbGluZyB0aGUgZ2l2ZW5cbi8vIGZ1bmN0aW9uIG9uIGVhY2ggb25lLlxuZnVuY3Rpb24gbWFwVmFsdWVzKG9iamVjdDogT2JqZWN0LCBmbjogRnVuY3Rpb24pOiBPYmplY3Qge1xuICBjb25zdCBuZXdPYmplY3QgPSB7fTtcbiAgT2JqZWN0LmtleXMob2JqZWN0KS5mb3JFYWNoKGtleSA9PiB7XG4gICAgbmV3T2JqZWN0W2tleV0gPSBmbihvYmplY3Rba2V5XSwga2V5KTtcbiAgfSk7XG4gIHJldHVybiBuZXdPYmplY3Q7XG59XG5cbi8vIERldGVybWluZSB3aGV0aGVyIHRoZSBnaXZlbiBzdHJpbmcgbWF0Y2hlcyBhbnkgb2YgYSBzZXQgb2YgcGF0dGVybnMuXG5mdW5jdGlvbiBtYXRjaGVzU29tZShzdHI6IHN0cmluZywgcGF0dGVybnM6IEltbXV0YWJsZS5TZXQ8TWluaW1hdGNoPikge1xuICByZXR1cm4gcGF0dGVybnMuc29tZShwYXR0ZXJuID0+IHBhdHRlcm4ubWF0Y2goc3RyKSk7XG59XG5cbmZ1bmN0aW9uIGlzVmNzSWdub3JlZChub2RlS2V5OiBzdHJpbmcsIHJlcG86ID9hdG9tJFJlcG9zaXRvcnkpIHtcbiAgcmV0dXJuIHJlcG8gJiYgcmVwby5pc1Byb2plY3RBdFJvb3QoKSAmJiByZXBvLmlzUGF0aElnbm9yZWQobm9kZUtleSk7XG59XG5cblxuLyoqXG4gKiBQZXJmb3JtcyBhIGJyZWFkdGgtZmlyc3QgaXRlcmF0aW9uIG92ZXIgdGhlIGRpcmVjdG9yaWVzIG9mIHRoZSB0cmVlIHN0YXJ0aW5nXG4gKiB3aXRoIGEgZ2l2ZW4gbm9kZS4gVGhlIGl0ZXJhdGlvbiBzdG9wcyBvbmNlIGEgZ2l2ZW4gbGltaXQgb2Ygbm9kZXMgKGJvdGggZGlyZWN0b3JpZXNcbiAqIGFuZCBmaWxlcykgd2VyZSB0cmF2ZXJzZWQuXG4gKiBUaGUgbm9kZSBiZWluZyBjdXJyZW50bHkgdHJhdmVyc2VkIGNhbiBiZSBvYnRhaW5lZCBieSBjYWxsaW5nIC50cmF2ZXJzZWROb2RlKClcbiAqIC5uZXh0KCkgcmV0dXJucyBhIHByb21pc2UgdGhhdCBpcyBmdWxmaWxsZWQgd2hlbiB0aGUgdHJhdmVyc2FsIG1vdmVzIG9uIHRvXG4gKiB0aGUgbmV4dCBkaXJlY3RvcnkuXG4gKi9cbmNsYXNzIEZpbGVUcmVlU3RvcmVCZnNJdGVyYXRvciB7XG4gIF9maWxlVHJlZVN0b3JlOiBGaWxlVHJlZVN0b3JlO1xuICBfcm9vdEtleTogc3RyaW5nO1xuICBfbm9kZXNUb1RyYXZlcnNlOiBBcnJheTxzdHJpbmc+O1xuICBfY3VycmVudGx5VHJhdmVyc2VkTm9kZTogP3N0cmluZztcbiAgX2xpbWl0OiBudW1iZXI7XG4gIF9udW1Ob2Rlc1RyYXZlcnNlZDogbnVtYmVyO1xuICBfcHJvbWlzZTogP1Byb21pc2U8dm9pZD47XG4gIF9jb3VudDogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgZmlsZVRyZWVTdG9yZTogRmlsZVRyZWVTdG9yZSxcbiAgICAgIHJvb3RLZXk6IHN0cmluZyxcbiAgICAgIG5vZGVLZXk6IHN0cmluZyxcbiAgICAgIGxpbWl0OiBudW1iZXIpIHtcbiAgICB0aGlzLl9maWxlVHJlZVN0b3JlID0gZmlsZVRyZWVTdG9yZTtcbiAgICB0aGlzLl9yb290S2V5ID0gcm9vdEtleTtcbiAgICB0aGlzLl9ub2Rlc1RvVHJhdmVyc2UgPSBbXTtcbiAgICB0aGlzLl9jdXJyZW50bHlUcmF2ZXJzZWROb2RlID0gbm9kZUtleTtcbiAgICB0aGlzLl9saW1pdCA9IGxpbWl0O1xuICAgIHRoaXMuX251bU5vZGVzVHJhdmVyc2VkID0gMDtcbiAgICB0aGlzLl9wcm9taXNlID0gbnVsbDtcbiAgICB0aGlzLl9jb3VudCA9IDA7XG4gIH1cblxuICBfaGFuZGxlUHJvbWlzZVJlc29sdXRpb24oY2hpbGRyZW5LZXlzOiBBcnJheTxzdHJpbmc+KTogdm9pZCB7XG4gICAgdGhpcy5fbnVtTm9kZXNUcmF2ZXJzZWQgKz0gY2hpbGRyZW5LZXlzLmxlbmd0aDtcbiAgICBpZiAodGhpcy5fbnVtTm9kZXNUcmF2ZXJzZWQgPCB0aGlzLl9saW1pdCkge1xuICAgICAgY29uc3QgbmV4dExldmVsTm9kZXMgPSBjaGlsZHJlbktleXMuZmlsdGVyKGNoaWxkS2V5ID0+IEZpbGVUcmVlSGVscGVycy5pc0RpcktleShjaGlsZEtleSkpO1xuICAgICAgdGhpcy5fbm9kZXNUb1RyYXZlcnNlID0gdGhpcy5fbm9kZXNUb1RyYXZlcnNlLmNvbmNhdChuZXh0TGV2ZWxOb2Rlcyk7XG5cbiAgICAgIHRoaXMuX2N1cnJlbnRseVRyYXZlcnNlZE5vZGUgPSB0aGlzLl9ub2Rlc1RvVHJhdmVyc2Uuc3BsaWNlKDAsIDEpWzBdO1xuICAgICAgdGhpcy5fcHJvbWlzZSA9IG51bGw7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2N1cnJlbnRseVRyYXZlcnNlZE5vZGUgPSBudWxsO1xuICAgICAgdGhpcy5fcHJvbWlzZSA9IG51bGw7XG4gICAgfVxuXG4gICAgcmV0dXJuO1xuICB9XG5cbiAgbmV4dCgpOiA/UHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgY3VycmVudGx5VHJhdmVyc2VkTm9kZSA9IHRoaXMuX2N1cnJlbnRseVRyYXZlcnNlZE5vZGU7XG4gICAgaWYgKCF0aGlzLl9wcm9taXNlICYmIGN1cnJlbnRseVRyYXZlcnNlZE5vZGUpIHtcbiAgICAgIHRoaXMuX3Byb21pc2UgPSB0aGlzLl9maWxlVHJlZVN0b3JlLnByb21pc2VOb2RlQ2hpbGRLZXlzKFxuICAgICAgICB0aGlzLl9yb290S2V5LFxuICAgICAgICBjdXJyZW50bHlUcmF2ZXJzZWROb2RlKVxuICAgICAgLnRoZW4odGhpcy5faGFuZGxlUHJvbWlzZVJlc29sdXRpb24uYmluZCh0aGlzKSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9wcm9taXNlO1xuICB9XG5cbiAgdHJhdmVyc2VkTm9kZSgpOiA/c3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fY3VycmVudGx5VHJhdmVyc2VkTm9kZTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZpbGVUcmVlU3RvcmU7XG4iXX0=