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

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _atom4;

function _atom3() {
  return _atom4 = require('atom');
}

var _nuclideRemoteConnection2;

function _nuclideRemoteConnection() {
  return _nuclideRemoteConnection2 = require('../../nuclide-remote-connection');
}

var _nuclideRemoteUri2;

function _nuclideRemoteUri() {
  return _nuclideRemoteUri2 = _interopRequireDefault(require('../../nuclide-remote-uri'));
}

var _crypto2;

function _crypto() {
  return _crypto2 = _interopRequireDefault(require('crypto'));
}

function dirPathToKey(path) {
  return (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.ensureTrailingSeparator((_nuclideRemoteUri2 || _nuclideRemoteUri()).default.trimTrailingSeparator(path));
}

function isDirKey(key) {
  return (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.endsWithSeparator(key);
}

function keyToName(key) {
  return (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.basename(key);
}

function keyToPath(key) {
  return (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.trimTrailingSeparator(key);
}

function getParentKey(key) {
  return (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.ensureTrailingSeparator((_nuclideRemoteUri2 || _nuclideRemoteUri()).default.dirname(key));
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
    directory.getEntries(function (error, entries) {
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
  } else if ((_nuclideRemoteUri2 || _nuclideRemoteUri()).default.isRemote(path)) {
    var connection = (_nuclideRemoteConnection2 || _nuclideRemoteConnection()).ServerConnection.getForUri(path);
    if (connection == null) {
      return null;
    }
    return connection.createDirectory(path);
  } else {
    return new (_atom2 || _atom()).Directory(path);
  }
}

function getFileByKey(key) {
  var path = keyToPath(key);
  if (isDirKey(key)) {
    return null;
  } else if ((_nuclideRemoteUri2 || _nuclideRemoteUri()).default.isRemote(path)) {
    var connection = (_nuclideRemoteConnection2 || _nuclideRemoteConnection()).ServerConnection.getForUri(path);
    if (connection == null) {
      return null;
    }
    return connection.createFile(path);
  } else {
    return new (_atom4 || _atom3()).File(path);
  }
}

function getEntryByKey(key) {
  return getFileByKey(key) || getDirectoryByKey(key);
}

function getDisplayTitle(key) {
  var path = keyToPath(key);

  if ((_nuclideRemoteUri2 || _nuclideRemoteUri()).default.isRemote(path)) {
    var connection = (_nuclideRemoteConnection2 || _nuclideRemoteConnection()).RemoteConnection.getForUri(path);

    if (connection != null) {
      return connection.getDisplayTitle();
    }
  }
}

// Sometimes remote directories are instantiated as local directories but with invalid paths.
function isValidDirectory(directory) {
  if (!isLocalEntry(directory)) {
    return true;
  }

  var dirPath = directory.getPath();
  return (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.isAbsolute(dirPath);
}

function isLocalEntry(entry) {
  // TODO: implement `RemoteDirectory.isRemoteDirectory()`
  return !('getLocalPath' in entry);
}

function isContextClick(event) {
  return event.button === 2 || event.button === 0 && event.ctrlKey === true && process.platform === 'darwin';
}

function buildHashKey(nodeKey) {
  return (_crypto2 || _crypto()).default.createHash('MD5').update(nodeKey).digest('base64');
}

function updatePathInOpenedEditors(oldPath, newPath) {
  atom.workspace.getTextEditors().forEach(function (editor) {
    var buffer = editor.getBuffer();
    if (buffer.getPath() === oldPath) {
      // setPath will append the hostname when given the local path, so we
      // strip off the hostname here to avoid including it twice in the path.
      buffer.setPath((_nuclideRemoteUri2 || _nuclideRemoteUri()).default.getPath(newPath));
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