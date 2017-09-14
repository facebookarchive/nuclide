'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Constants;

function _load_Constants() {
  return _Constants = require('./Constants');
}

var _atom = require('atom');

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('nuclide-commons-atom/feature-config'));
}

var _observable;

function _load_observable() {
  return _observable = require('nuclide-commons/observable');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _passesGK;

function _load_passesGK() {
  return _passesGK = _interopRequireDefault(require('../../commons-node/passesGK'));
}

var _crypto = _interopRequireDefault(require('crypto'));

var _semver;

function _load_semver() {
  return _semver = _interopRequireDefault(require('semver'));
}

var _os = _interopRequireDefault(require('os'));

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
   * @format
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

function observeUncommittedChangesKindConfigKey() {
  return (0, (_observable || _load_observable()).cacheWhileSubscribed)((_featureConfig || _load_featureConfig()).default.observeAsStream((_Constants || _load_Constants()).SHOW_UNCOMMITTED_CHANGES_KIND_CONFIG_KEY).map(setting => {
    // We need to map the unsanitized feature-setting string
    // into a properly typed value:
    switch (setting) {
      case (_Constants || _load_Constants()).ShowUncommittedChangesKind.HEAD:
        return (_Constants || _load_Constants()).ShowUncommittedChangesKind.HEAD;
      case (_Constants || _load_Constants()).ShowUncommittedChangesKind.STACK:
        return (_Constants || _load_Constants()).ShowUncommittedChangesKind.STACK;
      default:
        return (_Constants || _load_Constants()).ShowUncommittedChangesKind.UNCOMMITTED;
    }
  }).distinctUntilChanged());
}

function updatePathInOpenedEditors(oldPath, newPath) {
  atom.workspace.getTextEditors().forEach(editor => {
    const buffer = editor.getBuffer();
    const bufferPath = buffer.getPath();
    if (bufferPath == null) {
      return;
    }

    if ((_nuclideUri || _load_nuclideUri()).default.contains(oldPath, bufferPath)) {
      const relativeToOld = (_nuclideUri || _load_nuclideUri()).default.relative(oldPath, bufferPath);
      const newBufferPath = (_nuclideUri || _load_nuclideUri()).default.join(newPath, relativeToOld);
      // TODO(19829039): clean up after 1.19
      if ((_semver || _load_semver()).default.gte(atom.getVersion(), '1.19.0-beta0')) {
        // setPath() doesn't work correctly with remote files.
        // We need to create a new remote file and reset the underlying file.
        const file = getFileByKey(newBufferPath);

        if (!(file != null)) {
          throw new Error(`Could not update open file ${oldPath} to ${newBufferPath}`);
        }
        // $FlowFixMe: add to TextBuffer


        buffer.setFile(file);
      } else {
        // setPath will append the hostname when given the local path, so we
        // strip off the hostname here to avoid including it twice in the path.
        // $FlowIgnore
        buffer.setPath((_nuclideUri || _load_nuclideUri()).default.getPath(newBufferPath));
      }
    }
  });
}

function areStackChangesEnabled() {
  return (0, (_passesGK || _load_passesGK()).default)('nuclide_file_tree_stack_changes');
}

function getSelectionMode(event) {
  if (_os.default.platform() === 'darwin' && event.metaKey && event.button === 0 || _os.default.platform() !== 'darwin' && event.ctrlKey && event.button === 0) {
    return 'multi-select';
  }
  if (_os.default.platform() === 'darwin' && event.ctrlKey && event.button === 0) {
    return 'single-select';
  }
  if (event.shiftKey && event.button === 0) {
    return 'range-select';
  }
  if (!event.shiftKey && !event.ctrlKey && !event.metaKey && !event.altKey) {
    return 'single-select';
  }
  return 'invalid-select';
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
  observeUncommittedChangesKindConfigKey,
  updatePathInOpenedEditors,
  areStackChangesEnabled,
  getSelectionMode
};