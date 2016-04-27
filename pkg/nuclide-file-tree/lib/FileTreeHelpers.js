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

var _atom = require('atom');

var _nuclideRemoteConnection = require('../../nuclide-remote-connection');

var _nuclideRemoteUri = require('../../nuclide-remote-uri');

var _nuclideRemoteUri2 = _interopRequireDefault(_nuclideRemoteUri);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

/*
 * Returns a string with backslashes replaced by two backslashes for use with strings passed to the
 * `RegExp` constructor.
 */
function escapeBackslash(str) {
  return str.replace('\\', '\\\\');
}

function dirPathToKey(path) {
  return path.replace(new RegExp(escapeBackslash(_path2['default'].sep) + '+$'), '') + _path2['default'].sep;
}

function isDirKey(key) {
  return key.slice(-1) === _path2['default'].sep;
}

function keyToName(key) {
  var path = keyToPath(key);
  var index = path.lastIndexOf(_path2['default'].sep);
  return index === -1 ? path : path.slice(index + 1);
}

function keyToPath(key) {
  return key.replace(new RegExp(escapeBackslash(_path2['default'].sep) + '+$'), '');
}

function getParentKey(key) {
  var path = keyToPath(key);
  var parsed = _nuclideRemoteUri2['default'].parse(path);
  parsed.pathname = _path2['default'].join(parsed.pathname, '..');
  var parentPath = _url2['default'].format(parsed);
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
  } else if (_nuclideRemoteUri2['default'].isRemote(path)) {
    var connection = _nuclideRemoteConnection.RemoteConnection.getForUri(path);
    if (connection == null) {
      return null;
    }
    return new _nuclideRemoteConnection.RemoteDirectory(connection.getConnection(), path);
  } else {
    return new _atom.Directory(path);
  }
}

function getFileByKey(key) {
  var path = keyToPath(key);
  if (isDirKey(key)) {
    return null;
  } else if (_nuclideRemoteUri2['default'].isRemote(path)) {
    var connection = _nuclideRemoteConnection.RemoteConnection.getForUri(path);
    if (connection == null) {
      return;
    }

    return new _nuclideRemoteConnection.RemoteFile(connection.getConnection(), path);
  } else {
    return new _atom.File(path);
  }
}

function getEntryByKey(key) {
  return getFileByKey(key) || getDirectoryByKey(key);
}

function getDisplayTitle(key) {
  var path = keyToPath(key);

  if (_nuclideRemoteUri2['default'].isRemote(path)) {
    var connection = _nuclideRemoteConnection.RemoteConnection.getForUri(path);

    if (connection != null) {
      return connection.getDisplayTitle();
    }
  }
}

// Sometimes remote directories are instantiated as local directories but with invalid paths.
function isValidDirectory(directory) {
  return !isLocalEntry(directory) || _path2['default'].isAbsolute(directory.getPath());
}

function isLocalEntry(entry) {
  // TODO: implement `RemoteDirectory.isRemoteDirectory()`
  return !('getLocalPath' in entry);
}

function isContextClick(event) {
  return event.button === 2 || event.button === 0 && event.ctrlKey === true && process.platform === 'darwin';
}

function buildHashKey(nodeKey) {
  return _crypto2['default'].createHash('MD5').update(nodeKey).digest('base64');
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