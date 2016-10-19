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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _atom;

function _load_atom() {
  return _atom = require('atom');
}

var _atom2;

function _load_atom2() {
  return _atom2 = require('atom');
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _commonsNodeNuclideUri;

function _load_commonsNodeNuclideUri() {
  return _commonsNodeNuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _crypto;

function _load_crypto() {
  return _crypto = _interopRequireDefault(require('crypto'));
}

function dirPathToKey(path) {
  return (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.ensureTrailingSeparator((_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.trimTrailingSeparator(path));
}

function isDirKey(key) {
  return (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.endsWithSeparator(key);
}

function keyToName(key) {
  return (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.basename(key);
}

function keyToPath(key) {
  return (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.trimTrailingSeparator(key);
}

function getParentKey(key) {
  return (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.ensureTrailingSeparator((_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.dirname(key));
}

// The array this resolves to contains the `nodeKey` of each child
function fetchChildren(nodeKey) {
  var directory = getDirectoryByKey(nodeKey);

  return new Promise(function (resolve, reject) {
    if (directory == null) {
      reject('Directory "' + nodeKey + '" not found or is inaccessible.');
      return;
    }

    // $FlowIssue https://github.com/facebook/flow/issues/582
    directory.getEntries(function (error, entries_) {
      var entries = entries_;
      // Resolve to an empty array if the directory deson't exist.
      // TODO: should we reject promise?
      if (error && error.code !== 'ENOENT') {
        reject(error);
        return;
      }
      entries = entries || [];
      var keys = entries.map(function (entry) {
        var path = entry.getPath();
        return entry.isDirectory() ? dirPathToKey(path) : path;
      });
      resolve(keys);
    });
  });
}

function getDirectoryByKey(key) {
  var path = keyToPath(key);
  if (!isDirKey(key)) {
    return null;
  } else if ((_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.isRemote(path)) {
    var connection = (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).ServerConnection.getForUri(path);
    if (connection == null) {
      return null;
    }
    return connection.createDirectory(path);
  } else {
    return new (_atom || _load_atom()).Directory(path);
  }
}

function getFileByKey(key) {
  var path = keyToPath(key);
  if (isDirKey(key)) {
    return null;
  } else if ((_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.isRemote(path)) {
    var connection = (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).ServerConnection.getForUri(path);
    if (connection == null) {
      return null;
    }
    return connection.createFile(path);
  } else {
    return new (_atom2 || _load_atom2()).File(path);
  }
}

function getEntryByKey(key) {
  return getFileByKey(key) || getDirectoryByKey(key);
}

function getDisplayTitle(key) {
  var path = keyToPath(key);

  if ((_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.isRemote(path)) {
    var connection = (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).RemoteConnection.getForUri(path);

    if (connection != null) {
      return connection.getDisplayTitle();
    }
  }
}

// Sometimes remote directories are instantiated as local directories but with invalid paths.
// Also, until https://github.com/atom/atom/issues/10297 is fixed in 1.12,
// Atom sometimes creates phantom "atom:" directories when opening atom:// URIs.
function isValidDirectory(directory) {
  if (!isLocalEntry(directory)) {
    return true;
  }

  var dirPath = directory.getPath();
  return (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.isAbsolute(dirPath);
}

function isLocalEntry(entry) {
  // TODO: implement `RemoteDirectory.isRemoteDirectory()`
  return !('getLocalPath' in entry);
}

function isContextClick(event) {
  return event.button === 2 || event.button === 0 && event.ctrlKey === true && process.platform === 'darwin';
}

function buildHashKey(nodeKey) {
  return (_crypto || _load_crypto()).default.createHash('MD5').update(nodeKey).digest('base64');
}

function updatePathInOpenedEditors(oldPath, newPath) {
  atom.workspace.getTextEditors().forEach(function (editor) {
    var buffer = editor.getBuffer();
    if (buffer.getPath() === oldPath) {
      // setPath will append the hostname when given the local path, so we
      // strip off the hostname here to avoid including it twice in the path.
      buffer.setPath((_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.getPath(newPath));
    }
  });
}

module.exports = {
  dirPathToKey: dirPathToKey,
  isDirKey: isDirKey,
  keyToName: keyToName,
  keyToPath: keyToPath,
  getParentKey: getParentKey,
  fetchChildren: fetchChildren,
  getDirectoryByKey: getDirectoryByKey,
  getEntryByKey: getEntryByKey,
  getFileByKey: getFileByKey,
  getDisplayTitle: getDisplayTitle,
  isValidDirectory: isValidDirectory,
  isLocalEntry: isLocalEntry,
  isContextClick: isContextClick,
  buildHashKey: buildHashKey,
  updatePathInOpenedEditors: updatePathInOpenedEditors
};