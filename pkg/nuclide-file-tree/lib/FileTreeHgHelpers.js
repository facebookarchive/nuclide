'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _electron = require('electron');

var _immutable;

function _load_immutable() {
  return _immutable = _interopRequireWildcard(require('immutable'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _FileTreeHelpers;

function _load_FileTreeHelpers() {
  return _FileTreeHelpers = _interopRequireDefault(require('./FileTreeHelpers'));
}

var _nullthrows;

function _load_nullthrows() {
  return _nullthrows = _interopRequireDefault(require('nullthrows'));
}

var _promise;

function _load_promise() {
  return _promise = require('../../../modules/nuclide-commons/promise');
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

const MOVE_TIMEOUT = 10000; /**
                             * Copyright (c) 2015-present, Facebook, Inc.
                             * All rights reserved.
                             *
                             * This source code is licensed under the license found in the LICENSE file in
                             * the root directory of this source tree.
                             *
                             * 
                             * @format
                             */

function getHgRepositoryForNode(node) {
  const repository = node.repo;
  if (repository != null && repository.getType() === 'hg') {
    return repository;
  }
  return null;
}

/**
 * Determines whether renaming the given node to the specified destPath is an
 * acceptable rename.
 */
function isValidRename(node, destPath_) {
  let destPath = destPath_;
  const path = (_FileTreeHelpers || _load_FileTreeHelpers()).default.keyToPath(node.uri);
  const rootPath = (_FileTreeHelpers || _load_FileTreeHelpers()).default.keyToPath(node.rootUri);

  destPath = (_FileTreeHelpers || _load_FileTreeHelpers()).default.keyToPath(destPath);

  return (_FileTreeHelpers || _load_FileTreeHelpers()).default.getEntryByKey(node.uri) != null &&
  // This will only detect exact equalities, mostly preventing moves of a
  // directory into itself from causing an error. If a case-changing rename
  // should be a noop for the current OS's file system, this is handled by the
  // fs module.
  path !== destPath &&
  // Disallow renames where the destination is a child of the source node.
  !(_nuclideUri || _load_nuclideUri()).default.contains(path, (_nuclideUri || _load_nuclideUri()).default.dirname(destPath)) &&
  // Disallow renames across projects for the time being, since cross-host and
  // cross-repository moves are a bit tricky.
  (_nuclideUri || _load_nuclideUri()).default.contains(rootPath, destPath);
}

/**
 * Renames a single node to the new path.
 */
async function renameNode(node, destPath) {
  if (!isValidRename(node, destPath)) {
    return;
  }
  const filePath = (_FileTreeHelpers || _load_FileTreeHelpers()).default.keyToPath(node.uri);

  // Need to update the paths in editors before the rename to prevent them from closing
  // In case of an error - undo the editor paths rename
  (_FileTreeHelpers || _load_FileTreeHelpers()).default.updatePathInOpenedEditors(filePath, destPath);
  try {
    const service = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getFileSystemServiceByNuclideUri)(filePath);
    // Throws if the destPath already exists.
    await service.rename(filePath, destPath);

    const hgRepository = getHgRepositoryForNode(node);
    if (hgRepository == null) {
      return;
    }
    await hgRepository.rename([filePath], destPath, true /* after */);
  } catch (err) {
    (_FileTreeHelpers || _load_FileTreeHelpers()).default.updatePathInOpenedEditors(destPath, filePath);
    throw err;
  }
}

/**
 * Lock on move to prevent concurrent moves, which may lead to race conditions
 * with the hg wlock.
 */
let isMoving = false;

function resetIsMoving() {
  isMoving = false;
}

/**
 * Moves an array of nodes into the destPath, ignoring nodes that cannot be moved.
 * This wrapper prevents concurrent move operations.
 */
async function moveNodes(nodes, destPath) {
  if (isMoving) {
    return;
  }
  isMoving = true;

  // Reset isMoving to false whenever move operation completes, errors, or times out.
  await (0, (_promise || _load_promise()).triggerAfterWait)(_moveNodesUnprotected(nodes, destPath), MOVE_TIMEOUT, resetIsMoving /* timeoutFn */
  , resetIsMoving /* cleanupFn */
  );
}

async function _moveNodesUnprotected(nodes, destPath) {
  let paths = [];

  try {
    const filteredNodes = nodes.filter(node => isValidRename(node, destPath));
    // Collapse paths that are in the same subtree, keeping only the subtree root.
    paths = (_nuclideUri || _load_nuclideUri()).default.collapse(filteredNodes.map(node => (_FileTreeHelpers || _load_FileTreeHelpers()).default.keyToPath(node.uri)));

    if (paths.length === 0) {
      return;
    }

    // Need to update the paths in editors before the rename to prevent them from closing
    // In case of an error - undo the editor paths rename
    paths.forEach(path => {
      const newPath = (_nuclideUri || _load_nuclideUri()).default.join(destPath, (_nuclideUri || _load_nuclideUri()).default.basename(path));
      (_FileTreeHelpers || _load_FileTreeHelpers()).default.updatePathInOpenedEditors(path, newPath);
    });

    const service = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getFileSystemServiceByNuclideUri)(paths[0]);
    await service.move(paths, destPath);

    // All filtered nodes should have the same rootUri, so we simply attempt to
    // retrieve the hg repository using the first node.
    const hgRepository = getHgRepositoryForNode(filteredNodes[0]);
    if (hgRepository == null) {
      return;
    }
    await hgRepository.rename(paths, destPath, true /* after */);
  } catch (e) {
    // Restore old editor paths upon error.
    paths.forEach(path => {
      const newPath = (_nuclideUri || _load_nuclideUri()).default.join(destPath, (_nuclideUri || _load_nuclideUri()).default.basename(path));
      (_FileTreeHelpers || _load_FileTreeHelpers()).default.updatePathInOpenedEditors(newPath, path);
    });
    throw e;
  }
}

/**
 * Deletes an array of nodes.
 */
async function deleteNodes(nodes) {
  // Filter out children nodes to avoid ENOENTs that happen when parents are
  // deleted before its children. Convert to List so we can use groupBy.
  const paths = (_immutable || _load_immutable()).List((_nuclideUri || _load_nuclideUri()).default.collapse(nodes.map(node => (_FileTreeHelpers || _load_FileTreeHelpers()).default.keyToPath(node.uri))));
  const localPaths = paths.filter(path => (_nuclideUri || _load_nuclideUri()).default.isLocal(path));
  const remotePaths = paths.filter(path => (_nuclideUri || _load_nuclideUri()).default.isRemote(path));

  // 1) Move local nodes to trash.
  localPaths.forEach(path => _electron.shell.moveItemToTrash(path));

  // 2) Batch delete remote nodes, one request per hostname.
  if (remotePaths.size > 0) {
    const pathsByHost = remotePaths.groupBy(path => (_nuclideUri || _load_nuclideUri()).default.getHostname(path));

    await Promise.all(pathsByHost.map(async pathGroup => {
      // Batch delete using fs service.
      const service = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getFileSystemServiceByNuclideUri)((0, (_nullthrows || _load_nullthrows()).default)(pathGroup.get(0)));
      await service.rmdirAll(pathGroup.toArray());
    }));
  }

  // 3) Batch hg remove nodes that belong to an hg repo, one request per repo.
  const nodesByHgRepository = (_immutable || _load_immutable()).List(nodes).filter(node => getHgRepositoryForNode(node) != null).groupBy(node => getHgRepositoryForNode(node)).entrySeq();

  await Promise.all(nodesByHgRepository.map(async ([hgRepository, repoNodes]) => {
    if (!(hgRepository != null)) {
      throw new Error('Invariant violation: "hgRepository != null"');
    }

    const hgPaths = (_nuclideUri || _load_nuclideUri()).default.collapse(repoNodes.map(node => (_FileTreeHelpers || _load_FileTreeHelpers()).default.keyToPath(node.uri)).toArray());
    await hgRepository.remove(hgPaths, true /* after */);
  }));
}

exports.default = {
  getHgRepositoryForNode,
  isValidRename,
  renameNode,
  moveNodes,
  deleteNodes
};