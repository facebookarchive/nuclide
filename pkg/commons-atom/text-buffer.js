'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.save = exports.loadBufferForUri = undefined;

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
 * Provides an asynchronous interface for saving a buffer, regardless of whether it's an Atom
 * TextBuffer or NuclideTextBuffer.
 */
let save = exports.save = (() => {
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

  return function save(_x2) {
    return _ref2.apply(this, arguments);
  };
})();

exports.observeBuffers = observeBuffers;
exports.observeBufferOpen = observeBufferOpen;
exports.observeBufferCloseOrRename = observeBufferCloseOrRename;
exports.bufferForUri = bufferForUri;
exports.existingBufferForUri = existingBufferForUri;

var _atom = require('atom');

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../commons-node/nuclideUri'));
}

var _event;

function _load_event() {
  return _event = require('../commons-node/event');
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../nuclide-remote-connection');
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
 */

function observeBuffers(observeBuffer) {
  return atom.project.observeBuffers(buffer => {
    if (!(_nuclideUri || _load_nuclideUri()).default.isBrokenDeserializedUri(buffer.getPath())) {
      observeBuffer(buffer);
    }
  });
}

// Observes all buffer opens.
// Buffer renames are sent as an open of the new name.
function observeBufferOpen() {
  return (0, (_event || _load_event()).observableFromSubscribeFunction)(observeBuffers).mergeMap(buffer => {
    const end = (0, (_event || _load_event()).observableFromSubscribeFunction)(buffer.onDidDestroy.bind(buffer));
    const rename = (0, (_event || _load_event()).observableFromSubscribeFunction)(buffer.onDidChangePath.bind(buffer)).map(() => buffer).takeUntil(end);
    return _rxjsBundlesRxMinJs.Observable.of(buffer).concat(rename);
  });
}

// Note that on a rename, the openedPath will be the path of the buffer when the open was sent,
// which may not match the current name of the buffer.


// Fires a single event when the buffer is destroyed or renamed.
// Note that on a rename the buffer path will not be the same as the openedPath.
function observeBufferCloseOrRename(buffer) {
  const openedPath = buffer.getPath();
  const end = (0, (_event || _load_event()).observableFromSubscribeFunction)(buffer.onDidDestroy.bind(buffer));
  const rename = (0, (_event || _load_event()).observableFromSubscribeFunction)(buffer.onDidChangePath.bind(buffer));
  return end.merge(rename).take(1).map(() => ({ kind: 'close', buffer, openedPath }));
}

function bufferForUri(uri) {
  const buffer = existingBufferForUri(uri);
  if (buffer != null) {
    return buffer;
  }
  return createBufferForUri(uri);
}

function createBufferForUri(uri) {
  let buffer;
  if ((_nuclideUri || _load_nuclideUri()).default.isLocal(uri)) {
    buffer = new _atom.TextBuffer({ filePath: uri });
  } else {
    const connection = (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).ServerConnection.getForUri(uri);
    if (connection == null) {
      throw new Error(`ServerConnection cannot be found for uri: ${uri}`);
    }
    buffer = new (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).NuclideTextBuffer(connection, { filePath: uri });
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