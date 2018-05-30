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
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('../../../modules/nuclide-commons-atom/feature-config'));
}

var _observable;

function _load_observable() {
  return _observable = require('../../../modules/nuclide-commons/observable');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _crypto = _interopRequireDefault(require('crypto'));

var _os = _interopRequireDefault(require('os'));

var _nuclideFsAtom;

function _load_nuclideFsAtom() {
  return _nuclideFsAtom = require('../../nuclide-fs-atom');
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

function dirPathToKey(path) {
  return (_nuclideUri || _load_nuclideUri()).default.ensureTrailingSeparator((_nuclideUri || _load_nuclideUri()).default.trimTrailingSeparator(path));
}

function isDirOrArchiveKey(key) {
  return (_nuclideUri || _load_nuclideUri()).default.endsWithSeparator(key) || (_nuclideUri || _load_nuclideUri()).default.hasKnownArchiveExtension(key);
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
        if (entry.isDirectory()) {
          return dirPathToKey(path);
        } else {
          return path;
        }
      });
      resolve(keys);
    });
  });
}

function getDirectoryByKey(key) {
  const path = keyToPath(key);
  if (!isDirOrArchiveKey(key)) {
    return null;
  } else if ((_nuclideUri || _load_nuclideUri()).default.isRemote(path)) {
    const connection = (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).ServerConnection.getForUri(path);
    if (connection == null) {
      // Placeholder remote directories are just empty.
      // These will be removed by nuclide-remote-projects after reconnection, anyway.
      return new (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).RemoteDirectoryPlaceholder(path);
    }
    if ((_nuclideUri || _load_nuclideUri()).default.hasKnownArchiveExtension(key)) {
      return connection.createFileAsDirectory(path);
    } else {
      return connection.createDirectory(path);
    }
  } else if ((_nuclideUri || _load_nuclideUri()).default.hasKnownArchiveExtension(key)) {
    // $FlowFixMe(>=0.68.0) Flow suppress (T27187857)
    return (_nuclideFsAtom || _load_nuclideFsAtom()).ROOT_ARCHIVE_FS.newArchiveFileAsDirectory(path);
  } else if (!(_nuclideUri || _load_nuclideUri()).default.isInArchive(path)) {
    return new _atom.Directory(path);
  } else {
    // $FlowFixMe(>=0.68.0) Flow suppress (T27187857)
    return (_nuclideFsAtom || _load_nuclideFsAtom()).ROOT_ARCHIVE_FS.newArchiveDirectory(path);
  }
}

function getFileByKey(key) {
  const path = keyToPath(key);
  if (isDirOrArchiveKey(key)) {
    return null;
  } else if ((_nuclideUri || _load_nuclideUri()).default.isRemote(path)) {
    const connection = (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).ServerConnection.getForUri(path);
    if (connection == null) {
      return null;
    }
    return connection.createFile(path);
  } else if (!(_nuclideUri || _load_nuclideUri()).default.isInArchive(path)) {
    return new _atom.File(path);
  } else {
    // $FlowFixMe(>=0.68.0) Flow suppress (T27187857)
    return (_nuclideFsAtom || _load_nuclideFsAtom()).ROOT_ARCHIVE_FS.newArchiveFile(path);
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
      // setPath() doesn't work correctly with remote files.
      // We need to create a new remote file and reset the underlying file.
      const file = getFileByKey(newBufferPath);

      if (!(file != null)) {
        throw new Error(`Could not update open file ${oldPath} to ${newBufferPath}`);
      }

      buffer.setFile(file);
    }
  });
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
  isDirOrArchiveKey,
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
  getSelectionMode
};