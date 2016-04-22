Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _FileTreeHelpers = require('./FileTreeHelpers');

var _nuclideRemoteUri = require('../../nuclide-remote-uri');

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _nuclideHgRepositoryBaseLibHgConstants = require('../../nuclide-hg-repository-base/lib/hg-constants');

// Ideally the type here would be FileTreeChildNodeOptions & {rootUri},
// but flow doesn't handle it well

var DEFAULT_OPTIONS = {
  isExpanded: false,
  isSelected: false,
  isLoading: false,
  isCwd: false,
  isTracked: false,
  children: new _immutable2['default'].OrderedMap(),
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
*   An instance can either be created by calling the constructor which accepts multiple options and
* the configuration, or by calling a `createChild()` method. The createChild() inherits the
* configuration instance and many of the options from the instance it was created from.
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
*   Some of the properties are derived from the properties of children. For example when editing a
* Working set all ancestors of a selected node must have either partial or a complete selection.
* This is something done with the help of the children-derived fields. Additional example is the
* .containsSelection property - having it allows efficient selection removal from the entire tree
* or one of its branches.
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
      return new _immutable2['default'].OrderedMap(children.map(function (child) {
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
      var containsTrackedNode = this.isTracked;
      var containsFilterMatches = this.matchesFilter;
      var shownChildrenBelow = this.shouldBeShown ? 1 : 0;

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

        if (!containsTrackedNode && c.containsTrackedNode) {
          containsTrackedNode = true;
        }

        if (_this.shouldBeShown && _this.isExpanded) {
          shownChildrenBelow += c.shownChildrenBelow;
        }
      });
      if (prevChild != null) {
        prevChild.nextSibling = null;
      }

      this.containsSelection = containsSelection;
      this.containsTrackedNode = containsTrackedNode;
      this.containsFilterMatches = containsFilterMatches;
      this.shownChildrenBelow = shownChildrenBelow;
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
      this.isLoading = o.isLoading !== undefined ? o.isLoading : D.isLoading;
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
        isLoading: this.isLoading,
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
    * Creates a decendant node that inherits many of the properties (rootUri, repo, etc)
    * The created node does not have to be a direct decendant and moreover it is not assigned
    * automatically in any way to the list of current node children.
    */
  }, {
    key: 'createChild',
    value: function createChild(options) {
      return new FileTreeNode(_extends({}, this._buildOptions(), {
        isCwd: false,
        connectionTitle: '',
        children: new _immutable2['default'].OrderedMap()
      }, options), this.conf);
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

      var subUri = uri.slice(this.uri.length);
      var childNamePath = subUri.split(_path2['default'].sep).filter(function (part) {
        return part !== '';
      });
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

      if (this.isContainer && this.isExpanded && !this.children.isEmpty()) {
        return this.children.find(function (c) {
          return c.shouldBeShown;
        });
      }

      /* eslint-disable consistent-this */
      // Not really an alias, but an iterating reference
      var it = this;
      /* eslint-enable consistent-this */
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
      /* eslint-disable consistent-this */
      // Not really an alias, but an iterating reference
      var it = this.nextSibling;
      /* eslint-enable consistent-this */
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
      /* eslint-disable consistent-this */
      // Not really an alias, but an iterating reference
      var it = this.prevSibling;
      /* eslint-enable consistent-this */
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
    key: '_buildDerivedFields',
    value: function _buildDerivedFields(uri, rootUri, conf) {
      var isContainer = (0, _FileTreeHelpers.isDirKey)(uri);
      var rootVcsStatuses = conf.vcsStatuses[rootUri] || {};
      var repo = conf.reposByRoot[rootUri];
      var isIgnored = this._deriveIsIgnored(uri, rootUri, repo, conf);
      var checkedStatus = this._deriveCheckedStatus(uri, isContainer, conf.editedWorkingSet);

      return {
        isRoot: uri === rootUri,
        name: (0, _FileTreeHelpers.keyToName)(uri),
        hashKey: (0, _FileTreeHelpers.buildHashKey)(uri),
        isContainer: isContainer,
        relativePath: uri.slice(rootUri.length),
        localPath: (0, _FileTreeHelpers.keyToPath)((0, _nuclideRemoteUri.isRemote)(uri) ? (0, _nuclideRemoteUri.parse)(uri).pathname : uri),
        isIgnored: isIgnored,
        shouldBeShown: this._deriveShouldBeShown(uri, rootUri, isContainer, repo, conf, isIgnored),
        shouldBeSoftened: this._deriveShouldBeSoftened(uri, isContainer, conf),
        vcsStatusCode: rootVcsStatuses[uri] || _nuclideHgRepositoryBaseLibHgConstants.StatusCodeNumber.CLEAN,
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
      if (props.isTracked !== undefined && this.isTracked !== props.isTracked) {
        return false;
      }
      if (props.isExpanded !== undefined && this.isExpanded !== props.isExpanded) {
        return false;
      }
      if (props.isLoading !== undefined && this.isLoading !== props.isLoading) {
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

      if (props.children !== undefined && props.children !== this.children && !_immutable2['default'].is(this.children, props.children)) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkZpbGVUcmVlTm9kZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OzsrQkFZMkQsbUJBQW1COztnQ0FDaEQsMEJBQTBCOzt5QkFDbEMsV0FBVzs7OztvQkFDaEIsTUFBTTs7OztxREFNUSxtREFBbUQ7Ozs7O0FBNkNsRixJQUFNLGVBQTJDLEdBQUc7QUFDbEQsWUFBVSxFQUFFLEtBQUs7QUFDakIsWUFBVSxFQUFFLEtBQUs7QUFDakIsV0FBUyxFQUFFLEtBQUs7QUFDaEIsT0FBSyxFQUFFLEtBQUs7QUFDWixXQUFTLEVBQUUsS0FBSztBQUNoQixVQUFRLEVBQUUsSUFBSSx1QkFBVSxVQUFVLEVBQUU7QUFDcEMsaUJBQWUsRUFBRSxFQUFFO0FBQ25CLGNBQVksRUFBRSxJQUFJO0FBQ2xCLGlCQUFlLEVBQUUsRUFBRTtBQUNuQixlQUFhLEVBQUUsSUFBSTtDQUNwQixDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQTRFVyxZQUFZO2VBQVosWUFBWTs7Ozs7Ozs7V0E4Q0MsMkJBQ3RCLFFBQTZCLEVBQ2U7QUFDNUMsYUFBTyxJQUFJLHVCQUFVLFVBQVUsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFVBQUEsS0FBSztlQUFJLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUM7T0FBQSxDQUFDLENBQUMsQ0FBQztLQUM3RTs7Ozs7OztBQUtVLFdBdkRBLFlBQVksQ0F1RFgsT0FBNEIsRUFBRSxJQUFxQixFQUFrQztRQUFoQyxjQUF1Qix5REFBRyxJQUFJOzswQkF2RHBGLFlBQVk7O0FBd0RyQixRQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztBQUNuQixRQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztBQUN4QixRQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztBQUN4QixRQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FB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QUFDLENBQUM7QUFDbEQsVUFBSSxLQUFLLElBQUksSUFBSSxFQUFFO0FBQ2pCLGVBQU8sSUFBSSxDQUFDO09BQ2I7O0FBRUQsYUFBTyxLQUFLLENBQUMsbUJBQW1CLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQzFEOzs7U0E3bkJVLFlBQVkiLCJmaWxlIjoiRmlsZVRyZWVOb2RlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuXG5pbXBvcnQge2lzRGlyS2V5LCBrZXlUb05hbWUsIGtleVRvUGF0aCwgYnVpbGRIYXNoS2V5fSBmcm9tICcuL0ZpbGVUcmVlSGVscGVycyc7XG5pbXBvcnQge2lzUmVtb3RlLCBwYXJzZX0gZnJvbSAnLi4vLi4vbnVjbGlkZS1yZW1vdGUtdXJpJztcbmltcG9ydCBJbW11dGFibGUgZnJvbSAnaW1tdXRhYmxlJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuXG5pbXBvcnQgdHlwZSB7TnVjbGlkZVVyaX0gZnJvbSAnLi4vLi4vbnVjbGlkZS1yZW1vdGUtdXJpJztcbmltcG9ydCB0eXBlIHtTdG9yZUNvbmZpZ0RhdGEsIE5vZGVDaGVja2VkU3RhdHVzfSBmcm9tICcuL0ZpbGVUcmVlU3RvcmUnO1xuaW1wb3J0IHR5cGUge1N0YXR1c0NvZGVOdW1iZXJWYWx1ZX0gZnJvbSAnLi4vLi4vbnVjbGlkZS1oZy1yZXBvc2l0b3J5LWJhc2UvbGliL0hnU2VydmljZSc7XG5pbXBvcnQgdHlwZSB7V29ya2luZ1NldH0gZnJvbSAnLi4vLi4vbnVjbGlkZS13b3JraW5nLXNldHMnO1xuaW1wb3J0IHtTdGF0dXNDb2RlTnVtYmVyfSBmcm9tICcuLi8uLi9udWNsaWRlLWhnLXJlcG9zaXRvcnktYmFzZS9saWIvaGctY29uc3RhbnRzJztcblxuXG5leHBvcnQgdHlwZSBGaWxlVHJlZUNoaWxkTm9kZU9wdGlvbnMgPSB7XG4gIHVyaTogTnVjbGlkZVVyaTtcbiAgaXNFeHBhbmRlZD86IGJvb2xlYW47XG4gIGlzU2VsZWN0ZWQ/OiBib29sZWFuO1xuICBpc0xvYWRpbmc/OiBib29sZWFuO1xuICBpc0N3ZD86IGJvb2xlYW47XG4gIGlzVHJhY2tlZD86IGJvb2xlYW47XG4gIGNoaWxkcmVuPzogSW1tdXRhYmxlLk9yZGVyZWRNYXA8c3RyaW5nLCBGaWxlVHJlZU5vZGU+O1xuICBzdWJzY3JpcHRpb24/OiA/SURpc3Bvc2FibGU7XG59O1xuXG4vLyBJZGVhbGx5IHRoZSB0eXBlIGhlcmUgd291bGQgYmUgRmlsZVRyZWVDaGlsZE5vZGVPcHRpb25zICYge3Jvb3RVcml9LFxuLy8gYnV0IGZsb3cgZG9lc24ndCBoYW5kbGUgaXQgd2VsbFxuZXhwb3J0IHR5cGUgRmlsZVRyZWVOb2RlT3B0aW9ucyA9IHtcbiAgdXJpOiBOdWNsaWRlVXJpO1xuICByb290VXJpOiBOdWNsaWRlVXJpO1xuICBpc0V4cGFuZGVkPzogYm9vbGVhbjtcbiAgaXNTZWxlY3RlZD86IGJvb2xlYW47XG4gIGlzTG9hZGluZz86IGJvb2xlYW47XG4gIGlzQ3dkPzogYm9vbGVhbjtcbiAgaXNUcmFja2VkPzogYm9vbGVhbjtcbiAgY2hpbGRyZW4/OiBJbW11dGFibGUuT3JkZXJlZE1hcDxzdHJpbmcsIEZpbGVUcmVlTm9kZT47XG4gIGNvbm5lY3Rpb25UaXRsZT86IHN0cmluZztcbiAgY2hlY2tlZFN0YXR1cz86IE5vZGVDaGVja2VkU3RhdHVzO1xuICBzdWJzY3JpcHRpb24/OiA/SURpc3Bvc2FibGU7XG4gIGhpZ2hsaWdodGVkVGV4dD86IHN0cmluZztcbiAgbWF0Y2hlc0ZpbHRlcj86IGJvb2xlYW47XG59O1xuXG50eXBlIERlZmF1bHRGaWxlVHJlZU5vZGVPcHRpb25zID0ge1xuICBpc0V4cGFuZGVkOiBib29sZWFuO1xuICBpc1NlbGVjdGVkOiBib29sZWFuO1xuICBpc0xvYWRpbmc6IGJvb2xlYW47XG4gIGlzQ3dkOiBib29sZWFuO1xuICBpc1RyYWNrZWQ6IGJvb2xlYW47XG4gIGNoaWxkcmVuOiBJbW11dGFibGUuT3JkZXJlZE1hcDxzdHJpbmcsIEZpbGVUcmVlTm9kZT47XG4gIGNvbm5lY3Rpb25UaXRsZTogc3RyaW5nO1xuICBzdWJzY3JpcHRpb246ID9JRGlzcG9zYWJsZTtcbiAgaGlnaGxpZ2h0ZWRUZXh0OiBzdHJpbmc7XG4gIG1hdGNoZXNGaWx0ZXI6IGJvb2xlYW47XG59O1xuXG5jb25zdCBERUZBVUxUX09QVElPTlM6IERlZmF1bHRGaWxlVHJlZU5vZGVPcHRpb25zID0ge1xuICBpc0V4cGFuZGVkOiBmYWxzZSxcbiAgaXNTZWxlY3RlZDogZmFsc2UsXG4gIGlzTG9hZGluZzogZmFsc2UsXG4gIGlzQ3dkOiBmYWxzZSxcbiAgaXNUcmFja2VkOiBmYWxzZSxcbiAgY2hpbGRyZW46IG5ldyBJbW11dGFibGUuT3JkZXJlZE1hcCgpLFxuICBjb25uZWN0aW9uVGl0bGU6ICcnLFxuICBzdWJzY3JpcHRpb246IG51bGwsXG4gIGhpZ2hsaWdodGVkVGV4dDogJycsXG4gIG1hdGNoZXNGaWx0ZXI6IHRydWUsXG59O1xuXG5leHBvcnQgdHlwZSBJbW11dGFibGVOb2RlU2V0dGFibGVGaWVsZHMgPSB7XG4gIGlzRXhwYW5kZWQ/OiBib29sZWFuO1xuICBpc1NlbGVjdGVkPzogYm9vbGVhbjtcbiAgaXNMb2FkaW5nPzogYm9vbGVhbjtcbiAgaXNDd2Q/OiBib29sZWFuO1xuICBpc1RyYWNrZWQ/OiBib29sZWFuO1xuICBjaGlsZHJlbj86IEltbXV0YWJsZS5PcmRlcmVkTWFwPHN0cmluZywgRmlsZVRyZWVOb2RlPjtcbiAgc3Vic2NyaXB0aW9uPzogP0lEaXNwb3NhYmxlO1xuICBoaWdobGlnaHRlZFRleHQ/OiBzdHJpbmc7XG4gIG1hdGNoZXNGaWx0ZXI/OiBib29sZWFuO1xufTtcblxuLyoqXG4qIE9WRVJWSUVXXG4qICAgVGhlIEZpbGVUcmVlTm9kZSBjbGFzcyBpcyBhbG1vc3QgZW50aXJlbHkgaW1tdXRhYmxlLiBFeGNlcHQgZm9yIHRoZSBwYXJlbnQgYW5kIHRoZSBzaWJsaW5nXG4qIGxpbmtzIG5vIHByb3BlcnRpZXMgYXJlIHRvIGJlIHVwZGF0ZWQgYWZ0ZXIgdGhlIGNyZWF0aW9uLlxuKlxuKiAgIEFuIGluc3RhbmNlIGNhbiBlaXRoZXIgYmUgY3JlYXRlZCBieSBjYWxsaW5nIHRoZSBjb25zdHJ1Y3RvciB3aGljaCBhY2NlcHRzIG11bHRpcGxlIG9wdGlvbnMgYW5kXG4qIHRoZSBjb25maWd1cmF0aW9uLCBvciBieSBjYWxsaW5nIGEgYGNyZWF0ZUNoaWxkKClgIG1ldGhvZC4gVGhlIGNyZWF0ZUNoaWxkKCkgaW5oZXJpdHMgdGhlXG4qIGNvbmZpZ3VyYXRpb24gaW5zdGFuY2UgYW5kIG1hbnkgb2YgdGhlIG9wdGlvbnMgZnJvbSB0aGUgaW5zdGFuY2UgaXQgd2FzIGNyZWF0ZWQgZnJvbS5cbipcbiogICBUaGUgY2xhc3MgY29udGFpbnMgbXVsdGlwbGUgZGVyaXZlZCBmaWVsZHMuIFRoZSBkZXJpdmVkIGZpZWxkcyBhcmUgY2FsY3VsYXRlZCBmcm9tIHRoZSBvcHRpb25zLFxuKiBmcm9tIHRoZSBjb25maWd1cmF0aW9uIHZhbHVlcyBhbmQgZXZlbiBmcm9tIGNoaWVsZHJlbidzIHByb3BlcnRpZXMuIE9uY2UgY2FsY3VsYXRlZCB0aGUgcHJvcGVydGllc1xuKiBhcmUgaW1tdXRhYmxlLlxuKlxuKiAgIFNldHRpbmcgYW55IG9mIHRoZSBwcm9wZXJ0aWVzIChleGNlcHQgZm9yIHRoZSBhZm9yZW1lbnRpb25lZCBsaW5rcyB0byBwYXJlbnQgYW5kIHNpYmxpbmdzKSB3aWxsXG4qIGNyZWF0ZSBhIG5ldyBpbnN0YW5jZSBvZiB0aGUgY2xhc3MsIHdpdGggcmVxdWlyZWQgcHJvcGVydGllcyBzZXQuIElmLCBob3dldmVyLCB0aGUgc2V0IG9wZXJhdGlvblxuKiBpcyBhIG5vLW9wIChzdWNoIGlmIHNldHRpbmcgYSBwcm9wZXJ0eSB0byB0aGUgc2FtZSB2YWx1ZSBpdCBhbHJlYWR5IGhhcyksIG5ldyBpbnN0YW5jZSBjcmVhdGlvblxuKiBpcyBub3Qgc2tpcHBlZCBhbmQgc2FtZSBpbnN0YW5jZSBpcyByZXR1cm5lZCBpbnN0ZWFkLlxuKlxuKiAgIFdoZW4gcG9zc2libGUsIHRoZSBjbGFzc1xuKiBzdHJpdmVzIG5vdCB0byByZWNvbXB1dGUgdGhlIGRlcml2ZWQgZmllbGRzLCBidXQgcmV1c2VzIHRoZSBwcmV2aW91cyB2YWx1ZXMuXG4qXG4qXG4qIFRIRSBDT05GSUdVUkFUSU9OXG4qICAgSXMgdGhlIG9iamVjdCBwYXNzZWQgdG8gdGhlIGNvbnN0cnVjdG9yIGFuZCBjb25jZXB0dWFsbHkgc2hhcmVkIGFtb25nIGFsbFxuKiBpbnN0YW5jZXMgaW4gYSB0cmVlLiBTaG91bGQgYmUgdXNlZCBmb3IgcHJvcGVydGllcyB0aGF0IG1ha2Ugbm8gc2Vuc2UgdG8gYmUgb3duZWQgYnkgdGhlIHRyZWVcbiogZWxlbWVudHMsIHlldCBzdWNoIHRoYXQgYWZmZWN0IHRoZSB0cmVlLiBTdWNoIGFzIHRoZSBjb25maWd1cmF0aW9uIHdoZXRoZXIgdG8gdXNlIHRoZSBwcmVmaXhcbiogbmF2aWdhdGlvbiwgZm9yIGluc3RhbmNlLCBvciB0aGUgY3VycmVudGx5IGNvbmZpZ3VyZWQgV29ya2luZyBTZXQuXG4qIFRoZSBjb25maWd1cmF0aW9uIG9iamVjdCBzaG91bGQgYmUgdHJlYXRlZCBhcyBpbW11dGFibGUgYnkgaXRzIG93bmVyLiBXaGVuZXZlciBhIGNoYW5nZSBvY2N1cnNcbiogbWV0aG9kIGB1cGRhdGVDb25mKClgIGhhcyB0byBiZSBjYWxsZWQgb24gdGhlIHJvb3Qocykgb2YgdGhlIHRyZWUgdG8gbm90aWZ5IGFib3V0IHRoZSBjaGFuZ2UuXG4qIFRoaXMgY2FsbCB3b3VsZCB0cmlnZ2VyIGNvbXBsZXRlIHJlY29uc3RydWN0aW9uIG9mIHRoZSB0cmVlLCB0byByZWZsZWN0IHRoZSBwb3NzaWJseSBjaGFuZ2VkXG4qIGRlcml2ZWQgcHJvcGVydGllcy5cbiogVGhpcyBnaXZlcyBhbm90aGVyIHJlYXNvbiB0byB1c2UgdGhlIGNvbmZpZ3VyYXRpb24gb2JqZWN0IHNwYXJpbmdseSAtIGl0IGlzIGV4cGVuc2l2ZSB0byByZWJ1aWxkXG4qIHRoZSBlbnRpcmUgdHJlZS5cbipcbipcbiogQ0hJTERSRU4gSEFORExJTkdcbiogICBJbiBvcmRlciBmb3IgdGhlIHRyZWUgdHJhdmVyc2FsIGFuZCBtb2RpZmljYXRpb25zIHRvIGJlIGVmZmljaWVudCBvbmUgb2Z0ZW5cbiogbmVlZHMgdG8gZmluZCB0aGUgcGFyZW50IG9mIGEgbm9kZS4gUGFyZW50IHByb3BlcnR5LCBob3dldmVyLCBjYW4ndCBiZSBvbmUgb2YgdGhlIG5vZGUncyBpbW11dGFibGVcbiogZmllbGRzLCBvdGhlcndpc2UgaXQnZCBjcmVhdGUgY2lyY3VsYXIgcmVmZXJlbmNlcy4gVGhlcmVmb3JlIHRoZSBwYXJlbnQgcHJvcGVydHkgaXMgbmV2ZXIgZ2l2ZW5cbiogdG8gdGhlIG5vZGUncyBjb25zdHJ1Y3RvciwgYnV0IHJhdGhlciBzZXQgYnkgdGhlIHBhcmVudCBpdHNlbGYgd2hlbiB0aGUgbm9kZSBpcyBhc3NpZ25lZCB0byBpdC5cbiogVGhpcyBtZWFucyB0aGF0IHdlIG5lZWQgdG8gYXZvaWQgdGhlIHN0YXRlIHdoZW4gc2FtZSBub2RlIG5vZGUgaXMgY29udGFpbmVkIGluIHRoZSAuY2hpbGRyZW4gbWFwXG4qIG9mIHNldmVyYWwgb3RoZXIgbm9kZXMuIEFzIG9ubHkgdGhlIGxhdGVzdCBvbmUgaXQgd2FzIGFzc2lnbmVkIHRvIGlzIGNvbnNpZGVyZWQgaXRzIHBhcmVudCBmcm9tXG4qIHRoZSBub2RlJ3MgcGVyc3BlY3RpdmUuXG4qXG4qICAgSnVzdCBsaWtlIHRoZSBwYXJlbnQgcHJvcGVydHksIHNvbWUgb3BlcmF0aW9ucyByZXF1aXJlIGFuIGFiaWxpdHkgdG8gZmluZCBzaWJsaW5ncyBlYXNpbHkuXG4qIFRoZSBwcmV2aW91cyBhbmQgdGhlIG5leHQgc2libGluZyBwcm9wZXJ0aWVzIGFyZSB0b28gc2V0IHdoZW4gYSBjaGlsZCBpcyBhc3NpZ25lZCB0byBpdHMgcGFyZW50LlxuKlxuKiAgIFNvbWUgb2YgdGhlIHByb3BlcnRpZXMgYXJlIGRlcml2ZWQgZnJvbSB0aGUgcHJvcGVydGllcyBvZiBjaGlsZHJlbi4gRm9yIGV4YW1wbGUgd2hlbiBlZGl0aW5nIGFcbiogV29ya2luZyBzZXQgYWxsIGFuY2VzdG9ycyBvZiBhIHNlbGVjdGVkIG5vZGUgbXVzdCBoYXZlIGVpdGhlciBwYXJ0aWFsIG9yIGEgY29tcGxldGUgc2VsZWN0aW9uLlxuKiBUaGlzIGlzIHNvbWV0aGluZyBkb25lIHdpdGggdGhlIGhlbHAgb2YgdGhlIGNoaWxkcmVuLWRlcml2ZWQgZmllbGRzLiBBZGRpdGlvbmFsIGV4YW1wbGUgaXMgdGhlXG4qIC5jb250YWluc1NlbGVjdGlvbiBwcm9wZXJ0eSAtIGhhdmluZyBpdCBhbGxvd3MgZWZmaWNpZW50IHNlbGVjdGlvbiByZW1vdmFsIGZyb20gdGhlIGVudGlyZSB0cmVlXG4qIG9yIG9uZSBvZiBpdHMgYnJhbmNoZXMuXG4qXG4qICAgQWxsIHByb3BlcnR5IGRlcml2YXRpb24gYW5kIGxpbmtzIHNldC11cCBpcyBkb25lIHdpdGggb25lIHRyYXZlcnNhbCBvbmx5IG92ZXIgdGhlIGNoaWxkcmVuLlxuKlxuKlxuKiBIQUNLU1xuKiAgIEluIG9yZGVyIHRvIG1ha2UgdGhpbmdzIGVmZmljaWVudCB0aGUgcmVjYWxjdWxhdGlvbiBvZiB0aGUgZGVyaXZlZCBmaWVsZHMgaXMgYmVpbmcgYXZvaWRlZCB3aGVuXG4qIHBvc3NpYmxlLiBGb3IgaW5zdGFuY2UsIHdoZW4gc2V0dGluZyBhbiB1bnJlbGF0ZWQgcHJvcGVydHksIHdoZW4gYW4gaW5zdGFuY2UgaXMgY3JlYXRlZCBhbGxcbiogb2YgdGhlIGRlcml2ZWQgZmllbGRzIGFyZSBqdXN0IGNvcGllZCBvdmVyIGluIHRoZSBgb3B0aW9uc2AgaW5zdGFuY2UgZXZlbiB0aG91Z2ggdGhleSBkb24ndFxuKiBtYXRjaCB0aGUgdHlwZSBkZWZpbml0aW9uIG9mIHRoZSBvcHRpb25zLlxuKi9cbmV4cG9ydCBjbGFzcyBGaWxlVHJlZU5vZGUge1xuICAvLyBNdXRhYmxlIHByb3BlcnRpZXMgLSBzZXQgd2hlbiB0aGUgbm9kZSBpcyBhc3NpZ25lZCB0byBpdHMgcGFyZW50IChhbmQgYXJlIGltbXV0YWJsZSBhZnRlcilcbiAgcGFyZW50OiA/RmlsZVRyZWVOb2RlO1xuICBuZXh0U2libGluZzogP0ZpbGVUcmVlTm9kZTtcbiAgcHJldlNpYmxpbmc6ID9GaWxlVHJlZU5vZGU7XG5cbiAgY29uZjogU3RvcmVDb25maWdEYXRhO1xuXG4gIHVyaTogTnVjbGlkZVVyaTtcbiAgcm9vdFVyaTogTnVjbGlkZVVyaTtcbiAgaXNFeHBhbmRlZDogYm9vbGVhbjtcbiAgaXNTZWxlY3RlZDogYm9vbGVhbjtcbiAgaXNMb2FkaW5nOiBib29sZWFuO1xuICBpc1RyYWNrZWQ6IGJvb2xlYW47XG4gIGlzQ3dkOiBib29sZWFuO1xuICBjaGlsZHJlbjogSW1tdXRhYmxlLk9yZGVyZWRNYXA8c3RyaW5nLCBGaWxlVHJlZU5vZGU+O1xuICBjb25uZWN0aW9uVGl0bGU6IHN0cmluZztcbiAgc3Vic2NyaXB0aW9uOiA/SURpc3Bvc2FibGU7XG4gIGhpZ2hsaWdodGVkVGV4dDogc3RyaW5nO1xuICBtYXRjaGVzRmlsdGVyOiBib29sZWFuO1xuXG4gIC8vIERlcml2ZWRcbiAgaXNSb290OiBib29sZWFuO1xuICBuYW1lOiBzdHJpbmc7XG4gIGhhc2hLZXk6IHN0cmluZztcbiAgcmVsYXRpdmVQYXRoOiBzdHJpbmc7XG4gIGxvY2FsUGF0aDogc3RyaW5nO1xuICBpc0NvbnRhaW5lcjogYm9vbGVhbjtcbiAgc2hvdWxkQmVTaG93bjogYm9vbGVhbjtcbiAgc2hvdWxkQmVTb2Z0ZW5lZDogYm9vbGVhbjtcbiAgdmNzU3RhdHVzQ29kZTogU3RhdHVzQ29kZU51bWJlclZhbHVlO1xuICByZXBvOiA/YXRvbSRSZXBvc2l0b3J5O1xuICBpc0lnbm9yZWQ6IGJvb2xlYW47XG4gIGNoZWNrZWRTdGF0dXM6IE5vZGVDaGVja2VkU3RhdHVzO1xuXG4gIC8vIERlcml2ZWQgZnJvbSBjaGlsZHJlblxuICBjb250YWluc1NlbGVjdGlvbjogYm9vbGVhbjtcbiAgY29udGFpbnNUcmFja2VkTm9kZTogYm9vbGVhbjtcbiAgY29udGFpbnNGaWx0ZXJNYXRjaGVzOiBib29sZWFuO1xuICBzaG93bkNoaWxkcmVuQmVsb3c6IG51bWJlcjtcblxuICAvKipcbiAgKiBUaGUgY2hpbGRyZW4gcHJvcGVydHkgaXMgYW4gT3JkZXJlZE1hcCBpbnN0YW5jZSBrZXllZCBieSBjaGlsZCdzIG5hbWUgcHJvcGVydHkuXG4gICogVGhpcyBjb252ZW5pZW5jZSBmdW5jdGlvbiB3b3VsZCBjcmVhdGUgc3VjaCBPcmRlcmVkTWFwIGluc3RhbmNlIGZyb20gYSBwbGFpbiBKUyBBcnJheVxuICAqIG9mIEZpbGVUcmVlTm9kZSBpbnN0YW5jZXNcbiAgKi9cbiAgc3RhdGljIGNoaWxkcmVuRnJvbUFycmF5KFxuICAgIGNoaWxkcmVuOiBBcnJheTxGaWxlVHJlZU5vZGU+XG4gICk6IEltbXV0YWJsZS5PcmRlcmVkTWFwPHN0cmluZywgRmlsZVRyZWVOb2RlPiB7XG4gICAgcmV0dXJuIG5ldyBJbW11dGFibGUuT3JkZXJlZE1hcChjaGlsZHJlbi5tYXAoY2hpbGQgPT4gW2NoaWxkLm5hbWUsIGNoaWxkXSkpO1xuICB9XG5cbiAgLyoqXG4gICogVGhlIF9kZXJpdmVkQ2hhbmdlIHBhcmFtIGlzIG5vdCBmb3IgZXh0ZXJuYWwgdXNlLlxuICAqL1xuICBjb25zdHJ1Y3RvcihvcHRpb25zOiBGaWxlVHJlZU5vZGVPcHRpb25zLCBjb25mOiBTdG9yZUNvbmZpZ0RhdGEsIF9kZXJpdmVkQ2hhbmdlOiBib29sZWFuID0gdHJ1ZSkge1xuICAgIHRoaXMucGFyZW50ID0gbnVsbDtcbiAgICB0aGlzLm5leHRTaWJsaW5nID0gbnVsbDtcbiAgICB0aGlzLnByZXZTaWJsaW5nID0gbnVsbDtcbiAgICB0aGlzLmNvbmYgPSBjb25mO1xuXG4gICAgdGhpcy5fYXNzaWduT3B0aW9ucyhvcHRpb25zKTtcblxuICAgIC8vIFBlcmYgb3B0aW1pemF0aW9uOlxuICAgIC8vIHdoZW4gY29uZiBkb2VzIG5vdCBjaGFuZ2UgdGhlIGRlcml2ZWQgZmllbGRzIHdpbGwgYmUgcGFzc2VkIGFsb25nIHdpdGggdGhlIG9wdGlvbnNcbiAgICAvLyBpdCdzIG5vdCB0eXBlLXNhZmUsIGJ1dCBpdCdzIHdheSBtb3JlIGVmZmljaWVudCB0aGFuIHJlY2FsY3VsYXRlIHRoZW1cbiAgICBpZiAoX2Rlcml2ZWRDaGFuZ2UpIHtcbiAgICAgIGNvbnN0IGRlcml2ZWQgPSB0aGlzLl9idWlsZERlcml2ZWRGaWVsZHMob3B0aW9ucy51cmksIG9wdGlvbnMucm9vdFVyaSwgY29uZik7XG4gICAgICB0aGlzLl9hc3NpZ25EZXJpdmVkKGRlcml2ZWQpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9hc3NpZ25EZXJpdmVkKG9wdGlvbnMpO1xuICAgIH1cblxuICAgIHRoaXMuX2hhbmRsZUNoaWxkcmVuKCk7XG4gIH1cblxuICAvKipcbiAgKiBTZXRzIHRoZSBsaW5rcyBmcm9tIHRoZSBjaGlsZHJlbiB0byB0aGlzIGluc3RhbmNlICh0aGVpciBwYXJlbnQpIGFuZCB0aGUgbGlua3MgYmV0d2VlbiB0aGVcbiAgKiBzaWJsaW5ncy5cbiAgKiAgIEFkZGl0aW9uYWxseSBjYWxjdWxhdGVzIHRoZSBwcm9wZXJ0aWVzIGRlcml2ZWQgZnJvbSBjaGlsZHJlbiBhbmQgYXNzaWducyB0aGVtIHRvIHRoaXMgaW5zdGFuY2VcbiAgKi9cbiAgX2hhbmRsZUNoaWxkcmVuKCk6IHZvaWQge1xuICAgIGxldCBjb250YWluc1NlbGVjdGlvbiA9IHRoaXMuaXNTZWxlY3RlZDtcbiAgICBsZXQgY29udGFpbnNUcmFja2VkTm9kZSA9IHRoaXMuaXNUcmFja2VkO1xuICAgIGxldCBjb250YWluc0ZpbHRlck1hdGNoZXMgPSB0aGlzLm1hdGNoZXNGaWx0ZXI7XG4gICAgbGV0IHNob3duQ2hpbGRyZW5CZWxvdyA9IHRoaXMuc2hvdWxkQmVTaG93biA/IDEgOiAwO1xuXG4gICAgbGV0IHByZXZDaGlsZCA9IG51bGw7XG4gICAgdGhpcy5jaGlsZHJlbi5mb3JFYWNoKGMgPT4ge1xuICAgICAgYy5wYXJlbnQgPSB0aGlzO1xuXG4gICAgICBjLnByZXZTaWJsaW5nID0gcHJldkNoaWxkO1xuICAgICAgaWYgKHByZXZDaGlsZCAhPSBudWxsKSB7XG4gICAgICAgIHByZXZDaGlsZC5uZXh0U2libGluZyA9IGM7XG4gICAgICB9XG4gICAgICBwcmV2Q2hpbGQgPSBjO1xuXG4gICAgICBpZiAoYy5jb250YWluc0ZpbHRlck1hdGNoZXMpIHtcbiAgICAgICAgY29udGFpbnNGaWx0ZXJNYXRjaGVzID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKCFjb250YWluc1NlbGVjdGlvbiAmJiBjLmNvbnRhaW5zU2VsZWN0aW9uKSB7XG4gICAgICAgIGNvbnRhaW5zU2VsZWN0aW9uID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKCFjb250YWluc1RyYWNrZWROb2RlICYmIGMuY29udGFpbnNUcmFja2VkTm9kZSkge1xuICAgICAgICBjb250YWluc1RyYWNrZWROb2RlID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuc2hvdWxkQmVTaG93biAmJiB0aGlzLmlzRXhwYW5kZWQpIHtcbiAgICAgICAgc2hvd25DaGlsZHJlbkJlbG93ICs9IGMuc2hvd25DaGlsZHJlbkJlbG93O1xuICAgICAgfVxuICAgIH0pO1xuICAgIGlmIChwcmV2Q2hpbGQgIT0gbnVsbCkge1xuICAgICAgcHJldkNoaWxkLm5leHRTaWJsaW5nID0gbnVsbDtcbiAgICB9XG5cbiAgICB0aGlzLmNvbnRhaW5zU2VsZWN0aW9uID0gY29udGFpbnNTZWxlY3Rpb247XG4gICAgdGhpcy5jb250YWluc1RyYWNrZWROb2RlID0gY29udGFpbnNUcmFja2VkTm9kZTtcbiAgICB0aGlzLmNvbnRhaW5zRmlsdGVyTWF0Y2hlcyA9IGNvbnRhaW5zRmlsdGVyTWF0Y2hlcztcbiAgICB0aGlzLnNob3duQ2hpbGRyZW5CZWxvdyA9IHNob3duQ2hpbGRyZW5CZWxvdztcbiAgfVxuXG4gIC8qKlxuICAqIFVzaW5nIG9iamVjdC5hc3NpZ24oKSB3YXMgcHJvdmVuIHRvIGJlIGxlc3MgcGVyZm9ybWFudCB0aGFuIGRpcmVjdCBuYW1lZCBhc3NpZ25tZW50XG4gICogU2luY2UgaW4gaGVhdnkgdXBkYXRlcywgbm9kZXMgYXJlIGNyZWF0ZWQgYnkgdGhlIHRob3VzYW5kcyB3ZSBuZWVkIHRvIGtlZXAgdGhlIGNyZWF0aW9uXG4gICogZmxvdyBwZXJmb3JtYW50LlxuICAqL1xuICBfYXNzaWduT3B0aW9ucyhvcHRpb25zOiBPYmplY3QpOiB2b2lkIHtcbiAgICAvLyBEb24ndCBwYXNzIHRoZSAxMDAgY2hhcnMgbGltaXRcbiAgICBjb25zdCBvID0gb3B0aW9ucztcbiAgICBjb25zdCBEID0gREVGQVVMVF9PUFRJT05TO1xuXG4gICAgdGhpcy51cmkgPSBvLnVyaTtcbiAgICB0aGlzLnJvb3RVcmkgPSBvLnJvb3RVcmk7XG4gICAgdGhpcy5pc0V4cGFuZGVkID0gby5pc0V4cGFuZGVkICE9PSB1bmRlZmluZWQgPyBvLmlzRXhwYW5kZWQgOiBELmlzRXhwYW5kZWQ7XG4gICAgdGhpcy5pc1NlbGVjdGVkID0gby5pc1NlbGVjdGVkICE9PSB1bmRlZmluZWQgPyBvLmlzU2VsZWN0ZWQgOiBELmlzU2VsZWN0ZWQ7XG4gICAgdGhpcy5pc0xvYWRpbmcgPSBvLmlzTG9hZGluZyAhPT0gdW5kZWZpbmVkID8gby5pc0xvYWRpbmcgOiBELmlzTG9hZGluZztcbiAgICB0aGlzLmlzVHJhY2tlZCA9IG8uaXNUcmFja2VkICE9PSB1bmRlZmluZWQgPyBvLmlzVHJhY2tlZCA6IEQuaXNUcmFja2VkO1xuICAgIHRoaXMuaXNDd2QgPSBvLmlzQ3dkICE9PSB1bmRlZmluZWQgPyBvLmlzQ3dkIDogRC5pc0N3ZDtcbiAgICB0aGlzLmNoaWxkcmVuID0gby5jaGlsZHJlbiAhPT0gdW5kZWZpbmVkID8gby5jaGlsZHJlbiA6IEQuY2hpbGRyZW47XG4gICAgdGhpcy5jb25uZWN0aW9uVGl0bGUgPSBvLmNvbm5lY3Rpb25UaXRsZSAhPT0gdW5kZWZpbmVkID8gby5jb25uZWN0aW9uVGl0bGUgOiBELmNvbm5lY3Rpb25UaXRsZTtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbiA9IG8uc3Vic2NyaXB0aW9uICE9PSB1bmRlZmluZWQgPyBvLnN1YnNjcmlwdGlvbiA6IEQuc3Vic2NyaXB0aW9uO1xuICAgIHRoaXMuaGlnaGxpZ2h0ZWRUZXh0ID0gby5oaWdobGlnaHRlZFRleHQgIT09IHVuZGVmaW5lZCA/IG8uaGlnaGxpZ2h0ZWRUZXh0IDogRC5oaWdobGlnaHRlZFRleHQ7XG4gICAgdGhpcy5tYXRjaGVzRmlsdGVyID0gby5tYXRjaGVzRmlsdGVyICE9PSB1bmRlZmluZWQgPyBvLm1hdGNoZXNGaWx0ZXIgOiBELm1hdGNoZXNGaWx0ZXI7XG4gIH1cblxuICAvKipcbiAgKiBVc2luZyBvYmplY3QuYXNzaWduKCkgd2FzIHByb3ZlbiB0byBiZSBsZXNzIHBlcmZvcm1hbnQgdGhhbiBkaXJlY3QgbmFtZWQgYXNzaWdubWVudFxuICAqIFNpbmNlIGluIGhlYXZ5IHVwZGF0ZXMsIG5vZGVzIGFyZSBjcmVhdGVkIGJ5IHRoZSB0aG91c2FuZHMgd2UgbmVlZCB0byBrZWVwIHRoZSBjcmVhdGlvblxuICAqIGZsb3cgcGVyZm9ybWFudC5cbiAgKi9cbiAgX2Fzc2lnbkRlcml2ZWQoZGVyaXZlZDogT2JqZWN0KTogdm9pZCB7XG4gICAgdGhpcy5pc1Jvb3QgPSBkZXJpdmVkLmlzUm9vdDtcbiAgICB0aGlzLm5hbWUgPSBkZXJpdmVkLm5hbWU7XG4gICAgdGhpcy5oYXNoS2V5ID0gZGVyaXZlZC5oYXNoS2V5O1xuICAgIHRoaXMucmVsYXRpdmVQYXRoID0gZGVyaXZlZC5yZWxhdGl2ZVBhdGg7XG4gICAgdGhpcy5sb2NhbFBhdGggPSBkZXJpdmVkLmxvY2FsUGF0aDtcbiAgICB0aGlzLmlzQ29udGFpbmVyID0gZGVyaXZlZC5pc0NvbnRhaW5lcjtcbiAgICB0aGlzLnNob3VsZEJlU2hvd24gPSBkZXJpdmVkLnNob3VsZEJlU2hvd247XG4gICAgdGhpcy5zaG91bGRCZVNvZnRlbmVkID0gZGVyaXZlZC5zaG91bGRCZVNvZnRlbmVkO1xuICAgIHRoaXMudmNzU3RhdHVzQ29kZSA9IGRlcml2ZWQudmNzU3RhdHVzQ29kZTtcbiAgICB0aGlzLnJlcG8gPSBkZXJpdmVkLnJlcG87XG4gICAgdGhpcy5pc0lnbm9yZWQgPSBkZXJpdmVkLmlzSWdub3JlZDtcbiAgICB0aGlzLmNoZWNrZWRTdGF0dXMgPSBkZXJpdmVkLmNoZWNrZWRTdGF0dXM7XG4gIH1cblxuICAvKipcbiAgKiBXaGVuIG1vZGlmeWluZyBzb21lIG9mIHRoZSBwcm9wZXJ0aWVzIGEgbmV3IGluc3RhbmNlIG5lZWRzIHRvIGJlIGNyZWF0ZWQgd2l0aCBhbGwgb2YgdGhlXG4gICogcHJvcGVydGllcyBpZGVudGljYWwgZXhjZXB0IGZvciB0aG9zZSBiZWluZyBtb2RpZmllZC4gVGhpcyBtZXRob2QgY3JlYXRlcyB0aGUgYmFzZWxpbmUgb3B0aW9uc1xuICAqIGluc3RhbmNlXG4gICovXG4gIF9idWlsZE9wdGlvbnMoKTogRmlsZVRyZWVOb2RlT3B0aW9ucyB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHVyaTogdGhpcy51cmksXG4gICAgICByb290VXJpOiB0aGlzLnJvb3RVcmksXG4gICAgICBpc0V4cGFuZGVkOiB0aGlzLmlzRXhwYW5kZWQsXG4gICAgICBpc1NlbGVjdGVkOiB0aGlzLmlzU2VsZWN0ZWQsXG4gICAgICBpc0xvYWRpbmc6IHRoaXMuaXNMb2FkaW5nLFxuICAgICAgaXNUcmFja2VkOiB0aGlzLmlzVHJhY2tlZCxcbiAgICAgIGlzQ3dkOiB0aGlzLmlzQ3dkLFxuICAgICAgY2hpbGRyZW46IHRoaXMuY2hpbGRyZW4sXG4gICAgICBjb25uZWN0aW9uVGl0bGU6IHRoaXMuY29ubmVjdGlvblRpdGxlLFxuICAgICAgc3Vic2NyaXB0aW9uOiB0aGlzLnN1YnNjcmlwdGlvbixcbiAgICAgIGhpZ2hsaWdodGVkVGV4dDogdGhpcy5oaWdobGlnaHRlZFRleHQsXG4gICAgICBtYXRjaGVzRmlsdGVyOiB0aGlzLm1hdGNoZXNGaWx0ZXIsXG5cbiAgICAgIC8vIERlcml2ZWQgZmllbGRzXG4gICAgICBpc1Jvb3Q6IHRoaXMuaXNSb290LFxuICAgICAgbmFtZTogdGhpcy5uYW1lLFxuICAgICAgaGFzaEtleTogdGhpcy5oYXNoS2V5LFxuICAgICAgcmVsYXRpdmVQYXRoOiB0aGlzLnJlbGF0aXZlUGF0aCxcbiAgICAgIGxvY2FsUGF0aDogdGhpcy5sb2NhbFBhdGgsXG4gICAgICBpc0NvbnRhaW5lcjogdGhpcy5pc0NvbnRhaW5lcixcbiAgICAgIHNob3VsZEJlU2hvd246IHRoaXMuc2hvdWxkQmVTaG93bixcbiAgICAgIHNob3VsZEJlU29mdGVuZWQ6IHRoaXMuc2hvdWxkQmVTb2Z0ZW5lZCxcbiAgICAgIHZjc1N0YXR1c0NvZGU6IHRoaXMudmNzU3RhdHVzQ29kZSxcbiAgICAgIGlzSWdub3JlZDogdGhpcy5pc0lnbm9yZWQsXG4gICAgICBjaGVja2VkU3RhdHVzOiB0aGlzLmNoZWNrZWRTdGF0dXMsXG4gICAgfTtcbiAgfVxuXG4gIHNldElzRXhwYW5kZWQoaXNFeHBhbmRlZDogYm9vbGVhbik6IEZpbGVUcmVlTm9kZSB7XG4gICAgcmV0dXJuIHRoaXMuc2V0KHtpc0V4cGFuZGVkfSk7XG4gIH1cblxuICBzZXRJc1NlbGVjdGVkKGlzU2VsZWN0ZWQ6IGJvb2xlYW4pOiBGaWxlVHJlZU5vZGUge1xuICAgIHJldHVybiB0aGlzLnNldCh7aXNTZWxlY3RlZH0pO1xuICB9XG5cbiAgc2V0SXNMb2FkaW5nKGlzTG9hZGluZzogYm9vbGVhbik6IEZpbGVUcmVlTm9kZSB7XG4gICAgcmV0dXJuIHRoaXMuc2V0KHtpc0xvYWRpbmd9KTtcbiAgfVxuXG4gIHNldElzVHJhY2tlZChpc1RyYWNrZWQ6IGJvb2xlYW4pOiBGaWxlVHJlZU5vZGUge1xuICAgIHJldHVybiB0aGlzLnNldCh7aXNUcmFja2VkfSk7XG4gIH1cblxuICBzZXRJc0N3ZChpc0N3ZDogYm9vbGVhbik6IEZpbGVUcmVlTm9kZSB7XG4gICAgcmV0dXJuIHRoaXMuc2V0KHtpc0N3ZH0pO1xuICB9XG5cbiAgc2V0Q2hpbGRyZW4oY2hpbGRyZW46IEltbXV0YWJsZS5MaXN0PEZpbGVUcmVlTm9kZT4pOiBGaWxlVHJlZU5vZGUge1xuICAgIHJldHVybiB0aGlzLnNldCh7Y2hpbGRyZW59KTtcbiAgfVxuXG4gIC8qKlxuICAqIE5vdGlmaWVzIHRoZSBub2RlIGFib3V0IHRoZSBjaGFuZ2UgdGhhdCBoYXBwZW5lZCBpbiB0aGUgY29uZmlndXJhdGlvbiBvYmplY3QuIFdpbGwgdHJpZ2dlclxuICAqIHRoZSBjb21wbGV0ZSByZWNvbnN0cnVjdGlvbiBvZiB0aGUgZW50aXJlIHRyZWUgYnJhbmNoXG4gICovXG4gIHVwZGF0ZUNvbmYoKTogRmlsZVRyZWVOb2RlIHtcbiAgICBjb25zdCBjaGlsZHJlbiA9IHRoaXMuY2hpbGRyZW4ubWFwKGMgPT4gYy51cGRhdGVDb25mKHRoaXMuY29uZikpO1xuICAgIHJldHVybiB0aGlzLm5ld05vZGUoe2NoaWxkcmVufSwgdGhpcy5jb25mKTtcbiAgfVxuXG4gIC8qKlxuICAqIENyZWF0ZXMgYSBkZWNlbmRhbnQgbm9kZSB0aGF0IGluaGVyaXRzIG1hbnkgb2YgdGhlIHByb3BlcnRpZXMgKHJvb3RVcmksIHJlcG8sIGV0YylcbiAgKiBUaGUgY3JlYXRlZCBub2RlIGRvZXMgbm90IGhhdmUgdG8gYmUgYSBkaXJlY3QgZGVjZW5kYW50IGFuZCBtb3Jlb3ZlciBpdCBpcyBub3QgYXNzaWduZWRcbiAgKiBhdXRvbWF0aWNhbGx5IGluIGFueSB3YXkgdG8gdGhlIGxpc3Qgb2YgY3VycmVudCBub2RlIGNoaWxkcmVuLlxuICAqL1xuICBjcmVhdGVDaGlsZChvcHRpb25zOiBGaWxlVHJlZUNoaWxkTm9kZU9wdGlvbnMpOiBGaWxlVHJlZU5vZGUge1xuICAgIHJldHVybiBuZXcgRmlsZVRyZWVOb2RlKHtcbiAgICAgIC4uLnRoaXMuX2J1aWxkT3B0aW9ucygpLFxuICAgICAgaXNDd2Q6IGZhbHNlLFxuICAgICAgY29ubmVjdGlvblRpdGxlOiAnJyxcbiAgICAgIGNoaWxkcmVuOiBuZXcgSW1tdXRhYmxlLk9yZGVyZWRNYXAoKSxcbiAgICAgIC4uLm9wdGlvbnMsXG4gICAgfSxcbiAgICB0aGlzLmNvbmYsXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAqIFVzZWQgdG8gbW9kaWZ5IHNldmVyYWwgcHJvcGVydGllcyBhdCBvbmNlIGFuZCBza2lwIHVubmVjZXNzYXJ5IGNvbnN0cnVjdGlvbiBvZiBpbnRlcm1lZGlhdGVcbiAgKiBpbnN0YW5jZXMuIEZvciBleGFtcGxlOlxuICAqIGNvbnN0IG5ld05vZGUgPSBub2RlLnNldCh7aXNFeHBhbmRlZDogdHJ1ZSwgaXNTZWxlY3RlZDogZmFsc2V9KTtcbiAgKi9cbiAgc2V0KHByb3BzOiBJbW11dGFibGVOb2RlU2V0dGFibGVGaWVsZHMpOiBGaWxlVHJlZU5vZGUge1xuICAgIGlmICh0aGlzLl9wcm9wc0FyZVRoZVNhbWUocHJvcHMpKSB7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5uZXdOb2RlKHByb3BzLCB0aGlzLmNvbmYsIGZhbHNlKTtcbiAgfVxuXG4gIC8qKlxuICAqIFBlcmZvcm1zIGFuIHVwZGF0ZSBvZiBhIHRyZWUgYnJhbmNoLiBSZWNlaXZlcyB0d28gb3B0aW9uYWwgcHJlZGljYXRlc1xuICAqXG4gICogVGhlIGBwcmVQcmVkaWNhdGVgIGlzIGludm9rZWQgYXQgcHJlLWRlc2NlbnQuIElmIHRoZSBwcmVkaWNhdGUgcmV0dXJucyBhIG5vbi1udWxsXG4gICogdmFsdWUgaXQgc2lnbmlmaWVzIHRoYXQgdGhlIGhhbmRsaW5nIG9mIHRoZSBzdWItYnJhbmNoIGlzIGNvbXBsZXRlIGFuZCB0aGUgZGVzY2VudCB0byBjaGlsZHJlblxuICAqIGlzIG5vdCBwZXJmb3JtZWQuXG4gICpcbiAgKiBUaGUgYHBvc3RQcmVkaWNhdGVgIGlzIGludm9rZWQgb24gdGhlIHdheSB1cC4gSXQgaGFzIHRvIHJldHVybiBhIG5vbi1udWxsIG5vZGUsIGJ1dCBpdCBtYXlcbiAgKiBiZSB0aGUgc2FtZSBpbnN0YW5jZSBhcyBpdCB3YXMgY2FsbGVkIHdpdGguXG4gICovXG4gIHNldFJlY3Vyc2l2ZShcbiAgICBwcmVQcmVkaWNhdGU6ID8oKG5vZGU6IEZpbGVUcmVlTm9kZSkgPT4gP0ZpbGVUcmVlTm9kZSksXG4gICAgcG9zdFByZWRpY2F0ZTogKChub2RlOiBGaWxlVHJlZU5vZGUpID0+IEZpbGVUcmVlTm9kZSkgPSBuID0+IG4sXG4gICk6IEZpbGVUcmVlTm9kZSB7XG4gICAgaWYgKHByZVByZWRpY2F0ZSAhPSBudWxsKSB7XG4gICAgICBjb25zdCBuZXdOb2RlID0gcHJlUHJlZGljYXRlKHRoaXMpO1xuICAgICAgaWYgKG5ld05vZGUgIT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gcG9zdFByZWRpY2F0ZShuZXdOb2RlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBjaGlsZHJlbiA9IHRoaXMuY2hpbGRyZW4ubWFwKGNoaWxkID0+IGNoaWxkLnNldFJlY3Vyc2l2ZShwcmVQcmVkaWNhdGUsIHBvc3RQcmVkaWNhdGUpKTtcbiAgICByZXR1cm4gcG9zdFByZWRpY2F0ZSh0aGlzLnNldENoaWxkcmVuKGNoaWxkcmVuKSk7XG4gIH1cblxuICAvKipcbiAgKiBVcGRhdGVzIGEgc2luZ2xlIGNoaWxkIGluIHRoZSBtYXAgb2YgY2hpbGRyZW4uIFRoZSBtZXRob2Qgb25seSByZWNlaXZlcyB0aGUgbmV3IGNoaWxkIGluc3RhbmNlXG4gICogYW5kIHRoZSByZXRyaWV2YWwgaW4gZnJvbSB0aGUgbWFwIGlzIHBlcmZvcm1lZCBieSB0aGUgY2hpbGQncyBuYW1lLiBUaGlzIHVzZXMgdGhlIGZhY3RcbiAgKiB0aGF0IGNoaWxkcmVuIG5hbWVzIChkZXJpdmVkIGZyb20gdGhlaXIgdXJpcykgYXJlIHVubW9kaWZpYWJsZS4gVGh1cyB3ZSB3b24ndCBldmVyIGhhdmUgYVxuICAqIHByb2JsZW0gbG9jYXRpbmcgdGhlIHZhbHVlIHRoYXQgd2UgbmVlZCB0byByZXBsYWNlLlxuICAqL1xuICB1cGRhdGVDaGlsZChuZXdDaGlsZDogRmlsZVRyZWVOb2RlKTogRmlsZVRyZWVOb2RlIHtcbiAgICBjb25zdCBjaGlsZHJlbiA9IHRoaXMuY2hpbGRyZW4uc2V0KG5ld0NoaWxkLm5hbWUsIG5ld0NoaWxkKTtcbiAgICByZXR1cm4gdGhpcy5zZXQoe2NoaWxkcmVufSk7XG4gIH1cblxuICAvKipcbiAgKiBBIGhpZXJhcmNoaWNhbCBlcXVpdmFsZW50IG9mIGZvckVhY2guIFRoZSBtZXRob2QgcmVjZWl2ZXMgdHdvIHByZWRpY2F0ZXNcbiAgKiBUaGUgZmlyc3QgaXMgaW52b2tlZCB1cG9uIGRlc2NlbnQgYW5kIHdpdGggaXRzIHJldHVybiB2YWx1ZSBjb250cm9scyB3aGV0aGVyIG5lZWQgdG8gdHJhdmVyc2VcbiAgKiBkZWVwZXIgaW50byB0aGUgdHJlZS4gVHJ1ZSAtIGRlc2NlbmQsIEZhbHNlIC0gZG9uJ3QuXG4gICovXG4gIHRyYXZlcnNlKFxuICAgIHByZUNhbGxiYWNrOiAobm9kZTogRmlsZVRyZWVOb2RlKSA9PiBib29sZWFuLFxuICAgIHBvc3RDYWxsYmFjazogKG5vZGU6IEZpbGVUcmVlTm9kZSkgPT4gdm9pZCA9ICgoKSA9PiB7fSksXG4gICk6IHZvaWQge1xuICAgIGNvbnN0IGRlc2NlbmQgPSBwcmVDYWxsYmFjayh0aGlzKTtcblxuICAgIGlmIChkZXNjZW5kKSB7XG4gICAgICB0aGlzLmNoaWxkcmVuLmZvckVhY2goY2hpbGQgPT4gY2hpbGQudHJhdmVyc2UocHJlQ2FsbGJhY2ssIHBvc3RDYWxsYmFjaykpO1xuICAgIH1cblxuICAgIHBvc3RDYWxsYmFjayh0aGlzKTtcbiAgfVxuXG4gIC8qKlxuICAqIExvb2tzIGZvciBhIG5vZGUgd2l0aCB0aGUgZ2l2ZW4gVVJJIGluIHRoZSBzdWIgYnJhbmNoIC0gcmV0dXJucyBudWxsIGlmIG5vdCBmb3VuZFxuICAqL1xuICBmaW5kKHVyaTogTnVjbGlkZVVyaSk6ID9GaWxlVHJlZU5vZGUge1xuICAgIGNvbnN0IGRlZXBlc3RGb3VuZCA9IHRoaXMuZmluZERlZXBlc3QodXJpKTtcblxuICAgIGlmIChkZWVwZXN0Rm91bmQgPT0gbnVsbCB8fCBkZWVwZXN0Rm91bmQudXJpICE9PSB1cmkpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHJldHVybiBkZWVwZXN0Rm91bmQ7XG4gIH1cblxuICAvKipcbiAgKiBMb29rcyBmb3IgYSBub2RlIHdpdGggdGhlIGdpdmVuIFVSSSBpbiB0aGUgc3ViIGJyYW5jaCAtIHJldHVybnMgdGhlIGRlZXBlc3QgZm91bmQgYW5jZXNzdG9yXG4gICogb2YgdGhlIG5vZGUgYmVpbmcgbG9va2VkIGZvci5cbiAgKiBSZXR1cm5zIG51bGwgaWYgdGhlIG5vZGUgY2FuIG5vdCBiZWxvbmcgdG8gdGhlIHN1Yi1icmFuY2hcbiAgKi9cbiAgZmluZERlZXBlc3QodXJpOiBOdWNsaWRlVXJpKTogP0ZpbGVUcmVlTm9kZSB7XG4gICAgaWYgKCF1cmkuc3RhcnRzV2l0aCh0aGlzLnVyaSkpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGlmICh1cmkgPT09IHRoaXMudXJpKSB7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBjb25zdCBzdWJVcmkgPSB1cmkuc2xpY2UodGhpcy51cmkubGVuZ3RoKTtcbiAgICBjb25zdCBjaGlsZE5hbWVQYXRoID0gc3ViVXJpLnNwbGl0KHBhdGguc2VwKS5maWx0ZXIocGFydCA9PiBwYXJ0ICE9PSAnJyk7XG4gICAgcmV0dXJuIHRoaXMuX2ZpbmRMYXN0QnlOYW1lUGF0aChjaGlsZE5hbWVQYXRoKTtcbiAgfVxuXG4gIC8qKlxuICAqIEZpbmRzIHRoZSBuZXh0IG5vZGUgaW4gdGhlIHRyZWUgaW4gdGhlIG5hdHVyYWwgb3JkZXIgLSBmcm9tIHRvcCB0byB0byBib3R0b20gYXMgaXMgZGlzcGxheWVkXG4gICogaW4gdGhlIGZpbGUtdHJlZSBwYW5lbCwgbWludXMgdGhlIGluZGVudGF0aW9uLiBPbmx5IHRoZSBub2RlcyB0aGF0IHNob3VsZCBiZSBzaG93biBhcmUgcmV0dXJuZWQuXG4gICovXG4gIGZpbmROZXh0KCk6ID9GaWxlVHJlZU5vZGUge1xuICAgIGlmICghdGhpcy5zaG91bGRCZVNob3duKSB7XG4gICAgICBpZiAodGhpcy5wYXJlbnQgIT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJlbnQuZmluZE5leHQoKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuaXNDb250YWluZXIgJiYgdGhpcy5pc0V4cGFuZGVkICYmICF0aGlzLmNoaWxkcmVuLmlzRW1wdHkoKSkge1xuICAgICAgcmV0dXJuIHRoaXMuY2hpbGRyZW4uZmluZChjID0+IGMuc2hvdWxkQmVTaG93bik7XG4gICAgfVxuXG4gICAgLyogZXNsaW50LWRpc2FibGUgY29uc2lzdGVudC10aGlzICovXG4gICAgLy8gTm90IHJlYWxseSBhbiBhbGlhcywgYnV0IGFuIGl0ZXJhdGluZyByZWZlcmVuY2VcbiAgICBsZXQgaXQgPSB0aGlzO1xuICAgIC8qIGVzbGludC1lbmFibGUgY29uc2lzdGVudC10aGlzICovXG4gICAgd2hpbGUgKGl0ICE9IG51bGwpIHtcbiAgICAgIGNvbnN0IG5leHRTaG93blNpYmxpbmcgPSBpdC5maW5kTmV4dFNob3duU2libGluZygpO1xuICAgICAgaWYgKG5leHRTaG93blNpYmxpbmcgIT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gbmV4dFNob3duU2libGluZztcbiAgICAgIH1cblxuICAgICAgaXQgPSBpdC5wYXJlbnQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBmaW5kTmV4dFNob3duU2libGluZygpOiA/RmlsZVRyZWVOb2RlIHtcbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBjb25zaXN0ZW50LXRoaXMgKi9cbiAgICAvLyBOb3QgcmVhbGx5IGFuIGFsaWFzLCBidXQgYW4gaXRlcmF0aW5nIHJlZmVyZW5jZVxuICAgIGxldCBpdCA9IHRoaXMubmV4dFNpYmxpbmc7XG4gICAgLyogZXNsaW50LWVuYWJsZSBjb25zaXN0ZW50LXRoaXMgKi9cbiAgICB3aGlsZSAoaXQgIT0gbnVsbCAmJiAhaXQuc2hvdWxkQmVTaG93bikge1xuICAgICAgaXQgPSBpdC5uZXh0U2libGluZztcbiAgICB9XG5cbiAgICByZXR1cm4gaXQ7XG4gIH1cblxuICAvKipcbiAgKiBGaW5kcyB0aGUgcHJldmlvdXMgbm9kZSBpbiB0aGUgdHJlZSBpbiB0aGUgbmF0dXJhbCBvcmRlciAtIGZyb20gdG9wIHRvIHRvIGJvdHRvbSBhcyBpcyBkaXNwbGF5ZWRcbiAgKiBpbiB0aGUgZmlsZS10cmVlIHBhbmVsLCBtaW51cyB0aGUgaW5kZW50YXRpb24uIE9ubHkgdGhlIG5vZGVzIHRoYXQgc2hvdWxkIGJlIHNob3duIGFyZSByZXR1cm5lZC5cbiAgKi9cbiAgZmluZFByZXZpb3VzKCk6ID9GaWxlVHJlZU5vZGUge1xuICAgIGlmICghdGhpcy5zaG91bGRCZVNob3duKSB7XG4gICAgICBpZiAodGhpcy5wYXJlbnQgIT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJlbnQuZmluZFByZXZpb3VzKCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IHByZXZTaG93blNpYmxpbmcgPSB0aGlzLmZpbmRQcmV2U2hvd25TaWJsaW5nKCk7XG4gICAgaWYgKHByZXZTaG93blNpYmxpbmcgIT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHByZXZTaG93blNpYmxpbmcuZmluZExhc3RSZWN1cnNpdmVDaGlsZCgpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLnBhcmVudDtcbiAgfVxuXG4gIGZpbmRQcmV2U2hvd25TaWJsaW5nKCk6ID9GaWxlVHJlZU5vZGUge1xuICAgIC8qIGVzbGludC1kaXNhYmxlIGNvbnNpc3RlbnQtdGhpcyAqL1xuICAgIC8vIE5vdCByZWFsbHkgYW4gYWxpYXMsIGJ1dCBhbiBpdGVyYXRpbmcgcmVmZXJlbmNlXG4gICAgbGV0IGl0ID0gdGhpcy5wcmV2U2libGluZztcbiAgICAvKiBlc2xpbnQtZW5hYmxlIGNvbnNpc3RlbnQtdGhpcyAqL1xuICAgIHdoaWxlIChpdCAhPSBudWxsICYmICFpdC5zaG91bGRCZVNob3duKSB7XG4gICAgICBpdCA9IGl0LnByZXZTaWJsaW5nO1xuICAgIH1cblxuICAgIHJldHVybiBpdDtcbiAgfVxuXG4gIC8qKlxuICAqIFJldHVybnMgdGhlIGxhc3Qgc2hvd24gZGVzY2VuZGFudCBhY2NvcmRpbmcgdG8gdGhlIG5hdHVyYWwgdHJlZSBvcmRlciBhcyBpcyB0byBiZSBkaXNwbGF5ZWQgYnlcbiAgKiB0aGUgZmlsZS10cmVlIHBhbmVsLiAoTGFzdCBjaGlsZCBvZiB0aGUgbGFzdCBjaGlsZCBvZiB0aGUgbGFzdCBjaGlsZC4uLilcbiAgKiBPciBudWxsLCBpZiBub25lIGFyZSBmb3VuZFxuICAqL1xuICBmaW5kTGFzdFJlY3Vyc2l2ZUNoaWxkKCk6ID9GaWxlVHJlZU5vZGUge1xuICAgIGlmICghdGhpcy5pc0NvbnRhaW5lciB8fCAhdGhpcy5pc0V4cGFuZGVkIHx8IHRoaXMuY2hpbGRyZW4uaXNFbXB0eSgpKSB7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBsZXQgaXQgPSB0aGlzLmNoaWxkcmVuLmxhc3QoKTtcbiAgICB3aGlsZSAoIWl0LnNob3VsZEJlU2hvd24gJiYgaXQgIT0gbnVsbCkge1xuICAgICAgaXQgPSBpdC5wcmV2U2libGluZztcbiAgICB9XG5cbiAgICBpZiAoaXQgPT0gbnVsbCkge1xuICAgICAgaWYgKHRoaXMuc2hvdWxkQmVTaG93bikge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLmZpbmRQcmV2aW91cygpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gaXQuZmluZExhc3RSZWN1cnNpdmVDaGlsZCgpO1xuICAgIH1cbiAgfVxuXG4gIF9idWlsZERlcml2ZWRGaWVsZHModXJpOiBOdWNsaWRlVXJpLCByb290VXJpOiBOdWNsaWRlVXJpLCBjb25mOiBTdG9yZUNvbmZpZ0RhdGEpOiBPYmplY3Qge1xuICAgIGNvbnN0IGlzQ29udGFpbmVyID0gaXNEaXJLZXkodXJpKTtcbiAgICBjb25zdCByb290VmNzU3RhdHVzZXMgPSBjb25mLnZjc1N0YXR1c2VzW3Jvb3RVcmldIHx8IHt9O1xuICAgIGNvbnN0IHJlcG8gPSBjb25mLnJlcG9zQnlSb290W3Jvb3RVcmldO1xuICAgIGNvbnN0IGlzSWdub3JlZCA9IHRoaXMuX2Rlcml2ZUlzSWdub3JlZCh1cmksIHJvb3RVcmksIHJlcG8sIGNvbmYpO1xuICAgIGNvbnN0IGNoZWNrZWRTdGF0dXMgPSB0aGlzLl9kZXJpdmVDaGVja2VkU3RhdHVzKHVyaSwgaXNDb250YWluZXIsIGNvbmYuZWRpdGVkV29ya2luZ1NldCk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgaXNSb290OiB1cmkgPT09IHJvb3RVcmksXG4gICAgICBuYW1lOiBrZXlUb05hbWUodXJpKSxcbiAgICAgIGhhc2hLZXk6IGJ1aWxkSGFzaEtleSh1cmkpLFxuICAgICAgaXNDb250YWluZXIsXG4gICAgICByZWxhdGl2ZVBhdGg6IHVyaS5zbGljZShyb290VXJpLmxlbmd0aCksXG4gICAgICBsb2NhbFBhdGg6IGtleVRvUGF0aChpc1JlbW90ZSh1cmkpID8gcGFyc2UodXJpKS5wYXRobmFtZSA6IHVyaSksXG4gICAgICBpc0lnbm9yZWQsXG4gICAgICBzaG91bGRCZVNob3duOiB0aGlzLl9kZXJpdmVTaG91bGRCZVNob3duKHVyaSwgcm9vdFVyaSwgaXNDb250YWluZXIsIHJlcG8sIGNvbmYsIGlzSWdub3JlZCksXG4gICAgICBzaG91bGRCZVNvZnRlbmVkOiB0aGlzLl9kZXJpdmVTaG91bGRCZVNvZnRlbmVkKHVyaSwgaXNDb250YWluZXIsIGNvbmYpLFxuICAgICAgdmNzU3RhdHVzQ29kZTogcm9vdFZjc1N0YXR1c2VzW3VyaV0gfHwgU3RhdHVzQ29kZU51bWJlci5DTEVBTixcbiAgICAgIHJlcG8sXG4gICAgICBjaGVja2VkU3RhdHVzLFxuICAgIH07XG4gIH1cblxuICBfZGVyaXZlQ2hlY2tlZFN0YXR1cyhcbiAgICB1cmk6IE51Y2xpZGVVcmksXG4gICAgaXNDb250YWluZXI6IGJvb2xlYW4sXG4gICAgZWRpdGVkV29ya2luZ1NldDogV29ya2luZ1NldCxcbiAgKTogTm9kZUNoZWNrZWRTdGF0dXMge1xuICAgIGlmIChlZGl0ZWRXb3JraW5nU2V0LmlzRW1wdHkoKSkge1xuICAgICAgcmV0dXJuICdjbGVhcic7XG4gICAgfVxuXG4gICAgaWYgKGlzQ29udGFpbmVyKSB7XG4gICAgICBpZiAoZWRpdGVkV29ya2luZ1NldC5jb250YWluc0ZpbGUodXJpKSkge1xuICAgICAgICByZXR1cm4gJ2NoZWNrZWQnO1xuICAgICAgfSBlbHNlIGlmIChlZGl0ZWRXb3JraW5nU2V0LmNvbnRhaW5zRGlyKHVyaSkpIHtcbiAgICAgICAgcmV0dXJuICdwYXJ0aWFsJztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiAnY2xlYXInO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBlZGl0ZWRXb3JraW5nU2V0LmNvbnRhaW5zRmlsZSh1cmkpID8gJ2NoZWNrZWQnIDogJ2NsZWFyJztcbiAgfVxuXG4gIF9kZXJpdmVTaG91bGRCZVNob3duKFxuICAgIHVyaTogTnVjbGlkZVVyaSxcbiAgICByb290VXJpOiBOdWNsaWRlVXJpLFxuICAgIGlzQ29udGFpbmVyOiBib29sZWFuLFxuICAgIHJlcG86ID9hdG9tJFJlcG9zaXRvcnksXG4gICAgY29uZjogU3RvcmVDb25maWdEYXRhLFxuICAgIGlzSWdub3JlZDogYm9vbGVhbixcbiAgKTogYm9vbGVhbiB7XG4gICAgaWYgKGlzSWdub3JlZCAmJiBjb25mLmV4Y2x1ZGVWY3NJZ25vcmVkUGF0aHMpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAoY29uZi5oaWRlSWdub3JlZE5hbWVzICYmIGNvbmYuaWdub3JlZFBhdHRlcm5zLnNvbWUocGF0dGVybiA9PiBwYXR0ZXJuLm1hdGNoKHVyaSkpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKGNvbmYuaXNFZGl0aW5nV29ya2luZ1NldCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgaWYgKGlzQ29udGFpbmVyKSB7XG4gICAgICByZXR1cm4gY29uZi53b3JraW5nU2V0LmNvbnRhaW5zRGlyKHVyaSkgfHxcbiAgICAgICAgKCFjb25mLm9wZW5GaWxlc1dvcmtpbmdTZXQuaXNFbXB0eSgpICYmIGNvbmYub3BlbkZpbGVzV29ya2luZ1NldC5jb250YWluc0Rpcih1cmkpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGNvbmYud29ya2luZ1NldC5jb250YWluc0ZpbGUodXJpKSB8fFxuICAgICAgICAoIWNvbmYub3BlbkZpbGVzV29ya2luZ1NldC5pc0VtcHR5KCkgJiYgY29uZi5vcGVuRmlsZXNXb3JraW5nU2V0LmNvbnRhaW5zRmlsZSh1cmkpKTtcbiAgICB9XG4gIH1cblxuICBfZGVyaXZlSXNJZ25vcmVkKFxuICAgIHVyaTogTnVjbGlkZVVyaSxcbiAgICByb290VXJpOiBOdWNsaWRlVXJpLFxuICAgIHJlcG86ID9hdG9tJFJlcG9zaXRvcnksXG4gICAgY29uZjogU3RvcmVDb25maWdEYXRhXG4gICk6IGJvb2xlYW4ge1xuICAgIGlmIChcbiAgICAgIHJlcG8gIT0gbnVsbCAmJlxuICAgICAgcmVwby5pc1Byb2plY3RBdFJvb3QoKSAmJlxuICAgICAgcmVwby5pc1BhdGhJZ25vcmVkKHVyaSlcbiAgICApIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIF9kZXJpdmVTaG91bGRCZVNvZnRlbmVkKFxuICAgIHVyaTogTnVjbGlkZVVyaSxcbiAgICBpc0NvbnRhaW5lcjogYm9vbGVhbixcbiAgICBjb25mOiBTdG9yZUNvbmZpZ0RhdGEsXG4gICk6IGJvb2xlYW4ge1xuICAgIGlmIChjb25mLmlzRWRpdGluZ1dvcmtpbmdTZXQpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAoY29uZi53b3JraW5nU2V0LmlzRW1wdHkoKSB8fCBjb25mLm9wZW5GaWxlc1dvcmtpbmdTZXQuaXNFbXB0eSgpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKGlzQ29udGFpbmVyKSB7XG4gICAgICBpZiAoXG4gICAgICAgICFjb25mLndvcmtpbmdTZXQuY29udGFpbnNEaXIodXJpKSAmJlxuICAgICAgICBjb25mLm9wZW5GaWxlc1dvcmtpbmdTZXQuY29udGFpbnNEaXIodXJpKSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoXG4gICAgICAgICFjb25mLndvcmtpbmdTZXQuY29udGFpbnNGaWxlKHVyaSkgJiZcbiAgICAgICAgY29uZi5vcGVuRmlsZXNXb3JraW5nU2V0LmNvbnRhaW5zRmlsZSh1cmkpKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgX3Byb3BzQXJlVGhlU2FtZShwcm9wczogT2JqZWN0KTogYm9vbGVhbiB7XG4gICAgaWYgKHByb3BzLmlzU2VsZWN0ZWQgIT09IHVuZGVmaW5lZCAmJiB0aGlzLmlzU2VsZWN0ZWQgIT09IHByb3BzLmlzU2VsZWN0ZWQpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaWYgKHByb3BzLmlzVHJhY2tlZCAhPT0gdW5kZWZpbmVkICYmIHRoaXMuaXNUcmFja2VkICE9PSBwcm9wcy5pc1RyYWNrZWQpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaWYgKHByb3BzLmlzRXhwYW5kZWQgIT09IHVuZGVmaW5lZCAmJiB0aGlzLmlzRXhwYW5kZWQgIT09IHByb3BzLmlzRXhwYW5kZWQpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaWYgKHByb3BzLmlzTG9hZGluZyAhPT0gdW5kZWZpbmVkICYmIHRoaXMuaXNMb2FkaW5nICE9PSBwcm9wcy5pc0xvYWRpbmcpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaWYgKHByb3BzLmlzQ3dkICE9PSB1bmRlZmluZWQgJiYgdGhpcy5pc0N3ZCAhPT0gcHJvcHMuaXNDd2QpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaWYgKHByb3BzLnN1YnNjcmlwdGlvbiAhPT0gdW5kZWZpbmVkICYmIHRoaXMuc3Vic2NyaXB0aW9uICE9PSBwcm9wcy5zdWJzY3JpcHRpb24pIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaWYgKHByb3BzLmhpZ2hsaWdodGVkVGV4dCAhPT0gdW5kZWZpbmVkICYmIHRoaXMuaGlnaGxpZ2h0ZWRUZXh0ICE9PSBwcm9wcy5oaWdobGlnaHRlZFRleHQpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaWYgKHByb3BzLm1hdGNoZXNGaWx0ZXIgIT09IHVuZGVmaW5lZCAmJiB0aGlzLm1hdGNoZXNGaWx0ZXIgIT09IHByb3BzLm1hdGNoZXNGaWx0ZXIpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAocHJvcHMuY2hpbGRyZW4gIT09IHVuZGVmaW5lZCAmJlxuICAgICAgcHJvcHMuY2hpbGRyZW4gIT09IHRoaXMuY2hpbGRyZW4gJiZcbiAgICAgICFJbW11dGFibGUuaXModGhpcy5jaGlsZHJlbiwgcHJvcHMuY2hpbGRyZW4pKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBuZXdOb2RlKFxuICAgIHByb3BzOiBJbW11dGFibGVOb2RlU2V0dGFibGVGaWVsZHMsXG4gICAgY29uZjogU3RvcmVDb25maWdEYXRhLFxuICAgIGRlcml2ZWRDaGFuZ2U6IGJvb2xlYW4gPSB0cnVlXG4gICk6IEZpbGVUcmVlTm9kZSB7XG4gICAgcmV0dXJuIG5ldyBGaWxlVHJlZU5vZGUoe1xuICAgICAgLi4udGhpcy5fYnVpbGRPcHRpb25zKCksXG4gICAgICAuLi5wcm9wcyxcbiAgICB9LFxuICAgIGNvbmYsXG4gICAgZGVyaXZlZENoYW5nZSxcbiAgICApO1xuICB9XG5cbiAgX2ZpbmRMYXN0QnlOYW1lUGF0aChjaGlsZE5hbWVQYXRoOiBBcnJheTxzdHJpbmc+KTogRmlsZVRyZWVOb2RlIHtcbiAgICBpZiAoY2hpbGROYW1lUGF0aC5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGNvbnN0IGNoaWxkID0gdGhpcy5jaGlsZHJlbi5nZXQoY2hpbGROYW1lUGF0aFswXSk7XG4gICAgaWYgKGNoaWxkID09IG51bGwpIHtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHJldHVybiBjaGlsZC5fZmluZExhc3RCeU5hbWVQYXRoKGNoaWxkTmFtZVBhdGguc2xpY2UoMSkpO1xuICB9XG59XG4iXX0=