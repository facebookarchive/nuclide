

/**
 * Renames a single node to the new path.
 */

var renameNode = _asyncToGenerator(function* (node, destPath) {
  if (!isValidRename(node, destPath)) {
    return;
  }
  var filePath = (_FileTreeHelpers2 || _FileTreeHelpers()).default.keyToPath(node.uri);

  // Need to update the paths in editors before the rename to prevent them from closing
  // In case of an error - undo the editor paths rename
  (_FileTreeHelpers2 || _FileTreeHelpers()).default.updatePathInOpenedEditors(filePath, destPath);
  try {
    var service = (0, (_nuclideClient2 || _nuclideClient()).getFileSystemServiceByNuclideUri)(filePath);
    // Throws if the destPath already exists.
    yield service.rename((_nuclideRemoteUri2 || _nuclideRemoteUri()).default.getPath(filePath), (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.getPath(destPath));

    var hgRepository = getHgRepositoryForNode(node);
    if (hgRepository == null) {
      return;
    }
    yield hgRepository.rename([filePath], destPath, true /* after */);
  } catch (err) {
    (_FileTreeHelpers2 || _FileTreeHelpers()).default.updatePathInOpenedEditors(destPath, filePath);
    throw err;
  }
}

/**
 * Lock on move to prevent concurrent moves, which may lead to race conditions
 * with the hg wlock.
 */
);

/**
 * Moves an array of nodes into the destPath, ignoring nodes that cannot be moved.
 * This wrapper prevents concurrent move operations.
 */

var moveNodes = _asyncToGenerator(function* (nodes, destPath) {
  if (isMoving) {
    return;
  }
  isMoving = true;

  // Reset isMoving to false whenever move operation completes, errors, or times out.
  yield (0, (_commonsNodePromise2 || _commonsNodePromise()).triggerAfterWait)(_moveNodesUnprotected(nodes, destPath), MOVE_TIMEOUT, resetIsMoving, /* timeoutFn */
  resetIsMoving);
});

/* cleanupFn */

var _moveNodesUnprotected = _asyncToGenerator(function* (nodes, destPath) {
  var paths = [];

  try {
    var filteredNodes = nodes.filter(function (node) {
      return isValidRename(node, destPath);
    });
    // Collapse paths that are in the same subtree, keeping only the subtree root.
    paths = (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.collapse(filteredNodes.map(function (node) {
      return (_FileTreeHelpers2 || _FileTreeHelpers()).default.keyToPath(node.uri);
    }));

    if (paths.length === 0) {
      return;
    }

    // Need to update the paths in editors before the rename to prevent them from closing
    // In case of an error - undo the editor paths rename
    paths.forEach(function (path) {
      var newPath = (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.join(destPath, (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.basename(path));
      (_FileTreeHelpers2 || _FileTreeHelpers()).default.updatePathInOpenedEditors(path, newPath);
    });

    var service = (0, (_nuclideClient2 || _nuclideClient()).getFileSystemServiceByNuclideUri)(paths[0]);
    yield service.move(paths.map(function (p) {
      return (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.getPath(p);
    }), (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.getPath(destPath));

    // All filtered nodes should have the same rootUri, so we simply attempt to
    // retrieve the hg repository using the first node.
    var hgRepository = getHgRepositoryForNode(filteredNodes[0]);
    if (hgRepository == null) {
      return;
    }
    yield hgRepository.rename(paths, destPath, true /* after */);
  } catch (e) {
    // Restore old editor paths upon error.
    paths.forEach(function (path) {
      var newPath = (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.join(destPath, (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.basename(path));
      (_FileTreeHelpers2 || _FileTreeHelpers()).default.updatePathInOpenedEditors(newPath, path);
    });
    throw e;
  }
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

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
  return _FileTreeHelpers2 = _interopRequireDefault(require('./FileTreeHelpers'));
}

var _nuclideRemoteUri2;

function _nuclideRemoteUri() {
  return _nuclideRemoteUri2 = _interopRequireDefault(require('../../nuclide-remote-uri'));
}

var _commonsNodePromise2;

function _commonsNodePromise() {
  return _commonsNodePromise2 = require('../../commons-node/promise');
}

var _nuclideClient2;

function _nuclideClient() {
  return _nuclideClient2 = require('../../nuclide-client');
}

var MOVE_TIMEOUT = 10000;

function getHgRepositoryForNode(node) {
  var repository = node.repo;
  if (repository != null && repository.getType() === 'hg') {
    return repository;
  }
  return null;
}

/**
 * Determines whether renaming the given node to the specified destPath is an
 * acceptable rename.
 */
function isValidRename(node, destPath) {
  var path = (_FileTreeHelpers2 || _FileTreeHelpers()).default.keyToPath(node.uri);
  var rootPath = (_FileTreeHelpers2 || _FileTreeHelpers()).default.keyToPath(node.rootUri);

  destPath = (_FileTreeHelpers2 || _FileTreeHelpers()).default.keyToPath(destPath);

  return (_FileTreeHelpers2 || _FileTreeHelpers()).default.getEntryByKey(node.uri) != null &&
  // This will only detect exact equalities, mostly preventing moves of a
  // directory into itself from causing an error. If a case-changing rename
  // should be a noop for the current OS's file system, this is handled by the
  // fs module.
  path !== destPath &&
  // Disallow renames where the destination is a child of the source node.
  !(_nuclideRemoteUri2 || _nuclideRemoteUri()).default.contains(path, (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.dirname(destPath)) &&
  // Disallow renames across projects for the time being, since cross-host and
  // cross-repository moves are a bit tricky.
  (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.contains(rootPath, destPath);
}var isMoving = false;

function resetIsMoving() {
  isMoving = false;
}

module.exports = {
  getHgRepositoryForNode: getHgRepositoryForNode,
  isValidRename: isValidRename,
  renameNode: renameNode,
  moveNodes: moveNodes
};