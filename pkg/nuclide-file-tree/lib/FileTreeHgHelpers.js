"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _electron = require("electron");

function Immutable() {
  const data = _interopRequireWildcard(require("immutable"));

  Immutable = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _FileTreeHelpers() {
  const data = _interopRequireDefault(require("./FileTreeHelpers"));

  _FileTreeHelpers = function () {
    return data;
  };

  return data;
}

function _nullthrows() {
  const data = _interopRequireDefault(require("nullthrows"));

  _nullthrows = function () {
    return data;
  };

  return data;
}

function _promise() {
  const data = require("../../../modules/nuclide-commons/promise");

  _promise = function () {
    return data;
  };

  return data;
}

function _nuclideRemoteConnection() {
  const data = require("../../nuclide-remote-connection");

  _nuclideRemoteConnection = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */
const MOVE_TIMEOUT = 10000;

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

  const path = _FileTreeHelpers().default.keyToPath(node.uri);

  const rootPath = _FileTreeHelpers().default.keyToPath(node.rootUri);

  destPath = _FileTreeHelpers().default.keyToPath(destPath);
  return _FileTreeHelpers().default.getEntryByKey(node.uri) != null && // This will only detect exact equalities, mostly preventing moves of a
  // directory into itself from causing an error. If a case-changing rename
  // should be a noop for the current OS's file system, this is handled by the
  // fs module.
  path !== destPath && // Disallow renames where the destination is a child of the source node.
  !_nuclideUri().default.contains(path, _nuclideUri().default.dirname(destPath)) && // Disallow renames across projects for the time being, since cross-host and
  // cross-repository moves are a bit tricky.
  _nuclideUri().default.contains(rootPath, destPath);
}
/**
 * Renames a single node to the new path.
 */


async function renameNode(node, destPath) {
  if (!isValidRename(node, destPath)) {
    return;
  }

  const filePath = _FileTreeHelpers().default.keyToPath(node.uri); // Need to update the paths in editors before the rename to prevent them from closing
  // In case of an error - undo the editor paths rename


  _FileTreeHelpers().default.updatePathInOpenedEditors(filePath, destPath);

  try {
    const service = (0, _nuclideRemoteConnection().getFileSystemServiceByNuclideUri)(filePath); // Throws if the destPath already exists.

    await service.rename(filePath, destPath);
    const hgRepository = getHgRepositoryForNode(node);

    if (hgRepository == null) {
      return;
    }

    await hgRepository.rename([filePath], destPath, true
    /* after */
    );
  } catch (err) {
    _FileTreeHelpers().default.updatePathInOpenedEditors(destPath, filePath);

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

  isMoving = true; // Reset isMoving to false whenever move operation completes, errors, or times out.

  await (0, _promise().triggerAfterWait)(_moveNodesUnprotected(nodes, destPath), MOVE_TIMEOUT, resetIsMoving
  /* timeoutFn */
  , resetIsMoving
  /* cleanupFn */
  );
}

async function _moveNodesUnprotected(nodes, destPath) {
  let paths = [];

  try {
    const filteredNodes = nodes.filter(node => isValidRename(node, destPath)); // Collapse paths that are in the same subtree, keeping only the subtree root.

    paths = _nuclideUri().default.collapse(filteredNodes.map(node => _FileTreeHelpers().default.keyToPath(node.uri)));

    if (paths.length === 0) {
      return;
    } // Need to update the paths in editors before the rename to prevent them from closing
    // In case of an error - undo the editor paths rename


    paths.forEach(path => {
      const newPath = _nuclideUri().default.join(destPath, _nuclideUri().default.basename(path));

      _FileTreeHelpers().default.updatePathInOpenedEditors(path, newPath);
    });
    const service = (0, _nuclideRemoteConnection().getFileSystemServiceByNuclideUri)(paths[0]);
    await service.move(paths, destPath); // All filtered nodes should have the same rootUri, so we simply attempt to
    // retrieve the hg repository using the first node.

    const hgRepository = getHgRepositoryForNode(filteredNodes[0]);

    if (hgRepository == null) {
      return;
    }

    await hgRepository.rename(paths, destPath, true
    /* after */
    );
  } catch (e) {
    // Restore old editor paths upon error.
    paths.forEach(path => {
      const newPath = _nuclideUri().default.join(destPath, _nuclideUri().default.basename(path));

      _FileTreeHelpers().default.updatePathInOpenedEditors(newPath, path);
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
  const paths = Immutable().List(_nuclideUri().default.collapse(nodes.map(node => _FileTreeHelpers().default.keyToPath(node.uri))));
  const localPaths = paths.filter(path => _nuclideUri().default.isLocal(path));
  const remotePaths = paths.filter(path => _nuclideUri().default.isRemote(path)); // 1) Move local nodes to trash.

  localPaths.forEach(path => _electron.shell.moveItemToTrash(path)); // 2) Batch delete remote nodes, one request per hostname.

  if (remotePaths.size > 0) {
    const pathsByHost = remotePaths.groupBy(path => _nuclideUri().default.getHostname(path));
    await Promise.all(pathsByHost.map(async pathGroup => {
      // Batch delete using fs service.
      const service = (0, _nuclideRemoteConnection().getFileSystemServiceByNuclideUri)((0, _nullthrows().default)(pathGroup.get(0)));
      await service.rmdirAll(pathGroup.toArray());
    }));
  } // 3) Batch hg remove nodes that belong to an hg repo, one request per repo.


  const nodesByHgRepository = Immutable().List(nodes).filter(node => getHgRepositoryForNode(node) != null).groupBy(node => getHgRepositoryForNode(node)).entrySeq();
  await Promise.all(nodesByHgRepository.map(async ([hgRepository, repoNodes]) => {
    if (!(hgRepository != null)) {
      throw new Error("Invariant violation: \"hgRepository != null\"");
    }

    const hgPaths = _nuclideUri().default.collapse(repoNodes.map(node => _FileTreeHelpers().default.keyToPath(node.uri)).toArray());

    await hgRepository.remove(hgPaths, true
    /* after */
    );
  }));
}

var _default = {
  getHgRepositoryForNode,
  isValidRename,
  renameNode,
  moveNodes,
  deleteNodes
};
exports.default = _default;