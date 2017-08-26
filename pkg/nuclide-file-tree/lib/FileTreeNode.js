'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FileTreeNode = undefined;

var _MemoizedFieldsDeriver;

function _load_MemoizedFieldsDeriver() {
  return _MemoizedFieldsDeriver = require('./MemoizedFieldsDeriver');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _immutable;

function _load_immutable() {
  return _immutable = _interopRequireDefault(require('immutable'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const DEFAULT_OPTIONS = {
  isExpanded: false,
  isSelected: false,
  isFocused: false,
  isDragHovered: false,
  isBeingReordered: false,
  isLoading: false,
  wasFetched: false,
  isCwd: false,
  isTracked: false,
  children: new (_immutable || _load_immutable()).default.OrderedMap(),
  connectionTitle: '',
  subscription: null,
  highlightedText: '',
  matchesFilter: true,
  isPendingLoad: false
}; /**
    * Copyright (c) 2015-present, Facebook, Inc.
    * All rights reserved.
    *
    * This source code is licensed under the license found in the LICENSE file in
    * the root directory of this source tree.
    *
    * 
    * @format
    */

/**
* OVERVIEW
*   The FileTreeNode class is almost entirely immutable. Except for the parent and the sibling
* links no properties are to be updated after the creation.
*
*   The class contains multiple derived fields. The derived fields are calculated from the options,
* from the configuration values and even from children's properties. Once calculated the properties
* are immutable. This calculation is handled by a separate class - `MemoizedFieldsDeriver`. It
* is optimized to avoid redundant recalculations.
*
*   Setting any of the properties (except for the aforementioned links to parent and siblings) will
* create a new instance of the class, with required properties set. If, however, the set operation
* is a no-op (such if setting a property to the same value it already has), new instance creation
* is not skipped and same instance is returned instead.
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
* This means that we must avoid the state when same node node is contained in the .children map
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
*/
class FileTreeNode {

  /**
  * The children property is an OrderedMap instance keyed by child's name property.
  * This convenience function would create such OrderedMap instance from a plain JS Array
  * of FileTreeNode instances
  */
  static childrenFromArray(children) {
    return new (_immutable || _load_immutable()).default.OrderedMap(children.map(child => [child.name, child]));
  }

  /**
  * The _derivedChange param is not for external use.
  */


  // Derived from children


  // Derived

  // Mutable properties - set when the node is assigned to its parent (and are immutable after)
  constructor(options, conf, _deriver = null) {
    this.parent = null;
    this.nextSibling = null;
    this.prevSibling = null;
    this.conf = conf;

    this._assignOptions(options);

    this._deriver = _deriver || new (_MemoizedFieldsDeriver || _load_MemoizedFieldsDeriver()).MemoizedFieldsDeriver(options.uri, options.rootUri);
    const derived = this._deriver.buildDerivedFields(conf);
    this._assignDerived(derived);

    this._handleChildren();
  }

  /**
  * Sets the links from the children to this instance (their parent) and the links between the
  * siblings.
  *   Additionally calculates the properties derived from children and assigns them to this instance
  */
  _handleChildren() {
    let containsSelection = this.isSelected;
    let containsDragHover = this.isDragHovered;
    let containsTrackedNode = this.isTracked;
    let containsFilterMatches = this.matchesFilter;
    let containsHidden = !this.shouldBeShown;
    let childrenAreLoading = this.childrenAreLoading || this.isLoading;
    let childCountIfNotPendingLoad = 0;

    let prevChild = null;
    this.children.forEach(c => {
      c.parent = this;

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

      if (this.shouldBeShown && this.isExpanded) {
        childCountIfNotPendingLoad += c.shownChildrenCount;
      }

      if (!containsHidden && c.containsHidden) {
        containsHidden = true;
      }

      if (!childrenAreLoading && c.childrenAreLoading) {
        childrenAreLoading = true;
      }
    });
    if (prevChild != null) {
      prevChild.nextSibling = null;
    }

    this.containsSelection = containsSelection;
    this.containsDragHover = containsDragHover;
    this.containsTrackedNode = containsTrackedNode;
    this.containsFilterMatches = containsFilterMatches;
    this.containsHidden = containsHidden;
    this.childrenAreLoading = childrenAreLoading;

    this.isPendingLoad = this.isPendingLoad && childrenAreLoading;
    let shownChildrenCount = this.shouldBeShown ? 1 : 0;
    if (!this.isPendingLoad) {
      shownChildrenCount += childCountIfNotPendingLoad;
    }
    this.shownChildrenCount = shownChildrenCount;
  }

  /**
  * Using object.assign() was proven to be less performant than direct named assignment
  * Since in heavy updates, nodes are created by the thousands we need to keep the creation
  * flow performant.
  */
  _assignOptions(options) {
    // Don't pass the 100 chars limit
    const o = options;
    const D = DEFAULT_OPTIONS;

    this.uri = o.uri;
    this.rootUri = o.rootUri;
    this.isExpanded = o.isExpanded !== undefined ? o.isExpanded : D.isExpanded;
    this.isSelected = o.isSelected !== undefined ? o.isSelected : D.isSelected;
    this.isFocused = o.isFocused !== undefined ? o.isFocused : D.isFocused;
    this.isDragHovered = o.isDragHovered !== undefined ? o.isDragHovered : D.isDragHovered;
    this.isBeingReordered = o.isBeingReordered !== undefined ? o.isBeingReordered : D.isBeingReordered;
    this.isLoading = o.isLoading !== undefined ? o.isLoading : D.isLoading;
    this.wasFetched = o.wasFetched !== undefined ? o.wasFetched : D.wasFetched;
    this.isTracked = o.isTracked !== undefined ? o.isTracked : D.isTracked;
    this.isCwd = o.isCwd !== undefined ? o.isCwd : D.isCwd;
    this.children = o.children !== undefined ? o.children : D.children;
    this.connectionTitle = o.connectionTitle !== undefined ? o.connectionTitle : D.connectionTitle;
    this.subscription = o.subscription !== undefined ? o.subscription : D.subscription;
    this.highlightedText = o.highlightedText !== undefined ? o.highlightedText : D.highlightedText;
    this.matchesFilter = o.matchesFilter !== undefined ? o.matchesFilter : D.matchesFilter;
    this.isPendingLoad = o.isPendingLoad !== undefined ? o.isPendingLoad : D.isPendingLoad;
  }

  /**
  * Using object.assign() was proven to be less performant than direct named assignment
  * Since in heavy updates, nodes are created by the thousands we need to keep the creation
  * flow performant.
  */
  _assignDerived(derived) {
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
  _buildOptions() {
    return {
      uri: this.uri,
      rootUri: this.rootUri,
      isExpanded: this.isExpanded,
      isSelected: this.isSelected,
      isFocused: this.isFocused,
      isDragHovered: this.isDragHovered,
      isBeingReordered: this.isBeingReordered,
      isLoading: this.isLoading,
      wasFetched: this.wasFetched,
      isTracked: this.isTracked,
      isCwd: this.isCwd,
      children: this.children,
      connectionTitle: this.connectionTitle,
      subscription: this.subscription,
      highlightedText: this.highlightedText,
      matchesFilter: this.matchesFilter,
      isPendingLoad: this.isPendingLoad
    };
  }

  setIsExpanded(isExpanded) {
    return this.set({ isExpanded });
  }

  setIsSelected(isSelected) {
    return this.set({ isSelected });
  }

  setIsFocused(isFocused) {
    return this.set({ isFocused });
  }

  setIsDragHovered(isDragHovered) {
    return this.set({ isDragHovered });
  }

  setIsBeingReordered(isBeingReordered) {
    return this.setRecursive(node => node.shouldBeShown ? null : node, node => node.shouldBeShown ? node.set({ isBeingReordered }) : node);
  }

  setIsLoading(isLoading) {
    return this.set({ isLoading });
  }

  setIsTracked(isTracked) {
    return this.set({ isTracked });
  }

  setIsCwd(isCwd) {
    return this.set({ isCwd });
  }

  setChildren(children) {
    return this.set({ children });
  }

  /**
  * Notifies the node about the change that happened in the configuration object. Will trigger
  * the complete reconstruction of the entire tree branch
  */
  updateConf() {
    const children = this.children.map(c => c.updateConf(this.conf));
    return this.newNode({ children }, this.conf);
  }

  /**
  * Used to modify several properties at once and skip unnecessary construction of intermediate
  * instances. For example:
  * const newNode = node.set({isExpanded: true, isSelected: false});
  */
  set(props) {
    if (this._propsAreTheSame(props)) {
      return this;
    }

    return this.newNode(props, this.conf);
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
  setRecursive(prePredicate, postPredicate = n => n) {
    if (prePredicate != null) {
      const newNode = prePredicate(this);
      if (newNode != null) {
        return postPredicate(newNode);
      }
    }

    const children = this.children.map(child => child.setRecursive(prePredicate, postPredicate));
    return postPredicate(this.setChildren(children));
  }

  /**
  * Updates a single child in the map of children. The method only receives the new child instance
  * and the retrieval in from the map is performed by the child's name. This uses the fact
  * that children names (derived from their uris) are unmodifiable. Thus we won't ever have a
  * problem locating the value that we need to replace.
  */
  updateChild(newChild) {
    const children = this.children.set(newChild.name, newChild);
    return this.set({ children });
  }

  /**
  * A hierarchical equivalent of forEach. The method receives two predicates
  * The first is invoked upon descent and with its return value controls whether need to traverse
  * deeper into the tree. True - descend, False - don't.
  */
  traverse(preCallback, postCallback = () => {}) {
    const descend = preCallback(this);

    if (descend) {
      this.children.forEach(child => child.traverse(preCallback, postCallback));
    }

    postCallback(this);
  }

  /**
  * Looks for a node with the given URI in the sub branch - returns null if not found
  */
  find(uri) {
    const deepestFound = this.findDeepest(uri);

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
  findDeepest(uri) {
    if (!uri.startsWith(this.uri)) {
      return null;
    }

    if (uri === this.uri) {
      return this;
    }

    const childNamePath = (_nuclideUri || _load_nuclideUri()).default.split((_nuclideUri || _load_nuclideUri()).default.relative(this.uri, uri));
    return this._findLastByNamePath(childNamePath);
  }

  /**
  * Finds the next node in the tree in the natural order - from top to to bottom as is displayed
  * in the file-tree panel, minus the indentation. Only the nodes that should be shown are returned.
  */
  findNext() {
    if (!this.shouldBeShown) {
      if (this.parent != null) {
        return this.parent.findNext();
      }

      return null;
    }

    if (this.shownChildrenCount > 1) {
      return this.children.find(c => c.shouldBeShown);
    }

    // Not really an alias, but an iterating reference
    let it = this;
    while (it != null) {
      const nextShownSibling = it.findNextShownSibling();
      if (nextShownSibling != null) {
        return nextShownSibling;
      }

      it = it.parent;
    }

    return null;
  }

  findNextShownSibling() {
    let it = this.nextSibling;
    while (it != null && !it.shouldBeShown) {
      it = it.nextSibling;
    }

    return it;
  }

  /**
  * Finds the previous node in the tree in the natural order - from top to to bottom as is displayed
  * in the file-tree panel, minus the indentation. Only the nodes that should be shown are returned.
  */
  findPrevious() {
    if (!this.shouldBeShown) {
      if (this.parent != null) {
        return this.parent.findPrevious();
      }

      return null;
    }

    const prevShownSibling = this.findPrevShownSibling();
    if (prevShownSibling != null) {
      return prevShownSibling.findLastRecursiveChild();
    }

    return this.parent;
  }

  findPrevShownSibling() {
    let it = this.prevSibling;
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
  findLastRecursiveChild() {
    if (!this.isContainer || !this.isExpanded || this.children.isEmpty()) {
      return this;
    }

    let it = this.children.last();
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

  getDepth() {
    let it = this.parent;
    let depth = 0;
    while (it != null) {
      it = it.parent;
      depth++;
    }

    return depth;
  }

  /**
   * Calculate the index of current Node w.r.t the top of the tree.
   * The index is zero based.
   * If the node is not shown, the index is for the previous shown node.
   */
  calculateVisualIndex() {
    let index = this.shouldBeShown ? 1 : 0;
    let prev = this.findPrevShownSibling();
    while (prev != null) {
      index += prev.shownChildrenCount;
      prev = prev.findPrevShownSibling();
    }
    return index + (this.parent == null ? 0 : this.parent.calculateVisualIndex());
  }

  _propsAreTheSame(props) {
    if (props.isSelected !== undefined && this.isSelected !== props.isSelected) {
      return false;
    }
    if (props.isFocused !== undefined && this.isFocused !== props.isFocused) {
      return false;
    }
    if (props.isDragHovered !== undefined && this.isDragHovered !== props.isDragHovered) {
      return false;
    }
    if (props.isBeingReordered !== undefined && this.isBeingReordered !== props.isBeingReordered) {
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

    if (props.children !== undefined && props.children !== this.children && !(_immutable || _load_immutable()).default.is(this.children, props.children)) {
      return false;
    }

    if (props.isPendingLoad !== undefined && props.isPendingLoad !== this.isPendingLoad) {
      return false;
    }

    return true;
  }

  newNode(props, conf) {
    return new FileTreeNode(Object.assign({}, this._buildOptions(), props), conf, this._deriver);
  }

  _findLastByNamePath(childNamePath) {
    if (childNamePath.length === 0) {
      return this;
    }

    const child = this.children.get(childNamePath[0]);
    if (child == null) {
      return this;
    }

    return child._findLastByNamePath(childNamePath.slice(1));
  }
}
exports.FileTreeNode = FileTreeNode;