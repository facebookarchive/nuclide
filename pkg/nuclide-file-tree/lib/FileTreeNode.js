'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */


import {isDirKey, keyToName, keyToPath, buildHashKey} from './FileTreeHelpers';
import {isRemote, parse} from '../../nuclide-remote-uri';
import Immutable from 'immutable';
import path from 'path';

import type {NuclideUri} from '../../nuclide-remote-uri';
import type {StoreConfigData, NodeCheckedStatus} from './FileTreeStore';
import type {StatusCodeNumberValue} from '../../nuclide-hg-repository-base/lib/HgService';
import {StatusCodeNumber} from '../../nuclide-hg-repository-base/lib/hg-constants';


export type FileTreeChildNodeOptions = {
  uri: NuclideUri;
  isExpanded?: boolean;
  isSelected?: boolean;
  isLoading?: boolean;
  isCwd?: boolean;
  isTracked?: boolean;
  children?: Immutable.OrderedMap<string, FileTreeNode>;
  subscription?: ?IDisposable;
};

// Ideally the type here would be FileTreeChildNodeOptions & {rootUri},
// but flow doesn't handle it well
export type FileTreeNodeOptions = {
  uri: NuclideUri;
  rootUri: NuclideUri;
  isExpanded?: boolean;
  isSelected?: boolean;
  isLoading?: boolean;
  isCwd?: boolean;
  isTracked?: boolean;
  children?: Immutable.OrderedMap<string, FileTreeNode>;
  connectionTitle?: string;
  checkedStatus?: NodeCheckedStatus;
  subscription?: ?IDisposable;
};

type DefaultFileTreeNodeOptions = {
  isExpanded: boolean;
  isSelected: boolean;
  isLoading: boolean;
  isCwd: boolean;
  isTracked: boolean;
  children: Immutable.OrderedMap<string, FileTreeNode>;
  connectionTitle: string;
  checkedStatus: NodeCheckedStatus;
  subscription: ?IDisposable;
};

const DEFAULT_OPTIONS: DefaultFileTreeNodeOptions = {
  isExpanded: false,
  isSelected: false,
  isLoading: false,
  isCwd: false,
  isTracked: false,
  children: new Immutable.OrderedMap(),
  connectionTitle: '',
  checkedStatus: 'clear',
  subscription: null,
};

export type ImmutableNodeSettableFields = {
  isExpanded?: boolean;
  isSelected?: boolean;
  isLoading?: boolean;
  isCwd?: boolean;
  isTracked?: boolean;
  children?: Immutable.OrderedMap<string, FileTreeNode>;
  checkedStatus?: NodeCheckedStatus;
  subscription?: ?IDisposable;
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
export class FileTreeNode {
  // Mutable properties - set when the node is assigned to its parent (and are immutable after)
  parent: ?FileTreeNode;
  nextSibling: ?FileTreeNode;
  prevSibling: ?FileTreeNode;

  conf: StoreConfigData;

  uri: NuclideUri;
  rootUri: NuclideUri;
  isExpanded: boolean;
  isSelected: boolean;
  isLoading: boolean;
  isTracked: boolean;
  isCwd: boolean;
  children: Immutable.OrderedMap<string, FileTreeNode>;
  connectionTitle: string;
  checkedStatus: NodeCheckedStatus;  // For nodes with children - derived from children
  subscription: ?IDisposable;

  // Derived
  isRoot: boolean;
  name: string;
  hashKey: string;
  relativePath: string;
  localPath: string;
  isContainer: boolean;
  shouldBeShown: boolean;
  shouldBeSoftened: boolean;
  vcsStatusCode: StatusCodeNumberValue;
  repo: ?atom$Repository;
  isIgnored: boolean;

  // Derived from children
  containsSelection: boolean;
  containsTrackedNode: boolean;


  /**
  * The children property is an OrderedMap instance keyed by child's name property.
  * This convenience function would create such OrderedMap instance from a plain JS Array
  * of FileTreeNode instances
  */
  static childrenFromArray(
    children: Array<FileTreeNode>
  ): Immutable.OrderedMap<string, FileTreeNode> {
    return new Immutable.OrderedMap(children.map(child => [child.name, child]));
  }

  /**
  * The _derivedChange param is not for external use.
  */
  constructor(options: FileTreeNodeOptions, conf: StoreConfigData, _derivedChange: boolean = true) {
    this.parent = null;
    this.nextSibling = null;
    this.prevSibling = null;
    this.conf = conf;

    this._assignOptions(options);

    // Perf optimization:
    // when conf does not change the derived fields will be passed along with the options
    // it's not type-safe, but it's way more efficient than recalculate them
    if (_derivedChange) {
      const derived = this._buildDerivedFields(options.uri, options.rootUri, conf);
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
  _handleChildren(): void {
    let allChildrenChecked = true;
    let hasCheckedDescendants = false;
    let containsSelection = this.isSelected;
    let containsTrackedNode = this.isTracked;

    let prevChild = null;
    this.children.forEach(c => {
      c.parent = this;

      c.prevSibling = prevChild;
      if (prevChild != null) {
        prevChild.nextSibling = c;
      }
      prevChild = c;

      if (allChildrenChecked && c.checkedStatus !== 'checked') {
        allChildrenChecked = false;
      }

      if (!hasCheckedDescendants &&
        (c.checkedStatus === 'checked' || c.checkedStatus === 'partial')) {
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
  _assignOptions(options: Object): void {
    // Don't pass the 100 chars limit
    const o = options;
    const D = DEFAULT_OPTIONS;

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
  _assignDerived(derived: Object): void {
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
  _buildOptions(): FileTreeNodeOptions {
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
      isIgnored: this.isIgnored,
    };
  }

  setIsExpanded(isExpanded: boolean): FileTreeNode {
    return this.set({isExpanded});
  }

  setIsSelected(isSelected: boolean): FileTreeNode {
    return this.set({isSelected});
  }

  setIsLoading(isLoading: boolean): FileTreeNode {
    return this.set({isLoading});
  }

  setIsTracked(isTracked: boolean): FileTreeNode {
    return this.set({isTracked});
  }

  setIsCwd(isCwd: boolean): FileTreeNode {
    return this.set({isCwd});
  }

  setChildren(children: Immutable.List<FileTreeNode>): FileTreeNode {
    return this.set({children});
  }

  setCheckedStatus(checkedStatus: NodeCheckedStatus): FileTreeNode {
    return this.set({checkedStatus});
  }

  /**
  * Notifies the node about the change that happened in the configuration object. Will trigger
  * the complete reconstruction of the entire tree branch
  */
  updateConf(): FileTreeNode {
    const children = this.children.map(c => c.updateConf(this.conf));
    return this.newNode({children}, this.conf);
  }

  /**
  * Creates a decendant node that inherits many of the properties (rootUri, repo, etc)
  * The created node does not have to be a direct decendant and moreover it is not assigned
  * automatically in any way to the list of current node children.
  */
  createChild(options: FileTreeChildNodeOptions): FileTreeNode {
    return new FileTreeNode({
      ...this._buildOptions(),
      isCwd: false,
      connectionTitle: '',
      checkedStatus: (this.checkedStatus === 'partial') ? 'clear' : this.checkedStatus,
      children: new Immutable.OrderedMap(),
      ...options,
    },
    this.conf,
    );
  }

  /**
  * Used to modify several properties at once and skip unnecessary construction of intermediate
  * instances. For example:
  * const newNode = node.set({isExpanded: true, isSelected: false});
  */
  set(props: ImmutableNodeSettableFields): FileTreeNode {
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
  setRecursive(
    prePredicate: ?((node: FileTreeNode) => ?FileTreeNode),
    postPredicate: ((node: FileTreeNode) => FileTreeNode) = n => n,
  ): FileTreeNode {
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
  updateChild(newChild: FileTreeNode): FileTreeNode {
    const children = this.children.set(newChild.name, newChild);
    return this.set({children});
  }

  /**
  * A hierarchical equivalent of forEach. The method receives two predicates
  * The first is invoked upon descent and with its return value controls whether need to traverse
  * deeper into the tree. True - descend, False - don't.
  */
  traverse(
    preCallback: (node: FileTreeNode) => boolean,
    postCallback: (node: FileTreeNode) => void = (() => {}),
  ): void {
    const descend = preCallback(this);

    if (descend) {
      this.children.forEach(child => child.traverse(preCallback, postCallback));
    }

    postCallback(this);
  }

  /**
  * Looks for a node with the given URI in the sub branch - returns null if not found
  */
  find(uri: NuclideUri): ?FileTreeNode {
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
  findDeepest(uri: NuclideUri): ?FileTreeNode {
    if (!uri.startsWith(this.uri)) {
      return null;
    }

    if (uri === this.uri) {
      return this;
    }

    const subUri = uri.slice(this.uri.length);
    const childNamePath = subUri.split(path.sep).filter(part => part !== '');
    return this._findLastByNamePath(childNamePath);
  }

  /**
  * Finds the next node in the tree in the natural order - from top to to bottom as is displayed
  * in the file-tree panel, minus the indentation. Only the nodes that should be shown are returned.
  */
  findNext(): ?FileTreeNode {
    if (!this.shouldBeShown) {
      if (this.parent != null) {
        return this.parent.findNext();
      }

      return null;
    }

    if (this.isContainer && this.isExpanded && !this.children.isEmpty()) {
      return this.children.find(c => c.shouldBeShown);
    }

    /* eslint-disable consistent-this */
    // Not really an alias, but an iterating reference
    let it = this;
    /* eslint-enable consistent-this */
    while (it != null) {
      const nextShownSibling = it.findNextShownSibling();
      if (nextShownSibling != null) {
        return nextShownSibling;
      }

      it = it.parent;
    }

    return null;
  }

  findNextShownSibling(): ?FileTreeNode {
    /* eslint-disable consistent-this */
    // Not really an alias, but an iterating reference
    let it = this.nextSibling;
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
  findPrevious(): ?FileTreeNode {
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

  findPrevShownSibling(): ?FileTreeNode {
    /* eslint-disable consistent-this */
    // Not really an alias, but an iterating reference
    let it = this.prevSibling;
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
  findLastRecursiveChild(): ?FileTreeNode {
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

  _buildDerivedFields(uri: NuclideUri, rootUri: NuclideUri, conf: StoreConfigData): Object {
    const isContainer = isDirKey(uri);
    const rootVcsStatuses = conf.vcsStatuses[rootUri] || {};
    const repo = conf.reposByRoot[rootUri];
    const isIgnored = this._deriveIsIgnored(uri, rootUri, repo, conf);

    return {
      isRoot: uri === rootUri,
      name: keyToName(uri),
      hashKey: buildHashKey(uri),
      isContainer,
      relativePath: uri.slice(rootUri.length),
      localPath: keyToPath(isRemote(uri) ? parse(uri).pathname : uri),
      isIgnored,
      shouldBeShown: this._deriveShouldBeShown(uri, rootUri, isContainer, repo, conf, isIgnored),
      shouldBeSoftened: this._deriveShouldBeSoftened(uri, isContainer, conf),
      vcsStatusCode: rootVcsStatuses[uri] || StatusCodeNumber.CLEAN,
      repo,
    };
  }

  _deriveShouldBeShown(
    uri: NuclideUri,
    rootUri: NuclideUri,
    isContainer: boolean,
    repo: ?atom$Repository,
    conf: StoreConfigData,
    isIgnored: boolean,
  ): boolean {
    if (isIgnored && conf.excludeVcsIgnoredPaths) {
      return false;
    }

    if (conf.hideIgnoredNames && conf.ignoredPatterns.some(pattern => pattern.match(uri))) {
      return false;
    }

    if (conf.isEditingWorkingSet) {
      return true;
    }

    if (isContainer) {
      return conf.workingSet.containsDir(uri) ||
        (!conf.openFilesWorkingSet.isEmpty() && conf.openFilesWorkingSet.containsDir(uri));
    } else {
      return conf.workingSet.containsFile(uri) ||
        (!conf.openFilesWorkingSet.isEmpty() && conf.openFilesWorkingSet.containsFile(uri));
    }
  }

  _deriveIsIgnored(
    uri: NuclideUri,
    rootUri: NuclideUri,
    repo: ?atom$Repository,
    conf: StoreConfigData
  ): boolean {
    if (
      repo != null &&
      repo.isProjectAtRoot() &&
      repo.isPathIgnored(uri)
    ) {
      return true;
    }

    return false;
  }

  _deriveShouldBeSoftened(
    uri: NuclideUri,
    isContainer: boolean,
    conf: StoreConfigData,
  ): boolean {
    if (conf.isEditingWorkingSet) {
      return false;
    }

    if (conf.workingSet.isEmpty() || conf.openFilesWorkingSet.isEmpty()) {
      return false;
    }

    if (isContainer) {
      if (
        !conf.workingSet.containsDir(uri) &&
        conf.openFilesWorkingSet.containsDir(uri)) {
        return true;
      }

      return false;
    } else {
      if (
        !conf.workingSet.containsFile(uri) &&
        conf.openFilesWorkingSet.containsFile(uri)) {
        return true;
      }

      return false;
    }
  }

  _propsAreTheSame(props: Object): boolean {
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
    if (props.children !== undefined &&
      props.children !== this.children &&
      !Immutable.is(this.children, props.children)) {
      return false;
    }

    return true;
  }

  newNode(
    props: ImmutableNodeSettableFields,
    conf: StoreConfigData,
    derivedChange: boolean = true
  ): FileTreeNode {
    return new FileTreeNode({
      ...this._buildOptions(),
      ...props,
    },
    conf,
    derivedChange,
    );
  }

  _findLastByNamePath(childNamePath: Array<string>): FileTreeNode {
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
