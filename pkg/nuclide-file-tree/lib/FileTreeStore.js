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

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _FileTreeConstants = require('./FileTreeConstants');

var _atom = require('atom');

var _minimatch = require('minimatch');

var _nuclideHgGitBridge = require('../../nuclide-hg-git-bridge');

var _nuclideHgRepositoryBaseLibHgConstants = require('../../nuclide-hg-repository-base/lib/hg-constants');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _nuclideLogging = require('../../nuclide-logging');

var _shell = require('shell');

var _shell2 = _interopRequireDefault(_shell);

var _nuclideWorkingSets = require('../../nuclide-working-sets');

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
        _this5._emitter.emit('change');
        _this5._suppressChanges = true;
        _this5._checkTrackedNode();
        _this5._suppressChanges = false;
        _this5._animationFrameRequestId = null;
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
          ensurePresentParents(uri);
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
      var uris = [];

      this.roots.forEach(function (root) {
        return root.traverse(function (node) {
          if (node.checkedStatus === 'partial') {
            return true;
          } else if (node.checkedStatus === 'checked') {
            uris.push(node.uri);
          }

          return false;
        });
      });

      return new _nuclideWorkingSets.WorkingSet(uris);
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
      var _this7 = this;

      var existingPromise = this._getLoading(nodeKey);
      if (existingPromise != null) {
        return existingPromise;
      }

      var promise = _FileTreeHelpers2['default'].fetchChildren(nodeKey)['catch'](function (error) {
        _this7._logger.error('Unable to fetch children for "' + nodeKey + '".');
        _this7._logger.error('Original error: ', error);

        // Collapse the node and clear its loading state on error so the
        // user can retry expanding it.
        _this7._updateNodeAtAllRoots(nodeKey, function (node) {
          return node.set({ isExpanded: false, isLoading: false, children: new _immutable2['default'].OrderedMap() });
        });

        _this7._clearLoading(nodeKey);
      }).then(function (childKeys) {
        var childrenKeys = childKeys || [];
        var directory = _FileTreeHelpers2['default'].getDirectoryByKey(nodeKey);

        // The node with URI === nodeKey might be present at several roots - update them all
        _this7._updateNodeAtAllRoots(nodeKey, function (node) {
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
          var subscription = _this7._makeSubscription(nodeKey, directory);

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

        _this7._clearLoading(nodeKey);
      });

      this._setLoading(nodeKey, promise);
      return promise;
    }
  }, {
    key: '_makeSubscription',
    value: function _makeSubscription(nodeKey, directory) {
      var _this8 = this;

      if (directory == null) {
        return null;
      }

      try {
        // This call might fail if we try to watch a non-existing directory, or if permission denied.
        return directory.onDidChange(function () {
          _this8._fetchChildKeys(nodeKey);
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
      var _this9 = this;

      this._updateNodeAtRoot(rootKey, nodeKey, function (node) {
        return node.setIsExpanded(true).setRecursive(function (n) {
          return !n.isContainer || !n.isExpanded ? n : null;
        }, function (n) {
          if (n.isContainer && n.isExpanded) {
            _this9._fetchChildKeys(n.uri);
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
      var _this10 = this;

      // Stop the traversal after 100 nodes were added to the tree
      var itNodes = new FileTreeStoreBfsIterator(this, rootKey, nodeKey, /* limit*/100);
      var promise = new Promise(function (resolve) {
        var expand = function expand() {
          var traversedNodeKey = itNodes.traversedNode();
          if (traversedNodeKey) {
            _this10._expandNode(rootKey, traversedNodeKey);

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
        (0, _assert2['default'])(node.isExpanded);
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
      var _this11 = this;

      var rootNodes = rootKeys.map(function (rootUri) {
        var root = _this11.roots.get(rootUri);
        if (root != null) {
          return root;
        }

        return new _FileTreeNode.FileTreeNode({
          uri: rootUri,
          rootUri: rootUri,
          connectionTitle: _FileTreeHelpers2['default'].getDisplayTitle(rootUri) || ''
        }, _this11._conf);
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
      var _this12 = this;

      var firstRootUri = undefined;

      var expandNode = function expandNode(node) {
        if (node.isExpanded && node.subscription != null) {
          return node;
        }

        if (node.subscription != null) {
          node.subscription.dispose();
        }

        var directory = _FileTreeHelpers2['default'].getDirectoryByKey(node.uri);
        var subscription = _this12._makeSubscription(node.uri, directory);
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
          return _this12._bubbleUp(deepest, deepest, expandNode);
        }

        var parents = [];
        var currentParentUri = _FileTreeHelpers2['default'].getParentKey(nodeKey);
        while (currentParentUri !== deepest.uri) {
          parents.push(currentParentUri);
          currentParentUri = _FileTreeHelpers2['default'].getParentKey(currentParentUri);
        }

        var currentChild = deepest.createChild({ uri: nodeKey });

        parents.forEach(function (currentUri) {
          _this12._fetchChildKeys(currentUri);
          var parent = deepest.createChild({
            uri: currentUri,
            isLoading: true,
            isExpanded: true,
            children: _FileTreeNode.FileTreeNode.childrenFromArray([currentChild])
          });

          currentChild = parent;
        });

        _this12._fetchChildKeys(deepest.uri);
        return _this12._bubbleUp(deepest, deepest.set({
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
      var _this13 = this;

      this._repositories = repositories;
      this._updateConf(function (conf) {
        var reposByRoot = {};
        _this13.roots.forEach(function (root) {
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
    value: function _startEditingWorkingSet() {
      this._updateRoots(function (root) {
        return root.setRecursive(null, function (node) {
          return node.setCheckedStatus('clear');
        });
      });
      this._updateConf(function (conf) {
        return conf.isEditingWorkingSet = true;
      });
    }
  }, {
    key: '_finishEditingWorkingSet',
    value: function _finishEditingWorkingSet() {
      this._updateRoots(function (root) {
        return root.setRecursive(null, function (node) {
          return node.setCheckedStatus('clear');
        });
      });
      this._updateConf(function (conf) {
        return conf.isEditingWorkingSet = false;
      });
    }
  }, {
    key: '_checkNode',
    value: function _checkNode(rootKey, nodeKey) {
      if (!this._conf.isEditingWorkingSet) {
        return;
      }

      this._updateNodeAtRoot(rootKey, nodeKey, function (node) {
        return node.setRecursive(function (n) {
          return n.checkedStatus === 'checked' ? n : null;
        }, function (n) {
          return n.setCheckedStatus('checked');
        });
      });
    }
  }, {
    key: '_uncheckNode',
    value: function _uncheckNode(rootKey, nodeKey) {
      if (!this._conf.isEditingWorkingSet) {
        return;
      }

      this._updateNodeAtRoot(rootKey, nodeKey, function (node) {
        return node.setRecursive(function (n) {
          return n.checkedStatus === 'clear' ? n : null;
        }, function (n) {
          return n.setCheckedStatus('clear');
        });
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
//# sourceMappingURL=data:application/json;base64,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Q0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO09BQ3RCLE1BQU07QUFDTCxZQUFJLENBQUMsdUJBQXVCLEdBQUcsSUFBSSxDQUFDO0FBQ3BDLFlBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO09BQ3RCOztBQUVELGFBQU87S0FDUjs7O1dBRUcsZ0JBQW1CO0FBQ3JCLFVBQU0sc0JBQXNCLEdBQUcsSUFBSSxDQUFDLHVCQUF1QixDQUFDO0FBQzVELFVBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxJQUFJLHNCQUFzQixFQUFFO0FBQzVDLFlBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxvQkFBb0IsQ0FDdEQsSUFBSSxDQUFDLFFBQVEsRUFDYixzQkFBc0IsQ0FBQyxDQUN4QixJQUFJLENBQUMsSUFBSSxDQUFDLHdCQUF3QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO09BQ2pEO0FBQ0QsYUFBTyxJQUFJLENBQUMsUUFBUSxDQUFDO0tBQ3RCOzs7V0FFWSx5QkFBWTtBQUN2QixhQUFPLElBQUksQ0FBQyx1QkFBdUIsQ0FBQztLQUNyQzs7O1NBdERHLHdCQUF3QiIsImZpbGUiOiJGaWxlVHJlZVN0b3JlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0hnUmVwb3NpdG9yeUNsaWVudH0gZnJvbSAnLi4vLi4vbnVjbGlkZS1oZy1yZXBvc2l0b3J5LWNsaWVudCc7XG5pbXBvcnQgdHlwZSB7XG4gIFJlbW90ZURpcmVjdG9yeSxcbiAgUmVtb3RlRmlsZSxcbn0gZnJvbSAnLi4vLi4vbnVjbGlkZS1yZW1vdGUtY29ubmVjdGlvbic7XG5cbmltcG9ydCBGaWxlVHJlZURpc3BhdGNoZXIgZnJvbSAnLi9GaWxlVHJlZURpc3BhdGNoZXInO1xuaW1wb3J0IEZpbGVUcmVlSGVscGVycyBmcm9tICcuL0ZpbGVUcmVlSGVscGVycyc7XG5pbXBvcnQge0ZpbGVUcmVlTm9kZX0gZnJvbSAnLi9GaWxlVHJlZU5vZGUnO1xuaW1wb3J0IEltbXV0YWJsZSBmcm9tICdpbW11dGFibGUnO1xuaW1wb3J0IHtBY3Rpb25UeXBlfSBmcm9tICcuL0ZpbGVUcmVlQ29uc3RhbnRzJztcbmltcG9ydCB7RW1pdHRlcn0gZnJvbSAnYXRvbSc7XG5pbXBvcnQge01pbmltYXRjaH0gZnJvbSAnbWluaW1hdGNoJztcbmltcG9ydCB7cmVwb3NpdG9yeUZvclBhdGh9IGZyb20gJy4uLy4uL251Y2xpZGUtaGctZ2l0LWJyaWRnZSc7XG5pbXBvcnQge1N0YXR1c0NvZGVOdW1iZXJ9IGZyb20gJy4uLy4uL251Y2xpZGUtaGctcmVwb3NpdG9yeS1iYXNlL2xpYi9oZy1jb25zdGFudHMnO1xuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHtnZXRMb2dnZXJ9IGZyb20gJy4uLy4uL251Y2xpZGUtbG9nZ2luZyc7XG5pbXBvcnQgc2hlbGwgZnJvbSAnc2hlbGwnO1xuXG5pbXBvcnQge1dvcmtpbmdTZXR9IGZyb20gJy4uLy4uL251Y2xpZGUtd29ya2luZy1zZXRzJztcblxuLy8gVXNlZCB0byBlbnN1cmUgdGhlIHZlcnNpb24gd2Ugc2VyaWFsaXplZCBpcyB0aGUgc2FtZSB2ZXJzaW9uIHdlIGFyZSBkZXNlcmlhbGl6aW5nLlxuY29uc3QgVkVSU0lPTiA9IDE7XG5cbmltcG9ydCB0eXBlIHtEaXJlY3Rvcnl9IGZyb20gJy4vRmlsZVRyZWVIZWxwZXJzJztcbmltcG9ydCB0eXBlIHtEaXNwYXRjaGVyfSBmcm9tICdmbHV4JztcbmltcG9ydCB0eXBlIHtOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9udWNsaWRlLXJlbW90ZS11cmknO1xuaW1wb3J0IHR5cGUge1dvcmtpbmdTZXRzU3RvcmV9IGZyb20gJy4uLy4uL251Y2xpZGUtd29ya2luZy1zZXRzL2xpYi9Xb3JraW5nU2V0c1N0b3JlJztcbmltcG9ydCB0eXBlIHtTdGF0dXNDb2RlTnVtYmVyVmFsdWV9IGZyb20gJy4uLy4uL251Y2xpZGUtaGctcmVwb3NpdG9yeS1iYXNlL2xpYi9IZ1NlcnZpY2UnO1xuXG5cbnR5cGUgQWN0aW9uUGF5bG9hZCA9IE9iamVjdDtcbnR5cGUgQ2hhbmdlTGlzdGVuZXIgPSAoKSA9PiBtaXhlZDtcblxuZXhwb3J0IHR5cGUgRXhwb3J0U3RvcmVEYXRhID0ge1xuICBjaGlsZEtleU1hcDogeyBba2V5OiBzdHJpbmddOiBBcnJheTxzdHJpbmc+IH07XG4gIGV4cGFuZGVkS2V5c0J5Um9vdDogeyBba2V5OiBzdHJpbmddOiBBcnJheTxzdHJpbmc+IH07XG4gIHJvb3RLZXlzOiBBcnJheTxzdHJpbmc+O1xuICBzZWxlY3RlZEtleXNCeVJvb3Q6IHsgW2tleTogc3RyaW5nXTogQXJyYXk8c3RyaW5nPiB9O1xuICB2ZXJzaW9uOiBudW1iZXI7XG59O1xuXG5leHBvcnQgdHlwZSBTdG9yZUNvbmZpZ0RhdGEgPSB7XG4gICAgdmNzU3RhdHVzZXM6IHtbcm9vdFVyaTogTnVjbGlkZVVyaV06IHtbcGF0aDogTnVjbGlkZVVyaV06IFN0YXR1c0NvZGVOdW1iZXJWYWx1ZX19O1xuICAgIHdvcmtpbmdTZXQ6IFdvcmtpbmdTZXQ7XG4gICAgaGlkZUlnbm9yZWROYW1lczogYm9vbGVhbjtcbiAgICBleGNsdWRlVmNzSWdub3JlZFBhdGhzOiBib29sZWFuO1xuICAgIGlnbm9yZWRQYXR0ZXJuczogSW1tdXRhYmxlLlNldDxNaW5pbWF0Y2g+O1xuICAgIHVzZVByZXZpZXdUYWJzOiBib29sZWFuO1xuICAgIGlzRWRpdGluZ1dvcmtpbmdTZXQ6IGJvb2xlYW47XG4gICAgb3BlbkZpbGVzV29ya2luZ1NldDogV29ya2luZ1NldDtcbiAgICByZXBvc0J5Um9vdDoge1tyb290VXJpOiBOdWNsaWRlVXJpXTogYXRvbSRSZXBvc2l0b3J5fTtcbn07XG5cbmV4cG9ydCB0eXBlIE5vZGVDaGVja2VkU3RhdHVzID0gJ2NoZWNrZWQnIHwgJ2NsZWFyJyB8ICdwYXJ0aWFsJztcblxuXG5jb25zdCBERUZBVUxUX0NPTkYgPSB7XG4gIHZjc1N0YXR1c2VzOiB7fSxcbiAgd29ya2luZ1NldDogbmV3IFdvcmtpbmdTZXQoKSxcbiAgZWRpdGVkV29ya2luZ1NldDogbmV3IFdvcmtpbmdTZXQoKSxcbiAgaGlkZUlnbm9yZWROYW1lczogdHJ1ZSxcbiAgZXhjbHVkZVZjc0lnbm9yZWRQYXRoczogdHJ1ZSxcbiAgaWdub3JlZFBhdHRlcm5zOiBuZXcgSW1tdXRhYmxlLlNldCgpLFxuICB1c2VQcmV2aWV3VGFiczogZmFsc2UsXG4gIGlzRWRpdGluZ1dvcmtpbmdTZXQ6IGZhbHNlLFxuICBvcGVuRmlsZXNXb3JraW5nU2V0OiBuZXcgV29ya2luZ1NldCgpLFxuICByZXBvc0J5Um9vdDoge30sXG59O1xuXG5sZXQgaW5zdGFuY2U6ID9PYmplY3Q7XG5cbi8qKlxuICogSW1wbGVtZW50cyB0aGUgRmx1eCBwYXR0ZXJuIGZvciBvdXIgZmlsZSB0cmVlLiBBbGwgc3RhdGUgZm9yIHRoZSBmaWxlIHRyZWUgd2lsbCBiZSBrZXB0IGluXG4gKiBGaWxlVHJlZVN0b3JlIGFuZCB0aGUgb25seSB3YXkgdG8gdXBkYXRlIHRoZSBzdG9yZSBpcyB0aHJvdWdoIG1ldGhvZHMgb24gRmlsZVRyZWVBY3Rpb25zLiBUaGVcbiAqIGRpc3BhdGNoZXIgaXMgYSBtZWNoYW5pc20gdGhyb3VnaCB3aGljaCBGaWxlVHJlZUFjdGlvbnMgaW50ZXJmYWNlcyB3aXRoIEZpbGVUcmVlU3RvcmUuXG4gKi9cbmV4cG9ydCBjbGFzcyBGaWxlVHJlZVN0b3JlIHtcbiAgcm9vdHM6IEltbXV0YWJsZS5PcmRlcmVkTWFwPE51Y2xpZGVVcmksIEZpbGVUcmVlTm9kZT47XG4gIF9jb25mOiBTdG9yZUNvbmZpZ0RhdGE7IC8vIFRoZSBjb25maWd1cmF0aW9uIGZvciB0aGUgZmlsZS10cmVlLiBBdm9pZCBkaXJlY3Qgd3JpdGluZy5cbiAgX3dvcmtpbmdTZXRzU3RvcmU6ID9Xb3JraW5nU2V0c1N0b3JlO1xuICBfdXNlUHJlZml4TmF2OiBib29sZWFuO1xuICBfaXNMb2FkaW5nTWFwOiBJbW11dGFibGUuTWFwPE51Y2xpZGVVcmksIFByb21pc2U8dm9pZD4+O1xuICBfcmVwb3NpdG9yaWVzOiBJbW11dGFibGUuU2V0PGF0b20kUmVwb3NpdG9yeT47XG5cbiAgX2Rpc3BhdGNoZXI6IERpc3BhdGNoZXI7XG4gIF9lbWl0dGVyOiBFbWl0dGVyO1xuICBfbG9nZ2VyOiBhbnk7XG4gIF9hbmltYXRpb25GcmFtZVJlcXVlc3RJZDogP251bWJlcjtcbiAgX3N1cHByZXNzQ2hhbmdlczogYm9vbGVhbjtcbiAgX2N3ZEtleTogP051Y2xpZGVVcmk7XG5cbiAgdXNlUHJldk5hdjogYm9vbGVhbjtcblxuICBzdGF0aWMgZ2V0SW5zdGFuY2UoKTogRmlsZVRyZWVTdG9yZSB7XG4gICAgaWYgKCFpbnN0YW5jZSkge1xuICAgICAgaW5zdGFuY2UgPSBuZXcgRmlsZVRyZWVTdG9yZSgpO1xuICAgIH1cbiAgICByZXR1cm4gaW5zdGFuY2U7XG4gIH1cblxuICBzdGF0aWMgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICBpZiAoaW5zdGFuY2UgIT0gbnVsbCkge1xuICAgICAgaW5zdGFuY2UuZGlzcG9zZSgpO1xuICAgIH1cblxuICAgIGluc3RhbmNlID0gbnVsbDtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMucm9vdHMgPSBuZXcgSW1tdXRhYmxlLk9yZGVyZWRNYXAoKTtcbiAgICB0aGlzLl9kaXNwYXRjaGVyID0gRmlsZVRyZWVEaXNwYXRjaGVyLmdldEluc3RhbmNlKCk7XG4gICAgdGhpcy5fZW1pdHRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5yZWdpc3RlcihcbiAgICAgIHBheWxvYWQgPT4gdGhpcy5fb25EaXNwYXRjaChwYXlsb2FkKVxuICAgICk7XG4gICAgdGhpcy5fbG9nZ2VyID0gZ2V0TG9nZ2VyKCk7XG5cbiAgICB0aGlzLl91c2VQcmVmaXhOYXYgPSBmYWxzZTtcbiAgICB0aGlzLl9pc0xvYWRpbmdNYXAgPSBuZXcgSW1tdXRhYmxlLk1hcCgpO1xuICAgIHRoaXMuX3JlcG9zaXRvcmllcyA9IG5ldyBJbW11dGFibGUuU2V0KCk7XG5cbiAgICB0aGlzLl9jb25mID0gREVGQVVMVF9DT05GO1xuICAgIGdsb2JhbC5GVENvbmYgPSB0aGlzLl9jb25mO1xuICAgIHRoaXMuX3N1cHByZXNzQ2hhbmdlcyA9IGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIFRPRE86IE1vdmUgdG8gYSBbc2VyaWFsaXphdGlvbiBjbGFzc11bMV0gYW5kIHVzZSB0aGUgYnVpbHQtaW4gdmVyc2lvbmluZyBtZWNoYW5pc20uIFRoaXMgbWlnaHRcbiAgICogbmVlZCB0byBiZSBkb25lIG9uZSBsZXZlbCBoaWdoZXIgd2l0aGluIG1haW4uanMuXG4gICAqXG4gICAqIFsxXTogaHR0cHM6Ly9hdG9tLmlvL2RvY3MvbGF0ZXN0L2JlaGluZC1hdG9tLXNlcmlhbGl6YXRpb24taW4tYXRvbVxuICAgKi9cbiAgZXhwb3J0RGF0YSgpOiBFeHBvcnRTdG9yZURhdGEge1xuICAgIGNvbnN0IGNoaWxkS2V5TWFwID0ge307XG4gICAgY29uc3QgZXhwYW5kZWRLZXlzQnlSb290ID0ge307XG4gICAgY29uc3Qgc2VsZWN0ZWRLZXlzQnlSb290ID0ge307XG5cbiAgICB0aGlzLnJvb3RzLmZvckVhY2gocm9vdCA9PiB7XG4gICAgICBjb25zdCBleHBhbmRlZEtleXMgPSBbXTtcbiAgICAgIGNvbnN0IHNlbGVjdGVkS2V5cyA9IFtdO1xuXG4gICAgICAvLyBHcmFiIHRoZSBkYXRhIG9mIG9ubHkgdGhlIGV4cGFuZGVkIHBvcnRpb24gb2YgdGhlIHRyZWUuXG4gICAgICByb290LnRyYXZlcnNlKFxuICAgICAgICBub2RlID0+IHtcbiAgICAgICAgICBpZiAobm9kZS5pc1NlbGVjdGVkKSB7XG4gICAgICAgICAgICBzZWxlY3RlZEtleXMucHVzaChub2RlLnVyaSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKCFub2RlLmlzRXhwYW5kZWQpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBleHBhbmRlZEtleXMucHVzaChub2RlLnVyaSk7XG5cbiAgICAgICAgICBpZiAoIW5vZGUuY2hpbGRyZW4uaXNFbXB0eSgpKSB7XG4gICAgICAgICAgICBjaGlsZEtleU1hcFtub2RlLnVyaV0gPSBub2RlLmNoaWxkcmVuLm1hcChjaGlsZCA9PiBjaGlsZC51cmkpLnRvQXJyYXkoKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgKTtcblxuICAgICAgZXhwYW5kZWRLZXlzQnlSb290W3Jvb3QudXJpXSA9IGV4cGFuZGVkS2V5cztcbiAgICAgIHNlbGVjdGVkS2V5c0J5Um9vdFtyb290LnVyaV0gPSBzZWxlY3RlZEtleXM7XG4gICAgfSk7XG5cbiAgICBjb25zdCByb290S2V5cyA9IHRoaXMucm9vdHMubWFwKHJvb3QgPT4gcm9vdC51cmkpLnRvQXJyYXkoKTtcblxuICAgIHJldHVybiB7XG4gICAgICB2ZXJzaW9uOiBWRVJTSU9OLFxuICAgICAgY2hpbGRLZXlNYXA6IGNoaWxkS2V5TWFwLFxuICAgICAgZXhwYW5kZWRLZXlzQnlSb290LFxuICAgICAgcm9vdEtleXMsXG4gICAgICBzZWxlY3RlZEtleXNCeVJvb3QsXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbXBvcnRzIHN0b3JlIGRhdGEgZnJvbSBhIHByZXZpb3VzIGV4cG9ydC5cbiAgICovXG4gIGxvYWREYXRhKGRhdGE6IEV4cG9ydFN0b3JlRGF0YSk6IHZvaWQge1xuICAgIC8vIEVuc3VyZSB3ZSBhcmUgbm90IHRyeWluZyB0byBsb2FkIGRhdGEgZnJvbSBhbiBlYXJsaWVyIHZlcnNpb24gb2YgdGhpcyBwYWNrYWdlLlxuICAgIGlmIChkYXRhLnZlcnNpb24gIT09IFZFUlNJT04pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBidWlsZE5vZGUgPSAocm9vdFVyaTogc3RyaW5nLCB1cmk6IHN0cmluZykgPT4ge1xuICAgICAgY29uc3Qgcm9vdEV4cGFuZGVkS2V5cyA9IGRhdGEuZXhwYW5kZWRLZXlzQnlSb290W3Jvb3RVcmldIHx8IFtdO1xuICAgICAgY29uc3Qgcm9vdFNlbGVjdGVkS2V5cyA9IGRhdGEuc2VsZWN0ZWRLZXlzQnlSb290W3Jvb3RVcmldIHx8IFtdO1xuICAgICAgY29uc3QgY2hpbGRyZW5VcmlzID0gZGF0YS5jaGlsZEtleU1hcFt1cmldIHx8IFtdO1xuICAgICAgY29uc3QgY2hpbGRyZW4gPSBGaWxlVHJlZU5vZGUuY2hpbGRyZW5Gcm9tQXJyYXkoXG4gICAgICAgIGNoaWxkcmVuVXJpcy5tYXAoY2hpbGRVcmkgPT4gYnVpbGROb2RlKHJvb3RVcmksIGNoaWxkVXJpKSlcbiAgICAgICk7XG5cbiAgICAgIGNvbnN0IGlzRXhwYW5kZWQgPSByb290RXhwYW5kZWRLZXlzLmluZGV4T2YodXJpKSA+PSAwO1xuICAgICAgbGV0IGlzTG9hZGluZyA9IGZhbHNlO1xuXG4gICAgICBpZiAoaXNFeHBhbmRlZCAmJiBGaWxlVHJlZUhlbHBlcnMuaXNEaXJLZXkodXJpKSkge1xuICAgICAgICB0aGlzLl9mZXRjaENoaWxkS2V5cyh1cmkpO1xuICAgICAgICBpc0xvYWRpbmcgPSB0cnVlO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbmV3IEZpbGVUcmVlTm9kZSh7XG4gICAgICAgIHVyaSxcbiAgICAgICAgcm9vdFVyaSxcbiAgICAgICAgaXNFeHBhbmRlZCxcbiAgICAgICAgaXNTZWxlY3RlZDogcm9vdFNlbGVjdGVkS2V5cy5pbmRleE9mKHVyaSkgPj0gMCxcbiAgICAgICAgaXNMb2FkaW5nLFxuICAgICAgICBpc1RyYWNrZWQ6IGZhbHNlLFxuICAgICAgICBjaGlsZHJlbixcbiAgICAgICAgaXNDd2Q6IGZhbHNlLFxuICAgICAgICBjb25uZWN0aW9uVGl0bGU6IEZpbGVUcmVlSGVscGVycy5nZXREaXNwbGF5VGl0bGUocm9vdFVyaSkgfHwgJycsXG4gICAgICB9LFxuICAgICAgdGhpcy5fY29uZik7XG4gICAgfTtcblxuICAgIHRoaXMuX3NldFJvb3RzKG5ldyBJbW11dGFibGUuT3JkZXJlZE1hcChcbiAgICAgIGRhdGEucm9vdEtleXMubWFwKHJvb3RVcmkgPT4gW3Jvb3RVcmksIGJ1aWxkTm9kZShyb290VXJpLCByb290VXJpKV0pXG4gICAgKSk7XG4gIH1cblxuICBfc2V0RXhjbHVkZVZjc0lnbm9yZWRQYXRocyhleGNsdWRlVmNzSWdub3JlZFBhdGhzOiBib29sZWFuKTogdm9pZCB7XG4gICAgdGhpcy5fdXBkYXRlQ29uZihjb25mID0+IGNvbmYuZXhjbHVkZVZjc0lnbm9yZWRQYXRocyA9IGV4Y2x1ZGVWY3NJZ25vcmVkUGF0aHMpO1xuICB9XG5cbiAgX3NldEhpZGVJZ25vcmVkTmFtZXMoaGlkZUlnbm9yZWROYW1lczogYm9vbGVhbik6IHZvaWQge1xuICAgIHRoaXMuX3VwZGF0ZUNvbmYoY29uZiA9PiBjb25mLmhpZGVJZ25vcmVkTmFtZXMgPSBoaWRlSWdub3JlZE5hbWVzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHaXZlbiBhIGxpc3Qgb2YgbmFtZXMgdG8gaWdub3JlLCBjb21waWxlIHRoZW0gaW50byBtaW5pbWF0Y2ggcGF0dGVybnMgYW5kXG4gICAqIHVwZGF0ZSB0aGUgc3RvcmUgd2l0aCB0aGVtLlxuICAgKi9cbiAgX3NldElnbm9yZWROYW1lcyhpZ25vcmVkTmFtZXM6IEFycmF5PHN0cmluZz4pIHtcbiAgICBjb25zdCBpZ25vcmVkUGF0dGVybnMgPSBJbW11dGFibGUuU2V0KGlnbm9yZWROYW1lcylcbiAgICAgIC5tYXAoaWdub3JlZE5hbWUgPT4ge1xuICAgICAgICBpZiAoaWdub3JlZE5hbWUgPT09ICcnKSB7XG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICByZXR1cm4gbmV3IE1pbmltYXRjaChpZ25vcmVkTmFtZSwge21hdGNoQmFzZTogdHJ1ZSwgZG90OiB0cnVlfSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcoXG4gICAgICAgICAgICBgRXJyb3IgcGFyc2luZyBwYXR0ZXJuICcke2lnbm9yZWROYW1lfScgZnJvbSBcIlNldHRpbmdzXCIgPiBcIklnbm9yZWQgTmFtZXNcImAsXG4gICAgICAgICAgICB7ZGV0YWlsOiBlcnJvci5tZXNzYWdlfSxcbiAgICAgICAgICApO1xuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgLmZpbHRlcihwYXR0ZXJuID0+IHBhdHRlcm4gIT0gbnVsbCk7XG4gICAgdGhpcy5fdXBkYXRlQ29uZihjb25mID0+IGNvbmYuaWdub3JlZFBhdHRlcm5zID0gaWdub3JlZFBhdHRlcm5zKTtcbiAgfVxuXG4gIF9vbkRpc3BhdGNoKHBheWxvYWQ6IEFjdGlvblBheWxvYWQpOiB2b2lkIHtcbiAgICBzd2l0Y2ggKHBheWxvYWQuYWN0aW9uVHlwZSkge1xuICAgICAgY2FzZSBBY3Rpb25UeXBlLkRFTEVURV9TRUxFQ1RFRF9OT0RFUzpcbiAgICAgICAgdGhpcy5fZGVsZXRlU2VsZWN0ZWROb2RlcygpLmNhdGNoKGVycm9yID0+IHtcbiAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoJ0RlbGV0aW5nIG5vZGVzIGZhaWxlZCB3aXRoIGFuIGVycm9yOiAnICsgZXJyb3IudG9TdHJpbmcoKSk7XG4gICAgICAgIH0pO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQWN0aW9uVHlwZS5TRVRfQ1dEOlxuICAgICAgICB0aGlzLl9zZXRDd2RLZXkocGF5bG9hZC5yb290S2V5KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEFjdGlvblR5cGUuU0VUX1RSQUNLRURfTk9ERTpcbiAgICAgICAgdGhpcy5fc2V0VHJhY2tlZE5vZGUocGF5bG9hZC5yb290S2V5LCBwYXlsb2FkLm5vZGVLZXkpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQWN0aW9uVHlwZS5TRVRfUk9PVF9LRVlTOlxuICAgICAgICB0aGlzLl9zZXRSb290S2V5cyhwYXlsb2FkLnJvb3RLZXlzKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEFjdGlvblR5cGUuRVhQQU5EX05PREU6XG4gICAgICAgIHRoaXMuX2V4cGFuZE5vZGUocGF5bG9hZC5yb290S2V5LCBwYXlsb2FkLm5vZGVLZXkpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQWN0aW9uVHlwZS5FWFBBTkRfTk9ERV9ERUVQOlxuICAgICAgICB0aGlzLl9leHBhbmROb2RlRGVlcChwYXlsb2FkLnJvb3RLZXksIHBheWxvYWQubm9kZUtleSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBBY3Rpb25UeXBlLkNPTExBUFNFX05PREU6XG4gICAgICAgIHRoaXMuX2NvbGxhcHNlTm9kZShwYXlsb2FkLnJvb3RLZXksIHBheWxvYWQubm9kZUtleSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBBY3Rpb25UeXBlLlNFVF9FWENMVURFX1ZDU19JR05PUkVEX1BBVEhTOlxuICAgICAgICB0aGlzLl9zZXRFeGNsdWRlVmNzSWdub3JlZFBhdGhzKHBheWxvYWQuZXhjbHVkZVZjc0lnbm9yZWRQYXRocyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBBY3Rpb25UeXBlLlNFVF9VU0VfUFJFVklFV19UQUJTOlxuICAgICAgICB0aGlzLl9zZXRVc2VQcmV2aWV3VGFicyhwYXlsb2FkLnVzZVByZXZpZXdUYWJzKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEFjdGlvblR5cGUuU0VUX1VTRV9QUkVGSVhfTkFWOlxuICAgICAgICB0aGlzLl9zZXRVc2VQcmVmaXhOYXYocGF5bG9hZC51c2VQcmVmaXhOYXYpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQWN0aW9uVHlwZS5DT0xMQVBTRV9OT0RFX0RFRVA6XG4gICAgICAgIHRoaXMuX2NvbGxhcHNlTm9kZURlZXAocGF5bG9hZC5yb290S2V5LCBwYXlsb2FkLm5vZGVLZXkpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQWN0aW9uVHlwZS5TRVRfSElERV9JR05PUkVEX05BTUVTOlxuICAgICAgICB0aGlzLl9zZXRIaWRlSWdub3JlZE5hbWVzKHBheWxvYWQuaGlkZUlnbm9yZWROYW1lcyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBBY3Rpb25UeXBlLlNFVF9JR05PUkVEX05BTUVTOlxuICAgICAgICB0aGlzLl9zZXRJZ25vcmVkTmFtZXMocGF5bG9hZC5pZ25vcmVkTmFtZXMpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQWN0aW9uVHlwZS5TRVRfVkNTX1NUQVRVU0VTOlxuICAgICAgICB0aGlzLl9zZXRWY3NTdGF0dXNlcyhwYXlsb2FkLnJvb3RLZXksIHBheWxvYWQudmNzU3RhdHVzZXMpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQWN0aW9uVHlwZS5TRVRfUkVQT1NJVE9SSUVTOlxuICAgICAgICB0aGlzLl9zZXRSZXBvc2l0b3JpZXMocGF5bG9hZC5yZXBvc2l0b3JpZXMpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQWN0aW9uVHlwZS5TRVRfV09SS0lOR19TRVQ6XG4gICAgICAgIHRoaXMuX3NldFdvcmtpbmdTZXQocGF5bG9hZC53b3JraW5nU2V0KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEFjdGlvblR5cGUuU0VUX09QRU5fRklMRVNfV09SS0lOR19TRVQ6XG4gICAgICAgIHRoaXMuX3NldE9wZW5GaWxlc1dvcmtpbmdTZXQocGF5bG9hZC5vcGVuRmlsZXNXb3JraW5nU2V0KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEFjdGlvblR5cGUuU0VUX1dPUktJTkdfU0VUU19TVE9SRTpcbiAgICAgICAgdGhpcy5fc2V0V29ya2luZ1NldHNTdG9yZShwYXlsb2FkLndvcmtpbmdTZXRzU3RvcmUpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQWN0aW9uVHlwZS5TVEFSVF9FRElUSU5HX1dPUktJTkdfU0VUOlxuICAgICAgICB0aGlzLl9zdGFydEVkaXRpbmdXb3JraW5nU2V0KHBheWxvYWQuZWRpdGVkV29ya2luZ1NldCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBBY3Rpb25UeXBlLkZJTklTSF9FRElUSU5HX1dPUktJTkdfU0VUOlxuICAgICAgICB0aGlzLl9maW5pc2hFZGl0aW5nV29ya2luZ1NldCgpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQWN0aW9uVHlwZS5DSEVDS19OT0RFOlxuICAgICAgICB0aGlzLl9jaGVja05vZGUocGF5bG9hZC5yb290S2V5LCBwYXlsb2FkLm5vZGVLZXkpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQWN0aW9uVHlwZS5VTkNIRUNLX05PREU6XG4gICAgICAgIHRoaXMuX3VuY2hlY2tOb2RlKHBheWxvYWQucm9vdEtleSwgcGF5bG9hZC5ub2RlS2V5KTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgQWN0aW9uVHlwZS5TRVRfU0VMRUNURURfTk9ERTpcbiAgICAgICAgdGhpcy5fc2V0U2VsZWN0ZWROb2RlKHBheWxvYWQucm9vdEtleSwgcGF5bG9hZC5ub2RlS2V5KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEFjdGlvblR5cGUuQUREX1NFTEVDVEVEX05PREU6XG4gICAgICAgIHRoaXMuX2FkZFNlbGVjdGVkTm9kZShwYXlsb2FkLnJvb3RLZXksIHBheWxvYWQubm9kZUtleSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBBY3Rpb25UeXBlLlVOU0VMRUNUX05PREU6XG4gICAgICAgIHRoaXMuX3Vuc2VsZWN0Tm9kZShwYXlsb2FkLnJvb3RLZXksIHBheWxvYWQubm9kZUtleSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBBY3Rpb25UeXBlLk1PVkVfU0VMRUNUSU9OX1VQOlxuICAgICAgICB0aGlzLl9tb3ZlU2VsZWN0aW9uVXAoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEFjdGlvblR5cGUuTU9WRV9TRUxFQ1RJT05fRE9XTjpcbiAgICAgICAgdGhpcy5fbW92ZVNlbGVjdGlvbkRvd24oKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEFjdGlvblR5cGUuTU9WRV9TRUxFQ1RJT05fVE9fVE9QOlxuICAgICAgICB0aGlzLl9tb3ZlU2VsZWN0aW9uVG9Ub3AoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEFjdGlvblR5cGUuTU9WRV9TRUxFQ1RJT05fVE9fQk9UVE9NOlxuICAgICAgICB0aGlzLl9tb3ZlU2VsZWN0aW9uVG9Cb3R0b20oKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEFjdGlvblR5cGUuRU5TVVJFX0NISUxEX05PREU6XG4gICAgICAgIHRoaXMuX2Vuc3VyZUNoaWxkTm9kZShwYXlsb2FkLm5vZGVLZXkpO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICAvKipcbiAgKiBVc2UgdGhlIHByZWRpY2F0ZSBmdW5jdGlvbiB0byB1cGRhdGUgb25lIG9yIG1vcmUgb2YgdGhlIHJvb3RzIGluIHRoZSBmaWxlIHRyZWVcbiAgKi9cbiAgX3VwZGF0ZVJvb3RzKHByZWRpY2F0ZTogKHJvb3Q6IEZpbGVUcmVlTm9kZSkgPT4gRmlsZVRyZWVOb2RlKTogdm9pZCB7XG4gICAgdGhpcy5fc2V0Um9vdHModGhpcy5yb290cy5tYXAocHJlZGljYXRlKSk7XG4gIH1cblxuICAvKipcbiAgKiBVc2UgdGhlIHByZWRpY2F0ZSB0byB1cGRhdGUgYSBub2RlIChvciBhIGJyYW5jaCkgb2YgdGhlIGZpbGUtdHJlZVxuICAqL1xuICBfdXBkYXRlTm9kZUF0Um9vdChcbiAgICByb290S2V5OiBOdWNsaWRlVXJpLFxuICAgIG5vZGVLZXk6IE51Y2xpZGVVcmksXG4gICAgcHJlZGljYXRlOiAobm9kZTogRmlsZVRyZWVOb2RlKSA9PiBGaWxlVHJlZU5vZGUsXG4gICk6IHZvaWQge1xuICAgIGNvbnN0IHJvb3QgPSB0aGlzLnJvb3RzLmdldChyb290S2V5KTtcbiAgICBpZiAocm9vdCA9PSBudWxsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qgbm9kZSA9IHJvb3QuZmluZChub2RlS2V5KTtcbiAgICBpZiAobm9kZSA9PSBudWxsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qgcm9vdHMgPSB0aGlzLnJvb3RzLnNldChyb290S2V5LCB0aGlzLl9idWJibGVVcChub2RlLCBwcmVkaWNhdGUobm9kZSkpKTtcbiAgICB0aGlzLl9zZXRSb290cyhyb290cyk7XG4gIH1cblxuICAvKipcbiAgKiBVcGRhdGUgYSBub2RlIG9yIGEgYnJhbmNoIHVuZGVyIGFueSBvZiB0aGUgcm9vdHMgaXQgd2FzIGZvdW5kIGF0XG4gICovXG4gIF91cGRhdGVOb2RlQXRBbGxSb290cyhcbiAgICBub2RlS2V5OiBOdWNsaWRlVXJpLFxuICAgIHByZWRpY2F0ZTogKG5vZGU6IEZpbGVUcmVlTm9kZVxuICApID0+IEZpbGVUcmVlTm9kZSk6IHZvaWQge1xuXG4gICAgY29uc3Qgcm9vdHMgPSB0aGlzLnJvb3RzLm1hcChyb290ID0+IHtcbiAgICAgIGNvbnN0IG5vZGUgPSByb290LmZpbmQobm9kZUtleSk7XG4gICAgICBpZiAobm9kZSA9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiByb290O1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5fYnViYmxlVXAobm9kZSwgcHJlZGljYXRlKG5vZGUpKTtcbiAgICB9KTtcblxuICAgIHRoaXMuX3NldFJvb3RzKHJvb3RzKTtcbiAgfVxuXG4gIC8qKlxuICAqIEJ1YmJsZSB0aGUgY2hhbmdlIHVwLiBUaGUgbmV3Tm9kZSBpcyBhc3N1bWVkIHRvIGJlIHByZXZOb2RlIGFmdGVyIHNvbWUgbWFuaXB1bGF0ZWlvbiBkb25lIHRvIGl0XG4gICogdGhlcmVmb3JlIHRoZXkgYXJlIGFzc3VtZWQgdG8gYmVsb25nIHRvIHRoZSBzYW1lIHBhcmVudC5cbiAgKlxuICAqIFRoZSBtZXRob2QgdXBkYXRlcyB0aGUgY2hpbGQgdG8gdGhlIG5ldyBub2RlICh3aGljaCBjcmVhdGUgYSBuZXcgcGFyZW50IGluc3RhbmNlKSBhbmQgY2FsbFxuICAqIHJlY3Vyc2l2ZWx5IGZvciB0aGUgcGFyZW50IHVwZGF0ZS4gVW50aWwgdGhlcmUgYXJlIG5vIG1vcmUgcGFyZW50cyBhbmQgdGhlIG5ldyByb290IGlzIHJldHVybmVkXG4gICpcbiAgKiBBcyB0aGUgY2hhbmdlIGJ1YmJsZXMgdXAsIGFuZCBpbiBhZGRpdGlvbiB0byB0aGUgY2hhbmdlIGZyb20gdGhlIG5ldyBjaGlsZCBhc3NpZ25tZW50LCBhblxuICAqIG9wdGlvbmFsIHByZWRpY2F0ZSBpcyBhbHNvIGJlaW5nIGFwcGxpZWQgdG8gZWFjaCBuZXdseSBjcmVhdGVkIHBhcmVudCB0byBzdXBwb3J0IG1vcmUgY29tcGxleFxuICAqIGNoYW5nZSBwYXR0ZXJucy5cbiAgKi9cbiAgX2J1YmJsZVVwKFxuICAgIHByZXZOb2RlOiBGaWxlVHJlZU5vZGUsXG4gICAgbmV3Tm9kZTogRmlsZVRyZWVOb2RlLFxuICAgIHBvc3RQcmVkaWNhdGU6IChub2RlOiBGaWxlVHJlZU5vZGUpID0+IEZpbGVUcmVlTm9kZSA9IChub2RlID0+IG5vZGUpLFxuICApOiBGaWxlVHJlZU5vZGUge1xuICAgIGNvbnN0IHBhcmVudCA9IHByZXZOb2RlLnBhcmVudDtcbiAgICBpZiAocGFyZW50ID09IG51bGwpIHtcbiAgICAgIHJldHVybiBuZXdOb2RlO1xuICAgIH1cblxuICAgIGNvbnN0IG5ld1BhcmVudCA9IHBvc3RQcmVkaWNhdGUocGFyZW50LnVwZGF0ZUNoaWxkKG5ld05vZGUpKTtcbiAgICByZXR1cm4gdGhpcy5fYnViYmxlVXAocGFyZW50LCBuZXdQYXJlbnQsIHBvc3RQcmVkaWNhdGUpO1xuICB9XG5cbiAgLyoqXG4gICogVXBkYXRlcyB0aGUgcm9vdHMsIG1haW50YWlucyB0aGVpciBzaWJsaW5nIHJlbGF0aW9uc2hpcHMgYW5kIGZpcmVzIHRoZSBjaGFuZ2UgZXZlbnQuXG4gICovXG4gIF9zZXRSb290cyhyb290czogSW1tdXRhYmxlLk9yZGVyZWRNYXA8TnVjbGlkZVVyaSwgRmlsZVRyZWVOb2RlPik6IHZvaWQge1xuICAgIGNvbnN0IGNoYW5nZWQgPSAhSW1tdXRhYmxlLmlzKHJvb3RzLCB0aGlzLnJvb3RzKTtcbiAgICBpZiAoY2hhbmdlZCkge1xuICAgICAgdGhpcy5yb290cyA9IHJvb3RzO1xuICAgICAgbGV0IHByZXZSb290ID0gbnVsbDtcbiAgICAgIHJvb3RzLmZvckVhY2gociA9PiB7XG4gICAgICAgIHIucHJldlNpYmxpbmcgPSBwcmV2Um9vdDtcbiAgICAgICAgaWYgKHByZXZSb290ICE9IG51bGwpIHtcbiAgICAgICAgICBwcmV2Um9vdC5uZXh0U2libGluZyA9IHI7XG4gICAgICAgIH1cbiAgICAgICAgcHJldlJvb3QgPSByO1xuICAgICAgfSk7XG5cbiAgICAgIGlmIChwcmV2Um9vdCAhPSBudWxsKSB7XG4gICAgICAgIHByZXZSb290Lm5leHRTaWJsaW5nID0gbnVsbDtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fZW1pdENoYW5nZSgpO1xuICAgIH1cbiAgfVxuXG4gIF9lbWl0Q2hhbmdlKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9zdXBwcmVzc0NoYW5nZXMpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fYW5pbWF0aW9uRnJhbWVSZXF1ZXN0SWQgIT0gbnVsbCkge1xuICAgICAgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lKHRoaXMuX2FuaW1hdGlvbkZyYW1lUmVxdWVzdElkKTtcbiAgICB9XG5cbiAgICB0aGlzLl9hbmltYXRpb25GcmFtZVJlcXVlc3RJZCA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgICAgdGhpcy5fZW1pdHRlci5lbWl0KCdjaGFuZ2UnKTtcbiAgICAgIHRoaXMuX3N1cHByZXNzQ2hhbmdlcyA9IHRydWU7XG4gICAgICB0aGlzLl9jaGVja1RyYWNrZWROb2RlKCk7XG4gICAgICB0aGlzLl9zdXBwcmVzc0NoYW5nZXMgPSBmYWxzZTtcbiAgICAgIHRoaXMuX2FuaW1hdGlvbkZyYW1lUmVxdWVzdElkID0gbnVsbDtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAqIFVwZGF0ZSB0aGUgY29uZmlndXJhdGlvbiBmb3IgdGhlIGZpbGUtdHJlZS4gVGhlIGRpcmVjdCB3cml0aW5nIHRvIHRoZSB0aGlzLl9jb25mIHNob3VsZCBiZVxuICAqIGF2b2lkZWQuXG4gICovXG4gIF91cGRhdGVDb25mKHByZWRpY2F0ZTogKGNvbmY6IFN0b3JlQ29uZmlnRGF0YSkgPT4gbWl4ZWQpOiB2b2lkIHtcbiAgICBwcmVkaWNhdGUodGhpcy5fY29uZik7XG4gICAgdGhpcy5fdXBkYXRlUm9vdHMocm9vdCA9PiByb290LnVwZGF0ZUNvbmYoKSk7XG4gIH1cblxuICBfc2V0Um9vdEtleXMocm9vdEtleXM6IEFycmF5PE51Y2xpZGVVcmk+KTogdm9pZCB7XG4gICAgY29uc3Qgcm9vdE5vZGVzID0gcm9vdEtleXMubWFwKHJvb3RVcmkgPT4ge1xuICAgICAgY29uc3Qgcm9vdCA9IHRoaXMucm9vdHMuZ2V0KHJvb3RVcmkpO1xuICAgICAgaWYgKHJvb3QgIT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gcm9vdDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG5ldyBGaWxlVHJlZU5vZGUoe1xuICAgICAgICB1cmk6IHJvb3RVcmksXG4gICAgICAgIHJvb3RVcmksXG4gICAgICAgIGNvbm5lY3Rpb25UaXRsZTogRmlsZVRyZWVIZWxwZXJzLmdldERpc3BsYXlUaXRsZShyb290VXJpKSB8fCAnJyxcbiAgICAgIH0sIHRoaXMuX2NvbmYpO1xuICAgIH0pO1xuICAgIHRoaXMuX3NldFJvb3RzKG5ldyBJbW11dGFibGUuT3JkZXJlZE1hcChyb290Tm9kZXMubWFwKHJvb3QgPT4gW3Jvb3QudXJpLCByb290XSkpKTtcbiAgICB0aGlzLl9zZXRDd2RLZXkodGhpcy5fY3dkS2V5KTtcbiAgfVxuXG4gIGdldFRyYWNrZWROb2RlKCk6ID9GaWxlVHJlZU5vZGUge1xuICAgIC8vIExvY2F0ZSB0aGUgcm9vdCBjb250YWluaW5nIHRoZSB0cmFja2VkIG5vZGUgZWZmaWNpZW50bHkgYnkgdXNpbmcgdGhlIGNoaWxkLWRlcml2ZWRcbiAgICAvLyBjb250YWluc1RyYWNrZWROb2RlIHByb3BlcnR5XG4gICAgY29uc3QgdHJhY2tlZFJvb3QgPSB0aGlzLnJvb3RzLmZpbmQocm9vdCA9PiByb290LmNvbnRhaW5zVHJhY2tlZE5vZGUpO1xuICAgIGlmICh0cmFja2VkUm9vdCA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBsZXQgdHJhY2tlZE5vZGU7XG4gICAgLy8gTGlrZXdpc2UsIHdpdGhpbiB0aGUgcm9vdCB1c2UgdGhlIHByb3BlcnR5IHRvIGVmZmljaWVudGx5IGZpbmQgdGhlIG5lZWRlZCBub2RlXG4gICAgdHJhY2tlZFJvb3QudHJhdmVyc2UoXG4gICAgICBub2RlID0+IHtcbiAgICAgICAgaWYgKG5vZGUuaXNUcmFja2VkKSB7XG4gICAgICAgICAgdHJhY2tlZE5vZGUgPSBub2RlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRyYWNrZWROb2RlID09IG51bGwgJiYgbm9kZS5jb250YWluc1RyYWNrZWROb2RlO1xuICAgICAgfVxuICAgICk7XG5cbiAgICByZXR1cm4gdHJhY2tlZE5vZGU7XG4gIH1cblxuICBnZXRSZXBvc2l0b3JpZXMoKTogSW1tdXRhYmxlLlNldDxhdG9tJFJlcG9zaXRvcnk+IHtcbiAgICByZXR1cm4gdGhpcy5fcmVwb3NpdG9yaWVzO1xuICB9XG5cbiAgZ2V0V29ya2luZ1NldCgpOiBXb3JraW5nU2V0IHtcbiAgICByZXR1cm4gdGhpcy5fY29uZi53b3JraW5nU2V0O1xuICB9XG5cbiAgZ2V0V29ya2luZ1NldHNTdG9yZSgpOiA/V29ya2luZ1NldHNTdG9yZSB7XG4gICAgcmV0dXJuIHRoaXMuX3dvcmtpbmdTZXRzU3RvcmU7XG4gIH1cblxuICBnZXRSb290S2V5cygpOiBBcnJheTxOdWNsaWRlVXJpPiB7XG4gICAgcmV0dXJuIHRoaXMucm9vdHMudG9BcnJheSgpLm1hcChyb290ID0+IHJvb3QudXJpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRydWUgaWYgdGhlIHN0b3JlIGhhcyBubyBkYXRhLCBpLmUuIG5vIHJvb3RzLCBubyBjaGlsZHJlbi5cbiAgICovXG4gIGlzRW1wdHkoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMucm9vdHMuaXNFbXB0eSgpO1xuICB9XG5cbiAgX3NldFZjc1N0YXR1c2VzKFxuICAgIHJvb3RLZXk6IE51Y2xpZGVVcmksXG4gICAgdmNzU3RhdHVzZXM6IHtbcGF0aDogTnVjbGlkZVVyaV06IFN0YXR1c0NvZGVOdW1iZXJWYWx1ZX0sXG4gICk6IHZvaWQge1xuICAgIC8vIFdlIGNhbid0IGJ1aWxkIG9uIHRoZSBjaGlsZC1kZXJpdmVkIHByb3BlcnRpZXMgdG8gbWFpbnRhaW4gdmNzIHN0YXR1c2VzIGluIHRoZSBlbnRpcmVcbiAgICAvLyB0cmVlLCBzaW5jZSB0aGUgcmVwb3J0ZWQgVkNTIHN0YXR1cyBtYXkgYmUgZm9yIGEgbm9kZSB0aGF0IGlzIG5vdCB5ZXQgcHJlc2VudCBpbiB0aGVcbiAgICAvLyBmZXRjaGVkIHRyZWUsIGFuZCBzbyBpdCBpdCBjYW4ndCBhZmZlY3QgaXRzIHBhcmVudHMgc3RhdHVzZXMuIFRvIGhhdmUgdGhlIHJvb3RzIGNvbG9yZWRcbiAgICAvLyBjb25zaXN0ZW50bHkgd2UgbWFudWFsbHkgYWRkIGFsbCBwYXJlbnRzIG9mIGFsbCBvZiB0aGUgbW9kaWZpZWQgbm9kZXMgdXAgdGlsbCB0aGUgcm9vdFxuICAgIGNvbnN0IGVucmljaGVkVmNzU3RhdHVzZXMgPSB7Li4udmNzU3RhdHVzZXN9O1xuXG4gICAgY29uc3QgZW5zdXJlUHJlc2VudFBhcmVudHMgPSB1cmkgPT4ge1xuICAgICAgaWYgKHVyaSA9PT0gcm9vdEtleSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGxldCBjdXJyZW50ID0gdXJpO1xuICAgICAgd2hpbGUgKGN1cnJlbnQgIT09IHJvb3RLZXkpIHtcbiAgICAgICAgY3VycmVudCA9IEZpbGVUcmVlSGVscGVycy5nZXRQYXJlbnRLZXkoY3VycmVudCk7XG5cbiAgICAgICAgaWYgKGVucmljaGVkVmNzU3RhdHVzZXNbY3VycmVudF0gIT0gbnVsbCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGVucmljaGVkVmNzU3RhdHVzZXNbY3VycmVudF0gPSBTdGF0dXNDb2RlTnVtYmVyLk1PRElGSUVEO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBPYmplY3Qua2V5cyh2Y3NTdGF0dXNlcykuZm9yRWFjaCh1cmkgPT4ge1xuICAgICAgY29uc3Qgc3RhdHVzID0gdmNzU3RhdHVzZXNbdXJpXTtcbiAgICAgIGlmIChcbiAgICAgICAgc3RhdHVzID09PSBTdGF0dXNDb2RlTnVtYmVyLk1PRElGSUVEIHx8XG4gICAgICAgIHN0YXR1cyA9PT0gU3RhdHVzQ29kZU51bWJlci5BRERFRCB8fFxuICAgICAgICBzdGF0dXMgPT09IFN0YXR1c0NvZGVOdW1iZXIuUkVNT1ZFRCkge1xuICAgICAgICBlbnN1cmVQcmVzZW50UGFyZW50cyh1cmkpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgaWYgKHRoaXMuX3Zjc1N0YXR1c2VzQXJlRGlmZmVyZW50KHJvb3RLZXksIGVucmljaGVkVmNzU3RhdHVzZXMpKSB7XG4gICAgICB0aGlzLl91cGRhdGVDb25mKGNvbmYgPT4gY29uZi52Y3NTdGF0dXNlc1tyb290S2V5XSA9IGVucmljaGVkVmNzU3RhdHVzZXMpO1xuICAgIH1cbiAgfVxuXG4gIF92Y3NTdGF0dXNlc0FyZURpZmZlcmVudChcbiAgICByb290S2V5OiBOdWNsaWRlVXJpLFxuICAgIG5ld1Zjc1N0YXR1c2VzOiB7W3BhdGg6IE51Y2xpZGVVcmldOiBTdGF0dXNDb2RlTnVtYmVyVmFsdWV9XG4gICk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IGN1cnJlbnRTdGF0dXNlcyA9IHRoaXMuX2NvbmYudmNzU3RhdHVzZXNbcm9vdEtleV07XG4gICAgaWYgKGN1cnJlbnRTdGF0dXNlcyA9PSBudWxsIHx8IG5ld1Zjc1N0YXR1c2VzID09IG51bGwpIHtcbiAgICAgIGlmIChjdXJyZW50U3RhdHVzZXMgIT09IG5ld1Zjc1N0YXR1c2VzKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IGN1cnJlbnRLZXlzID0gT2JqZWN0LmtleXMoY3VycmVudFN0YXR1c2VzKTtcbiAgICBjb25zdCBuZXdLZXlzID0gT2JqZWN0LmtleXMobmV3VmNzU3RhdHVzZXMpO1xuICAgIGlmIChjdXJyZW50S2V5cy5sZW5ndGggIT09IG5ld0tleXMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3S2V5cy5zb21lKGtleSA9PiBjdXJyZW50U3RhdHVzZXNba2V5XSAhPT0gbmV3VmNzU3RhdHVzZXNba2V5XSk7XG4gIH1cblxuICBfc2V0VXNlUHJldmlld1RhYnModXNlUHJldmlld1RhYnM6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB0aGlzLl91cGRhdGVDb25mKGNvbmYgPT4gY29uZi51c2VQcmV2aWV3VGFicyA9IHVzZVByZXZpZXdUYWJzKTtcbiAgfVxuXG4gIF9zZXRVc2VQcmVmaXhOYXYodXNlUHJlZml4TmF2OiBib29sZWFuKSB7XG4gICAgdGhpcy5fdXNlUHJlZml4TmF2ID0gdXNlUHJlZml4TmF2O1xuICB9XG5cbiAgdXNlUHJlZml4TmF2KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl91c2VQcmVmaXhOYXY7XG4gIH1cblxuICAvKipcbiAgICogVGhlIG5vZGUgY2hpbGQga2V5cyBtYXkgZWl0aGVyIGJlIGF2YWlsYWJsZSBpbW1lZGlhdGVseSAoY2FjaGVkKSwgb3JcbiAgICogcmVxdWlyZSBhbiBhc3luYyBmZXRjaC4gSWYgYWxsIG9mIHRoZSBjaGlsZHJlbiBhcmUgbmVlZGVkIGl0J3MgZWFzaWVyIHRvXG4gICAqIHJldHVybiBhcyBwcm9taXNlLCB0byBtYWtlIHRoZSBjYWxsZXIgb2JsaXZpb3VzIHRvIHRoZSB3YXkgY2hpbGRyZW4gd2VyZVxuICAgKiBmZXRjaGVkLlxuICAgKi9cbiAgYXN5bmMgcHJvbWlzZU5vZGVDaGlsZEtleXMocm9vdEtleTogc3RyaW5nLCBub2RlS2V5OiBzdHJpbmcpOiBQcm9taXNlPEFycmF5PE51Y2xpZGVVcmk+PiB7XG4gICAgY29uc3Qgc2hvd25DaGlsZHJlblVyaXMgPSBub2RlID0+IHtcbiAgICAgIHJldHVybiBub2RlLmNoaWxkcmVuLnRvQXJyYXkoKS5maWx0ZXIobiA9PiBuLnNob3VsZEJlU2hvd24pLm1hcChuID0+IG4udXJpKTtcbiAgICB9O1xuXG4gICAgY29uc3Qgbm9kZSA9IHRoaXMuZ2V0Tm9kZShyb290S2V5LCBub2RlS2V5KTtcbiAgICBpZiAobm9kZSA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgaWYgKCFub2RlLmlzTG9hZGluZykge1xuICAgICAgcmV0dXJuIHNob3duQ2hpbGRyZW5VcmlzKG5vZGUpO1xuICAgIH1cblxuICAgIGF3YWl0IHRoaXMuX2ZldGNoQ2hpbGRLZXlzKG5vZGVLZXkpO1xuICAgIHJldHVybiB0aGlzLnByb21pc2VOb2RlQ2hpbGRLZXlzKHJvb3RLZXksIG5vZGVLZXkpO1xuICB9XG5cbiAgLyoqXG4gICogVXNlcyB0aGUgLmNvbnRhaW5zU2VsZWN0aW9uIGNoaWxkLWRlcml2ZWQgcHJvcGVydHkgdG8gZWZmaWNpZW50bHkgYnVpbGQgdGhlIGxpc3Qgb2YgdGhlXG4gICogY3VycmVudGx5IHNlbGVjdGVkIG5vZGVzXG4gICovXG4gIGdldFNlbGVjdGVkTm9kZXMoKTogSW1tdXRhYmxlLkxpc3Q8RmlsZVRyZWVOb2RlPiB7XG4gICAgY29uc3Qgc2VsZWN0ZWROb2RlcyA9IFtdO1xuICAgIHRoaXMucm9vdHMuZm9yRWFjaChyb290ID0+IHtcbiAgICAgIHJvb3QudHJhdmVyc2UoXG4gICAgICAgIG5vZGUgPT4ge1xuICAgICAgICAgIGlmIChub2RlLmlzU2VsZWN0ZWQpIHtcbiAgICAgICAgICAgIHNlbGVjdGVkTm9kZXMucHVzaChub2RlKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIG5vZGUuY29udGFpbnNTZWxlY3Rpb247XG4gICAgICAgIH0sXG4gICAgICApO1xuICAgIH0pO1xuICAgIHJldHVybiBuZXcgSW1tdXRhYmxlLkxpc3Qoc2VsZWN0ZWROb2Rlcyk7XG4gIH1cblxuICAvKipcbiAgKiBSZXR1cm5zIGEgbm9kZSBpZiBpdCBpcyB0aGUgb25seSBvbmUgc2VsZWN0ZWQsIG9yIG51bGwgb3RoZXJ3aXNlXG4gICovXG4gIGdldFNpbmdsZVNlbGVjdGVkTm9kZSgpOiA/RmlsZVRyZWVOb2RlIHtcbiAgICBjb25zdCBzZWxlY3RlZE5vZGVzID0gdGhpcy5nZXRTZWxlY3RlZE5vZGVzKCk7XG5cbiAgICBpZiAoc2VsZWN0ZWROb2Rlcy5pc0VtcHR5KCkgfHwgc2VsZWN0ZWROb2Rlcy5zaXplID4gMSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcmV0dXJuIHNlbGVjdGVkTm9kZXMuZmlyc3QoKTtcbiAgfVxuXG4gIGdldE5vZGUocm9vdEtleTogTnVjbGlkZVVyaSwgbm9kZUtleTogTnVjbGlkZVVyaSk6ID9GaWxlVHJlZU5vZGUge1xuICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5yb290cy5nZXQocm9vdEtleSk7XG5cbiAgICBpZiAocm9vdE5vZGUgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJvb3ROb2RlLmZpbmQobm9kZUtleSk7XG4gIH1cblxuICBpc0VkaXRpbmdXb3JraW5nU2V0KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9jb25mLmlzRWRpdGluZ1dvcmtpbmdTZXQ7XG4gIH1cblxuICAvKipcbiAgKiBCdWlsZHMgdGhlIGVkaXRlZCB3b3JraW5nIHNldCBmcm9tIHRoZSBwYXJ0aWFsbHktY2hpbGQtZGVyaXZlZCAuY2hlY2tlZFN0YXR1cyBwcm9wZXJ0eVxuICAqL1xuICBnZXRFZGl0ZWRXb3JraW5nU2V0KCk6IFdvcmtpbmdTZXQge1xuICAgIGNvbnN0IHVyaXMgPSBbXTtcblxuICAgIHRoaXMucm9vdHMuZm9yRWFjaChyb290ID0+IHJvb3QudHJhdmVyc2UoXG4gICAgICBub2RlID0+IHtcbiAgICAgICAgaWYgKG5vZGUuY2hlY2tlZFN0YXR1cyA9PT0gJ3BhcnRpYWwnKSB7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0gZWxzZSBpZiAobm9kZS5jaGVja2VkU3RhdHVzID09PSAnY2hlY2tlZCcpIHtcbiAgICAgICAgICB1cmlzLnB1c2gobm9kZS51cmkpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICkpO1xuXG4gICAgcmV0dXJuIG5ldyBXb3JraW5nU2V0KHVyaXMpO1xuICB9XG5cbiAgaXNFZGl0ZWRXb3JraW5nU2V0RW1wdHkoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMucm9vdHMuZXZlcnkocm9vdCA9PiByb290LmNoZWNrZWRTdGF0dXMgPT09ICdjbGVhcicpO1xuICB9XG5cbiAgLyoqXG4gICAqIEluaXRpYXRlcyB0aGUgZmV0Y2hpbmcgb2Ygbm9kZSdzIGNoaWxkcmVuIGlmIGl0J3Mgbm90IGFscmVhZHkgaW4gdGhlIHByb2Nlc3MuXG4gICAqIENsZWFycyB0aGUgbm9kZSdzIC5pc0xvYWRpbmcgcHJvcGVydHkgb25jZSB0aGUgZmV0Y2ggaXMgY29tcGxldGUuXG4gICAqIE9uY2UgdGhlIGZldGNoIGlzIGNvbXBsZXRlZCwgY2xlYXJzIHRoZSBub2RlJ3MgLmlzTG9hZGluZyBwcm9wZXJ0eSwgYnVpbGRzIHRoZSBtYXAgb2YgdGhlXG4gICAqIG5vZGUncyBjaGlsZHJlbiBvdXQgb2YgdGhlIGZldGNoZWQgY2hpbGRyZW4gVVJJcyBhbmQgYSBjaGFuZ2Ugc3Vic2NyaXB0aW9uIGlzIGNyZWF0ZWRcbiAgICogZm9yIHRoZSBub2RlIHRvIG1vbml0b3IgZnV0dXJlIGNoYW5nZXMuXG4gICAqL1xuICBfZmV0Y2hDaGlsZEtleXMobm9kZUtleTogTnVjbGlkZVVyaSk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IGV4aXN0aW5nUHJvbWlzZSA9IHRoaXMuX2dldExvYWRpbmcobm9kZUtleSk7XG4gICAgaWYgKGV4aXN0aW5nUHJvbWlzZSAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gZXhpc3RpbmdQcm9taXNlO1xuICAgIH1cblxuICAgIGNvbnN0IHByb21pc2UgPSBGaWxlVHJlZUhlbHBlcnMuZmV0Y2hDaGlsZHJlbihub2RlS2V5KVxuICAgICAgLmNhdGNoKGVycm9yID0+IHtcbiAgICAgICAgdGhpcy5fbG9nZ2VyLmVycm9yKGBVbmFibGUgdG8gZmV0Y2ggY2hpbGRyZW4gZm9yIFwiJHtub2RlS2V5fVwiLmApO1xuICAgICAgICB0aGlzLl9sb2dnZXIuZXJyb3IoJ09yaWdpbmFsIGVycm9yOiAnLCBlcnJvcik7XG5cbiAgICAgICAgLy8gQ29sbGFwc2UgdGhlIG5vZGUgYW5kIGNsZWFyIGl0cyBsb2FkaW5nIHN0YXRlIG9uIGVycm9yIHNvIHRoZVxuICAgICAgICAvLyB1c2VyIGNhbiByZXRyeSBleHBhbmRpbmcgaXQuXG4gICAgICAgIHRoaXMuX3VwZGF0ZU5vZGVBdEFsbFJvb3RzKG5vZGVLZXksIG5vZGUgPT5cbiAgICAgICAgICBub2RlLnNldCh7aXNFeHBhbmRlZDogZmFsc2UsIGlzTG9hZGluZzogZmFsc2UsIGNoaWxkcmVuOiBuZXcgSW1tdXRhYmxlLk9yZGVyZWRNYXAoKX0pXG4gICAgICAgICk7XG5cbiAgICAgICAgdGhpcy5fY2xlYXJMb2FkaW5nKG5vZGVLZXkpO1xuICAgICAgfSlcbiAgICAgIC50aGVuKGNoaWxkS2V5cyA9PiB7XG4gICAgICAgIGNvbnN0IGNoaWxkcmVuS2V5cyA9IGNoaWxkS2V5cyB8fCBbXTtcbiAgICAgICAgY29uc3QgZGlyZWN0b3J5ID0gRmlsZVRyZWVIZWxwZXJzLmdldERpcmVjdG9yeUJ5S2V5KG5vZGVLZXkpO1xuXG4gICAgICAgIC8vIFRoZSBub2RlIHdpdGggVVJJID09PSBub2RlS2V5IG1pZ2h0IGJlIHByZXNlbnQgYXQgc2V2ZXJhbCByb290cyAtIHVwZGF0ZSB0aGVtIGFsbFxuICAgICAgICB0aGlzLl91cGRhdGVOb2RlQXRBbGxSb290cyhub2RlS2V5LCBub2RlID0+IHtcbiAgICAgICAgICAvLyBNYWludGFpbiB0aGUgb3JkZXIgZmV0Y2hlZCBmcm9tIHRoZSBGU1xuICAgICAgICAgIGNvbnN0IGNoaWxkcmVuTm9kZXMgPSBjaGlsZHJlbktleXMubWFwKHVyaSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwcmV2Tm9kZSA9IG5vZGUuZmluZCh1cmkpO1xuICAgICAgICAgICAgLy8gSWYgd2UgYWxyZWFkeSBoYWQgYSBjaGlsZCB3aXRoIHRoaXMgVVJJIC0ga2VlcCBpdFxuICAgICAgICAgICAgaWYgKHByZXZOb2RlICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHByZXZOb2RlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gbm9kZS5jcmVhdGVDaGlsZCh7XG4gICAgICAgICAgICAgIHVyaSxcbiAgICAgICAgICAgICAgaXNFeHBhbmRlZDogZmFsc2UsXG4gICAgICAgICAgICAgIGlzU2VsZWN0ZWQ6IGZhbHNlLFxuICAgICAgICAgICAgICBpc0xvYWRpbmc6IGZhbHNlLFxuICAgICAgICAgICAgICBpc0N3ZDogZmFsc2UsXG4gICAgICAgICAgICAgIGlzVHJhY2tlZDogZmFsc2UsXG4gICAgICAgICAgICAgIGNoaWxkcmVuOiBuZXcgSW1tdXRhYmxlLk9yZGVyZWRNYXAoKSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgY29uc3QgY2hpbGRyZW4gPSBGaWxlVHJlZU5vZGUuY2hpbGRyZW5Gcm9tQXJyYXkoY2hpbGRyZW5Ob2Rlcyk7XG4gICAgICAgICAgLy8gSW4gY2FzZSBwcmV2aW91cyBzdWJzY3JpcHRpb24gZXhpc3RlZCAtIGRpc3Bvc2Ugb2YgaXRcbiAgICAgICAgICBpZiAobm9kZS5zdWJzY3JpcHRpb24gIT0gbnVsbCkge1xuICAgICAgICAgICAgbm9kZS5zdWJzY3JpcHRpb24uZGlzcG9zZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBhbmQgY3JlYXRlIGEgbmV3IHN1YnNjcmlwdGlvblxuICAgICAgICAgIGNvbnN0IHN1YnNjcmlwdGlvbiA9IHRoaXMuX21ha2VTdWJzY3JpcHRpb24obm9kZUtleSwgZGlyZWN0b3J5KTtcblxuICAgICAgICAgIC8vIElmIHRoZSBmZXRjaCBpbmRpY2F0ZWQgdGhhdCBzb21lIGNoaWxkcmVuIHdlcmUgcmVtb3ZlZCAtIGRpc3Bvc2Ugb2YgYWxsXG4gICAgICAgICAgLy8gdGhlaXIgc3Vic2NyaXB0aW9uc1xuICAgICAgICAgIGNvbnN0IHJlbW92ZWRDaGlsZHJlbiA9IG5vZGUuY2hpbGRyZW4uZmlsdGVyKG4gPT4gIWNoaWxkcmVuLmhhcyhuLm5hbWUpKTtcbiAgICAgICAgICByZW1vdmVkQ2hpbGRyZW4uZm9yRWFjaChjID0+IHtcbiAgICAgICAgICAgIGMudHJhdmVyc2UobiA9PiB7XG4gICAgICAgICAgICAgIGlmIChuLnN1YnNjcmlwdGlvbiAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgbi5zdWJzY3JpcHRpb24uZGlzcG9zZSgpO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIHJldHVybiBub2RlLnNldCh7aXNMb2FkaW5nOiBmYWxzZSwgY2hpbGRyZW4sIHN1YnNjcmlwdGlvbn0pO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLl9jbGVhckxvYWRpbmcobm9kZUtleSk7XG4gICAgICB9KTtcblxuICAgIHRoaXMuX3NldExvYWRpbmcobm9kZUtleSwgcHJvbWlzZSk7XG4gICAgcmV0dXJuIHByb21pc2U7XG4gIH1cblxuICBfbWFrZVN1YnNjcmlwdGlvbihub2RlS2V5OiBOdWNsaWRlVXJpLCBkaXJlY3Rvcnk6ID9EaXJlY3RvcnkpOiA/SURpc3Bvc2FibGUge1xuICAgIGlmIChkaXJlY3RvcnkgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgIC8vIFRoaXMgY2FsbCBtaWdodCBmYWlsIGlmIHdlIHRyeSB0byB3YXRjaCBhIG5vbi1leGlzdGluZyBkaXJlY3RvcnksIG9yIGlmIHBlcm1pc3Npb24gZGVuaWVkLlxuICAgICAgcmV0dXJuIGRpcmVjdG9yeS5vbkRpZENoYW5nZSgoKSA9PiB7XG4gICAgICAgIHRoaXMuX2ZldGNoQ2hpbGRLZXlzKG5vZGVLZXkpO1xuICAgICAgfSk7XG4gICAgfSBjYXRjaCAoZXgpIHtcbiAgICAgIC8qXG4gICAgICAgKiBMb2cgZXJyb3IgYW5kIG1hcmsgdGhlIGRpcmVjdG9yeSBhcyBkaXJ0eSBzbyB0aGUgZmFpbGVkIHN1YnNjcmlwdGlvbiB3aWxsIGJlIGF0dGVtcHRlZFxuICAgICAgICogYWdhaW4gbmV4dCB0aW1lIHRoZSBkaXJlY3RvcnkgaXMgZXhwYW5kZWQuXG4gICAgICAgKi9cbiAgICAgIHRoaXMuX2xvZ2dlci5lcnJvcihgQ2Fubm90IHN1YnNjcmliZSB0byBkaXJlY3RvcnkgXCIke25vZGVLZXl9XCJgLCBleCk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cblxuICBfZ2V0TG9hZGluZyhub2RlS2V5OiBOdWNsaWRlVXJpKTogP1Byb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiB0aGlzLl9pc0xvYWRpbmdNYXAuZ2V0KG5vZGVLZXkpO1xuICB9XG5cbiAgX3NldExvYWRpbmcobm9kZUtleTogTnVjbGlkZVVyaSwgdmFsdWU6IFByb21pc2U8dm9pZD4pOiB2b2lkIHtcbiAgICB0aGlzLl9pc0xvYWRpbmdNYXAgPSB0aGlzLl9pc0xvYWRpbmdNYXAuc2V0KG5vZGVLZXksIHZhbHVlKTtcbiAgfVxuXG4gIGhhc0N3ZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fY3dkS2V5ICE9IG51bGw7XG4gIH1cblxuICBfc2V0Q3dkS2V5KGN3ZEtleTogP051Y2xpZGVVcmkpOiB2b2lkIHtcbiAgICB0aGlzLl9jd2RLZXkgPSBjd2RLZXk7XG4gICAgdGhpcy5fdXBkYXRlUm9vdHMocm9vdCA9PiByb290LnNldElzQ3dkKHJvb3QudXJpID09PSBjd2RLZXkpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXNldHMgdGhlIG5vZGUgdG8gYmUga2VwdCBpbiB2aWV3IGlmIG5vIG1vcmUgZGF0YSBpcyBiZWluZyBhd2FpdGVkLiBTYWZlIHRvIGNhbGwgbWFueSB0aW1lc1xuICAgKiBiZWNhdXNlIGl0IG9ubHkgY2hhbmdlcyBzdGF0ZSBpZiBhIG5vZGUgaXMgYmVpbmcgdHJhY2tlZC5cbiAgICovXG4gIF9jaGVja1RyYWNrZWROb2RlKCk6IHZvaWQge1xuICAgIGlmIChcbiAgICAgIC8qXG4gICAgICAgKiBUaGUgbG9hZGluZyBtYXAgYmVpbmcgZW1wdHkgaXMgYSBoZXVyaXN0aWMgZm9yIHdoZW4gbG9hZGluZyBoYXMgY29tcGxldGVkLiBJdCBpcyBpbmV4YWN0XG4gICAgICAgKiBiZWNhdXNlIHRoZSBsb2FkaW5nIG1pZ2h0IGJlIHVucmVsYXRlZCB0byB0aGUgdHJhY2tlZCBub2RlLCBob3dldmVyIGl0IGlzIGNoZWFwIGFuZCBmYWxzZVxuICAgICAgICogcG9zaXRpdmVzIHdpbGwgb25seSBsYXN0IHVudGlsIGxvYWRpbmcgaXMgY29tcGxldGUgb3IgdW50aWwgdGhlIHVzZXIgY2xpY2tzIGFub3RoZXIgbm9kZSBpblxuICAgICAgICogdGhlIHRyZWUuXG4gICAgICAgKi9cbiAgICAgIHRoaXMuX2lzTG9hZGluZ01hcC5pc0VtcHR5KClcbiAgICApIHtcbiAgICAgIC8vIExvYWRpbmcgaGFzIGNvbXBsZXRlZC4gQWxsb3cgc2Nyb2xsaW5nIHRvIHByb2NlZWQgYXMgdXN1YWwuXG4gICAgICB0aGlzLl9jbGVhclRyYWNrZWROb2RlKCk7XG4gICAgfVxuICB9XG5cbiAgX2NsZWFyTG9hZGluZyhub2RlS2V5OiBOdWNsaWRlVXJpKTogdm9pZCB7XG4gICAgdGhpcy5faXNMb2FkaW5nTWFwID0gdGhpcy5faXNMb2FkaW5nTWFwLmRlbGV0ZShub2RlS2V5KTtcbiAgfVxuXG4gIGFzeW5jIF9kZWxldGVTZWxlY3RlZE5vZGVzKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHNlbGVjdGVkTm9kZXMgPSB0aGlzLmdldFNlbGVjdGVkTm9kZXMoKTtcbiAgICBhd2FpdCBQcm9taXNlLmFsbChzZWxlY3RlZE5vZGVzLm1hcChhc3luYyBub2RlID0+IHtcbiAgICAgIGNvbnN0IGVudHJ5ID0gRmlsZVRyZWVIZWxwZXJzLmdldEVudHJ5QnlLZXkobm9kZS51cmkpO1xuXG4gICAgICBpZiAoZW50cnkgPT0gbnVsbCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjb25zdCBwYXRoID0gZW50cnkuZ2V0UGF0aCgpO1xuICAgICAgY29uc3QgcmVwb3NpdG9yeSA9IG5vZGUucmVwbztcbiAgICAgIGlmIChyZXBvc2l0b3J5ICE9IG51bGwgJiYgcmVwb3NpdG9yeS5nZXRUeXBlKCkgPT09ICdoZycpIHtcbiAgICAgICAgY29uc3QgaGdSZXBvc2l0b3J5ID0gKChyZXBvc2l0b3J5OiBhbnkpOiBIZ1JlcG9zaXRvcnlDbGllbnQpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGF3YWl0IGhnUmVwb3NpdG9yeS5yZW1vdmUocGF0aCk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICBjb25zdCBzdGF0dXNlcyA9IGF3YWl0IGhnUmVwb3NpdG9yeS5nZXRTdGF0dXNlcyhbcGF0aF0pO1xuICAgICAgICAgIGNvbnN0IHBhdGhTdGF0dXMgPSBzdGF0dXNlcy5nZXQocGF0aCk7XG4gICAgICAgICAgY29uc3QgZ29vZFN0YXR1c2VzID0gW1xuICAgICAgICAgICAgU3RhdHVzQ29kZU51bWJlci5BRERFRCxcbiAgICAgICAgICAgIFN0YXR1c0NvZGVOdW1iZXIuQ0xFQU4sXG4gICAgICAgICAgICBTdGF0dXNDb2RlTnVtYmVyLk1PRElGSUVELFxuICAgICAgICAgIF07XG4gICAgICAgICAgaWYgKGdvb2RTdGF0dXNlcy5pbmRleE9mKHBhdGhTdGF0dXMpICE9PSAtMSkge1xuICAgICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKFxuICAgICAgICAgICAgICAnRmFpbGVkIHRvIHJlbW92ZSAnICsgcGF0aCArICcgZnJvbSB2ZXJzaW9uIGNvbnRyb2wuICBUaGUgZmlsZSB3aWxsICcgK1xuICAgICAgICAgICAgICAnc3RpbGwgZ2V0IGRlbGV0ZWQgYnV0IHlvdSB3aWxsIGhhdmUgdG8gcmVtb3ZlIGl0IGZyb20geW91ciBWQ1MgeW91cnNlbGYuICBFcnJvcjogJyArXG4gICAgICAgICAgICAgIGUudG9TdHJpbmcoKSxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoRmlsZVRyZWVIZWxwZXJzLmlzTG9jYWxFbnRyeShlbnRyeSkpIHtcbiAgICAgICAgLy8gVE9ETzogVGhpcyBzcGVjaWFsLWNhc2UgY2FuIGJlIGVsaW1pbmF0ZWQgb25jZSBgZGVsZXRlKClgIGlzIGFkZGVkIHRvIGBEaXJlY3RvcnlgXG4gICAgICAgIC8vIGFuZCBgRmlsZWAuXG4gICAgICAgIHNoZWxsLm1vdmVJdGVtVG9UcmFzaChGaWxlVHJlZUhlbHBlcnMua2V5VG9QYXRoKG5vZGUudXJpKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCByZW1vdGVGaWxlID0gKChlbnRyeTogYW55KTogKFJlbW90ZUZpbGUgfCBSZW1vdGVEaXJlY3RvcnkpKTtcbiAgICAgICAgYXdhaXQgcmVtb3RlRmlsZS5kZWxldGUoKTtcbiAgICAgIH1cbiAgICB9KSk7XG4gIH1cblxuICBfZXhwYW5kTm9kZShyb290S2V5OiBOdWNsaWRlVXJpLCBub2RlS2V5OiBOdWNsaWRlVXJpKTogdm9pZCB7XG4gICAgdGhpcy5fdXBkYXRlTm9kZUF0Um9vdChyb290S2V5LCBub2RlS2V5LCBub2RlID0+IHtcbiAgICAgIHJldHVybiBub2RlLnNldElzRXhwYW5kZWQodHJ1ZSkuc2V0UmVjdXJzaXZlKFxuICAgICAgICBuID0+ICFuLmlzQ29udGFpbmVyIHx8ICFuLmlzRXhwYW5kZWQgPyBuIDogbnVsbCxcbiAgICAgICAgbiA9PiB7XG4gICAgICAgICAgaWYgKG4uaXNDb250YWluZXIgJiYgbi5pc0V4cGFuZGVkKSB7XG4gICAgICAgICAgICB0aGlzLl9mZXRjaENoaWxkS2V5cyhuLnVyaSk7XG4gICAgICAgICAgICByZXR1cm4gbi5zZXRJc0xvYWRpbmcodHJ1ZSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIG47XG4gICAgICAgIH1cbiAgICAgICk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogUGVyZm9ybWVzIGEgZGVlcCBCRlMgc2Nhbm5pbmcgZXhwYW5kIG9mIGNvbnRhaW5lZCBub2Rlcy5cbiAgICogcmV0dXJucyAtIGEgcHJvbWlzZSBmdWxmaWxsZWQgd2hlbiB0aGUgZXhwYW5kIG9wZXJhdGlvbiBpcyBmaW5pc2hlZFxuICAgKi9cbiAgX2V4cGFuZE5vZGVEZWVwKHJvb3RLZXk6IE51Y2xpZGVVcmksIG5vZGVLZXk6IE51Y2xpZGVVcmkpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAvLyBTdG9wIHRoZSB0cmF2ZXJzYWwgYWZ0ZXIgMTAwIG5vZGVzIHdlcmUgYWRkZWQgdG8gdGhlIHRyZWVcbiAgICBjb25zdCBpdE5vZGVzID0gbmV3IEZpbGVUcmVlU3RvcmVCZnNJdGVyYXRvcih0aGlzLCByb290S2V5LCBub2RlS2V5LCAvKiBsaW1pdCovIDEwMCk7XG4gICAgY29uc3QgcHJvbWlzZSA9IG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgY29uc3QgZXhwYW5kID0gKCkgPT4ge1xuICAgICAgICBjb25zdCB0cmF2ZXJzZWROb2RlS2V5ID0gaXROb2Rlcy50cmF2ZXJzZWROb2RlKCk7XG4gICAgICAgIGlmICh0cmF2ZXJzZWROb2RlS2V5KSB7XG4gICAgICAgICAgdGhpcy5fZXhwYW5kTm9kZShyb290S2V5LCB0cmF2ZXJzZWROb2RlS2V5KTtcblxuICAgICAgICAgIGNvbnN0IG5leHRQcm9taXNlID0gaXROb2Rlcy5uZXh0KCk7XG4gICAgICAgICAgaWYgKG5leHRQcm9taXNlKSB7XG4gICAgICAgICAgICBuZXh0UHJvbWlzZS50aGVuKGV4cGFuZCk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgZXhwYW5kKCk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gcHJvbWlzZTtcbiAgfVxuXG4gIF9jb2xsYXBzZU5vZGUocm9vdEtleTogTnVjbGlkZVVyaSwgbm9kZUtleTogTnVjbGlkZVVyaSk6IHZvaWQge1xuICAgIHRoaXMuX3VwZGF0ZU5vZGVBdFJvb3Qocm9vdEtleSwgbm9kZUtleSwgbm9kZSA9PiB7XG4gICAgICAvLyBDbGVhciBhbGwgc2VsZWN0ZWQgbm9kZXMgdW5kZXIgdGhlIG5vZGUgYmVpbmcgY29sbGFwc2VkIGFuZCBkaXNwb3NlIHRoZWlyIHN1YnNjcmlwdGlvbnNcbiAgICAgIHJldHVybiBub2RlLnNldFJlY3Vyc2l2ZShcbiAgICAgICAgY2hpbGROb2RlID0+IHtcbiAgICAgICAgICBpZiAoY2hpbGROb2RlLmlzRXhwYW5kZWQpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gY2hpbGROb2RlO1xuICAgICAgICB9LFxuICAgICAgICBjaGlsZE5vZGUgPT4ge1xuICAgICAgICAgIGlmIChjaGlsZE5vZGUuc3Vic2NyaXB0aW9uICE9IG51bGwpIHtcbiAgICAgICAgICAgIGNoaWxkTm9kZS5zdWJzY3JpcHRpb24uZGlzcG9zZSgpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChjaGlsZE5vZGUudXJpID09PSBub2RlLnVyaSkge1xuICAgICAgICAgICAgcmV0dXJuIGNoaWxkTm9kZS5zZXQoe2lzRXhwYW5kZWQ6IGZhbHNlLCBzdWJzY3JpcHRpb246IG51bGx9KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGNoaWxkTm9kZS5zZXQoe2lzU2VsZWN0ZWQ6IGZhbHNlLCBzdWJzY3JpcHRpb246IG51bGx9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICk7XG4gICAgfSk7XG4gIH1cblxuICBfY29sbGFwc2VOb2RlRGVlcChyb290S2V5OiBOdWNsaWRlVXJpLCBub2RlS2V5OiBOdWNsaWRlVXJpKTogdm9pZCB7XG4gICAgdGhpcy5fdXBkYXRlTm9kZUF0Um9vdChyb290S2V5LCBub2RlS2V5LCBub2RlID0+IHtcbiAgICAgIGludmFyaWFudChub2RlLmlzRXhwYW5kZWQpO1xuICAgICAgcmV0dXJuIG5vZGUuc2V0UmVjdXJzaXZlKFxuICAgICAgICAvKiBwcmVQcmVkaWNhdGUgKi8gbnVsbCxcbiAgICAgICAgY2hpbGROb2RlID0+IHtcbiAgICAgICAgICBpZiAoY2hpbGROb2RlLnN1YnNjcmlwdGlvbiAhPSBudWxsKSB7XG4gICAgICAgICAgICBjaGlsZE5vZGUuc3Vic2NyaXB0aW9uLmRpc3Bvc2UoKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoY2hpbGROb2RlICE9PSBub2RlKSB7XG4gICAgICAgICAgICByZXR1cm4gY2hpbGROb2RlLnNldCh7aXNFeHBhbmRlZDogZmFsc2UsIGlzU2VsZWN0ZWQ6IGZhbHNlLCBzdWJzY3JpcHRpb246IG51bGx9KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGNoaWxkTm9kZS5zZXQoe2lzRXhwYW5kZWQ6IGZhbHNlLCBzdWJzY3JpcHRpb246IG51bGx9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICApO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICogU2VsZWN0cyBhIHNpbmdsZSBub2RlIGFuZCB0cmFja3MgaXQuXG4gICovXG4gIF9zZXRTZWxlY3RlZE5vZGUocm9vdEtleTogTnVjbGlkZVVyaSwgbm9kZUtleTogTnVjbGlkZVVyaSk6IHZvaWQge1xuICAgIHRoaXMuX2NsZWFyU2VsZWN0aW9uKCk7XG4gICAgdGhpcy5fdXBkYXRlTm9kZUF0Um9vdChyb290S2V5LCBub2RlS2V5LCBub2RlID0+IG5vZGUuc2V0SXNTZWxlY3RlZCh0cnVlKSk7XG4gICAgdGhpcy5fc2V0VHJhY2tlZE5vZGUocm9vdEtleSwgbm9kZUtleSk7XG4gIH1cblxuICBfYWRkU2VsZWN0ZWROb2RlKHJvb3RLZXk6IE51Y2xpZGVVcmksIG5vZGVLZXk6IE51Y2xpZGVVcmkpOiB2b2lkIHtcbiAgICB0aGlzLl91cGRhdGVOb2RlQXRSb290KHJvb3RLZXksIG5vZGVLZXksIG5vZGUgPT4gbm9kZS5zZXRJc1NlbGVjdGVkKHRydWUpKTtcbiAgfVxuXG4gIF91bnNlbGVjdE5vZGUocm9vdEtleTogTnVjbGlkZVVyaSwgbm9kZUtleTogTnVjbGlkZVVyaSk6IHZvaWQge1xuICAgIHRoaXMuX3VwZGF0ZU5vZGVBdFJvb3Qocm9vdEtleSwgbm9kZUtleSwgbm9kZSA9PiBub2RlLnNldElzU2VsZWN0ZWQoZmFsc2UpKTtcbiAgfVxuXG4gIC8qKlxuICAqIE1vdmVzIHRoZSBzZWxlY3Rpb24gb25lIG5vZGUgZG93bi4gSW4gY2FzZSBzZXZlcmFsIG5vZGVzIHdlcmUgc2VsZWN0ZWQsIHRoZSB0b3Btb3N0IChmaXJzdCBpblxuICAqIHRoZSBuYXR1cmFsIHZpc3VhbCBvcmRlcikgaXMgY29uc2lkZXJlZCB0byBiZSB0aGUgcmVmZXJlbmNlIHBvaW50IGZvciB0aGUgbW92ZS5cbiAgKi9cbiAgX21vdmVTZWxlY3Rpb25Eb3duKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLnJvb3RzLmlzRW1wdHkoKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHNlbGVjdGVkTm9kZXMgPSB0aGlzLmdldFNlbGVjdGVkTm9kZXMoKTtcblxuICAgIGxldCBub2RlVG9TZWxlY3Q7XG4gICAgaWYgKHNlbGVjdGVkTm9kZXMuaXNFbXB0eSgpKSB7XG4gICAgICBub2RlVG9TZWxlY3QgPSB0aGlzLnJvb3RzLmZpcnN0KCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHNlbGVjdGVkTm9kZSA9IHNlbGVjdGVkTm9kZXMuZmlyc3QoKTtcbiAgICAgIG5vZGVUb1NlbGVjdCA9IHNlbGVjdGVkTm9kZS5maW5kTmV4dCgpO1xuICAgIH1cblxuICAgIGlmIChub2RlVG9TZWxlY3QgIT0gbnVsbCkge1xuICAgICAgdGhpcy5fc2V0U2VsZWN0ZWROb2RlKG5vZGVUb1NlbGVjdC5yb290VXJpLCBub2RlVG9TZWxlY3QudXJpKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgKiBNb3ZlcyB0aGUgc2VsZWN0aW9uIG9uZSBub2RlIHVwLiBJbiBjYXNlIHNldmVyYWwgbm9kZXMgd2VyZSBzZWxlY3RlZCwgdGhlIHRvcG1vc3QgKGZpcnN0IGluXG4gICogdGhlIG5hdHVyYWwgdmlzdWFsIG9yZGVyKSBpcyBjb25zaWRlcmVkIHRvIGJlIHRoZSByZWZlcmVuY2UgcG9pbnQgZm9yIHRoZSBtb3ZlLlxuICAqL1xuICBfbW92ZVNlbGVjdGlvblVwKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLnJvb3RzLmlzRW1wdHkoKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHNlbGVjdGVkTm9kZXMgPSB0aGlzLmdldFNlbGVjdGVkTm9kZXMoKTtcblxuICAgIGxldCBub2RlVG9TZWxlY3Q7XG4gICAgaWYgKHNlbGVjdGVkTm9kZXMuaXNFbXB0eSgpKSB7XG4gICAgICBub2RlVG9TZWxlY3QgPSB0aGlzLnJvb3RzLmxhc3QoKS5maW5kTGFzdFJlY3Vyc2l2ZUNoaWxkKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHNlbGVjdGVkTm9kZSA9IHNlbGVjdGVkTm9kZXMuZmlyc3QoKTtcbiAgICAgIG5vZGVUb1NlbGVjdCA9IHNlbGVjdGVkTm9kZS5maW5kUHJldmlvdXMoKTtcbiAgICB9XG5cbiAgICBpZiAobm9kZVRvU2VsZWN0ICE9IG51bGwpIHtcbiAgICAgIHRoaXMuX3NldFNlbGVjdGVkTm9kZShub2RlVG9TZWxlY3Qucm9vdFVyaSwgbm9kZVRvU2VsZWN0LnVyaSk7XG4gICAgfVxuICB9XG5cbiAgX21vdmVTZWxlY3Rpb25Ub1RvcCgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5yb290cy5pc0VtcHR5KCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgbm9kZVRvU2VsZWN0ID0gdGhpcy5yb290cy5maXJzdCgpO1xuICAgIGlmIChub2RlVG9TZWxlY3QgIT0gbnVsbCAmJiAhbm9kZVRvU2VsZWN0LnNob3VsZEJlU2hvd24pIHtcbiAgICAgIG5vZGVUb1NlbGVjdCA9IG5vZGVUb1NlbGVjdC5maW5kTmV4dCgpO1xuICAgIH1cblxuICAgIGlmIChub2RlVG9TZWxlY3QgIT0gbnVsbCkge1xuICAgICAgdGhpcy5fc2V0U2VsZWN0ZWROb2RlKG5vZGVUb1NlbGVjdC51cmksIG5vZGVUb1NlbGVjdC51cmkpO1xuICAgIH1cbiAgfVxuXG4gIF9tb3ZlU2VsZWN0aW9uVG9Cb3R0b20oKTogdm9pZCB7XG4gICAgaWYgKHRoaXMucm9vdHMuaXNFbXB0eSgpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgbGFzdFJvb3QgPSB0aGlzLnJvb3RzLmxhc3QoKTtcbiAgICBjb25zdCBsYXN0Q2hpbGQgPSBsYXN0Um9vdC5maW5kTGFzdFJlY3Vyc2l2ZUNoaWxkKCk7XG4gICAgdGhpcy5fc2V0U2VsZWN0ZWROb2RlKGxhc3RDaGlsZC5yb290VXJpLCBsYXN0Q2hpbGQudXJpKTtcbiAgfVxuXG4gIF9jbGVhclNlbGVjdGlvbigpOiB2b2lkIHtcbiAgICB0aGlzLl91cGRhdGVSb290cyhyb290ID0+IHtcbiAgICAgIHJldHVybiByb290LnNldFJlY3Vyc2l2ZShcbiAgICAgICAgbm9kZSA9PiBub2RlLmNvbnRhaW5zU2VsZWN0aW9uID8gbnVsbCA6IG5vZGUsXG4gICAgICAgIG5vZGUgPT4gbm9kZS5zZXRJc1NlbGVjdGVkKGZhbHNlKSxcbiAgICAgICk7XG4gICAgfSk7XG4gIH1cblxuICBfc2V0Um9vdEtleXMocm9vdEtleXM6IEFycmF5PE51Y2xpZGVVcmk+KTogdm9pZCB7XG4gICAgY29uc3Qgcm9vdE5vZGVzID0gcm9vdEtleXMubWFwKHJvb3RVcmkgPT4ge1xuICAgICAgY29uc3Qgcm9vdCA9IHRoaXMucm9vdHMuZ2V0KHJvb3RVcmkpO1xuICAgICAgaWYgKHJvb3QgIT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gcm9vdDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG5ldyBGaWxlVHJlZU5vZGUoe1xuICAgICAgICB1cmk6IHJvb3RVcmksXG4gICAgICAgIHJvb3RVcmksXG4gICAgICAgIGNvbm5lY3Rpb25UaXRsZTogRmlsZVRyZWVIZWxwZXJzLmdldERpc3BsYXlUaXRsZShyb290VXJpKSB8fCAnJyxcbiAgICAgIH0sIHRoaXMuX2NvbmYpO1xuICAgIH0pO1xuXG4gICAgY29uc3Qgcm9vdHMgPSBuZXcgSW1tdXRhYmxlLk9yZGVyZWRNYXAocm9vdE5vZGVzLm1hcChyb290ID0+IFtyb290LnVyaSwgcm9vdF0pKTtcbiAgICBjb25zdCByZW1vdmVkUm9vdHMgPSB0aGlzLnJvb3RzLmZpbHRlcihyb290ID0+ICFyb290cy5oYXMocm9vdC51cmkpKTtcbiAgICByZW1vdmVkUm9vdHMuZm9yRWFjaChyb290ID0+IHJvb3QudHJhdmVyc2UoXG4gICAgICBub2RlID0+IG5vZGUuaXNFeHBhbmRlZCxcbiAgICAgIG5vZGUgPT4ge1xuICAgICAgICBpZiAobm9kZS5zdWJzY3JpcHRpb24gIT0gbnVsbCkge1xuICAgICAgICAgIG5vZGUuc3Vic2NyaXB0aW9uLmRpc3Bvc2UoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICkpO1xuICAgIHRoaXMuX3NldFJvb3RzKHJvb3RzKTtcblxuICAgIC8vIEp1c3QgaW4gY2FzZSB0aGVyZSdzIGEgcmFjZSBiZXR3ZWVuIHRoZSB1cGRhdGUgb2YgdGhlIHJvb3Qga2V5cyBhbmQgdGhlIGN3ZEtleSBhbmQgdGhlIGN3ZEtleVxuICAgIC8vIGlzIHNldCB0b28gZWFybHkgLSBzZXQgaXQgYWdhaW4uIElmIHRoZXJlIHdhcyBubyByYWNlIC0gaXQncyBhIG5vb3AuXG4gICAgdGhpcy5fc2V0Q3dkS2V5KHRoaXMuX2N3ZEtleSk7XG4gIH1cblxuICAvKipcbiAgKiBNYWtlcyBzdXJlIGEgY2VydGFpbiBjaGlsZCBub2RlIGlzIHByZXNlbnQgaW4gdGhlIGZpbGUgdHJlZSwgY3JlYXRpbmcgYWxsIGl0cyBhbmNlc3RvcnMsIGlmXG4gICogbmVlZGVkIGFuZCBzY2hlZHVsaW5nIGEgY2hpbGxkIGtleSBmZXRjaC4gVXNlZCBieSB0aGUgcmV2ZWFsIGFjdGl2ZSBmaWxlIGZ1bmN0aW9uYWxpdHkuXG4gICovXG4gIF9lbnN1cmVDaGlsZE5vZGUobm9kZUtleTogTnVjbGlkZVVyaSk6IHZvaWQge1xuICAgIGxldCBmaXJzdFJvb3RVcmk7XG5cbiAgICBjb25zdCBleHBhbmROb2RlID0gbm9kZSA9PiB7XG4gICAgICBpZiAobm9kZS5pc0V4cGFuZGVkICYmIG5vZGUuc3Vic2NyaXB0aW9uICE9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIG5vZGU7XG4gICAgICB9XG5cbiAgICAgIGlmIChub2RlLnN1YnNjcmlwdGlvbiAhPSBudWxsKSB7XG4gICAgICAgIG5vZGUuc3Vic2NyaXB0aW9uLmRpc3Bvc2UoKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgZGlyZWN0b3J5ID0gRmlsZVRyZWVIZWxwZXJzLmdldERpcmVjdG9yeUJ5S2V5KG5vZGUudXJpKTtcbiAgICAgIGNvbnN0IHN1YnNjcmlwdGlvbiA9IHRoaXMuX21ha2VTdWJzY3JpcHRpb24obm9kZS51cmksIGRpcmVjdG9yeSk7XG4gICAgICByZXR1cm4gbm9kZS5zZXQoe3N1YnNjcmlwdGlvbiwgaXNFeHBhbmRlZDogdHJ1ZX0pO1xuICAgIH07XG5cbiAgICB0aGlzLl91cGRhdGVSb290cyhyb290ID0+IHtcbiAgICAgIGlmICghbm9kZUtleS5zdGFydHNXaXRoKHJvb3QudXJpKSkge1xuICAgICAgICByZXR1cm4gcm9vdDtcbiAgICAgIH1cblxuICAgICAgaWYgKGZpcnN0Um9vdFVyaSA9PSBudWxsKSB7XG4gICAgICAgIGZpcnN0Um9vdFVyaSA9IHJvb3QudXJpO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBkZWVwZXN0ID0gcm9vdC5maW5kRGVlcGVzdChub2RlS2V5KTtcbiAgICAgIGlmIChkZWVwZXN0ID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHJvb3Q7XG4gICAgICB9XG5cbiAgICAgIGlmIChkZWVwZXN0LnVyaSA9PT0gbm9kZUtleSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYnViYmxlVXAoXG4gICAgICAgICAgZGVlcGVzdCxcbiAgICAgICAgICBkZWVwZXN0LFxuICAgICAgICAgIGV4cGFuZE5vZGUsXG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHBhcmVudHMgPSBbXTtcbiAgICAgIGxldCBjdXJyZW50UGFyZW50VXJpID0gRmlsZVRyZWVIZWxwZXJzLmdldFBhcmVudEtleShub2RlS2V5KTtcbiAgICAgIHdoaWxlIChjdXJyZW50UGFyZW50VXJpICE9PSBkZWVwZXN0LnVyaSkge1xuICAgICAgICBwYXJlbnRzLnB1c2goY3VycmVudFBhcmVudFVyaSk7XG4gICAgICAgIGN1cnJlbnRQYXJlbnRVcmkgPSBGaWxlVHJlZUhlbHBlcnMuZ2V0UGFyZW50S2V5KGN1cnJlbnRQYXJlbnRVcmkpO1xuICAgICAgfVxuXG4gICAgICBsZXQgY3VycmVudENoaWxkID0gZGVlcGVzdC5jcmVhdGVDaGlsZCh7dXJpOiBub2RlS2V5fSk7XG5cbiAgICAgIHBhcmVudHMuZm9yRWFjaChjdXJyZW50VXJpID0+IHtcbiAgICAgICAgdGhpcy5fZmV0Y2hDaGlsZEtleXMoY3VycmVudFVyaSk7XG4gICAgICAgIGNvbnN0IHBhcmVudCA9IGRlZXBlc3QuY3JlYXRlQ2hpbGQoe1xuICAgICAgICAgIHVyaTogY3VycmVudFVyaSxcbiAgICAgICAgICBpc0xvYWRpbmc6IHRydWUsXG4gICAgICAgICAgaXNFeHBhbmRlZDogdHJ1ZSxcbiAgICAgICAgICBjaGlsZHJlbjogRmlsZVRyZWVOb2RlLmNoaWxkcmVuRnJvbUFycmF5KFtjdXJyZW50Q2hpbGRdKSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY3VycmVudENoaWxkID0gcGFyZW50O1xuICAgICAgfSk7XG5cbiAgICAgIHRoaXMuX2ZldGNoQ2hpbGRLZXlzKGRlZXBlc3QudXJpKTtcbiAgICAgIHJldHVybiB0aGlzLl9idWJibGVVcChcbiAgICAgICAgZGVlcGVzdCxcbiAgICAgICAgZGVlcGVzdC5zZXQoe1xuICAgICAgICAgIGlzTG9hZGluZzogdHJ1ZSxcbiAgICAgICAgICBpc0V4cGFuZGVkOiB0cnVlLFxuICAgICAgICAgIGNoaWxkcmVuOiBkZWVwZXN0LmNoaWxkcmVuLnNldChjdXJyZW50Q2hpbGQubmFtZSwgY3VycmVudENoaWxkKSxcbiAgICAgICAgfSksXG4gICAgICAgIGV4cGFuZE5vZGUsXG4gICAgICApO1xuICAgIH0pO1xuXG4gICAgaWYgKGZpcnN0Um9vdFVyaSAhPSBudWxsKSB7XG4gICAgICB0aGlzLl9zZXRTZWxlY3RlZE5vZGUoZmlyc3RSb290VXJpLCBub2RlS2V5KTtcbiAgICB9XG4gIH1cblxuICBfY2xlYXJUcmFja2VkTm9kZSgpOiB2b2lkIHtcbiAgICB0aGlzLl91cGRhdGVSb290cyhyb290ID0+IHtcbiAgICAgIGlmICghcm9vdC5jb250YWluc1RyYWNrZWROb2RlKSB7XG4gICAgICAgIHJldHVybiByb290O1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcm9vdC5zZXRSZWN1cnNpdmUoXG4gICAgICAgIG5vZGUgPT4gbm9kZS5jb250YWluc1RyYWNrZWROb2RlID8gbnVsbCA6IG5vZGUsXG4gICAgICAgIG5vZGUgPT4gbm9kZS5zZXRJc1RyYWNrZWQoZmFsc2UpLFxuICAgICAgKTtcbiAgICB9KTtcbiAgfVxuXG4gIF9zZXRUcmFja2VkTm9kZShyb290S2V5OiBOdWNsaWRlVXJpLCBub2RlS2V5OiBOdWNsaWRlVXJpKTogdm9pZCB7XG4gICAgdGhpcy5fY2xlYXJUcmFja2VkTm9kZSgpO1xuICAgIHRoaXMuX3VwZGF0ZU5vZGVBdFJvb3Qocm9vdEtleSwgbm9kZUtleSwgbm9kZSA9PiBub2RlLnNldElzVHJhY2tlZCh0cnVlKSk7XG4gIH1cblxuICBfc2V0UmVwb3NpdG9yaWVzKHJlcG9zaXRvcmllczogSW1tdXRhYmxlLlNldDxhdG9tJFJlcG9zaXRvcnk+KTogdm9pZCB7XG4gICAgdGhpcy5fcmVwb3NpdG9yaWVzID0gcmVwb3NpdG9yaWVzO1xuICAgIHRoaXMuX3VwZGF0ZUNvbmYoY29uZiA9PiB7XG4gICAgICBjb25zdCByZXBvc0J5Um9vdCA9IHt9O1xuICAgICAgdGhpcy5yb290cy5mb3JFYWNoKHJvb3QgPT4ge1xuICAgICAgICByZXBvc0J5Um9vdFtyb290LnVyaV0gPSByZXBvc2l0b3J5Rm9yUGF0aChyb290LnVyaSk7XG4gICAgICB9KTtcbiAgICAgIGNvbmYucmVwb3NCeVJvb3QgPSByZXBvc0J5Um9vdDtcbiAgICB9KTtcbiAgfVxuXG4gIF9zZXRXb3JraW5nU2V0KHdvcmtpbmdTZXQ6IFdvcmtpbmdTZXQpOiB2b2lkIHtcbiAgICB0aGlzLl91cGRhdGVDb25mKGNvbmYgPT4gY29uZi53b3JraW5nU2V0ID0gd29ya2luZ1NldCk7XG4gIH1cblxuICBfc2V0T3BlbkZpbGVzV29ya2luZ1NldChvcGVuRmlsZXNXb3JraW5nU2V0OiBXb3JraW5nU2V0KTogdm9pZCB7XG4gICAgdGhpcy5fdXBkYXRlQ29uZihjb25mID0+IGNvbmYub3BlbkZpbGVzV29ya2luZ1NldCA9IG9wZW5GaWxlc1dvcmtpbmdTZXQpO1xuICB9XG5cbiAgX3NldFdvcmtpbmdTZXRzU3RvcmUod29ya2luZ1NldHNTdG9yZTogP1dvcmtpbmdTZXRzU3RvcmUpOiB2b2lkIHtcbiAgICB0aGlzLl93b3JraW5nU2V0c1N0b3JlID0gd29ya2luZ1NldHNTdG9yZTtcbiAgfVxuXG4gIF9zdGFydEVkaXRpbmdXb3JraW5nU2V0KCk6IHZvaWQge1xuICAgIHRoaXMuX3VwZGF0ZVJvb3RzKHJvb3QgPT5cbiAgICAgIHJvb3Quc2V0UmVjdXJzaXZlKG51bGwsIG5vZGUgPT4gbm9kZS5zZXRDaGVja2VkU3RhdHVzKCdjbGVhcicpKVxuICAgICk7XG4gICAgdGhpcy5fdXBkYXRlQ29uZihjb25mID0+IGNvbmYuaXNFZGl0aW5nV29ya2luZ1NldCA9IHRydWUpO1xuICB9XG5cbiAgX2ZpbmlzaEVkaXRpbmdXb3JraW5nU2V0KCk6IHZvaWQge1xuICAgIHRoaXMuX3VwZGF0ZVJvb3RzKHJvb3QgPT5cbiAgICAgIHJvb3Quc2V0UmVjdXJzaXZlKG51bGwsIG5vZGUgPT4gbm9kZS5zZXRDaGVja2VkU3RhdHVzKCdjbGVhcicpKVxuICAgICk7XG4gICAgdGhpcy5fdXBkYXRlQ29uZihjb25mID0+IGNvbmYuaXNFZGl0aW5nV29ya2luZ1NldCA9IGZhbHNlKTtcbiAgfVxuXG4gIF9jaGVja05vZGUocm9vdEtleTogTnVjbGlkZVVyaSwgbm9kZUtleTogTnVjbGlkZVVyaSk6IHZvaWQge1xuICAgIGlmICghdGhpcy5fY29uZi5pc0VkaXRpbmdXb3JraW5nU2V0KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5fdXBkYXRlTm9kZUF0Um9vdChyb290S2V5LCBub2RlS2V5LCBub2RlID0+IHtcbiAgICAgIHJldHVybiBub2RlLnNldFJlY3Vyc2l2ZShcbiAgICAgICAgbiA9PiBuLmNoZWNrZWRTdGF0dXMgPT09ICdjaGVja2VkJyA/IG4gOiBudWxsLFxuICAgICAgICBuID0+IG4uc2V0Q2hlY2tlZFN0YXR1cygnY2hlY2tlZCcpLFxuICAgICAgKTtcbiAgICB9KTtcbiAgfVxuXG4gIF91bmNoZWNrTm9kZShyb290S2V5OiBOdWNsaWRlVXJpLCBub2RlS2V5OiBOdWNsaWRlVXJpKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLl9jb25mLmlzRWRpdGluZ1dvcmtpbmdTZXQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLl91cGRhdGVOb2RlQXRSb290KHJvb3RLZXksIG5vZGVLZXksIG5vZGUgPT4ge1xuICAgICAgcmV0dXJuIG5vZGUuc2V0UmVjdXJzaXZlKFxuICAgICAgICBuID0+IG4uY2hlY2tlZFN0YXR1cyA9PT0gJ2NsZWFyJyA/IG4gOiBudWxsLFxuICAgICAgICBuID0+IG4uc2V0Q2hlY2tlZFN0YXR1cygnY2xlYXInKSxcbiAgICAgICk7XG4gICAgfSk7XG4gIH1cblxuICByZXNldCgpOiB2b2lkIHtcbiAgICB0aGlzLnJvb3RzLmZvckVhY2gocm9vdCA9PiB7XG4gICAgICByb290LnRyYXZlcnNlKG4gPT4ge1xuICAgICAgICBpZiAobi5zdWJzY3JpcHRpb24gIT0gbnVsbCkge1xuICAgICAgICAgIG4uc3Vic2NyaXB0aW9uLmRpc3Bvc2UoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICAvLyBSZXNldCBkYXRhIHN0b3JlLlxuICAgIHRoaXMuX2NvbmYgPSBERUZBVUxUX0NPTkY7XG4gICAgdGhpcy5fc2V0Um9vdHMobmV3IEltbXV0YWJsZS5PcmRlcmVkTWFwKCkpO1xuICB9XG5cbiAgc3Vic2NyaWJlKGxpc3RlbmVyOiBDaGFuZ2VMaXN0ZW5lcik6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5fZW1pdHRlci5vbignY2hhbmdlJywgbGlzdGVuZXIpO1xuICB9XG59XG5cbi8qKlxuICogUGVyZm9ybXMgYSBicmVhZHRoLWZpcnN0IGl0ZXJhdGlvbiBvdmVyIHRoZSBkaXJlY3RvcmllcyBvZiB0aGUgdHJlZSBzdGFydGluZ1xuICogd2l0aCBhIGdpdmVuIG5vZGUuIFRoZSBpdGVyYXRpb24gc3RvcHMgb25jZSBhIGdpdmVuIGxpbWl0IG9mIG5vZGVzIChib3RoIGRpcmVjdG9yaWVzXG4gKiBhbmQgZmlsZXMpIHdlcmUgdHJhdmVyc2VkLlxuICogVGhlIG5vZGUgYmVpbmcgY3VycmVudGx5IHRyYXZlcnNlZCBjYW4gYmUgb2J0YWluZWQgYnkgY2FsbGluZyAudHJhdmVyc2VkTm9kZSgpXG4gKiAubmV4dCgpIHJldHVybnMgYSBwcm9taXNlIHRoYXQgaXMgZnVsZmlsbGVkIHdoZW4gdGhlIHRyYXZlcnNhbCBtb3ZlcyBvbiB0b1xuICogdGhlIG5leHQgZGlyZWN0b3J5LlxuICovXG5jbGFzcyBGaWxlVHJlZVN0b3JlQmZzSXRlcmF0b3Ige1xuICBfZmlsZVRyZWVTdG9yZTogRmlsZVRyZWVTdG9yZTtcbiAgX3Jvb3RLZXk6IE51Y2xpZGVVcmk7XG4gIF9ub2Rlc1RvVHJhdmVyc2U6IEFycmF5PE51Y2xpZGVVcmk+O1xuICBfY3VycmVudGx5VHJhdmVyc2VkTm9kZTogP051Y2xpZGVVcmk7XG4gIF9saW1pdDogbnVtYmVyO1xuICBfbnVtTm9kZXNUcmF2ZXJzZWQ6IG51bWJlcjtcbiAgX3Byb21pc2U6ID9Qcm9taXNlPHZvaWQ+O1xuICBfY291bnQ6IG51bWJlcjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIGZpbGVUcmVlU3RvcmU6IEZpbGVUcmVlU3RvcmUsXG4gICAgICByb290S2V5OiBOdWNsaWRlVXJpLFxuICAgICAgbm9kZUtleTogTnVjbGlkZVVyaSxcbiAgICAgIGxpbWl0OiBudW1iZXIpIHtcbiAgICB0aGlzLl9maWxlVHJlZVN0b3JlID0gZmlsZVRyZWVTdG9yZTtcbiAgICB0aGlzLl9yb290S2V5ID0gcm9vdEtleTtcbiAgICB0aGlzLl9ub2Rlc1RvVHJhdmVyc2UgPSBbXTtcbiAgICB0aGlzLl9jdXJyZW50bHlUcmF2ZXJzZWROb2RlID0gbm9kZUtleTtcbiAgICB0aGlzLl9saW1pdCA9IGxpbWl0O1xuICAgIHRoaXMuX251bU5vZGVzVHJhdmVyc2VkID0gMDtcbiAgICB0aGlzLl9wcm9taXNlID0gbnVsbDtcbiAgICB0aGlzLl9jb3VudCA9IDA7XG4gIH1cblxuICBfaGFuZGxlUHJvbWlzZVJlc29sdXRpb24oY2hpbGRyZW5LZXlzOiBBcnJheTxOdWNsaWRlVXJpPik6IHZvaWQge1xuICAgIHRoaXMuX251bU5vZGVzVHJhdmVyc2VkICs9IGNoaWxkcmVuS2V5cy5sZW5ndGg7XG4gICAgaWYgKHRoaXMuX251bU5vZGVzVHJhdmVyc2VkIDwgdGhpcy5fbGltaXQpIHtcbiAgICAgIGNvbnN0IG5leHRMZXZlbE5vZGVzID0gY2hpbGRyZW5LZXlzLmZpbHRlcihjaGlsZEtleSA9PiBGaWxlVHJlZUhlbHBlcnMuaXNEaXJLZXkoY2hpbGRLZXkpKTtcbiAgICAgIHRoaXMuX25vZGVzVG9UcmF2ZXJzZSA9IHRoaXMuX25vZGVzVG9UcmF2ZXJzZS5jb25jYXQobmV4dExldmVsTm9kZXMpO1xuXG4gICAgICB0aGlzLl9jdXJyZW50bHlUcmF2ZXJzZWROb2RlID0gdGhpcy5fbm9kZXNUb1RyYXZlcnNlLnNwbGljZSgwLCAxKVswXTtcbiAgICAgIHRoaXMuX3Byb21pc2UgPSBudWxsO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9jdXJyZW50bHlUcmF2ZXJzZWROb2RlID0gbnVsbDtcbiAgICAgIHRoaXMuX3Byb21pc2UgPSBudWxsO1xuICAgIH1cblxuICAgIHJldHVybjtcbiAgfVxuXG4gIG5leHQoKTogP1Byb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IGN1cnJlbnRseVRyYXZlcnNlZE5vZGUgPSB0aGlzLl9jdXJyZW50bHlUcmF2ZXJzZWROb2RlO1xuICAgIGlmICghdGhpcy5fcHJvbWlzZSAmJiBjdXJyZW50bHlUcmF2ZXJzZWROb2RlKSB7XG4gICAgICB0aGlzLl9wcm9taXNlID0gdGhpcy5fZmlsZVRyZWVTdG9yZS5wcm9taXNlTm9kZUNoaWxkS2V5cyhcbiAgICAgICAgdGhpcy5fcm9vdEtleSxcbiAgICAgICAgY3VycmVudGx5VHJhdmVyc2VkTm9kZSlcbiAgICAgIC50aGVuKHRoaXMuX2hhbmRsZVByb21pc2VSZXNvbHV0aW9uLmJpbmQodGhpcykpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fcHJvbWlzZTtcbiAgfVxuXG4gIHRyYXZlcnNlZE5vZGUoKTogP3N0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX2N1cnJlbnRseVRyYXZlcnNlZE5vZGU7XG4gIH1cbn1cbiJdfQ==