'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

/**
 * Renames a single node to the new path.
 */
let renameNode = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (node, destPath) {
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
      yield service.rename(filePath, destPath);

      const hgRepository = getHgRepositoryForNode(node);
      if (hgRepository == null) {
        return;
      }
      yield hgRepository.rename([filePath], destPath, true /* after */);
    } catch (err) {
      (_FileTreeHelpers || _load_FileTreeHelpers()).default.updatePathInOpenedEditors(destPath, filePath);
      throw err;
    }
  });

  return function renameNode(_x, _x2) {
    return _ref.apply(this, arguments);
  };
})();

/**
 * Lock on move to prevent concurrent moves, which may lead to race conditions
 * with the hg wlock.
 */


/**
 * Moves an array of nodes into the destPath, ignoring nodes that cannot be moved.
 * This wrapper prevents concurrent move operations.
 */
let moveNodes = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* (nodes, destPath) {
    if (isMoving) {
      return;
    }
    isMoving = true;

    // Reset isMoving to false whenever move operation completes, errors, or times out.
    yield (0, (_promise || _load_promise()).triggerAfterWait)(_moveNodesUnprotected(nodes, destPath), MOVE_TIMEOUT, resetIsMoving /* timeoutFn */
    , resetIsMoving /* cleanupFn */
    );
  });

  return function moveNodes(_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
})();

let _moveNodesUnprotected = (() => {
  var _ref3 = (0, _asyncToGenerator.default)(function* (nodes, destPath) {
    let paths = [];

    try {
      const filteredNodes = nodes.filter(function (node) {
        return isValidRename(node, destPath);
      });
      // Collapse paths that are in the same subtree, keeping only the subtree root.
      paths = (_nuclideUri || _load_nuclideUri()).default.collapse(filteredNodes.map(function (node) {
        return (_FileTreeHelpers || _load_FileTreeHelpers()).default.keyToPath(node.uri);
      }));

      if (paths.length === 0) {
        return;
      }

      // Need to update the paths in editors before the rename to prevent them from closing
      // In case of an error - undo the editor paths rename
      paths.forEach(function (path) {
        const newPath = (_nuclideUri || _load_nuclideUri()).default.join(destPath, (_nuclideUri || _load_nuclideUri()).default.basename(path));
        (_FileTreeHelpers || _load_FileTreeHelpers()).default.updatePathInOpenedEditors(path, newPath);
      });

      const service = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getFileSystemServiceByNuclideUri)(paths[0]);
      yield service.move(paths, destPath);

      // All filtered nodes should have the same rootUri, so we simply attempt to
      // retrieve the hg repository using the first node.
      const hgRepository = getHgRepositoryForNode(filteredNodes[0]);
      if (hgRepository == null) {
        return;
      }
      yield hgRepository.rename(paths, destPath, true /* after */);
    } catch (e) {
      // Restore old editor paths upon error.
      paths.forEach(function (path) {
        const newPath = (_nuclideUri || _load_nuclideUri()).default.join(destPath, (_nuclideUri || _load_nuclideUri()).default.basename(path));
        (_FileTreeHelpers || _load_FileTreeHelpers()).default.updatePathInOpenedEditors(newPath, path);
      });
      throw e;
    }
  });

  return function _moveNodesUnprotected(_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
})();

/**
 * Deletes an array of nodes.
 */


let deleteNodes = (() => {
  var _ref4 = (0, _asyncToGenerator.default)(function* (nodes) {
    // Filter out children nodes to avoid ENOENTs that happen when parents are
    // deleted before its children. Convert to List so we can use groupBy.
    const paths = (_immutable || _load_immutable()).default.List((_nuclideUri || _load_nuclideUri()).default.collapse(nodes.map(function (node) {
      return (_FileTreeHelpers || _load_FileTreeHelpers()).default.keyToPath(node.uri);
    })));
    const localPaths = paths.filter(function (path) {
      return (_nuclideUri || _load_nuclideUri()).default.isLocal(path);
    });
    const remotePaths = paths.filter(function (path) {
      return (_nuclideUri || _load_nuclideUri()).default.isRemote(path);
    });

    // 1) Move local nodes to trash.
    localPaths.forEach(function (path) {
      return _electron.shell.moveItemToTrash(path);
    });

    // 2) Batch delete remote nodes, one request per hostname.
    if (remotePaths.size > 0) {
      const pathsByHost = remotePaths.groupBy(function (path) {
        return (_nuclideUri || _load_nuclideUri()).default.getHostname(path);
      });

      yield Promise.all(pathsByHost.map((() => {
        var _ref5 = (0, _asyncToGenerator.default)(function* (pathGroup) {
          // Batch delete using fs service.
          const service = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getFileSystemServiceByNuclideUri)(pathGroup.get(0));
          yield service.rmdirAll(pathGroup.toJS());
        });

        return function (_x8) {
          return _ref5.apply(this, arguments);
        };
      })()));
    }

    // 3) Batch hg remove nodes that belong to an hg repo, one request per repo.
    const nodesByHgRepository = (_immutable || _load_immutable()).default.List(nodes).filter(function (node) {
      return getHgRepositoryForNode(node) != null;
    }).groupBy(function (node) {
      return getHgRepositoryForNode(node);
    }).entrySeq();

    yield Promise.all(nodesByHgRepository.map((() => {
      var _ref6 = (0, _asyncToGenerator.default)(function* ([hgRepository, repoNodes]) {
        const hgPaths = (_nuclideUri || _load_nuclideUri()).default.collapse(repoNodes.map(function (node) {
          return (_FileTreeHelpers || _load_FileTreeHelpers()).default.keyToPath(node.uri);
        }).toJS());
        yield hgRepository.remove(hgPaths, true /* after */);
      });

      return function (_x9) {
        return _ref6.apply(this, arguments);
      };
    })()));
  });

  return function deleteNodes(_x7) {
    return _ref4.apply(this, arguments);
  };
})();

var _electron = require('electron');

var _immutable;

function _load_immutable() {
  return _immutable = _interopRequireDefault(require('immutable'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _FileTreeHelpers;

function _load_FileTreeHelpers() {
  return _FileTreeHelpers = _interopRequireDefault(require('./FileTreeHelpers'));
}

var _promise;

function _load_promise() {
  return _promise = require('nuclide-commons/promise');
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
}let isMoving = false;

function resetIsMoving() {
  isMoving = false;
}exports.default = {
  getHgRepositoryForNode,
  isValidRename,
  renameNode,
  moveNodes,
  deleteNodes
};