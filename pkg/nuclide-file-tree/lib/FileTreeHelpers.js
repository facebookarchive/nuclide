Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

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

var _url2;

function _url() {
  return _url2 = _interopRequireDefault(require('url'));
}

var _crypto2;

function _crypto() {
  return _crypto2 = _interopRequireDefault(require('crypto'));
}

/*
 * Returns a string with backslashes replaced by two backslashes for use with strings passed to the
 * `RegExp` constructor.
 */
function escapeBackslash(str) {
  return str.replace('\\', '\\\\');
}

function dirPathToKey(path) {
  var pathModule = (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.pathModuleFor(path);
  return path.replace(new RegExp(escapeBackslash(pathModule.sep) + '+$'), '') + pathModule.sep;
}

function isDirKey(key) {
  var pathModule = (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.pathModuleFor(key);
  return key.slice(-1) === pathModule.sep;
}

function keyToName(key) {
  var pathModule = (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.pathModuleFor(key);
  var path = keyToPath(key);
  var index = path.lastIndexOf(pathModule.sep);
  return index === -1 ? path : path.slice(index + 1);
}

function keyToPath(key) {
  var pathModule = (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.pathModuleFor(key);
  return key.replace(new RegExp(escapeBackslash(pathModule.sep) + '+$'), '');
}

function getParentKey(key) {
  var pathModule = (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.pathModuleFor(key);
  var path = keyToPath(key);
  var parsed = (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.parse(path);
  parsed.pathname = pathModule.join(parsed.pathname, '..');
  var parentPath = (_url2 || _url()).default.format(parsed);
  return dirPathToKey(parentPath);
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
    var connection = (_nuclideRemoteConnection2 || _nuclideRemoteConnection()).RemoteConnection.getForUri(path);
    if (connection == null) {
      return null;
    }
    return new (_nuclideRemoteConnection2 || _nuclideRemoteConnection()).RemoteDirectory(connection.getConnection(), path);
  } else {
    return new (_atom2 || _atom()).Directory(path);
  }
}

function getFileByKey(key) {
  var path = keyToPath(key);
  if (isDirKey(key)) {
    return null;
  } else if ((_nuclideRemoteUri2 || _nuclideRemoteUri()).default.isRemote(path)) {
    var connection = (_nuclideRemoteConnection2 || _nuclideRemoteConnection()).RemoteConnection.getForUri(path);
    if (connection == null) {
      return;
    }

    return new (_nuclideRemoteConnection2 || _nuclideRemoteConnection()).RemoteFile(connection.getConnection(), path);
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
  var pathModule = (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.pathModuleFor(dirPath);
  return pathModule.isAbsolute(dirPath);
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
  buildHashKey: buildHashKey
};