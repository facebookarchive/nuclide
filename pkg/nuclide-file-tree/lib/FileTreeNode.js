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
  checkedStatus: 'clear',
  subscription: null
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

      var allChildrenChecked = true;
      var hasCheckedDescendants = false;
      var containsSelection = this.isSelected;
      var containsTrackedNode = this.isTracked;

      var prevChild = null;
      this.children.forEach(function (c) {
        c.parent = _this;

        c.prevSibling = prevChild;
        if (prevChild != null) {
          prevChild.nextSibling = c;
        }
        prevChild = c;

        if (allChildrenChecked && c.checkedStatus !== 'checked') {
          allChildrenChecked = false;
        }

        if (!hasCheckedDescendants && (c.checkedStatus === 'checked' || c.checkedStatus === 'partial')) {
          hasCheckedDescendants = true;
        }

        if (!containsSelection && c.containsSelection) {
          containsSelection = true;
        }

        if (!containsTrackedNode && c.containsTrackedNode) {
          containsTrackedNode = true;
        }
      });
      if (prevChild != null) {
        prevChild.nextSibling = null;
      }

      if (!this.children.isEmpty()) {
        if (allChildrenChecked) {
          this.checkedStatus = 'checked';
        } else if (hasCheckedDescendants) {
          this.checkedStatus = 'partial';
        } else {
          this.checkedStatus = 'clear';
        }
      }

      this.containsSelection = containsSelection;
      this.containsTrackedNode = containsTrackedNode;
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
      this.checkedStatus = o.checkedStatus !== undefined ? o.checkedStatus : D.checkedStatus;
      this.subscription = o.subscription !== undefined ? o.subscription : D.subscription;
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
        checkedStatus: this.checkedStatus,
        subscription: this.subscription,

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
        isIgnored: this.isIgnored
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
  }, {
    key: 'setCheckedStatus',
    value: function setCheckedStatus(checkedStatus) {
      return this.set({ checkedStatus: checkedStatus });
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
        checkedStatus: this.checkedStatus === 'partial' ? 'clear' : this.checkedStatus,
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
        repo: repo
      };
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
      if (props.checkedStatus !== undefined && this.checkedStatus !== props.checkedStatus) {
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
// For nodes with children - derived from children

// Derived

// Derived from children
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkZpbGVUcmVlTm9kZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OzsrQkFZMkQsbUJBQW1COztnQ0FDaEQsMEJBQTBCOzt5QkFDbEMsV0FBVzs7OztvQkFDaEIsTUFBTTs7OztxREFLUSxtREFBbUQ7Ozs7O0FBMENsRixJQUFNLGVBQTJDLEdBQUc7QUFDbEQsWUFBVSxFQUFFLEtBQUs7QUFDakIsWUFBVSxFQUFFLEtBQUs7QUFDakIsV0FBUyxFQUFFLEtBQUs7QUFDaEIsT0FBSyxFQUFFLEtBQUs7QUFDWixXQUFTLEVBQUUsS0FBSztBQUNoQixVQUFRLEVBQUUsSUFBSSx1QkFBVSxVQUFVLEVBQUU7QUFDcEMsaUJBQWUsRUFBRSxFQUFFO0FBQ25CLGVBQWEsRUFBRSxPQUFPO0FBQ3RCLGNBQVksRUFBRSxJQUFJO0NBQ25CLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBNEVXLFlBQVk7ZUFBWixZQUFZOzs7Ozs7OztXQTJDQywyQkFDdEIsUUFBNkIsRUFDZTtBQUM1QyxhQUFPLElBQUksdUJBQVUsVUFBVSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsVUFBQSxLQUFLO2VBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQztPQUFBLENBQUMsQ0FBQyxDQUFDO0tBQzdFOzs7Ozs7O0FBS1UsV0FwREEsWUFBWSxDQW9EWCxPQUE0QixFQUFFLElBQXFCLEVBQWtDO1FBQWhDLGNBQXVCLHlEQUFHLElBQUk7OzBCQXBEcEYsWUFBWTs7QUFxRHJCLFFBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO0FBQ25CLFFBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO0FBQ3hCLFFBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO0FBQ3hCLFFBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDOztBQUVqQixRQUFJLENBQUMsY0FB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Q0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLFFBQVEsQ0FBQyxFQUFFO0FBQzlDLGVBQU8sS0FBSyxDQUFDO09BQ2Q7O0FBRUQsYUFBTyxJQUFJLENBQUM7S0FDYjs7O1dBRU0saUJBQ0wsS0FBa0MsRUFDbEMsSUFBcUIsRUFFUDtVQURkLGFBQXNCLHlEQUFHLElBQUk7O0FBRTdCLGFBQU8sSUFBSSxZQUFZLGNBQ2xCLElBQUksQ0FBQyxhQUFhLEVBQUUsRUFDcEIsS0FBSyxHQUVWLElBQUksRUFDSixhQUFhLENBQ1osQ0FBQztLQUNIOzs7V0FFa0IsNkJBQUMsYUFBNEIsRUFBZ0I7QUFDOUQsVUFBSSxhQUFhLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtBQUM5QixlQUFPLElBQUksQ0FBQztPQUNiOztBQUVELFVBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2xELFVBQUksS0FBSyxJQUFJLElBQUksRUFBRTtBQUNqQixlQUFPLElBQUksQ0FBQztPQUNiOztBQUVELGFBQU8sS0FBSyxDQUFDLG1CQUFtQixDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUMxRDs7O1NBeG1CVSxZQUFZIiwiZmlsZSI6IkZpbGVUcmVlTm9kZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cblxuaW1wb3J0IHtpc0RpcktleSwga2V5VG9OYW1lLCBrZXlUb1BhdGgsIGJ1aWxkSGFzaEtleX0gZnJvbSAnLi9GaWxlVHJlZUhlbHBlcnMnO1xuaW1wb3J0IHtpc1JlbW90ZSwgcGFyc2V9IGZyb20gJy4uLy4uL251Y2xpZGUtcmVtb3RlLXVyaSc7XG5pbXBvcnQgSW1tdXRhYmxlIGZyb20gJ2ltbXV0YWJsZSc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcblxuaW1wb3J0IHR5cGUge051Y2xpZGVVcml9IGZyb20gJy4uLy4uL251Y2xpZGUtcmVtb3RlLXVyaSc7XG5pbXBvcnQgdHlwZSB7U3RvcmVDb25maWdEYXRhLCBOb2RlQ2hlY2tlZFN0YXR1c30gZnJvbSAnLi9GaWxlVHJlZVN0b3JlJztcbmltcG9ydCB0eXBlIHtTdGF0dXNDb2RlTnVtYmVyVmFsdWV9IGZyb20gJy4uLy4uL251Y2xpZGUtaGctcmVwb3NpdG9yeS1iYXNlL2xpYi9IZ1NlcnZpY2UnO1xuaW1wb3J0IHtTdGF0dXNDb2RlTnVtYmVyfSBmcm9tICcuLi8uLi9udWNsaWRlLWhnLXJlcG9zaXRvcnktYmFzZS9saWIvaGctY29uc3RhbnRzJztcblxuXG5leHBvcnQgdHlwZSBGaWxlVHJlZUNoaWxkTm9kZU9wdGlvbnMgPSB7XG4gIHVyaTogTnVjbGlkZVVyaTtcbiAgaXNFeHBhbmRlZD86IGJvb2xlYW47XG4gIGlzU2VsZWN0ZWQ/OiBib29sZWFuO1xuICBpc0xvYWRpbmc/OiBib29sZWFuO1xuICBpc0N3ZD86IGJvb2xlYW47XG4gIGlzVHJhY2tlZD86IGJvb2xlYW47XG4gIGNoaWxkcmVuPzogSW1tdXRhYmxlLk9yZGVyZWRNYXA8c3RyaW5nLCBGaWxlVHJlZU5vZGU+O1xuICBzdWJzY3JpcHRpb24/OiA/SURpc3Bvc2FibGU7XG59O1xuXG4vLyBJZGVhbGx5IHRoZSB0eXBlIGhlcmUgd291bGQgYmUgRmlsZVRyZWVDaGlsZE5vZGVPcHRpb25zICYge3Jvb3RVcml9LFxuLy8gYnV0IGZsb3cgZG9lc24ndCBoYW5kbGUgaXQgd2VsbFxuZXhwb3J0IHR5cGUgRmlsZVRyZWVOb2RlT3B0aW9ucyA9IHtcbiAgdXJpOiBOdWNsaWRlVXJpO1xuICByb290VXJpOiBOdWNsaWRlVXJpO1xuICBpc0V4cGFuZGVkPzogYm9vbGVhbjtcbiAgaXNTZWxlY3RlZD86IGJvb2xlYW47XG4gIGlzTG9hZGluZz86IGJvb2xlYW47XG4gIGlzQ3dkPzogYm9vbGVhbjtcbiAgaXNUcmFja2VkPzogYm9vbGVhbjtcbiAgY2hpbGRyZW4/OiBJbW11dGFibGUuT3JkZXJlZE1hcDxzdHJpbmcsIEZpbGVUcmVlTm9kZT47XG4gIGNvbm5lY3Rpb25UaXRsZT86IHN0cmluZztcbiAgY2hlY2tlZFN0YXR1cz86IE5vZGVDaGVja2VkU3RhdHVzO1xuICBzdWJzY3JpcHRpb24/OiA/SURpc3Bvc2FibGU7XG59O1xuXG50eXBlIERlZmF1bHRGaWxlVHJlZU5vZGVPcHRpb25zID0ge1xuICBpc0V4cGFuZGVkOiBib29sZWFuO1xuICBpc1NlbGVjdGVkOiBib29sZWFuO1xuICBpc0xvYWRpbmc6IGJvb2xlYW47XG4gIGlzQ3dkOiBib29sZWFuO1xuICBpc1RyYWNrZWQ6IGJvb2xlYW47XG4gIGNoaWxkcmVuOiBJbW11dGFibGUuT3JkZXJlZE1hcDxzdHJpbmcsIEZpbGVUcmVlTm9kZT47XG4gIGNvbm5lY3Rpb25UaXRsZTogc3RyaW5nO1xuICBjaGVja2VkU3RhdHVzOiBOb2RlQ2hlY2tlZFN0YXR1cztcbiAgc3Vic2NyaXB0aW9uOiA/SURpc3Bvc2FibGU7XG59O1xuXG5jb25zdCBERUZBVUxUX09QVElPTlM6IERlZmF1bHRGaWxlVHJlZU5vZGVPcHRpb25zID0ge1xuICBpc0V4cGFuZGVkOiBmYWxzZSxcbiAgaXNTZWxlY3RlZDogZmFsc2UsXG4gIGlzTG9hZGluZzogZmFsc2UsXG4gIGlzQ3dkOiBmYWxzZSxcbiAgaXNUcmFja2VkOiBmYWxzZSxcbiAgY2hpbGRyZW46IG5ldyBJbW11dGFibGUuT3JkZXJlZE1hcCgpLFxuICBjb25uZWN0aW9uVGl0bGU6ICcnLFxuICBjaGVja2VkU3RhdHVzOiAnY2xlYXInLFxuICBzdWJzY3JpcHRpb246IG51bGwsXG59O1xuXG5leHBvcnQgdHlwZSBJbW11dGFibGVOb2RlU2V0dGFibGVGaWVsZHMgPSB7XG4gIGlzRXhwYW5kZWQ/OiBib29sZWFuO1xuICBpc1NlbGVjdGVkPzogYm9vbGVhbjtcbiAgaXNMb2FkaW5nPzogYm9vbGVhbjtcbiAgaXNDd2Q/OiBib29sZWFuO1xuICBpc1RyYWNrZWQ/OiBib29sZWFuO1xuICBjaGlsZHJlbj86IEltbXV0YWJsZS5PcmRlcmVkTWFwPHN0cmluZywgRmlsZVRyZWVOb2RlPjtcbiAgY2hlY2tlZFN0YXR1cz86IE5vZGVDaGVja2VkU3RhdHVzO1xuICBzdWJzY3JpcHRpb24/OiA/SURpc3Bvc2FibGU7XG59O1xuXG5cbi8qKlxuKiBPVkVSVklFV1xuKiAgIFRoZSBGaWxlVHJlZU5vZGUgY2xhc3MgaXMgYWxtb3N0IGVudGlyZWx5IGltbXV0YWJsZS4gRXhjZXB0IGZvciB0aGUgcGFyZW50IGFuZCB0aGUgc2libGluZ1xuKiBsaW5rcyBubyBwcm9wZXJ0aWVzIGFyZSB0byBiZSB1cGRhdGVkIGFmdGVyIHRoZSBjcmVhdGlvbi5cbipcbiogICBBbiBpbnN0YW5jZSBjYW4gZWl0aGVyIGJlIGNyZWF0ZWQgYnkgY2FsbGluZyB0aGUgY29uc3RydWN0b3Igd2hpY2ggYWNjZXB0cyBtdWx0aXBsZSBvcHRpb25zIGFuZFxuKiB0aGUgY29uZmlndXJhdGlvbiwgb3IgYnkgY2FsbGluZyBhIGBjcmVhdGVDaGlsZCgpYCBtZXRob2QuIFRoZSBjcmVhdGVDaGlsZCgpIGluaGVyaXRzIHRoZVxuKiBjb25maWd1cmF0aW9uIGluc3RhbmNlIGFuZCBtYW55IG9mIHRoZSBvcHRpb25zIGZyb20gdGhlIGluc3RhbmNlIGl0IHdhcyBjcmVhdGVkIGZyb20uXG4qXG4qICAgVGhlIGNsYXNzIGNvbnRhaW5zIG11bHRpcGxlIGRlcml2ZWQgZmllbGRzLiBUaGUgZGVyaXZlZCBmaWVsZHMgYXJlIGNhbGN1bGF0ZWQgZnJvbSB0aGUgb3B0aW9ucyxcbiogZnJvbSB0aGUgY29uZmlndXJhdGlvbiB2YWx1ZXMgYW5kIGV2ZW4gZnJvbSBjaGllbGRyZW4ncyBwcm9wZXJ0aWVzLiBPbmNlIGNhbGN1bGF0ZWQgdGhlIHByb3BlcnRpZXNcbiogYXJlIGltbXV0YWJsZS5cbipcbiogICBTZXR0aW5nIGFueSBvZiB0aGUgcHJvcGVydGllcyAoZXhjZXB0IGZvciB0aGUgYWZvcmVtZW50aW9uZWQgbGlua3MgdG8gcGFyZW50IGFuZCBzaWJsaW5ncykgd2lsbFxuKiBjcmVhdGUgYSBuZXcgaW5zdGFuY2Ugb2YgdGhlIGNsYXNzLCB3aXRoIHJlcXVpcmVkIHByb3BlcnRpZXMgc2V0LiBJZiwgaG93ZXZlciwgdGhlIHNldCBvcGVyYXRpb25cbiogaXMgYSBuby1vcCAoc3VjaCBpZiBzZXR0aW5nIGEgcHJvcGVydHkgdG8gdGhlIHNhbWUgdmFsdWUgaXQgYWxyZWFkeSBoYXMpLCBuZXcgaW5zdGFuY2UgY3JlYXRpb25cbiogaXMgbm90IHNraXBwZWQgYW5kIHNhbWUgaW5zdGFuY2UgaXMgcmV0dXJuZWQgaW5zdGVhZC5cbipcbiogICBXaGVuIHBvc3NpYmxlLCB0aGUgY2xhc3Ncbiogc3RyaXZlcyBub3QgdG8gcmVjb21wdXRlIHRoZSBkZXJpdmVkIGZpZWxkcywgYnV0IHJldXNlcyB0aGUgcHJldmlvdXMgdmFsdWVzLlxuKlxuKlxuKiBUSEUgQ09ORklHVVJBVElPTlxuKiAgIElzIHRoZSBvYmplY3QgcGFzc2VkIHRvIHRoZSBjb25zdHJ1Y3RvciBhbmQgY29uY2VwdHVhbGx5IHNoYXJlZCBhbW9uZyBhbGxcbiogaW5zdGFuY2VzIGluIGEgdHJlZS4gU2hvdWxkIGJlIHVzZWQgZm9yIHByb3BlcnRpZXMgdGhhdCBtYWtlIG5vIHNlbnNlIHRvIGJlIG93bmVkIGJ5IHRoZSB0cmVlXG4qIGVsZW1lbnRzLCB5ZXQgc3VjaCB0aGF0IGFmZmVjdCB0aGUgdHJlZS4gU3VjaCBhcyB0aGUgY29uZmlndXJhdGlvbiB3aGV0aGVyIHRvIHVzZSB0aGUgcHJlZml4XG4qIG5hdmlnYXRpb24sIGZvciBpbnN0YW5jZSwgb3IgdGhlIGN1cnJlbnRseSBjb25maWd1cmVkIFdvcmtpbmcgU2V0LlxuKiBUaGUgY29uZmlndXJhdGlvbiBvYmplY3Qgc2hvdWxkIGJlIHRyZWF0ZWQgYXMgaW1tdXRhYmxlIGJ5IGl0cyBvd25lci4gV2hlbmV2ZXIgYSBjaGFuZ2Ugb2NjdXJzXG4qIG1ldGhvZCBgdXBkYXRlQ29uZigpYCBoYXMgdG8gYmUgY2FsbGVkIG9uIHRoZSByb290KHMpIG9mIHRoZSB0cmVlIHRvIG5vdGlmeSBhYm91dCB0aGUgY2hhbmdlLlxuKiBUaGlzIGNhbGwgd291bGQgdHJpZ2dlciBjb21wbGV0ZSByZWNvbnN0cnVjdGlvbiBvZiB0aGUgdHJlZSwgdG8gcmVmbGVjdCB0aGUgcG9zc2libHkgY2hhbmdlZFxuKiBkZXJpdmVkIHByb3BlcnRpZXMuXG4qIFRoaXMgZ2l2ZXMgYW5vdGhlciByZWFzb24gdG8gdXNlIHRoZSBjb25maWd1cmF0aW9uIG9iamVjdCBzcGFyaW5nbHkgLSBpdCBpcyBleHBlbnNpdmUgdG8gcmVidWlsZFxuKiB0aGUgZW50aXJlIHRyZWUuXG4qXG4qXG4qIENISUxEUkVOIEhBTkRMSU5HXG4qICAgSW4gb3JkZXIgZm9yIHRoZSB0cmVlIHRyYXZlcnNhbCBhbmQgbW9kaWZpY2F0aW9ucyB0byBiZSBlZmZpY2llbnQgb25lIG9mdGVuXG4qIG5lZWRzIHRvIGZpbmQgdGhlIHBhcmVudCBvZiBhIG5vZGUuIFBhcmVudCBwcm9wZXJ0eSwgaG93ZXZlciwgY2FuJ3QgYmUgb25lIG9mIHRoZSBub2RlJ3MgaW1tdXRhYmxlXG4qIGZpZWxkcywgb3RoZXJ3aXNlIGl0J2QgY3JlYXRlIGNpcmN1bGFyIHJlZmVyZW5jZXMuIFRoZXJlZm9yZSB0aGUgcGFyZW50IHByb3BlcnR5IGlzIG5ldmVyIGdpdmVuXG4qIHRvIHRoZSBub2RlJ3MgY29uc3RydWN0b3IsIGJ1dCByYXRoZXIgc2V0IGJ5IHRoZSBwYXJlbnQgaXRzZWxmIHdoZW4gdGhlIG5vZGUgaXMgYXNzaWduZWQgdG8gaXQuXG4qIFRoaXMgbWVhbnMgdGhhdCB3ZSBuZWVkIHRvIGF2b2lkIHRoZSBzdGF0ZSB3aGVuIHNhbWUgbm9kZSBub2RlIGlzIGNvbnRhaW5lZCBpbiB0aGUgLmNoaWxkcmVuIG1hcFxuKiBvZiBzZXZlcmFsIG90aGVyIG5vZGVzLiBBcyBvbmx5IHRoZSBsYXRlc3Qgb25lIGl0IHdhcyBhc3NpZ25lZCB0byBpcyBjb25zaWRlcmVkIGl0cyBwYXJlbnQgZnJvbVxuKiB0aGUgbm9kZSdzIHBlcnNwZWN0aXZlLlxuKlxuKiAgIEp1c3QgbGlrZSB0aGUgcGFyZW50IHByb3BlcnR5LCBzb21lIG9wZXJhdGlvbnMgcmVxdWlyZSBhbiBhYmlsaXR5IHRvIGZpbmQgc2libGluZ3MgZWFzaWx5LlxuKiBUaGUgcHJldmlvdXMgYW5kIHRoZSBuZXh0IHNpYmxpbmcgcHJvcGVydGllcyBhcmUgdG9vIHNldCB3aGVuIGEgY2hpbGQgaXMgYXNzaWduZWQgdG8gaXRzIHBhcmVudC5cbipcbiogICBTb21lIG9mIHRoZSBwcm9wZXJ0aWVzIGFyZSBkZXJpdmVkIGZyb20gdGhlIHByb3BlcnRpZXMgb2YgY2hpbGRyZW4uIEZvciBleGFtcGxlIHdoZW4gZWRpdGluZyBhXG4qIFdvcmtpbmcgc2V0IGFsbCBhbmNlc3RvcnMgb2YgYSBzZWxlY3RlZCBub2RlIG11c3QgaGF2ZSBlaXRoZXIgcGFydGlhbCBvciBhIGNvbXBsZXRlIHNlbGVjdGlvbi5cbiogVGhpcyBpcyBzb21ldGhpbmcgZG9uZSB3aXRoIHRoZSBoZWxwIG9mIHRoZSBjaGlsZHJlbi1kZXJpdmVkIGZpZWxkcy4gQWRkaXRpb25hbCBleGFtcGxlIGlzIHRoZVxuKiAuY29udGFpbnNTZWxlY3Rpb24gcHJvcGVydHkgLSBoYXZpbmcgaXQgYWxsb3dzIGVmZmljaWVudCBzZWxlY3Rpb24gcmVtb3ZhbCBmcm9tIHRoZSBlbnRpcmUgdHJlZVxuKiBvciBvbmUgb2YgaXRzIGJyYW5jaGVzLlxuKlxuKiAgIEFsbCBwcm9wZXJ0eSBkZXJpdmF0aW9uIGFuZCBsaW5rcyBzZXQtdXAgaXMgZG9uZSB3aXRoIG9uZSB0cmF2ZXJzYWwgb25seSBvdmVyIHRoZSBjaGlsZHJlbi5cbipcbipcbiogSEFDS1NcbiogICBJbiBvcmRlciB0byBtYWtlIHRoaW5ncyBlZmZpY2llbnQgdGhlIHJlY2FsY3VsYXRpb24gb2YgdGhlIGRlcml2ZWQgZmllbGRzIGlzIGJlaW5nIGF2b2lkZWQgd2hlblxuKiBwb3NzaWJsZS4gRm9yIGluc3RhbmNlLCB3aGVuIHNldHRpbmcgYW4gdW5yZWxhdGVkIHByb3BlcnR5LCB3aGVuIGFuIGluc3RhbmNlIGlzIGNyZWF0ZWQgYWxsXG4qIG9mIHRoZSBkZXJpdmVkIGZpZWxkcyBhcmUganVzdCBjb3BpZWQgb3ZlciBpbiB0aGUgYG9wdGlvbnNgIGluc3RhbmNlIGV2ZW4gdGhvdWdoIHRoZXkgZG9uJ3RcbiogbWF0Y2ggdGhlIHR5cGUgZGVmaW5pdGlvbiBvZiB0aGUgb3B0aW9ucy5cbiovXG5leHBvcnQgY2xhc3MgRmlsZVRyZWVOb2RlIHtcbiAgLy8gTXV0YWJsZSBwcm9wZXJ0aWVzIC0gc2V0IHdoZW4gdGhlIG5vZGUgaXMgYXNzaWduZWQgdG8gaXRzIHBhcmVudCAoYW5kIGFyZSBpbW11dGFibGUgYWZ0ZXIpXG4gIHBhcmVudDogP0ZpbGVUcmVlTm9kZTtcbiAgbmV4dFNpYmxpbmc6ID9GaWxlVHJlZU5vZGU7XG4gIHByZXZTaWJsaW5nOiA/RmlsZVRyZWVOb2RlO1xuXG4gIGNvbmY6IFN0b3JlQ29uZmlnRGF0YTtcblxuICB1cmk6IE51Y2xpZGVVcmk7XG4gIHJvb3RVcmk6IE51Y2xpZGVVcmk7XG4gIGlzRXhwYW5kZWQ6IGJvb2xlYW47XG4gIGlzU2VsZWN0ZWQ6IGJvb2xlYW47XG4gIGlzTG9hZGluZzogYm9vbGVhbjtcbiAgaXNUcmFja2VkOiBib29sZWFuO1xuICBpc0N3ZDogYm9vbGVhbjtcbiAgY2hpbGRyZW46IEltbXV0YWJsZS5PcmRlcmVkTWFwPHN0cmluZywgRmlsZVRyZWVOb2RlPjtcbiAgY29ubmVjdGlvblRpdGxlOiBzdHJpbmc7XG4gIGNoZWNrZWRTdGF0dXM6IE5vZGVDaGVja2VkU3RhdHVzOyAgLy8gRm9yIG5vZGVzIHdpdGggY2hpbGRyZW4gLSBkZXJpdmVkIGZyb20gY2hpbGRyZW5cbiAgc3Vic2NyaXB0aW9uOiA/SURpc3Bvc2FibGU7XG5cbiAgLy8gRGVyaXZlZFxuICBpc1Jvb3Q6IGJvb2xlYW47XG4gIG5hbWU6IHN0cmluZztcbiAgaGFzaEtleTogc3RyaW5nO1xuICByZWxhdGl2ZVBhdGg6IHN0cmluZztcbiAgbG9jYWxQYXRoOiBzdHJpbmc7XG4gIGlzQ29udGFpbmVyOiBib29sZWFuO1xuICBzaG91bGRCZVNob3duOiBib29sZWFuO1xuICBzaG91bGRCZVNvZnRlbmVkOiBib29sZWFuO1xuICB2Y3NTdGF0dXNDb2RlOiBTdGF0dXNDb2RlTnVtYmVyVmFsdWU7XG4gIHJlcG86ID9hdG9tJFJlcG9zaXRvcnk7XG4gIGlzSWdub3JlZDogYm9vbGVhbjtcblxuICAvLyBEZXJpdmVkIGZyb20gY2hpbGRyZW5cbiAgY29udGFpbnNTZWxlY3Rpb246IGJvb2xlYW47XG4gIGNvbnRhaW5zVHJhY2tlZE5vZGU6IGJvb2xlYW47XG5cblxuICAvKipcbiAgKiBUaGUgY2hpbGRyZW4gcHJvcGVydHkgaXMgYW4gT3JkZXJlZE1hcCBpbnN0YW5jZSBrZXllZCBieSBjaGlsZCdzIG5hbWUgcHJvcGVydHkuXG4gICogVGhpcyBjb252ZW5pZW5jZSBmdW5jdGlvbiB3b3VsZCBjcmVhdGUgc3VjaCBPcmRlcmVkTWFwIGluc3RhbmNlIGZyb20gYSBwbGFpbiBKUyBBcnJheVxuICAqIG9mIEZpbGVUcmVlTm9kZSBpbnN0YW5jZXNcbiAgKi9cbiAgc3RhdGljIGNoaWxkcmVuRnJvbUFycmF5KFxuICAgIGNoaWxkcmVuOiBBcnJheTxGaWxlVHJlZU5vZGU+XG4gICk6IEltbXV0YWJsZS5PcmRlcmVkTWFwPHN0cmluZywgRmlsZVRyZWVOb2RlPiB7XG4gICAgcmV0dXJuIG5ldyBJbW11dGFibGUuT3JkZXJlZE1hcChjaGlsZHJlbi5tYXAoY2hpbGQgPT4gW2NoaWxkLm5hbWUsIGNoaWxkXSkpO1xuICB9XG5cbiAgLyoqXG4gICogVGhlIF9kZXJpdmVkQ2hhbmdlIHBhcmFtIGlzIG5vdCBmb3IgZXh0ZXJuYWwgdXNlLlxuICAqL1xuICBjb25zdHJ1Y3RvcihvcHRpb25zOiBGaWxlVHJlZU5vZGVPcHRpb25zLCBjb25mOiBTdG9yZUNvbmZpZ0RhdGEsIF9kZXJpdmVkQ2hhbmdlOiBib29sZWFuID0gdHJ1ZSkge1xuICAgIHRoaXMucGFyZW50ID0gbnVsbDtcbiAgICB0aGlzLm5leHRTaWJsaW5nID0gbnVsbDtcbiAgICB0aGlzLnByZXZTaWJsaW5nID0gbnVsbDtcbiAgICB0aGlzLmNvbmYgPSBjb25mO1xuXG4gICAgdGhpcy5fYXNzaWduT3B0aW9ucyhvcHRpb25zKTtcblxuICAgIC8vIFBlcmYgb3B0aW1pemF0aW9uOlxuICAgIC8vIHdoZW4gY29uZiBkb2VzIG5vdCBjaGFuZ2UgdGhlIGRlcml2ZWQgZmllbGRzIHdpbGwgYmUgcGFzc2VkIGFsb25nIHdpdGggdGhlIG9wdGlvbnNcbiAgICAvLyBpdCdzIG5vdCB0eXBlLXNhZmUsIGJ1dCBpdCdzIHdheSBtb3JlIGVmZmljaWVudCB0aGFuIHJlY2FsY3VsYXRlIHRoZW1cbiAgICBpZiAoX2Rlcml2ZWRDaGFuZ2UpIHtcbiAgICAgIGNvbnN0IGRlcml2ZWQgPSB0aGlzLl9idWlsZERlcml2ZWRGaWVsZHMob3B0aW9ucy51cmksIG9wdGlvbnMucm9vdFVyaSwgY29uZik7XG4gICAgICB0aGlzLl9hc3NpZ25EZXJpdmVkKGRlcml2ZWQpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9hc3NpZ25EZXJpdmVkKG9wdGlvbnMpO1xuICAgIH1cblxuICAgIHRoaXMuX2hhbmRsZUNoaWxkcmVuKCk7XG4gIH1cblxuICAvKipcbiAgKiBTZXRzIHRoZSBsaW5rcyBmcm9tIHRoZSBjaGlsZHJlbiB0byB0aGlzIGluc3RhbmNlICh0aGVpciBwYXJlbnQpIGFuZCB0aGUgbGlua3MgYmV0d2VlbiB0aGVcbiAgKiBzaWJsaW5ncy5cbiAgKiAgIEFkZGl0aW9uYWxseSBjYWxjdWxhdGVzIHRoZSBwcm9wZXJ0aWVzIGRlcml2ZWQgZnJvbSBjaGlsZHJlbiBhbmQgYXNzaWducyB0aGVtIHRvIHRoaXMgaW5zdGFuY2VcbiAgKi9cbiAgX2hhbmRsZUNoaWxkcmVuKCk6IHZvaWQge1xuICAgIGxldCBhbGxDaGlsZHJlbkNoZWNrZWQgPSB0cnVlO1xuICAgIGxldCBoYXNDaGVja2VkRGVzY2VuZGFudHMgPSBmYWxzZTtcbiAgICBsZXQgY29udGFpbnNTZWxlY3Rpb24gPSB0aGlzLmlzU2VsZWN0ZWQ7XG4gICAgbGV0IGNvbnRhaW5zVHJhY2tlZE5vZGUgPSB0aGlzLmlzVHJhY2tlZDtcblxuICAgIGxldCBwcmV2Q2hpbGQgPSBudWxsO1xuICAgIHRoaXMuY2hpbGRyZW4uZm9yRWFjaChjID0+IHtcbiAgICAgIGMucGFyZW50ID0gdGhpcztcblxuICAgICAgYy5wcmV2U2libGluZyA9IHByZXZDaGlsZDtcbiAgICAgIGlmIChwcmV2Q2hpbGQgIT0gbnVsbCkge1xuICAgICAgICBwcmV2Q2hpbGQubmV4dFNpYmxpbmcgPSBjO1xuICAgICAgfVxuICAgICAgcHJldkNoaWxkID0gYztcblxuICAgICAgaWYgKGFsbENoaWxkcmVuQ2hlY2tlZCAmJiBjLmNoZWNrZWRTdGF0dXMgIT09ICdjaGVja2VkJykge1xuICAgICAgICBhbGxDaGlsZHJlbkNoZWNrZWQgPSBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgaWYgKCFoYXNDaGVja2VkRGVzY2VuZGFudHMgJiZcbiAgICAgICAgKGMuY2hlY2tlZFN0YXR1cyA9PT0gJ2NoZWNrZWQnIHx8IGMuY2hlY2tlZFN0YXR1cyA9PT0gJ3BhcnRpYWwnKSkge1xuICAgICAgICBoYXNDaGVja2VkRGVzY2VuZGFudHMgPSB0cnVlO1xuICAgICAgfVxuXG4gICAgICBpZiAoIWNvbnRhaW5zU2VsZWN0aW9uICYmIGMuY29udGFpbnNTZWxlY3Rpb24pIHtcbiAgICAgICAgY29udGFpbnNTZWxlY3Rpb24gPSB0cnVlO1xuICAgICAgfVxuXG4gICAgICBpZiAoIWNvbnRhaW5zVHJhY2tlZE5vZGUgJiYgYy5jb250YWluc1RyYWNrZWROb2RlKSB7XG4gICAgICAgIGNvbnRhaW5zVHJhY2tlZE5vZGUgPSB0cnVlO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGlmIChwcmV2Q2hpbGQgIT0gbnVsbCkge1xuICAgICAgcHJldkNoaWxkLm5leHRTaWJsaW5nID0gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMuY2hpbGRyZW4uaXNFbXB0eSgpKSB7XG4gICAgICBpZiAoYWxsQ2hpbGRyZW5DaGVja2VkKSB7XG4gICAgICAgIHRoaXMuY2hlY2tlZFN0YXR1cyA9ICdjaGVja2VkJztcbiAgICAgIH0gZWxzZSBpZiAoaGFzQ2hlY2tlZERlc2NlbmRhbnRzKSB7XG4gICAgICAgIHRoaXMuY2hlY2tlZFN0YXR1cyA9ICdwYXJ0aWFsJztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuY2hlY2tlZFN0YXR1cyA9ICdjbGVhcic7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5jb250YWluc1NlbGVjdGlvbiA9IGNvbnRhaW5zU2VsZWN0aW9uO1xuICAgIHRoaXMuY29udGFpbnNUcmFja2VkTm9kZSA9IGNvbnRhaW5zVHJhY2tlZE5vZGU7XG4gIH1cblxuICAvKipcbiAgKiBVc2luZyBvYmplY3QuYXNzaWduKCkgd2FzIHByb3ZlbiB0byBiZSBsZXNzIHBlcmZvcm1hbnQgdGhhbiBkaXJlY3QgbmFtZWQgYXNzaWdubWVudFxuICAqIFNpbmNlIGluIGhlYXZ5IHVwZGF0ZXMsIG5vZGVzIGFyZSBjcmVhdGVkIGJ5IHRoZSB0aG91c2FuZHMgd2UgbmVlZCB0byBrZWVwIHRoZSBjcmVhdGlvblxuICAqIGZsb3cgcGVyZm9ybWFudC5cbiAgKi9cbiAgX2Fzc2lnbk9wdGlvbnMob3B0aW9uczogT2JqZWN0KTogdm9pZCB7XG4gICAgLy8gRG9uJ3QgcGFzcyB0aGUgMTAwIGNoYXJzIGxpbWl0XG4gICAgY29uc3QgbyA9IG9wdGlvbnM7XG4gICAgY29uc3QgRCA9IERFRkFVTFRfT1BUSU9OUztcblxuICAgIHRoaXMudXJpID0gby51cmk7XG4gICAgdGhpcy5yb290VXJpID0gby5yb290VXJpO1xuICAgIHRoaXMuaXNFeHBhbmRlZCA9IG8uaXNFeHBhbmRlZCAhPT0gdW5kZWZpbmVkID8gby5pc0V4cGFuZGVkIDogRC5pc0V4cGFuZGVkO1xuICAgIHRoaXMuaXNTZWxlY3RlZCA9IG8uaXNTZWxlY3RlZCAhPT0gdW5kZWZpbmVkID8gby5pc1NlbGVjdGVkIDogRC5pc1NlbGVjdGVkO1xuICAgIHRoaXMuaXNMb2FkaW5nID0gby5pc0xvYWRpbmcgIT09IHVuZGVmaW5lZCA/IG8uaXNMb2FkaW5nIDogRC5pc0xvYWRpbmc7XG4gICAgdGhpcy5pc1RyYWNrZWQgPSBvLmlzVHJhY2tlZCAhPT0gdW5kZWZpbmVkID8gby5pc1RyYWNrZWQgOiBELmlzVHJhY2tlZDtcbiAgICB0aGlzLmlzQ3dkID0gby5pc0N3ZCAhPT0gdW5kZWZpbmVkID8gby5pc0N3ZCA6IEQuaXNDd2Q7XG4gICAgdGhpcy5jaGlsZHJlbiA9IG8uY2hpbGRyZW4gIT09IHVuZGVmaW5lZCA/IG8uY2hpbGRyZW4gOiBELmNoaWxkcmVuO1xuICAgIHRoaXMuY29ubmVjdGlvblRpdGxlID0gby5jb25uZWN0aW9uVGl0bGUgIT09IHVuZGVmaW5lZCA/IG8uY29ubmVjdGlvblRpdGxlIDogRC5jb25uZWN0aW9uVGl0bGU7XG4gICAgdGhpcy5jaGVja2VkU3RhdHVzID0gby5jaGVja2VkU3RhdHVzICE9PSB1bmRlZmluZWQgPyBvLmNoZWNrZWRTdGF0dXMgOiBELmNoZWNrZWRTdGF0dXM7XG4gICAgdGhpcy5zdWJzY3JpcHRpb24gPSBvLnN1YnNjcmlwdGlvbiAhPT0gdW5kZWZpbmVkID8gby5zdWJzY3JpcHRpb24gOiBELnN1YnNjcmlwdGlvbjtcbiAgfVxuXG4gIC8qKlxuICAqIFVzaW5nIG9iamVjdC5hc3NpZ24oKSB3YXMgcHJvdmVuIHRvIGJlIGxlc3MgcGVyZm9ybWFudCB0aGFuIGRpcmVjdCBuYW1lZCBhc3NpZ25tZW50XG4gICogU2luY2UgaW4gaGVhdnkgdXBkYXRlcywgbm9kZXMgYXJlIGNyZWF0ZWQgYnkgdGhlIHRob3VzYW5kcyB3ZSBuZWVkIHRvIGtlZXAgdGhlIGNyZWF0aW9uXG4gICogZmxvdyBwZXJmb3JtYW50LlxuICAqL1xuICBfYXNzaWduRGVyaXZlZChkZXJpdmVkOiBPYmplY3QpOiB2b2lkIHtcbiAgICB0aGlzLmlzUm9vdCA9IGRlcml2ZWQuaXNSb290O1xuICAgIHRoaXMubmFtZSA9IGRlcml2ZWQubmFtZTtcbiAgICB0aGlzLmhhc2hLZXkgPSBkZXJpdmVkLmhhc2hLZXk7XG4gICAgdGhpcy5yZWxhdGl2ZVBhdGggPSBkZXJpdmVkLnJlbGF0aXZlUGF0aDtcbiAgICB0aGlzLmxvY2FsUGF0aCA9IGRlcml2ZWQubG9jYWxQYXRoO1xuICAgIHRoaXMuaXNDb250YWluZXIgPSBkZXJpdmVkLmlzQ29udGFpbmVyO1xuICAgIHRoaXMuc2hvdWxkQmVTaG93biA9IGRlcml2ZWQuc2hvdWxkQmVTaG93bjtcbiAgICB0aGlzLnNob3VsZEJlU29mdGVuZWQgPSBkZXJpdmVkLnNob3VsZEJlU29mdGVuZWQ7XG4gICAgdGhpcy52Y3NTdGF0dXNDb2RlID0gZGVyaXZlZC52Y3NTdGF0dXNDb2RlO1xuICAgIHRoaXMucmVwbyA9IGRlcml2ZWQucmVwbztcbiAgICB0aGlzLmlzSWdub3JlZCA9IGRlcml2ZWQuaXNJZ25vcmVkO1xuICB9XG5cbiAgLyoqXG4gICogV2hlbiBtb2RpZnlpbmcgc29tZSBvZiB0aGUgcHJvcGVydGllcyBhIG5ldyBpbnN0YW5jZSBuZWVkcyB0byBiZSBjcmVhdGVkIHdpdGggYWxsIG9mIHRoZVxuICAqIHByb3BlcnRpZXMgaWRlbnRpY2FsIGV4Y2VwdCBmb3IgdGhvc2UgYmVpbmcgbW9kaWZpZWQuIFRoaXMgbWV0aG9kIGNyZWF0ZXMgdGhlIGJhc2VsaW5lIG9wdGlvbnNcbiAgKiBpbnN0YW5jZVxuICAqL1xuICBfYnVpbGRPcHRpb25zKCk6IEZpbGVUcmVlTm9kZU9wdGlvbnMge1xuICAgIHJldHVybiB7XG4gICAgICB1cmk6IHRoaXMudXJpLFxuICAgICAgcm9vdFVyaTogdGhpcy5yb290VXJpLFxuICAgICAgaXNFeHBhbmRlZDogdGhpcy5pc0V4cGFuZGVkLFxuICAgICAgaXNTZWxlY3RlZDogdGhpcy5pc1NlbGVjdGVkLFxuICAgICAgaXNMb2FkaW5nOiB0aGlzLmlzTG9hZGluZyxcbiAgICAgIGlzVHJhY2tlZDogdGhpcy5pc1RyYWNrZWQsXG4gICAgICBpc0N3ZDogdGhpcy5pc0N3ZCxcbiAgICAgIGNoaWxkcmVuOiB0aGlzLmNoaWxkcmVuLFxuICAgICAgY29ubmVjdGlvblRpdGxlOiB0aGlzLmNvbm5lY3Rpb25UaXRsZSxcbiAgICAgIGNoZWNrZWRTdGF0dXM6IHRoaXMuY2hlY2tlZFN0YXR1cyxcbiAgICAgIHN1YnNjcmlwdGlvbjogdGhpcy5zdWJzY3JpcHRpb24sXG5cbiAgICAgIC8vIERlcml2ZWQgZmllbGRzXG4gICAgICBpc1Jvb3Q6IHRoaXMuaXNSb290LFxuICAgICAgbmFtZTogdGhpcy5uYW1lLFxuICAgICAgaGFzaEtleTogdGhpcy5oYXNoS2V5LFxuICAgICAgcmVsYXRpdmVQYXRoOiB0aGlzLnJlbGF0aXZlUGF0aCxcbiAgICAgIGxvY2FsUGF0aDogdGhpcy5sb2NhbFBhdGgsXG4gICAgICBpc0NvbnRhaW5lcjogdGhpcy5pc0NvbnRhaW5lcixcbiAgICAgIHNob3VsZEJlU2hvd246IHRoaXMuc2hvdWxkQmVTaG93bixcbiAgICAgIHNob3VsZEJlU29mdGVuZWQ6IHRoaXMuc2hvdWxkQmVTb2Z0ZW5lZCxcbiAgICAgIHZjc1N0YXR1c0NvZGU6IHRoaXMudmNzU3RhdHVzQ29kZSxcbiAgICAgIGlzSWdub3JlZDogdGhpcy5pc0lnbm9yZWQsXG4gICAgfTtcbiAgfVxuXG4gIHNldElzRXhwYW5kZWQoaXNFeHBhbmRlZDogYm9vbGVhbik6IEZpbGVUcmVlTm9kZSB7XG4gICAgcmV0dXJuIHRoaXMuc2V0KHtpc0V4cGFuZGVkfSk7XG4gIH1cblxuICBzZXRJc1NlbGVjdGVkKGlzU2VsZWN0ZWQ6IGJvb2xlYW4pOiBGaWxlVHJlZU5vZGUge1xuICAgIHJldHVybiB0aGlzLnNldCh7aXNTZWxlY3RlZH0pO1xuICB9XG5cbiAgc2V0SXNMb2FkaW5nKGlzTG9hZGluZzogYm9vbGVhbik6IEZpbGVUcmVlTm9kZSB7XG4gICAgcmV0dXJuIHRoaXMuc2V0KHtpc0xvYWRpbmd9KTtcbiAgfVxuXG4gIHNldElzVHJhY2tlZChpc1RyYWNrZWQ6IGJvb2xlYW4pOiBGaWxlVHJlZU5vZGUge1xuICAgIHJldHVybiB0aGlzLnNldCh7aXNUcmFja2VkfSk7XG4gIH1cblxuICBzZXRJc0N3ZChpc0N3ZDogYm9vbGVhbik6IEZpbGVUcmVlTm9kZSB7XG4gICAgcmV0dXJuIHRoaXMuc2V0KHtpc0N3ZH0pO1xuICB9XG5cbiAgc2V0Q2hpbGRyZW4oY2hpbGRyZW46IEltbXV0YWJsZS5MaXN0PEZpbGVUcmVlTm9kZT4pOiBGaWxlVHJlZU5vZGUge1xuICAgIHJldHVybiB0aGlzLnNldCh7Y2hpbGRyZW59KTtcbiAgfVxuXG4gIHNldENoZWNrZWRTdGF0dXMoY2hlY2tlZFN0YXR1czogTm9kZUNoZWNrZWRTdGF0dXMpOiBGaWxlVHJlZU5vZGUge1xuICAgIHJldHVybiB0aGlzLnNldCh7Y2hlY2tlZFN0YXR1c30pO1xuICB9XG5cbiAgLyoqXG4gICogTm90aWZpZXMgdGhlIG5vZGUgYWJvdXQgdGhlIGNoYW5nZSB0aGF0IGhhcHBlbmVkIGluIHRoZSBjb25maWd1cmF0aW9uIG9iamVjdC4gV2lsbCB0cmlnZ2VyXG4gICogdGhlIGNvbXBsZXRlIHJlY29uc3RydWN0aW9uIG9mIHRoZSBlbnRpcmUgdHJlZSBicmFuY2hcbiAgKi9cbiAgdXBkYXRlQ29uZigpOiBGaWxlVHJlZU5vZGUge1xuICAgIGNvbnN0IGNoaWxkcmVuID0gdGhpcy5jaGlsZHJlbi5tYXAoYyA9PiBjLnVwZGF0ZUNvbmYodGhpcy5jb25mKSk7XG4gICAgcmV0dXJuIHRoaXMubmV3Tm9kZSh7Y2hpbGRyZW59LCB0aGlzLmNvbmYpO1xuICB9XG5cbiAgLyoqXG4gICogQ3JlYXRlcyBhIGRlY2VuZGFudCBub2RlIHRoYXQgaW5oZXJpdHMgbWFueSBvZiB0aGUgcHJvcGVydGllcyAocm9vdFVyaSwgcmVwbywgZXRjKVxuICAqIFRoZSBjcmVhdGVkIG5vZGUgZG9lcyBub3QgaGF2ZSB0byBiZSBhIGRpcmVjdCBkZWNlbmRhbnQgYW5kIG1vcmVvdmVyIGl0IGlzIG5vdCBhc3NpZ25lZFxuICAqIGF1dG9tYXRpY2FsbHkgaW4gYW55IHdheSB0byB0aGUgbGlzdCBvZiBjdXJyZW50IG5vZGUgY2hpbGRyZW4uXG4gICovXG4gIGNyZWF0ZUNoaWxkKG9wdGlvbnM6IEZpbGVUcmVlQ2hpbGROb2RlT3B0aW9ucyk6IEZpbGVUcmVlTm9kZSB7XG4gICAgcmV0dXJuIG5ldyBGaWxlVHJlZU5vZGUoe1xuICAgICAgLi4udGhpcy5fYnVpbGRPcHRpb25zKCksXG4gICAgICBpc0N3ZDogZmFsc2UsXG4gICAgICBjb25uZWN0aW9uVGl0bGU6ICcnLFxuICAgICAgY2hlY2tlZFN0YXR1czogKHRoaXMuY2hlY2tlZFN0YXR1cyA9PT0gJ3BhcnRpYWwnKSA/ICdjbGVhcicgOiB0aGlzLmNoZWNrZWRTdGF0dXMsXG4gICAgICBjaGlsZHJlbjogbmV3IEltbXV0YWJsZS5PcmRlcmVkTWFwKCksXG4gICAgICAuLi5vcHRpb25zLFxuICAgIH0sXG4gICAgdGhpcy5jb25mLFxuICAgICk7XG4gIH1cblxuICAvKipcbiAgKiBVc2VkIHRvIG1vZGlmeSBzZXZlcmFsIHByb3BlcnRpZXMgYXQgb25jZSBhbmQgc2tpcCB1bm5lY2Vzc2FyeSBjb25zdHJ1Y3Rpb24gb2YgaW50ZXJtZWRpYXRlXG4gICogaW5zdGFuY2VzLiBGb3IgZXhhbXBsZTpcbiAgKiBjb25zdCBuZXdOb2RlID0gbm9kZS5zZXQoe2lzRXhwYW5kZWQ6IHRydWUsIGlzU2VsZWN0ZWQ6IGZhbHNlfSk7XG4gICovXG4gIHNldChwcm9wczogSW1tdXRhYmxlTm9kZVNldHRhYmxlRmllbGRzKTogRmlsZVRyZWVOb2RlIHtcbiAgICBpZiAodGhpcy5fcHJvcHNBcmVUaGVTYW1lKHByb3BzKSkge1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMubmV3Tm9kZShwcm9wcywgdGhpcy5jb25mLCBmYWxzZSk7XG4gIH1cblxuICAvKipcbiAgKiBQZXJmb3JtcyBhbiB1cGRhdGUgb2YgYSB0cmVlIGJyYW5jaC4gUmVjZWl2ZXMgdHdvIG9wdGlvbmFsIHByZWRpY2F0ZXNcbiAgKlxuICAqIFRoZSBgcHJlUHJlZGljYXRlYCBpcyBpbnZva2VkIGF0IHByZS1kZXNjZW50LiBJZiB0aGUgcHJlZGljYXRlIHJldHVybnMgYSBub24tbnVsbFxuICAqIHZhbHVlIGl0IHNpZ25pZmllcyB0aGF0IHRoZSBoYW5kbGluZyBvZiB0aGUgc3ViLWJyYW5jaCBpcyBjb21wbGV0ZSBhbmQgdGhlIGRlc2NlbnQgdG8gY2hpbGRyZW5cbiAgKiBpcyBub3QgcGVyZm9ybWVkLlxuICAqXG4gICogVGhlIGBwb3N0UHJlZGljYXRlYCBpcyBpbnZva2VkIG9uIHRoZSB3YXkgdXAuIEl0IGhhcyB0byByZXR1cm4gYSBub24tbnVsbCBub2RlLCBidXQgaXQgbWF5XG4gICogYmUgdGhlIHNhbWUgaW5zdGFuY2UgYXMgaXQgd2FzIGNhbGxlZCB3aXRoLlxuICAqL1xuICBzZXRSZWN1cnNpdmUoXG4gICAgcHJlUHJlZGljYXRlOiA/KChub2RlOiBGaWxlVHJlZU5vZGUpID0+ID9GaWxlVHJlZU5vZGUpLFxuICAgIHBvc3RQcmVkaWNhdGU6ICgobm9kZTogRmlsZVRyZWVOb2RlKSA9PiBGaWxlVHJlZU5vZGUpID0gbiA9PiBuLFxuICApOiBGaWxlVHJlZU5vZGUge1xuICAgIGlmIChwcmVQcmVkaWNhdGUgIT0gbnVsbCkge1xuICAgICAgY29uc3QgbmV3Tm9kZSA9IHByZVByZWRpY2F0ZSh0aGlzKTtcbiAgICAgIGlmIChuZXdOb2RlICE9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHBvc3RQcmVkaWNhdGUobmV3Tm9kZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgY2hpbGRyZW4gPSB0aGlzLmNoaWxkcmVuLm1hcChjaGlsZCA9PiBjaGlsZC5zZXRSZWN1cnNpdmUocHJlUHJlZGljYXRlLCBwb3N0UHJlZGljYXRlKSk7XG4gICAgcmV0dXJuIHBvc3RQcmVkaWNhdGUodGhpcy5zZXRDaGlsZHJlbihjaGlsZHJlbikpO1xuICB9XG5cbiAgLyoqXG4gICogVXBkYXRlcyBhIHNpbmdsZSBjaGlsZCBpbiB0aGUgbWFwIG9mIGNoaWxkcmVuLiBUaGUgbWV0aG9kIG9ubHkgcmVjZWl2ZXMgdGhlIG5ldyBjaGlsZCBpbnN0YW5jZVxuICAqIGFuZCB0aGUgcmV0cmlldmFsIGluIGZyb20gdGhlIG1hcCBpcyBwZXJmb3JtZWQgYnkgdGhlIGNoaWxkJ3MgbmFtZS4gVGhpcyB1c2VzIHRoZSBmYWN0XG4gICogdGhhdCBjaGlsZHJlbiBuYW1lcyAoZGVyaXZlZCBmcm9tIHRoZWlyIHVyaXMpIGFyZSB1bm1vZGlmaWFibGUuIFRodXMgd2Ugd29uJ3QgZXZlciBoYXZlIGFcbiAgKiBwcm9ibGVtIGxvY2F0aW5nIHRoZSB2YWx1ZSB0aGF0IHdlIG5lZWQgdG8gcmVwbGFjZS5cbiAgKi9cbiAgdXBkYXRlQ2hpbGQobmV3Q2hpbGQ6IEZpbGVUcmVlTm9kZSk6IEZpbGVUcmVlTm9kZSB7XG4gICAgY29uc3QgY2hpbGRyZW4gPSB0aGlzLmNoaWxkcmVuLnNldChuZXdDaGlsZC5uYW1lLCBuZXdDaGlsZCk7XG4gICAgcmV0dXJuIHRoaXMuc2V0KHtjaGlsZHJlbn0pO1xuICB9XG5cbiAgLyoqXG4gICogQSBoaWVyYXJjaGljYWwgZXF1aXZhbGVudCBvZiBmb3JFYWNoLiBUaGUgbWV0aG9kIHJlY2VpdmVzIHR3byBwcmVkaWNhdGVzXG4gICogVGhlIGZpcnN0IGlzIGludm9rZWQgdXBvbiBkZXNjZW50IGFuZCB3aXRoIGl0cyByZXR1cm4gdmFsdWUgY29udHJvbHMgd2hldGhlciBuZWVkIHRvIHRyYXZlcnNlXG4gICogZGVlcGVyIGludG8gdGhlIHRyZWUuIFRydWUgLSBkZXNjZW5kLCBGYWxzZSAtIGRvbid0LlxuICAqL1xuICB0cmF2ZXJzZShcbiAgICBwcmVDYWxsYmFjazogKG5vZGU6IEZpbGVUcmVlTm9kZSkgPT4gYm9vbGVhbixcbiAgICBwb3N0Q2FsbGJhY2s6IChub2RlOiBGaWxlVHJlZU5vZGUpID0+IHZvaWQgPSAoKCkgPT4ge30pLFxuICApOiB2b2lkIHtcbiAgICBjb25zdCBkZXNjZW5kID0gcHJlQ2FsbGJhY2sodGhpcyk7XG5cbiAgICBpZiAoZGVzY2VuZCkge1xuICAgICAgdGhpcy5jaGlsZHJlbi5mb3JFYWNoKGNoaWxkID0+IGNoaWxkLnRyYXZlcnNlKHByZUNhbGxiYWNrLCBwb3N0Q2FsbGJhY2spKTtcbiAgICB9XG5cbiAgICBwb3N0Q2FsbGJhY2sodGhpcyk7XG4gIH1cblxuICAvKipcbiAgKiBMb29rcyBmb3IgYSBub2RlIHdpdGggdGhlIGdpdmVuIFVSSSBpbiB0aGUgc3ViIGJyYW5jaCAtIHJldHVybnMgbnVsbCBpZiBub3QgZm91bmRcbiAgKi9cbiAgZmluZCh1cmk6IE51Y2xpZGVVcmkpOiA/RmlsZVRyZWVOb2RlIHtcbiAgICBjb25zdCBkZWVwZXN0Rm91bmQgPSB0aGlzLmZpbmREZWVwZXN0KHVyaSk7XG5cbiAgICBpZiAoZGVlcGVzdEZvdW5kID09IG51bGwgfHwgZGVlcGVzdEZvdW5kLnVyaSAhPT0gdXJpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICByZXR1cm4gZGVlcGVzdEZvdW5kO1xuICB9XG5cbiAgLyoqXG4gICogTG9va3MgZm9yIGEgbm9kZSB3aXRoIHRoZSBnaXZlbiBVUkkgaW4gdGhlIHN1YiBicmFuY2ggLSByZXR1cm5zIHRoZSBkZWVwZXN0IGZvdW5kIGFuY2Vzc3RvclxuICAqIG9mIHRoZSBub2RlIGJlaW5nIGxvb2tlZCBmb3IuXG4gICogUmV0dXJucyBudWxsIGlmIHRoZSBub2RlIGNhbiBub3QgYmVsb25nIHRvIHRoZSBzdWItYnJhbmNoXG4gICovXG4gIGZpbmREZWVwZXN0KHVyaTogTnVjbGlkZVVyaSk6ID9GaWxlVHJlZU5vZGUge1xuICAgIGlmICghdXJpLnN0YXJ0c1dpdGgodGhpcy51cmkpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAodXJpID09PSB0aGlzLnVyaSkge1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgY29uc3Qgc3ViVXJpID0gdXJpLnNsaWNlKHRoaXMudXJpLmxlbmd0aCk7XG4gICAgY29uc3QgY2hpbGROYW1lUGF0aCA9IHN1YlVyaS5zcGxpdChwYXRoLnNlcCkuZmlsdGVyKHBhcnQgPT4gcGFydCAhPT0gJycpO1xuICAgIHJldHVybiB0aGlzLl9maW5kTGFzdEJ5TmFtZVBhdGgoY2hpbGROYW1lUGF0aCk7XG4gIH1cblxuICAvKipcbiAgKiBGaW5kcyB0aGUgbmV4dCBub2RlIGluIHRoZSB0cmVlIGluIHRoZSBuYXR1cmFsIG9yZGVyIC0gZnJvbSB0b3AgdG8gdG8gYm90dG9tIGFzIGlzIGRpc3BsYXllZFxuICAqIGluIHRoZSBmaWxlLXRyZWUgcGFuZWwsIG1pbnVzIHRoZSBpbmRlbnRhdGlvbi4gT25seSB0aGUgbm9kZXMgdGhhdCBzaG91bGQgYmUgc2hvd24gYXJlIHJldHVybmVkLlxuICAqL1xuICBmaW5kTmV4dCgpOiA/RmlsZVRyZWVOb2RlIHtcbiAgICBpZiAoIXRoaXMuc2hvdWxkQmVTaG93bikge1xuICAgICAgaWYgKHRoaXMucGFyZW50ICE9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyZW50LmZpbmROZXh0KCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmlzQ29udGFpbmVyICYmIHRoaXMuaXNFeHBhbmRlZCAmJiAhdGhpcy5jaGlsZHJlbi5pc0VtcHR5KCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmNoaWxkcmVuLmZpbmQoYyA9PiBjLnNob3VsZEJlU2hvd24pO1xuICAgIH1cblxuICAgIC8qIGVzbGludC1kaXNhYmxlIGNvbnNpc3RlbnQtdGhpcyAqL1xuICAgIC8vIE5vdCByZWFsbHkgYW4gYWxpYXMsIGJ1dCBhbiBpdGVyYXRpbmcgcmVmZXJlbmNlXG4gICAgbGV0IGl0ID0gdGhpcztcbiAgICAvKiBlc2xpbnQtZW5hYmxlIGNvbnNpc3RlbnQtdGhpcyAqL1xuICAgIHdoaWxlIChpdCAhPSBudWxsKSB7XG4gICAgICBjb25zdCBuZXh0U2hvd25TaWJsaW5nID0gaXQuZmluZE5leHRTaG93blNpYmxpbmcoKTtcbiAgICAgIGlmIChuZXh0U2hvd25TaWJsaW5nICE9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIG5leHRTaG93blNpYmxpbmc7XG4gICAgICB9XG5cbiAgICAgIGl0ID0gaXQucGFyZW50O1xuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgZmluZE5leHRTaG93blNpYmxpbmcoKTogP0ZpbGVUcmVlTm9kZSB7XG4gICAgLyogZXNsaW50LWRpc2FibGUgY29uc2lzdGVudC10aGlzICovXG4gICAgLy8gTm90IHJlYWxseSBhbiBhbGlhcywgYnV0IGFuIGl0ZXJhdGluZyByZWZlcmVuY2VcbiAgICBsZXQgaXQgPSB0aGlzLm5leHRTaWJsaW5nO1xuICAgIC8qIGVzbGludC1lbmFibGUgY29uc2lzdGVudC10aGlzICovXG4gICAgd2hpbGUgKGl0ICE9IG51bGwgJiYgIWl0LnNob3VsZEJlU2hvd24pIHtcbiAgICAgIGl0ID0gaXQubmV4dFNpYmxpbmc7XG4gICAgfVxuXG4gICAgcmV0dXJuIGl0O1xuICB9XG5cbiAgLyoqXG4gICogRmluZHMgdGhlIHByZXZpb3VzIG5vZGUgaW4gdGhlIHRyZWUgaW4gdGhlIG5hdHVyYWwgb3JkZXIgLSBmcm9tIHRvcCB0byB0byBib3R0b20gYXMgaXMgZGlzcGxheWVkXG4gICogaW4gdGhlIGZpbGUtdHJlZSBwYW5lbCwgbWludXMgdGhlIGluZGVudGF0aW9uLiBPbmx5IHRoZSBub2RlcyB0aGF0IHNob3VsZCBiZSBzaG93biBhcmUgcmV0dXJuZWQuXG4gICovXG4gIGZpbmRQcmV2aW91cygpOiA/RmlsZVRyZWVOb2RlIHtcbiAgICBpZiAoIXRoaXMuc2hvdWxkQmVTaG93bikge1xuICAgICAgaWYgKHRoaXMucGFyZW50ICE9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyZW50LmZpbmRQcmV2aW91cygpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCBwcmV2U2hvd25TaWJsaW5nID0gdGhpcy5maW5kUHJldlNob3duU2libGluZygpO1xuICAgIGlmIChwcmV2U2hvd25TaWJsaW5nICE9IG51bGwpIHtcbiAgICAgIHJldHVybiBwcmV2U2hvd25TaWJsaW5nLmZpbmRMYXN0UmVjdXJzaXZlQ2hpbGQoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5wYXJlbnQ7XG4gIH1cblxuICBmaW5kUHJldlNob3duU2libGluZygpOiA/RmlsZVRyZWVOb2RlIHtcbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBjb25zaXN0ZW50LXRoaXMgKi9cbiAgICAvLyBOb3QgcmVhbGx5IGFuIGFsaWFzLCBidXQgYW4gaXRlcmF0aW5nIHJlZmVyZW5jZVxuICAgIGxldCBpdCA9IHRoaXMucHJldlNpYmxpbmc7XG4gICAgLyogZXNsaW50LWVuYWJsZSBjb25zaXN0ZW50LXRoaXMgKi9cbiAgICB3aGlsZSAoaXQgIT0gbnVsbCAmJiAhaXQuc2hvdWxkQmVTaG93bikge1xuICAgICAgaXQgPSBpdC5wcmV2U2libGluZztcbiAgICB9XG5cbiAgICByZXR1cm4gaXQ7XG4gIH1cblxuICAvKipcbiAgKiBSZXR1cm5zIHRoZSBsYXN0IHNob3duIGRlc2NlbmRhbnQgYWNjb3JkaW5nIHRvIHRoZSBuYXR1cmFsIHRyZWUgb3JkZXIgYXMgaXMgdG8gYmUgZGlzcGxheWVkIGJ5XG4gICogdGhlIGZpbGUtdHJlZSBwYW5lbC4gKExhc3QgY2hpbGQgb2YgdGhlIGxhc3QgY2hpbGQgb2YgdGhlIGxhc3QgY2hpbGQuLi4pXG4gICogT3IgbnVsbCwgaWYgbm9uZSBhcmUgZm91bmRcbiAgKi9cbiAgZmluZExhc3RSZWN1cnNpdmVDaGlsZCgpOiA/RmlsZVRyZWVOb2RlIHtcbiAgICBpZiAoIXRoaXMuaXNDb250YWluZXIgfHwgIXRoaXMuaXNFeHBhbmRlZCB8fCB0aGlzLmNoaWxkcmVuLmlzRW1wdHkoKSkge1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgbGV0IGl0ID0gdGhpcy5jaGlsZHJlbi5sYXN0KCk7XG4gICAgd2hpbGUgKCFpdC5zaG91bGRCZVNob3duICYmIGl0ICE9IG51bGwpIHtcbiAgICAgIGl0ID0gaXQucHJldlNpYmxpbmc7XG4gICAgfVxuXG4gICAgaWYgKGl0ID09IG51bGwpIHtcbiAgICAgIGlmICh0aGlzLnNob3VsZEJlU2hvd24pIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5maW5kUHJldmlvdXMoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGl0LmZpbmRMYXN0UmVjdXJzaXZlQ2hpbGQoKTtcbiAgICB9XG4gIH1cblxuICBfYnVpbGREZXJpdmVkRmllbGRzKHVyaTogTnVjbGlkZVVyaSwgcm9vdFVyaTogTnVjbGlkZVVyaSwgY29uZjogU3RvcmVDb25maWdEYXRhKTogT2JqZWN0IHtcbiAgICBjb25zdCBpc0NvbnRhaW5lciA9IGlzRGlyS2V5KHVyaSk7XG4gICAgY29uc3Qgcm9vdFZjc1N0YXR1c2VzID0gY29uZi52Y3NTdGF0dXNlc1tyb290VXJpXSB8fCB7fTtcbiAgICBjb25zdCByZXBvID0gY29uZi5yZXBvc0J5Um9vdFtyb290VXJpXTtcbiAgICBjb25zdCBpc0lnbm9yZWQgPSB0aGlzLl9kZXJpdmVJc0lnbm9yZWQodXJpLCByb290VXJpLCByZXBvLCBjb25mKTtcblxuICAgIHJldHVybiB7XG4gICAgICBpc1Jvb3Q6IHVyaSA9PT0gcm9vdFVyaSxcbiAgICAgIG5hbWU6IGtleVRvTmFtZSh1cmkpLFxuICAgICAgaGFzaEtleTogYnVpbGRIYXNoS2V5KHVyaSksXG4gICAgICBpc0NvbnRhaW5lcixcbiAgICAgIHJlbGF0aXZlUGF0aDogdXJpLnNsaWNlKHJvb3RVcmkubGVuZ3RoKSxcbiAgICAgIGxvY2FsUGF0aDoga2V5VG9QYXRoKGlzUmVtb3RlKHVyaSkgPyBwYXJzZSh1cmkpLnBhdGhuYW1lIDogdXJpKSxcbiAgICAgIGlzSWdub3JlZCxcbiAgICAgIHNob3VsZEJlU2hvd246IHRoaXMuX2Rlcml2ZVNob3VsZEJlU2hvd24odXJpLCByb290VXJpLCBpc0NvbnRhaW5lciwgcmVwbywgY29uZiwgaXNJZ25vcmVkKSxcbiAgICAgIHNob3VsZEJlU29mdGVuZWQ6IHRoaXMuX2Rlcml2ZVNob3VsZEJlU29mdGVuZWQodXJpLCBpc0NvbnRhaW5lciwgY29uZiksXG4gICAgICB2Y3NTdGF0dXNDb2RlOiByb290VmNzU3RhdHVzZXNbdXJpXSB8fCBTdGF0dXNDb2RlTnVtYmVyLkNMRUFOLFxuICAgICAgcmVwbyxcbiAgICB9O1xuICB9XG5cbiAgX2Rlcml2ZVNob3VsZEJlU2hvd24oXG4gICAgdXJpOiBOdWNsaWRlVXJpLFxuICAgIHJvb3RVcmk6IE51Y2xpZGVVcmksXG4gICAgaXNDb250YWluZXI6IGJvb2xlYW4sXG4gICAgcmVwbzogP2F0b20kUmVwb3NpdG9yeSxcbiAgICBjb25mOiBTdG9yZUNvbmZpZ0RhdGEsXG4gICAgaXNJZ25vcmVkOiBib29sZWFuLFxuICApOiBib29sZWFuIHtcbiAgICBpZiAoaXNJZ25vcmVkICYmIGNvbmYuZXhjbHVkZVZjc0lnbm9yZWRQYXRocykge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlmIChjb25mLmhpZGVJZ25vcmVkTmFtZXMgJiYgY29uZi5pZ25vcmVkUGF0dGVybnMuc29tZShwYXR0ZXJuID0+IHBhdHRlcm4ubWF0Y2godXJpKSkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAoY29uZi5pc0VkaXRpbmdXb3JraW5nU2V0KSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBpZiAoaXNDb250YWluZXIpIHtcbiAgICAgIHJldHVybiBjb25mLndvcmtpbmdTZXQuY29udGFpbnNEaXIodXJpKSB8fFxuICAgICAgICAoIWNvbmYub3BlbkZpbGVzV29ya2luZ1NldC5pc0VtcHR5KCkgJiYgY29uZi5vcGVuRmlsZXNXb3JraW5nU2V0LmNvbnRhaW5zRGlyKHVyaSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gY29uZi53b3JraW5nU2V0LmNvbnRhaW5zRmlsZSh1cmkpIHx8XG4gICAgICAgICghY29uZi5vcGVuRmlsZXNXb3JraW5nU2V0LmlzRW1wdHkoKSAmJiBjb25mLm9wZW5GaWxlc1dvcmtpbmdTZXQuY29udGFpbnNGaWxlKHVyaSkpO1xuICAgIH1cbiAgfVxuXG4gIF9kZXJpdmVJc0lnbm9yZWQoXG4gICAgdXJpOiBOdWNsaWRlVXJpLFxuICAgIHJvb3RVcmk6IE51Y2xpZGVVcmksXG4gICAgcmVwbzogP2F0b20kUmVwb3NpdG9yeSxcbiAgICBjb25mOiBTdG9yZUNvbmZpZ0RhdGFcbiAgKTogYm9vbGVhbiB7XG4gICAgaWYgKFxuICAgICAgcmVwbyAhPSBudWxsICYmXG4gICAgICByZXBvLmlzUHJvamVjdEF0Um9vdCgpICYmXG4gICAgICByZXBvLmlzUGF0aElnbm9yZWQodXJpKVxuICAgICkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgX2Rlcml2ZVNob3VsZEJlU29mdGVuZWQoXG4gICAgdXJpOiBOdWNsaWRlVXJpLFxuICAgIGlzQ29udGFpbmVyOiBib29sZWFuLFxuICAgIGNvbmY6IFN0b3JlQ29uZmlnRGF0YSxcbiAgKTogYm9vbGVhbiB7XG4gICAgaWYgKGNvbmYuaXNFZGl0aW5nV29ya2luZ1NldCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlmIChjb25mLndvcmtpbmdTZXQuaXNFbXB0eSgpIHx8IGNvbmYub3BlbkZpbGVzV29ya2luZ1NldC5pc0VtcHR5KCkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAoaXNDb250YWluZXIpIHtcbiAgICAgIGlmIChcbiAgICAgICAgIWNvbmYud29ya2luZ1NldC5jb250YWluc0Rpcih1cmkpICYmXG4gICAgICAgIGNvbmYub3BlbkZpbGVzV29ya2luZ1NldC5jb250YWluc0Rpcih1cmkpKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChcbiAgICAgICAgIWNvbmYud29ya2luZ1NldC5jb250YWluc0ZpbGUodXJpKSAmJlxuICAgICAgICBjb25mLm9wZW5GaWxlc1dvcmtpbmdTZXQuY29udGFpbnNGaWxlKHVyaSkpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICBfcHJvcHNBcmVUaGVTYW1lKHByb3BzOiBPYmplY3QpOiBib29sZWFuIHtcbiAgICBpZiAocHJvcHMuaXNTZWxlY3RlZCAhPT0gdW5kZWZpbmVkICYmIHRoaXMuaXNTZWxlY3RlZCAhPT0gcHJvcHMuaXNTZWxlY3RlZCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBpZiAocHJvcHMuaXNUcmFja2VkICE9PSB1bmRlZmluZWQgJiYgdGhpcy5pc1RyYWNrZWQgIT09IHByb3BzLmlzVHJhY2tlZCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBpZiAocHJvcHMuaXNFeHBhbmRlZCAhPT0gdW5kZWZpbmVkICYmIHRoaXMuaXNFeHBhbmRlZCAhPT0gcHJvcHMuaXNFeHBhbmRlZCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBpZiAocHJvcHMuY2hlY2tlZFN0YXR1cyAhPT0gdW5kZWZpbmVkICYmIHRoaXMuY2hlY2tlZFN0YXR1cyAhPT0gcHJvcHMuY2hlY2tlZFN0YXR1cykge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBpZiAocHJvcHMuaXNMb2FkaW5nICE9PSB1bmRlZmluZWQgJiYgdGhpcy5pc0xvYWRpbmcgIT09IHByb3BzLmlzTG9hZGluZykge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBpZiAocHJvcHMuaXNDd2QgIT09IHVuZGVmaW5lZCAmJiB0aGlzLmlzQ3dkICE9PSBwcm9wcy5pc0N3ZCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBpZiAocHJvcHMuc3Vic2NyaXB0aW9uICE9PSB1bmRlZmluZWQgJiYgdGhpcy5zdWJzY3JpcHRpb24gIT09IHByb3BzLnN1YnNjcmlwdGlvbikge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBpZiAocHJvcHMuY2hpbGRyZW4gIT09IHVuZGVmaW5lZCAmJlxuICAgICAgcHJvcHMuY2hpbGRyZW4gIT09IHRoaXMuY2hpbGRyZW4gJiZcbiAgICAgICFJbW11dGFibGUuaXModGhpcy5jaGlsZHJlbiwgcHJvcHMuY2hpbGRyZW4pKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBuZXdOb2RlKFxuICAgIHByb3BzOiBJbW11dGFibGVOb2RlU2V0dGFibGVGaWVsZHMsXG4gICAgY29uZjogU3RvcmVDb25maWdEYXRhLFxuICAgIGRlcml2ZWRDaGFuZ2U6IGJvb2xlYW4gPSB0cnVlXG4gICk6IEZpbGVUcmVlTm9kZSB7XG4gICAgcmV0dXJuIG5ldyBGaWxlVHJlZU5vZGUoe1xuICAgICAgLi4udGhpcy5fYnVpbGRPcHRpb25zKCksXG4gICAgICAuLi5wcm9wcyxcbiAgICB9LFxuICAgIGNvbmYsXG4gICAgZGVyaXZlZENoYW5nZSxcbiAgICApO1xuICB9XG5cbiAgX2ZpbmRMYXN0QnlOYW1lUGF0aChjaGlsZE5hbWVQYXRoOiBBcnJheTxzdHJpbmc+KTogRmlsZVRyZWVOb2RlIHtcbiAgICBpZiAoY2hpbGROYW1lUGF0aC5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGNvbnN0IGNoaWxkID0gdGhpcy5jaGlsZHJlbi5nZXQoY2hpbGROYW1lUGF0aFswXSk7XG4gICAgaWYgKGNoaWxkID09IG51bGwpIHtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHJldHVybiBjaGlsZC5fZmluZExhc3RCeU5hbWVQYXRoKGNoaWxkTmFtZVBhdGguc2xpY2UoMSkpO1xuICB9XG59XG4iXX0=