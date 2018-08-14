"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.loadBufferForUri = loadBufferForUri;
exports.bufferForUri = bufferForUri;
exports.existingBufferForUri = existingBufferForUri;

var _atom = require("atom");

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _nuclideFsAtom() {
  const data = require("../../nuclide-fs-atom");

  _nuclideFsAtom = function () {
    return data;
  };

  return data;
}

function _RemoteFile() {
  const data = require("./RemoteFile");

  _RemoteFile = function () {
    return data;
  };

  return data;
}

function _ServerConnection() {
  const data = require("./ServerConnection");

  _ServerConnection = function () {
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
const TEXT_BUFFER_PARAMS = {
  shouldDestroyOnFileDelete: () => atom.config.get('core.closeDeletedFileTabs')
};

async function loadBufferForUri(uri) {
  const buffer = existingBufferForUri(uri);

  if (buffer == null) {
    return loadBufferForUriStatic(uri).then(loadedBuffer => {
      atom.project.addBuffer(loadedBuffer);
      return loadedBuffer;
    });
  }

  if (buffer.loaded) {
    return buffer;
  }

  try {
    await buffer.load();
    return buffer;
  } catch (error) {
    atom.project.removeBuffer(buffer);
    throw error;
  }
}

function loadBufferForUriStatic(uri) {
  if (_nuclideUri().default.isLocal(uri)) {
    if (_nuclideUri().default.isInArchive(uri)) {
      return _atom.TextBuffer.load(_nuclideFsAtom().ROOT_ARCHIVE_FS.newArchiveFile(uri), TEXT_BUFFER_PARAMS);
    } else {
      return _atom.TextBuffer.load(uri, TEXT_BUFFER_PARAMS);
    }
  }

  const connection = _ServerConnection().ServerConnection.getForUri(uri);

  if (connection == null) {
    throw new Error(`ServerConnection cannot be found for uri: ${uri}`);
  }

  return _atom.TextBuffer.load(new (_RemoteFile().RemoteFile)(connection, uri), TEXT_BUFFER_PARAMS);
}
/**
 * Returns an existing buffer for that uri, or create one if not existing.
 */


function bufferForUri(uri) {
  const buffer = existingBufferForUri(uri);

  if (buffer != null) {
    return buffer;
  }

  return createBufferForUri(uri);
}

function createBufferForUri(uri) {
  let buffer;
  const params = Object.assign({}, TEXT_BUFFER_PARAMS, {
    filePath: uri
  });

  if (_nuclideUri().default.isLocal(uri)) {
    buffer = new _atom.TextBuffer(params);

    if (_nuclideUri().default.isInArchive(uri)) {
      buffer.setFile(_nuclideFsAtom().ROOT_ARCHIVE_FS.newArchiveFile(uri));
    }
  } else {
    const connection = _ServerConnection().ServerConnection.getForUri(uri);

    if (connection == null) {
      throw new Error(`ServerConnection cannot be found for uri: ${uri}`);
    }

    buffer = new _atom.TextBuffer(params);
    buffer.setFile(new (_RemoteFile().RemoteFile)(connection, uri));
  }

  atom.project.addBuffer(buffer);

  if (!buffer) {
    throw new Error("Invariant violation: \"buffer\"");
  }

  return buffer;
}
/**
 * Returns an exsting buffer for that uri, or null if not existing.
 */


function existingBufferForUri(uri) {
  return atom.project.findBufferForPath(uri);
}