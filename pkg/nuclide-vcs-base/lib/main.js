"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.findVcs = findVcs;
exports.getDirtyFileChanges = getDirtyFileChanges;
exports.observeStatusChanges = observeStatusChanges;
exports.forgetPath = forgetPath;
exports.addPath = addPath;
exports.revertPath = revertPath;
exports.confirmAndRevertPath = confirmAndRevertPath;
exports.getHgRepositories = getHgRepositories;
exports.getHgRepositoriesStream = getHgRepositoriesStream;
exports.getHgRepositoryStream = getHgRepositoryStream;
exports.repositoryForPath = repositoryForPath;
exports.repositoryContainsPath = repositoryContainsPath;
exports.getMultiRootFileChanges = getMultiRootFileChanges;
exports.confirmAndDeletePath = confirmAndDeletePath;
exports.DIFF_EDITOR_MARKER_CLASS = exports.RevertibleStatusCodes = exports.FileChangeStatusToLabel = exports.FileChangeStatusToTextColor = exports.FileChangeStatusToIcon = exports.FileChangeStatusToPrefix = exports.MergeConflictStatusToNumber = exports.HgStatusToFileChangeStatus = exports.FileChangeStatus = void 0;

function _collection() {
  const data = require("../../../modules/nuclide-commons/collection");

  _collection = function () {
    return data;
  };

  return data;
}

function _process() {
  const data = require("../../../modules/nuclide-commons/process");

  _process = function () {
    return data;
  };

  return data;
}

function _observable() {
  const data = require("../../../modules/nuclide-commons/observable");

  _observable = function () {
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

function _nuclideHgRpc() {
  const data = require("../../nuclide-hg-rpc");

  _nuclideHgRpc = function () {
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

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _event() {
  const data = require("../../../modules/nuclide-commons/event");

  _event = function () {
    return data;
  };

  return data;
}

function _nuclideAnalytics() {
  const data = require("../../nuclide-analytics");

  _nuclideAnalytics = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
const {
  StatusCodeNumber: HgStatusCodeNumber,
  MergeConflictStatus
} = _nuclideHgRpc().hgConstants;

const vcsInfoCache = {};

async function findVcsHelper(dir) {
  const options = {
    cwd: dir
  };

  try {
    return {
      vcs: 'hg',
      root: (await (0, _process().runCommand)('hg', ['root'], options).toPromise()).trim()
    };
  } catch (err) {}

  try {
    return {
      vcs: 'git',
      root: (await (0, _process().runCommand)('git', ['rev-parse', '--show-toplevel'], options).toPromise()).trim()
    };
  } catch (err) {}

  throw new Error('Could not find VCS for: ' + dir);
}
/**
 * For the given source file, find the type of vcs that is managing it as well
 * as the root directory for the VCS.
 */


async function findVcs(dir) {
  let vcsInfo = vcsInfoCache[dir];

  if (vcsInfo) {
    return vcsInfo;
  }

  vcsInfo = await findVcsHelper(dir);
  vcsInfoCache[dir] = vcsInfo;
  return vcsInfo;
}

const FileChangeStatus = Object.freeze({
  ADDED: 1,
  MODIFIED: 2,
  MISSING: 3,
  REMOVED: 4,
  UNTRACKED: 5,
  BOTH_CHANGED: 6,
  CHANGE_DELETE: 7
});
exports.FileChangeStatus = FileChangeStatus;
FileChangeStatus;
const HgStatusToFileChangeStatus = Object.freeze({
  [HgStatusCodeNumber.ADDED]: FileChangeStatus.ADDED,
  [HgStatusCodeNumber.MODIFIED]: FileChangeStatus.MODIFIED,
  [HgStatusCodeNumber.MISSING]: FileChangeStatus.MISSING,
  [HgStatusCodeNumber.REMOVED]: FileChangeStatus.REMOVED,
  [HgStatusCodeNumber.UNTRACKED]: FileChangeStatus.UNTRACKED
});
exports.HgStatusToFileChangeStatus = HgStatusToFileChangeStatus;
const MergeConflictStatusToNumber = {
  [MergeConflictStatus.BOTH_CHANGED]: FileChangeStatus.BOTH_CHANGED,
  [MergeConflictStatus.DELETED_IN_THEIRS]: FileChangeStatus.CHANGE_DELETE,
  [MergeConflictStatus.DELETED_IN_OURS]: FileChangeStatus.CHANGE_DELETE
};
exports.MergeConflictStatusToNumber = MergeConflictStatusToNumber;
const FileChangeStatusToPrefix = Object.freeze({
  [FileChangeStatus.ADDED]: '[A] ',
  [FileChangeStatus.MODIFIED]: '[M] ',
  [FileChangeStatus.MISSING]: '[!] ',
  [FileChangeStatus.REMOVED]: '[D] ',
  [FileChangeStatus.UNTRACKED]: '[?] '
});
exports.FileChangeStatusToPrefix = FileChangeStatusToPrefix;
const FileChangeStatusToIcon = Object.freeze({
  [FileChangeStatus.ADDED]: 'diff-added',
  [FileChangeStatus.MODIFIED]: 'diff-modified',
  [FileChangeStatus.MISSING]: 'stop',
  [FileChangeStatus.REMOVED]: 'diff-removed',
  [FileChangeStatus.UNTRACKED]: 'question',
  [FileChangeStatus.BOTH_CHANGED]: 'alignment-unalign ',
  [FileChangeStatus.CHANGE_DELETE]: 'x '
});
exports.FileChangeStatusToIcon = FileChangeStatusToIcon;
const FileChangeStatusToTextColor = Object.freeze({
  [FileChangeStatus.ADDED]: 'status-added',
  [FileChangeStatus.MODIFIED]: 'status-modified',
  [FileChangeStatus.MISSING]: 'status-renamed',
  [FileChangeStatus.REMOVED]: 'status-removed',
  [FileChangeStatus.UNTRACKED]: 'status-ignored',
  [FileChangeStatus.BOTH_CHANGED]: 'text-warning',
  [FileChangeStatus.CHANGE_DELETE]: 'text-warning'
});
exports.FileChangeStatusToTextColor = FileChangeStatusToTextColor;
const FileChangeStatusToLabel = Object.freeze({
  [FileChangeStatus.ADDED]: 'Added',
  [FileChangeStatus.MODIFIED]: 'Modified',
  [FileChangeStatus.MISSING]: 'Missing',
  [FileChangeStatus.REMOVED]: 'Removed',
  [FileChangeStatus.UNTRACKED]: 'Untracked',
  [FileChangeStatus.BOTH_CHANGED]: 'Both Changed',
  [FileChangeStatus.CHANGE_DELETE]: 'Deleted'
});
exports.FileChangeStatusToLabel = FileChangeStatusToLabel;
const RevertibleStatusCodes = [FileChangeStatus.ADDED, FileChangeStatus.MODIFIED, FileChangeStatus.REMOVED];
exports.RevertibleStatusCodes = RevertibleStatusCodes;
const DIFF_EDITOR_MARKER_CLASS = 'nuclide-diff-editor-marker';
exports.DIFF_EDITOR_MARKER_CLASS = DIFF_EDITOR_MARKER_CLASS;

function getDirtyFileChanges(repository) {
  const dirtyFileChanges = new Map();
  const statuses = repository.getAllPathStatuses();

  for (const filePath in statuses) {
    const changeStatus = HgStatusToFileChangeStatus[statuses[filePath]];

    if (changeStatus != null) {
      dirtyFileChanges.set(filePath, changeStatus);
    }
  }

  return dirtyFileChanges;
}

function observeStatusChanges(repository) {
  return (0, _event().observableFromSubscribeFunction)(repository.onDidChangeStatuses.bind(repository)).startWith(null).map(() => getDirtyFileChanges(repository));
}

function forgetPath(nodePath) {
  return hgActionToPath(nodePath, 'forget', 'Forgot', async hgRepository => {
    // flowlint-next-line sketchy-null-string:off
    if (!nodePath) {
      throw new Error("Invariant violation: \"nodePath\"");
    }

    (0, _nuclideAnalytics().track)('hg-repository-forget', {
      nodePath
    });
    await hgRepository.forget([nodePath]);
  });
}

function addPath(nodePath) {
  return hgActionToPath(nodePath, 'add', 'Added', async hgRepository => {
    // flowlint-next-line sketchy-null-string:off
    if (!nodePath) {
      throw new Error("Invariant violation: \"nodePath\"");
    }

    (0, _nuclideAnalytics().track)('hg-repository-add', {
      nodePath
    });
    await hgRepository.addAll([nodePath]);
  });
}

function revertPath(nodePath, toRevision) {
  return hgActionToPath(nodePath, 'revert', 'Reverted', async hgRepository => {
    // flowlint-next-line sketchy-null-string:off
    if (!nodePath) {
      throw new Error("Invariant violation: \"nodePath\"");
    }

    (0, _nuclideAnalytics().track)('hg-repository-revert', {
      nodePath
    });
    await hgRepository.revert([nodePath], toRevision);
  });
}

function confirmAndRevertPath(path, toRevision) {
  const result = atom.confirm({
    message: `Are you sure you want to revert${path == null ? '' : ` "${path}"`}?`,
    buttons: ['Revert', 'Cancel']
  });

  if (!(result === 0 || result === 1)) {
    throw new Error("Invariant violation: \"result === 0 || result === 1\"");
  }

  if (result === 0) {
    revertPath(path, toRevision);
  }
}

async function hgActionToPath(nodePath, actionName, actionDoneMessage, action) {
  if (nodePath == null || nodePath.length === 0) {
    atom.notifications.addError(`Cannot ${actionName} an empty path!`);
    return;
  }

  const repository = repositoryForPath(nodePath);

  if (repository == null || repository.getType() !== 'hg') {
    atom.notifications.addError(`Cannot ${actionName} a non-mercurial repository path`);
    return;
  }

  const hgRepository = repository;

  try {
    await action(hgRepository);
    atom.notifications.addSuccess(`${actionDoneMessage} \`${repository.relativize(nodePath)}\` successfully.`);
  } catch (error) {
    atom.notifications.addError(`Failed to ${actionName} \`${repository.relativize(nodePath)}\``, {
      detail: error.message
    });
  }
}

function getHgRepositories() {
  return new Set((0, _collection().arrayCompact)(atom.project.getRepositories()) // Flow doesn't understand that this filters to hg repositories only, so cast through `any`
  .filter(repository => repository.getType() === 'hg'));
}

function getHgRepositoriesStream() {
  return (0, _event().observableFromSubscribeFunction)(atom.project.onDidChangePaths.bind(atom.project)).startWith(null).map(() => getHgRepositories());
}

function getHgRepositoryStream() {
  return getHgRepositoriesStream().let((0, _observable().diffSets)()).flatMap(repoDiff => _RxMin.Observable.from(repoDiff.added));
}
/**
 * @param aPath The NuclideUri of a file or directory for which you want to find
 *   a Repository it belongs to.
 * @return A Git or Hg repository the path belongs to, if any.
 */


function repositoryForPath(aPath) {
  // Calling atom.project.repositoryForDirectory gets the real path of the directory,
  // which requires a round-trip to the server for remote paths.
  // Instead, this function keeps filtering local.
  const repositories = (0, _collection().arrayCompact)(atom.project.getRepositories());
  return repositories.find(repo => {
    try {
      return repositoryContainsPath(repo, aPath);
    } catch (e) {
      // The repo type is not supported.
      return false;
    }
  });
}
/**
 * @param repository Either a GitRepository or HgRepositoryClient.
 * @param filePath The absolute file path of interest.
 * @return boolean Whether the file path exists within the working directory
 *   (aka root directory) of the repository, or is the working directory.
 */


function repositoryContainsPath(repository, filePath) {
  return _nuclideUri().default.contains(repository.getWorkingDirectory(), filePath);
}

function getMultiRootFileChanges(fileChanges, rootPaths) {
  let roots;

  if (rootPaths == null) {
    roots = (0, _collection().arrayCompact)(atom.project.getDirectories().map(directory => {
      const rootPath = directory.getPath();
      const repository = repositoryForPath(rootPath);

      if (repository == null || repository.getType() !== 'hg') {
        return null;
      }

      return _nuclideUri().default.ensureTrailingSeparator(rootPath);
    }));
  } else {
    roots = rootPaths.map(root => _nuclideUri().default.ensureTrailingSeparator(root));
  }

  const sortedFilePaths = Array.from(fileChanges.entries()).sort(([filePath1], [filePath2]) => _nuclideUri().default.basename(filePath1).toLowerCase().localeCompare(_nuclideUri().default.basename(filePath2).toLowerCase()));
  const changedRoots = new Map(roots.map(root => {
    const rootChanges = new Map(sortedFilePaths.filter(([filePath]) => _nuclideUri().default.contains(root, filePath)));
    return [root, rootChanges];
  }));
  return changedRoots;
}

async function confirmAndDeletePath(nuclideFilePath) {
  const result = atom.confirm({
    message: 'Are you sure you want to delete the following item?',
    detailedMessage: `You are deleting: \n ${_nuclideUri().default.getPath(nuclideFilePath)}`,
    buttons: ['Delete', 'Cancel']
  });

  if (!(result === 0 || result === 1)) {
    throw new Error("Invariant violation: \"result === 0 || result === 1\"");
  }

  if (result === 0) {
    return deleteFile(nuclideFilePath);
  }

  return false;
}

async function deleteFile(nuclideFilePath) {
  const fsService = (0, _nuclideRemoteConnection().getFileSystemServiceByNuclideUri)(nuclideFilePath);

  try {
    await fsService.unlink(nuclideFilePath);
    const repository = repositoryForPath(nuclideFilePath);

    if (repository == null || repository.getType() !== 'hg') {
      return false;
    }

    await repository.remove([nuclideFilePath], true);
  } catch (error) {
    atom.notifications.addError('Failed to delete file', {
      detail: error
    });
    return false;
  }

  return true;
}