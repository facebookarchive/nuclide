var renameNode = _asyncToGenerator(function* (node, newPath) {
  var entry = (_FileTreeHelpers2 || _FileTreeHelpers()).default.getEntryByKey(node.uri);
  if (entry == null) {
    // TODO: Connection could have been lost for remote file.
    return;
  }
  var filePath = entry.getPath();
  // Ignore move if entry is moved to same location as currently.
  if ((0, (_nuclideRemoteUri2 || _nuclideRemoteUri()).getPath)(filePath) === newPath) {
    return;
  }

  var hgRepository = getHgRepositoryForNode(node);
  var shouldFSRename = true;
  if (hgRepository != null) {
    try {
      shouldFSRename = false;
      yield hgRepository.rename(filePath, newPath);
    } catch (e) {
      var statuses = yield hgRepository.getStatuses([filePath]);
      var pathStatus = statuses.get(filePath);
      if (legalStatusCodeForRename.has(pathStatus)) {
        atom.notifications.addError('`hg rename` failed, will try to move the file ignoring version control instead.  ' + 'Error: ' + e.toString());
      }
      shouldFSRename = true;
    }
  }
  if (shouldFSRename) {
    var service = (0, (_nuclideClient2 || _nuclideClient()).getFileSystemServiceByNuclideUri)(filePath);
    yield service.rename((0, (_nuclideRemoteUri2 || _nuclideRemoteUri()).getPath)(filePath), newPath);
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
  return _nuclideRemoteUri2 = require('../../nuclide-remote-uri');
}

var _nuclideClient2;

function _nuclideClient() {
  return _nuclideClient2 = require('../../nuclide-client');
}

var _nuclideHgRepositoryBaseLibHgConstants2;

function _nuclideHgRepositoryBaseLibHgConstants() {
  return _nuclideHgRepositoryBaseLibHgConstants2 = require('../../nuclide-hg-repository-base/lib/hg-constants');
}

var legalStatusCodeForRename = new Set([(_nuclideHgRepositoryBaseLibHgConstants2 || _nuclideHgRepositoryBaseLibHgConstants()).StatusCodeNumber.ADDED, (_nuclideHgRepositoryBaseLibHgConstants2 || _nuclideHgRepositoryBaseLibHgConstants()).StatusCodeNumber.CLEAN, (_nuclideHgRepositoryBaseLibHgConstants2 || _nuclideHgRepositoryBaseLibHgConstants()).StatusCodeNumber.MODIFIED]);

function getHgRepositoryForNode(node) {
  var repository = node.repo;
  if (repository != null && repository.getType() === 'hg') {
    return repository;
  }
  return null;
}

module.exports = {
  getHgRepositoryForNode: getHgRepositoryForNode,
  renameNode: renameNode
};