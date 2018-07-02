"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _Constants() {
  const data = require("./Constants");

  _Constants = function () {
    return data;
  };

  return data;
}

var _atom = require("atom");

function _nuclideRemoteConnection() {
  const data = require("../../nuclide-remote-connection");

  _nuclideRemoteConnection = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _featureConfig() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/feature-config"));

  _featureConfig = function () {
    return data;
  };

  return data;
}

function _observable() {
  const data = require("../../../modules/nuclide-commons/observable");

  _observable = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

var _crypto = _interopRequireDefault(require("crypto"));

var _os = _interopRequireDefault(require("os"));

function _nuclideFsAtom() {
  const data = require("../../nuclide-fs-atom");

  _nuclideFsAtom = function () {
    return data;
  };

  return data;
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
  return _nuclideUri().default.ensureTrailingSeparator(_nuclideUri().default.trimTrailingSeparator(path));
}

function isDirOrArchiveKey(key) {
  return _nuclideUri().default.endsWithSeparator(key) || _nuclideUri().default.hasKnownArchiveExtension(key);
}

function keyToName(key) {
  return _nuclideUri().default.basename(key);
}

function keyToPath(key) {
  return _nuclideUri().default.trimTrailingSeparator(key);
}

function getParentKey(key) {
  return _nuclideUri().default.ensureTrailingSeparator(_nuclideUri().default.dirname(key));
} // The array this resolves to contains the `nodeKey` of each child


function fetchChildren(nodeKey) {
  const directory = getDirectoryByKey(nodeKey);
  return new Promise((resolve, reject) => {
    if (directory == null) {
      reject(new Error(`Directory "${nodeKey}" not found or is inaccessible.`));
      return;
    }

    directory.getEntries((error, entries_) => {
      let entries = entries_; // Resolve to an empty array if the directory deson't exist.
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
  } else if (_nuclideUri().default.isRemote(path)) {
    const connection = _nuclideRemoteConnection().ServerConnection.getForUri(path);

    if (connection == null) {
      // Placeholder remote directories are just empty.
      // These will be removed by nuclide-remote-projects after reconnection, anyway.
      return new (_nuclideRemoteConnection().RemoteDirectoryPlaceholder)(path);
    }

    if (_nuclideUri().default.hasKnownArchiveExtension(key)) {
      return connection.createFileAsDirectory(path);
    } else {
      return connection.createDirectory(path);
    }
  } else if (_nuclideUri().default.hasKnownArchiveExtension(key)) {
    // $FlowFixMe(>=0.68.0) Flow suppress (T27187857)
    return _nuclideFsAtom().ROOT_ARCHIVE_FS.newArchiveFileAsDirectory(path);
  } else if (!_nuclideUri().default.isInArchive(path)) {
    return new _atom.Directory(path);
  } else {
    // $FlowFixMe(>=0.68.0) Flow suppress (T27187857)
    return _nuclideFsAtom().ROOT_ARCHIVE_FS.newArchiveDirectory(path);
  }
}

function getFileByKey(key) {
  const path = keyToPath(key);

  if (isDirOrArchiveKey(key)) {
    return null;
  } else if (_nuclideUri().default.isRemote(path)) {
    const connection = _nuclideRemoteConnection().ServerConnection.getForUri(path);

    if (connection == null) {
      return null;
    }

    return connection.createFile(path);
  } else if (!_nuclideUri().default.isInArchive(path)) {
    return new _atom.File(path);
  } else {
    // $FlowFixMe(>=0.68.0) Flow suppress (T27187857)
    return _nuclideFsAtom().ROOT_ARCHIVE_FS.newArchiveFile(path);
  }
}

function getEntryByKey(key) {
  return getFileByKey(key) || getDirectoryByKey(key);
}

function getDisplayTitle(key) {
  const path = keyToPath(key);

  if (_nuclideUri().default.isRemote(path)) {
    const connection = _nuclideRemoteConnection().RemoteConnection.getForUri(path);

    if (connection != null) {
      return connection.getDisplayTitle();
    }
  }
} // Sometimes remote directories are instantiated as local directories but with invalid paths.
// Also, until https://github.com/atom/atom/issues/10297 is fixed in 1.12,
// Atom sometimes creates phantom "atom:" directories when opening atom:// URIs.


function isValidDirectory(directory) {
  if (!isLocalEntry(directory)) {
    return true;
  }

  const dirPath = directory.getPath();
  return _nuclideUri().default.isAbsolute(dirPath);
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
  return (0, _observable().cacheWhileSubscribed)(_featureConfig().default.observeAsStream(_Constants().SHOW_UNCOMMITTED_CHANGES_KIND_CONFIG_KEY).map(setting => {
    // We need to map the unsanitized feature-setting string
    // into a properly typed value:
    switch (setting) {
      case _Constants().ShowUncommittedChangesKind.HEAD:
        return _Constants().ShowUncommittedChangesKind.HEAD;

      case _Constants().ShowUncommittedChangesKind.STACK:
        return _Constants().ShowUncommittedChangesKind.STACK;

      default:
        return _Constants().ShowUncommittedChangesKind.UNCOMMITTED;
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

    if (_nuclideUri().default.contains(oldPath, bufferPath)) {
      const relativeToOld = _nuclideUri().default.relative(oldPath, bufferPath);

      const newBufferPath = _nuclideUri().default.join(newPath, relativeToOld); // setPath() doesn't work correctly with remote files.
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

var _default = {
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
exports.default = _default;