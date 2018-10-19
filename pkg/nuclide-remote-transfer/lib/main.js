"use strict";

function _collection() {
  const data = require("../../../modules/nuclide-commons/collection");

  _collection = function () {
    return data;
  };

  return data;
}

function _createPackage() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/createPackage"));

  _createPackage = function () {
    return data;
  };

  return data;
}

var _electron = require("electron");

var _fs = _interopRequireDefault(require("fs"));

function _fsPromise() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/fsPromise"));

  _fsPromise = function () {
    return data;
  };

  return data;
}

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

function _nuclideAnalytics() {
  const data = require("../../../modules/nuclide-analytics");

  _nuclideAnalytics = function () {
    return data;
  };

  return data;
}

function _stream() {
  const data = require("../../../modules/nuclide-commons/stream");

  _stream = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
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
 *  strict-local
 * @format
 */
const REMOTE_TRANSFER_FILE_TREE_CONTEXT_MENU_PRIORITY = 500;

if (!(_electron.remote != null)) {
  throw new Error("Invariant violation: \"remote != null\"");
}

function trackTransfer(uploadOrDownload, outcome, numFiles, fileSize, durationMs) {
  (0, _nuclideAnalytics().track)('fb-nuclide-remote-transfer:' + uploadOrDownload + ':' + outcome, Object.assign({
    numFiles,
    fileSize
  }, durationMs != null ? {
    durationMs
  } : {}));
}

function shortenedEnglishListJoin(items) {
  if (items.length > 3) {
    return items.slice(0, 3).join(', ') + ' and ' + (items.length - 3) + ' more';
  } else if (items.length > 1) {
    return items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1];
  } else {
    return items[0] || '';
  }
}

function getDestinationPath(destinationDirectory, sourceFile) {
  return _nuclideUri().default.join(destinationDirectory, _nuclideUri().default.basename(sourceFile));
}

async function sumLocalFileSizes(localFiles) {
  const sizes = await Promise.all(localFiles.map(async localFile => {
    const stat = await _fsPromise().default.stat(localFile);
    return stat.size;
  }));
  return sizes.reduce((a, b) => a + b);
}

async function sumRemoteFileSizes(remoteFiles) {
  const sizes = await Promise.all(remoteFiles.map(async remoteFile => {
    const fsService = (0, _nuclideRemoteConnection().getFileSystemServiceByNuclideUri)(remoteFile);
    const stat = await fsService.stat(remoteFile);
    return stat.size;
  }));
  return sizes.reduce((a, b) => a + b);
}

async function uploadFile(localFile, remoteDirectory) {
  const fsService = (0, _nuclideRemoteConnection().getFileSystemServiceByNuclideUri)(remoteDirectory);
  const [buffer, stat] = await Promise.all([_fsPromise().default.readFile(localFile), _fsPromise().default.stat(localFile)]);
  await fsService.writeFileBuffer(getDestinationPath(remoteDirectory, localFile), buffer, {
    mode: stat.mode
  });
}

async function downloadFile(remoteFile, localDirectory) {
  const fsService = (0, _nuclideRemoteConnection().getFileSystemServiceByNuclideUri)(remoteFile);
  const stat = await fsService.stat(remoteFile);
  await (0, _stream().writeToStream)(fsService.createReadStream(remoteFile).refCount(), _fs.default.createWriteStream(getDestinationPath(localDirectory, remoteFile), {
    mode: stat.mode
  })).toPromise();
}

async function uploadFiles(localFiles, remoteDirectory) {
  for (const localFile of localFiles) {
    // eslint-disable-next-line no-await-in-loop
    await uploadFile(localFile, remoteDirectory);
  }
}

async function downloadFiles(remoteFiles, localDirectory) {
  for (const remoteFile of remoteFiles) {
    // eslint-disable-next-line no-await-in-loop
    await downloadFile(remoteFile, localDirectory);
  }
}

function getUploadDirectoryFromContextMenuSelection(contextMenu) {
  const node = contextMenu.getSingleSelectedNode();

  if (node != null && node.uri && _nuclideUri().default.isRemote(node.uri) && node.isContainer) {
    return node.uri;
  }

  return null;
}

function getDownloadFilesFromContextMenuSelection(contextMenu) {
  const selectedNodes = contextMenu.getSelectedNodes();
  const validNodes = contextMenu.getSelectedNodes().filter(node => node != null && node.uri && _nuclideUri().default.isRemote(node.uri) && !node.isContainer);

  if (validNodes.count() === 0 || validNodes.count() !== selectedNodes.count()) {
    return null;
  }

  return validNodes.map(node => node.uri).toArray();
}

function confirmNotification(message, detail = null) {
  return new Promise((resolve, reject) => {
    const notification = atom.notifications.addError(message, Object.assign({}, detail != null ? {
      detail
    } : {}, {
      buttons: [{
        text: 'Cancel',
        onDidClick: () => {
          reject(new Error('Canceled'));
          notification.dismiss();
        }
      }, {
        text: 'Confirm',
        onDidClick: () => {
          resolve();
          notification.dismiss();
        }
      }],
      dismissable: true
    }));
    notification.onDidDismiss(() => reject(new Error('Canceled')));
  });
}

async function confirmIfUploadWouldOverwrite(remotePaths) {
  const results = await Promise.all(remotePaths.map(async remotePath => {
    const fsService = (0, _nuclideRemoteConnection().getFileSystemServiceByNuclideUri)(remotePath);

    if (await fsService.exists(remotePath)) {
      return remotePath;
    }

    return null;
  }));
  const overwritten = (0, _collection().arrayCompact)(results);

  if (overwritten.length > 1) {
    await confirmNotification('This upload will overwrite ' + overwritten.length + ' files. Do you wish to continue?', shortenedEnglishListJoin(overwritten.map(path => _nuclideUri().default.basename(path))));
  } else if (overwritten.length === 1) {
    await confirmNotification('This upload will overwrite ' + _nuclideUri().default.basename(overwritten[0]) + '. Do you wish to continue?');
  }
}

async function confirmIfDownloadWouldOverwrite(localPaths) {
  const results = await Promise.all(localPaths.map(async localPath => {
    if (await _fsPromise().default.exists(localPath)) {
      return localPath;
    }

    return null;
  }));
  const overwritten = (0, _collection().arrayCompact)(results);

  if (overwritten.length > 1) {
    await confirmNotification('This download will overwrite ' + overwritten.length + ' files. Do you wish to continue?', shortenedEnglishListJoin(overwritten.map(path => _nuclideUri().default.basename(path))));
  } else if (overwritten.length === 1) {
    await confirmNotification('This download will overwrite ' + _nuclideUri().default.basename(overwritten[0]) + '. Do you wish to continue?');
  }
}

function delayedWarning(message, msDelay = 1000, options) {
  const disposables = new (_UniversalDisposable().default)();
  const timeout = setTimeout(() => {
    const notification = atom.notifications.addWarning(message, options);
    disposables.add(() => notification.dismiss());
  }, msDelay);
  disposables.add(() => clearTimeout(timeout));
  return disposables;
}

async function uploadFilesWithNotifications(localFiles, remoteDirectory) {
  const sizePromise = sumLocalFileSizes(localFiles);

  try {
    await confirmIfUploadWouldOverwrite(localFiles.map(localFile => getDestinationPath(remoteDirectory, localFile)));
  } catch (e) {
    trackTransfer('upload', 'overwrite-cancel', localFiles.length, (await sizePromise));
    return;
  }

  const fileOrFiles = localFiles.length !== 1 ? 'files' : 'file';
  const isOrAre = localFiles.length !== 1 ? 'are' : 'is';
  const disposable = delayedWarning('Your ' + fileOrFiles + ' ' + isOrAre + ' still uploading...', 3000, {
    dismissable: true
  });
  const startTime = Date.now();

  try {
    await uploadFiles(localFiles, remoteDirectory);
    disposable.dispose();
    atom.notifications.addSuccess('Successfully uploaded ' + fileOrFiles);
    const durationMs = Date.now() - startTime;
    trackTransfer('upload', 'success', localFiles.length, (await sizePromise), durationMs);
  } catch (e) {
    disposable.dispose();
    atom.notifications.addError('Failed to upload ' + fileOrFiles, {
      detail: String(e),
      dismissable: true
    });
    const durationMs = Date.now() - startTime;
    trackTransfer('upload', 'failure', localFiles.length, (await sizePromise), durationMs);
  }
}

async function downloadFilesWithNotifications(remoteFiles, localDirectory) {
  const sizePromise = sumRemoteFileSizes(remoteFiles);

  try {
    await confirmIfDownloadWouldOverwrite(remoteFiles.map(remoteFile => getDestinationPath(localDirectory, remoteFile)));
  } catch (e) {
    trackTransfer('download', 'overwrite-cancel', remoteFiles.length, (await sizePromise));
    return;
  }

  const fileOrFiles = remoteFiles.length !== 1 ? 'files' : 'file';
  const isOrAre = remoteFiles.length !== 1 ? 'are' : 'is';
  const disposable = delayedWarning('Your ' + fileOrFiles + ' ' + isOrAre + ' still downloading...', 3000, {
    dismissable: true
  });
  const startTime = Date.now();

  try {
    await downloadFiles(remoteFiles, localDirectory);
    disposable.dispose();
    atom.notifications.addSuccess('Successfully downloaded ' + fileOrFiles);
    const durationMs = Date.now() - startTime;
    trackTransfer('download', 'success', remoteFiles.length, (await sizePromise), durationMs);
  } catch (e) {
    disposable.dispose();
    atom.notifications.addError('Failed to download ' + fileOrFiles, {
      detail: String(e),
      dismissable: true
    });
    const durationMs = Date.now() - startTime;
    trackTransfer('download', 'failure', remoteFiles.length, (await sizePromise), durationMs);
  }
}

class Activation {
  constructor() {
    this._disposables = new (_UniversalDisposable().default)();
  }

  provideService() {
    return {
      uploadFiles: uploadFilesWithNotifications
    };
  }

  consumeFileTreeContextMenu(contextMenu) {
    const uploadDisposable = contextMenu.addItemToModifyFileMenu({
      callback: () => {
        const nodeUri = getUploadDirectoryFromContextMenuSelection(contextMenu);

        if (nodeUri == null) {
          return;
        }

        const info = 'Pick a file or multiple files to upload';

        _electron.remote.dialog.showOpenDialog(_electron.remote.getCurrentWindow(), {
          properties: ['openFile', 'multiSelections'],
          title: info,
          message: info
        }, filePaths => {
          uploadFilesWithNotifications(filePaths, nodeUri);
        });
      },
      label: 'Upload File(s)',

      shouldDisplay() {
        return getUploadDirectoryFromContextMenuSelection(contextMenu) != null;
      }

    }, REMOTE_TRANSFER_FILE_TREE_CONTEXT_MENU_PRIORITY);
    const downloadDisposable = contextMenu.addItemToModifyFileMenu({
      callback: () => {
        const nodeUris = getDownloadFilesFromContextMenuSelection(contextMenu);

        if (nodeUris == null) {
          return;
        }

        const thisFileOrTheseFiles = nodeUris.length !== 1 ? 'these files' : 'this file';
        const info = 'Pick a destination to download ' + thisFileOrTheseFiles + ' to';

        _electron.remote.dialog.showOpenDialog(_electron.remote.getCurrentWindow(), {
          properties: ['openDirectory'],
          title: info,
          message: info
        }, filePaths => {
          downloadFilesWithNotifications(nodeUris, filePaths[0]);
        });
      },
      label: 'Download File(s)',

      shouldDisplay() {
        return getDownloadFilesFromContextMenuSelection(contextMenu) != null;
      }

    }, REMOTE_TRANSFER_FILE_TREE_CONTEXT_MENU_PRIORITY);

    this._disposables.add(uploadDisposable, downloadDisposable);

    return new (_UniversalDisposable().default)(() => this._disposables.remove(uploadDisposable), () => this._disposables.remove(downloadDisposable));
  }

  dispose() {
    this._disposables.dispose();
  }

}

(0, _createPackage().default)(module.exports, Activation);