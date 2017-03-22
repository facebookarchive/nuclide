'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _atom = require('atom');

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _crypto = _interopRequireDefault(require('crypto'));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function dirPathToKey(path) {
  return (_nuclideUri || _load_nuclideUri()).default.ensureTrailingSeparator((_nuclideUri || _load_nuclideUri()).default.trimTrailingSeparator(path));
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   */

function isDirKey(key) {
  return (_nuclideUri || _load_nuclideUri()).default.endsWithSeparator(key);
}

function keyToName(key) {
  return (_nuclideUri || _load_nuclideUri()).default.basename(key);
}

function keyToPath(key) {
  return (_nuclideUri || _load_nuclideUri()).default.trimTrailingSeparator(key);
}

function getParentKey(key) {
  return (_nuclideUri || _load_nuclideUri()).default.ensureTrailingSeparator((_nuclideUri || _load_nuclideUri()).default.dirname(key));
}

// The array this resolves to contains the `nodeKey` of each child
function fetchChildren(nodeKey) {
  const directory = getDirectoryByKey(nodeKey);

  return new Promise((resolve, reject) => {
    if (directory == null) {
      reject(new Error(`Directory "${nodeKey}" not found or is inaccessible.`));
      return;
    }

    // $FlowIssue https://github.com/facebook/flow/issues/582
    directory.getEntries((error, entries_) => {
      let entries = entries_;
      // Resolve to an empty array if the directory deson't exist.
      // TODO: should we reject promise?
      if (error && error.code !== 'ENOENT') {
        reject(error);
        return;
      }
      entries = entries || [];
      const keys = entries.map(entry => {
        const path = entry.getPath();
        return entry.isDirectory() ? dirPathToKey(path) : path;
      });
      resolve(keys);
    });
  });
}

function getDirectoryByKey(key) {
  const path = keyToPath(key);
  if (!isDirKey(key)) {
    return null;
  } else if ((_nuclideUri || _load_nuclideUri()).default.isRemote(path)) {
    const connection = (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).ServerConnection.getForUri(path);
    if (connection == null) {
      return null;
    }
    return connection.createDirectory(path);
  } else {
    return new _atom.Directory(path);
  }
}

function getFileByKey(key) {
  const path = keyToPath(key);
  if (isDirKey(key)) {
    return null;
  } else if ((_nuclideUri || _load_nuclideUri()).default.isRemote(path)) {
    const connection = (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).ServerConnection.getForUri(path);
    if (connection == null) {
      return null;
    }
    return connection.createFile(path);
  } else {
    return new _atom.File(path);
  }
}

function getEntryByKey(key) {
  return getFileByKey(key) || getDirectoryByKey(key);
}

function getDisplayTitle(key) {
  const path = keyToPath(key);

  if ((_nuclideUri || _load_nuclideUri()).default.isRemote(path)) {
    const connection = (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).RemoteConnection.getForUri(path);

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

  const dirPath = directory.getPath();
  return (_nuclideUri || _load_nuclideUri()).default.isAbsolute(dirPath);
}

function isLocalEntry(entry) {
  // TODO: implement `RemoteDirectory.isRemoteDirectory()`
  return !('getLocalPath' in entry);
}

function isContextClick(event) {
  return event.button === 2 || event.button === 0 && event.ctrlKey === true && process.platform === 'darwin';
}

function buildHashKey(nodeKey) {
  return _crypto.default.createHash('MD5').update(nodeKey).digest('base64');
}

function updatePathInOpenedEditors(oldPath, newPath) {
  atom.workspace.getTextEditors().forEach(editor => {
    const buffer = editor.getBuffer();
    if (buffer.getPath() === oldPath) {
      // setPath will append the hostname when given the local path, so we
      // strip off the hostname here to avoid including it twice in the path.
      buffer.setPath((_nuclideUri || _load_nuclideUri()).default.getPath(newPath));
    }
  });
}

exports.default = {
  dirPathToKey,
  isDirKey,
  keyToName,
  keyToPath,
  getParentKey,
  fetchChildren,
  getDirectoryByKey,
  getEntryByKey,
  getFileByKey,
  getDisplayTitle,
  isValidDirectory,
  isLocalEntry,
  isContextClick,
  buildHashKey,
  updatePathInOpenedEditors
};