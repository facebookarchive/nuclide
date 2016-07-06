Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _FileTreeHelpers2;

function _FileTreeHelpers() {
  return _FileTreeHelpers2 = require('./FileTreeHelpers');
}

var _nuclideRemoteUri2;

function _nuclideRemoteUri() {
  return _nuclideRemoteUri2 = _interopRequireDefault(require('../../nuclide-remote-uri'));
}

var _immutable2;

function _immutable() {
  return _immutable2 = _interopRequireDefault(require('immutable'));
}

var _nuclideHgRepositoryBaseLibHgConstants2;

function _nuclideHgRepositoryBaseLibHgConstants() {
  return _nuclideHgRepositoryBaseLibHgConstants2 = require('../../nuclide-hg-repository-base/lib/hg-constants');
}

var DEFAULT_OPTIONS = {
  isExpanded: false,
  isSelected: false,
  isFocused: false,
  isDragHovered: false,
  isLoading: false,
  wasFetched: false,
  isCwd: false,
  isTracked: false,
  children: new (_immutable2 || _immutable()).default.OrderedMap(),
  connectionTitle: '',
  subscription: null,
  highlightedText: '',
  matchesFilter: true
};

/**
* OVERVIEW
*   The FileTreeNode class is almost entirely immutable. Except for the parent and the sibling
* links no properties are to be updated after the creation.
*
*   The class contains multiple derived fields. The derived fields are calculated from the options,
* from the configuration values and even from chieldren's properties. Once calculated the properties
* are immutable.
*
*   Setting any of the properties (except for the aforementioned links to parent and siblings) will
* create a new instance of the class, with required properties set. If, however, the set operation
* is a no-op (such if setting a property to the same value it already has), new instance creation
* is not skipped and same instance is returned instead.
*
*   When possible, the class
* strives not to recompute the derived fields, but reuses the previous values.
*
*
* THE CONFIGURATION
*   Is the object passed to the constructor and conceptually shared among all
* instances in a tree. Should be used for properties that make no sense to be owned by the tree
* elements, yet such that affect the tree. Such as the configuration whether to use the prefix
* navigation, for instance, or the currently configured Working Set.
* The configuration object should be treated as immutable by its owner. Whenever a change occurs
* method `updateConf()` has to be called on the root(s) of the tree to notify about the change.
* This call would trigger complete reconstruction of the tree, to reflect the possibly changed
* derived properties.
* This gives another reason to use the configuration object sparingly - it is expensive to rebuild
* the entire tree.
*
*
* CHILDREN HANDLING
*   In order for the tree traversal and modifications to be efficient one often
* needs to find the parent of a node. Parent property, however, can't be one of the node's immutable
* fields, otherwise it'd create circular references. Therefore the parent property is never given
* to the node's constructor, but rather set by the parent itself when the node is assigned to it.
* This means that we need to avoid the state when same node node is contained in the .children map
* of several other nodes. As only the latest one it was assigned to is considered its parent from
* the node's perspective.
*
*   Just like the parent property, some operations require an ability to find siblings easily.
* The previous and the next sibling properties are too set when a child is assigned to its parent.
*
*   Some of the properties are derived from the properties of children. For example, it is
* beneficial to know whether a node contains a selected node in its sub-tree and the size of the
* visible sub-tree.
*
*   All property derivation and links set-up is done with one traversal only over the children.
*
*
* HACKS
*   In order to make things efficient the recalculation of the derived fields is being avoided when
* possible. For instance, when setting an unrelated property, when an instance is created all
* of the derived fields are just copied over in the `options` instance even though they don't
* match the type definition of the options.
*/

var FileTreeNode = (function () {
  _createClass(FileTreeNode, null, [{
    key: 'childrenFromArray',

    /**
    * The children property is an OrderedMap instance keyed by child's name property.
    * This convenience function would create such OrderedMap instance from a plain JS Array
    * of FileTreeNode instances
    */
    value: function childrenFromArray(children) {
      return new (_immutable2 || _immutable()).default.OrderedMap(children.map(function (child) {
        return [child.name, child];
      }));
    }

    /**
    * The _derivedChange param is not for external use.
    */
  }]);

  function FileTreeNode(options, conf) {
    var _derivedChange = arguments.length <= 2 || arguments[2] === undefined ? true : arguments[2];

    _classCallCheck(this, FileTreeNode);

    this.parent = null;
    this.nextSibling = null;
    this.prevSibling = null;
    this.conf = conf;

    this._assignOptions(options);

    // Perf optimization:
    // when conf does not change the derived fields will be passed along with the options
    // it's not type-safe, but it's way more efficient than recalculate them
    if (_derivedChange) {
      var derived = this._buildDerivedFields(options.uri, options.rootUri, conf);
      this._assignDerived(derived);
    } else {
      this._assignDerived(options);
    }

    this._handleChildren();
  }

  /**
  * Sets the links from the children to this instance (their parent) and the links between the
  * siblings.
  *   Additionally calculates the properties derived from children and assigns them to this instance
  */

  _createClass(FileTreeNode, [{
    key: '_handleChildren',
    value: function _handleChildren() {
      var _this = this;

      var containsSelection = this.isSelected;
      var containsDragHover = this.isDragHovered;
      var containsTrackedNode = this.isTracked;
      var containsFilterMatches = this.matchesFilter;
      var shownChildrenBelow = this.shouldBeShown ? 1 : 0;
      var containsHidden = !this.shouldBeShown;

      var prevChild = null;
      this.children.forEach(function (c) {
        c.parent = _this;

        c.prevSibling = prevChild;
        if (prevChild != null) {
          prevChild.nextSibling = c;
        }
        prevChild = c;

        if (c.containsFilterMatches) {
          containsFilterMatches = true;
        }

        if (!containsSelection && c.containsSelection) {
          containsSelection = true;
        }

        if (!containsDragHover && c.containsDragHover) {
          containsDragHover = true;
        }

        if (!containsTrackedNode && c.containsTrackedNode) {
          containsTrackedNode = true;
        }

        if (_this.shouldBeShown && _this.isExpanded) {
          shownChildrenBelow += c.shownChildrenBelow;
        }

        if (!containsHidden && c.containsHidden) {
          containsHidden = true;
        }
      });
      if (prevChild != null) {
        prevChild.nextSibling = null;
      }

      this.containsSelection = containsSelection;
      this.containsDragHover = containsDragHover;
      this.containsTrackedNode = containsTrackedNode;
      this.containsFilterMatches = containsFilterMatches;
      this.shownChildrenBelow = shownChildrenBelow;
      this.containsHidden = containsHidden;
    }

    /**
    * Using object.assign() was proven to be less performant than direct named assignment
    * Since in heavy updates, nodes are created by the thousands we need to keep the creation
    * flow performant.
    */
  }, {
    key: '_assignOptions',
    value: function _assignOptions(options) {
      // Don't pass the 100 chars limit
      var o = options;
      var D = DEFAULT_OPTIONS;

      this.uri = o.uri;
      this.rootUri = o.rootUri;
      this.isExpanded = o.isExpanded !== undefined ? o.isExpanded : D.isExpanded;
      this.isSelected = o.isSelected !== undefined ? o.isSelected : D.isSelected;
      this.isFocused = o.isFocused !== undefined ? o.isFocused : D.isFocused;
      this.isDragHovered = o.isDragHovered !== undefined ? o.isDragHovered : D.isDragHovered;
      this.isLoading = o.isLoading !== undefined ? o.isLoading : D.isLoading;
      this.wasFetched = o.wasFetched !== undefined ? o.wasFetched : D.wasFetched;
      this.isTracked = o.isTracked !== undefined ? o.isTracked : D.isTracked;
      this.isCwd = o.isCwd !== undefined ? o.isCwd : D.isCwd;
      this.children = o.children !== undefined ? o.children : D.children;
      this.connectionTitle = o.connectionTitle !== undefined ? o.connectionTitle : D.connectionTitle;
      this.subscription = o.subscription !== undefined ? o.subscription : D.subscription;
      this.highlightedText = o.highlightedText !== undefined ? o.highlightedText : D.highlightedText;
      this.matchesFilter = o.matchesFilter !== undefined ? o.matchesFilter : D.matchesFilter;
    }

    /**
    * Using object.assign() was proven to be less performant than direct named assignment
    * Since in heavy updates, nodes are created by the thousands we need to keep the creation
    * flow performant.
    */
  }, {
    key: '_assignDerived',
    value: function _assignDerived(derived) {
      this.isRoot = derived.isRoot;
      this.name = derived.name;
      this.hashKey = derived.hashKey;
      this.relativePath = derived.relativePath;
      this.localPath = derived.localPath;
      this.isContainer = derived.isContainer;
      this.shouldBeShown = derived.shouldBeShown;
      this.shouldBeSoftened = derived.shouldBeSoftened;
      this.vcsStatusCode = derived.vcsStatusCode;
      this.repo = derived.repo;
      this.isIgnored = derived.isIgnored;
      this.checkedStatus = derived.checkedStatus;
    }

    /**
    * When modifying some of the properties a new instance needs to be created with all of the
    * properties identical except for those being modified. This method creates the baseline options
    * instance
    */
  }, {
    key: '_buildOptions',
    value: function _buildOptions() {
      return {
        uri: this.uri,
        rootUri: this.rootUri,
        isExpanded: this.isExpanded,
        isSelected: this.isSelected,
        isFocused: this.isFocused,
        isDragHovered: this.isDragHovered,
        isLoading: this.isLoading,
        wasFetched: this.wasFetched,
        isTracked: this.isTracked,
        isCwd: this.isCwd,
        children: this.children,
        connectionTitle: this.connectionTitle,
        subscription: this.subscription,
        highlightedText: this.highlightedText,
        matchesFilter: this.matchesFilter,

        // Derived fields
        isRoot: this.isRoot,
        name: this.name,
        hashKey: this.hashKey,
        relativePath: this.relativePath,
        localPath: this.localPath,
        isContainer: this.isContainer,
        shouldBeShown: this.shouldBeShown,
        shouldBeSoftened: this.shouldBeSoftened,
        vcsStatusCode: this.vcsStatusCode,
        repo: this.repo,
        isIgnored: this.isIgnored,
        checkedStatus: this.checkedStatus
      };
    }
  }, {
    key: 'setIsExpanded',
    value: function setIsExpanded(isExpanded) {
      return this.set({ isExpanded: isExpanded });
    }
  }, {
    key: 'setIsSelected',
    value: function setIsSelected(isSelected) {
      return this.set({ isSelected: isSelected });
    }
  }, {
    key: 'setIsFocused',
    value: function setIsFocused(isFocused) {
      return this.set({ isFocused: isFocused });
    }
  }, {
    key: 'setIsDragHovered',
    value: function setIsDragHovered(isDragHovered) {
      return this.set({ isDragHovered: isDragHovered });
    }
  }, {
    key: 'setIsLoading',
    value: function setIsLoading(isLoading) {
      return this.set({ isLoading: isLoading });
    }
  }, {
    key: 'setIsTracked',
    value: function setIsTracked(isTracked) {
      return this.set({ isTracked: isTracked });
    }
  }, {
    key: 'setIsCwd',
    value: function setIsCwd(isCwd) {
      return this.set({ isCwd: isCwd });
    }
  }, {
    key: 'setChildren',
    value: function setChildren(children) {
      return this.set({ children: children });
    }

    /**
    * Notifies the node about the change that happened in the configuration object. Will trigger
    * the complete reconstruction of the entire tree branch
    */
  }, {
    key: 'updateConf',
    value: function updateConf() {
      var _this2 = this;

      var children = this.children.map(function (c) {
        return c.updateConf(_this2.conf);
      });
      return this.newNode({ children: children }, this.conf);
    }

    /**
    * Used to modify several properties at once and skip unnecessary construction of intermediate
    * instances. For example:
    * const newNode = node.set({isExpanded: true, isSelected: false});
    */
  }, {
    key: 'set',
    value: function set(props) {
      if (this._propsAreTheSame(props)) {
        return this;
      }

      return this.newNode(props, this.conf, false);
    }

    /**
    * Performs an update of a tree branch. Receives two optional predicates
    *
    * The `prePredicate` is invoked at pre-descent. If the predicate returns a non-null
    * value it signifies that the handling of the sub-branch is complete and the descent to children
    * is not performed.
    *
    * The `postPredicate` is invoked on the way up. It has to return a non-null node, but it may
    * be the same instance as it was called with.
    */
  }, {
    key: 'setRecursive',
    value: function setRecursive(prePredicate) {
      var postPredicate = arguments.length <= 1 || arguments[1] === undefined ? function (n) {
        return n;
      } : arguments[1];

      if (prePredicate != null) {
        var newNode = prePredicate(this);
        if (newNode != null) {
          return postPredicate(newNode);
        }
      }

      var children = this.children.map(function (child) {
        return child.setRecursive(prePredicate, postPredicate);
      });
      return postPredicate(this.setChildren(children));
    }

    /**
    * Updates a single child in the map of children. The method only receives the new child instance
    * and the retrieval in from the map is performed by the child's name. This uses the fact
    * that children names (derived from their uris) are unmodifiable. Thus we won't ever have a
    * problem locating the value that we need to replace.
    */
  }, {
    key: 'updateChild',
    value: function updateChild(newChild) {
      var children = this.children.set(newChild.name, newChild);
      return this.set({ children: children });
    }

    /**
    * A hierarchical equivalent of forEach. The method receives two predicates
    * The first is invoked upon descent and with its return value controls whether need to traverse
    * deeper into the tree. True - descend, False - don't.
    */
  }, {
    key: 'traverse',
    value: function traverse(preCallback) {
      var postCallback = arguments.length <= 1 || arguments[1] === undefined ? function () {} : arguments[1];

      var descend = preCallback(this);

      if (descend) {
        this.children.forEach(function (child) {
          return child.traverse(preCallback, postCallback);
        });
      }

      postCallback(this);
    }

    /**
    * Looks for a node with the given URI in the sub branch - returns null if not found
    */
  }, {
    key: 'find',
    value: function find(uri) {
      var deepestFound = this.findDeepest(uri);

      if (deepestFound == null || deepestFound.uri !== uri) {
        return null;
      }

      return deepestFound;
    }

    /**
    * Looks for a node with the given URI in the sub branch - returns the deepest found ancesstor
    * of the node being looked for.
    * Returns null if the node can not belong to the sub-branch
    */
  }, {
    key: 'findDeepest',
    value: function findDeepest(uri) {
      if (!uri.startsWith(this.uri)) {
        return null;
      }

      if (uri === this.uri) {
        return this;
      }

      var childNamePath = (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.split((_nuclideRemoteUri2 || _nuclideRemoteUri()).default.relative(this.uri, uri));
      return this._findLastByNamePath(childNamePath);
    }

    /**
    * Finds the next node in the tree in the natural order - from top to to bottom as is displayed
    * in the file-tree panel, minus the indentation. Only the nodes that should be shown are returned.
    */
  }, {
    key: 'findNext',
    value: function findNext() {
      if (!this.shouldBeShown) {
        if (this.parent != null) {
          return this.parent.findNext();
        }

        return null;
      }

      if (this.shownChildrenBelow > 1) {
        return this.children.find(function (c) {
          return c.shouldBeShown;
        });
      }

      // Not really an alias, but an iterating reference
      // eslint-disable-next-line consistent-this
      var it = this;
      while (it != null) {
        var nextShownSibling = it.findNextShownSibling();
        if (nextShownSibling != null) {
          return nextShownSibling;
        }

        it = it.parent;
      }

      return null;
    }
  }, {
    key: 'findNextShownSibling',
    value: function findNextShownSibling() {
      var it = this.nextSibling;
      while (it != null && !it.shouldBeShown) {
        it = it.nextSibling;
      }

      return it;
    }

    /**
    * Finds the previous node in the tree in the natural order - from top to to bottom as is displayed
    * in the file-tree panel, minus the indentation. Only the nodes that should be shown are returned.
    */
  }, {
    key: 'findPrevious',
    value: function findPrevious() {
      if (!this.shouldBeShown) {
        if (this.parent != null) {
          return this.parent.findPrevious();
        }

        return null;
      }

      var prevShownSibling = this.findPrevShownSibling();
      if (prevShownSibling != null) {
        return prevShownSibling.findLastRecursiveChild();
      }

      return this.parent;
    }
  }, {
    key: 'findPrevShownSibling',
    value: function findPrevShownSibling() {
      var it = this.prevSibling;
      while (it != null && !it.shouldBeShown) {
        it = it.prevSibling;
      }

      return it;
    }

    /**
    * Returns the last shown descendant according to the natural tree order as is to be displayed by
    * the file-tree panel. (Last child of the last child of the last child...)
    * Or null, if none are found
    */
  }, {
    key: 'findLastRecursiveChild',
    value: function findLastRecursiveChild() {
      if (!this.isContainer || !this.isExpanded || this.children.isEmpty()) {
        return this;
      }

      var it = this.children.last();
      while (!it.shouldBeShown && it != null) {
        it = it.prevSibling;
      }

      if (it == null) {
        if (this.shouldBeShown) {
          return this;
        }
        return this.findPrevious();
      } else {
        return it.findLastRecursiveChild();
      }
    }
  }, {
    key: 'getDepth',
    value: function getDepth() {
      var it = this.parent;
      var depth = 0;
      while (it != null) {
        it = it.parent;
        depth++;
      }

      return depth;
    }
  }, {
    key: '_buildDerivedFields',
    value: function _buildDerivedFields(uri, rootUri, conf) {
      var isContainer = (0, (_FileTreeHelpers2 || _FileTreeHelpers()).isDirKey)(uri);
      var rootVcsStatuses = conf.vcsStatuses[rootUri] || {};
      var repo = conf.reposByRoot[rootUri];
      var isIgnored = this._deriveIsIgnored(uri, rootUri, repo, conf);
      var checkedStatus = this._deriveCheckedStatus(uri, isContainer, conf.editedWorkingSet);

      return {
        isRoot: uri === rootUri,
        name: (0, (_FileTreeHelpers2 || _FileTreeHelpers()).keyToName)(uri),
        hashKey: (0, (_FileTreeHelpers2 || _FileTreeHelpers()).buildHashKey)(uri),
        isContainer: isContainer,
        relativePath: uri.slice(rootUri.length),
        localPath: (0, (_FileTreeHelpers2 || _FileTreeHelpers()).keyToPath)((_nuclideRemoteUri2 || _nuclideRemoteUri()).default.isRemote(uri) ? (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.parse(uri).pathname : uri),
        isIgnored: isIgnored,
        shouldBeShown: this._deriveShouldBeShown(uri, rootUri, isContainer, repo, conf, isIgnored),
        shouldBeSoftened: this._deriveShouldBeSoftened(uri, isContainer, conf),
        vcsStatusCode: rootVcsStatuses[uri] || (_nuclideHgRepositoryBaseLibHgConstants2 || _nuclideHgRepositoryBaseLibHgConstants()).StatusCodeNumber.CLEAN,
        repo: repo,
        checkedStatus: checkedStatus
      };
    }
  }, {
    key: '_deriveCheckedStatus',
    value: function _deriveCheckedStatus(uri, isContainer, editedWorkingSet) {
      if (editedWorkingSet.isEmpty()) {
        return 'clear';
      }

      if (isContainer) {
        if (editedWorkingSet.containsFile(uri)) {
          return 'checked';
        } else if (editedWorkingSet.containsDir(uri)) {
          return 'partial';
        } else {
          return 'clear';
        }
      }

      return editedWorkingSet.containsFile(uri) ? 'checked' : 'clear';
    }
  }, {
    key: '_deriveShouldBeShown',
    value: function _deriveShouldBeShown(uri, rootUri, isContainer, repo, conf, isIgnored) {
      if (isIgnored && conf.excludeVcsIgnoredPaths) {
        return false;
      }

      if (conf.hideIgnoredNames && conf.ignoredPatterns.some(function (pattern) {
        return pattern.match(uri);
      })) {
        return false;
      }

      if (conf.isEditingWorkingSet) {
        return true;
      }

      if (isContainer) {
        return conf.workingSet.containsDir(uri) || !conf.openFilesWorkingSet.isEmpty() && conf.openFilesWorkingSet.containsDir(uri);
      } else {
        return conf.workingSet.containsFile(uri) || !conf.openFilesWorkingSet.isEmpty() && conf.openFilesWorkingSet.containsFile(uri);
      }
    }
  }, {
    key: '_deriveIsIgnored',
    value: function _deriveIsIgnored(uri, rootUri, repo, conf) {
      if (repo != null && repo.isProjectAtRoot() && repo.isPathIgnored(uri)) {
        return true;
      }

      return false;
    }
  }, {
    key: '_deriveShouldBeSoftened',
    value: function _deriveShouldBeSoftened(uri, isContainer, conf) {
      if (conf.isEditingWorkingSet) {
        return false;
      }

      if (conf.workingSet.isEmpty() || conf.openFilesWorkingSet.isEmpty()) {
        return false;
      }

      if (isContainer) {
        if (!conf.workingSet.containsDir(uri) && conf.openFilesWorkingSet.containsDir(uri)) {
          return true;
        }

        return false;
      } else {
        if (!conf.workingSet.containsFile(uri) && conf.openFilesWorkingSet.containsFile(uri)) {
          return true;
        }

        return false;
      }
    }
  }, {
    key: '_propsAreTheSame',
    value: function _propsAreTheSame(props) {
      if (props.isSelected !== undefined && this.isSelected !== props.isSelected) {
        return false;
      }
      if (props.isFocused !== undefined && this.isFocused !== props.isFocused) {
        return false;
      }
      if (props.isDragHovered !== undefined && this.isDragHovered !== props.isDragHovered) {
        return false;
      }
      if (props.isTracked !== undefined && this.isTracked !== props.isTracked) {
        return false;
      }
      if (props.isExpanded !== undefined && this.isExpanded !== props.isExpanded) {
        return false;
      }
      if (props.isLoading !== undefined && this.isLoading !== props.isLoading) {
        return false;
      }
      if (props.wasFetched !== undefined && this.wasFetched !== props.wasFetched) {
        return false;
      }
      if (props.isCwd !== undefined && this.isCwd !== props.isCwd) {
        return false;
      }
      if (props.subscription !== undefined && this.subscription !== props.subscription) {
        return false;
      }
      if (props.highlightedText !== undefined && this.highlightedText !== props.highlightedText) {
        return false;
      }
      if (props.matchesFilter !== undefined && this.matchesFilter !== props.matchesFilter) {
        return false;
      }

      if (props.children !== undefined && props.children !== this.children && !(_immutable2 || _immutable()).default.is(this.children, props.children)) {
        return false;
      }

      return true;
    }
  }, {
    key: 'newNode',
    value: function newNode(props, conf) {
      var derivedChange = arguments.length <= 2 || arguments[2] === undefined ? true : arguments[2];

      return new FileTreeNode(_extends({}, this._buildOptions(), props), conf, derivedChange);
    }
  }, {
    key: '_findLastByNamePath',
    value: function _findLastByNamePath(childNamePath) {
      if (childNamePath.length === 0) {
        return this;
      }

      var child = this.children.get(childNamePath[0]);
      if (child == null) {
        return this;
      }

      return child._findLastByNamePath(childNamePath.slice(1));
    }
  }]);

  return FileTreeNode;
})();

exports.FileTreeNode = FileTreeNode;

// Mutable properties - set when the node is assigned to its parent (and are immutable after)

// Derived

// Derived from children