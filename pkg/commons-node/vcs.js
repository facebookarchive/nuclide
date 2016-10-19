Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _Object$freeze, _Object$freeze2;

var findVcsHelper = _asyncToGenerator(function* (dir) {
  var options = { cwd: dir };
  var hgResult = yield (0, (_process || _load_process()).asyncExecute)('hg', ['root'], options);
  if (hgResult.exitCode === 0) {
    return {
      vcs: 'hg',
      root: hgResult.stdout.trim()
    };
  }

  var gitResult = yield (0, (_process || _load_process()).asyncExecute)('git', ['rev-parse', '--show-toplevel'], options);
  if (gitResult.exitCode === 0) {
    return {
      vcs: 'git',
      root: gitResult.stdout.trim()
    };
  }

  throw new Error('Could not find VCS for: ' + dir);
}

/**
 * For the given source file, find the type of vcs that is managing it as well
 * as the root directory for the VCS.
 */
);

var findVcs = _asyncToGenerator(function* (dir) {
  var vcsInfo = vcsInfoCache[dir];
  if (vcsInfo) {
    return vcsInfo;
  }

  vcsInfo = yield findVcsHelper(dir);
  vcsInfoCache[dir] = vcsInfo;
  return vcsInfo;
});

exports.findVcs = findVcs;
exports.getDirtyFileChanges = getDirtyFileChanges;
exports.observeStatusChanges = observeStatusChanges;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

var _nuclideHgRpc;

function _load_nuclideHgRpc() {
  return _nuclideHgRpc = require('../nuclide-hg-rpc');
}

var _process;

function _load_process() {
  return _process = require('./process');
}

var _rxjsBundlesRxMinJs;

function _load_rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');
}

var _event;

function _load_event() {
  return _event = require('./event');
}

var HgStatusCodeNumber = (_nuclideHgRpc || _load_nuclideHgRpc()).hgConstants.StatusCodeNumber;

var vcsInfoCache = {};

var FileChangeStatus = Object.freeze({
  ADDED: 1,
  MODIFIED: 2,
  MISSING: 3,
  REMOVED: 4,
  UNTRACKED: 5
});

exports.FileChangeStatus = FileChangeStatus;
FileChangeStatus;

var HgStatusToFileChangeStatus = Object.freeze((_Object$freeze = {}, _defineProperty(_Object$freeze, HgStatusCodeNumber.ADDED, FileChangeStatus.ADDED), _defineProperty(_Object$freeze, HgStatusCodeNumber.MODIFIED, FileChangeStatus.MODIFIED), _defineProperty(_Object$freeze, HgStatusCodeNumber.MISSING, FileChangeStatus.MISSING), _defineProperty(_Object$freeze, HgStatusCodeNumber.REMOVED, FileChangeStatus.REMOVED), _defineProperty(_Object$freeze, HgStatusCodeNumber.UNTRACKED, FileChangeStatus.UNTRACKED), _Object$freeze));

exports.HgStatusToFileChangeStatus = HgStatusToFileChangeStatus;
var FileChangeStatusToPrefix = Object.freeze((_Object$freeze2 = {}, _defineProperty(_Object$freeze2, FileChangeStatus.ADDED, '[A] '), _defineProperty(_Object$freeze2, FileChangeStatus.MODIFIED, '[M] '), _defineProperty(_Object$freeze2, FileChangeStatus.MISSING, '[!] '), _defineProperty(_Object$freeze2, FileChangeStatus.REMOVED, '[D] '), _defineProperty(_Object$freeze2, FileChangeStatus.UNTRACKED, '[?] '), _Object$freeze2));

exports.FileChangeStatusToPrefix = FileChangeStatusToPrefix;

function getDirtyFileChanges(repository) {
  var dirtyFileChanges = new Map();
  var statuses = repository.getAllPathStatuses();
  for (var filePath in statuses) {
    var changeStatus = HgStatusToFileChangeStatus[statuses[filePath]];
    if (changeStatus != null) {
      dirtyFileChanges.set(filePath, changeStatus);
    }
  }
  return dirtyFileChanges;
}

var UPDATE_STATUS_DEBOUNCE_MS = 50;

function observeStatusChanges(repository) {
  return (0, (_event || _load_event()).observableFromSubscribeFunction)(repository.onDidChangeStatuses.bind(repository)).debounceTime(UPDATE_STATUS_DEBOUNCE_MS).startWith(null).map(function () {
    return getDirtyFileChanges(repository);
  });
}