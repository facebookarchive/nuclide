'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FileChangeStatusToPrefix = exports.HgStatusToFileChangeStatus = exports.FileChangeStatus = exports.findVcs = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let findVcsHelper = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (dir) {
    const options = { cwd: dir };
    const hgResult = yield (0, (_process || _load_process()).asyncExecute)('hg', ['root'], options);
    if (hgResult.exitCode === 0) {
      return {
        vcs: 'hg',
        root: hgResult.stdout.trim()
      };
    }

    const gitResult = yield (0, (_process || _load_process()).asyncExecute)('git', ['rev-parse', '--show-toplevel'], options);
    if (gitResult.exitCode === 0) {
      return {
        vcs: 'git',
        root: gitResult.stdout.trim()
      };
    }

    throw new Error('Could not find VCS for: ' + dir);
  });

  return function findVcsHelper(_x) {
    return _ref.apply(this, arguments);
  };
})();

/**
 * For the given source file, find the type of vcs that is managing it as well
 * as the root directory for the VCS.
 */


let findVcs = exports.findVcs = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* (dir) {
    let vcsInfo = vcsInfoCache[dir];
    if (vcsInfo) {
      return vcsInfo;
    }

    vcsInfo = yield findVcsHelper(dir);
    vcsInfoCache[dir] = vcsInfo;
    return vcsInfo;
  });

  return function findVcs(_x2) {
    return _ref2.apply(this, arguments);
  };
})();

exports.getDirtyFileChanges = getDirtyFileChanges;
exports.observeStatusChanges = observeStatusChanges;

var _nuclideHgRpc;

function _load_nuclideHgRpc() {
  return _nuclideHgRpc = require('../nuclide-hg-rpc');
}

var _process;

function _load_process() {
  return _process = require('./process');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _event;

function _load_event() {
  return _event = require('./event');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const HgStatusCodeNumber = (_nuclideHgRpc || _load_nuclideHgRpc()).hgConstants.StatusCodeNumber;

const vcsInfoCache = {};

const FileChangeStatus = exports.FileChangeStatus = Object.freeze({
  ADDED: 1,
  MODIFIED: 2,
  MISSING: 3,
  REMOVED: 4,
  UNTRACKED: 5
});

FileChangeStatus;

const HgStatusToFileChangeStatus = exports.HgStatusToFileChangeStatus = Object.freeze({
  [HgStatusCodeNumber.ADDED]: FileChangeStatus.ADDED,
  [HgStatusCodeNumber.MODIFIED]: FileChangeStatus.MODIFIED,
  [HgStatusCodeNumber.MISSING]: FileChangeStatus.MISSING,
  [HgStatusCodeNumber.REMOVED]: FileChangeStatus.REMOVED,
  [HgStatusCodeNumber.UNTRACKED]: FileChangeStatus.UNTRACKED
});

const FileChangeStatusToPrefix = exports.FileChangeStatusToPrefix = Object.freeze({
  [FileChangeStatus.ADDED]: '[A] ',
  [FileChangeStatus.MODIFIED]: '[M] ',
  [FileChangeStatus.MISSING]: '[!] ',
  [FileChangeStatus.REMOVED]: '[D] ',
  [FileChangeStatus.UNTRACKED]: '[?] '
});

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

const UPDATE_STATUS_DEBOUNCE_MS = 50;
function observeStatusChanges(repository) {
  return (0, (_event || _load_event()).observableFromSubscribeFunction)(repository.onDidChangeStatuses.bind(repository)).debounceTime(UPDATE_STATUS_DEBOUNCE_MS).startWith(null).map(() => getDirtyFileChanges(repository));
}