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

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _FileTreeConstants = require('./FileTreeConstants');

var _atom = require('atom');

var _FileTreeFilterHelper = require('./FileTreeFilterHelper');

var _minimatch = require('minimatch');

var _nuclideHgGitBridge = require('../../nuclide-hg-git-bridge');

var _nuclideHgRepositoryBaseLibHgConstants = require('../../nuclide-hg-repository-base/lib/hg-constants');

var _nuclideLogging = require('../../nuclide-logging');

var _shell = require('shell');

var _shell2 = _interopRequireDefault(_shell);

var _nuclideWorkingSets = require('../../nuclide-working-sets');

var _nuclideAnalytics = require('../../nuclide-analytics');

// Used to ensure the version we serialized is the same version we are deserializing.
var VERSION = 1;

var DEFAULT_CONF = {
  vcsStatuses: {},
  workingSet: new _nuclideWorkingSets.WorkingSet(),
  editedWorkingSet: new _nuclideWorkingSets.WorkingSet(),
  hideIgnoredNames: true,
  excludeVcsIgnoredPaths: true,
  ignoredPatterns: new _immutable2['default'].Set(),
  usePreviewTabs: false,
  isEditingWorkingSet: false,
  openFilesWorkingSet: new _nuclideWorkingSets.WorkingSet(),
  reposByRoot: {}
};

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
  }, {
    key: 'dispose',
    value: function dispose() {
      if (instance != null) {
        instance.dispose();
      }

      instance = null;
    }
  }]);

  function FileTreeStore() {
    var _this = this;

    _classCallCheck(this, FileTreeStore);

    this.roots = new _immutable2['default'].OrderedMap();
    this._dispatcher = _FileTreeDispatcher2['default'].getInstance();
    this._emitter = new _atom.Emitter();
    this._dispatcher.register(function (payload) {
      return _this._onDispatch(payload);
    });
    this._logger = (0, _nuclideLogging.getLogger)();

    this._usePrefixNav = false;
    this._isLoadingMap = new _immutable2['default'].Map();
    this._repositories = new _immutable2['default'].Set();

    this._conf = DEFAULT_CONF;
    global.FTConf = this._conf;
    this._suppressChanges = false;
    this._filter = '';
  }

  /**
   * Performs a breadth-first iteration over the directories of the tree starting
   * with a given node. The iteration stops once a given limit of nodes (both directories
   * and files) were traversed.
   * The node being currently traversed can be obtained by calling .traversedNode()
   * .next() returns a promise that is fulfilled when the traversal moves on to
   * the next directory.
   */

  /**
   * TODO: Move to a [serialization class][1] and use the built-in versioning mechanism. This might
   * need to be done one level higher within main.js.
   *
   * [1]: https://atom.io/docs/latest/behind-atom-serialization-in-atom
   */

  _createClass(FileTreeStore, [{
    key: 'exportData',
    value: function exportData() {
      var childKeyMap = {};
      var expandedKeysByRoot = {};
      var selectedKeysByRoot = {};

      this.roots.forEach(function (root) {
        var expandedKeys = [];
        var selectedKeys = [];

        // Grab the data of only the expanded portion of the tree.
        root.traverse(function (node) {
          if (node.isSelected) {
            selectedKeys.push(node.uri);
          }

          if (!node.isExpanded) {
            return false;
          }

          expandedKeys.push(node.uri);

          if (!node.children.isEmpty()) {
            childKeyMap[node.uri] = node.children.map(function (child) {
              return child.uri;
            }).toArray();
          }

          return true;
        });

        expandedKeysByRoot[root.uri] = expandedKeys;
        selectedKeysByRoot[root.uri] = selectedKeys;
      });

      var rootKeys = this.roots.map(function (root) {
        return root.uri;
      }).toArray();

      return {
        version: VERSION,
        childKeyMap: childKeyMap,
        expandedKeysByRoot: expandedKeysByRoot,
        rootKeys: rootKeys,
        selectedKeysByRoot: selectedKeysByRoot
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

      var buildNode = function buildNode(rootUri, uri) {
        var rootExpandedKeys = data.expandedKeysByRoot[rootUri] || [];
        var rootSelectedKeys = data.selectedKeysByRoot[rootUri] || [];
        var childrenUris = data.childKeyMap[uri] || [];
        var children = _FileTreeNode.FileTreeNode.childrenFromArray(childrenUris.map(function (childUri) {
          return buildNode(rootUri, childUri);
        }));

        var isExpanded = rootExpandedKeys.indexOf(uri) >= 0;
        var isLoading = false;

        if (isExpanded && _FileTreeHelpers2['default'].isDirKey(uri)) {
          _this2._fetchChildKeys(uri);
          isLoading = true;
        }

        return new _FileTreeNode.FileTreeNode({
          uri: uri,
          rootUri: rootUri,
          isExpanded: isExpanded,
          isSelected: rootSelectedKeys.indexOf(uri) >= 0,
          isLoading: isLoading,
          isTracked: false,
          children: children,
          isCwd: false,
          connectionTitle: _FileTreeHelpers2['default'].getDisplayTitle(rootUri) || ''
        }, _this2._conf);
      };

      this._setRoots(new _immutable2['default'].OrderedMap(data.rootKeys.map(function (rootUri) {
        return [rootUri, buildNode(rootUri, rootUri)];
      })));
    }
  }, {
    key: '_setExcludeVcsIgnoredPaths',
    value: function _setExcludeVcsIgnoredPaths(excludeVcsIgnoredPaths) {
      this._updateConf(function (conf) {
        return conf.excludeVcsIgnoredPaths = excludeVcsIgnoredPaths;
      });
    }
  }, {
    key: '_setHideIgnoredNames',
    value: function _setHideIgnoredNames(hideIgnoredNames) {
      this._updateConf(function (conf) {
        return conf.hideIgnoredNames = hideIgnoredNames;
      });
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
      this._updateConf(function (conf) {
        return conf.ignoredPatterns = ignoredPatterns;
      });
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
          this._collapseNodeDeep(payload.rootKey, payload.nodeKey);
          break;
        case _FileTreeConstants.ActionType.SET_HIDE_IGNORED_NAMES:
          this._setHideIgnoredNames(payload.hideIgnoredNames);
          break;
        case _FileTreeConstants.ActionType.SET_IGNORED_NAMES:
          this._setIgnoredNames(payload.ignoredNames);
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

        case _FileTreeConstants.ActionType.SET_SELECTED_NODE:
          this._setSelectedNode(payload.rootKey, payload.nodeKey);
          break;
        case _FileTreeConstants.ActionType.ADD_SELECTED_NODE:
          this._addSelectedNode(payload.rootKey, payload.nodeKey);
          break;
        case _FileTreeConstants.ActionType.UNSELECT_NODE:
          this._unselectNode(payload.rootKey, payload.nodeKey);
          break;
        case _FileTreeConstants.ActionType.MOVE_SELECTION_UP:
          this._moveSelectionUp();
          break;
        case _FileTreeConstants.ActionType.MOVE_SELECTION_DOWN:
          this._moveSelectionDown();
          break;
        case _FileTreeConstants.ActionType.MOVE_SELECTION_TO_TOP:
          this._moveSelectionToTop();
          break;
        case _FileTreeConstants.ActionType.MOVE_SELECTION_TO_BOTTOM:
          this._moveSelectionToBottom();
          break;
        case _FileTreeConstants.ActionType.ENSURE_CHILD_NODE:
          this._ensureChildNode(payload.nodeKey);
          break;
      }
    }

    /**
    * Use the predicate function to update one or more of the roots in the file tree
    */
  }, {
    key: '_updateRoots',
    value: function _updateRoots(predicate) {
      this._setRoots(this.roots.map(predicate));
    }

    /**
    * Use the predicate to update a node (or a branch) of the file-tree
    */
  }, {
    key: '_updateNodeAtRoot',
    value: function _updateNodeAtRoot(rootKey, nodeKey, predicate) {
      var root = this.roots.get(rootKey);
      if (root == null) {
        return;
      }

      var node = root.find(nodeKey);
      if (node == null) {
        return;
      }

      var roots = this.roots.set(rootKey, this._bubbleUp(node, predicate(node)));
      this._setRoots(roots);
    }

    /**
    * Update a node or a branch under any of the roots it was found at
    */
  }, {
    key: '_updateNodeAtAllRoots',
    value: function _updateNodeAtAllRoots(nodeKey, predicate) {
      var _this3 = this;

      var roots = this.roots.map(function (root) {
        var node = root.find(nodeKey);
        if (node == null) {
          return root;
        }

        return _this3._bubbleUp(node, predicate(node));
      });

      this._setRoots(roots);
    }

    /**
    * Bubble the change up. The newNode is assumed to be prevNode after some manipulateion done to it
    * therefore they are assumed to belong to the same parent.
    *
    * The method updates the child to the new node (which create a new parent instance) and call
    * recursively for the parent update. Until there are no more parents and the new root is returned
    *
    * As the change bubbles up, and in addition to the change from the new child assignment, an
    * optional predicate is also being applied to each newly created parent to support more complex
    * change patterns.
    */
  }, {
    key: '_bubbleUp',
    value: function _bubbleUp(prevNode, newNode) {
      var postPredicate = arguments.length <= 2 || arguments[2] === undefined ? function (node) {
        return node;
      } : arguments[2];

      var parent = prevNode.parent;
      if (parent == null) {
        return newNode;
      }

      var newParent = postPredicate(parent.updateChild(newNode));
      return this._bubbleUp(parent, newParent, postPredicate);
    }

    /**
    * Updates the roots, maintains their sibling relationships and fires the change event.
    */
  }, {
    key: '_setRoots',
    value: function _setRoots(roots) {
      var _this4 = this;

      var changed = !_immutable2['default'].is(roots, this.roots);
      if (changed) {
        (function () {
          _this4.roots = roots;
          var prevRoot = null;
          roots.forEach(function (r) {
            r.prevSibling = prevRoot;
            if (prevRoot != null) {
              prevRoot.nextSibling = r;
            }
            prevRoot = r;
          });

          if (prevRoot != null) {
            prevRoot.nextSibling = null;
          }

          _this4._emitChange();
        })();
      }
    }
  }, {
    key: '_emitChange',
    value: function _emitChange() {
      var _this5 = this;

      if (this._suppressChanges) {
        return;
      }

      if (this._animationFrameRequestId != null) {
        window.cancelAnimationFrame(this._animationFrameRequestId);
      }

      this._animationFrameRequestId = window.requestAnimationFrame(function () {
        var performance = global.performance;

        var renderStart = performance.now();
        var childrenCount = _this5.roots.reduce(function (sum, root) {
          return sum + root.shownChildrenBelow;
        }, 0);

        _this5._emitter.emit('change');
        _this5._suppressChanges = true;
        _this5._checkTrackedNode();
        _this5._suppressChanges = false;
        _this5._animationFrameRequestId = null;

        var duration = (performance.now() - renderStart).toString();
        (0, _nuclideAnalytics.track)('filetree-root-node-component-render', {
          'filetree-root-node-component-render-duration': duration,
          'filetree-root-node-component-rendered-child-count': childrenCount
        });
      });
    }

    /**
    * Update the configuration for the file-tree. The direct writing to the this._conf should be
    * avoided.
    */
  }, {
    key: '_updateConf',
    value: function _updateConf(predicate) {
      predicate(this._conf);
      this._updateRoots(function (root) {
        return root.updateConf();
      });
    }
  }, {
    key: '_setRootKeys',
    value: function _setRootKeys(rootKeys) {
      var _this6 = this;

      var rootNodes = rootKeys.map(function (rootUri) {
        var root = _this6.roots.get(rootUri);
        if (root != null) {
          return root;
        }

        return new _FileTreeNode.FileTreeNode({
          uri: rootUri,
          rootUri: rootUri,
          connectionTitle: _FileTreeHelpers2['default'].getDisplayTitle(rootUri) || ''
        }, _this6._conf);
      });
      this._setRoots(new _immutable2['default'].OrderedMap(rootNodes.map(function (root) {
        return [root.uri, root];
      })));
      this._setCwdKey(this._cwdKey);
    }
  }, {
    key: 'getTrackedNode',
    value: function getTrackedNode() {
      // Locate the root containing the tracked node efficiently by using the child-derived
      // containsTrackedNode property
      var trackedRoot = this.roots.find(function (root) {
        return root.containsTrackedNode;
      });
      if (trackedRoot == null) {
        return null;
      }

      var trackedNode = undefined;
      // Likewise, within the root use the property to efficiently find the needed node
      trackedRoot.traverse(function (node) {
        if (node.isTracked) {
          trackedNode = node;
        }

        return trackedNode == null && node.containsTrackedNode;
      });

      return trackedNode;
    }
  }, {
    key: 'getRepositories',
    value: function getRepositories() {
      return this._repositories;
    }
  }, {
    key: 'getWorkingSet',
    value: function getWorkingSet() {
      return this._conf.workingSet;
    }
  }, {
    key: 'getWorkingSetsStore',
    value: function getWorkingSetsStore() {
      return this._workingSetsStore;
    }
  }, {
    key: 'getRootKeys',
    value: function getRootKeys() {
      return this.roots.toArray().map(function (root) {
        return root.uri;
      });
    }

    /**
     * Returns true if the store has no data, i.e. no roots, no children.
     */
  }, {
    key: 'isEmpty',
    value: function isEmpty() {
      return this.roots.isEmpty();
    }
  }, {
    key: '_setVcsStatuses',
    value: function _setVcsStatuses(rootKey, vcsStatuses) {
      var _this7 = this;

      // We can't build on the child-derived properties to maintain vcs statuses in the entire
      // tree, since the reported VCS status may be for a node that is not yet present in the
      // fetched tree, and so it it can't affect its parents statuses. To have the roots colored
      // consistently we manually add all parents of all of the modified nodes up till the root
      var enrichedVcsStatuses = _extends({}, vcsStatuses);

      var ensurePresentParents = function ensurePresentParents(uri) {
        if (uri === rootKey) {
          return;
        }

        var current = uri;
        while (current !== rootKey) {
          current = _FileTreeHelpers2['default'].getParentKey(current);

          if (enrichedVcsStatuses[current] != null) {
            return;
          }

          enrichedVcsStatuses[current] = _nuclideHgRepositoryBaseLibHgConstants.StatusCodeNumber.MODIFIED;
        }
      };

      Object.keys(vcsStatuses).forEach(function (uri) {
        var status = vcsStatuses[uri];
        if (status === _nuclideHgRepositoryBaseLibHgConstants.StatusCodeNumber.MODIFIED || status === _nuclideHgRepositoryBaseLibHgConstants.StatusCodeNumber.ADDED || status === _nuclideHgRepositoryBaseLibHgConstants.StatusCodeNumber.REMOVED) {
          try {
            // An invalid URI might cause an exception to be thrown
            ensurePresentParents(uri);
          } catch (e) {
            _this7._logger.error('Error enriching the VCS statuses for ' + uri, e);
          }
        }
      });

      if (this._vcsStatusesAreDifferent(rootKey, enrichedVcsStatuses)) {
        this._updateConf(function (conf) {
          return conf.vcsStatuses[rootKey] = enrichedVcsStatuses;
        });
      }
    }
  }, {
    key: '_vcsStatusesAreDifferent',
    value: function _vcsStatusesAreDifferent(rootKey, newVcsStatuses) {
      var currentStatuses = this._conf.vcsStatuses[rootKey];
      if (currentStatuses == null || newVcsStatuses == null) {
        if (currentStatuses !== newVcsStatuses) {
          return true;
        }
      }

      var currentKeys = Object.keys(currentStatuses);
      var newKeys = Object.keys(newVcsStatuses);
      if (currentKeys.length !== newKeys.length) {
        return true;
      }

      return newKeys.some(function (key) {
        return currentStatuses[key] !== newVcsStatuses[key];
      });
    }
  }, {
    key: '_setUsePreviewTabs',
    value: function _setUsePreviewTabs(usePreviewTabs) {
      this._updateConf(function (conf) {
        return conf.usePreviewTabs = usePreviewTabs;
      });
    }
  }, {
    key: '_setUsePrefixNav',
    value: function _setUsePrefixNav(usePrefixNav) {
      this._usePrefixNav = usePrefixNav;
    }
  }, {
    key: 'usePrefixNav',
    value: function usePrefixNav() {
      return this._usePrefixNav;
    }

    /**
     * The node child keys may either be available immediately (cached), or
     * require an async fetch. If all of the children are needed it's easier to
     * return as promise, to make the caller oblivious to the way children were
     * fetched.
     */
  }, {
    key: 'promiseNodeChildKeys',
    value: _asyncToGenerator(function* (rootKey, nodeKey) {
      var shownChildrenUris = function shownChildrenUris(node) {
        return node.children.toArray().filter(function (n) {
          return n.shouldBeShown;
        }).map(function (n) {
          return n.uri;
        });
      };

      var node = this.getNode(rootKey, nodeKey);
      if (node == null) {
        return [];
      }

      if (!node.isLoading) {
        return shownChildrenUris(node);
      }

      yield this._fetchChildKeys(nodeKey);
      return this.promiseNodeChildKeys(rootKey, nodeKey);
    })

    /**
    * Uses the .containsSelection child-derived property to efficiently build the list of the
    * currently selected nodes
    */
  }, {
    key: 'getSelectedNodes',
    value: function getSelectedNodes() {
      var selectedNodes = [];
      this.roots.forEach(function (root) {
        root.traverse(function (node) {
          if (node.isSelected) {
            selectedNodes.push(node);
          }
          return node.containsSelection;
        });
      });
      return new _immutable2['default'].List(selectedNodes);
    }

    /**
    * Returns a node if it is the only one selected, or null otherwise
    */
  }, {
    key: 'getSingleSelectedNode',
    value: function getSingleSelectedNode() {
      var selectedNodes = this.getSelectedNodes();

      if (selectedNodes.isEmpty() || selectedNodes.size > 1) {
        return null;
      }

      return selectedNodes.first();
    }
  }, {
    key: 'getNode',
    value: function getNode(rootKey, nodeKey) {
      var rootNode = this.roots.get(rootKey);

      if (rootNode == null) {
        return null;
      }

      return rootNode.find(nodeKey);
    }
  }, {
    key: 'isEditingWorkingSet',
    value: function isEditingWorkingSet() {
      return this._conf.isEditingWorkingSet;
    }

    /**
    * Builds the edited working set from the partially-child-derived .checkedStatus property
    */
  }, {
    key: 'getEditedWorkingSet',
    value: function getEditedWorkingSet() {
      return this._conf.editedWorkingSet;
    }
  }, {
    key: 'isEditedWorkingSetEmpty',
    value: function isEditedWorkingSetEmpty() {
      return this.roots.every(function (root) {
        return root.checkedStatus === 'clear';
      });
    }

    /**
     * Initiates the fetching of node's children if it's not already in the process.
     * Clears the node's .isLoading property once the fetch is complete.
     * Once the fetch is completed, clears the node's .isLoading property, builds the map of the
     * node's children out of the fetched children URIs and a change subscription is created
     * for the node to monitor future changes.
     */
  }, {
    key: '_fetchChildKeys',
    value: function _fetchChildKeys(nodeKey) {
      var _this8 = this;

      var existingPromise = this._getLoading(nodeKey);
      if (existingPromise != null) {
        return existingPromise;
      }

      var promise = _FileTreeHelpers2['default'].fetchChildren(nodeKey)['catch'](function (error) {
        _this8._logger.error('Unable to fetch children for "' + nodeKey + '".');
        _this8._logger.error('Original error: ', error);

        // Collapse the node and clear its loading state on error so the
        // user can retry expanding it.
        _this8._updateNodeAtAllRoots(nodeKey, function (node) {
          return node.set({ isExpanded: false, isLoading: false, children: new _immutable2['default'].OrderedMap() });
        });

        _this8._clearLoading(nodeKey);
      }).then(function (childKeys) {
        var childrenKeys = childKeys || [];
        var directory = _FileTreeHelpers2['default'].getDirectoryByKey(nodeKey);

        // The node with URI === nodeKey might be present at several roots - update them all
        _this8._updateNodeAtAllRoots(nodeKey, function (node) {
          // Maintain the order fetched from the FS
          var childrenNodes = childrenKeys.map(function (uri) {
            var prevNode = node.find(uri);
            // If we already had a child with this URI - keep it
            if (prevNode != null) {
              return prevNode;
            }

            return node.createChild({
              uri: uri,
              isExpanded: false,
              isSelected: false,
              isLoading: false,
              isCwd: false,
              isTracked: false,
              children: new _immutable2['default'].OrderedMap()
            });
          });

          var children = _FileTreeNode.FileTreeNode.childrenFromArray(childrenNodes);
          // In case previous subscription existed - dispose of it
          if (node.subscription != null) {
            node.subscription.dispose();
          }
          // and create a new subscription
          var subscription = _this8._makeSubscription(nodeKey, directory);

          // If the fetch indicated that some children were removed - dispose of all
          // their subscriptions
          var removedChildren = node.children.filter(function (n) {
            return !children.has(n.name);
          });
          removedChildren.forEach(function (c) {
            c.traverse(function (n) {
              if (n.subscription != null) {
                n.subscription.dispose();
              }

              return true;
            });
          });

          return node.set({ isLoading: false, children: children, subscription: subscription });
        });

        _this8._clearLoading(nodeKey);
      });

      this._setLoading(nodeKey, promise);
      return promise;
    }
  }, {
    key: '_makeSubscription',
    value: function _makeSubscription(nodeKey, directory) {
      var _this9 = this;

      if (directory == null) {
        return null;
      }

      try {
        // This call might fail if we try to watch a non-existing directory, or if permission denied.
        return directory.onDidChange(function () {
          _this9._fetchChildKeys(nodeKey);
        });
      } catch (ex) {
        /*
         * Log error and mark the directory as dirty so the failed subscription will be attempted
         * again next time the directory is expanded.
         */
        this._logger.error('Cannot subscribe to directory "' + nodeKey + '"', ex);
        return null;
      }
    }
  }, {
    key: '_getLoading',
    value: function _getLoading(nodeKey) {
      return this._isLoadingMap.get(nodeKey);
    }
  }, {
    key: '_setLoading',
    value: function _setLoading(nodeKey, value) {
      this._isLoadingMap = this._isLoadingMap.set(nodeKey, value);
    }
  }, {
    key: 'hasCwd',
    value: function hasCwd() {
      return this._cwdKey != null;
    }
  }, {
    key: '_setCwdKey',
    value: function _setCwdKey(cwdKey) {
      this._cwdKey = cwdKey;
      this._updateRoots(function (root) {
        return root.setIsCwd(root.uri === cwdKey);
      });
    }
  }, {
    key: 'getFilter',
    value: function getFilter() {
      return this._filter;
    }
  }, {
    key: 'addFilterLetter',
    value: function addFilterLetter(letter) {
      var _this10 = this;

      this._filter = this._filter + letter;
      this._updateRoots(function (root) {
        return root.setRecursive(function (node) {
          return node.containsFilterMatches ? null : node;
        }, function (node) {
          return (0, _FileTreeFilterHelper.matchesFilter)(node.name, _this10._filter) ? node.set({
            highlightedText: _this10._filter,
            matchesFilter: true
          }) : node.set({ highlightedText: '', matchesFilter: false });
        });
      });
      this._selectFirstFilter();
      this._emitChange();
    }
  }, {
    key: 'clearFilter',
    value: function clearFilter() {
      this._filter = '';
      this._updateRoots(function (root) {
        return root.setRecursive(function (node) {
          return null;
        }, function (node) {
          return node.set({ highlightedText: '', matchesFilter: true });
        });
      });
    }
  }, {
    key: 'removeFilterLetter',
    value: function removeFilterLetter() {
      var _this11 = this;

      this._filter = this._filter.substr(0, this._filter.length - 1);
      if (this._filter.length) {
        this._updateRoots(function (root) {
          return root.setRecursive(function (node) {
            return null;
          }, function (node) {
            return (0, _FileTreeFilterHelper.matchesFilter)(node.name, _this11._filter) ? node.set({
              highlightedText: _this11._filter,
              matchesFilter: true
            }) : node.set({ highlightedText: '', matchesFilter: false });
          });
        });
        this._emitChange();
      } else {
        this.clearFilter();
      }
    }
  }, {
    key: 'getFilterFound',
    value: function getFilterFound() {
      return this.roots.some(function (root) {
        return root.containsFilterMatches;
      });
    }

    /**
     * Resets the node to be kept in view if no more data is being awaited. Safe to call many times
     * because it only changes state if a node is being tracked.
     */
  }, {
    key: '_checkTrackedNode',
    value: function _checkTrackedNode() {
      if (
      /*
       * The loading map being empty is a heuristic for when loading has completed. It is inexact
       * because the loading might be unrelated to the tracked node, however it is cheap and false
       * positives will only last until loading is complete or until the user clicks another node in
       * the tree.
       */
      this._isLoadingMap.isEmpty()) {
        // Loading has completed. Allow scrolling to proceed as usual.
        this._clearTrackedNode();
      }
    }
  }, {
    key: '_clearLoading',
    value: function _clearLoading(nodeKey) {
      this._isLoadingMap = this._isLoadingMap['delete'](nodeKey);
    }
  }, {
    key: '_deleteSelectedNodes',
    value: _asyncToGenerator(function* () {
      var selectedNodes = this.getSelectedNodes();
      yield Promise.all(selectedNodes.map(_asyncToGenerator(function* (node) {
        var entry = _FileTreeHelpers2['default'].getEntryByKey(node.uri);

        if (entry == null) {
          return;
        }
        var path = entry.getPath();
        var repository = node.repo;
        if (repository != null && repository.getType() === 'hg') {
          var hgRepository = repository;
          try {
            yield hgRepository.remove(path);
          } catch (e) {
            var statuses = yield hgRepository.getStatuses([path]);
            var pathStatus = statuses.get(path);
            var goodStatuses = [_nuclideHgRepositoryBaseLibHgConstants.StatusCodeNumber.ADDED, _nuclideHgRepositoryBaseLibHgConstants.StatusCodeNumber.CLEAN, _nuclideHgRepositoryBaseLibHgConstants.StatusCodeNumber.MODIFIED];
            if (goodStatuses.indexOf(pathStatus) !== -1) {
              atom.notifications.addError('Failed to remove ' + path + ' from version control.  The file will ' + 'still get deleted but you will have to remove it from your VCS yourself.  Error: ' + e.toString());
            }
          }
        }
        if (_FileTreeHelpers2['default'].isLocalEntry(entry)) {
          // TODO: This special-case can be eliminated once `delete()` is added to `Directory`
          // and `File`.
          _shell2['default'].moveItemToTrash(_FileTreeHelpers2['default'].keyToPath(node.uri));
        } else {
          var remoteFile = entry;
          yield remoteFile['delete']();
        }
      })));
    })
  }, {
    key: '_expandNode',
    value: function _expandNode(rootKey, nodeKey) {
      var _this12 = this;

      this._updateNodeAtRoot(rootKey, nodeKey, function (node) {
        return node.setIsExpanded(true).setRecursive(function (n) {
          return !n.isContainer || !n.isExpanded ? n : null;
        }, function (n) {
          if (n.isContainer && n.isExpanded) {
            _this12._fetchChildKeys(n.uri);
            return n.setIsLoading(true);
          }

          return n;
        });
      });
    }

    /**
     * Performes a deep BFS scanning expand of contained nodes.
     * returns - a promise fulfilled when the expand operation is finished
     */
  }, {
    key: '_expandNodeDeep',
    value: function _expandNodeDeep(rootKey, nodeKey) {
      var _this13 = this;

      // Stop the traversal after 100 nodes were added to the tree
      var itNodes = new FileTreeStoreBfsIterator(this, rootKey, nodeKey, /* limit*/100);
      var promise = new Promise(function (resolve) {
        var expand = function expand() {
          var traversedNodeKey = itNodes.traversedNode();
          if (traversedNodeKey) {
            _this13._expandNode(rootKey, traversedNodeKey);

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
  }, {
    key: '_collapseNode',
    value: function _collapseNode(rootKey, nodeKey) {
      this._updateNodeAtRoot(rootKey, nodeKey, function (node) {
        // Clear all selected nodes under the node being collapsed and dispose their subscriptions
        return node.setRecursive(function (childNode) {
          if (childNode.isExpanded) {
            return null;
          }
          return childNode;
        }, function (childNode) {
          if (childNode.subscription != null) {
            childNode.subscription.dispose();
          }

          if (childNode.uri === node.uri) {
            return childNode.set({ isExpanded: false, subscription: null });
          } else {
            return childNode.set({ isSelected: false, subscription: null });
          }
        });
      });
    }
  }, {
    key: '_collapseNodeDeep',
    value: function _collapseNodeDeep(rootKey, nodeKey) {
      this._updateNodeAtRoot(rootKey, nodeKey, function (node) {
        return node.setRecursive(
        /* prePredicate */null, function (childNode) {
          if (childNode.subscription != null) {
            childNode.subscription.dispose();
          }

          if (childNode !== node) {
            return childNode.set({ isExpanded: false, isSelected: false, subscription: null });
          } else {
            return childNode.set({ isExpanded: false, subscription: null });
          }
        });
      });
    }

    /**
    * Selects a single node and tracks it.
    */
  }, {
    key: '_setSelectedNode',
    value: function _setSelectedNode(rootKey, nodeKey) {
      this._clearSelection();
      this._updateNodeAtRoot(rootKey, nodeKey, function (node) {
        return node.setIsSelected(true);
      });
      this._setTrackedNode(rootKey, nodeKey);
    }
  }, {
    key: '_addSelectedNode',
    value: function _addSelectedNode(rootKey, nodeKey) {
      this._updateNodeAtRoot(rootKey, nodeKey, function (node) {
        return node.setIsSelected(true);
      });
    }
  }, {
    key: '_unselectNode',
    value: function _unselectNode(rootKey, nodeKey) {
      this._updateNodeAtRoot(rootKey, nodeKey, function (node) {
        return node.setIsSelected(false);
      });
    }
  }, {
    key: '_selectFirstFilter',
    value: function _selectFirstFilter() {
      var node = this.getSingleSelectedNode();
      // if the current node matches the filter do nothing
      if (node != null && node.matchesFilter) {
        return;
      }

      this._moveSelectionDown();
      node = this.getSingleSelectedNode();
      // if the selection does not find anything up go down
      if (node != null && !node.matchesFilter) {
        this._moveSelectionUp();
      }
    }

    /**
    * Moves the selection one node down. In case several nodes were selected, the topmost (first in
    * the natural visual order) is considered to be the reference point for the move.
    */
  }, {
    key: '_moveSelectionDown',
    value: function _moveSelectionDown() {
      if (this.roots.isEmpty()) {
        return;
      }

      var selectedNodes = this.getSelectedNodes();

      var nodeToSelect = undefined;
      if (selectedNodes.isEmpty()) {
        nodeToSelect = this.roots.first();
      } else {
        var selectedNode = selectedNodes.first();
        nodeToSelect = selectedNode.findNext();
      }

      while (nodeToSelect != null && !nodeToSelect.matchesFilter) {
        nodeToSelect = nodeToSelect.findNext();
      }

      if (nodeToSelect != null) {
        this._setSelectedNode(nodeToSelect.rootUri, nodeToSelect.uri);
      }
    }

    /**
    * Moves the selection one node up. In case several nodes were selected, the topmost (first in
    * the natural visual order) is considered to be the reference point for the move.
    */
  }, {
    key: '_moveSelectionUp',
    value: function _moveSelectionUp() {
      if (this.roots.isEmpty()) {
        return;
      }

      var selectedNodes = this.getSelectedNodes();

      var nodeToSelect = undefined;
      if (selectedNodes.isEmpty()) {
        nodeToSelect = this.roots.last().findLastRecursiveChild();
      } else {
        var selectedNode = selectedNodes.first();
        nodeToSelect = selectedNode.findPrevious();
      }

      while (nodeToSelect != null && !nodeToSelect.matchesFilter) {
        nodeToSelect = nodeToSelect.findPrevious();
      }

      if (nodeToSelect != null) {
        this._setSelectedNode(nodeToSelect.rootUri, nodeToSelect.uri);
      }
    }
  }, {
    key: '_moveSelectionToTop',
    value: function _moveSelectionToTop() {
      if (this.roots.isEmpty()) {
        return;
      }

      var nodeToSelect = this.roots.first();
      if (nodeToSelect != null && !nodeToSelect.shouldBeShown) {
        nodeToSelect = nodeToSelect.findNext();
      }

      if (nodeToSelect != null) {
        this._setSelectedNode(nodeToSelect.uri, nodeToSelect.uri);
      }
    }
  }, {
    key: '_moveSelectionToBottom',
    value: function _moveSelectionToBottom() {
      if (this.roots.isEmpty()) {
        return;
      }

      var lastRoot = this.roots.last();
      var lastChild = lastRoot.findLastRecursiveChild();
      this._setSelectedNode(lastChild.rootUri, lastChild.uri);
    }
  }, {
    key: '_clearSelection',
    value: function _clearSelection() {
      this._updateRoots(function (root) {
        return root.setRecursive(function (node) {
          return node.containsSelection ? null : node;
        }, function (node) {
          return node.setIsSelected(false);
        });
      });
    }
  }, {
    key: '_setRootKeys',
    value: function _setRootKeys(rootKeys) {
      var _this14 = this;

      var rootNodes = rootKeys.map(function (rootUri) {
        var root = _this14.roots.get(rootUri);
        if (root != null) {
          return root;
        }

        return new _FileTreeNode.FileTreeNode({
          uri: rootUri,
          rootUri: rootUri,
          connectionTitle: _FileTreeHelpers2['default'].getDisplayTitle(rootUri) || ''
        }, _this14._conf);
      });

      var roots = new _immutable2['default'].OrderedMap(rootNodes.map(function (root) {
        return [root.uri, root];
      }));
      var removedRoots = this.roots.filter(function (root) {
        return !roots.has(root.uri);
      });
      removedRoots.forEach(function (root) {
        return root.traverse(function (node) {
          return node.isExpanded;
        }, function (node) {
          if (node.subscription != null) {
            node.subscription.dispose();
          }
        });
      });
      this._setRoots(roots);

      // Just in case there's a race between the update of the root keys and the cwdKey and the cwdKey
      // is set too early - set it again. If there was no race - it's a noop.
      this._setCwdKey(this._cwdKey);
    }

    /**
    * Makes sure a certain child node is present in the file tree, creating all its ancestors, if
    * needed and scheduling a chilld key fetch. Used by the reveal active file functionality.
    */
  }, {
    key: '_ensureChildNode',
    value: function _ensureChildNode(nodeKey) {
      var _this15 = this;

      var firstRootUri = undefined;

      var expandNode = function expandNode(node) {
        if (node.isExpanded && node.subscription != null) {
          return node;
        }

        if (node.subscription != null) {
          node.subscription.dispose();
        }

        var directory = _FileTreeHelpers2['default'].getDirectoryByKey(node.uri);
        var subscription = _this15._makeSubscription(node.uri, directory);
        return node.set({ subscription: subscription, isExpanded: true });
      };

      this._updateRoots(function (root) {
        if (!nodeKey.startsWith(root.uri)) {
          return root;
        }

        if (firstRootUri == null) {
          firstRootUri = root.uri;
        }

        var deepest = root.findDeepest(nodeKey);
        if (deepest == null) {
          return root;
        }

        if (deepest.uri === nodeKey) {
          return _this15._bubbleUp(deepest, deepest, expandNode);
        }

        var parents = [];
        var currentParentUri = _FileTreeHelpers2['default'].getParentKey(nodeKey);
        while (currentParentUri !== deepest.uri) {
          parents.push(currentParentUri);
          currentParentUri = _FileTreeHelpers2['default'].getParentKey(currentParentUri);
        }

        var currentChild = deepest.createChild({ uri: nodeKey });

        parents.forEach(function (currentUri) {
          _this15._fetchChildKeys(currentUri);
          var parent = deepest.createChild({
            uri: currentUri,
            isLoading: true,
            isExpanded: true,
            children: _FileTreeNode.FileTreeNode.childrenFromArray([currentChild])
          });

          currentChild = parent;
        });

        _this15._fetchChildKeys(deepest.uri);
        return _this15._bubbleUp(deepest, deepest.set({
          isLoading: true,
          isExpanded: true,
          children: deepest.children.set(currentChild.name, currentChild)
        }), expandNode);
      });

      if (firstRootUri != null) {
        this._setSelectedNode(firstRootUri, nodeKey);
      }
    }
  }, {
    key: '_clearTrackedNode',
    value: function _clearTrackedNode() {
      this._updateRoots(function (root) {
        if (!root.containsTrackedNode) {
          return root;
        }

        return root.setRecursive(function (node) {
          return node.containsTrackedNode ? null : node;
        }, function (node) {
          return node.setIsTracked(false);
        });
      });
    }
  }, {
    key: '_setTrackedNode',
    value: function _setTrackedNode(rootKey, nodeKey) {
      this._clearTrackedNode();
      this._updateNodeAtRoot(rootKey, nodeKey, function (node) {
        return node.setIsTracked(true);
      });
    }
  }, {
    key: '_setRepositories',
    value: function _setRepositories(repositories) {
      var _this16 = this;

      this._repositories = repositories;
      this._updateConf(function (conf) {
        var reposByRoot = {};
        _this16.roots.forEach(function (root) {
          reposByRoot[root.uri] = (0, _nuclideHgGitBridge.repositoryForPath)(root.uri);
        });
        conf.reposByRoot = reposByRoot;
      });
    }
  }, {
    key: '_setWorkingSet',
    value: function _setWorkingSet(workingSet) {
      this._updateConf(function (conf) {
        return conf.workingSet = workingSet;
      });
    }
  }, {
    key: '_setOpenFilesWorkingSet',
    value: function _setOpenFilesWorkingSet(openFilesWorkingSet) {
      this._updateConf(function (conf) {
        return conf.openFilesWorkingSet = openFilesWorkingSet;
      });
    }
  }, {
    key: '_setWorkingSetsStore',
    value: function _setWorkingSetsStore(workingSetsStore) {
      this._workingSetsStore = workingSetsStore;
    }
  }, {
    key: '_startEditingWorkingSet',
    value: function _startEditingWorkingSet(editedWorkingSet) {
      this._updateConf(function (conf) {
        conf.editedWorkingSet = editedWorkingSet;
        conf.isEditingWorkingSet = true;
      });
    }
  }, {
    key: '_finishEditingWorkingSet',
    value: function _finishEditingWorkingSet() {
      this._updateConf(function (conf) {
        conf.isEditingWorkingSet = false;
        conf.editedWorkingSet = new _nuclideWorkingSets.WorkingSet();
      });
    }
  }, {
    key: '_checkNode',
    value: function _checkNode(rootKey, nodeKey) {
      if (!this._conf.isEditingWorkingSet) {
        return;
      }

      var node = this.getNode(rootKey, nodeKey);
      if (node == null) {
        return;
      }

      var uriToAppend = nodeKey; // Workaround flow's (over)aggressive nullability detection

      var allChecked = function allChecked(nodeParent) {
        return nodeParent.children.every(function (c) {
          return !c.shouldBeShown || c.checkedStatus === 'checked' || c === node;
        });
      };

      while (node.parent != null && allChecked(node.parent)) {
        node = node.parent;
        uriToAppend = node.uri;
      }

      this._updateConf(function (conf) {
        conf.editedWorkingSet = conf.editedWorkingSet.append(uriToAppend);
      });
    }
  }, {
    key: '_uncheckNode',
    value: function _uncheckNode(rootKey, nodeKey) {
      if (!this._conf.isEditingWorkingSet) {
        return;
      }

      var node = this.getNode(rootKey, nodeKey);
      if (node == null) {
        return;
      }

      var nodesToAppend = [];
      var uriToRemove = nodeKey;

      while (node.parent != null && node.parent.checkedStatus === 'checked') {
        var _parent = node.parent; // Workaround flow's (over)aggressive nullability detection
        _parent.children.forEach(function (c) {
          if (c !== node) {
            nodesToAppend.push(c);
          }
        });

        node = _parent;
        uriToRemove = node.uri;
      }

      this._updateConf(function (conf) {
        var _conf$editedWorkingSet$remove;

        var urisToAppend = nodesToAppend.map(function (n) {
          return n.uri;
        });
        conf.editedWorkingSet = (_conf$editedWorkingSet$remove = conf.editedWorkingSet.remove(uriToRemove)).append.apply(_conf$editedWorkingSet$remove, _toConsumableArray(urisToAppend));
      });
    }
  }, {
    key: 'reset',
    value: function reset() {
      this.roots.forEach(function (root) {
        root.traverse(function (n) {
          if (n.subscription != null) {
            n.subscription.dispose();
          }

          return true;
        });
      });

      // Reset data store.
      this._conf = DEFAULT_CONF;
      this._setRoots(new _immutable2['default'].OrderedMap());
    }
  }, {
    key: 'subscribe',
    value: function subscribe(listener) {
      return this._emitter.on('change', listener);
    }
  }]);

  return FileTreeStore;
})();

exports.FileTreeStore = FileTreeStore;

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

// The configuration for the file-tree. Avoid direct writing.
//# sourceMappingURL=data:application/json;base64,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IEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7SGdSZXBvc2l0b3J5Q2xpZW50fSBmcm9tICcuLi8uLi9udWNsaWRlLWhnLXJlcG9zaXRvcnktY2xpZW50JztcbmltcG9ydCB0eXBlIHtcbiAgUmVtb3RlRGlyZWN0b3J5LFxuICBSZW1vdGVGaWxlLFxufSBmcm9tICcuLi8uLi9udWNsaWRlLXJlbW90ZS1jb25uZWN0aW9uJztcblxuaW1wb3J0IEZpbGVUcmVlRGlzcGF0Y2hlciBmcm9tICcuL0ZpbGVUcmVlRGlzcGF0Y2hlcic7XG5pbXBvcnQgRmlsZVRyZWVIZWxwZXJzIGZyb20gJy4vRmlsZVRyZWVIZWxwZXJzJztcbmltcG9ydCB7RmlsZVRyZWVOb2RlfSBmcm9tICcuL0ZpbGVUcmVlTm9kZSc7XG5pbXBvcnQgSW1tdXRhYmxlIGZyb20gJ2ltbXV0YWJsZSc7XG5pbXBvcnQge0FjdGlvblR5cGV9IGZyb20gJy4vRmlsZVRyZWVDb25zdGFudHMnO1xuaW1wb3J0IHtFbWl0dGVyfSBmcm9tICdhdG9tJztcbmltcG9ydCB7bWF0Y2hlc0ZpbHRlcn0gZnJvbSAnLi9GaWxlVHJlZUZpbHRlckhlbHBlcic7XG5pbXBvcnQge01pbmltYXRjaH0gZnJvbSAnbWluaW1hdGNoJztcbmltcG9ydCB7cmVwb3NpdG9yeUZvclBhdGh9IGZyb20gJy4uLy4uL251Y2xpZGUtaGctZ2l0LWJyaWRnZSc7XG5pbXBvcnQge1N0YXR1c0NvZGVOdW1iZXJ9IGZyb20gJy4uLy4uL251Y2xpZGUtaGctcmVwb3NpdG9yeS1iYXNlL2xpYi9oZy1jb25zdGFudHMnO1xuaW1wb3J0IHtnZXRMb2dnZXJ9IGZyb20gJy4uLy4uL251Y2xpZGUtbG9nZ2luZyc7XG5pbXBvcnQgc2hlbGwgZnJvbSAnc2hlbGwnO1xuXG5pbXBvcnQge1dvcmtpbmdTZXR9IGZyb20gJy4uLy4uL251Y2xpZGUtd29ya2luZy1zZXRzJztcbmltcG9ydCB7dHJhY2t9IGZyb20gJy4uLy4uL251Y2xpZGUtYW5hbHl0aWNzJztcblxuLy8gVXNlZCB0byBlbnN1cmUgdGhlIHZlcnNpb24gd2Ugc2VyaWFsaXplZCBpcyB0aGUgc2FtZSB2ZXJzaW9uIHdlIGFyZSBkZXNlcmlhbGl6aW5nLlxuY29uc3QgVkVSU0lPTiA9IDE7XG5cbmltcG9ydCB0eXBlIHtEaXJlY3Rvcnl9IGZyb20gJy4vRmlsZVRyZWVIZWxwZXJzJztcbmltcG9ydCB0eXBlIHtEaXNwYXRjaGVyfSBmcm9tICdmbHV4JztcbmltcG9ydCB0eXBlIHtOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9udWNsaWRlLXJlbW90ZS11cmknO1xuaW1wb3J0IHR5cGUge1dvcmtpbmdTZXRzU3RvcmV9IGZyb20gJy4uLy4uL251Y2xpZGUtd29ya2luZy1zZXRzL2xpYi9Xb3JraW5nU2V0c1N0b3JlJztcbmltcG9ydCB0eXBlIHtTdGF0dXNDb2RlTnVtYmVyVmFsdWV9IGZyb20gJy4uLy4uL251Y2xpZGUtaGctcmVwb3NpdG9yeS1iYXNlL2xpYi9IZ1NlcnZpY2UnO1xuXG5cbnR5cGUgQWN0aW9uUGF5bG9hZCA9IE9iamVjdDtcbnR5cGUgQ2hhbmdlTGlzdGVuZXIgPSAoKSA9PiBtaXhlZDtcblxuZXhwb3J0IHR5cGUgRXhwb3J0U3RvcmVEYXRhID0ge1xuICBjaGlsZEtleU1hcDogeyBba2V5OiBzdHJpbmddOiBBcnJheTxzdHJpbmc+IH07XG4gIGV4cGFuZGVkS2V5c0J5Um9vdDogeyBba2V5OiBzdHJpbmddOiBBcnJheTxzdHJpbmc+IH07XG4gIHJvb3RLZXlzOiBBcnJheTxzdHJpbmc+O1xuICBzZWxlY3RlZEtleXNCeVJvb3Q6IHsgW2tleTogc3RyaW5nXTogQXJyYXk8c3RyaW5nPiB9O1xuICB2ZXJzaW9uOiBudW1iZXI7XG59O1xuXG5leHBvcnQgdHlwZSBTdG9yZUNvbmZpZ0RhdGEgPSB7XG4gICAgdmNzU3RhdHVzZXM6IHtbcm9vdFVyaTogTnVjbGlkZVVyaV06IHtbcGF0aDogTnVjbGlkZVVyaV06IFN0YXR1c0NvZGVOdW1iZXJWYWx1ZX19O1xuICAgIHdvcmtpbmdTZXQ6IFdvcmtpbmdTZXQ7XG4gICAgaGlkZUlnbm9yZWROYW1lczogYm9vbGVhbjtcbiAgICBleGNsdWRlVmNzSWdub3JlZFBhdGhzOiBib29sZWFuO1xuICAgIGlnbm9yZWRQYXR0ZXJuczogSW1tdXRhYmxlLlNldDxNaW5pbWF0Y2g+O1xuICAgIHVzZVByZXZpZXdUYWJzOiBib29sZWFuO1xuICAgIGlzRWRpdGluZ1dvcmtpbmdTZXQ6IGJvb2xlYW47XG4gICAgb3BlbkZpbGVzV29ya2luZ1NldDogV29ya2luZ1NldDtcbiAgICByZXBvc0J5Um9vdDoge1tyb290VXJpOiBOdWNsaWRlVXJpXTogYXRvbSRSZXBvc2l0b3J5fTtcbiAgICBlZGl0ZWRXb3JraW5nU2V0OiBXb3JraW5nU2V0O1xufTtcblxuZXhwb3J0IHR5cGUgTm9kZUNoZWNrZWRTdGF0dXMgPSAnY2hlY2tlZCcgfCAnY2xlYXInIHwgJ3BhcnRpYWwnO1xuXG5cbmNvbnN0IERFRkFVTFRfQ09ORiA9IHtcbiAgdmNzU3RhdHVzZXM6IHt9LFxuICB3b3JraW5nU2V0OiBuZXcgV29ya2luZ1NldCgpLFxuICBlZGl0ZWRXb3JraW5nU2V0OiBuZXcgV29ya2luZ1NldCgpLFxuICBoaWRlSWdub3JlZE5hbWVzOiB0cnVlLFxuICBleGNsdWRlVmNzSWdub3JlZFBhdGhzOiB0cnVlLFxuICBpZ25vcmVkUGF0dGVybnM6IG5ldyBJbW11dGFibGUuU2V0KCksXG4gIHVzZVByZXZpZXdUYWJzOiBmYWxzZSxcbiAgaXNFZGl0aW5nV29ya2luZ1NldDogZmFsc2UsXG4gIG9wZW5GaWxlc1dvcmtpbmdTZXQ6IG5ldyBXb3JraW5nU2V0KCksXG4gIHJlcG9zQnlSb290OiB7fSxcbn07XG5cbmxldCBpbnN0YW5jZTogP09iamVjdDtcblxuLyoqXG4gKiBJbXBsZW1lbnRzIHRoZSBGbHV4IHBhdHRlcm4gZm9yIG91ciBmaWxlIHRyZWUuIEFsbCBzdGF0ZSBmb3IgdGhlIGZpbGUgdHJlZSB3aWxsIGJlIGtlcHQgaW5cbiAqIEZpbGVUcmVlU3RvcmUgYW5kIHRoZSBvbmx5IHdheSB0byB1cGRhdGUgdGhlIHN0b3JlIGlzIHRocm91Z2ggbWV0aG9kcyBvbiBGaWxlVHJlZUFjdGlvbnMuIFRoZVxuICogZGlzcGF0Y2hlciBpcyBhIG1lY2hhbmlzbSB0aHJvdWdoIHdoaWNoIEZpbGVUcmVlQWN0aW9ucyBpbnRlcmZhY2VzIHdpdGggRmlsZVRyZWVTdG9yZS5cbiAqL1xuZXhwb3J0IGNsYXNzIEZpbGVUcmVlU3RvcmUge1xuICByb290czogSW1tdXRhYmxlLk9yZGVyZWRNYXA8TnVjbGlkZVVyaSwgRmlsZVRyZWVOb2RlPjtcbiAgX2NvbmY6IFN0b3JlQ29uZmlnRGF0YTsgLy8gVGhlIGNvbmZpZ3VyYXRpb24gZm9yIHRoZSBmaWxlLXRyZWUuIEF2b2lkIGRpcmVjdCB3cml0aW5nLlxuICBfd29ya2luZ1NldHNTdG9yZTogP1dvcmtpbmdTZXRzU3RvcmU7XG4gIF91c2VQcmVmaXhOYXY6IGJvb2xlYW47XG4gIF9pc0xvYWRpbmdNYXA6IEltbXV0YWJsZS5NYXA8TnVjbGlkZVVyaSwgUHJvbWlzZTx2b2lkPj47XG4gIF9yZXBvc2l0b3JpZXM6IEltbXV0YWJsZS5TZXQ8YXRvbSRSZXBvc2l0b3J5PjtcblxuICBfZGlzcGF0Y2hlcjogRGlzcGF0Y2hlcjtcbiAgX2VtaXR0ZXI6IEVtaXR0ZXI7XG4gIF9sb2dnZXI6IGFueTtcbiAgX2FuaW1hdGlvbkZyYW1lUmVxdWVzdElkOiA/bnVtYmVyO1xuICBfc3VwcHJlc3NDaGFuZ2VzOiBib29sZWFuO1xuICBfY3dkS2V5OiA/TnVjbGlkZVVyaTtcbiAgX2ZpbHRlcjogc3RyaW5nO1xuXG4gIHN0YXRpYyBnZXRJbnN0YW5jZSgpOiBGaWxlVHJlZVN0b3JlIHtcbiAgICBpZiAoIWluc3RhbmNlKSB7XG4gICAgICBpbnN0YW5jZSA9IG5ldyBGaWxlVHJlZVN0b3JlKCk7XG4gICAgfVxuICAgIHJldHVybiBpbnN0YW5jZTtcbiAgfVxuXG4gIHN0YXRpYyBkaXNwb3NlKCk6IHZvaWQge1xuICAgIGlmIChpbnN0YW5jZSAhPSBudWxsKSB7XG4gICAgICBpbnN0YW5jZS5kaXNwb3NlKCk7XG4gICAgfVxuXG4gICAgaW5zdGFuY2UgPSBudWxsO1xuICB9XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5yb290cyA9IG5ldyBJbW11dGFibGUuT3JkZXJlZE1hcCgpO1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIgPSBGaWxlVHJlZURpc3BhdGNoZXIuZ2V0SW5zdGFuY2UoKTtcbiAgICB0aGlzLl9lbWl0dGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICB0aGlzLl9kaXNwYXRjaGVyLnJlZ2lzdGVyKFxuICAgICAgcGF5bG9hZCA9PiB0aGlzLl9vbkRpc3BhdGNoKHBheWxvYWQpXG4gICAgKTtcbiAgICB0aGlzLl9sb2dnZXIgPSBnZXRMb2dnZXIoKTtcblxuICAgIHRoaXMuX3VzZVByZWZpeE5hdiA9IGZhbHNlO1xuICAgIHRoaXMuX2lzTG9hZGluZ01hcCA9IG5ldyBJbW11dGFibGUuTWFwKCk7XG4gICAgdGhpcy5fcmVwb3NpdG9yaWVzID0gbmV3IEltbXV0YWJsZS5TZXQoKTtcblxuICAgIHRoaXMuX2NvbmYgPSBERUZBVUxUX0NPTkY7XG4gICAgZ2xvYmFsLkZUQ29uZiA9IHRoaXMuX2NvbmY7XG4gICAgdGhpcy5fc3VwcHJlc3NDaGFuZ2VzID0gZmFsc2U7XG4gICAgdGhpcy5fZmlsdGVyID0gJyc7XG4gIH1cblxuICAvKipcbiAgICogVE9ETzogTW92ZSB0byBhIFtzZXJpYWxpemF0aW9uIGNsYXNzXVsxXSBhbmQgdXNlIHRoZSBidWlsdC1pbiB2ZXJzaW9uaW5nIG1lY2hhbmlzbS4gVGhpcyBtaWdodFxuICAgKiBuZWVkIHRvIGJlIGRvbmUgb25lIGxldmVsIGhpZ2hlciB3aXRoaW4gbWFpbi5qcy5cbiAgICpcbiAgICogWzFdOiBodHRwczovL2F0b20uaW8vZG9jcy9sYXRlc3QvYmVoaW5kLWF0b20tc2VyaWFsaXphdGlvbi1pbi1hdG9tXG4gICAqL1xuICBleHBvcnREYXRhKCk6IEV4cG9ydFN0b3JlRGF0YSB7XG4gICAgY29uc3QgY2hpbGRLZXlNYXAgPSB7fTtcbiAgICBjb25zdCBleHBhbmRlZEtleXNCeVJvb3QgPSB7fTtcbiAgICBjb25zdCBzZWxlY3RlZEtleXNCeVJvb3QgPSB7fTtcblxuICAgIHRoaXMucm9vdHMuZm9yRWFjaChyb290ID0+IHtcbiAgICAgIGNvbnN0IGV4cGFuZGVkS2V5cyA9IFtdO1xuICAgICAgY29uc3Qgc2VsZWN0ZWRLZXlzID0gW107XG5cbiAgICAgIC8vIEdyYWIgdGhlIGRhdGEgb2Ygb25seSB0aGUgZXhwYW5kZWQgcG9ydGlvbiBvZiB0aGUgdHJlZS5cbiAgICAgIHJvb3QudHJhdmVyc2UoXG4gICAgICAgIG5vZGUgPT4ge1xuICAgICAgICAgIGlmIChub2RlLmlzU2VsZWN0ZWQpIHtcbiAgICAgICAgICAgIHNlbGVjdGVkS2V5cy5wdXNoKG5vZGUudXJpKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoIW5vZGUuaXNFeHBhbmRlZCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGV4cGFuZGVkS2V5cy5wdXNoKG5vZGUudXJpKTtcblxuICAgICAgICAgIGlmICghbm9kZS5jaGlsZHJlbi5pc0VtcHR5KCkpIHtcbiAgICAgICAgICAgIGNoaWxkS2V5TWFwW25vZGUudXJpXSA9IG5vZGUuY2hpbGRyZW4ubWFwKGNoaWxkID0+IGNoaWxkLnVyaSkudG9BcnJheSgpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICApO1xuXG4gICAgICBleHBhbmRlZEtleXNCeVJvb3Rbcm9vdC51cmldID0gZXhwYW5kZWRLZXlzO1xuICAgICAgc2VsZWN0ZWRLZXlzQnlSb290W3Jvb3QudXJpXSA9IHNlbGVjdGVkS2V5cztcbiAgICB9KTtcblxuICAgIGNvbnN0IHJvb3RLZXlzID0gdGhpcy5yb290cy5tYXAocm9vdCA9PiByb290LnVyaSkudG9BcnJheSgpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIHZlcnNpb246IFZFUlNJT04sXG4gICAgICBjaGlsZEtleU1hcDogY2hpbGRLZXlNYXAsXG4gICAgICBleHBhbmRlZEtleXNCeVJvb3QsXG4gICAgICByb290S2V5cyxcbiAgICAgIHNlbGVjdGVkS2V5c0J5Um9vdCxcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIEltcG9ydHMgc3RvcmUgZGF0YSBmcm9tIGEgcHJldmlvdXMgZXhwb3J0LlxuICAgKi9cbiAgbG9hZERhdGEoZGF0YTogRXhwb3J0U3RvcmVEYXRhKTogdm9pZCB7XG4gICAgLy8gRW5zdXJlIHdlIGFyZSBub3QgdHJ5aW5nIHRvIGxvYWQgZGF0YSBmcm9tIGFuIGVhcmxpZXIgdmVyc2lvbiBvZiB0aGlzIHBhY2thZ2UuXG4gICAgaWYgKGRhdGEudmVyc2lvbiAhPT0gVkVSU0lPTikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGJ1aWxkTm9kZSA9IChyb290VXJpOiBzdHJpbmcsIHVyaTogc3RyaW5nKSA9PiB7XG4gICAgICBjb25zdCByb290RXhwYW5kZWRLZXlzID0gZGF0YS5leHBhbmRlZEtleXNCeVJvb3Rbcm9vdFVyaV0gfHwgW107XG4gICAgICBjb25zdCByb290U2VsZWN0ZWRLZXlzID0gZGF0YS5zZWxlY3RlZEtleXNCeVJvb3Rbcm9vdFVyaV0gfHwgW107XG4gICAgICBjb25zdCBjaGlsZHJlblVyaXMgPSBkYXRhLmNoaWxkS2V5TWFwW3VyaV0gfHwgW107XG4gICAgICBjb25zdCBjaGlsZHJlbiA9IEZpbGVUcmVlTm9kZS5jaGlsZHJlbkZyb21BcnJheShcbiAgICAgICAgY2hpbGRyZW5VcmlzLm1hcChjaGlsZFVyaSA9PiBidWlsZE5vZGUocm9vdFVyaSwgY2hpbGRVcmkpKVxuICAgICAgKTtcblxuICAgICAgY29uc3QgaXNFeHBhbmRlZCA9IHJvb3RFeHBhbmRlZEtleXMuaW5kZXhPZih1cmkpID49IDA7XG4gICAgICBsZXQgaXNMb2FkaW5nID0gZmFsc2U7XG5cbiAgICAgIGlmIChpc0V4cGFuZGVkICYmIEZpbGVUcmVlSGVscGVycy5pc0RpcktleSh1cmkpKSB7XG4gICAgICAgIHRoaXMuX2ZldGNoQ2hpbGRLZXlzKHVyaSk7XG4gICAgICAgIGlzTG9hZGluZyA9IHRydWU7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBuZXcgRmlsZVRyZWVOb2RlKHtcbiAgICAgICAgdXJpLFxuICAgICAgICByb290VXJpLFxuICAgICAgICBpc0V4cGFuZGVkLFxuICAgICAgICBpc1NlbGVjdGVkOiByb290U2VsZWN0ZWRLZXlzLmluZGV4T2YodXJpKSA+PSAwLFxuICAgICAgICBpc0xvYWRpbmcsXG4gICAgICAgIGlzVHJhY2tlZDogZmFsc2UsXG4gICAgICAgIGNoaWxkcmVuLFxuICAgICAgICBpc0N3ZDogZmFsc2UsXG4gICAgICAgIGNvbm5lY3Rpb25UaXRsZTogRmlsZVRyZWVIZWxwZXJzLmdldERpc3BsYXlUaXRsZShyb290VXJpKSB8fCAnJyxcbiAgICAgIH0sXG4gICAgICB0aGlzLl9jb25mKTtcbiAgICB9O1xuXG4gICAgdGhpcy5fc2V0Um9vdHMobmV3IEltbXV0YWJsZS5PcmRlcmVkTWFwKFxuICAgICAgZGF0YS5yb290S2V5cy5tYXAocm9vdFVyaSA9PiBbcm9vdFVyaSwgYnVpbGROb2RlKHJvb3RVcmksIHJvb3RVcmkpXSlcbiAgICApKTtcbiAgfVxuXG4gIF9zZXRFeGNsdWRlVmNzSWdub3JlZFBhdGhzKGV4Y2x1ZGVWY3NJZ25vcmVkUGF0aHM6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB0aGlzLl91cGRhdGVDb25mKGNvbmYgPT4gY29uZi5leGNsdWRlVmNzSWdub3JlZFBhdGhzID0gZXhjbHVkZVZjc0lnbm9yZWRQYXRocyk7XG4gIH1cblxuICBfc2V0SGlkZUlnbm9yZWROYW1lcyhoaWRlSWdub3JlZE5hbWVzOiBib29sZWFuKTogdm9pZCB7XG4gICAgdGhpcy5fdXBkYXRlQ29uZihjb25mID0+IGNvbmYuaGlkZUlnbm9yZWROYW1lcyA9IGhpZGVJZ25vcmVkTmFtZXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdpdmVuIGEgbGlzdCBvZiBuYW1lcyB0byBpZ25vcmUsIGNvbXBpbGUgdGhlbSBpbnRvIG1pbmltYXRjaCBwYXR0ZXJucyBhbmRcbiAgICogdXBkYXRlIHRoZSBzdG9yZSB3aXRoIHRoZW0uXG4gICAqL1xuICBfc2V0SWdub3JlZE5hbWVzKGlnbm9yZWROYW1lczogQXJyYXk8c3RyaW5nPikge1xuICAgIGNvbnN0IGlnbm9yZWRQYXR0ZXJucyA9IEltbXV0YWJsZS5TZXQoaWdub3JlZE5hbWVzKVxuICAgICAgLm1hcChpZ25vcmVkTmFtZSA9PiB7XG4gICAgICAgIGlmIChpZ25vcmVkTmFtZSA9PT0gJycpIHtcbiAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICB0cnkge1xuICAgICAgICAgIHJldHVybiBuZXcgTWluaW1hdGNoKGlnbm9yZWROYW1lLCB7bWF0Y2hCYXNlOiB0cnVlLCBkb3Q6IHRydWV9KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZyhcbiAgICAgICAgICAgIGBFcnJvciBwYXJzaW5nIHBhdHRlcm4gJyR7aWdub3JlZE5hbWV9JyBmcm9tIFwiU2V0dGluZ3NcIiA+IFwiSWdub3JlZCBOYW1lc1wiYCxcbiAgICAgICAgICAgIHtkZXRhaWw6IGVycm9yLm1lc3NhZ2V9LFxuICAgICAgICAgICk7XG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICAuZmlsdGVyKHBhdHRlcm4gPT4gcGF0dGVybiAhPSBudWxsKTtcbiAgICB0aGlzLl91cGRhdGVDb25mKGNvbmYgPT4gY29uZi5pZ25vcmVkUGF0dGVybnMgPSBpZ25vcmVkUGF0dGVybnMpO1xuICB9XG5cbiAgX29uRGlzcGF0Y2gocGF5bG9hZDogQWN0aW9uUGF5bG9hZCk6IHZvaWQge1xuICAgIHN3aXRjaCAocGF5bG9hZC5hY3Rpb25UeXBlKSB7XG4gICAgICBjYXNlIEFjdGlvblR5cGUuREVMRVRFX1NFTEVDVEVEX05PREVTOlxuICAgICAgICB0aGlzLl9kZWxldGVTZWxlY3RlZE5vZGVzKCkuY2F0Y2goZXJyb3IgPT4ge1xuICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcignRGVsZXRpbmcgbm9kZXMgZmFpbGVkIHdpdGggYW4gZXJyb3I6ICcgKyBlcnJvci50b1N0cmluZygpKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBBY3Rpb25UeXBlLlNFVF9DV0Q6XG4gICAgICAgIHRoaXMuX3NldEN3ZEtleShwYXlsb2FkLnJvb3RLZXkpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQWN0aW9uVHlwZS5TRVRfVFJBQ0tFRF9OT0RFOlxuICAgICAgICB0aGlzLl9zZXRUcmFja2VkTm9kZShwYXlsb2FkLnJvb3RLZXksIHBheWxvYWQubm9kZUtleSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBBY3Rpb25UeXBlLlNFVF9ST09UX0tFWVM6XG4gICAgICAgIHRoaXMuX3NldFJvb3RLZXlzKHBheWxvYWQucm9vdEtleXMpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQWN0aW9uVHlwZS5FWFBBTkRfTk9ERTpcbiAgICAgICAgdGhpcy5fZXhwYW5kTm9kZShwYXlsb2FkLnJvb3RLZXksIHBheWxvYWQubm9kZUtleSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBBY3Rpb25UeXBlLkVYUEFORF9OT0RFX0RFRVA6XG4gICAgICAgIHRoaXMuX2V4cGFuZE5vZGVEZWVwKHBheWxvYWQucm9vdEtleSwgcGF5bG9hZC5ub2RlS2V5KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEFjdGlvblR5cGUuQ09MTEFQU0VfTk9ERTpcbiAgICAgICAgdGhpcy5fY29sbGFwc2VOb2RlKHBheWxvYWQucm9vdEtleSwgcGF5bG9hZC5ub2RlS2V5KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEFjdGlvblR5cGUuU0VUX0VYQ0xVREVfVkNTX0lHTk9SRURfUEFUSFM6XG4gICAgICAgIHRoaXMuX3NldEV4Y2x1ZGVWY3NJZ25vcmVkUGF0aHMocGF5bG9hZC5leGNsdWRlVmNzSWdub3JlZFBhdGhzKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEFjdGlvblR5cGUuU0VUX1VTRV9QUkVWSUVXX1RBQlM6XG4gICAgICAgIHRoaXMuX3NldFVzZVByZXZpZXdUYWJzKHBheWxvYWQudXNlUHJldmlld1RhYnMpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQWN0aW9uVHlwZS5TRVRfVVNFX1BSRUZJWF9OQVY6XG4gICAgICAgIHRoaXMuX3NldFVzZVByZWZpeE5hdihwYXlsb2FkLnVzZVByZWZpeE5hdik7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBBY3Rpb25UeXBlLkNPTExBUFNFX05PREVfREVFUDpcbiAgICAgICAgdGhpcy5fY29sbGFwc2VOb2RlRGVlcChwYXlsb2FkLnJvb3RLZXksIHBheWxvYWQubm9kZUtleSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBBY3Rpb25UeXBlLlNFVF9ISURFX0lHTk9SRURfTkFNRVM6XG4gICAgICAgIHRoaXMuX3NldEhpZGVJZ25vcmVkTmFtZXMocGF5bG9hZC5oaWRlSWdub3JlZE5hbWVzKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEFjdGlvblR5cGUuU0VUX0lHTk9SRURfTkFNRVM6XG4gICAgICAgIHRoaXMuX3NldElnbm9yZWROYW1lcyhwYXlsb2FkLmlnbm9yZWROYW1lcyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBBY3Rpb25UeXBlLlNFVF9WQ1NfU1RBVFVTRVM6XG4gICAgICAgIHRoaXMuX3NldFZjc1N0YXR1c2VzKHBheWxvYWQucm9vdEtleSwgcGF5bG9hZC52Y3NTdGF0dXNlcyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBBY3Rpb25UeXBlLlNFVF9SRVBPU0lUT1JJRVM6XG4gICAgICAgIHRoaXMuX3NldFJlcG9zaXRvcmllcyhwYXlsb2FkLnJlcG9zaXRvcmllcyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBBY3Rpb25UeXBlLlNFVF9XT1JLSU5HX1NFVDpcbiAgICAgICAgdGhpcy5fc2V0V29ya2luZ1NldChwYXlsb2FkLndvcmtpbmdTZXQpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQWN0aW9uVHlwZS5TRVRfT1BFTl9GSUxFU19XT1JLSU5HX1NFVDpcbiAgICAgICAgdGhpcy5fc2V0T3BlbkZpbGVzV29ya2luZ1NldChwYXlsb2FkLm9wZW5GaWxlc1dvcmtpbmdTZXQpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQWN0aW9uVHlwZS5TRVRfV09SS0lOR19TRVRTX1NUT1JFOlxuICAgICAgICB0aGlzLl9zZXRXb3JraW5nU2V0c1N0b3JlKHBheWxvYWQud29ya2luZ1NldHNTdG9yZSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBBY3Rpb25UeXBlLlNUQVJUX0VESVRJTkdfV09SS0lOR19TRVQ6XG4gICAgICAgIHRoaXMuX3N0YXJ0RWRpdGluZ1dvcmtpbmdTZXQocGF5bG9hZC5lZGl0ZWRXb3JraW5nU2V0KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEFjdGlvblR5cGUuRklOSVNIX0VESVRJTkdfV09SS0lOR19TRVQ6XG4gICAgICAgIHRoaXMuX2ZpbmlzaEVkaXRpbmdXb3JraW5nU2V0KCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBBY3Rpb25UeXBlLkNIRUNLX05PREU6XG4gICAgICAgIHRoaXMuX2NoZWNrTm9kZShwYXlsb2FkLnJvb3RLZXksIHBheWxvYWQubm9kZUtleSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBBY3Rpb25UeXBlLlVOQ0hFQ0tfTk9ERTpcbiAgICAgICAgdGhpcy5fdW5jaGVja05vZGUocGF5bG9hZC5yb290S2V5LCBwYXlsb2FkLm5vZGVLZXkpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBBY3Rpb25UeXBlLlNFVF9TRUxFQ1RFRF9OT0RFOlxuICAgICAgICB0aGlzLl9zZXRTZWxlY3RlZE5vZGUocGF5bG9hZC5yb290S2V5LCBwYXlsb2FkLm5vZGVLZXkpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQWN0aW9uVHlwZS5BRERfU0VMRUNURURfTk9ERTpcbiAgICAgICAgdGhpcy5fYWRkU2VsZWN0ZWROb2RlKHBheWxvYWQucm9vdEtleSwgcGF5bG9hZC5ub2RlS2V5KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEFjdGlvblR5cGUuVU5TRUxFQ1RfTk9ERTpcbiAgICAgICAgdGhpcy5fdW5zZWxlY3ROb2RlKHBheWxvYWQucm9vdEtleSwgcGF5bG9hZC5ub2RlS2V5KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEFjdGlvblR5cGUuTU9WRV9TRUxFQ1RJT05fVVA6XG4gICAgICAgIHRoaXMuX21vdmVTZWxlY3Rpb25VcCgpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQWN0aW9uVHlwZS5NT1ZFX1NFTEVDVElPTl9ET1dOOlxuICAgICAgICB0aGlzLl9tb3ZlU2VsZWN0aW9uRG93bigpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQWN0aW9uVHlwZS5NT1ZFX1NFTEVDVElPTl9UT19UT1A6XG4gICAgICAgIHRoaXMuX21vdmVTZWxlY3Rpb25Ub1RvcCgpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQWN0aW9uVHlwZS5NT1ZFX1NFTEVDVElPTl9UT19CT1RUT006XG4gICAgICAgIHRoaXMuX21vdmVTZWxlY3Rpb25Ub0JvdHRvbSgpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQWN0aW9uVHlwZS5FTlNVUkVfQ0hJTERfTk9ERTpcbiAgICAgICAgdGhpcy5fZW5zdXJlQ2hpbGROb2RlKHBheWxvYWQubm9kZUtleSk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAqIFVzZSB0aGUgcHJlZGljYXRlIGZ1bmN0aW9uIHRvIHVwZGF0ZSBvbmUgb3IgbW9yZSBvZiB0aGUgcm9vdHMgaW4gdGhlIGZpbGUgdHJlZVxuICAqL1xuICBfdXBkYXRlUm9vdHMocHJlZGljYXRlOiAocm9vdDogRmlsZVRyZWVOb2RlKSA9PiBGaWxlVHJlZU5vZGUpOiB2b2lkIHtcbiAgICB0aGlzLl9zZXRSb290cyh0aGlzLnJvb3RzLm1hcChwcmVkaWNhdGUpKTtcbiAgfVxuXG4gIC8qKlxuICAqIFVzZSB0aGUgcHJlZGljYXRlIHRvIHVwZGF0ZSBhIG5vZGUgKG9yIGEgYnJhbmNoKSBvZiB0aGUgZmlsZS10cmVlXG4gICovXG4gIF91cGRhdGVOb2RlQXRSb290KFxuICAgIHJvb3RLZXk6IE51Y2xpZGVVcmksXG4gICAgbm9kZUtleTogTnVjbGlkZVVyaSxcbiAgICBwcmVkaWNhdGU6IChub2RlOiBGaWxlVHJlZU5vZGUpID0+IEZpbGVUcmVlTm9kZSxcbiAgKTogdm9pZCB7XG4gICAgY29uc3Qgcm9vdCA9IHRoaXMucm9vdHMuZ2V0KHJvb3RLZXkpO1xuICAgIGlmIChyb290ID09IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBub2RlID0gcm9vdC5maW5kKG5vZGVLZXkpO1xuICAgIGlmIChub2RlID09IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCByb290cyA9IHRoaXMucm9vdHMuc2V0KHJvb3RLZXksIHRoaXMuX2J1YmJsZVVwKG5vZGUsIHByZWRpY2F0ZShub2RlKSkpO1xuICAgIHRoaXMuX3NldFJvb3RzKHJvb3RzKTtcbiAgfVxuXG4gIC8qKlxuICAqIFVwZGF0ZSBhIG5vZGUgb3IgYSBicmFuY2ggdW5kZXIgYW55IG9mIHRoZSByb290cyBpdCB3YXMgZm91bmQgYXRcbiAgKi9cbiAgX3VwZGF0ZU5vZGVBdEFsbFJvb3RzKFxuICAgIG5vZGVLZXk6IE51Y2xpZGVVcmksXG4gICAgcHJlZGljYXRlOiAobm9kZTogRmlsZVRyZWVOb2RlXG4gICkgPT4gRmlsZVRyZWVOb2RlKTogdm9pZCB7XG5cbiAgICBjb25zdCByb290cyA9IHRoaXMucm9vdHMubWFwKHJvb3QgPT4ge1xuICAgICAgY29uc3Qgbm9kZSA9IHJvb3QuZmluZChub2RlS2V5KTtcbiAgICAgIGlmIChub2RlID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHJvb3Q7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLl9idWJibGVVcChub2RlLCBwcmVkaWNhdGUobm9kZSkpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5fc2V0Um9vdHMocm9vdHMpO1xuICB9XG5cbiAgLyoqXG4gICogQnViYmxlIHRoZSBjaGFuZ2UgdXAuIFRoZSBuZXdOb2RlIGlzIGFzc3VtZWQgdG8gYmUgcHJldk5vZGUgYWZ0ZXIgc29tZSBtYW5pcHVsYXRlaW9uIGRvbmUgdG8gaXRcbiAgKiB0aGVyZWZvcmUgdGhleSBhcmUgYXNzdW1lZCB0byBiZWxvbmcgdG8gdGhlIHNhbWUgcGFyZW50LlxuICAqXG4gICogVGhlIG1ldGhvZCB1cGRhdGVzIHRoZSBjaGlsZCB0byB0aGUgbmV3IG5vZGUgKHdoaWNoIGNyZWF0ZSBhIG5ldyBwYXJlbnQgaW5zdGFuY2UpIGFuZCBjYWxsXG4gICogcmVjdXJzaXZlbHkgZm9yIHRoZSBwYXJlbnQgdXBkYXRlLiBVbnRpbCB0aGVyZSBhcmUgbm8gbW9yZSBwYXJlbnRzIGFuZCB0aGUgbmV3IHJvb3QgaXMgcmV0dXJuZWRcbiAgKlxuICAqIEFzIHRoZSBjaGFuZ2UgYnViYmxlcyB1cCwgYW5kIGluIGFkZGl0aW9uIHRvIHRoZSBjaGFuZ2UgZnJvbSB0aGUgbmV3IGNoaWxkIGFzc2lnbm1lbnQsIGFuXG4gICogb3B0aW9uYWwgcHJlZGljYXRlIGlzIGFsc28gYmVpbmcgYXBwbGllZCB0byBlYWNoIG5ld2x5IGNyZWF0ZWQgcGFyZW50IHRvIHN1cHBvcnQgbW9yZSBjb21wbGV4XG4gICogY2hhbmdlIHBhdHRlcm5zLlxuICAqL1xuICBfYnViYmxlVXAoXG4gICAgcHJldk5vZGU6IEZpbGVUcmVlTm9kZSxcbiAgICBuZXdOb2RlOiBGaWxlVHJlZU5vZGUsXG4gICAgcG9zdFByZWRpY2F0ZTogKG5vZGU6IEZpbGVUcmVlTm9kZSkgPT4gRmlsZVRyZWVOb2RlID0gKG5vZGUgPT4gbm9kZSksXG4gICk6IEZpbGVUcmVlTm9kZSB7XG4gICAgY29uc3QgcGFyZW50ID0gcHJldk5vZGUucGFyZW50O1xuICAgIGlmIChwYXJlbnQgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG5ld05vZGU7XG4gICAgfVxuXG4gICAgY29uc3QgbmV3UGFyZW50ID0gcG9zdFByZWRpY2F0ZShwYXJlbnQudXBkYXRlQ2hpbGQobmV3Tm9kZSkpO1xuICAgIHJldHVybiB0aGlzLl9idWJibGVVcChwYXJlbnQsIG5ld1BhcmVudCwgcG9zdFByZWRpY2F0ZSk7XG4gIH1cblxuICAvKipcbiAgKiBVcGRhdGVzIHRoZSByb290cywgbWFpbnRhaW5zIHRoZWlyIHNpYmxpbmcgcmVsYXRpb25zaGlwcyBhbmQgZmlyZXMgdGhlIGNoYW5nZSBldmVudC5cbiAgKi9cbiAgX3NldFJvb3RzKHJvb3RzOiBJbW11dGFibGUuT3JkZXJlZE1hcDxOdWNsaWRlVXJpLCBGaWxlVHJlZU5vZGU+KTogdm9pZCB7XG4gICAgY29uc3QgY2hhbmdlZCA9ICFJbW11dGFibGUuaXMocm9vdHMsIHRoaXMucm9vdHMpO1xuICAgIGlmIChjaGFuZ2VkKSB7XG4gICAgICB0aGlzLnJvb3RzID0gcm9vdHM7XG4gICAgICBsZXQgcHJldlJvb3QgPSBudWxsO1xuICAgICAgcm9vdHMuZm9yRWFjaChyID0+IHtcbiAgICAgICAgci5wcmV2U2libGluZyA9IHByZXZSb290O1xuICAgICAgICBpZiAocHJldlJvb3QgIT0gbnVsbCkge1xuICAgICAgICAgIHByZXZSb290Lm5leHRTaWJsaW5nID0gcjtcbiAgICAgICAgfVxuICAgICAgICBwcmV2Um9vdCA9IHI7XG4gICAgICB9KTtcblxuICAgICAgaWYgKHByZXZSb290ICE9IG51bGwpIHtcbiAgICAgICAgcHJldlJvb3QubmV4dFNpYmxpbmcgPSBudWxsO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9lbWl0Q2hhbmdlKCk7XG4gICAgfVxuICB9XG5cbiAgX2VtaXRDaGFuZ2UoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX3N1cHByZXNzQ2hhbmdlcykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9hbmltYXRpb25GcmFtZVJlcXVlc3RJZCAhPSBudWxsKSB7XG4gICAgICB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUodGhpcy5fYW5pbWF0aW9uRnJhbWVSZXF1ZXN0SWQpO1xuICAgIH1cblxuICAgIHRoaXMuX2FuaW1hdGlvbkZyYW1lUmVxdWVzdElkID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgICBjb25zdCB7cGVyZm9ybWFuY2V9ID0gZ2xvYmFsO1xuICAgICAgY29uc3QgcmVuZGVyU3RhcnQgPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgICAgIGNvbnN0IGNoaWxkcmVuQ291bnQgPSB0aGlzLnJvb3RzLnJlZHVjZSgoc3VtLCByb290KSA9PiBzdW0gKyByb290LnNob3duQ2hpbGRyZW5CZWxvdywgMCk7XG5cbiAgICAgIHRoaXMuX2VtaXR0ZXIuZW1pdCgnY2hhbmdlJyk7XG4gICAgICB0aGlzLl9zdXBwcmVzc0NoYW5nZXMgPSB0cnVlO1xuICAgICAgdGhpcy5fY2hlY2tUcmFja2VkTm9kZSgpO1xuICAgICAgdGhpcy5fc3VwcHJlc3NDaGFuZ2VzID0gZmFsc2U7XG4gICAgICB0aGlzLl9hbmltYXRpb25GcmFtZVJlcXVlc3RJZCA9IG51bGw7XG5cbiAgICAgIGNvbnN0IGR1cmF0aW9uID0gKHBlcmZvcm1hbmNlLm5vdygpIC0gcmVuZGVyU3RhcnQpLnRvU3RyaW5nKCk7XG4gICAgICB0cmFjaygnZmlsZXRyZWUtcm9vdC1ub2RlLWNvbXBvbmVudC1yZW5kZXInLCB7XG4gICAgICAgICdmaWxldHJlZS1yb290LW5vZGUtY29tcG9uZW50LXJlbmRlci1kdXJhdGlvbic6IGR1cmF0aW9uLFxuICAgICAgICAnZmlsZXRyZWUtcm9vdC1ub2RlLWNvbXBvbmVudC1yZW5kZXJlZC1jaGlsZC1jb3VudCc6IGNoaWxkcmVuQ291bnQsXG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAqIFVwZGF0ZSB0aGUgY29uZmlndXJhdGlvbiBmb3IgdGhlIGZpbGUtdHJlZS4gVGhlIGRpcmVjdCB3cml0aW5nIHRvIHRoZSB0aGlzLl9jb25mIHNob3VsZCBiZVxuICAqIGF2b2lkZWQuXG4gICovXG4gIF91cGRhdGVDb25mKHByZWRpY2F0ZTogKGNvbmY6IFN0b3JlQ29uZmlnRGF0YSkgPT4gbWl4ZWQpOiB2b2lkIHtcbiAgICBwcmVkaWNhdGUodGhpcy5fY29uZik7XG4gICAgdGhpcy5fdXBkYXRlUm9vdHMocm9vdCA9PiByb290LnVwZGF0ZUNvbmYoKSk7XG4gIH1cblxuICBfc2V0Um9vdEtleXMocm9vdEtleXM6IEFycmF5PE51Y2xpZGVVcmk+KTogdm9pZCB7XG4gICAgY29uc3Qgcm9vdE5vZGVzID0gcm9vdEtleXMubWFwKHJvb3RVcmkgPT4ge1xuICAgICAgY29uc3Qgcm9vdCA9IHRoaXMucm9vdHMuZ2V0KHJvb3RVcmkpO1xuICAgICAgaWYgKHJvb3QgIT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gcm9vdDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG5ldyBGaWxlVHJlZU5vZGUoe1xuICAgICAgICB1cmk6IHJvb3RVcmksXG4gICAgICAgIHJvb3RVcmksXG4gICAgICAgIGNvbm5lY3Rpb25UaXRsZTogRmlsZVRyZWVIZWxwZXJzLmdldERpc3BsYXlUaXRsZShyb290VXJpKSB8fCAnJyxcbiAgICAgIH0sIHRoaXMuX2NvbmYpO1xuICAgIH0pO1xuICAgIHRoaXMuX3NldFJvb3RzKG5ldyBJbW11dGFibGUuT3JkZXJlZE1hcChyb290Tm9kZXMubWFwKHJvb3QgPT4gW3Jvb3QudXJpLCByb290XSkpKTtcbiAgICB0aGlzLl9zZXRDd2RLZXkodGhpcy5fY3dkS2V5KTtcbiAgfVxuXG4gIGdldFRyYWNrZWROb2RlKCk6ID9GaWxlVHJlZU5vZGUge1xuICAgIC8vIExvY2F0ZSB0aGUgcm9vdCBjb250YWluaW5nIHRoZSB0cmFja2VkIG5vZGUgZWZmaWNpZW50bHkgYnkgdXNpbmcgdGhlIGNoaWxkLWRlcml2ZWRcbiAgICAvLyBjb250YWluc1RyYWNrZWROb2RlIHByb3BlcnR5XG4gICAgY29uc3QgdHJhY2tlZFJvb3QgPSB0aGlzLnJvb3RzLmZpbmQocm9vdCA9PiByb290LmNvbnRhaW5zVHJhY2tlZE5vZGUpO1xuICAgIGlmICh0cmFja2VkUm9vdCA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBsZXQgdHJhY2tlZE5vZGU7XG4gICAgLy8gTGlrZXdpc2UsIHdpdGhpbiB0aGUgcm9vdCB1c2UgdGhlIHByb3BlcnR5IHRvIGVmZmljaWVudGx5IGZpbmQgdGhlIG5lZWRlZCBub2RlXG4gICAgdHJhY2tlZFJvb3QudHJhdmVyc2UoXG4gICAgICBub2RlID0+IHtcbiAgICAgICAgaWYgKG5vZGUuaXNUcmFja2VkKSB7XG4gICAgICAgICAgdHJhY2tlZE5vZGUgPSBub2RlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRyYWNrZWROb2RlID09IG51bGwgJiYgbm9kZS5jb250YWluc1RyYWNrZWROb2RlO1xuICAgICAgfVxuICAgICk7XG5cbiAgICByZXR1cm4gdHJhY2tlZE5vZGU7XG4gIH1cblxuICBnZXRSZXBvc2l0b3JpZXMoKTogSW1tdXRhYmxlLlNldDxhdG9tJFJlcG9zaXRvcnk+IHtcbiAgICByZXR1cm4gdGhpcy5fcmVwb3NpdG9yaWVzO1xuICB9XG5cbiAgZ2V0V29ya2luZ1NldCgpOiBXb3JraW5nU2V0IHtcbiAgICByZXR1cm4gdGhpcy5fY29uZi53b3JraW5nU2V0O1xuICB9XG5cbiAgZ2V0V29ya2luZ1NldHNTdG9yZSgpOiA/V29ya2luZ1NldHNTdG9yZSB7XG4gICAgcmV0dXJuIHRoaXMuX3dvcmtpbmdTZXRzU3RvcmU7XG4gIH1cblxuICBnZXRSb290S2V5cygpOiBBcnJheTxOdWNsaWRlVXJpPiB7XG4gICAgcmV0dXJuIHRoaXMucm9vdHMudG9BcnJheSgpLm1hcChyb290ID0+IHJvb3QudXJpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRydWUgaWYgdGhlIHN0b3JlIGhhcyBubyBkYXRhLCBpLmUuIG5vIHJvb3RzLCBubyBjaGlsZHJlbi5cbiAgICovXG4gIGlzRW1wdHkoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMucm9vdHMuaXNFbXB0eSgpO1xuICB9XG5cbiAgX3NldFZjc1N0YXR1c2VzKFxuICAgIHJvb3RLZXk6IE51Y2xpZGVVcmksXG4gICAgdmNzU3RhdHVzZXM6IHtbcGF0aDogTnVjbGlkZVVyaV06IFN0YXR1c0NvZGVOdW1iZXJWYWx1ZX0sXG4gICk6IHZvaWQge1xuICAgIC8vIFdlIGNhbid0IGJ1aWxkIG9uIHRoZSBjaGlsZC1kZXJpdmVkIHByb3BlcnRpZXMgdG8gbWFpbnRhaW4gdmNzIHN0YXR1c2VzIGluIHRoZSBlbnRpcmVcbiAgICAvLyB0cmVlLCBzaW5jZSB0aGUgcmVwb3J0ZWQgVkNTIHN0YXR1cyBtYXkgYmUgZm9yIGEgbm9kZSB0aGF0IGlzIG5vdCB5ZXQgcHJlc2VudCBpbiB0aGVcbiAgICAvLyBmZXRjaGVkIHRyZWUsIGFuZCBzbyBpdCBpdCBjYW4ndCBhZmZlY3QgaXRzIHBhcmVudHMgc3RhdHVzZXMuIFRvIGhhdmUgdGhlIHJvb3RzIGNvbG9yZWRcbiAgICAvLyBjb25zaXN0ZW50bHkgd2UgbWFudWFsbHkgYWRkIGFsbCBwYXJlbnRzIG9mIGFsbCBvZiB0aGUgbW9kaWZpZWQgbm9kZXMgdXAgdGlsbCB0aGUgcm9vdFxuICAgIGNvbnN0IGVucmljaGVkVmNzU3RhdHVzZXMgPSB7Li4udmNzU3RhdHVzZXN9O1xuXG4gICAgY29uc3QgZW5zdXJlUHJlc2VudFBhcmVudHMgPSB1cmkgPT4ge1xuICAgICAgaWYgKHVyaSA9PT0gcm9vdEtleSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGxldCBjdXJyZW50ID0gdXJpO1xuICAgICAgd2hpbGUgKGN1cnJlbnQgIT09IHJvb3RLZXkpIHtcbiAgICAgICAgY3VycmVudCA9IEZpbGVUcmVlSGVscGVycy5nZXRQYXJlbnRLZXkoY3VycmVudCk7XG5cbiAgICAgICAgaWYgKGVucmljaGVkVmNzU3RhdHVzZXNbY3VycmVudF0gIT0gbnVsbCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGVucmljaGVkVmNzU3RhdHVzZXNbY3VycmVudF0gPSBTdGF0dXNDb2RlTnVtYmVyLk1PRElGSUVEO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBPYmplY3Qua2V5cyh2Y3NTdGF0dXNlcykuZm9yRWFjaCh1cmkgPT4ge1xuICAgICAgY29uc3Qgc3RhdHVzID0gdmNzU3RhdHVzZXNbdXJpXTtcbiAgICAgIGlmIChcbiAgICAgICAgc3RhdHVzID09PSBTdGF0dXNDb2RlTnVtYmVyLk1PRElGSUVEIHx8XG4gICAgICAgIHN0YXR1cyA9PT0gU3RhdHVzQ29kZU51bWJlci5BRERFRCB8fFxuICAgICAgICBzdGF0dXMgPT09IFN0YXR1c0NvZGVOdW1iZXIuUkVNT1ZFRCkge1xuICAgICAgICB0cnkgeyAvLyBBbiBpbnZhbGlkIFVSSSBtaWdodCBjYXVzZSBhbiBleGNlcHRpb24gdG8gYmUgdGhyb3duXG4gICAgICAgICAgZW5zdXJlUHJlc2VudFBhcmVudHModXJpKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIHRoaXMuX2xvZ2dlci5lcnJvcihgRXJyb3IgZW5yaWNoaW5nIHRoZSBWQ1Mgc3RhdHVzZXMgZm9yICR7dXJpfWAsIGUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBpZiAodGhpcy5fdmNzU3RhdHVzZXNBcmVEaWZmZXJlbnQocm9vdEtleSwgZW5yaWNoZWRWY3NTdGF0dXNlcykpIHtcbiAgICAgIHRoaXMuX3VwZGF0ZUNvbmYoY29uZiA9PiBjb25mLnZjc1N0YXR1c2VzW3Jvb3RLZXldID0gZW5yaWNoZWRWY3NTdGF0dXNlcyk7XG4gICAgfVxuICB9XG5cbiAgX3Zjc1N0YXR1c2VzQXJlRGlmZmVyZW50KFxuICAgIHJvb3RLZXk6IE51Y2xpZGVVcmksXG4gICAgbmV3VmNzU3RhdHVzZXM6IHtbcGF0aDogTnVjbGlkZVVyaV06IFN0YXR1c0NvZGVOdW1iZXJWYWx1ZX1cbiAgKTogYm9vbGVhbiB7XG4gICAgY29uc3QgY3VycmVudFN0YXR1c2VzID0gdGhpcy5fY29uZi52Y3NTdGF0dXNlc1tyb290S2V5XTtcbiAgICBpZiAoY3VycmVudFN0YXR1c2VzID09IG51bGwgfHwgbmV3VmNzU3RhdHVzZXMgPT0gbnVsbCkge1xuICAgICAgaWYgKGN1cnJlbnRTdGF0dXNlcyAhPT0gbmV3VmNzU3RhdHVzZXMpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgY3VycmVudEtleXMgPSBPYmplY3Qua2V5cyhjdXJyZW50U3RhdHVzZXMpO1xuICAgIGNvbnN0IG5ld0tleXMgPSBPYmplY3Qua2V5cyhuZXdWY3NTdGF0dXNlcyk7XG4gICAgaWYgKGN1cnJlbnRLZXlzLmxlbmd0aCAhPT0gbmV3S2V5cy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHJldHVybiBuZXdLZXlzLnNvbWUoa2V5ID0+IGN1cnJlbnRTdGF0dXNlc1trZXldICE9PSBuZXdWY3NTdGF0dXNlc1trZXldKTtcbiAgfVxuXG4gIF9zZXRVc2VQcmV2aWV3VGFicyh1c2VQcmV2aWV3VGFiczogYm9vbGVhbik6IHZvaWQge1xuICAgIHRoaXMuX3VwZGF0ZUNvbmYoY29uZiA9PiBjb25mLnVzZVByZXZpZXdUYWJzID0gdXNlUHJldmlld1RhYnMpO1xuICB9XG5cbiAgX3NldFVzZVByZWZpeE5hdih1c2VQcmVmaXhOYXY6IGJvb2xlYW4pIHtcbiAgICB0aGlzLl91c2VQcmVmaXhOYXYgPSB1c2VQcmVmaXhOYXY7XG4gIH1cblxuICB1c2VQcmVmaXhOYXYoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX3VzZVByZWZpeE5hdjtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgbm9kZSBjaGlsZCBrZXlzIG1heSBlaXRoZXIgYmUgYXZhaWxhYmxlIGltbWVkaWF0ZWx5IChjYWNoZWQpLCBvclxuICAgKiByZXF1aXJlIGFuIGFzeW5jIGZldGNoLiBJZiBhbGwgb2YgdGhlIGNoaWxkcmVuIGFyZSBuZWVkZWQgaXQncyBlYXNpZXIgdG9cbiAgICogcmV0dXJuIGFzIHByb21pc2UsIHRvIG1ha2UgdGhlIGNhbGxlciBvYmxpdmlvdXMgdG8gdGhlIHdheSBjaGlsZHJlbiB3ZXJlXG4gICAqIGZldGNoZWQuXG4gICAqL1xuICBhc3luYyBwcm9taXNlTm9kZUNoaWxkS2V5cyhyb290S2V5OiBzdHJpbmcsIG5vZGVLZXk6IHN0cmluZyk6IFByb21pc2U8QXJyYXk8TnVjbGlkZVVyaT4+IHtcbiAgICBjb25zdCBzaG93bkNoaWxkcmVuVXJpcyA9IG5vZGUgPT4ge1xuICAgICAgcmV0dXJuIG5vZGUuY2hpbGRyZW4udG9BcnJheSgpLmZpbHRlcihuID0+IG4uc2hvdWxkQmVTaG93bikubWFwKG4gPT4gbi51cmkpO1xuICAgIH07XG5cbiAgICBjb25zdCBub2RlID0gdGhpcy5nZXROb2RlKHJvb3RLZXksIG5vZGVLZXkpO1xuICAgIGlmIChub2RlID09IG51bGwpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICBpZiAoIW5vZGUuaXNMb2FkaW5nKSB7XG4gICAgICByZXR1cm4gc2hvd25DaGlsZHJlblVyaXMobm9kZSk7XG4gICAgfVxuXG4gICAgYXdhaXQgdGhpcy5fZmV0Y2hDaGlsZEtleXMobm9kZUtleSk7XG4gICAgcmV0dXJuIHRoaXMucHJvbWlzZU5vZGVDaGlsZEtleXMocm9vdEtleSwgbm9kZUtleSk7XG4gIH1cblxuICAvKipcbiAgKiBVc2VzIHRoZSAuY29udGFpbnNTZWxlY3Rpb24gY2hpbGQtZGVyaXZlZCBwcm9wZXJ0eSB0byBlZmZpY2llbnRseSBidWlsZCB0aGUgbGlzdCBvZiB0aGVcbiAgKiBjdXJyZW50bHkgc2VsZWN0ZWQgbm9kZXNcbiAgKi9cbiAgZ2V0U2VsZWN0ZWROb2RlcygpOiBJbW11dGFibGUuTGlzdDxGaWxlVHJlZU5vZGU+IHtcbiAgICBjb25zdCBzZWxlY3RlZE5vZGVzID0gW107XG4gICAgdGhpcy5yb290cy5mb3JFYWNoKHJvb3QgPT4ge1xuICAgICAgcm9vdC50cmF2ZXJzZShcbiAgICAgICAgbm9kZSA9PiB7XG4gICAgICAgICAgaWYgKG5vZGUuaXNTZWxlY3RlZCkge1xuICAgICAgICAgICAgc2VsZWN0ZWROb2Rlcy5wdXNoKG5vZGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gbm9kZS5jb250YWluc1NlbGVjdGlvbjtcbiAgICAgICAgfSxcbiAgICAgICk7XG4gICAgfSk7XG4gICAgcmV0dXJuIG5ldyBJbW11dGFibGUuTGlzdChzZWxlY3RlZE5vZGVzKTtcbiAgfVxuXG4gIC8qKlxuICAqIFJldHVybnMgYSBub2RlIGlmIGl0IGlzIHRoZSBvbmx5IG9uZSBzZWxlY3RlZCwgb3IgbnVsbCBvdGhlcndpc2VcbiAgKi9cbiAgZ2V0U2luZ2xlU2VsZWN0ZWROb2RlKCk6ID9GaWxlVHJlZU5vZGUge1xuICAgIGNvbnN0IHNlbGVjdGVkTm9kZXMgPSB0aGlzLmdldFNlbGVjdGVkTm9kZXMoKTtcblxuICAgIGlmIChzZWxlY3RlZE5vZGVzLmlzRW1wdHkoKSB8fCBzZWxlY3RlZE5vZGVzLnNpemUgPiAxKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICByZXR1cm4gc2VsZWN0ZWROb2Rlcy5maXJzdCgpO1xuICB9XG5cbiAgZ2V0Tm9kZShyb290S2V5OiBOdWNsaWRlVXJpLCBub2RlS2V5OiBOdWNsaWRlVXJpKTogP0ZpbGVUcmVlTm9kZSB7XG4gICAgY29uc3Qgcm9vdE5vZGUgPSB0aGlzLnJvb3RzLmdldChyb290S2V5KTtcblxuICAgIGlmIChyb290Tm9kZSA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICByZXR1cm4gcm9vdE5vZGUuZmluZChub2RlS2V5KTtcbiAgfVxuXG4gIGlzRWRpdGluZ1dvcmtpbmdTZXQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2NvbmYuaXNFZGl0aW5nV29ya2luZ1NldDtcbiAgfVxuXG4gIC8qKlxuICAqIEJ1aWxkcyB0aGUgZWRpdGVkIHdvcmtpbmcgc2V0IGZyb20gdGhlIHBhcnRpYWxseS1jaGlsZC1kZXJpdmVkIC5jaGVja2VkU3RhdHVzIHByb3BlcnR5XG4gICovXG4gIGdldEVkaXRlZFdvcmtpbmdTZXQoKTogV29ya2luZ1NldCB7XG4gICAgcmV0dXJuIHRoaXMuX2NvbmYuZWRpdGVkV29ya2luZ1NldDtcbiAgfVxuXG4gIGlzRWRpdGVkV29ya2luZ1NldEVtcHR5KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnJvb3RzLmV2ZXJ5KHJvb3QgPT4gcm9vdC5jaGVja2VkU3RhdHVzID09PSAnY2xlYXInKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0aWF0ZXMgdGhlIGZldGNoaW5nIG9mIG5vZGUncyBjaGlsZHJlbiBpZiBpdCdzIG5vdCBhbHJlYWR5IGluIHRoZSBwcm9jZXNzLlxuICAgKiBDbGVhcnMgdGhlIG5vZGUncyAuaXNMb2FkaW5nIHByb3BlcnR5IG9uY2UgdGhlIGZldGNoIGlzIGNvbXBsZXRlLlxuICAgKiBPbmNlIHRoZSBmZXRjaCBpcyBjb21wbGV0ZWQsIGNsZWFycyB0aGUgbm9kZSdzIC5pc0xvYWRpbmcgcHJvcGVydHksIGJ1aWxkcyB0aGUgbWFwIG9mIHRoZVxuICAgKiBub2RlJ3MgY2hpbGRyZW4gb3V0IG9mIHRoZSBmZXRjaGVkIGNoaWxkcmVuIFVSSXMgYW5kIGEgY2hhbmdlIHN1YnNjcmlwdGlvbiBpcyBjcmVhdGVkXG4gICAqIGZvciB0aGUgbm9kZSB0byBtb25pdG9yIGZ1dHVyZSBjaGFuZ2VzLlxuICAgKi9cbiAgX2ZldGNoQ2hpbGRLZXlzKG5vZGVLZXk6IE51Y2xpZGVVcmkpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBleGlzdGluZ1Byb21pc2UgPSB0aGlzLl9nZXRMb2FkaW5nKG5vZGVLZXkpO1xuICAgIGlmIChleGlzdGluZ1Byb21pc2UgIT0gbnVsbCkge1xuICAgICAgcmV0dXJuIGV4aXN0aW5nUHJvbWlzZTtcbiAgICB9XG5cbiAgICBjb25zdCBwcm9taXNlID0gRmlsZVRyZWVIZWxwZXJzLmZldGNoQ2hpbGRyZW4obm9kZUtleSlcbiAgICAgIC5jYXRjaChlcnJvciA9PiB7XG4gICAgICAgIHRoaXMuX2xvZ2dlci5lcnJvcihgVW5hYmxlIHRvIGZldGNoIGNoaWxkcmVuIGZvciBcIiR7bm9kZUtleX1cIi5gKTtcbiAgICAgICAgdGhpcy5fbG9nZ2VyLmVycm9yKCdPcmlnaW5hbCBlcnJvcjogJywgZXJyb3IpO1xuXG4gICAgICAgIC8vIENvbGxhcHNlIHRoZSBub2RlIGFuZCBjbGVhciBpdHMgbG9hZGluZyBzdGF0ZSBvbiBlcnJvciBzbyB0aGVcbiAgICAgICAgLy8gdXNlciBjYW4gcmV0cnkgZXhwYW5kaW5nIGl0LlxuICAgICAgICB0aGlzLl91cGRhdGVOb2RlQXRBbGxSb290cyhub2RlS2V5LCBub2RlID0+XG4gICAgICAgICAgbm9kZS5zZXQoe2lzRXhwYW5kZWQ6IGZhbHNlLCBpc0xvYWRpbmc6IGZhbHNlLCBjaGlsZHJlbjogbmV3IEltbXV0YWJsZS5PcmRlcmVkTWFwKCl9KVxuICAgICAgICApO1xuXG4gICAgICAgIHRoaXMuX2NsZWFyTG9hZGluZyhub2RlS2V5KTtcbiAgICAgIH0pXG4gICAgICAudGhlbihjaGlsZEtleXMgPT4ge1xuICAgICAgICBjb25zdCBjaGlsZHJlbktleXMgPSBjaGlsZEtleXMgfHwgW107XG4gICAgICAgIGNvbnN0IGRpcmVjdG9yeSA9IEZpbGVUcmVlSGVscGVycy5nZXREaXJlY3RvcnlCeUtleShub2RlS2V5KTtcblxuICAgICAgICAvLyBUaGUgbm9kZSB3aXRoIFVSSSA9PT0gbm9kZUtleSBtaWdodCBiZSBwcmVzZW50IGF0IHNldmVyYWwgcm9vdHMgLSB1cGRhdGUgdGhlbSBhbGxcbiAgICAgICAgdGhpcy5fdXBkYXRlTm9kZUF0QWxsUm9vdHMobm9kZUtleSwgbm9kZSA9PiB7XG4gICAgICAgICAgLy8gTWFpbnRhaW4gdGhlIG9yZGVyIGZldGNoZWQgZnJvbSB0aGUgRlNcbiAgICAgICAgICBjb25zdCBjaGlsZHJlbk5vZGVzID0gY2hpbGRyZW5LZXlzLm1hcCh1cmkgPT4ge1xuICAgICAgICAgICAgY29uc3QgcHJldk5vZGUgPSBub2RlLmZpbmQodXJpKTtcbiAgICAgICAgICAgIC8vIElmIHdlIGFscmVhZHkgaGFkIGEgY2hpbGQgd2l0aCB0aGlzIFVSSSAtIGtlZXAgaXRcbiAgICAgICAgICAgIGlmIChwcmV2Tm9kZSAhPSBudWxsKSB7XG4gICAgICAgICAgICAgIHJldHVybiBwcmV2Tm9kZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIG5vZGUuY3JlYXRlQ2hpbGQoe1xuICAgICAgICAgICAgICB1cmksXG4gICAgICAgICAgICAgIGlzRXhwYW5kZWQ6IGZhbHNlLFxuICAgICAgICAgICAgICBpc1NlbGVjdGVkOiBmYWxzZSxcbiAgICAgICAgICAgICAgaXNMb2FkaW5nOiBmYWxzZSxcbiAgICAgICAgICAgICAgaXNDd2Q6IGZhbHNlLFxuICAgICAgICAgICAgICBpc1RyYWNrZWQ6IGZhbHNlLFxuICAgICAgICAgICAgICBjaGlsZHJlbjogbmV3IEltbXV0YWJsZS5PcmRlcmVkTWFwKCksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIGNvbnN0IGNoaWxkcmVuID0gRmlsZVRyZWVOb2RlLmNoaWxkcmVuRnJvbUFycmF5KGNoaWxkcmVuTm9kZXMpO1xuICAgICAgICAgIC8vIEluIGNhc2UgcHJldmlvdXMgc3Vic2NyaXB0aW9uIGV4aXN0ZWQgLSBkaXNwb3NlIG9mIGl0XG4gICAgICAgICAgaWYgKG5vZGUuc3Vic2NyaXB0aW9uICE9IG51bGwpIHtcbiAgICAgICAgICAgIG5vZGUuc3Vic2NyaXB0aW9uLmRpc3Bvc2UoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gYW5kIGNyZWF0ZSBhIG5ldyBzdWJzY3JpcHRpb25cbiAgICAgICAgICBjb25zdCBzdWJzY3JpcHRpb24gPSB0aGlzLl9tYWtlU3Vic2NyaXB0aW9uKG5vZGVLZXksIGRpcmVjdG9yeSk7XG5cbiAgICAgICAgICAvLyBJZiB0aGUgZmV0Y2ggaW5kaWNhdGVkIHRoYXQgc29tZSBjaGlsZHJlbiB3ZXJlIHJlbW92ZWQgLSBkaXNwb3NlIG9mIGFsbFxuICAgICAgICAgIC8vIHRoZWlyIHN1YnNjcmlwdGlvbnNcbiAgICAgICAgICBjb25zdCByZW1vdmVkQ2hpbGRyZW4gPSBub2RlLmNoaWxkcmVuLmZpbHRlcihuID0+ICFjaGlsZHJlbi5oYXMobi5uYW1lKSk7XG4gICAgICAgICAgcmVtb3ZlZENoaWxkcmVuLmZvckVhY2goYyA9PiB7XG4gICAgICAgICAgICBjLnRyYXZlcnNlKG4gPT4ge1xuICAgICAgICAgICAgICBpZiAobi5zdWJzY3JpcHRpb24gIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIG4uc3Vic2NyaXB0aW9uLmRpc3Bvc2UoKTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICByZXR1cm4gbm9kZS5zZXQoe2lzTG9hZGluZzogZmFsc2UsIGNoaWxkcmVuLCBzdWJzY3JpcHRpb259KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5fY2xlYXJMb2FkaW5nKG5vZGVLZXkpO1xuICAgICAgfSk7XG5cbiAgICB0aGlzLl9zZXRMb2FkaW5nKG5vZGVLZXksIHByb21pc2UpO1xuICAgIHJldHVybiBwcm9taXNlO1xuICB9XG5cbiAgX21ha2VTdWJzY3JpcHRpb24obm9kZUtleTogTnVjbGlkZVVyaSwgZGlyZWN0b3J5OiA/RGlyZWN0b3J5KTogP0lEaXNwb3NhYmxlIHtcbiAgICBpZiAoZGlyZWN0b3J5ID09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICAvLyBUaGlzIGNhbGwgbWlnaHQgZmFpbCBpZiB3ZSB0cnkgdG8gd2F0Y2ggYSBub24tZXhpc3RpbmcgZGlyZWN0b3J5LCBvciBpZiBwZXJtaXNzaW9uIGRlbmllZC5cbiAgICAgIHJldHVybiBkaXJlY3Rvcnkub25EaWRDaGFuZ2UoKCkgPT4ge1xuICAgICAgICB0aGlzLl9mZXRjaENoaWxkS2V5cyhub2RlS2V5KTtcbiAgICAgIH0pO1xuICAgIH0gY2F0Y2ggKGV4KSB7XG4gICAgICAvKlxuICAgICAgICogTG9nIGVycm9yIGFuZCBtYXJrIHRoZSBkaXJlY3RvcnkgYXMgZGlydHkgc28gdGhlIGZhaWxlZCBzdWJzY3JpcHRpb24gd2lsbCBiZSBhdHRlbXB0ZWRcbiAgICAgICAqIGFnYWluIG5leHQgdGltZSB0aGUgZGlyZWN0b3J5IGlzIGV4cGFuZGVkLlxuICAgICAgICovXG4gICAgICB0aGlzLl9sb2dnZXIuZXJyb3IoYENhbm5vdCBzdWJzY3JpYmUgdG8gZGlyZWN0b3J5IFwiJHtub2RlS2V5fVwiYCwgZXgpO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG5cbiAgX2dldExvYWRpbmcobm9kZUtleTogTnVjbGlkZVVyaSk6ID9Qcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gdGhpcy5faXNMb2FkaW5nTWFwLmdldChub2RlS2V5KTtcbiAgfVxuXG4gIF9zZXRMb2FkaW5nKG5vZGVLZXk6IE51Y2xpZGVVcmksIHZhbHVlOiBQcm9taXNlPHZvaWQ+KTogdm9pZCB7XG4gICAgdGhpcy5faXNMb2FkaW5nTWFwID0gdGhpcy5faXNMb2FkaW5nTWFwLnNldChub2RlS2V5LCB2YWx1ZSk7XG4gIH1cblxuICBoYXNDd2QoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2N3ZEtleSAhPSBudWxsO1xuICB9XG5cbiAgX3NldEN3ZEtleShjd2RLZXk6ID9OdWNsaWRlVXJpKTogdm9pZCB7XG4gICAgdGhpcy5fY3dkS2V5ID0gY3dkS2V5O1xuICAgIHRoaXMuX3VwZGF0ZVJvb3RzKHJvb3QgPT4gcm9vdC5zZXRJc0N3ZChyb290LnVyaSA9PT0gY3dkS2V5KSk7XG4gIH1cblxuICBnZXRGaWx0ZXIoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fZmlsdGVyO1xuICB9XG5cbiAgYWRkRmlsdGVyTGV0dGVyKGxldHRlcjogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5fZmlsdGVyID0gdGhpcy5fZmlsdGVyICsgbGV0dGVyO1xuICAgIHRoaXMuX3VwZGF0ZVJvb3RzKHJvb3QgPT4ge1xuICAgICAgcmV0dXJuIHJvb3Quc2V0UmVjdXJzaXZlKFxuICAgICAgICBub2RlID0+IG5vZGUuY29udGFpbnNGaWx0ZXJNYXRjaGVzID8gbnVsbCA6IG5vZGUsXG4gICAgICAgIG5vZGUgPT4ge1xuICAgICAgICAgIHJldHVybiBtYXRjaGVzRmlsdGVyKG5vZGUubmFtZSwgdGhpcy5fZmlsdGVyKSA/IG5vZGUuc2V0KHtcbiAgICAgICAgICAgIGhpZ2hsaWdodGVkVGV4dDogdGhpcy5fZmlsdGVyLFxuICAgICAgICAgICAgbWF0Y2hlc0ZpbHRlcjogdHJ1ZSxcbiAgICAgICAgICB9KSA6IG5vZGUuc2V0KHtoaWdobGlnaHRlZFRleHQ6ICcnLCBtYXRjaGVzRmlsdGVyOiBmYWxzZX0pO1xuICAgICAgICB9LFxuICAgICAgKTtcbiAgICB9KTtcbiAgICB0aGlzLl9zZWxlY3RGaXJzdEZpbHRlcigpO1xuICAgIHRoaXMuX2VtaXRDaGFuZ2UoKTtcbiAgfVxuXG4gIGNsZWFyRmlsdGVyKCk6IHZvaWQge1xuICAgIHRoaXMuX2ZpbHRlciA9ICcnO1xuICAgIHRoaXMuX3VwZGF0ZVJvb3RzKHJvb3QgPT4ge1xuICAgICAgcmV0dXJuIHJvb3Quc2V0UmVjdXJzaXZlKFxuICAgICAgICBub2RlID0+IG51bGwsXG4gICAgICAgIG5vZGUgPT4gbm9kZS5zZXQoe2hpZ2hsaWdodGVkVGV4dDogJycsIG1hdGNoZXNGaWx0ZXI6IHRydWV9KSxcbiAgICAgICk7XG4gICAgfSk7XG4gIH1cblxuICByZW1vdmVGaWx0ZXJMZXR0ZXIoKTogdm9pZCB7XG4gICAgdGhpcy5fZmlsdGVyID0gdGhpcy5fZmlsdGVyLnN1YnN0cigwLCB0aGlzLl9maWx0ZXIubGVuZ3RoIC0gMSk7XG4gICAgaWYgKHRoaXMuX2ZpbHRlci5sZW5ndGgpIHtcbiAgICAgIHRoaXMuX3VwZGF0ZVJvb3RzKHJvb3QgPT4ge1xuICAgICAgICByZXR1cm4gcm9vdC5zZXRSZWN1cnNpdmUoXG4gICAgICAgICAgbm9kZSA9PiBudWxsLFxuICAgICAgICAgIG5vZGUgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG1hdGNoZXNGaWx0ZXIobm9kZS5uYW1lLCB0aGlzLl9maWx0ZXIpID8gbm9kZS5zZXQoe1xuICAgICAgICAgICAgICBoaWdobGlnaHRlZFRleHQ6IHRoaXMuX2ZpbHRlcixcbiAgICAgICAgICAgICAgbWF0Y2hlc0ZpbHRlcjogdHJ1ZSxcbiAgICAgICAgICAgIH0pIDogbm9kZS5zZXQoe2hpZ2hsaWdodGVkVGV4dDogJycsIG1hdGNoZXNGaWx0ZXI6IGZhbHNlfSk7XG4gICAgICAgICAgfSxcbiAgICAgICAgKTtcbiAgICAgIH0pO1xuICAgICAgdGhpcy5fZW1pdENoYW5nZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmNsZWFyRmlsdGVyKCk7XG4gICAgfVxuICB9XG5cbiAgZ2V0RmlsdGVyRm91bmQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMucm9vdHMuc29tZShyb290ID0+IHJvb3QuY29udGFpbnNGaWx0ZXJNYXRjaGVzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXNldHMgdGhlIG5vZGUgdG8gYmUga2VwdCBpbiB2aWV3IGlmIG5vIG1vcmUgZGF0YSBpcyBiZWluZyBhd2FpdGVkLiBTYWZlIHRvIGNhbGwgbWFueSB0aW1lc1xuICAgKiBiZWNhdXNlIGl0IG9ubHkgY2hhbmdlcyBzdGF0ZSBpZiBhIG5vZGUgaXMgYmVpbmcgdHJhY2tlZC5cbiAgICovXG4gIF9jaGVja1RyYWNrZWROb2RlKCk6IHZvaWQge1xuICAgIGlmIChcbiAgICAgIC8qXG4gICAgICAgKiBUaGUgbG9hZGluZyBtYXAgYmVpbmcgZW1wdHkgaXMgYSBoZXVyaXN0aWMgZm9yIHdoZW4gbG9hZGluZyBoYXMgY29tcGxldGVkLiBJdCBpcyBpbmV4YWN0XG4gICAgICAgKiBiZWNhdXNlIHRoZSBsb2FkaW5nIG1pZ2h0IGJlIHVucmVsYXRlZCB0byB0aGUgdHJhY2tlZCBub2RlLCBob3dldmVyIGl0IGlzIGNoZWFwIGFuZCBmYWxzZVxuICAgICAgICogcG9zaXRpdmVzIHdpbGwgb25seSBsYXN0IHVudGlsIGxvYWRpbmcgaXMgY29tcGxldGUgb3IgdW50aWwgdGhlIHVzZXIgY2xpY2tzIGFub3RoZXIgbm9kZSBpblxuICAgICAgICogdGhlIHRyZWUuXG4gICAgICAgKi9cbiAgICAgIHRoaXMuX2lzTG9hZGluZ01hcC5pc0VtcHR5KClcbiAgICApIHtcbiAgICAgIC8vIExvYWRpbmcgaGFzIGNvbXBsZXRlZC4gQWxsb3cgc2Nyb2xsaW5nIHRvIHByb2NlZWQgYXMgdXN1YWwuXG4gICAgICB0aGlzLl9jbGVhclRyYWNrZWROb2RlKCk7XG4gICAgfVxuICB9XG5cbiAgX2NsZWFyTG9hZGluZyhub2RlS2V5OiBOdWNsaWRlVXJpKTogdm9pZCB7XG4gICAgdGhpcy5faXNMb2FkaW5nTWFwID0gdGhpcy5faXNMb2FkaW5nTWFwLmRlbGV0ZShub2RlS2V5KTtcbiAgfVxuXG4gIGFzeW5jIF9kZWxldGVTZWxlY3RlZE5vZGVzKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHNlbGVjdGVkTm9kZXMgPSB0aGlzLmdldFNlbGVjdGVkTm9kZXMoKTtcbiAgICBhd2FpdCBQcm9taXNlLmFsbChzZWxlY3RlZE5vZGVzLm1hcChhc3luYyBub2RlID0+IHtcbiAgICAgIGNvbnN0IGVudHJ5ID0gRmlsZVRyZWVIZWxwZXJzLmdldEVudHJ5QnlLZXkobm9kZS51cmkpO1xuXG4gICAgICBpZiAoZW50cnkgPT0gbnVsbCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjb25zdCBwYXRoID0gZW50cnkuZ2V0UGF0aCgpO1xuICAgICAgY29uc3QgcmVwb3NpdG9yeSA9IG5vZGUucmVwbztcbiAgICAgIGlmIChyZXBvc2l0b3J5ICE9IG51bGwgJiYgcmVwb3NpdG9yeS5nZXRUeXBlKCkgPT09ICdoZycpIHtcbiAgICAgICAgY29uc3QgaGdSZXBvc2l0b3J5ID0gKChyZXBvc2l0b3J5OiBhbnkpOiBIZ1JlcG9zaXRvcnlDbGllbnQpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGF3YWl0IGhnUmVwb3NpdG9yeS5yZW1vdmUocGF0aCk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICBjb25zdCBzdGF0dXNlcyA9IGF3YWl0IGhnUmVwb3NpdG9yeS5nZXRTdGF0dXNlcyhbcGF0aF0pO1xuICAgICAgICAgIGNvbnN0IHBhdGhTdGF0dXMgPSBzdGF0dXNlcy5nZXQocGF0aCk7XG4gICAgICAgICAgY29uc3QgZ29vZFN0YXR1c2VzID0gW1xuICAgICAgICAgICAgU3RhdHVzQ29kZU51bWJlci5BRERFRCxcbiAgICAgICAgICAgIFN0YXR1c0NvZGVOdW1iZXIuQ0xFQU4sXG4gICAgICAgICAgICBTdGF0dXNDb2RlTnVtYmVyLk1PRElGSUVELFxuICAgICAgICAgIF07XG4gICAgICAgICAgaWYgKGdvb2RTdGF0dXNlcy5pbmRleE9mKHBhdGhTdGF0dXMpICE9PSAtMSkge1xuICAgICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKFxuICAgICAgICAgICAgICAnRmFpbGVkIHRvIHJlbW92ZSAnICsgcGF0aCArICcgZnJvbSB2ZXJzaW9uIGNvbnRyb2wuICBUaGUgZmlsZSB3aWxsICcgK1xuICAgICAgICAgICAgICAnc3RpbGwgZ2V0IGRlbGV0ZWQgYnV0IHlvdSB3aWxsIGhhdmUgdG8gcmVtb3ZlIGl0IGZyb20geW91ciBWQ1MgeW91cnNlbGYuICBFcnJvcjogJyArXG4gICAgICAgICAgICAgIGUudG9TdHJpbmcoKSxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoRmlsZVRyZWVIZWxwZXJzLmlzTG9jYWxFbnRyeShlbnRyeSkpIHtcbiAgICAgICAgLy8gVE9ETzogVGhpcyBzcGVjaWFsLWNhc2UgY2FuIGJlIGVsaW1pbmF0ZWQgb25jZSBgZGVsZXRlKClgIGlzIGFkZGVkIHRvIGBEaXJlY3RvcnlgXG4gICAgICAgIC8vIGFuZCBgRmlsZWAuXG4gICAgICAgIHNoZWxsLm1vdmVJdGVtVG9UcmFzaChGaWxlVHJlZUhlbHBlcnMua2V5VG9QYXRoKG5vZGUudXJpKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCByZW1vdGVGaWxlID0gKChlbnRyeTogYW55KTogKFJlbW90ZUZpbGUgfCBSZW1vdGVEaXJlY3RvcnkpKTtcbiAgICAgICAgYXdhaXQgcmVtb3RlRmlsZS5kZWxldGUoKTtcbiAgICAgIH1cbiAgICB9KSk7XG4gIH1cblxuICBfZXhwYW5kTm9kZShyb290S2V5OiBOdWNsaWRlVXJpLCBub2RlS2V5OiBOdWNsaWRlVXJpKTogdm9pZCB7XG4gICAgdGhpcy5fdXBkYXRlTm9kZUF0Um9vdChyb290S2V5LCBub2RlS2V5LCBub2RlID0+IHtcbiAgICAgIHJldHVybiBub2RlLnNldElzRXhwYW5kZWQodHJ1ZSkuc2V0UmVjdXJzaXZlKFxuICAgICAgICBuID0+ICFuLmlzQ29udGFpbmVyIHx8ICFuLmlzRXhwYW5kZWQgPyBuIDogbnVsbCxcbiAgICAgICAgbiA9PiB7XG4gICAgICAgICAgaWYgKG4uaXNDb250YWluZXIgJiYgbi5pc0V4cGFuZGVkKSB7XG4gICAgICAgICAgICB0aGlzLl9mZXRjaENoaWxkS2V5cyhuLnVyaSk7XG4gICAgICAgICAgICByZXR1cm4gbi5zZXRJc0xvYWRpbmcodHJ1ZSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIG47XG4gICAgICAgIH1cbiAgICAgICk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogUGVyZm9ybWVzIGEgZGVlcCBCRlMgc2Nhbm5pbmcgZXhwYW5kIG9mIGNvbnRhaW5lZCBub2Rlcy5cbiAgICogcmV0dXJucyAtIGEgcHJvbWlzZSBmdWxmaWxsZWQgd2hlbiB0aGUgZXhwYW5kIG9wZXJhdGlvbiBpcyBmaW5pc2hlZFxuICAgKi9cbiAgX2V4cGFuZE5vZGVEZWVwKHJvb3RLZXk6IE51Y2xpZGVVcmksIG5vZGVLZXk6IE51Y2xpZGVVcmkpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAvLyBTdG9wIHRoZSB0cmF2ZXJzYWwgYWZ0ZXIgMTAwIG5vZGVzIHdlcmUgYWRkZWQgdG8gdGhlIHRyZWVcbiAgICBjb25zdCBpdE5vZGVzID0gbmV3IEZpbGVUcmVlU3RvcmVCZnNJdGVyYXRvcih0aGlzLCByb290S2V5LCBub2RlS2V5LCAvKiBsaW1pdCovIDEwMCk7XG4gICAgY29uc3QgcHJvbWlzZSA9IG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgY29uc3QgZXhwYW5kID0gKCkgPT4ge1xuICAgICAgICBjb25zdCB0cmF2ZXJzZWROb2RlS2V5ID0gaXROb2Rlcy50cmF2ZXJzZWROb2RlKCk7XG4gICAgICAgIGlmICh0cmF2ZXJzZWROb2RlS2V5KSB7XG4gICAgICAgICAgdGhpcy5fZXhwYW5kTm9kZShyb290S2V5LCB0cmF2ZXJzZWROb2RlS2V5KTtcblxuICAgICAgICAgIGNvbnN0IG5leHRQcm9taXNlID0gaXROb2Rlcy5uZXh0KCk7XG4gICAgICAgICAgaWYgKG5leHRQcm9taXNlKSB7XG4gICAgICAgICAgICBuZXh0UHJvbWlzZS50aGVuKGV4cGFuZCk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgZXhwYW5kKCk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gcHJvbWlzZTtcbiAgfVxuXG4gIF9jb2xsYXBzZU5vZGUocm9vdEtleTogTnVjbGlkZVVyaSwgbm9kZUtleTogTnVjbGlkZVVyaSk6IHZvaWQge1xuICAgIHRoaXMuX3VwZGF0ZU5vZGVBdFJvb3Qocm9vdEtleSwgbm9kZUtleSwgbm9kZSA9PiB7XG4gICAgICAvLyBDbGVhciBhbGwgc2VsZWN0ZWQgbm9kZXMgdW5kZXIgdGhlIG5vZGUgYmVpbmcgY29sbGFwc2VkIGFuZCBkaXNwb3NlIHRoZWlyIHN1YnNjcmlwdGlvbnNcbiAgICAgIHJldHVybiBub2RlLnNldFJlY3Vyc2l2ZShcbiAgICAgICAgY2hpbGROb2RlID0+IHtcbiAgICAgICAgICBpZiAoY2hpbGROb2RlLmlzRXhwYW5kZWQpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gY2hpbGROb2RlO1xuICAgICAgICB9LFxuICAgICAgICBjaGlsZE5vZGUgPT4ge1xuICAgICAgICAgIGlmIChjaGlsZE5vZGUuc3Vic2NyaXB0aW9uICE9IG51bGwpIHtcbiAgICAgICAgICAgIGNoaWxkTm9kZS5zdWJzY3JpcHRpb24uZGlzcG9zZSgpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChjaGlsZE5vZGUudXJpID09PSBub2RlLnVyaSkge1xuICAgICAgICAgICAgcmV0dXJuIGNoaWxkTm9kZS5zZXQoe2lzRXhwYW5kZWQ6IGZhbHNlLCBzdWJzY3JpcHRpb246IG51bGx9KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGNoaWxkTm9kZS5zZXQoe2lzU2VsZWN0ZWQ6IGZhbHNlLCBzdWJzY3JpcHRpb246IG51bGx9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICk7XG4gICAgfSk7XG4gIH1cblxuICBfY29sbGFwc2VOb2RlRGVlcChyb290S2V5OiBOdWNsaWRlVXJpLCBub2RlS2V5OiBOdWNsaWRlVXJpKTogdm9pZCB7XG4gICAgdGhpcy5fdXBkYXRlTm9kZUF0Um9vdChyb290S2V5LCBub2RlS2V5LCBub2RlID0+IHtcbiAgICAgIHJldHVybiBub2RlLnNldFJlY3Vyc2l2ZShcbiAgICAgICAgLyogcHJlUHJlZGljYXRlICovIG51bGwsXG4gICAgICAgIGNoaWxkTm9kZSA9PiB7XG4gICAgICAgICAgaWYgKGNoaWxkTm9kZS5zdWJzY3JpcHRpb24gIT0gbnVsbCkge1xuICAgICAgICAgICAgY2hpbGROb2RlLnN1YnNjcmlwdGlvbi5kaXNwb3NlKCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKGNoaWxkTm9kZSAhPT0gbm9kZSkge1xuICAgICAgICAgICAgcmV0dXJuIGNoaWxkTm9kZS5zZXQoe2lzRXhwYW5kZWQ6IGZhbHNlLCBpc1NlbGVjdGVkOiBmYWxzZSwgc3Vic2NyaXB0aW9uOiBudWxsfSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBjaGlsZE5vZGUuc2V0KHtpc0V4cGFuZGVkOiBmYWxzZSwgc3Vic2NyaXB0aW9uOiBudWxsfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAqIFNlbGVjdHMgYSBzaW5nbGUgbm9kZSBhbmQgdHJhY2tzIGl0LlxuICAqL1xuICBfc2V0U2VsZWN0ZWROb2RlKHJvb3RLZXk6IE51Y2xpZGVVcmksIG5vZGVLZXk6IE51Y2xpZGVVcmkpOiB2b2lkIHtcbiAgICB0aGlzLl9jbGVhclNlbGVjdGlvbigpO1xuICAgIHRoaXMuX3VwZGF0ZU5vZGVBdFJvb3Qocm9vdEtleSwgbm9kZUtleSwgbm9kZSA9PiBub2RlLnNldElzU2VsZWN0ZWQodHJ1ZSkpO1xuICAgIHRoaXMuX3NldFRyYWNrZWROb2RlKHJvb3RLZXksIG5vZGVLZXkpO1xuICB9XG5cbiAgX2FkZFNlbGVjdGVkTm9kZShyb290S2V5OiBOdWNsaWRlVXJpLCBub2RlS2V5OiBOdWNsaWRlVXJpKTogdm9pZCB7XG4gICAgdGhpcy5fdXBkYXRlTm9kZUF0Um9vdChyb290S2V5LCBub2RlS2V5LCBub2RlID0+IG5vZGUuc2V0SXNTZWxlY3RlZCh0cnVlKSk7XG4gIH1cblxuICBfdW5zZWxlY3ROb2RlKHJvb3RLZXk6IE51Y2xpZGVVcmksIG5vZGVLZXk6IE51Y2xpZGVVcmkpOiB2b2lkIHtcbiAgICB0aGlzLl91cGRhdGVOb2RlQXRSb290KHJvb3RLZXksIG5vZGVLZXksIG5vZGUgPT4gbm9kZS5zZXRJc1NlbGVjdGVkKGZhbHNlKSk7XG4gIH1cblxuICBfc2VsZWN0Rmlyc3RGaWx0ZXIoKTogdm9pZCB7XG4gICAgbGV0IG5vZGUgPSB0aGlzLmdldFNpbmdsZVNlbGVjdGVkTm9kZSgpO1xuICAgIC8vIGlmIHRoZSBjdXJyZW50IG5vZGUgbWF0Y2hlcyB0aGUgZmlsdGVyIGRvIG5vdGhpbmdcbiAgICBpZiAobm9kZSAhPSBudWxsICYmIG5vZGUubWF0Y2hlc0ZpbHRlcikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuX21vdmVTZWxlY3Rpb25Eb3duKCk7XG4gICAgbm9kZSA9IHRoaXMuZ2V0U2luZ2xlU2VsZWN0ZWROb2RlKCk7XG4gICAgLy8gaWYgdGhlIHNlbGVjdGlvbiBkb2VzIG5vdCBmaW5kIGFueXRoaW5nIHVwIGdvIGRvd25cbiAgICBpZiAobm9kZSAhPSBudWxsICYmICFub2RlLm1hdGNoZXNGaWx0ZXIpIHtcbiAgICAgIHRoaXMuX21vdmVTZWxlY3Rpb25VcCgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAqIE1vdmVzIHRoZSBzZWxlY3Rpb24gb25lIG5vZGUgZG93bi4gSW4gY2FzZSBzZXZlcmFsIG5vZGVzIHdlcmUgc2VsZWN0ZWQsIHRoZSB0b3Btb3N0IChmaXJzdCBpblxuICAqIHRoZSBuYXR1cmFsIHZpc3VhbCBvcmRlcikgaXMgY29uc2lkZXJlZCB0byBiZSB0aGUgcmVmZXJlbmNlIHBvaW50IGZvciB0aGUgbW92ZS5cbiAgKi9cbiAgX21vdmVTZWxlY3Rpb25Eb3duKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLnJvb3RzLmlzRW1wdHkoKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHNlbGVjdGVkTm9kZXMgPSB0aGlzLmdldFNlbGVjdGVkTm9kZXMoKTtcblxuICAgIGxldCBub2RlVG9TZWxlY3Q7XG4gICAgaWYgKHNlbGVjdGVkTm9kZXMuaXNFbXB0eSgpKSB7XG4gICAgICBub2RlVG9TZWxlY3QgPSB0aGlzLnJvb3RzLmZpcnN0KCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHNlbGVjdGVkTm9kZSA9IHNlbGVjdGVkTm9kZXMuZmlyc3QoKTtcbiAgICAgIG5vZGVUb1NlbGVjdCA9IHNlbGVjdGVkTm9kZS5maW5kTmV4dCgpO1xuICAgIH1cblxuICAgIHdoaWxlIChub2RlVG9TZWxlY3QgIT0gbnVsbCAmJiAhbm9kZVRvU2VsZWN0Lm1hdGNoZXNGaWx0ZXIpIHtcbiAgICAgIG5vZGVUb1NlbGVjdCA9IG5vZGVUb1NlbGVjdC5maW5kTmV4dCgpO1xuICAgIH1cblxuICAgIGlmIChub2RlVG9TZWxlY3QgIT0gbnVsbCkge1xuICAgICAgdGhpcy5fc2V0U2VsZWN0ZWROb2RlKG5vZGVUb1NlbGVjdC5yb290VXJpLCBub2RlVG9TZWxlY3QudXJpKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgKiBNb3ZlcyB0aGUgc2VsZWN0aW9uIG9uZSBub2RlIHVwLiBJbiBjYXNlIHNldmVyYWwgbm9kZXMgd2VyZSBzZWxlY3RlZCwgdGhlIHRvcG1vc3QgKGZpcnN0IGluXG4gICogdGhlIG5hdHVyYWwgdmlzdWFsIG9yZGVyKSBpcyBjb25zaWRlcmVkIHRvIGJlIHRoZSByZWZlcmVuY2UgcG9pbnQgZm9yIHRoZSBtb3ZlLlxuICAqL1xuICBfbW92ZVNlbGVjdGlvblVwKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLnJvb3RzLmlzRW1wdHkoKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHNlbGVjdGVkTm9kZXMgPSB0aGlzLmdldFNlbGVjdGVkTm9kZXMoKTtcblxuICAgIGxldCBub2RlVG9TZWxlY3Q7XG4gICAgaWYgKHNlbGVjdGVkTm9kZXMuaXNFbXB0eSgpKSB7XG4gICAgICBub2RlVG9TZWxlY3QgPSB0aGlzLnJvb3RzLmxhc3QoKS5maW5kTGFzdFJlY3Vyc2l2ZUNoaWxkKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHNlbGVjdGVkTm9kZSA9IHNlbGVjdGVkTm9kZXMuZmlyc3QoKTtcbiAgICAgIG5vZGVUb1NlbGVjdCA9IHNlbGVjdGVkTm9kZS5maW5kUHJldmlvdXMoKTtcbiAgICB9XG5cbiAgICB3aGlsZSAobm9kZVRvU2VsZWN0ICE9IG51bGwgJiYgIW5vZGVUb1NlbGVjdC5tYXRjaGVzRmlsdGVyKSB7XG4gICAgICBub2RlVG9TZWxlY3QgPSBub2RlVG9TZWxlY3QuZmluZFByZXZpb3VzKCk7XG4gICAgfVxuXG4gICAgaWYgKG5vZGVUb1NlbGVjdCAhPSBudWxsKSB7XG4gICAgICB0aGlzLl9zZXRTZWxlY3RlZE5vZGUobm9kZVRvU2VsZWN0LnJvb3RVcmksIG5vZGVUb1NlbGVjdC51cmkpO1xuICAgIH1cbiAgfVxuXG4gIF9tb3ZlU2VsZWN0aW9uVG9Ub3AoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMucm9vdHMuaXNFbXB0eSgpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbGV0IG5vZGVUb1NlbGVjdCA9IHRoaXMucm9vdHMuZmlyc3QoKTtcbiAgICBpZiAobm9kZVRvU2VsZWN0ICE9IG51bGwgJiYgIW5vZGVUb1NlbGVjdC5zaG91bGRCZVNob3duKSB7XG4gICAgICBub2RlVG9TZWxlY3QgPSBub2RlVG9TZWxlY3QuZmluZE5leHQoKTtcbiAgICB9XG5cbiAgICBpZiAobm9kZVRvU2VsZWN0ICE9IG51bGwpIHtcbiAgICAgIHRoaXMuX3NldFNlbGVjdGVkTm9kZShub2RlVG9TZWxlY3QudXJpLCBub2RlVG9TZWxlY3QudXJpKTtcbiAgICB9XG4gIH1cblxuICBfbW92ZVNlbGVjdGlvblRvQm90dG9tKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLnJvb3RzLmlzRW1wdHkoKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGxhc3RSb290ID0gdGhpcy5yb290cy5sYXN0KCk7XG4gICAgY29uc3QgbGFzdENoaWxkID0gbGFzdFJvb3QuZmluZExhc3RSZWN1cnNpdmVDaGlsZCgpO1xuICAgIHRoaXMuX3NldFNlbGVjdGVkTm9kZShsYXN0Q2hpbGQucm9vdFVyaSwgbGFzdENoaWxkLnVyaSk7XG4gIH1cblxuICBfY2xlYXJTZWxlY3Rpb24oKTogdm9pZCB7XG4gICAgdGhpcy5fdXBkYXRlUm9vdHMocm9vdCA9PiB7XG4gICAgICByZXR1cm4gcm9vdC5zZXRSZWN1cnNpdmUoXG4gICAgICAgIG5vZGUgPT4gbm9kZS5jb250YWluc1NlbGVjdGlvbiA/IG51bGwgOiBub2RlLFxuICAgICAgICBub2RlID0+IG5vZGUuc2V0SXNTZWxlY3RlZChmYWxzZSksXG4gICAgICApO1xuICAgIH0pO1xuICB9XG5cbiAgX3NldFJvb3RLZXlzKHJvb3RLZXlzOiBBcnJheTxOdWNsaWRlVXJpPik6IHZvaWQge1xuICAgIGNvbnN0IHJvb3ROb2RlcyA9IHJvb3RLZXlzLm1hcChyb290VXJpID0+IHtcbiAgICAgIGNvbnN0IHJvb3QgPSB0aGlzLnJvb3RzLmdldChyb290VXJpKTtcbiAgICAgIGlmIChyb290ICE9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHJvb3Q7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBuZXcgRmlsZVRyZWVOb2RlKHtcbiAgICAgICAgdXJpOiByb290VXJpLFxuICAgICAgICByb290VXJpLFxuICAgICAgICBjb25uZWN0aW9uVGl0bGU6IEZpbGVUcmVlSGVscGVycy5nZXREaXNwbGF5VGl0bGUocm9vdFVyaSkgfHwgJycsXG4gICAgICB9LCB0aGlzLl9jb25mKTtcbiAgICB9KTtcblxuICAgIGNvbnN0IHJvb3RzID0gbmV3IEltbXV0YWJsZS5PcmRlcmVkTWFwKHJvb3ROb2Rlcy5tYXAocm9vdCA9PiBbcm9vdC51cmksIHJvb3RdKSk7XG4gICAgY29uc3QgcmVtb3ZlZFJvb3RzID0gdGhpcy5yb290cy5maWx0ZXIocm9vdCA9PiAhcm9vdHMuaGFzKHJvb3QudXJpKSk7XG4gICAgcmVtb3ZlZFJvb3RzLmZvckVhY2gocm9vdCA9PiByb290LnRyYXZlcnNlKFxuICAgICAgbm9kZSA9PiBub2RlLmlzRXhwYW5kZWQsXG4gICAgICBub2RlID0+IHtcbiAgICAgICAgaWYgKG5vZGUuc3Vic2NyaXB0aW9uICE9IG51bGwpIHtcbiAgICAgICAgICBub2RlLnN1YnNjcmlwdGlvbi5kaXNwb3NlKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICApKTtcbiAgICB0aGlzLl9zZXRSb290cyhyb290cyk7XG5cbiAgICAvLyBKdXN0IGluIGNhc2UgdGhlcmUncyBhIHJhY2UgYmV0d2VlbiB0aGUgdXBkYXRlIG9mIHRoZSByb290IGtleXMgYW5kIHRoZSBjd2RLZXkgYW5kIHRoZSBjd2RLZXlcbiAgICAvLyBpcyBzZXQgdG9vIGVhcmx5IC0gc2V0IGl0IGFnYWluLiBJZiB0aGVyZSB3YXMgbm8gcmFjZSAtIGl0J3MgYSBub29wLlxuICAgIHRoaXMuX3NldEN3ZEtleSh0aGlzLl9jd2RLZXkpO1xuICB9XG5cbiAgLyoqXG4gICogTWFrZXMgc3VyZSBhIGNlcnRhaW4gY2hpbGQgbm9kZSBpcyBwcmVzZW50IGluIHRoZSBmaWxlIHRyZWUsIGNyZWF0aW5nIGFsbCBpdHMgYW5jZXN0b3JzLCBpZlxuICAqIG5lZWRlZCBhbmQgc2NoZWR1bGluZyBhIGNoaWxsZCBrZXkgZmV0Y2guIFVzZWQgYnkgdGhlIHJldmVhbCBhY3RpdmUgZmlsZSBmdW5jdGlvbmFsaXR5LlxuICAqL1xuICBfZW5zdXJlQ2hpbGROb2RlKG5vZGVLZXk6IE51Y2xpZGVVcmkpOiB2b2lkIHtcbiAgICBsZXQgZmlyc3RSb290VXJpO1xuXG4gICAgY29uc3QgZXhwYW5kTm9kZSA9IG5vZGUgPT4ge1xuICAgICAgaWYgKG5vZGUuaXNFeHBhbmRlZCAmJiBub2RlLnN1YnNjcmlwdGlvbiAhPSBudWxsKSB7XG4gICAgICAgIHJldHVybiBub2RlO1xuICAgICAgfVxuXG4gICAgICBpZiAobm9kZS5zdWJzY3JpcHRpb24gIT0gbnVsbCkge1xuICAgICAgICBub2RlLnN1YnNjcmlwdGlvbi5kaXNwb3NlKCk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGRpcmVjdG9yeSA9IEZpbGVUcmVlSGVscGVycy5nZXREaXJlY3RvcnlCeUtleShub2RlLnVyaSk7XG4gICAgICBjb25zdCBzdWJzY3JpcHRpb24gPSB0aGlzLl9tYWtlU3Vic2NyaXB0aW9uKG5vZGUudXJpLCBkaXJlY3RvcnkpO1xuICAgICAgcmV0dXJuIG5vZGUuc2V0KHtzdWJzY3JpcHRpb24sIGlzRXhwYW5kZWQ6IHRydWV9KTtcbiAgICB9O1xuXG4gICAgdGhpcy5fdXBkYXRlUm9vdHMocm9vdCA9PiB7XG4gICAgICBpZiAoIW5vZGVLZXkuc3RhcnRzV2l0aChyb290LnVyaSkpIHtcbiAgICAgICAgcmV0dXJuIHJvb3Q7XG4gICAgICB9XG5cbiAgICAgIGlmIChmaXJzdFJvb3RVcmkgPT0gbnVsbCkge1xuICAgICAgICBmaXJzdFJvb3RVcmkgPSByb290LnVyaTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgZGVlcGVzdCA9IHJvb3QuZmluZERlZXBlc3Qobm9kZUtleSk7XG4gICAgICBpZiAoZGVlcGVzdCA9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiByb290O1xuICAgICAgfVxuXG4gICAgICBpZiAoZGVlcGVzdC51cmkgPT09IG5vZGVLZXkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2J1YmJsZVVwKFxuICAgICAgICAgIGRlZXBlc3QsXG4gICAgICAgICAgZGVlcGVzdCxcbiAgICAgICAgICBleHBhbmROb2RlLFxuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBwYXJlbnRzID0gW107XG4gICAgICBsZXQgY3VycmVudFBhcmVudFVyaSA9IEZpbGVUcmVlSGVscGVycy5nZXRQYXJlbnRLZXkobm9kZUtleSk7XG4gICAgICB3aGlsZSAoY3VycmVudFBhcmVudFVyaSAhPT0gZGVlcGVzdC51cmkpIHtcbiAgICAgICAgcGFyZW50cy5wdXNoKGN1cnJlbnRQYXJlbnRVcmkpO1xuICAgICAgICBjdXJyZW50UGFyZW50VXJpID0gRmlsZVRyZWVIZWxwZXJzLmdldFBhcmVudEtleShjdXJyZW50UGFyZW50VXJpKTtcbiAgICAgIH1cblxuICAgICAgbGV0IGN1cnJlbnRDaGlsZCA9IGRlZXBlc3QuY3JlYXRlQ2hpbGQoe3VyaTogbm9kZUtleX0pO1xuXG4gICAgICBwYXJlbnRzLmZvckVhY2goY3VycmVudFVyaSA9PiB7XG4gICAgICAgIHRoaXMuX2ZldGNoQ2hpbGRLZXlzKGN1cnJlbnRVcmkpO1xuICAgICAgICBjb25zdCBwYXJlbnQgPSBkZWVwZXN0LmNyZWF0ZUNoaWxkKHtcbiAgICAgICAgICB1cmk6IGN1cnJlbnRVcmksXG4gICAgICAgICAgaXNMb2FkaW5nOiB0cnVlLFxuICAgICAgICAgIGlzRXhwYW5kZWQ6IHRydWUsXG4gICAgICAgICAgY2hpbGRyZW46IEZpbGVUcmVlTm9kZS5jaGlsZHJlbkZyb21BcnJheShbY3VycmVudENoaWxkXSksXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGN1cnJlbnRDaGlsZCA9IHBhcmVudDtcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLl9mZXRjaENoaWxkS2V5cyhkZWVwZXN0LnVyaSk7XG4gICAgICByZXR1cm4gdGhpcy5fYnViYmxlVXAoXG4gICAgICAgIGRlZXBlc3QsXG4gICAgICAgIGRlZXBlc3Quc2V0KHtcbiAgICAgICAgICBpc0xvYWRpbmc6IHRydWUsXG4gICAgICAgICAgaXNFeHBhbmRlZDogdHJ1ZSxcbiAgICAgICAgICBjaGlsZHJlbjogZGVlcGVzdC5jaGlsZHJlbi5zZXQoY3VycmVudENoaWxkLm5hbWUsIGN1cnJlbnRDaGlsZCksXG4gICAgICAgIH0pLFxuICAgICAgICBleHBhbmROb2RlLFxuICAgICAgKTtcbiAgICB9KTtcblxuICAgIGlmIChmaXJzdFJvb3RVcmkgIT0gbnVsbCkge1xuICAgICAgdGhpcy5fc2V0U2VsZWN0ZWROb2RlKGZpcnN0Um9vdFVyaSwgbm9kZUtleSk7XG4gICAgfVxuICB9XG5cbiAgX2NsZWFyVHJhY2tlZE5vZGUoKTogdm9pZCB7XG4gICAgdGhpcy5fdXBkYXRlUm9vdHMocm9vdCA9PiB7XG4gICAgICBpZiAoIXJvb3QuY29udGFpbnNUcmFja2VkTm9kZSkge1xuICAgICAgICByZXR1cm4gcm9vdDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJvb3Quc2V0UmVjdXJzaXZlKFxuICAgICAgICBub2RlID0+IG5vZGUuY29udGFpbnNUcmFja2VkTm9kZSA/IG51bGwgOiBub2RlLFxuICAgICAgICBub2RlID0+IG5vZGUuc2V0SXNUcmFja2VkKGZhbHNlKSxcbiAgICAgICk7XG4gICAgfSk7XG4gIH1cblxuICBfc2V0VHJhY2tlZE5vZGUocm9vdEtleTogTnVjbGlkZVVyaSwgbm9kZUtleTogTnVjbGlkZVVyaSk6IHZvaWQge1xuICAgIHRoaXMuX2NsZWFyVHJhY2tlZE5vZGUoKTtcbiAgICB0aGlzLl91cGRhdGVOb2RlQXRSb290KHJvb3RLZXksIG5vZGVLZXksIG5vZGUgPT4gbm9kZS5zZXRJc1RyYWNrZWQodHJ1ZSkpO1xuICB9XG5cbiAgX3NldFJlcG9zaXRvcmllcyhyZXBvc2l0b3JpZXM6IEltbXV0YWJsZS5TZXQ8YXRvbSRSZXBvc2l0b3J5Pik6IHZvaWQge1xuICAgIHRoaXMuX3JlcG9zaXRvcmllcyA9IHJlcG9zaXRvcmllcztcbiAgICB0aGlzLl91cGRhdGVDb25mKGNvbmYgPT4ge1xuICAgICAgY29uc3QgcmVwb3NCeVJvb3QgPSB7fTtcbiAgICAgIHRoaXMucm9vdHMuZm9yRWFjaChyb290ID0+IHtcbiAgICAgICAgcmVwb3NCeVJvb3Rbcm9vdC51cmldID0gcmVwb3NpdG9yeUZvclBhdGgocm9vdC51cmkpO1xuICAgICAgfSk7XG4gICAgICBjb25mLnJlcG9zQnlSb290ID0gcmVwb3NCeVJvb3Q7XG4gICAgfSk7XG4gIH1cblxuICBfc2V0V29ya2luZ1NldCh3b3JraW5nU2V0OiBXb3JraW5nU2V0KTogdm9pZCB7XG4gICAgdGhpcy5fdXBkYXRlQ29uZihjb25mID0+IGNvbmYud29ya2luZ1NldCA9IHdvcmtpbmdTZXQpO1xuICB9XG5cbiAgX3NldE9wZW5GaWxlc1dvcmtpbmdTZXQob3BlbkZpbGVzV29ya2luZ1NldDogV29ya2luZ1NldCk6IHZvaWQge1xuICAgIHRoaXMuX3VwZGF0ZUNvbmYoY29uZiA9PiBjb25mLm9wZW5GaWxlc1dvcmtpbmdTZXQgPSBvcGVuRmlsZXNXb3JraW5nU2V0KTtcbiAgfVxuXG4gIF9zZXRXb3JraW5nU2V0c1N0b3JlKHdvcmtpbmdTZXRzU3RvcmU6ID9Xb3JraW5nU2V0c1N0b3JlKTogdm9pZCB7XG4gICAgdGhpcy5fd29ya2luZ1NldHNTdG9yZSA9IHdvcmtpbmdTZXRzU3RvcmU7XG4gIH1cblxuICBfc3RhcnRFZGl0aW5nV29ya2luZ1NldChlZGl0ZWRXb3JraW5nU2V0OiBXb3JraW5nU2V0KTogdm9pZCB7XG4gICAgdGhpcy5fdXBkYXRlQ29uZihjb25mID0+IHtcbiAgICAgIGNvbmYuZWRpdGVkV29ya2luZ1NldCA9IGVkaXRlZFdvcmtpbmdTZXQ7XG4gICAgICBjb25mLmlzRWRpdGluZ1dvcmtpbmdTZXQgPSB0cnVlO1xuICAgIH0pO1xuICB9XG5cbiAgX2ZpbmlzaEVkaXRpbmdXb3JraW5nU2V0KCk6IHZvaWQge1xuICAgIHRoaXMuX3VwZGF0ZUNvbmYoY29uZiA9PiB7XG4gICAgICBjb25mLmlzRWRpdGluZ1dvcmtpbmdTZXQgPSBmYWxzZTtcbiAgICAgIGNvbmYuZWRpdGVkV29ya2luZ1NldCA9IG5ldyBXb3JraW5nU2V0KCk7XG4gICAgfSk7XG4gIH1cblxuICBfY2hlY2tOb2RlKHJvb3RLZXk6IE51Y2xpZGVVcmksIG5vZGVLZXk6IE51Y2xpZGVVcmkpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuX2NvbmYuaXNFZGl0aW5nV29ya2luZ1NldCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGxldCBub2RlID0gdGhpcy5nZXROb2RlKHJvb3RLZXksIG5vZGVLZXkpO1xuICAgIGlmIChub2RlID09IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgdXJpVG9BcHBlbmQgPSBub2RlS2V5OyAvLyBXb3JrYXJvdW5kIGZsb3cncyAob3ZlcilhZ2dyZXNzaXZlIG51bGxhYmlsaXR5IGRldGVjdGlvblxuXG4gICAgY29uc3QgYWxsQ2hlY2tlZCA9IG5vZGVQYXJlbnQgPT4ge1xuICAgICAgcmV0dXJuIG5vZGVQYXJlbnQuY2hpbGRyZW4uZXZlcnkoYyA9PiB7XG4gICAgICAgIHJldHVybiAhYy5zaG91bGRCZVNob3duIHx8IGMuY2hlY2tlZFN0YXR1cyA9PT0gJ2NoZWNrZWQnIHx8IGMgPT09IG5vZGU7XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgd2hpbGUgKG5vZGUucGFyZW50ICE9IG51bGwgJiYgYWxsQ2hlY2tlZChub2RlLnBhcmVudCkpIHtcbiAgICAgIG5vZGUgPSBub2RlLnBhcmVudDtcbiAgICAgIHVyaVRvQXBwZW5kID0gbm9kZS51cmk7XG4gICAgfVxuXG4gICAgdGhpcy5fdXBkYXRlQ29uZihjb25mID0+IHtcbiAgICAgIGNvbmYuZWRpdGVkV29ya2luZ1NldCA9IGNvbmYuZWRpdGVkV29ya2luZ1NldC5hcHBlbmQodXJpVG9BcHBlbmQpO1xuICAgIH0pO1xuICB9XG5cbiAgX3VuY2hlY2tOb2RlKHJvb3RLZXk6IE51Y2xpZGVVcmksIG5vZGVLZXk6IE51Y2xpZGVVcmkpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuX2NvbmYuaXNFZGl0aW5nV29ya2luZ1NldCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGxldCBub2RlID0gdGhpcy5nZXROb2RlKHJvb3RLZXksIG5vZGVLZXkpO1xuICAgIGlmIChub2RlID09IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBub2Rlc1RvQXBwZW5kID0gW107XG4gICAgbGV0IHVyaVRvUmVtb3ZlID0gbm9kZUtleTtcblxuICAgIHdoaWxlIChub2RlLnBhcmVudCAhPSBudWxsICYmIG5vZGUucGFyZW50LmNoZWNrZWRTdGF0dXMgPT09ICdjaGVja2VkJykge1xuICAgICAgY29uc3QgcGFyZW50ID0gbm9kZS5wYXJlbnQ7IC8vIFdvcmthcm91bmQgZmxvdydzIChvdmVyKWFnZ3Jlc3NpdmUgbnVsbGFiaWxpdHkgZGV0ZWN0aW9uXG4gICAgICBwYXJlbnQuY2hpbGRyZW4uZm9yRWFjaChjID0+IHtcbiAgICAgICAgaWYgKGMgIT09IG5vZGUpIHtcbiAgICAgICAgICBub2Rlc1RvQXBwZW5kLnB1c2goYyk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBub2RlID0gcGFyZW50O1xuICAgICAgdXJpVG9SZW1vdmUgPSBub2RlLnVyaTtcbiAgICB9XG5cbiAgICB0aGlzLl91cGRhdGVDb25mKGNvbmYgPT4ge1xuICAgICAgY29uc3QgdXJpc1RvQXBwZW5kID0gbm9kZXNUb0FwcGVuZC5tYXAobiA9PiBuLnVyaSk7XG4gICAgICBjb25mLmVkaXRlZFdvcmtpbmdTZXQgPSBjb25mLmVkaXRlZFdvcmtpbmdTZXQucmVtb3ZlKHVyaVRvUmVtb3ZlKS5hcHBlbmQoLi4udXJpc1RvQXBwZW5kKTtcbiAgICB9KTtcbiAgfVxuXG4gIHJlc2V0KCk6IHZvaWQge1xuICAgIHRoaXMucm9vdHMuZm9yRWFjaChyb290ID0+IHtcbiAgICAgIHJvb3QudHJhdmVyc2UobiA9PiB7XG4gICAgICAgIGlmIChuLnN1YnNjcmlwdGlvbiAhPSBudWxsKSB7XG4gICAgICAgICAgbi5zdWJzY3JpcHRpb24uZGlzcG9zZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIC8vIFJlc2V0IGRhdGEgc3RvcmUuXG4gICAgdGhpcy5fY29uZiA9IERFRkFVTFRfQ09ORjtcbiAgICB0aGlzLl9zZXRSb290cyhuZXcgSW1tdXRhYmxlLk9yZGVyZWRNYXAoKSk7XG4gIH1cblxuICBzdWJzY3JpYmUobGlzdGVuZXI6IENoYW5nZUxpc3RlbmVyKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9lbWl0dGVyLm9uKCdjaGFuZ2UnLCBsaXN0ZW5lcik7XG4gIH1cbn1cblxuLyoqXG4gKiBQZXJmb3JtcyBhIGJyZWFkdGgtZmlyc3QgaXRlcmF0aW9uIG92ZXIgdGhlIGRpcmVjdG9yaWVzIG9mIHRoZSB0cmVlIHN0YXJ0aW5nXG4gKiB3aXRoIGEgZ2l2ZW4gbm9kZS4gVGhlIGl0ZXJhdGlvbiBzdG9wcyBvbmNlIGEgZ2l2ZW4gbGltaXQgb2Ygbm9kZXMgKGJvdGggZGlyZWN0b3JpZXNcbiAqIGFuZCBmaWxlcykgd2VyZSB0cmF2ZXJzZWQuXG4gKiBUaGUgbm9kZSBiZWluZyBjdXJyZW50bHkgdHJhdmVyc2VkIGNhbiBiZSBvYnRhaW5lZCBieSBjYWxsaW5nIC50cmF2ZXJzZWROb2RlKClcbiAqIC5uZXh0KCkgcmV0dXJucyBhIHByb21pc2UgdGhhdCBpcyBmdWxmaWxsZWQgd2hlbiB0aGUgdHJhdmVyc2FsIG1vdmVzIG9uIHRvXG4gKiB0aGUgbmV4dCBkaXJlY3RvcnkuXG4gKi9cbmNsYXNzIEZpbGVUcmVlU3RvcmVCZnNJdGVyYXRvciB7XG4gIF9maWxlVHJlZVN0b3JlOiBGaWxlVHJlZVN0b3JlO1xuICBfcm9vdEtleTogTnVjbGlkZVVyaTtcbiAgX25vZGVzVG9UcmF2ZXJzZTogQXJyYXk8TnVjbGlkZVVyaT47XG4gIF9jdXJyZW50bHlUcmF2ZXJzZWROb2RlOiA/TnVjbGlkZVVyaTtcbiAgX2xpbWl0OiBudW1iZXI7XG4gIF9udW1Ob2Rlc1RyYXZlcnNlZDogbnVtYmVyO1xuICBfcHJvbWlzZTogP1Byb21pc2U8dm9pZD47XG4gIF9jb3VudDogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgZmlsZVRyZWVTdG9yZTogRmlsZVRyZWVTdG9yZSxcbiAgICAgIHJvb3RLZXk6IE51Y2xpZGVVcmksXG4gICAgICBub2RlS2V5OiBOdWNsaWRlVXJpLFxuICAgICAgbGltaXQ6IG51bWJlcikge1xuICAgIHRoaXMuX2ZpbGVUcmVlU3RvcmUgPSBmaWxlVHJlZVN0b3JlO1xuICAgIHRoaXMuX3Jvb3RLZXkgPSByb290S2V5O1xuICAgIHRoaXMuX25vZGVzVG9UcmF2ZXJzZSA9IFtdO1xuICAgIHRoaXMuX2N1cnJlbnRseVRyYXZlcnNlZE5vZGUgPSBub2RlS2V5O1xuICAgIHRoaXMuX2xpbWl0ID0gbGltaXQ7XG4gICAgdGhpcy5fbnVtTm9kZXNUcmF2ZXJzZWQgPSAwO1xuICAgIHRoaXMuX3Byb21pc2UgPSBudWxsO1xuICAgIHRoaXMuX2NvdW50ID0gMDtcbiAgfVxuXG4gIF9oYW5kbGVQcm9taXNlUmVzb2x1dGlvbihjaGlsZHJlbktleXM6IEFycmF5PE51Y2xpZGVVcmk+KTogdm9pZCB7XG4gICAgdGhpcy5fbnVtTm9kZXNUcmF2ZXJzZWQgKz0gY2hpbGRyZW5LZXlzLmxlbmd0aDtcbiAgICBpZiAodGhpcy5fbnVtTm9kZXNUcmF2ZXJzZWQgPCB0aGlzLl9saW1pdCkge1xuICAgICAgY29uc3QgbmV4dExldmVsTm9kZXMgPSBjaGlsZHJlbktleXMuZmlsdGVyKGNoaWxkS2V5ID0+IEZpbGVUcmVlSGVscGVycy5pc0RpcktleShjaGlsZEtleSkpO1xuICAgICAgdGhpcy5fbm9kZXNUb1RyYXZlcnNlID0gdGhpcy5fbm9kZXNUb1RyYXZlcnNlLmNvbmNhdChuZXh0TGV2ZWxOb2Rlcyk7XG5cbiAgICAgIHRoaXMuX2N1cnJlbnRseVRyYXZlcnNlZE5vZGUgPSB0aGlzLl9ub2Rlc1RvVHJhdmVyc2Uuc3BsaWNlKDAsIDEpWzBdO1xuICAgICAgdGhpcy5fcHJvbWlzZSA9IG51bGw7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2N1cnJlbnRseVRyYXZlcnNlZE5vZGUgPSBudWxsO1xuICAgICAgdGhpcy5fcHJvbWlzZSA9IG51bGw7XG4gICAgfVxuXG4gICAgcmV0dXJuO1xuICB9XG5cbiAgbmV4dCgpOiA/UHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgY3VycmVudGx5VHJhdmVyc2VkTm9kZSA9IHRoaXMuX2N1cnJlbnRseVRyYXZlcnNlZE5vZGU7XG4gICAgaWYgKCF0aGlzLl9wcm9taXNlICYmIGN1cnJlbnRseVRyYXZlcnNlZE5vZGUpIHtcbiAgICAgIHRoaXMuX3Byb21pc2UgPSB0aGlzLl9maWxlVHJlZVN0b3JlLnByb21pc2VOb2RlQ2hpbGRLZXlzKFxuICAgICAgICB0aGlzLl9yb290S2V5LFxuICAgICAgICBjdXJyZW50bHlUcmF2ZXJzZWROb2RlKVxuICAgICAgLnRoZW4odGhpcy5faGFuZGxlUHJvbWlzZVJlc29sdXRpb24uYmluZCh0aGlzKSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9wcm9taXNlO1xuICB9XG5cbiAgdHJhdmVyc2VkTm9kZSgpOiA/c3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fY3VycmVudGx5VHJhdmVyc2VkTm9kZTtcbiAgfVxufVxuIl19