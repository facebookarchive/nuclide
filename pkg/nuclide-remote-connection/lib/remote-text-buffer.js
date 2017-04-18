'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.saveBuffer = exports.loadBufferForUri = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let loadBufferForUri = exports.loadBufferForUri = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (uri) {
    let buffer = existingBufferForUri(uri);
    if (buffer == null) {
      buffer = createBufferForUri(uri);
    }
    if (buffer.loaded) {
      return buffer;
    }
    try {
      yield buffer.load();
      return buffer;
    } catch (error) {
      atom.project.removeBuffer(buffer);
      throw error;
    }
  });

  return function loadBufferForUri(_x) {
    return _ref.apply(this, arguments);
  };
})();

/**
 * Returns an existing buffer for that uri, or create one if not existing.
 */
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

/**
 * Provides an asynchronous interface for saving a buffer, regardless of whether it's an Atom
 * TextBuffer or NuclideTextBuffer.
 */
let saveBuffer = exports.saveBuffer = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* (buffer) {
    const expectedPath = buffer.getPath();
    const promise = (0, (_event || _load_event()).observableFromSubscribeFunction)(buffer.onDidSave.bind(buffer)).filter(function ({ path }) {
      return path === expectedPath;
    }).take(1).ignoreElements().toPromise();
    // `buffer.save` returns a promise in the case of a NuclideTextBuffer. We'll await it to make sure
    // we catch any async errors too.
    yield Promise.resolve(buffer.save());
    return promise;
  });

  return function saveBuffer(_x2) {
    return _ref2.apply(this, arguments);
  };
})();

exports.bufferForUri = bufferForUri;
exports.existingBufferForUri = existingBufferForUri;

var _atom = require('atom');

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _event;

function _load_event() {
  return _event = require('../../commons-node/event');
}

var _NuclideTextBuffer;

function _load_NuclideTextBuffer() {
  return _NuclideTextBuffer = _interopRequireDefault(require('./NuclideTextBuffer'));
}

var _ServerConnection;

function _load_ServerConnection() {
  return _ServerConnection = require('./ServerConnection');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function bufferForUri(uri) {
  const buffer = existingBufferForUri(uri);
  if (buffer != null) {
    return buffer;
  }
  return createBufferForUri(uri);
}

function createBufferForUri(uri) {
  let buffer;
  const params = {
    filePath: uri,
    shouldDestroyOnFileDelete: () => atom.config.get('core.closeDeletedFileTabs')
  };
  if ((_nuclideUri || _load_nuclideUri()).default.isLocal(uri)) {
    buffer = new _atom.TextBuffer(params);
  } else {
    const connection = (_ServerConnection || _load_ServerConnection()).ServerConnection.getForUri(uri);
    if (connection == null) {
      throw new Error(`ServerConnection cannot be found for uri: ${uri}`);
    }
    buffer = new (_NuclideTextBuffer || _load_NuclideTextBuffer()).default(connection, params);
  }
  atom.project.addBuffer(buffer);

  if (!buffer) {
    throw new Error('Invariant violation: "buffer"');
  }

  return buffer;
}

/**
 * Returns an exsting buffer for that uri, or null if not existing.
 */
function existingBufferForUri(uri) {
  return atom.project.findBufferForPath(uri);
}