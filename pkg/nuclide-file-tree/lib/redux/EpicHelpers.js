"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fetchChildKeys = fetchChildKeys;
exports.expandNode = expandNode;
exports.expandNodeDeep = expandNodeDeep;
exports.ensureChildNode = ensureChildNode;
exports.setRootKeys = setRootKeys;

function _promise() {
  const data = require("../../../../modules/nuclide-commons/promise");

  _promise = function () {
    return data;
  };

  return data;
}

function Immutable() {
  const data = _interopRequireWildcard(require("immutable"));

  Immutable = function () {
    return data;
  };

  return data;
}

function Actions() {
  const data = _interopRequireWildcard(require("./Actions"));

  Actions = function () {
    return data;
  };

  return data;
}

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

function FileTreeHelpers() {
  const data = _interopRequireWildcard(require("../FileTreeHelpers"));

  FileTreeHelpers = function () {
    return data;
  };

  return data;
}

function Selectors() {
  const data = _interopRequireWildcard(require("../redux/Selectors"));

  Selectors = function () {
    return data;
  };

  return data;
}

function _FileTreeNode() {
  const data = require("../FileTreeNode");

  _FileTreeNode = function () {
    return data;
  };

  return data;
}

function _nuclideRemoteConnection() {
  const data = require("../../../nuclide-remote-connection");

  _nuclideRemoteConnection = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */
const logger = (0, _log4js().getLogger)('nuclide-file-tree'); //
//
// Dragons!
//
// The functions below this point are complicated, intertangled, and generally, have some obvious
// improvements. They're the result of a refactor from a more OO, pre-Redux architecture (hence why
// they accept a reference to the store: they used to be methods). We should strive to rewrite them
// in a more reactive paradigm.
//
//

/**
 * Initiates the fetching of node's children if it's not already in the process.
 * Clears the node's .isLoading property once the fetch is complete.
 * Once the fetch is completed, clears the node's .isLoading property, builds the map of the
 * node's children out of the fetched children URIs and a change subscription is created
 * for the node to monitor future changes.
 */

function fetchChildKeys(store, nodeKey) {
  const existingPromise = Selectors().getLoading(store.getState(), nodeKey);

  if (existingPromise != null) {
    return existingPromise;
  }

  const promise = (0, _promise().timeoutAfterDeadline)((0, _promise().createDeadline)(20000), FileTreeHelpers().fetchChildren(nodeKey)).then(childrenKeys => setFetchedKeys(store, nodeKey, childrenKeys), error => {
    logger.error(`Unable to fetch children for "${nodeKey}".`);
    logger.error('Original error: ', error); // Unless the contents were already fetched in the past
    // collapse the node and clear its loading state on error so the
    // user can retry expanding it.

    store.dispatch(Actions().setRoots(FileTreeHelpers().updateNodeAtAllRoots(Selectors().getRoots(store.getState()), nodeKey, node => {
      if (node.wasFetched) {
        return node.setIsLoading(false);
      }

      return node.set({
        isExpanded: false,
        isLoading: false,
        children: Immutable().OrderedMap()
      });
    })));
    store.dispatch(Actions().clearLoading(nodeKey));
  }).then(() => setGeneratedChildren(store, nodeKey));
  store.dispatch(Actions().setLoading(nodeKey, promise));
  return promise;
}

async function setGeneratedChildren(store, nodeKey) {
  let generatedFileService;

  try {
    generatedFileService = await (0, _nuclideRemoteConnection().awaitGeneratedFileServiceByNuclideUri)(nodeKey);
  } catch (e) {
    logger.warn(`ServerConnection cancelled while getting GeneratedFileService for ${nodeKey}`, e);
    return;
  }

  const generatedFileTypes = await generatedFileService.getGeneratedFileTypes(nodeKey);
  store.dispatch(Actions().setRoots(FileTreeHelpers().updateNodeAtAllRoots(Selectors().getRoots(store.getState()), nodeKey, node => {
    const children = node.children.map(childNode => {
      const generatedType = generatedFileTypes.get(childNode.uri);

      if (generatedType != null) {
        return childNode.setGeneratedStatus(generatedType);
      } else {
        // if in the directory but not specified in the map, assume manual.
        return childNode.setGeneratedStatus('manual');
      }
    });
    return node.set({
      children
    });
  })));
}

function setFetchedKeys(store, nodeKey, childrenKeys = []) {
  const directory = FileTreeHelpers().getDirectoryByKey(nodeKey);
  const nodesToAutoExpand = []; // The node with URI === nodeKey might be present at several roots - update them all

  store.dispatch(Actions().setRoots(FileTreeHelpers().updateNodeAtAllRoots(Selectors().getRoots(store.getState()), nodeKey, node => {
    // Maintain the order fetched from the FS
    const childrenNodes = childrenKeys.map(uri => {
      const prevNode = node.find(uri); // If we already had a child with this URI - keep it

      if (prevNode != null) {
        return prevNode;
      }

      return new (_FileTreeNode().FileTreeNode)({
        uri,
        rootUri: node.rootUri,
        isCwd: uri === Selectors().getCwdKey(store.getState())
      }, Selectors().getConf(store.getState()));
    });

    if (Selectors().getAutoExpandSingleChild(store.getState()) && childrenNodes.length === 1 && childrenNodes[0].isContainer) {
      nodesToAutoExpand.push(childrenNodes[0]);
    }

    const children = _FileTreeNode().FileTreeNode.childrenFromArray(childrenNodes);

    const subscription = node.subscription || makeSubscription(store, nodeKey, directory); // If the fetch indicated that some children were removed - dispose of all
    // their subscriptions

    const removedChildren = node.children.filter(n => !children.has(n.name));
    removedChildren.forEach(c => {
      c.traverse(n => {
        if (n.subscription != null) {
          n.subscription.dispose();
        }

        return true;
      });
    });
    return node.set({
      isLoading: false,
      wasFetched: true,
      children,
      subscription
    });
  })));
  store.dispatch(Actions().clearLoading(nodeKey));
  nodesToAutoExpand.forEach(node => {
    expandNode(store, node.rootUri, node.uri);
  });
}

function expandNode(store, rootKey, nodeKey) {
  const recursivelyExpandNode = node => {
    return node.setIsExpanded(true).setRecursive(n => {
      if (!n.isContainer) {
        return n;
      }

      if (Selectors().getAutoExpandSingleChild(store.getState()) && n.children.size === 1) {
        if (!n.isExpanded) {
          return recursivelyExpandNode(n);
        }

        return null;
      }

      return !n.isExpanded ? n : null;
    }, n => {
      if (n.isContainer && n.isExpanded) {
        fetchChildKeys(store, n.uri);
        return n.setIsLoading(true);
      }

      return n;
    });
  };

  store.dispatch(Actions().setRoots(FileTreeHelpers().updateNodeAtRoot(Selectors().getRoots(store.getState()), rootKey, nodeKey, recursivelyExpandNode)));
}

function makeSubscription(store, nodeKey, directory) {
  if (directory == null) {
    return null;
  }

  let fetchingPromise = null;
  let couldMissUpdate = false;

  try {
    // Here we intentionally circumvent, to a degree, the logic in the fetchChildKeys
    // which wouldn't schedule a new fetch if there is already one running.
    // This is fine for the most cases, but not for the subscription handling, as the
    // subscription is notifying us that something has changed and if a fetch is already in
    // progress then it is racing with the change. Therefore, if we detect that there was a change
    // during the fetch we schedule another right after the first has finished.
    const checkMissed = () => {
      fetchingPromise = null;

      if (couldMissUpdate) {
        fetchKeys();
      }
    };

    const fetchKeys = () => {
      if (fetchingPromise == null) {
        couldMissUpdate = false;
        fetchingPromise = fetchChildKeys(store, nodeKey).then(checkMissed);
      } else {
        couldMissUpdate = true;
      }
    }; // This call might fail if we try to watch a non-existing directory, or if permission denied.


    return directory.onDidChange(() => {
      fetchKeys();
    });
  } catch (ex) {
    /*
        * Log error and mark the directory as dirty so the failed subscription will be attempted
        * again next time the directory is expanded.
        */
    logger.error(`Cannot subscribe to directory "${nodeKey}"`, ex);
    return null;
  }
}
/**
 * Performes a deep BFS scanning expand of contained nodes.
 * returns - a promise fulfilled when the expand operation is finished
 */


function expandNodeDeep(store, rootKey, nodeKey) {
  // Stop the traversal after 100 nodes were added to the tree
  const itNodes = new FileTreeStoreBfsIterator(store, rootKey, nodeKey,
  /* limit */
  100);
  const promise = new Promise(resolve => {
    const expand = () => {
      const traversedNodeKey = itNodes.traversedNode(); // flowlint-next-line sketchy-null-string:off

      if (traversedNodeKey) {
        expandNode(store, rootKey, traversedNodeKey);
        const nextPromise = itNodes.next();

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
 * Performs a breadth-first iteration over the directories of the tree starting
 * with a given node. The iteration stops once a given limit of nodes (both directories
 * and files) were traversed.
 * The node being currently traversed can be obtained by calling .traversedNode()
 * .next() returns a promise that is fulfilled when the traversal moves on to
 * the next directory.
 */


class FileTreeStoreBfsIterator {
  constructor(store, rootKey, nodeKey, limit) {
    this._store = store;
    this._rootKey = rootKey;
    this._nodesToTraverse = [];
    this._currentlyTraversedNode = nodeKey;
    this._limit = limit;
    this._numNodesTraversed = 0;
    this._promise = null;
    this._count = 0;
  }

  _handlePromiseResolution(childrenKeys) {
    this._numNodesTraversed += childrenKeys.length;

    if (this._numNodesTraversed < this._limit) {
      const nextLevelNodes = childrenKeys.filter(childKey => FileTreeHelpers().isDirOrArchiveKey(childKey));
      this._nodesToTraverse = this._nodesToTraverse.concat(nextLevelNodes);
      this._currentlyTraversedNode = this._nodesToTraverse.splice(0, 1)[0];
      this._promise = null;
    } else {
      this._currentlyTraversedNode = null;
      this._promise = null;
    }

    return;
  }

  next() {
    const currentlyTraversedNode = this._currentlyTraversedNode; // flowlint-next-line sketchy-null-string:off

    if (!this._promise && currentlyTraversedNode) {
      this._promise = promiseNodeChildKeys(this._store, this._rootKey, currentlyTraversedNode).then(this._handlePromiseResolution.bind(this));
    }

    return this._promise;
  }

  traversedNode() {
    return this._currentlyTraversedNode;
  }

}
/**
 * The node child keys may either be available immediately (cached), or
 * require an async fetch. If all of the children are needed it's easier to
 * return as promise, to make the caller oblivious to the way children were
 * fetched.
 */


async function promiseNodeChildKeys(store, rootKey, nodeKey) {
  const shownChildrenUris = node => {
    return node.children.valueSeq().toArray().filter(n => n.shouldBeShown).map(n => n.uri);
  };

  const node = Selectors().getNode(store.getState(), rootKey, nodeKey);

  if (node == null) {
    return [];
  }

  if (!node.isLoading) {
    return shownChildrenUris(node);
  }

  await fetchChildKeys(store, nodeKey);
  return promiseNodeChildKeys(store, rootKey, nodeKey);
}
/**
 * Makes sure a certain child node is present in the file tree, creating all its ancestors, if
 * needed and scheduling a child key fetch. Used by the reveal active file functionality.
 */


function ensureChildNode(store, nodeKey) {
  let firstRootUri;

  const expandNode_ = node => {
    if (node.isExpanded && node.subscription != null) {
      return node;
    }

    if (node.subscription != null) {
      node.subscription.dispose();
    }

    const directory = FileTreeHelpers().getDirectoryByKey(node.uri);
    const subscription = makeSubscription(store, node.uri, directory);
    return node.set({
      subscription,
      isExpanded: true
    });
  };

  const prevRoots = Selectors().getRoots(store.getState());
  const nextRoots = prevRoots.map(root => {
    if (!nodeKey.startsWith(root.uri)) {
      return root;
    }

    if (firstRootUri == null) {
      firstRootUri = root.uri;
    }

    const deepest = root.findDeepest(nodeKey);

    if (deepest == null) {
      return root;
    }

    if (deepest.uri === nodeKey) {
      return FileTreeHelpers().replaceNode(deepest, deepest, expandNode_);
    }

    const parents = [];
    let prevUri = nodeKey;
    let currentParentUri = FileTreeHelpers().getParentKey(nodeKey);
    const rootUri = root.uri;

    while (currentParentUri !== deepest.uri && currentParentUri !== prevUri) {
      parents.push(currentParentUri);
      prevUri = currentParentUri;
      currentParentUri = FileTreeHelpers().getParentKey(currentParentUri);
    }

    if (currentParentUri !== deepest.uri) {
      // Something went wrong - we didn't find the match
      return root;
    }

    const conf = Selectors().getConf(store.getState());
    let currentChild = new (_FileTreeNode().FileTreeNode)({
      uri: nodeKey,
      rootUri
    }, conf);
    parents.forEach(currentUri => {
      fetchChildKeys(store, currentUri);
      const parent = new (_FileTreeNode().FileTreeNode)({
        uri: currentUri,
        rootUri,
        isLoading: true,
        isExpanded: true,
        children: _FileTreeNode().FileTreeNode.childrenFromArray([currentChild])
      }, conf);
      currentChild = parent;
    });
    fetchChildKeys(store, deepest.uri);
    return FileTreeHelpers().replaceNode(deepest, deepest.set({
      isLoading: true,
      isExpanded: true,
      isPendingLoad: true,
      children: deepest.children.set(currentChild.name, currentChild)
    }), expandNode_);
  });
  store.dispatch(Actions().setRoots(nextRoots));

  if (firstRootUri != null) {
    store.dispatch(Actions().setSelectedNode(firstRootUri, nodeKey));
  }
}

function setRootKeys(store, rootKeys) {
  const conf = Selectors().getConf(store.getState());
  const rootNodes = rootKeys.map(rootUri => {
    const root = Selectors().getRoots(store.getState()).get(rootUri);

    if (root != null) {
      return root;
    }

    fetchChildKeys(store, rootUri);
    return new (_FileTreeNode().FileTreeNode)({
      uri: rootUri,
      rootUri,
      isLoading: true,
      isExpanded: true,
      connectionTitle: FileTreeHelpers().getDisplayTitle(rootUri) || ''
    }, conf);
  });
  const roots = Immutable().OrderedMap(rootNodes.map(root => [root.uri, root]));
  const removedRoots = Selectors().getRoots(store.getState()).filter(root => !roots.has(root.uri));
  removedRoots.forEach(root => root.traverse(node => node.isExpanded, node => {
    if (node.subscription != null) {
      node.subscription.dispose();
    }
  }));
  store.dispatch(Actions().setRoots(roots)); // Just in case there's a race between the update of the root keys and the cwdKey and the cwdKey
  // is set too early - set it again. If there was no race - it's a noop.

  store.dispatch(Actions().setCwd(Selectors().getCwdKey(store.getState())));
}