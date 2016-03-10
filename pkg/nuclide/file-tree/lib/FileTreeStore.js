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
//# sourceMappingURL=data:application/json;base64,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LGdCQUFtQjtBQUNyQixVQUFNLHNCQUFzQixHQUFHLElBQUksQ0FBQyx1QkFBdUIsQ0FBQztBQUM1RCxVQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsSUFBSSxzQkFBc0IsRUFBRTtBQUM1QyxZQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsb0JBQW9CLENBQ3RELElBQUksQ0FBQyxRQUFRLEVBQ2Isc0JBQXNCLENBQUMsQ0FDeEIsSUFBSSxDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztPQUNqRDtBQUNELGFBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztLQUN0Qjs7O1dBRVkseUJBQVk7QUFDdkIsYUFBTyxJQUFJLENBQUMsdUJBQXVCLENBQUM7S0FDckM7OztTQXRERyx3QkFBd0I7OztBQXlEOUIsTUFBTSxDQUFDLE9BQU8sR0FBRyxhQUFhLENBQUMiLCJmaWxlIjoiRmlsZVRyZWVTdG9yZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtIZ1JlcG9zaXRvcnlDbGllbnR9IGZyb20gJy4uLy4uL2hnLXJlcG9zaXRvcnktY2xpZW50JztcbmltcG9ydCB0eXBlIHtcbiAgUmVtb3RlRGlyZWN0b3J5LFxuICBSZW1vdGVGaWxlLFxufSBmcm9tICcuLi8uLi9yZW1vdGUtY29ubmVjdGlvbic7XG5cbmltcG9ydCBGaWxlVHJlZURpc3BhdGNoZXIgZnJvbSAnLi9GaWxlVHJlZURpc3BhdGNoZXInO1xuaW1wb3J0IEZpbGVUcmVlSGVscGVycyBmcm9tICcuL0ZpbGVUcmVlSGVscGVycyc7XG5pbXBvcnQgRmlsZVRyZWVOb2RlIGZyb20gJy4vRmlsZVRyZWVOb2RlJztcbmltcG9ydCBJbW11dGFibGUgZnJvbSAnaW1tdXRhYmxlJztcbmltcG9ydCB7QWN0aW9uVHlwZX0gZnJvbSAnLi9GaWxlVHJlZUNvbnN0YW50cyc7XG5pbXBvcnQge0Rpc3Bvc2FibGUsIEVtaXR0ZXJ9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHtNaW5pbWF0Y2h9IGZyb20gJ21pbmltYXRjaCc7XG5pbXBvcnQge3JlcG9zaXRvcnlDb250YWluc1BhdGh9IGZyb20gJy4uLy4uL2hnLWdpdC1icmlkZ2UnO1xuaW1wb3J0IHtyZXBvc2l0b3J5Rm9yUGF0aH0gZnJvbSAnLi4vLi4vaGctZ2l0LWJyaWRnZSc7XG5pbXBvcnQge1N0YXR1c0NvZGVOdW1iZXJ9IGZyb20gJy4uLy4uL2hnLXJlcG9zaXRvcnktYmFzZS9saWIvaGctY29uc3RhbnRzJztcblxuaW1wb3J0IHthcnJheX0gZnJvbSAnLi4vLi4vY29tbW9ucyc7XG5pbXBvcnQge2dldExvZ2dlcn0gZnJvbSAnLi4vLi4vbG9nZ2luZyc7XG5pbXBvcnQge29iamVjdCBhcyBvYmplY3RVdGlsfSBmcm9tICcuLi8uLi9jb21tb25zJztcbmltcG9ydCBzaGVsbCBmcm9tICdzaGVsbCc7XG5pbXBvcnQgbWVtb2l6ZSBmcm9tICdsb2Rhc2gubWVtb2l6ZSc7XG5cbmltcG9ydCB7V29ya2luZ1NldH0gZnJvbSAnLi4vLi4vd29ya2luZy1zZXRzJztcblxuLy8gVXNlZCB0byBlbnN1cmUgdGhlIHZlcnNpb24gd2Ugc2VyaWFsaXplZCBpcyB0aGUgc2FtZSB2ZXJzaW9uIHdlIGFyZSBkZXNlcmlhbGl6aW5nLlxuY29uc3QgVkVSU0lPTiA9IDE7XG5cbmltcG9ydCB0eXBlIHtEaXNwYXRjaGVyfSBmcm9tICdmbHV4JztcbmltcG9ydCB0eXBlIHtOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9yZW1vdGUtdXJpJztcbmltcG9ydCB0eXBlIHtXb3JraW5nU2V0c1N0b3JlfSBmcm9tICcuLi8uLi93b3JraW5nLXNldHMvbGliL1dvcmtpbmdTZXRzU3RvcmUnO1xuXG5cbnR5cGUgQWN0aW9uUGF5bG9hZCA9IE9iamVjdDtcbnR5cGUgQ2hhbmdlTGlzdGVuZXIgPSAoKSA9PiBtaXhlZDtcbmV4cG9ydCB0eXBlIEZpbGVUcmVlTm9kZURhdGEgPSB7XG4gIG5vZGVLZXk6IHN0cmluZztcbiAgcm9vdEtleTogc3RyaW5nO1xufVxuXG50eXBlIFN0b3JlRGF0YSA9IHtcbiAgY3dkS2V5OiA/c3RyaW5nO1xuICBjaGlsZEtleU1hcDogeyBba2V5OiBzdHJpbmddOiBBcnJheTxzdHJpbmc+IH07XG4gIGlzRGlydHlNYXA6IHsgW2tleTogc3RyaW5nXTogYm9vbGVhbiB9O1xuICBleHBhbmRlZEtleXNCeVJvb3Q6IHsgW2tleTogc3RyaW5nXTogSW1tdXRhYmxlLlNldDxzdHJpbmc+IH07XG4gIHRyYWNrZWROb2RlOiA/RmlsZVRyZWVOb2RlRGF0YTtcbiAgLy8gU2F2ZXMgYSBsaXN0IG9mIGNoaWxkIG5vZGVzIHRoYXQgc2hvdWxkIGJlIGV4cGFuZGUgd2hlbiBhIGdpdmVuIGtleSBpcyBleHBhbmRlZC5cbiAgLy8gTG9va3MgbGlrZTogeyByb290S2V5OiB7IG5vZGVLZXk6IFtjaGlsZEtleTEsIGNoaWxkS2V5Ml0gfSB9LlxuICBwcmV2aW91c2x5RXhwYW5kZWQ6IHsgW3Jvb3RLZXk6IHN0cmluZ106IEltbXV0YWJsZS5NYXA8c3RyaW5nLCBBcnJheTxTdHJpbmc+PiB9O1xuICBpc0xvYWRpbmdNYXA6IHsgW2tleTogc3RyaW5nXTogP1Byb21pc2UgfTtcbiAgcm9vdEtleXM6IEFycmF5PHN0cmluZz47XG4gIHNlbGVjdGVkS2V5c0J5Um9vdDogeyBba2V5OiBzdHJpbmddOiBJbW11dGFibGUuT3JkZXJlZFNldDxzdHJpbmc+IH07XG4gIHN1YnNjcmlwdGlvbk1hcDogeyBba2V5OiBzdHJpbmddOiBEaXNwb3NhYmxlIH07XG4gIHZjc1N0YXR1c2VzQnlSb290OiB7IFtrZXk6IHN0cmluZ106IEltbXV0YWJsZS5NYXA8c3RyaW5nLCBudW1iZXI+IH07XG4gIGlnbm9yZWRQYXR0ZXJuczogSW1tdXRhYmxlLlNldDxNaW5pbWF0Y2g+O1xuICBoaWRlSWdub3JlZE5hbWVzOiBib29sZWFuO1xuICBleGNsdWRlVmNzSWdub3JlZFBhdGhzOiBib29sZWFuO1xuICB1c2VQcmV2aWV3VGFiczogYm9vbGVhbjtcbiAgdXNlUHJlZml4TmF2OiBib29sZWFuO1xuICByZXBvc2l0b3JpZXM6IEltbXV0YWJsZS5TZXQ8YXRvbSRSZXBvc2l0b3J5PjtcbiAgd29ya2luZ1NldDogV29ya2luZ1NldDtcbiAgb3BlbkZpbGVzV29ya2luZ1NldDogV29ya2luZ1NldDtcbiAgd29ya2luZ1NldHNTdG9yZTogP1dvcmtpbmdTZXRzU3RvcmU7XG4gIGlzRWRpdGluZ1dvcmtpbmdTZXQ6IGJvb2xlYW47XG4gIGVkaXRlZFdvcmtpbmdTZXQ6IFdvcmtpbmdTZXQ7XG59O1xuXG5leHBvcnQgdHlwZSBFeHBvcnRTdG9yZURhdGEgPSB7XG4gIGNoaWxkS2V5TWFwOiB7IFtrZXk6IHN0cmluZ106IEFycmF5PHN0cmluZz4gfTtcbiAgZXhwYW5kZWRLZXlzQnlSb290OiB7IFtrZXk6IHN0cmluZ106IEFycmF5PHN0cmluZz4gfTtcbiAgcm9vdEtleXM6IEFycmF5PHN0cmluZz47XG4gIHNlbGVjdGVkS2V5c0J5Um9vdDogeyBba2V5OiBzdHJpbmddOiBBcnJheTxzdHJpbmc+IH07XG4gIHZlcnNpb246IG51bWJlcjtcbn07XG5cbmxldCBpbnN0YW5jZTogP09iamVjdDtcblxuLyoqXG4gKiBJbXBsZW1lbnRzIHRoZSBGbHV4IHBhdHRlcm4gZm9yIG91ciBmaWxlIHRyZWUuIEFsbCBzdGF0ZSBmb3IgdGhlIGZpbGUgdHJlZSB3aWxsIGJlIGtlcHQgaW5cbiAqIEZpbGVUcmVlU3RvcmUgYW5kIHRoZSBvbmx5IHdheSB0byB1cGRhdGUgdGhlIHN0b3JlIGlzIHRocm91Z2ggbWV0aG9kcyBvbiBGaWxlVHJlZUFjdGlvbnMuIFRoZVxuICogZGlzcGF0Y2hlciBpcyBhIG1lY2hhbmlzbSB0aHJvdWdoIHdoaWNoIEZpbGVUcmVlQWN0aW9ucyBpbnRlcmZhY2VzIHdpdGggRmlsZVRyZWVTdG9yZS5cbiAqL1xuY2xhc3MgRmlsZVRyZWVTdG9yZSB7XG4gIF9kYXRhOiBTdG9yZURhdGE7XG4gIF9kaXNwYXRjaGVyOiBEaXNwYXRjaGVyO1xuICBfZW1pdHRlcjogRW1pdHRlcjtcbiAgX2xvZ2dlcjogYW55O1xuICBfdGltZXI6ID9PYmplY3Q7XG4gIF9yZXBvc2l0b3J5Rm9yUGF0aDogKHBhdGg6IE51Y2xpZGVVcmkpID0+ID9hdG9tJFJlcG9zaXRvcnk7XG5cbiAgc3RhdGljIGdldEluc3RhbmNlKCk6IEZpbGVUcmVlU3RvcmUge1xuICAgIGlmICghaW5zdGFuY2UpIHtcbiAgICAgIGluc3RhbmNlID0gbmV3IEZpbGVUcmVlU3RvcmUoKTtcbiAgICB9XG4gICAgcmV0dXJuIGluc3RhbmNlO1xuICB9XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5fZGF0YSA9IHRoaXMuX2dldERlZmF1bHRzKCk7XG4gICAgdGhpcy5fZGlzcGF0Y2hlciA9IEZpbGVUcmVlRGlzcGF0Y2hlci5nZXRJbnN0YW5jZSgpO1xuICAgIHRoaXMuX2VtaXR0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIucmVnaXN0ZXIoXG4gICAgICBwYXlsb2FkID0+IHRoaXMuX29uRGlzcGF0Y2gocGF5bG9hZClcbiAgICApO1xuICAgIHRoaXMuX2xvZ2dlciA9IGdldExvZ2dlcigpO1xuICAgIHRoaXMuX3JlcG9zaXRvcnlGb3JQYXRoID0gbWVtb2l6ZSh0aGlzLl9yZXBvc2l0b3J5Rm9yUGF0aCk7XG4gIH1cblxuICAvKipcbiAgICogVE9ETzogTW92ZSB0byBhIFtzZXJpYWxpemF0aW9uIGNsYXNzXVsxXSBhbmQgdXNlIHRoZSBidWlsdC1pbiB2ZXJzaW9uaW5nIG1lY2hhbmlzbS4gVGhpcyBtaWdodFxuICAgKiBuZWVkIHRvIGJlIGRvbmUgb25lIGxldmVsIGhpZ2hlciB3aXRoaW4gbWFpbi5qcy5cbiAgICpcbiAgICogWzFdOiBodHRwczovL2F0b20uaW8vZG9jcy9sYXRlc3QvYmVoaW5kLWF0b20tc2VyaWFsaXphdGlvbi1pbi1hdG9tXG4gICAqL1xuICBleHBvcnREYXRhKCk6IEV4cG9ydFN0b3JlRGF0YSB7XG4gICAgY29uc3QgZGF0YSA9IHRoaXMuX2RhdGE7XG4gICAgLy8gR3JhYiB0aGUgY2hpbGQga2V5cyBvZiBvbmx5IHRoZSBleHBhbmRlZCBub2Rlcy5cbiAgICBjb25zdCBjaGlsZEtleU1hcCA9IHt9O1xuICAgIE9iamVjdC5rZXlzKGRhdGEuZXhwYW5kZWRLZXlzQnlSb290KS5mb3JFYWNoKHJvb3RLZXkgPT4ge1xuICAgICAgY29uc3QgZXhwYW5kZWRLZXlTZXQgPSBkYXRhLmV4cGFuZGVkS2V5c0J5Um9vdFtyb290S2V5XTtcbiAgICAgIGZvciAoY29uc3Qgbm9kZUtleSBvZiBleHBhbmRlZEtleVNldCkge1xuICAgICAgICBjaGlsZEtleU1hcFtub2RlS2V5XSA9IGRhdGEuY2hpbGRLZXlNYXBbbm9kZUtleV07XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHtcbiAgICAgIHZlcnNpb246IFZFUlNJT04sXG4gICAgICBjaGlsZEtleU1hcDogY2hpbGRLZXlNYXAsXG4gICAgICBleHBhbmRlZEtleXNCeVJvb3Q6IG1hcFZhbHVlcyhkYXRhLmV4cGFuZGVkS2V5c0J5Um9vdCwga2V5U2V0ID0+IGtleVNldC50b0FycmF5KCkpLFxuICAgICAgcm9vdEtleXM6IGRhdGEucm9vdEtleXMsXG4gICAgICBzZWxlY3RlZEtleXNCeVJvb3Q6IG1hcFZhbHVlcyhkYXRhLnNlbGVjdGVkS2V5c0J5Um9vdCwga2V5U2V0ID0+IGtleVNldC50b0FycmF5KCkpLFxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogSW1wb3J0cyBzdG9yZSBkYXRhIGZyb20gYSBwcmV2aW91cyBleHBvcnQuXG4gICAqL1xuICBsb2FkRGF0YShkYXRhOiBFeHBvcnRTdG9yZURhdGEpOiB2b2lkIHtcbiAgICAvLyBFbnN1cmUgd2UgYXJlIG5vdCB0cnlpbmcgdG8gbG9hZCBkYXRhIGZyb20gYW4gZWFybGllciB2ZXJzaW9uIG9mIHRoaXMgcGFja2FnZS5cbiAgICBpZiAoZGF0YS52ZXJzaW9uICE9PSBWRVJTSU9OKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuX2RhdGEgPSB7XG4gICAgICAuLi50aGlzLl9nZXREZWZhdWx0cygpLFxuICAgICAgY2hpbGRLZXlNYXA6IGRhdGEuY2hpbGRLZXlNYXAsXG4gICAgICBleHBhbmRlZEtleXNCeVJvb3Q6IG1hcFZhbHVlcyhkYXRhLmV4cGFuZGVkS2V5c0J5Um9vdCwga2V5cyA9PiBuZXcgSW1tdXRhYmxlLlNldChrZXlzKSksXG4gICAgICByb290S2V5czogZGF0YS5yb290S2V5cyxcbiAgICAgIHNlbGVjdGVkS2V5c0J5Um9vdDpcbiAgICAgICAgbWFwVmFsdWVzKGRhdGEuc2VsZWN0ZWRLZXlzQnlSb290LCBrZXlzID0+IG5ldyBJbW11dGFibGUuT3JkZXJlZFNldChrZXlzKSksXG4gICAgfTtcbiAgICBPYmplY3Qua2V5cyhkYXRhLmNoaWxkS2V5TWFwKS5mb3JFYWNoKG5vZGVLZXkgPT4ge1xuICAgICAgdGhpcy5fYWRkU3Vic2NyaXB0aW9uKG5vZGVLZXkpO1xuICAgICAgdGhpcy5fZmV0Y2hDaGlsZEtleXMobm9kZUtleSk7XG4gICAgfSk7XG4gIH1cblxuICBfc2V0RXhjbHVkZVZjc0lnbm9yZWRQYXRocyhleGNsdWRlVmNzSWdub3JlZFBhdGhzOiBib29sZWFuKTogdm9pZCB7XG4gICAgdGhpcy5fc2V0KCdleGNsdWRlVmNzSWdub3JlZFBhdGhzJywgZXhjbHVkZVZjc0lnbm9yZWRQYXRocyk7XG4gIH1cblxuICBfc2V0SGlkZUlnbm9yZWROYW1lcyhoaWRlSWdub3JlZE5hbWVzOiBib29sZWFuKTogdm9pZCB7XG4gICAgdGhpcy5fc2V0KCdoaWRlSWdub3JlZE5hbWVzJywgaGlkZUlnbm9yZWROYW1lcyk7XG4gIH1cblxuICAvKipcbiAgICogR2l2ZW4gYSBsaXN0IG9mIG5hbWVzIHRvIGlnbm9yZSwgY29tcGlsZSB0aGVtIGludG8gbWluaW1hdGNoIHBhdHRlcm5zIGFuZFxuICAgKiB1cGRhdGUgdGhlIHN0b3JlIHdpdGggdGhlbS5cbiAgICovXG4gIF9zZXRJZ25vcmVkTmFtZXMoaWdub3JlZE5hbWVzOiBBcnJheTxzdHJpbmc+KSB7XG4gICAgY29uc3QgaWdub3JlZFBhdHRlcm5zID0gSW1tdXRhYmxlLlNldChpZ25vcmVkTmFtZXMpXG4gICAgICAubWFwKGlnbm9yZWROYW1lID0+IHtcbiAgICAgICAgaWYgKGlnbm9yZWROYW1lID09PSAnJykge1xuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgcmV0dXJuIG5ldyBNaW5pbWF0Y2goaWdub3JlZE5hbWUsIHttYXRjaEJhc2U6IHRydWUsIGRvdDogdHJ1ZX0pO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKFxuICAgICAgICAgICAgYEVycm9yIHBhcnNpbmcgcGF0dGVybiAnJHtpZ25vcmVkTmFtZX0nIGZyb20gXCJTZXR0aW5nc1wiID4gXCJJZ25vcmVkIE5hbWVzXCJgLFxuICAgICAgICAgICAge2RldGFpbDogZXJyb3IubWVzc2FnZX0sXG4gICAgICAgICAgKTtcbiAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIC5maWx0ZXIocGF0dGVybiA9PiBwYXR0ZXJuICE9IG51bGwpO1xuICAgIHRoaXMuX3NldCgnaWdub3JlZFBhdHRlcm5zJywgaWdub3JlZFBhdHRlcm5zKTtcbiAgfVxuXG4gIF9nZXREZWZhdWx0cygpOiBTdG9yZURhdGEge1xuICAgIHJldHVybiB7XG4gICAgICBjd2RLZXk6IG51bGwsXG4gICAgICBjaGlsZEtleU1hcDoge30sXG4gICAgICBpc0RpcnR5TWFwOiB7fSxcbiAgICAgIGV4cGFuZGVkS2V5c0J5Um9vdDoge30sXG4gICAgICB0cmFja2VkTm9kZTogbnVsbCxcbiAgICAgIHByZXZpb3VzbHlFeHBhbmRlZDoge30sXG4gICAgICBpc0xvYWRpbmdNYXA6IHt9LFxuICAgICAgcm9vdEtleXM6IFtdLFxuICAgICAgc2VsZWN0ZWRLZXlzQnlSb290OiB7fSxcbiAgICAgIHN1YnNjcmlwdGlvbk1hcDoge30sXG4gICAgICB2Y3NTdGF0dXNlc0J5Um9vdDoge30sXG4gICAgICBpZ25vcmVkUGF0dGVybnM6IEltbXV0YWJsZS5TZXQoKSxcbiAgICAgIGhpZGVJZ25vcmVkTmFtZXM6IHRydWUsXG4gICAgICBleGNsdWRlVmNzSWdub3JlZFBhdGhzOiB0cnVlLFxuICAgICAgdXNlUHJldmlld1RhYnM6IGZhbHNlLFxuICAgICAgdXNlUHJlZml4TmF2OiB0cnVlLFxuICAgICAgcmVwb3NpdG9yaWVzOiBJbW11dGFibGUuU2V0KCksXG4gICAgICB3b3JraW5nU2V0OiBuZXcgV29ya2luZ1NldCgpLFxuICAgICAgb3BlbkZpbGVzV29ya2luZ1NldDogbmV3IFdvcmtpbmdTZXQoKSxcbiAgICAgIHdvcmtpbmdTZXRzU3RvcmU6IG51bGwsXG4gICAgICBpc0VkaXRpbmdXb3JraW5nU2V0OiBmYWxzZSxcbiAgICAgIGVkaXRlZFdvcmtpbmdTZXQ6IG5ldyBXb3JraW5nU2V0KCksXG4gICAgfTtcbiAgfVxuXG4gIF9vbkRpc3BhdGNoKHBheWxvYWQ6IEFjdGlvblBheWxvYWQpOiB2b2lkIHtcbiAgICBzd2l0Y2ggKHBheWxvYWQuYWN0aW9uVHlwZSkge1xuICAgICAgY2FzZSBBY3Rpb25UeXBlLkRFTEVURV9TRUxFQ1RFRF9OT0RFUzpcbiAgICAgICAgdGhpcy5fZGVsZXRlU2VsZWN0ZWROb2RlcygpLmNhdGNoKGVycm9yID0+IHtcbiAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoJ0RlbGV0aW5nIG5vZGVzIGZhaWxlZCB3aXRoIGFuIGVycm9yOiAnICsgZXJyb3IudG9TdHJpbmcoKSk7XG4gICAgICAgIH0pO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQWN0aW9uVHlwZS5TRVRfQ1dEOlxuICAgICAgICB0aGlzLl9zZXRDd2RLZXkocGF5bG9hZC5yb290S2V5KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEFjdGlvblR5cGUuU0VUX1RSQUNLRURfTk9ERTpcbiAgICAgICAgdGhpcy5fc2V0VHJhY2tlZE5vZGUocGF5bG9hZC5yb290S2V5LCBwYXlsb2FkLm5vZGVLZXkpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQWN0aW9uVHlwZS5TRVRfUk9PVF9LRVlTOlxuICAgICAgICB0aGlzLl9zZXRSb290S2V5cyhwYXlsb2FkLnJvb3RLZXlzKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEFjdGlvblR5cGUuRVhQQU5EX05PREU6XG4gICAgICAgIHRoaXMuX2V4cGFuZE5vZGUocGF5bG9hZC5yb290S2V5LCBwYXlsb2FkLm5vZGVLZXkpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQWN0aW9uVHlwZS5FWFBBTkRfTk9ERV9ERUVQOlxuICAgICAgICB0aGlzLl9leHBhbmROb2RlRGVlcChwYXlsb2FkLnJvb3RLZXksIHBheWxvYWQubm9kZUtleSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBBY3Rpb25UeXBlLkNPTExBUFNFX05PREU6XG4gICAgICAgIHRoaXMuX2NvbGxhcHNlTm9kZShwYXlsb2FkLnJvb3RLZXksIHBheWxvYWQubm9kZUtleSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBBY3Rpb25UeXBlLlNFVF9FWENMVURFX1ZDU19JR05PUkVEX1BBVEhTOlxuICAgICAgICB0aGlzLl9zZXRFeGNsdWRlVmNzSWdub3JlZFBhdGhzKHBheWxvYWQuZXhjbHVkZVZjc0lnbm9yZWRQYXRocyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBBY3Rpb25UeXBlLlNFVF9VU0VfUFJFVklFV19UQUJTOlxuICAgICAgICB0aGlzLl9zZXRVc2VQcmV2aWV3VGFicyhwYXlsb2FkLnVzZVByZXZpZXdUYWJzKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEFjdGlvblR5cGUuU0VUX1VTRV9QUkVGSVhfTkFWOlxuICAgICAgICB0aGlzLl9zZXRVc2VQcmVmaXhOYXYocGF5bG9hZC51c2VQcmVmaXhOYXYpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQWN0aW9uVHlwZS5DT0xMQVBTRV9OT0RFX0RFRVA6XG4gICAgICAgIHRoaXMuX3B1cmdlRGlyZWN0b3J5V2l0aGluQVJvb3QocGF5bG9hZC5yb290S2V5LCBwYXlsb2FkLm5vZGVLZXksIC8qIHVuc2VsZWN0ICovZmFsc2UpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQWN0aW9uVHlwZS5TRVRfSElERV9JR05PUkVEX05BTUVTOlxuICAgICAgICB0aGlzLl9zZXRIaWRlSWdub3JlZE5hbWVzKHBheWxvYWQuaGlkZUlnbm9yZWROYW1lcyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBBY3Rpb25UeXBlLlNFVF9JR05PUkVEX05BTUVTOlxuICAgICAgICB0aGlzLl9zZXRJZ25vcmVkTmFtZXMocGF5bG9hZC5pZ25vcmVkTmFtZXMpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQWN0aW9uVHlwZS5TRVRfU0VMRUNURURfTk9ERVNfRk9SX1JPT1Q6XG4gICAgICAgIHRoaXMuX3NldFNlbGVjdGVkS2V5cyhwYXlsb2FkLnJvb3RLZXksIHBheWxvYWQubm9kZUtleXMpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQWN0aW9uVHlwZS5TRVRfU0VMRUNURURfTk9ERVNfRk9SX1RSRUU6XG4gICAgICAgIHRoaXMuX3NldFNlbGVjdGVkS2V5c0J5Um9vdChwYXlsb2FkLnNlbGVjdGVkS2V5c0J5Um9vdCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBBY3Rpb25UeXBlLkNSRUFURV9DSElMRDpcbiAgICAgICAgdGhpcy5fY3JlYXRlQ2hpbGQocGF5bG9hZC5ub2RlS2V5LCBwYXlsb2FkLmNoaWxkS2V5KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEFjdGlvblR5cGUuU0VUX1ZDU19TVEFUVVNFUzpcbiAgICAgICAgdGhpcy5fc2V0VmNzU3RhdHVzZXMocGF5bG9hZC5yb290S2V5LCBwYXlsb2FkLnZjc1N0YXR1c2VzKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEFjdGlvblR5cGUuU0VUX1JFUE9TSVRPUklFUzpcbiAgICAgICAgdGhpcy5fc2V0UmVwb3NpdG9yaWVzKHBheWxvYWQucmVwb3NpdG9yaWVzKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEFjdGlvblR5cGUuU0VUX1dPUktJTkdfU0VUOlxuICAgICAgICB0aGlzLl9zZXRXb3JraW5nU2V0KHBheWxvYWQud29ya2luZ1NldCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBBY3Rpb25UeXBlLlNFVF9PUEVOX0ZJTEVTX1dPUktJTkdfU0VUOlxuICAgICAgICB0aGlzLl9zZXRPcGVuRmlsZXNXb3JraW5nU2V0KHBheWxvYWQub3BlbkZpbGVzV29ya2luZ1NldCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBBY3Rpb25UeXBlLlNFVF9XT1JLSU5HX1NFVFNfU1RPUkU6XG4gICAgICAgIHRoaXMuX3NldFdvcmtpbmdTZXRzU3RvcmUocGF5bG9hZC53b3JraW5nU2V0c1N0b3JlKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEFjdGlvblR5cGUuU1RBUlRfRURJVElOR19XT1JLSU5HX1NFVDpcbiAgICAgICAgdGhpcy5fc3RhcnRFZGl0aW5nV29ya2luZ1NldChwYXlsb2FkLmVkaXRlZFdvcmtpbmdTZXQpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQWN0aW9uVHlwZS5GSU5JU0hfRURJVElOR19XT1JLSU5HX1NFVDpcbiAgICAgICAgdGhpcy5fZmluaXNoRWRpdGluZ1dvcmtpbmdTZXQoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEFjdGlvblR5cGUuQ0hFQ0tfTk9ERTpcbiAgICAgICAgdGhpcy5fY2hlY2tOb2RlKHBheWxvYWQucm9vdEtleSwgcGF5bG9hZC5ub2RlS2V5KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEFjdGlvblR5cGUuVU5DSEVDS19OT0RFOlxuICAgICAgICB0aGlzLl91bmNoZWNrTm9kZShwYXlsb2FkLnJvb3RLZXksIHBheWxvYWQubm9kZUtleSk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIGlzIGEgcHJpdmF0ZSBtZXRob2QgYmVjYXVzZSBpbiBGbHV4IHdlIHNob3VsZCBuZXZlciBleHRlcm5hbGx5IHdyaXRlIHRvIHRoZSBkYXRhIHN0b3JlLlxuICAgKiBPbmx5IGJ5IHJlY2VpdmluZyBhY3Rpb25zIChmcm9tIGRpc3BhdGNoZXIpIHNob3VsZCB0aGUgZGF0YSBzdG9yZSBiZSBjaGFuZ2VkLlxuICAgKiBOb3RlOiBgX3NldGAgY2FuIGJlIGNhbGxlZCBtdWx0aXBsZSB0aW1lcyB3aXRoaW4gb25lIGl0ZXJhdGlvbiBvZiBhbiBldmVudCBsb29wIHdpdGhvdXRcbiAgICogdGhyYXNoaW5nIHRoZSBVSSBiZWNhdXNlIHdlIGFyZSB1c2luZyBzZXRJbW1lZGlhdGUgdG8gYmF0Y2ggY2hhbmdlIG5vdGlmaWNhdGlvbnMsIGVmZmVjdGl2ZWx5XG4gICAqIGxldHRpbmcgb3VyIHZpZXdzIHJlLXJlbmRlciBvbmNlIGZvciBtdWx0aXBsZSBjb25zZWN1dGl2ZSB3cml0ZXMuXG4gICAqL1xuICBfc2V0KGtleTogc3RyaW5nLCB2YWx1ZTogbWl4ZWQsIGZsdXNoOiBib29sZWFuID0gZmFsc2UpOiB2b2lkIHtcbiAgICBjb25zdCBvbGREYXRhID0gdGhpcy5fZGF0YTtcbiAgICAvLyBJbW11dGFiaWxpdHkgZm9yIHRoZSB3aW4hXG4gICAgY29uc3QgbmV3RGF0YSA9IHNldFByb3BlcnR5KHRoaXMuX2RhdGEsIGtleSwgdmFsdWUpO1xuICAgIGlmIChuZXdEYXRhICE9PSBvbGREYXRhKSB7XG4gICAgICB0aGlzLl9kYXRhID0gbmV3RGF0YTtcbiAgICAgIGNsZWFySW1tZWRpYXRlKHRoaXMuX3RpbWVyKTtcbiAgICAgIGlmIChmbHVzaCkge1xuICAgICAgICAvLyBJZiBgZmx1c2hgIGlzIHRydWUsIGVtaXQgdGhlIGNoYW5nZSBpbW1lZGlhdGVseS5cbiAgICAgICAgdGhpcy5fZW1pdHRlci5lbWl0KCdjaGFuZ2UnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIElmIG5vdCBmbHVzaGluZywgZGUtYm91bmNlIHRvIHByZXZlbnQgc3VjY2Vzc2l2ZSB1cGRhdGVzIGluIHRoZSBzYW1lIGV2ZW50IGxvb3AuXG4gICAgICAgIHRoaXMuX3RpbWVyID0gc2V0SW1tZWRpYXRlKCgpID0+IHtcbiAgICAgICAgICB0aGlzLl9lbWl0dGVyLmVtaXQoJ2NoYW5nZScpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBnZXRUcmFja2VkTm9kZSgpOiA/RmlsZVRyZWVOb2RlRGF0YSB7XG4gICAgcmV0dXJuIHRoaXMuX2RhdGEudHJhY2tlZE5vZGU7XG4gIH1cblxuICBnZXRSZXBvc2l0b3JpZXMoKTogSW1tdXRhYmxlLlNldDxhdG9tJFJlcG9zaXRvcnk+IHtcbiAgICByZXR1cm4gdGhpcy5fZGF0YS5yZXBvc2l0b3JpZXM7XG4gIH1cblxuICBnZXRXb3JraW5nU2V0KCk6IFdvcmtpbmdTZXQge1xuICAgIHJldHVybiB0aGlzLl9kYXRhLndvcmtpbmdTZXQ7XG4gIH1cblxuICBnZXRPcGVuRmlsZXNXb3JraW5nU2V0KCk6IFdvcmtpbmdTZXQge1xuICAgIHJldHVybiB0aGlzLl9kYXRhLm9wZW5GaWxlc1dvcmtpbmdTZXQ7XG4gIH1cblxuICBnZXRXb3JraW5nU2V0c1N0b3JlKCk6ID9Xb3JraW5nU2V0c1N0b3JlIHtcbiAgICByZXR1cm4gdGhpcy5fZGF0YS53b3JraW5nU2V0c1N0b3JlO1xuICB9XG5cbiAgZ2V0Um9vdEtleXMoKTogQXJyYXk8c3RyaW5nPiB7XG4gICAgcmV0dXJuIHRoaXMuX2RhdGEucm9vdEtleXM7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUga2V5IG9mIHRoZSAqZmlyc3QqIHJvb3Qgbm9kZSBjb250YWluaW5nIHRoZSBnaXZlbiBub2RlLlxuICAgKi9cbiAgZ2V0Um9vdEZvcktleShub2RlS2V5OiBzdHJpbmcpOiA/c3RyaW5nIHtcbiAgICByZXR1cm4gYXJyYXkuZmluZCh0aGlzLl9kYXRhLnJvb3RLZXlzLCByb290S2V5ID0+IG5vZGVLZXkuc3RhcnRzV2l0aChyb290S2V5KSk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0cnVlIGlmIHRoZSBzdG9yZSBoYXMgbm8gZGF0YSwgaS5lLiBubyByb290cywgbm8gY2hpbGRyZW4uXG4gICAqL1xuICBpc0VtcHR5KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmdldFJvb3RLZXlzKCkubGVuZ3RoID09PSAwO1xuICB9XG5cbiAgLyoqXG4gICAqIE5vdGU6IFdlIGFjdHVhbGx5IGRvbid0IG5lZWQgcm9vdEtleSAoaW1wbGVtZW50YXRpb24gZGV0YWlsKSBidXQgd2UgdGFrZSBpdCBmb3IgY29uc2lzdGVuY3kuXG4gICAqL1xuICBpc0xvYWRpbmcocm9vdEtleTogc3RyaW5nLCBub2RlS2V5OiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gISF0aGlzLl9nZXRMb2FkaW5nKG5vZGVLZXkpO1xuICB9XG5cbiAgaXNFeHBhbmRlZChyb290S2V5OiBzdHJpbmcsIG5vZGVLZXk6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9nZXRFeHBhbmRlZEtleXMocm9vdEtleSkuaGFzKG5vZGVLZXkpO1xuICB9XG5cbiAgaXNSb290S2V5KG5vZGVLZXk6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9kYXRhLnJvb3RLZXlzLmluZGV4T2Yobm9kZUtleSkgIT09IC0xO1xuICB9XG5cbiAgaXNTZWxlY3RlZChyb290S2V5OiBzdHJpbmcsIG5vZGVLZXk6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmdldFNlbGVjdGVkS2V5cyhyb290S2V5KS5oYXMobm9kZUtleSk7XG4gIH1cblxuICBfc2V0VmNzU3RhdHVzZXMocm9vdEtleTogc3RyaW5nLCB2Y3NTdGF0dXNlczoge1twYXRoOiBzdHJpbmddOiBudW1iZXJ9KSB7XG4gICAgY29uc3QgaW1tdXRhYmxlVmNzU3RhdHVzZXMgPSBuZXcgSW1tdXRhYmxlLk1hcCh2Y3NTdGF0dXNlcyk7XG4gICAgaWYgKCFJbW11dGFibGUuaXMoaW1tdXRhYmxlVmNzU3RhdHVzZXMsIHRoaXMuX2RhdGEudmNzU3RhdHVzZXNCeVJvb3Rbcm9vdEtleV0pKSB7XG4gICAgICB0aGlzLl9zZXQoXG4gICAgICAgICd2Y3NTdGF0dXNlc0J5Um9vdCcsXG4gICAgICAgIHNldFByb3BlcnR5KHRoaXMuX2RhdGEudmNzU3RhdHVzZXNCeVJvb3QsIHJvb3RLZXksIGltbXV0YWJsZVZjc1N0YXR1c2VzKVxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICBnZXRWY3NTdGF0dXNDb2RlKHJvb3RLZXk6IHN0cmluZywgbm9kZUtleTogc3RyaW5nKTogP251bWJlciB7XG4gICAgY29uc3QgbWFwID0gdGhpcy5fZGF0YS52Y3NTdGF0dXNlc0J5Um9vdFtyb290S2V5XTtcbiAgICBpZiAobWFwKSB7XG4gICAgICByZXR1cm4gbWFwLmdldChub2RlS2V5KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG5cbiAgX3NldFVzZVByZXZpZXdUYWJzKHVzZVByZXZpZXdUYWJzOiBib29sZWFuKSB7XG4gICAgdGhpcy5fc2V0KCd1c2VQcmV2aWV3VGFicycsIHVzZVByZXZpZXdUYWJzKTtcbiAgfVxuXG4gIF9zZXRVc2VQcmVmaXhOYXYodXNlUHJlZml4TmF2OiBib29sZWFuKSB7XG4gICAgdGhpcy5fc2V0KCd1c2VQcmVmaXhOYXYnLCB1c2VQcmVmaXhOYXYpO1xuICB9XG5cbiAgdXNlUHJldmlld1RhYnMoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2RhdGEudXNlUHJldmlld1RhYnM7XG4gIH1cblxuICB1c2VQcmVmaXhOYXYoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2RhdGEudXNlUHJlZml4TmF2O1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMga25vd24gY2hpbGQga2V5cyBmb3IgdGhlIGdpdmVuIGBub2RlS2V5YCBidXQgZG9lcyBub3QgcXVldWUgYSBmZXRjaCBmb3IgbWlzc2luZ1xuICAgKiBjaGlsZHJlbiBsaWtlIGA6OmdldENoaWxkS2V5c2AuXG4gICAqL1xuICBnZXRDYWNoZWRDaGlsZEtleXMocm9vdEtleTogc3RyaW5nLCBub2RlS2V5OiBzdHJpbmcpOiBBcnJheTxzdHJpbmc+IHtcbiAgICByZXR1cm4gdGhpcy5fb21pdEhpZGRlblBhdGhzKHRoaXMuX2RhdGEuY2hpbGRLZXlNYXBbbm9kZUtleV0gfHwgW10pO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBub2RlIGNoaWxkIGtleXMgbWF5IGVpdGhlciBiZSAgYXZhaWxhYmxlIGltbWVkaWF0ZWx5IChjYWNoZWQpLCBvclxuICAgKiByZXF1aXJlIGFuIGFzeW5jIGZldGNoLiBJZiBhbGwgb2YgdGhlIGNoaWxkcmVuIGFyZSBuZWVkZWQgaXQncyBlYXNpZXIgdG9cbiAgICogcmV0dXJuIGFzIHByb21pc2UsIHRvIG1ha2UgdGhlIGNhbGxlciBvYmxpdmlvdXMgdG8gdGhlIHdheSBjaGlsZHJlbiB3ZXJlXG4gICAqIGZldGNoZWQuXG4gICAqL1xuICBwcm9taXNlTm9kZUNoaWxkS2V5cyhyb290S2V5OiBzdHJpbmcsIG5vZGVLZXk6IHN0cmluZyk6IFByb21pc2Uge1xuICAgIGNvbnN0IGNhY2hlZENoaWxkS2V5cyA9IHRoaXMuZ2V0Q2hpbGRLZXlzKHJvb3RLZXksIG5vZGVLZXkpO1xuICAgIGlmIChjYWNoZWRDaGlsZEtleXMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGNhY2hlZENoaWxkS2V5cyk7XG4gICAgfVxuXG4gICAgY29uc3QgcHJvbWlzZSA9IHRoaXMuX2dldExvYWRpbmcobm9kZUtleSkgfHwgUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgcmV0dXJuIHByb21pc2UudGhlbigoKSA9PiB0aGlzLmdldENhY2hlZENoaWxkS2V5cyhyb290S2V5LCBub2RlS2V5KSk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBrbm93biBjaGlsZCBrZXlzIGZvciB0aGUgZ2l2ZW4gYG5vZGVLZXlgIGFuZCBxdWV1ZXMgYSBmZXRjaCBpZiBjaGlsZHJlbiBhcmUgbWlzc2luZy5cbiAgICovXG4gIGdldENoaWxkS2V5cyhyb290S2V5OiBzdHJpbmcsIG5vZGVLZXk6IHN0cmluZyk6IEFycmF5PHN0cmluZz4ge1xuICAgIGNvbnN0IGNoaWxkS2V5cyA9IHRoaXMuX2RhdGEuY2hpbGRLZXlNYXBbbm9kZUtleV07XG4gICAgaWYgKGNoaWxkS2V5cyA9PSBudWxsIHx8IHRoaXMuX2RhdGEuaXNEaXJ0eU1hcFtub2RlS2V5XSkge1xuICAgICAgdGhpcy5fZmV0Y2hDaGlsZEtleXMobm9kZUtleSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8qXG4gICAgICAgKiBJZiBubyBkYXRhIG5lZWRzIHRvIGJlIGZldGNoZWQsIHdpcGUgb3V0IHRoZSBzY3JvbGxpbmcgc3RhdGUgYmVjYXVzZSBzdWJzZXF1ZW50IHVwZGF0ZXNcbiAgICAgICAqIHNob3VsZCBubyBsb25nZXIgc2Nyb2xsIHRoZSB0cmVlLiBUaGUgbm9kZSB3aWxsIGhhdmUgYWxyZWFkeSBiZWVuIGZsdXNoZWQgdG8gdGhlIHZpZXcgYW5kXG4gICAgICAgKiBzY3JvbGxlZCB0by5cbiAgICAgICAqL1xuICAgICAgdGhpcy5fY2hlY2tUcmFja2VkTm9kZSgpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fb21pdEhpZGRlblBhdGhzKGNoaWxkS2V5cyB8fCBbXSk7XG4gIH1cblxuICBnZXRTZWxlY3RlZEtleXMocm9vdEtleT86IHN0cmluZyk6IEltbXV0YWJsZS5PcmRlcmVkU2V0PHN0cmluZz4ge1xuICAgIGxldCBzZWxlY3RlZEtleXM7XG4gICAgaWYgKHJvb3RLZXkgPT0gbnVsbCkge1xuICAgICAgc2VsZWN0ZWRLZXlzID0gbmV3IEltbXV0YWJsZS5PcmRlcmVkU2V0KCk7XG4gICAgICBmb3IgKGNvbnN0IHJvb3QgaW4gdGhpcy5fZGF0YS5zZWxlY3RlZEtleXNCeVJvb3QpIHtcbiAgICAgICAgaWYgKHRoaXMuX2RhdGEuc2VsZWN0ZWRLZXlzQnlSb290Lmhhc093blByb3BlcnR5KHJvb3QpKSB7XG4gICAgICAgICAgc2VsZWN0ZWRLZXlzID0gc2VsZWN0ZWRLZXlzLm1lcmdlKHRoaXMuX2RhdGEuc2VsZWN0ZWRLZXlzQnlSb290W3Jvb3RdKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBJZiB0aGUgZ2l2ZW4gYHJvb3RLZXlgIGhhcyBubyBzZWxlY3RlZCBrZXlzLCBhc3NpZ24gYW4gZW1wdHkgc2V0IHRvIG1haW50YWluIGEgbm9uLW51bGxcbiAgICAgIC8vIHJldHVybiB2YWx1ZS5cbiAgICAgIHNlbGVjdGVkS2V5cyA9IHRoaXMuX2RhdGEuc2VsZWN0ZWRLZXlzQnlSb290W3Jvb3RLZXldIHx8IG5ldyBJbW11dGFibGUuT3JkZXJlZFNldCgpO1xuICAgIH1cbiAgICByZXR1cm4gc2VsZWN0ZWRLZXlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBsaXN0IG9mIHRoZSBub2RlcyB0aGF0IGFyZSBjdXJyZW50bHkgdmlzaWJsZS9leHBhbmRlZCBpbiB0aGUgZmlsZSB0cmVlLlxuICAgKlxuICAgKiBUaGlzIG1ldGhvZCByZXR1cm5zIGFuIGFycmF5IHN5bmNocm9ub3VzbHkgKHJhdGhlciB0aGFuIGFuIGl0ZXJhdG9yKSB0byBlbnN1cmUgdGhlIGNhbGxlclxuICAgKiBnZXRzIGEgY29uc2lzdGVudCBzbmFwc2hvdCBvZiB0aGUgY3VycmVudCBzdGF0ZSBvZiB0aGUgZmlsZSB0cmVlLlxuICAgKi9cbiAgZ2V0VmlzaWJsZU5vZGVzKHJvb3RLZXk6IHN0cmluZyk6IEFycmF5PEZpbGVUcmVlTm9kZT4ge1xuICAgIC8vIERvIHNvbWUgYmFzaWMgY2hlY2tzIHRvIGVuc3VyZSB0aGF0IHJvb3RLZXkgY29ycmVzcG9uZHMgdG8gYSByb290IGFuZCBpcyBleHBhbmRlZC4gSWYgbm90LFxuICAgIC8vIHJldHVybiB0aGUgYXBwcm9wcmlhdGUgYXJyYXkuXG4gICAgaWYgKCF0aGlzLmlzUm9vdEtleShyb290S2V5KSkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICBpZiAoIXRoaXMuaXNFeHBhbmRlZChyb290S2V5LCByb290S2V5KSkge1xuICAgICAgcmV0dXJuIFt0aGlzLmdldE5vZGUocm9vdEtleSwgcm9vdEtleSldO1xuICAgIH1cblxuICAgIC8vIE5vdGUgdGhhdCB3ZSBjb3VsZCBjYWNoZSB0aGUgdmlzaWJsZU5vZGVzIGFycmF5IHNvIHRoYXQgd2UgZG8gbm90IGhhdmUgdG8gY3JlYXRlIGl0IGZyb21cbiAgICAvLyBzY3JhdGNoIGVhY2ggdGltZSB0aGlzIGlzIGNhbGxlZCwgYnV0IGl0IGRvZXMgbm90IGFwcGVhciB0byBiZSBhIGJvdHRsZW5lY2sgYXQgcHJlc2VudC5cbiAgICBjb25zdCB2aXNpYmxlTm9kZXMgPSBbXTtcbiAgICBjb25zdCByb290S2V5c0ZvckRpcmVjdG9yaWVzVG9FeHBsb3JlID0gW3Jvb3RLZXldO1xuICAgIHdoaWxlIChyb290S2V5c0ZvckRpcmVjdG9yaWVzVG9FeHBsb3JlLmxlbmd0aCAhPT0gMCkge1xuICAgICAgY29uc3Qga2V5ID0gcm9vdEtleXNGb3JEaXJlY3Rvcmllc1RvRXhwbG9yZS5wb3AoKTtcbiAgICAgIHZpc2libGVOb2Rlcy5wdXNoKHRoaXMuZ2V0Tm9kZShrZXksIGtleSkpO1xuICAgICAgY29uc3QgY2hpbGRLZXlzID0gdGhpcy5fZGF0YS5jaGlsZEtleU1hcFtrZXldO1xuICAgICAgaWYgKGNoaWxkS2V5cyA9PSBudWxsIHx8IHRoaXMuX2RhdGEuaXNEaXJ0eU1hcFtrZXldKSB7XG4gICAgICAgIC8vIFRoaXMgaXMgd2hlcmUgZ2V0Q2hpbGRLZXlzKCkgd291bGQgZmV0Y2gsIGJ1dCB3ZSBkbyBub3Qgd2FudCB0byBkbyB0aGF0LlxuICAgICAgICAvLyBUT0RPOiBJZiBrZXkgaXMgaW4gaXNEaXJ0eU1hcCwgdGhlbiByZXRyeSB3aGVuIGl0IGlzIG5vdCBkaXJ0eT9cbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGZvciAoY29uc3QgY2hpbGRLZXkgb2YgY2hpbGRLZXlzKSB7XG4gICAgICAgIGlmIChGaWxlVHJlZUhlbHBlcnMuaXNEaXJLZXkoY2hpbGRLZXkpKSB7XG4gICAgICAgICAgaWYgKHRoaXMuaXNFeHBhbmRlZChyb290S2V5LCBrZXkpKSB7XG4gICAgICAgICAgICByb290S2V5c0ZvckRpcmVjdG9yaWVzVG9FeHBsb3JlLnB1c2goY2hpbGRLZXkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2aXNpYmxlTm9kZXMucHVzaCh0aGlzLmdldE5vZGUoa2V5LCBjaGlsZEtleSkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB2aXNpYmxlTm9kZXM7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhbGwgc2VsZWN0ZWQgbm9kZXMgYWNyb3NzIGFsbCByb290cyBpbiB0aGUgdHJlZS5cbiAgICovXG4gIGdldFNlbGVjdGVkTm9kZXMoKTogSW1tdXRhYmxlLk9yZGVyZWRTZXQ8RmlsZVRyZWVOb2RlPiB7XG4gICAgbGV0IHNlbGVjdGVkTm9kZXMgPSBuZXcgSW1tdXRhYmxlLk9yZGVyZWRTZXQoKTtcbiAgICB0aGlzLl9kYXRhLnJvb3RLZXlzLmZvckVhY2gocm9vdEtleSA9PiB7XG4gICAgICB0aGlzLmdldFNlbGVjdGVkS2V5cyhyb290S2V5KS5mb3JFYWNoKG5vZGVLZXkgPT4ge1xuICAgICAgICBzZWxlY3RlZE5vZGVzID0gc2VsZWN0ZWROb2Rlcy5hZGQodGhpcy5nZXROb2RlKHJvb3RLZXksIG5vZGVLZXkpKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIHJldHVybiBzZWxlY3RlZE5vZGVzO1xuICB9XG5cbiAgZ2V0U2luZ2xlU2VsZWN0ZWROb2RlKCk6ID9GaWxlVHJlZU5vZGUge1xuICAgIGNvbnN0IHNlbGVjdGVkUm9vdHMgPSBPYmplY3Qua2V5cyh0aGlzLl9kYXRhLnNlbGVjdGVkS2V5c0J5Um9vdCk7XG4gICAgaWYgKHNlbGVjdGVkUm9vdHMubGVuZ3RoICE9PSAxKSB7XG4gICAgICAvLyBUaGVyZSBpcyBtb3JlIHRoYW4gb25lIHJvb3Qgd2l0aCBzZWxlY3RlZCBub2Rlcy4gTm8gYnVlbm8uXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3Qgcm9vdEtleSA9IHNlbGVjdGVkUm9vdHNbMF07XG4gICAgY29uc3Qgc2VsZWN0ZWRLZXlzID0gdGhpcy5nZXRTZWxlY3RlZEtleXMocm9vdEtleSk7XG4gICAgLypcbiAgICAgKiBOb3RlOiBUaGlzIGRvZXMgbm90IGNhbGwgYGdldFNlbGVjdGVkTm9kZXNgIHRvIHByZXZlbnQgY3JlYXRpbmcgbm9kZXMgdGhhdCB3b3VsZCBiZSB0aHJvd25cbiAgICAgKiBhd2F5IGlmIHRoZXJlIGlzIG1vcmUgdGhhbiAxIHNlbGVjdGVkIG5vZGUuXG4gICAgICovXG4gICAgcmV0dXJuIChzZWxlY3RlZEtleXMuc2l6ZSA9PT0gMSkgPyB0aGlzLmdldE5vZGUocm9vdEtleSwgc2VsZWN0ZWRLZXlzLmZpcnN0KCkpIDogbnVsbDtcbiAgfVxuXG4gIGdldFJvb3ROb2RlKHJvb3RLZXk6IHN0cmluZyk6IEZpbGVUcmVlTm9kZSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0Tm9kZShyb290S2V5LCByb290S2V5KTtcbiAgfVxuXG4gIGdldE5vZGUocm9vdEtleTogc3RyaW5nLCBub2RlS2V5OiBzdHJpbmcpOiBGaWxlVHJlZU5vZGUge1xuICAgIHJldHVybiBuZXcgRmlsZVRyZWVOb2RlKHRoaXMsIHJvb3RLZXksIG5vZGVLZXkpO1xuICB9XG5cbiAgaXNFZGl0aW5nV29ya2luZ1NldCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fZGF0YS5pc0VkaXRpbmdXb3JraW5nU2V0O1xuICB9XG5cbiAgZ2V0RWRpdGVkV29ya2luZ1NldCgpOiBXb3JraW5nU2V0IHtcbiAgICByZXR1cm4gdGhpcy5fZGF0YS5lZGl0ZWRXb3JraW5nU2V0O1xuICB9XG5cbiAgX3NldEVkaXRlZFdvcmtpbmdTZXQoZWRpdGVkV29ya2luZ1NldDogV29ya2luZ1NldCk6IHZvaWQge1xuICAgIHRoaXMuX3NldCgnZWRpdGVkV29ya2luZ1NldCcsIGVkaXRlZFdvcmtpbmdTZXQpO1xuICB9XG5cbiAgLyoqXG4gICAqIElmIGEgZmV0Y2ggaXMgbm90IGFscmVhZHkgaW4gcHJvZ3Jlc3MgaW5pdGlhdGUgYSBmZXRjaCBub3cuXG4gICAqL1xuICBfZmV0Y2hDaGlsZEtleXMobm9kZUtleTogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgZXhpc3RpbmdQcm9taXNlID0gdGhpcy5fZ2V0TG9hZGluZyhub2RlS2V5KTtcbiAgICBpZiAoZXhpc3RpbmdQcm9taXNlKSB7XG4gICAgICByZXR1cm4gZXhpc3RpbmdQcm9taXNlO1xuICAgIH1cblxuICAgIGNvbnN0IHByb21pc2UgPSBGaWxlVHJlZUhlbHBlcnMuZmV0Y2hDaGlsZHJlbihub2RlS2V5KS5jYXRjaChlcnJvciA9PiB7XG4gICAgICB0aGlzLl9sb2dnZXIuZXJyb3IoYFVuYWJsZSB0byBmZXRjaCBjaGlsZHJlbiBmb3IgXCIke25vZGVLZXl9XCIuYCk7XG4gICAgICB0aGlzLl9sb2dnZXIuZXJyb3IoJ09yaWdpbmFsIGVycm9yOiAnLCBlcnJvcik7XG4gICAgICAvLyBDb2xsYXBzZSB0aGUgbm9kZSBhbmQgY2xlYXIgaXRzIGxvYWRpbmcgc3RhdGUgb24gZXJyb3Igc28gdGhlIHVzZXIgY2FuIHJldHJ5IGV4cGFuZGluZyBpdC5cbiAgICAgIGNvbnN0IHJvb3RLZXkgPSB0aGlzLmdldFJvb3RGb3JLZXkobm9kZUtleSk7XG4gICAgICBpZiAocm9vdEtleSAhPSBudWxsKSB7XG4gICAgICAgIHRoaXMuX2NvbGxhcHNlTm9kZShyb290S2V5LCBub2RlS2V5KTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX2NsZWFyTG9hZGluZyhub2RlS2V5KTtcbiAgICB9KS50aGVuKGNoaWxkS2V5cyA9PiB7XG4gICAgICAvLyBJZiB0aGlzIG5vZGUncyByb290IHdlbnQgYXdheSB3aGlsZSB0aGUgUHJvbWlzZSB3YXMgcmVzb2x2aW5nLCBkbyBubyBtb3JlIHdvcmsuIFRoaXMgbm9kZVxuICAgICAgLy8gaXMgbm8gbG9uZ2VyIG5lZWRlZCBpbiB0aGUgc3RvcmUuXG4gICAgICBpZiAodGhpcy5nZXRSb290Rm9yS2V5KG5vZGVLZXkpID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGhpcy5fc2V0Q2hpbGRLZXlzKG5vZGVLZXksIGNoaWxkS2V5cyk7XG4gICAgICB0aGlzLl9hZGRTdWJzY3JpcHRpb24obm9kZUtleSk7XG4gICAgICB0aGlzLl9jbGVhckxvYWRpbmcobm9kZUtleSk7XG4gICAgfSk7XG5cbiAgICB0aGlzLl9zZXRMb2FkaW5nKG5vZGVLZXksIHByb21pc2UpO1xuICAgIHJldHVybiBwcm9taXNlO1xuICB9XG5cbiAgX2dldExvYWRpbmcobm9kZUtleTogc3RyaW5nKTogP1Byb21pc2Uge1xuICAgIHJldHVybiB0aGlzLl9kYXRhLmlzTG9hZGluZ01hcFtub2RlS2V5XTtcbiAgfVxuXG4gIF9zZXRMb2FkaW5nKG5vZGVLZXk6IHN0cmluZywgdmFsdWU6IFByb21pc2UpOiB2b2lkIHtcbiAgICB0aGlzLl9zZXQoJ2lzTG9hZGluZ01hcCcsIHNldFByb3BlcnR5KHRoaXMuX2RhdGEuaXNMb2FkaW5nTWFwLCBub2RlS2V5LCB2YWx1ZSkpO1xuICB9XG5cbiAgaXNDd2Qobm9kZUtleTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIG5vZGVLZXkgPT09IHRoaXMuX2RhdGEuY3dkS2V5O1xuICB9XG5cbiAgaGFzQ3dkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9kYXRhLmN3ZEtleSAhPSBudWxsO1xuICB9XG5cbiAgX3NldEN3ZEtleShyb290S2V5OiA/c3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5fc2V0KCdjd2RLZXknLCByb290S2V5KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXNldHMgdGhlIG5vZGUgdG8gYmUga2VwdCBpbiB2aWV3IGlmIG5vIG1vcmUgZGF0YSBpcyBiZWluZyBhd2FpdGVkLiBTYWZlIHRvIGNhbGwgbWFueSB0aW1lc1xuICAgKiBiZWNhdXNlIGl0IG9ubHkgY2hhbmdlcyBzdGF0ZSBpZiBhIG5vZGUgaXMgYmVpbmcgdHJhY2tlZC5cbiAgICovXG4gIF9jaGVja1RyYWNrZWROb2RlKCk6IHZvaWQge1xuICAgIGlmIChcbiAgICAgIHRoaXMuX2RhdGEudHJhY2tlZE5vZGUgIT0gbnVsbCAmJlxuICAgICAgLypcbiAgICAgICAqIFRoZSBsb2FkaW5nIG1hcCBiZWluZyBlbXB0eSBpcyBhIGhldXJpc3RpYyBmb3Igd2hlbiBsb2FkaW5nIGhhcyBjb21wbGV0ZWQuIEl0IGlzIGluZXhhY3RcbiAgICAgICAqIGJlY2F1c2UgdGhlIGxvYWRpbmcgbWlnaHQgYmUgdW5yZWxhdGVkIHRvIHRoZSB0cmFja2VkIG5vZGUsIGhvd2V2ZXIgaXQgaXMgY2hlYXAgYW5kIGZhbHNlXG4gICAgICAgKiBwb3NpdGl2ZXMgd2lsbCBvbmx5IGxhc3QgdW50aWwgbG9hZGluZyBpcyBjb21wbGV0ZSBvciB1bnRpbCB0aGUgdXNlciBjbGlja3MgYW5vdGhlciBub2RlIGluXG4gICAgICAgKiB0aGUgdHJlZS5cbiAgICAgICAqL1xuICAgICAgb2JqZWN0VXRpbC5pc0VtcHR5KHRoaXMuX2RhdGEuaXNMb2FkaW5nTWFwKVxuICAgICkge1xuICAgICAgLy8gTG9hZGluZyBoYXMgY29tcGxldGVkLiBBbGxvdyBzY3JvbGxpbmcgdG8gcHJvY2VlZCBhcyB1c3VhbC5cbiAgICAgIHRoaXMuX3NldCgndHJhY2tlZE5vZGUnLCBudWxsKTtcbiAgICB9XG4gIH1cblxuICBfY2xlYXJMb2FkaW5nKG5vZGVLZXk6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuX3NldCgnaXNMb2FkaW5nTWFwJywgZGVsZXRlUHJvcGVydHkodGhpcy5fZGF0YS5pc0xvYWRpbmdNYXAsIG5vZGVLZXkpKTtcbiAgICB0aGlzLl9jaGVja1RyYWNrZWROb2RlKCk7XG4gIH1cblxuICBhc3luYyBfZGVsZXRlU2VsZWN0ZWROb2RlcygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBzZWxlY3RlZE5vZGVzID0gdGhpcy5nZXRTZWxlY3RlZE5vZGVzKCk7XG4gICAgYXdhaXQgUHJvbWlzZS5hbGwoc2VsZWN0ZWROb2Rlcy5tYXAoYXN5bmMgbm9kZSA9PiB7XG4gICAgICBjb25zdCBmaWxlID0gRmlsZVRyZWVIZWxwZXJzLmdldEZpbGVCeUtleShub2RlLm5vZGVLZXkpO1xuICAgICAgaWYgKGZpbGUgPT0gbnVsbCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjb25zdCByZXBvc2l0b3J5ID0gcmVwb3NpdG9yeUZvclBhdGgoZmlsZS5nZXRQYXRoKCkpO1xuICAgICAgaWYgKHJlcG9zaXRvcnkgIT0gbnVsbCAmJiByZXBvc2l0b3J5LmdldFR5cGUoKSA9PT0gJ2hnJykge1xuICAgICAgICBjb25zdCBoZ1JlcG9zaXRvcnkgPSAoKHJlcG9zaXRvcnk6IGFueSk6IEhnUmVwb3NpdG9yeUNsaWVudCk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgYXdhaXQgaGdSZXBvc2l0b3J5LnJlbW92ZShmaWxlLmdldFBhdGgoKSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICBjb25zdCBzdGF0dXNlcyA9IGF3YWl0IGhnUmVwb3NpdG9yeS5nZXRTdGF0dXNlcyhbZmlsZS5nZXRQYXRoKCldKTtcbiAgICAgICAgICBjb25zdCBwYXRoU3RhdHVzID0gc3RhdHVzZXMuZ2V0KGZpbGUuZ2V0UGF0aCgpKTtcbiAgICAgICAgICBpZiAocGF0aFN0YXR1cyAhPT0gU3RhdHVzQ29kZU51bWJlci5VTlRSQUNLRUQpIHtcbiAgICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihcbiAgICAgICAgICAgICAgJ0ZhaWxlZCB0byByZW1vdmUgJyArIGZpbGUuZ2V0UGF0aCgpICsgJyBmcm9tIHZlcnNpb24gY29udHJvbC4gIFRoZSBmaWxlIHdpbGwgJyArXG4gICAgICAgICAgICAgICdzdGlsbCBnZXQgZGVsZXRlZCBidXQgeW91IHdpbGwgaGF2ZSB0byByZW1vdmUgaXQgZnJvbSB5b3VyIFZDUyB5b3Vyc2VsZi4gIEVycm9yOiAnICtcbiAgICAgICAgICAgICAgZS50b1N0cmluZygpLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChGaWxlVHJlZUhlbHBlcnMuaXNMb2NhbEZpbGUoZmlsZSkpIHtcbiAgICAgICAgLy8gVE9ETzogVGhpcyBzcGVjaWFsLWNhc2UgY2FuIGJlIGVsaW1pbmF0ZWQgb25jZSBgZGVsZXRlKClgIGlzIGFkZGVkIHRvIGBEaXJlY3RvcnlgXG4gICAgICAgIC8vIGFuZCBgRmlsZWAuXG4gICAgICAgIHNoZWxsLm1vdmVJdGVtVG9UcmFzaChub2RlLm5vZGVQYXRoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IHJlbW90ZUZpbGUgPSAoKGZpbGU6IGFueSk6IChSZW1vdGVEaXJlY3RvcnkgfCBSZW1vdGVGaWxlKSk7XG4gICAgICAgIGF3YWl0IHJlbW90ZUZpbGUuZGVsZXRlKCk7XG4gICAgICB9XG4gICAgfSkpO1xuICB9XG5cbiAgX2V4cGFuZE5vZGUocm9vdEtleTogc3RyaW5nLCBub2RlS2V5OiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLl9zZXRFeHBhbmRlZEtleXMocm9vdEtleSwgdGhpcy5fZ2V0RXhwYW5kZWRLZXlzKHJvb3RLZXkpLmFkZChub2RlS2V5KSk7XG4gICAgLy8gSWYgd2UgaGF2ZSBjaGlsZCBub2RlcyB0aGF0IHNob3VsZCBhbHNvIGJlIGV4cGFuZGVkLCBleHBhbmQgdGhlbSBub3cuXG4gICAgbGV0IHByZXZpb3VzbHlFeHBhbmRlZCA9IHRoaXMuX2dldFByZXZpb3VzbHlFeHBhbmRlZChyb290S2V5KTtcbiAgICBpZiAocHJldmlvdXNseUV4cGFuZGVkLmhhcyhub2RlS2V5KSkge1xuICAgICAgZm9yIChjb25zdCBjaGlsZEtleSBvZiBwcmV2aW91c2x5RXhwYW5kZWQuZ2V0KG5vZGVLZXkpKSB7XG4gICAgICAgIHRoaXMuX2V4cGFuZE5vZGUocm9vdEtleSwgY2hpbGRLZXkpO1xuICAgICAgfVxuICAgICAgLy8gQ2xlYXIgdGhlIHByZXZpb3VzbHlFeHBhbmRlZCBsaXN0IHNpbmNlIHdlJ3JlIGRvbmUgd2l0aCBpdC5cbiAgICAgIHByZXZpb3VzbHlFeHBhbmRlZCA9IHByZXZpb3VzbHlFeHBhbmRlZC5kZWxldGUobm9kZUtleSk7XG4gICAgICB0aGlzLl9zZXRQcmV2aW91c2x5RXhwYW5kZWQocm9vdEtleSwgcHJldmlvdXNseUV4cGFuZGVkKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUGVyZm9ybWVzIGEgZGVlcCBCRlMgc2Nhbm5pbmcgZXhwYW5kIG9mIGNvbnRhaW5lZCBub2Rlcy5cbiAgICogcmV0dXJucyAtIGEgcHJvbWlzZSBmdWxmaWxsZWQgd2hlbiB0aGUgZXhwYW5kIG9wZXJhdGlvbiBpcyBmaW5pc2hlZFxuICAgKi9cbiAgX2V4cGFuZE5vZGVEZWVwKHJvb3RLZXk6IHN0cmluZywgbm9kZUtleTogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgLy8gU3RvcCB0aGUgdHJhdmVyc2FsIGFmdGVyIDEwMCBub2RlcyB3ZXJlIGFkZGVkIHRvIHRoZSB0cmVlXG4gICAgY29uc3QgaXROb2RlcyA9IG5ldyBGaWxlVHJlZVN0b3JlQmZzSXRlcmF0b3IodGhpcywgcm9vdEtleSwgbm9kZUtleSwgLyogbGltaXQqLyAxMDApO1xuICAgIGNvbnN0IHByb21pc2UgPSBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgIGNvbnN0IGV4cGFuZCA9ICgpID0+IHtcbiAgICAgICAgY29uc3QgdHJhdmVyc2VkTm9kZUtleSA9IGl0Tm9kZXMudHJhdmVyc2VkTm9kZSgpO1xuICAgICAgICBpZiAodHJhdmVyc2VkTm9kZUtleSkge1xuICAgICAgICAgIHRoaXMuX3NldEV4cGFuZGVkS2V5cyhyb290S2V5LCB0aGlzLl9nZXRFeHBhbmRlZEtleXMocm9vdEtleSkuYWRkKHRyYXZlcnNlZE5vZGVLZXkpKTtcbiAgICAgICAgICAvKipcbiAgICAgICAgICAgKiBFdmVuIGlmIHRoZXJlIHdlcmUgcHJldmlvdXNseSBleHBhbmRlZCBub2RlcyBpdCBkb2Vzbid0IG1hdHRlciBhc1xuICAgICAgICAgICAqIHdlJ2xsIGV4cGFuZCBhbGwgb2YgdGhlIGNoaWxkcmVuLlxuICAgICAgICAgICAqL1xuICAgICAgICAgIGxldCBwcmV2aW91c2x5RXhwYW5kZWQgPSB0aGlzLl9nZXRQcmV2aW91c2x5RXhwYW5kZWQocm9vdEtleSk7XG4gICAgICAgICAgcHJldmlvdXNseUV4cGFuZGVkID0gcHJldmlvdXNseUV4cGFuZGVkLmRlbGV0ZSh0cmF2ZXJzZWROb2RlS2V5KTtcbiAgICAgICAgICB0aGlzLl9zZXRQcmV2aW91c2x5RXhwYW5kZWQocm9vdEtleSwgcHJldmlvdXNseUV4cGFuZGVkKTtcblxuICAgICAgICAgIGNvbnN0IG5leHRQcm9taXNlID0gaXROb2Rlcy5uZXh0KCk7XG4gICAgICAgICAgaWYgKG5leHRQcm9taXNlKSB7XG4gICAgICAgICAgICBuZXh0UHJvbWlzZS50aGVuKGV4cGFuZCk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgZXhwYW5kKCk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gcHJvbWlzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBXaGVuIHdlIGNvbGxhcHNlIGEgbm9kZSB3ZSBuZWVkIHRvIGRvIHNvbWUgY2xlYW51cCByZW1vdmluZyBzdWJzY3JpcHRpb25zIGFuZCBzZWxlY3Rpb24uXG4gICAqL1xuICBfY29sbGFwc2VOb2RlKHJvb3RLZXk6IHN0cmluZywgbm9kZUtleTogc3RyaW5nKTogdm9pZCB7XG4gICAgY29uc3QgY2hpbGRLZXlzID0gdGhpcy5fZGF0YS5jaGlsZEtleU1hcFtub2RlS2V5XTtcbiAgICBsZXQgc2VsZWN0ZWRLZXlzID0gdGhpcy5fZGF0YS5zZWxlY3RlZEtleXNCeVJvb3Rbcm9vdEtleV07XG4gICAgY29uc3QgZXhwYW5kZWRDaGlsZEtleXMgPSBbXTtcbiAgICBpZiAoY2hpbGRLZXlzKSB7XG4gICAgICBjaGlsZEtleXMuZm9yRWFjaChjaGlsZEtleSA9PiB7XG4gICAgICAgIC8vIFVuc2VsZWN0IGVhY2ggY2hpbGQuXG4gICAgICAgIGlmIChzZWxlY3RlZEtleXMgJiYgc2VsZWN0ZWRLZXlzLmhhcyhjaGlsZEtleSkpIHtcbiAgICAgICAgICBzZWxlY3RlZEtleXMgPSBzZWxlY3RlZEtleXMuZGVsZXRlKGNoaWxkS2V5KTtcbiAgICAgICAgICAvKlxuICAgICAgICAgICAqIFNldCB0aGUgc2VsZWN0ZWQga2V5cyAqYmVmb3JlKiB0aGUgcmVjdXJzaXZlIGBfY29sbGFwc2VOb2RlYCBjYWxsIHNvIGVhY2ggY2FsbCBzdG9yZXNcbiAgICAgICAgICAgKiBpdHMgY2hhbmdlcyBhbmQgaXNuJ3Qgd2lwZWQgb3V0IGJ5IHRoZSBuZXh0IGNhbGwgYnkga2VlcGluZyBhbiBvdXRkYXRlZCBgc2VsZWN0ZWRLZXlzYFxuICAgICAgICAgICAqIGluIHRoZSBjYWxsIHN0YWNrLlxuICAgICAgICAgICAqL1xuICAgICAgICAgIHRoaXMuX3NldFNlbGVjdGVkS2V5cyhyb290S2V5LCBzZWxlY3RlZEtleXMpO1xuICAgICAgICB9XG4gICAgICAgIC8vIENvbGxhcHNlIGVhY2ggY2hpbGQgZGlyZWN0b3J5LlxuICAgICAgICBpZiAoRmlsZVRyZWVIZWxwZXJzLmlzRGlyS2V5KGNoaWxkS2V5KSkge1xuICAgICAgICAgIGlmICh0aGlzLmlzRXhwYW5kZWQocm9vdEtleSwgY2hpbGRLZXkpKSB7XG4gICAgICAgICAgICBleHBhbmRlZENoaWxkS2V5cy5wdXNoKGNoaWxkS2V5KTtcbiAgICAgICAgICAgIHRoaXMuX2NvbGxhcHNlTm9kZShyb290S2V5LCBjaGlsZEtleSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gICAgLypcbiAgICAgKiBTYXZlIHRoZSBsaXN0IG9mIGV4cGFuZGVkIGNoaWxkIG5vZGVzIHNvIG5leHQgdGltZSB3ZSBleHBhbmQgdGhpcyBub2RlIHdlIGNhbiBleHBhbmQgdGhlc2VcbiAgICAgKiBjaGlsZHJlbi5cbiAgICAgKi9cbiAgICBsZXQgcHJldmlvdXNseUV4cGFuZGVkID0gdGhpcy5fZ2V0UHJldmlvdXNseUV4cGFuZGVkKHJvb3RLZXkpO1xuICAgIGlmIChleHBhbmRlZENoaWxkS2V5cy5sZW5ndGggIT09IDApIHtcbiAgICAgIHByZXZpb3VzbHlFeHBhbmRlZCA9IHByZXZpb3VzbHlFeHBhbmRlZC5zZXQobm9kZUtleSwgZXhwYW5kZWRDaGlsZEtleXMpO1xuICAgIH0gZWxzZSB7XG4gICAgICBwcmV2aW91c2x5RXhwYW5kZWQgPSBwcmV2aW91c2x5RXhwYW5kZWQuZGVsZXRlKG5vZGVLZXkpO1xuICAgIH1cbiAgICB0aGlzLl9zZXRQcmV2aW91c2x5RXhwYW5kZWQocm9vdEtleSwgcHJldmlvdXNseUV4cGFuZGVkKTtcbiAgICB0aGlzLl9zZXRFeHBhbmRlZEtleXMocm9vdEtleSwgdGhpcy5fZ2V0RXhwYW5kZWRLZXlzKHJvb3RLZXkpLmRlbGV0ZShub2RlS2V5KSk7XG4gICAgdGhpcy5fcmVtb3ZlU3Vic2NyaXB0aW9uKHJvb3RLZXksIG5vZGVLZXkpO1xuICB9XG5cbiAgX2dldFByZXZpb3VzbHlFeHBhbmRlZChyb290S2V5OiBzdHJpbmcpOiBJbW11dGFibGUuTWFwPHN0cmluZywgQXJyYXk8c3RyaW5nPj4ge1xuICAgIHJldHVybiB0aGlzLl9kYXRhLnByZXZpb3VzbHlFeHBhbmRlZFtyb290S2V5XSB8fCBuZXcgSW1tdXRhYmxlLk1hcCgpO1xuICB9XG5cbiAgX3NldFByZXZpb3VzbHlFeHBhbmRlZChyb290S2V5OiBzdHJpbmcsXG4gICAgcHJldmlvdXNseUV4cGFuZGVkOiBJbW11dGFibGUuTWFwPHN0cmluZywgQXJyYXk8c3RyaW5nPj4pOiB2b2lkIHtcbiAgICB0aGlzLl9zZXQoXG4gICAgICAncHJldmlvdXNseUV4cGFuZGVkJyxcbiAgICAgIHNldFByb3BlcnR5KHRoaXMuX2RhdGEucHJldmlvdXNseUV4cGFuZGVkLCByb290S2V5LCBwcmV2aW91c2x5RXhwYW5kZWQpXG4gICAgKTtcbiAgfVxuXG4gIF9nZXRFeHBhbmRlZEtleXMocm9vdEtleTogc3RyaW5nKTogSW1tdXRhYmxlLlNldDxzdHJpbmc+IHtcbiAgICByZXR1cm4gdGhpcy5fZGF0YS5leHBhbmRlZEtleXNCeVJvb3Rbcm9vdEtleV0gfHwgbmV3IEltbXV0YWJsZS5TZXQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIGlzIGp1c3QgZXhwb3NlZCBzbyBpdCBjYW4gYmUgbW9ja2VkIGluIHRoZSB0ZXN0cy4gTm90IGlkZWFsLCBidXQgYSBsb3QgbGVzcyBtZXNzeSB0aGFuIHRoZVxuICAgKiBhbHRlcm5hdGl2ZXMuIEZvciBleGFtcGxlLCBwYXNzaW5nIG9wdGlvbnMgd2hlbiBjb25zdHJ1Y3RpbmcgYW4gaW5zdGFuY2Ugb2YgYSBzaW5nbGV0b24gd291bGRcbiAgICogbWFrZSBmdXR1cmUgaW52b2NhdGlvbnMgb2YgYGdldEluc3RhbmNlYCB1bnByZWRpY3RhYmxlLlxuICAgKi9cbiAgX3JlcG9zaXRvcnlGb3JQYXRoKHBhdGg6IE51Y2xpZGVVcmkpOiA/YXRvbSRSZXBvc2l0b3J5IHtcbiAgICByZXR1cm4gdGhpcy5nZXRSZXBvc2l0b3JpZXMoKS5maW5kKHJlcG8gPT4gcmVwb3NpdG9yeUNvbnRhaW5zUGF0aChyZXBvLCBwYXRoKSk7XG4gIH1cblxuICBfc2V0RXhwYW5kZWRLZXlzKHJvb3RLZXk6IHN0cmluZywgZXhwYW5kZWRLZXlzOiBJbW11dGFibGUuU2V0PHN0cmluZz4pOiB2b2lkIHtcbiAgICB0aGlzLl9zZXQoXG4gICAgICAnZXhwYW5kZWRLZXlzQnlSb290JyxcbiAgICAgIHNldFByb3BlcnR5KHRoaXMuX2RhdGEuZXhwYW5kZWRLZXlzQnlSb290LCByb290S2V5LCBleHBhbmRlZEtleXMpXG4gICAgKTtcbiAgfVxuXG4gIF9kZWxldGVTZWxlY3RlZEtleXMocm9vdEtleTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5fc2V0KCdzZWxlY3RlZEtleXNCeVJvb3QnLCBkZWxldGVQcm9wZXJ0eSh0aGlzLl9kYXRhLnNlbGVjdGVkS2V5c0J5Um9vdCwgcm9vdEtleSkpO1xuICB9XG5cbiAgX3NldFNlbGVjdGVkS2V5cyhyb290S2V5OiBzdHJpbmcsIHNlbGVjdGVkS2V5czogSW1tdXRhYmxlLk9yZGVyZWRTZXQ8c3RyaW5nPik6IHZvaWQge1xuICAgIC8qXG4gICAgICogTmV3IHNlbGVjdGlvbiBtZWFucyBwcmV2aW91cyBub2RlIHNob3VsZCBub3QgYmUga2VwdCBpbiB2aWV3LiBEbyB0aGlzIHdpdGhvdXQgZGUtYm91bmNpbmdcbiAgICAgKiBiZWNhdXNlIHRoZSBwcmV2aW91cyBzdGF0ZSBpcyBpcnJlbGV2YW50LiBJZiB0aGUgdXNlciBjaG9zZSBhIG5ldyBzZWxlY3Rpb24sIHRoZSBwcmV2aW91cyBvbmVcbiAgICAgKiBzaG91bGQgbm90IGJlIHNjcm9sbGVkIGludG8gdmlldy5cbiAgICAgKi9cbiAgICB0aGlzLl9zZXQoJ3RyYWNrZWROb2RlJywgbnVsbCk7XG4gICAgdGhpcy5fc2V0KFxuICAgICAgJ3NlbGVjdGVkS2V5c0J5Um9vdCcsXG4gICAgICBzZXRQcm9wZXJ0eSh0aGlzLl9kYXRhLnNlbGVjdGVkS2V5c0J5Um9vdCwgcm9vdEtleSwgc2VsZWN0ZWRLZXlzKVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgc2VsZWN0ZWQga2V5cyBpbiBhbGwgcm9vdHMgb2YgdGhlIHRyZWUuIFRoZSBzZWxlY3RlZCBrZXlzIG9mIHJvb3Qga2V5cyBub3QgaW5cbiAgICogYHNlbGVjdGVkS2V5c0J5Um9vdGAgYXJlIGRlbGV0ZWQgKHRoZSByb290IGlzIGxlZnQgd2l0aCBubyBzZWxlY3Rpb24pLlxuICAgKi9cbiAgX3NldFNlbGVjdGVkS2V5c0J5Um9vdChzZWxlY3RlZEtleXNCeVJvb3Q6IHtba2V5OiBzdHJpbmddOiBJbW11dGFibGUuT3JkZXJlZFNldDxzdHJpbmc+fSk6IHZvaWQge1xuICAgIHRoaXMuZ2V0Um9vdEtleXMoKS5mb3JFYWNoKHJvb3RLZXkgPT4ge1xuICAgICAgaWYgKHNlbGVjdGVkS2V5c0J5Um9vdC5oYXNPd25Qcm9wZXJ0eShyb290S2V5KSkge1xuICAgICAgICB0aGlzLl9zZXRTZWxlY3RlZEtleXMocm9vdEtleSwgc2VsZWN0ZWRLZXlzQnlSb290W3Jvb3RLZXldKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX2RlbGV0ZVNlbGVjdGVkS2V5cyhyb290S2V5KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIF9zZXRSb290S2V5cyhyb290S2V5czogQXJyYXk8c3RyaW5nPik6IHZvaWQge1xuICAgIGNvbnN0IG9sZFJvb3RLZXlzID0gdGhpcy5fZGF0YS5yb290S2V5cztcbiAgICBjb25zdCBuZXdSb290S2V5cyA9IG5ldyBJbW11dGFibGUuU2V0KHJvb3RLZXlzKTtcbiAgICBjb25zdCByZW1vdmVkUm9vdEtleXMgPSBuZXcgSW1tdXRhYmxlLlNldChvbGRSb290S2V5cykuc3VidHJhY3QobmV3Um9vdEtleXMpO1xuICAgIHJlbW92ZWRSb290S2V5cy5mb3JFYWNoKHRoaXMuX3B1cmdlUm9vdC5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLl9zZXQoJ3Jvb3RLZXlzJywgcm9vdEtleXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgYSBzaW5nbGUgY2hpbGQgbm9kZS4gSXQncyB1c2VmdWwgd2hlbiBleHBhbmRpbmcgdG8gYSBkZWVwbHkgbmVzdGVkIG5vZGUuXG4gICAqL1xuICBfY3JlYXRlQ2hpbGQobm9kZUtleTogc3RyaW5nLCBjaGlsZEtleTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5fc2V0Q2hpbGRLZXlzKG5vZGVLZXksIFtjaGlsZEtleV0pO1xuICAgIC8qXG4gICAgICogTWFyayB0aGUgbm9kZSBhcyBkaXJ0eSBzbyBpdHMgYW5jZXN0b3JzIGFyZSBmZXRjaGVkIGFnYWluIG9uIHJlbG9hZCBvZiB0aGUgdHJlZS5cbiAgICAgKi9cbiAgICB0aGlzLl9zZXQoJ2lzRGlydHlNYXAnLCBzZXRQcm9wZXJ0eSh0aGlzLl9kYXRhLmlzRGlydHlNYXAsIG5vZGVLZXksIHRydWUpKTtcbiAgfVxuXG4gIF9zZXRDaGlsZEtleXMobm9kZUtleTogc3RyaW5nLCBjaGlsZEtleXM6IEFycmF5PHN0cmluZz4pOiB2b2lkIHtcbiAgICBjb25zdCBvbGRDaGlsZEtleXMgPSB0aGlzLl9kYXRhLmNoaWxkS2V5TWFwW25vZGVLZXldO1xuICAgIGlmIChvbGRDaGlsZEtleXMpIHtcbiAgICAgIGNvbnN0IG5ld0NoaWxkS2V5cyA9IG5ldyBJbW11dGFibGUuU2V0KGNoaWxkS2V5cyk7XG4gICAgICBjb25zdCByZW1vdmVkRGlyZWN0b3J5S2V5cyA9IG5ldyBJbW11dGFibGUuU2V0KG9sZENoaWxkS2V5cylcbiAgICAgICAgLnN1YnRyYWN0KG5ld0NoaWxkS2V5cylcbiAgICAgICAgLmZpbHRlcihGaWxlVHJlZUhlbHBlcnMuaXNEaXJLZXkpO1xuICAgICAgcmVtb3ZlZERpcmVjdG9yeUtleXMuZm9yRWFjaCh0aGlzLl9wdXJnZURpcmVjdG9yeS5iaW5kKHRoaXMpKTtcbiAgICB9XG4gICAgdGhpcy5fc2V0KCdjaGlsZEtleU1hcCcsIHNldFByb3BlcnR5KHRoaXMuX2RhdGEuY2hpbGRLZXlNYXAsIG5vZGVLZXksIGNoaWxkS2V5cykpO1xuICB9XG5cbiAgX29uRGlyZWN0b3J5Q2hhbmdlKG5vZGVLZXk6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuX2ZldGNoQ2hpbGRLZXlzKG5vZGVLZXkpO1xuICB9XG5cbiAgX2FkZFN1YnNjcmlwdGlvbihub2RlS2V5OiBzdHJpbmcpOiB2b2lkIHtcbiAgICBjb25zdCBkaXJlY3RvcnkgPSBGaWxlVHJlZUhlbHBlcnMuZ2V0RGlyZWN0b3J5QnlLZXkobm9kZUtleSk7XG4gICAgaWYgKCFkaXJlY3RvcnkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvKlxuICAgICAqIFJlbW92ZSB0aGUgZGlyZWN0b3J5J3MgZGlydHkgbWFya2VyIHJlZ2FyZGxlc3Mgb2Ygd2hldGhlciBhIHN1YnNjcmlwdGlvbiBhbHJlYWR5IGV4aXN0c1xuICAgICAqIGJlY2F1c2UgdGhlcmUgaXMgbm90aGluZyBmdXJ0aGVyIG1ha2luZyBpdCBkaXJ0eS5cbiAgICAgKi9cbiAgICB0aGlzLl9zZXQoJ2lzRGlydHlNYXAnLCBkZWxldGVQcm9wZXJ0eSh0aGlzLl9kYXRhLmlzRGlydHlNYXAsIG5vZGVLZXkpKTtcblxuICAgIC8vIERvbid0IGNyZWF0ZSBhIG5ldyBzdWJzY3JpcHRpb24gaWYgb25lIGFscmVhZHkgZXhpc3RzLlxuICAgIGlmICh0aGlzLl9kYXRhLnN1YnNjcmlwdGlvbk1hcFtub2RlS2V5XSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGxldCBzdWJzY3JpcHRpb247XG4gICAgdHJ5IHtcbiAgICAgIC8vIFRoaXMgY2FsbCBtaWdodCBmYWlsIGlmIHdlIHRyeSB0byB3YXRjaCBhIG5vbi1leGlzdGluZyBkaXJlY3RvcnksIG9yIGlmIHBlcm1pc3Npb24gZGVuaWVkLlxuICAgICAgc3Vic2NyaXB0aW9uID0gZGlyZWN0b3J5Lm9uRGlkQ2hhbmdlKCgpID0+IHtcbiAgICAgICAgdGhpcy5fb25EaXJlY3RvcnlDaGFuZ2Uobm9kZUtleSk7XG4gICAgICB9KTtcbiAgICB9IGNhdGNoIChleCkge1xuICAgICAgLypcbiAgICAgICAqIExvZyBlcnJvciBhbmQgbWFyayB0aGUgZGlyZWN0b3J5IGFzIGRpcnR5IHNvIHRoZSBmYWlsZWQgc3Vic2NyaXB0aW9uIHdpbGwgYmUgYXR0ZW1wdGVkXG4gICAgICAgKiBhZ2FpbiBuZXh0IHRpbWUgdGhlIGRpcmVjdG9yeSBpcyBleHBhbmRlZC5cbiAgICAgICAqL1xuICAgICAgdGhpcy5fbG9nZ2VyLmVycm9yKGBDYW5ub3Qgc3Vic2NyaWJlIHRvIGRpcmVjdG9yeSBcIiR7bm9kZUtleX1cImAsIGV4KTtcbiAgICAgIHRoaXMuX3NldCgnaXNEaXJ0eU1hcCcsIHNldFByb3BlcnR5KHRoaXMuX2RhdGEuaXNEaXJ0eU1hcCwgbm9kZUtleSkpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLl9zZXQoJ3N1YnNjcmlwdGlvbk1hcCcsIHNldFByb3BlcnR5KHRoaXMuX2RhdGEuc3Vic2NyaXB0aW9uTWFwLCBub2RlS2V5LCBzdWJzY3JpcHRpb24pKTtcbiAgfVxuXG4gIF9yZW1vdmVTdWJzY3JpcHRpb24ocm9vdEtleTogc3RyaW5nLCBub2RlS2V5OiBzdHJpbmcpOiB2b2lkIHtcbiAgICBsZXQgaGFzUmVtYWluaW5nU3Vic2NyaWJlcnM7XG4gICAgY29uc3Qgc3Vic2NyaXB0aW9uID0gdGhpcy5fZGF0YS5zdWJzY3JpcHRpb25NYXBbbm9kZUtleV07XG5cbiAgICBpZiAoc3Vic2NyaXB0aW9uICE9IG51bGwpIHtcbiAgICAgIGhhc1JlbWFpbmluZ1N1YnNjcmliZXJzID0gdGhpcy5fZGF0YS5yb290S2V5cy5zb21lKG90aGVyUm9vdEtleSA9PiAoXG4gICAgICAgIG90aGVyUm9vdEtleSAhPT0gcm9vdEtleSAmJiB0aGlzLmlzRXhwYW5kZWQob3RoZXJSb290S2V5LCBub2RlS2V5KVxuICAgICAgKSk7XG4gICAgICBpZiAoIWhhc1JlbWFpbmluZ1N1YnNjcmliZXJzKSB7XG4gICAgICAgIHN1YnNjcmlwdGlvbi5kaXNwb3NlKCk7XG4gICAgICAgIHRoaXMuX3NldCgnc3Vic2NyaXB0aW9uTWFwJywgZGVsZXRlUHJvcGVydHkodGhpcy5fZGF0YS5zdWJzY3JpcHRpb25NYXAsIG5vZGVLZXkpKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoc3Vic2NyaXB0aW9uID09IG51bGwgfHwgaGFzUmVtYWluaW5nU3Vic2NyaWJlcnMgPT09IGZhbHNlKSB7XG4gICAgICAvLyBTaW5jZSB3ZSdyZSBubyBsb25nZXIgZ2V0dGluZyBub3RpZmljYXRpb25zIHdoZW4gdGhlIGRpcmVjdG9yeSBjb250ZW50cyBjaGFuZ2UsIGFzc3VtZSB0aGVcbiAgICAgIC8vIGNoaWxkIGxpc3QgaXMgZGlydHkuXG4gICAgICB0aGlzLl9zZXQoJ2lzRGlydHlNYXAnLCBzZXRQcm9wZXJ0eSh0aGlzLl9kYXRhLmlzRGlydHlNYXAsIG5vZGVLZXksIHRydWUpKTtcbiAgICB9XG4gIH1cblxuICBfcmVtb3ZlQWxsU3Vic2NyaXB0aW9ucyhub2RlS2V5OiBzdHJpbmcpOiB2b2lkIHtcbiAgICBjb25zdCBzdWJzY3JpcHRpb24gPSB0aGlzLl9kYXRhLnN1YnNjcmlwdGlvbk1hcFtub2RlS2V5XTtcbiAgICBpZiAoc3Vic2NyaXB0aW9uKSB7XG4gICAgICBzdWJzY3JpcHRpb24uZGlzcG9zZSgpO1xuICAgICAgdGhpcy5fc2V0KCdzdWJzY3JpcHRpb25NYXAnLCBkZWxldGVQcm9wZXJ0eSh0aGlzLl9kYXRhLnN1YnNjcmlwdGlvbk1hcCwgbm9kZUtleSkpO1xuICAgIH1cbiAgfVxuXG4gIF9wdXJnZU5vZGUocm9vdEtleTogc3RyaW5nLCBub2RlS2V5OiBzdHJpbmcsIHVuc2VsZWN0OiBib29sZWFuKTogdm9pZCB7XG4gICAgY29uc3QgZXhwYW5kZWRLZXlzID0gdGhpcy5fZ2V0RXhwYW5kZWRLZXlzKHJvb3RLZXkpO1xuICAgIGlmIChleHBhbmRlZEtleXMuaGFzKG5vZGVLZXkpKSB7XG4gICAgICB0aGlzLl9zZXRFeHBhbmRlZEtleXMocm9vdEtleSwgZXhwYW5kZWRLZXlzLmRlbGV0ZShub2RlS2V5KSk7XG4gICAgfVxuXG4gICAgaWYgKHVuc2VsZWN0KSB7XG4gICAgICBjb25zdCBzZWxlY3RlZEtleXMgPSB0aGlzLmdldFNlbGVjdGVkS2V5cyhyb290S2V5KTtcbiAgICAgIGlmIChzZWxlY3RlZEtleXMuaGFzKG5vZGVLZXkpKSB7XG4gICAgICAgIHRoaXMuX3NldFNlbGVjdGVkS2V5cyhyb290S2V5LCBzZWxlY3RlZEtleXMuZGVsZXRlKG5vZGVLZXkpKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBwcmV2aW91c2x5RXhwYW5kZWQgPSB0aGlzLl9nZXRQcmV2aW91c2x5RXhwYW5kZWQocm9vdEtleSk7XG4gICAgaWYgKHByZXZpb3VzbHlFeHBhbmRlZC5oYXMobm9kZUtleSkpIHtcbiAgICAgIHRoaXMuX3NldFByZXZpb3VzbHlFeHBhbmRlZChyb290S2V5LCBwcmV2aW91c2x5RXhwYW5kZWQuZGVsZXRlKG5vZGVLZXkpKTtcbiAgICB9XG4gIH1cblxuICBfcHVyZ2VEaXJlY3RvcnlXaXRoaW5BUm9vdChyb290S2V5OiBzdHJpbmcsIG5vZGVLZXk6IHN0cmluZywgdW5zZWxlY3Q6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICBjb25zdCBjaGlsZEtleXMgPSB0aGlzLl9kYXRhLmNoaWxkS2V5TWFwW25vZGVLZXldO1xuICAgIGlmIChjaGlsZEtleXMpIHtcbiAgICAgIGNoaWxkS2V5cy5mb3JFYWNoKGNoaWxkS2V5ID0+IHtcbiAgICAgICAgaWYgKEZpbGVUcmVlSGVscGVycy5pc0RpcktleShjaGlsZEtleSkpIHtcbiAgICAgICAgICB0aGlzLl9wdXJnZURpcmVjdG9yeVdpdGhpbkFSb290KHJvb3RLZXksIGNoaWxkS2V5LCAvKiB1bnNlbGVjdCAqLyB0cnVlKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICAgIHRoaXMuX3JlbW92ZVN1YnNjcmlwdGlvbihyb290S2V5LCBub2RlS2V5KTtcbiAgICB0aGlzLl9wdXJnZU5vZGUocm9vdEtleSwgbm9kZUtleSwgdW5zZWxlY3QpO1xuICB9XG5cbiAgLy8gVGhpcyBpcyBjYWxsZWQgd2hlbiBhIGRpcmN0b3J5IGlzIHBoeXNpY2FsbHkgcmVtb3ZlZCBmcm9tIGRpc2suIFdoZW4gd2UgcHVyZ2UgYSBkaXJlY3RvcnksXG4gIC8vIHdlIG5lZWQgdG8gcHVyZ2UgaXQncyBjaGlsZCBkaXJlY3RvcmllcyBhbHNvLiBQdXJnaW5nIHJlbW92ZXMgc3R1ZmYgZnJvbSB0aGUgZGF0YSBzdG9yZVxuICAvLyBpbmNsdWRpbmcgbGlzdCBvZiBjaGlsZCBub2Rlcywgc3Vic2NyaXB0aW9ucywgZXhwYW5kZWQgZGlyZWN0b3JpZXMgYW5kIHNlbGVjdGVkIGRpcmVjdG9yaWVzLlxuICBfcHVyZ2VEaXJlY3Rvcnkobm9kZUtleTogc3RyaW5nKTogdm9pZCB7XG4gICAgY29uc3QgY2hpbGRLZXlzID0gdGhpcy5fZGF0YS5jaGlsZEtleU1hcFtub2RlS2V5XTtcbiAgICBpZiAoY2hpbGRLZXlzKSB7XG4gICAgICBjaGlsZEtleXMuZm9yRWFjaChjaGlsZEtleSA9PiB7XG4gICAgICAgIGlmIChGaWxlVHJlZUhlbHBlcnMuaXNEaXJLZXkoY2hpbGRLZXkpKSB7XG4gICAgICAgICAgdGhpcy5fcHVyZ2VEaXJlY3RvcnkoY2hpbGRLZXkpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHRoaXMuX3NldCgnY2hpbGRLZXlNYXAnLCBkZWxldGVQcm9wZXJ0eSh0aGlzLl9kYXRhLmNoaWxkS2V5TWFwLCBub2RlS2V5KSk7XG4gICAgfVxuXG4gICAgdGhpcy5fcmVtb3ZlQWxsU3Vic2NyaXB0aW9ucyhub2RlS2V5KTtcbiAgICB0aGlzLmdldFJvb3RLZXlzKCkuZm9yRWFjaChyb290S2V5ID0+IHtcbiAgICAgIHRoaXMuX3B1cmdlTm9kZShyb290S2V5LCBub2RlS2V5LCAvKiB1bnNlbGVjdCAqLyB0cnVlKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8vIFRPRE86IFNob3VsZCB3ZSBjbGVhbiB1cCBpc0xvYWRpbmdNYXA/IEl0IGNvbnRhaW5zIHByb21pc2VzIHdoaWNoIGNhbm5vdCBiZSBjYW5jZWxsZWQsIHNvIHRoaXNcbiAgLy8gbWlnaHQgYmUgdHJpY2t5LlxuICBfcHVyZ2VSb290KHJvb3RLZXk6IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IGV4cGFuZGVkS2V5cyA9IHRoaXMuX2RhdGEuZXhwYW5kZWRLZXlzQnlSb290W3Jvb3RLZXldO1xuICAgIGlmIChleHBhbmRlZEtleXMpIHtcbiAgICAgIGV4cGFuZGVkS2V5cy5mb3JFYWNoKG5vZGVLZXkgPT4ge1xuICAgICAgICB0aGlzLl9yZW1vdmVTdWJzY3JpcHRpb24ocm9vdEtleSwgbm9kZUtleSk7XG4gICAgICB9KTtcbiAgICAgIHRoaXMuX3NldCgnZXhwYW5kZWRLZXlzQnlSb290JywgZGVsZXRlUHJvcGVydHkodGhpcy5fZGF0YS5leHBhbmRlZEtleXNCeVJvb3QsIHJvb3RLZXkpKTtcbiAgICB9XG4gICAgdGhpcy5fc2V0KCdzZWxlY3RlZEtleXNCeVJvb3QnLCBkZWxldGVQcm9wZXJ0eSh0aGlzLl9kYXRhLnNlbGVjdGVkS2V5c0J5Um9vdCwgcm9vdEtleSkpO1xuICAgIC8vIFJlbW92ZSBhbGwgY2hpbGQga2V5cyBzbyB0aGF0IG9uIHJlLWFkZGl0aW9uIG9mIHRoaXMgcm9vdCB0aGUgY2hpbGRyZW4gd2lsbCBiZSBmZXRjaGVkIGFnYWluLlxuICAgIGNvbnN0IGNoaWxkS2V5cyA9IHRoaXMuX2RhdGEuY2hpbGRLZXlNYXBbcm9vdEtleV07XG4gICAgaWYgKGNoaWxkS2V5cykge1xuICAgICAgY2hpbGRLZXlzLmZvckVhY2goY2hpbGRLZXkgPT4ge1xuICAgICAgICBpZiAoRmlsZVRyZWVIZWxwZXJzLmlzRGlyS2V5KGNoaWxkS2V5KSkge1xuICAgICAgICAgIHRoaXMuX3NldCgnY2hpbGRLZXlNYXAnLCBkZWxldGVQcm9wZXJ0eSh0aGlzLl9kYXRhLmNoaWxkS2V5TWFwLCBjaGlsZEtleSkpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHRoaXMuX3NldCgnY2hpbGRLZXlNYXAnLCBkZWxldGVQcm9wZXJ0eSh0aGlzLl9kYXRhLmNoaWxkS2V5TWFwLCByb290S2V5KSk7XG4gICAgfVxuICAgIHRoaXMuX3NldCgndmNzU3RhdHVzZXNCeVJvb3QnLCBkZWxldGVQcm9wZXJ0eSh0aGlzLl9kYXRhLnZjc1N0YXR1c2VzQnlSb290LCByb290S2V5KSk7XG4gIH1cblxuICBfc2V0VHJhY2tlZE5vZGUocm9vdEtleTogc3RyaW5nLCBub2RlS2V5OiBzdHJpbmcpOiB2b2lkIHtcbiAgICAvLyBGbHVzaCB0aGUgdmFsdWUgdG8gZW5zdXJlIGNsaWVudHMgc2VlIHRoZSB2YWx1ZSBhdCBsZWFzdCBvbmNlIGFuZCBzY3JvbGwgYXBwcm9wcmlhdGVseS5cbiAgICB0aGlzLl9zZXQoJ3RyYWNrZWROb2RlJywge25vZGVLZXksIHJvb3RLZXl9LCB0cnVlKTtcbiAgfVxuXG4gIF9zZXRSZXBvc2l0b3JpZXMocmVwb3NpdG9yaWVzOiBJbW11dGFibGUuU2V0PGF0b20kUmVwb3NpdG9yeT4pOiB2b2lkIHtcbiAgICB0aGlzLl9zZXQoJ3JlcG9zaXRvcmllcycsIHJlcG9zaXRvcmllcyk7XG5cbiAgICAvLyBXaGVuZXZlciBhIG5ldyBzZXQgb2YgcmVwb3NpdG9yaWVzIGNvbWVzIGluLCBpbnZhbGlkYXRlIG91ciBwYXRocyBjYWNoZSBieSByZXNldHRpbmcgaXRzXG4gICAgLy8gYGNhY2hlYCBwcm9wZXJ0eSAoY3JlYXRlZCBieSBsb2Rhc2gubWVtb2l6ZSkgdG8gYW4gZW1wdHkgbWFwLlxuICAgIHRoaXMuX3JlcG9zaXRvcnlGb3JQYXRoLmNhY2hlID0gbmV3IE1hcCgpO1xuICB9XG5cbiAgX3NldFdvcmtpbmdTZXQod29ya2luZ1NldDogV29ya2luZ1NldCk6IHZvaWQge1xuICAgIHRoaXMuX3NldCgnd29ya2luZ1NldCcsIHdvcmtpbmdTZXQpO1xuICB9XG5cbiAgX3NldE9wZW5GaWxlc1dvcmtpbmdTZXQob3BlbkZpbGVzV29ya2luZ1NldDogV29ya2luZ1NldCk6IHZvaWQge1xuICAgIHRoaXMuX3NldCgnb3BlbkZpbGVzV29ya2luZ1NldCcsIG9wZW5GaWxlc1dvcmtpbmdTZXQpO1xuICB9XG5cbiAgX3NldFdvcmtpbmdTZXRzU3RvcmUod29ya2luZ1NldHNTdG9yZTogP1dvcmtpbmdTZXRzU3RvcmUpOiB2b2lkIHtcbiAgICB0aGlzLl9zZXQoJ3dvcmtpbmdTZXRzU3RvcmUnLCB3b3JraW5nU2V0c1N0b3JlKTtcbiAgfVxuXG4gIF9zdGFydEVkaXRpbmdXb3JraW5nU2V0KGVkaXRlZFdvcmtpbmdTZXQ6IFdvcmtpbmdTZXQpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuX2RhdGEuaXNFZGl0aW5nV29ya2luZ1NldCkge1xuICAgICAgdGhpcy5fc2V0KCdpc0VkaXRpbmdXb3JraW5nU2V0JywgdHJ1ZSk7XG4gICAgICB0aGlzLl9zZXRFZGl0ZWRXb3JraW5nU2V0KGVkaXRlZFdvcmtpbmdTZXQpO1xuICAgIH1cbiAgfVxuXG4gIF9maW5pc2hFZGl0aW5nV29ya2luZ1NldCgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fZGF0YS5pc0VkaXRpbmdXb3JraW5nU2V0KSB7XG4gICAgICB0aGlzLl9zZXQoJ2lzRWRpdGluZ1dvcmtpbmdTZXQnLCBmYWxzZSk7XG4gICAgICB0aGlzLl9zZXRFZGl0ZWRXb3JraW5nU2V0KG5ldyBXb3JraW5nU2V0KCkpO1xuICAgIH1cbiAgfVxuXG4gIF9jaGVja05vZGUocm9vdEtleTogc3RyaW5nLCBub2RlS2V5OiBzdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuX2RhdGEuaXNFZGl0aW5nV29ya2luZ1NldCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGVkaXRlZFdvcmtpbmdTZXQgPSB0aGlzLl9kYXRhLmVkaXRlZFdvcmtpbmdTZXQuYXBwZW5kKG5vZGVLZXkpO1xuXG4gICAgY29uc3Qgbm9kZSA9IHRoaXMuZ2V0Tm9kZShyb290S2V5LCBub2RlS2V5KTtcbiAgICBpZiAobm9kZS5pc1Jvb3QpIHtcbiAgICAgIHRoaXMuX3NldEVkaXRlZFdvcmtpbmdTZXQoZWRpdGVkV29ya2luZ1NldCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgcGFyZW50ID0gbm9kZS5nZXRQYXJlbnROb2RlKCk7XG4gICAgY29uc3QgY2hpbGRyZW5LZXlzID0gdGhpcy5nZXRDYWNoZWRDaGlsZEtleXMocm9vdEtleSwgcGFyZW50Lm5vZGVLZXkpO1xuICAgIGlmIChjaGlsZHJlbktleXMuZXZlcnkoY2sgPT4gZWRpdGVkV29ya2luZ1NldC5jb250YWluc0ZpbGUoY2spKSkge1xuICAgICAgdGhpcy5fY2hlY2tOb2RlKHJvb3RLZXksIHBhcmVudC5ub2RlS2V5KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fc2V0RWRpdGVkV29ya2luZ1NldChlZGl0ZWRXb3JraW5nU2V0KTtcbiAgICB9XG4gIH1cblxuICBfdW5jaGVja05vZGUocm9vdEtleTogc3RyaW5nLCBub2RlS2V5OiBzdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuX2RhdGEuaXNFZGl0aW5nV29ya2luZ1NldCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IG5vZGUgPSB0aGlzLmdldE5vZGUocm9vdEtleSwgbm9kZUtleSk7XG4gICAgaWYgKG5vZGUuaXNSb290KSB7XG4gICAgICB0aGlzLl9zZXRFZGl0ZWRXb3JraW5nU2V0KHRoaXMuX2RhdGEuZWRpdGVkV29ya2luZ1NldC5yZW1vdmUobm9kZUtleSkpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHBhcmVudCA9IG5vZGUuZ2V0UGFyZW50Tm9kZSgpO1xuICAgIGlmICh0aGlzLl9kYXRhLmVkaXRlZFdvcmtpbmdTZXQuY29udGFpbnNGaWxlKHBhcmVudC5ub2RlS2V5KSkge1xuICAgICAgdGhpcy5fdW5jaGVja05vZGUocm9vdEtleSwgcGFyZW50Lm5vZGVLZXkpO1xuICAgICAgY29uc3QgY2hpbGRyZW5LZXlzID0gdGhpcy5nZXRDYWNoZWRDaGlsZEtleXMocm9vdEtleSwgcGFyZW50Lm5vZGVLZXkpO1xuICAgICAgY29uc3Qgc2libGluZ3NLZXlzID0gY2hpbGRyZW5LZXlzLmZpbHRlcihjayA9PiBjayAhPT0gbm9kZUtleSk7XG5cbiAgICAgIHRoaXMuX3NldEVkaXRlZFdvcmtpbmdTZXQodGhpcy5fZGF0YS5lZGl0ZWRXb3JraW5nU2V0LmFwcGVuZCguLi5zaWJsaW5nc0tleXMpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fc2V0RWRpdGVkV29ya2luZ1NldCh0aGlzLl9kYXRhLmVkaXRlZFdvcmtpbmdTZXQucmVtb3ZlKG5vZGVLZXkpKTtcbiAgICB9XG4gIH1cblxuICBfb21pdEhpZGRlblBhdGhzKG5vZGVLZXlzOiBBcnJheTxzdHJpbmc+KTogQXJyYXk8c3RyaW5nPiB7XG4gICAgaWYgKFxuICAgICAgIXRoaXMuX2RhdGEuaGlkZUlnbm9yZWROYW1lcyAmJlxuICAgICAgIXRoaXMuX2RhdGEuZXhjbHVkZVZjc0lnbm9yZWRQYXRocyAmJlxuICAgICAgdGhpcy5fZGF0YS53b3JraW5nU2V0LmlzRW1wdHkoKVxuICAgICkge1xuICAgICAgcmV0dXJuIG5vZGVLZXlzO1xuICAgIH1cblxuICAgIHJldHVybiBub2RlS2V5cy5maWx0ZXIobm9kZUtleSA9PiAhdGhpcy5fc2hvdWxkSGlkZVBhdGgobm9kZUtleSkpO1xuICB9XG5cbiAgX3Nob3VsZEhpZGVQYXRoKG5vZGVLZXk6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IGlzSWdub3JlZFBhdGggPSB0aGlzLl9pc0lnbm9yZWRQYXRoKG5vZGVLZXkpO1xuICAgIGlmIChpc0lnbm9yZWRQYXRoKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBjb25zdCBpc0V4Y2x1ZGVkRnJvbVdzID0gdGhpcy5faXNFeGNsdWRlZEZyb21Xb3JraW5nU2V0KG5vZGVLZXkpO1xuICAgIHJldHVybiBpc0V4Y2x1ZGVkRnJvbVdzICYmIHRoaXMuX2lzRXhjbHVkZWRGcm9tT3BlbkZpbGVzV29ya2luZ1NldChub2RlS2V5KTtcbiAgfVxuXG4gIF9pc0lnbm9yZWRQYXRoKG5vZGVLZXk6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHtoaWRlSWdub3JlZE5hbWVzLCBleGNsdWRlVmNzSWdub3JlZFBhdGhzLCBpZ25vcmVkUGF0dGVybnN9ID0gdGhpcy5fZGF0YTtcblxuICAgIGlmIChoaWRlSWdub3JlZE5hbWVzICYmIG1hdGNoZXNTb21lKG5vZGVLZXksIGlnbm9yZWRQYXR0ZXJucykpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBpZiAoZXhjbHVkZVZjc0lnbm9yZWRQYXRocyAmJiBpc1Zjc0lnbm9yZWQobm9kZUtleSwgdGhpcy5fcmVwb3NpdG9yeUZvclBhdGgobm9kZUtleSkpKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBfaXNFeGNsdWRlZEZyb21Xb3JraW5nU2V0KG5vZGVLZXk6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHt3b3JraW5nU2V0LCBpc0VkaXRpbmdXb3JraW5nU2V0fSA9IHRoaXMuX2RhdGE7XG5cbiAgICBpZiAoIWlzRWRpdGluZ1dvcmtpbmdTZXQpIHtcbiAgICAgIGlmIChGaWxlVHJlZUhlbHBlcnMuaXNEaXJLZXkobm9kZUtleSkpIHtcbiAgICAgICAgcmV0dXJuICF3b3JraW5nU2V0LmNvbnRhaW5zRGlyKG5vZGVLZXkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuICF3b3JraW5nU2V0LmNvbnRhaW5zRmlsZShub2RlS2V5KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBfaXNFeGNsdWRlZEZyb21PcGVuRmlsZXNXb3JraW5nU2V0KG5vZGVLZXk6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHtvcGVuRmlsZXNXb3JraW5nU2V0LCBpc0VkaXRpbmdXb3JraW5nU2V0fSA9IHRoaXMuX2RhdGE7XG5cbiAgICBpZiAoaXNFZGl0aW5nV29ya2luZ1NldCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlmIChvcGVuRmlsZXNXb3JraW5nU2V0LmlzRW1wdHkoKSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgaWYgKEZpbGVUcmVlSGVscGVycy5pc0RpcktleShub2RlS2V5KSkge1xuICAgICAgcmV0dXJuICFvcGVuRmlsZXNXb3JraW5nU2V0LmNvbnRhaW5zRGlyKG5vZGVLZXkpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gIW9wZW5GaWxlc1dvcmtpbmdTZXQuY29udGFpbnNGaWxlKG5vZGVLZXkpO1xuICAgIH1cbiAgfVxuXG4gIHJlc2V0KCk6IHZvaWQge1xuICAgIGNvbnN0IHN1YnNjcmlwdGlvbk1hcCA9IHRoaXMuX2RhdGEuc3Vic2NyaXB0aW9uTWFwO1xuICAgIGZvciAoY29uc3Qgbm9kZUtleSBvZiBPYmplY3Qua2V5cyhzdWJzY3JpcHRpb25NYXApKSB7XG4gICAgICBjb25zdCBzdWJzY3JpcHRpb24gPSBzdWJzY3JpcHRpb25NYXBbbm9kZUtleV07XG4gICAgICBpZiAoc3Vic2NyaXB0aW9uKSB7XG4gICAgICAgIHN1YnNjcmlwdGlvbi5kaXNwb3NlKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gUmVzZXQgZGF0YSBzdG9yZS5cbiAgICB0aGlzLl9kYXRhID0gdGhpcy5fZ2V0RGVmYXVsdHMoKTtcbiAgfVxuXG4gIHN1YnNjcmliZShsaXN0ZW5lcjogQ2hhbmdlTGlzdGVuZXIpOiBJRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuX2VtaXR0ZXIub24oJ2NoYW5nZScsIGxpc3RlbmVyKTtcbiAgfVxufVxuXG4vLyBBIGhlbHBlciB0byBkZWxldGUgYSBwcm9wZXJ0eSBpbiBhbiBvYmplY3QgdXNpbmcgc2hhbGxvdyBjb3B5IHJhdGhlciB0aGFuIG11dGF0aW9uXG5mdW5jdGlvbiBkZWxldGVQcm9wZXJ0eShvYmplY3Q6IE9iamVjdCwga2V5OiBzdHJpbmcpOiBPYmplY3Qge1xuICBpZiAoIW9iamVjdC5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgcmV0dXJuIG9iamVjdDtcbiAgfVxuICBjb25zdCBuZXdPYmplY3QgPSB7Li4ub2JqZWN0fTtcbiAgZGVsZXRlIG5ld09iamVjdFtrZXldO1xuICByZXR1cm4gbmV3T2JqZWN0O1xufVxuXG4vLyBBIGhlbHBlciB0byBzZXQgYSBwcm9wZXJ0eSBpbiBhbiBvYmplY3QgdXNpbmcgc2hhbGxvdyBjb3B5IHJhdGhlciB0aGFuIG11dGF0aW9uXG5mdW5jdGlvbiBzZXRQcm9wZXJ0eShvYmplY3Q6IE9iamVjdCwga2V5OiBzdHJpbmcsIG5ld1ZhbHVlOiBtaXhlZCk6IE9iamVjdCB7XG4gIGNvbnN0IG9sZFZhbHVlID0gb2JqZWN0W2tleV07XG4gIGlmIChvbGRWYWx1ZSA9PT0gbmV3VmFsdWUpIHtcbiAgICByZXR1cm4gb2JqZWN0O1xuICB9XG4gIGNvbnN0IG5ld09iamVjdCA9IHsuLi5vYmplY3R9O1xuICBuZXdPYmplY3Rba2V5XSA9IG5ld1ZhbHVlO1xuICByZXR1cm4gbmV3T2JqZWN0O1xufVxuXG4vLyBDcmVhdGUgYSBuZXcgb2JqZWN0IGJ5IG1hcHBpbmcgb3ZlciB0aGUgcHJvcGVydGllcyBvZiBhIGdpdmVuIG9iamVjdCwgY2FsbGluZyB0aGUgZ2l2ZW5cbi8vIGZ1bmN0aW9uIG9uIGVhY2ggb25lLlxuZnVuY3Rpb24gbWFwVmFsdWVzKG9iamVjdDogT2JqZWN0LCBmbjogRnVuY3Rpb24pOiBPYmplY3Qge1xuICBjb25zdCBuZXdPYmplY3QgPSB7fTtcbiAgT2JqZWN0LmtleXMob2JqZWN0KS5mb3JFYWNoKGtleSA9PiB7XG4gICAgbmV3T2JqZWN0W2tleV0gPSBmbihvYmplY3Rba2V5XSwga2V5KTtcbiAgfSk7XG4gIHJldHVybiBuZXdPYmplY3Q7XG59XG5cbi8vIERldGVybWluZSB3aGV0aGVyIHRoZSBnaXZlbiBzdHJpbmcgbWF0Y2hlcyBhbnkgb2YgYSBzZXQgb2YgcGF0dGVybnMuXG5mdW5jdGlvbiBtYXRjaGVzU29tZShzdHI6IHN0cmluZywgcGF0dGVybnM6IEltbXV0YWJsZS5TZXQ8TWluaW1hdGNoPikge1xuICByZXR1cm4gcGF0dGVybnMuc29tZShwYXR0ZXJuID0+IHBhdHRlcm4ubWF0Y2goc3RyKSk7XG59XG5cbmZ1bmN0aW9uIGlzVmNzSWdub3JlZChub2RlS2V5OiBzdHJpbmcsIHJlcG86ID9hdG9tJFJlcG9zaXRvcnkpIHtcbiAgcmV0dXJuIHJlcG8gJiYgcmVwby5pc1Byb2plY3RBdFJvb3QoKSAmJiByZXBvLmlzUGF0aElnbm9yZWQobm9kZUtleSk7XG59XG5cblxuLyoqXG4gKiBQZXJmb3JtcyBhIGJyZWFkdGgtZmlyc3QgaXRlcmF0aW9uIG92ZXIgdGhlIGRpcmVjdG9yaWVzIG9mIHRoZSB0cmVlIHN0YXJ0aW5nXG4gKiB3aXRoIGEgZ2l2ZW4gbm9kZS4gVGhlIGl0ZXJhdGlvbiBzdG9wcyBvbmNlIGEgZ2l2ZW4gbGltaXQgb2Ygbm9kZXMgKGJvdGggZGlyZWN0b3JpZXNcbiAqIGFuZCBmaWxlcykgd2VyZSB0cmF2ZXJzZWQuXG4gKiBUaGUgbm9kZSBiZWluZyBjdXJyZW50bHkgdHJhdmVyc2VkIGNhbiBiZSBvYnRhaW5lZCBieSBjYWxsaW5nIC50cmF2ZXJzZWROb2RlKClcbiAqIC5uZXh0KCkgcmV0dXJucyBhIHByb21pc2UgdGhhdCBpcyBmdWxmaWxsZWQgd2hlbiB0aGUgdHJhdmVyc2FsIG1vdmVzIG9uIHRvXG4gKiB0aGUgbmV4dCBkaXJlY3RvcnkuXG4gKi9cbmNsYXNzIEZpbGVUcmVlU3RvcmVCZnNJdGVyYXRvciB7XG4gIF9maWxlVHJlZVN0b3JlOiBGaWxlVHJlZVN0b3JlO1xuICBfcm9vdEtleTogc3RyaW5nO1xuICBfbm9kZXNUb1RyYXZlcnNlOiBBcnJheTxzdHJpbmc+O1xuICBfY3VycmVudGx5VHJhdmVyc2VkTm9kZTogP3N0cmluZztcbiAgX2xpbWl0OiBudW1iZXI7XG4gIF9udW1Ob2Rlc1RyYXZlcnNlZDogbnVtYmVyO1xuICBfcHJvbWlzZTogP1Byb21pc2U8dm9pZD47XG4gIF9jb3VudDogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgZmlsZVRyZWVTdG9yZTogRmlsZVRyZWVTdG9yZSxcbiAgICAgIHJvb3RLZXk6IHN0cmluZyxcbiAgICAgIG5vZGVLZXk6IHN0cmluZyxcbiAgICAgIGxpbWl0OiBudW1iZXIpIHtcbiAgICB0aGlzLl9maWxlVHJlZVN0b3JlID0gZmlsZVRyZWVTdG9yZTtcbiAgICB0aGlzLl9yb290S2V5ID0gcm9vdEtleTtcbiAgICB0aGlzLl9ub2Rlc1RvVHJhdmVyc2UgPSBbXTtcbiAgICB0aGlzLl9jdXJyZW50bHlUcmF2ZXJzZWROb2RlID0gbm9kZUtleTtcbiAgICB0aGlzLl9saW1pdCA9IGxpbWl0O1xuICAgIHRoaXMuX251bU5vZGVzVHJhdmVyc2VkID0gMDtcbiAgICB0aGlzLl9wcm9taXNlID0gbnVsbDtcbiAgICB0aGlzLl9jb3VudCA9IDA7XG4gIH1cblxuICBfaGFuZGxlUHJvbWlzZVJlc29sdXRpb24oY2hpbGRyZW5LZXlzOiBBcnJheTxzdHJpbmc+KTogdm9pZCB7XG4gICAgdGhpcy5fbnVtTm9kZXNUcmF2ZXJzZWQgKz0gY2hpbGRyZW5LZXlzLmxlbmd0aDtcbiAgICBpZiAodGhpcy5fbnVtTm9kZXNUcmF2ZXJzZWQgPCB0aGlzLl9saW1pdCkge1xuICAgICAgY29uc3QgbmV4dExldmVsTm9kZXMgPSBjaGlsZHJlbktleXMuZmlsdGVyKGNoaWxkS2V5ID0+IEZpbGVUcmVlSGVscGVycy5pc0RpcktleShjaGlsZEtleSkpO1xuICAgICAgdGhpcy5fbm9kZXNUb1RyYXZlcnNlID0gdGhpcy5fbm9kZXNUb1RyYXZlcnNlLmNvbmNhdChuZXh0TGV2ZWxOb2Rlcyk7XG5cbiAgICAgIHRoaXMuX2N1cnJlbnRseVRyYXZlcnNlZE5vZGUgPSB0aGlzLl9ub2Rlc1RvVHJhdmVyc2Uuc3BsaWNlKDAsIDEpWzBdO1xuICAgICAgdGhpcy5fcHJvbWlzZSA9IG51bGw7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2N1cnJlbnRseVRyYXZlcnNlZE5vZGUgPSBudWxsO1xuICAgICAgdGhpcy5fcHJvbWlzZSA9IG51bGw7XG4gICAgfVxuXG4gICAgcmV0dXJuO1xuICB9XG5cbiAgbmV4dCgpOiA/UHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgY3VycmVudGx5VHJhdmVyc2VkTm9kZSA9IHRoaXMuX2N1cnJlbnRseVRyYXZlcnNlZE5vZGU7XG4gICAgaWYgKCF0aGlzLl9wcm9taXNlICYmIGN1cnJlbnRseVRyYXZlcnNlZE5vZGUpIHtcbiAgICAgIHRoaXMuX3Byb21pc2UgPSB0aGlzLl9maWxlVHJlZVN0b3JlLnByb21pc2VOb2RlQ2hpbGRLZXlzKFxuICAgICAgICB0aGlzLl9yb290S2V5LFxuICAgICAgICBjdXJyZW50bHlUcmF2ZXJzZWROb2RlKVxuICAgICAgLnRoZW4odGhpcy5faGFuZGxlUHJvbWlzZVJlc29sdXRpb24uYmluZCh0aGlzKSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9wcm9taXNlO1xuICB9XG5cbiAgdHJhdmVyc2VkTm9kZSgpOiA/c3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fY3VycmVudGx5VHJhdmVyc2VkTm9kZTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZpbGVUcmVlU3RvcmU7XG4iXX0=