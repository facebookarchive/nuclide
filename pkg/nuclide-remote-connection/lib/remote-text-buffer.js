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
      if (IS_ATOM_119) {
        return loadBufferForUriStatic(uri).then(function (loadedBuffer) {
          atom.project.addBuffer(loadedBuffer);
          return loadedBuffer;
        });
      } else {
        // TODO: (hansonw) T19829039 Remove after 1.19
        buffer = createBufferForUri(uri);
      }
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

var _semver;

function _load_semver() {
  return _semver = _interopRequireDefault(require('semver'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _event;

function _load_event() {
  return _event = require('nuclide-commons/event');
}

var _NuclideTextBuffer;

function _load_NuclideTextBuffer() {
  return _NuclideTextBuffer = _interopRequireDefault(require('./NuclideTextBuffer'));
}

var _RemoteFile;

function _load_RemoteFile() {
  return _RemoteFile = require('./RemoteFile');
}

var _ServerConnection;

function _load_ServerConnection() {
  return _ServerConnection = require('./ServerConnection');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const IS_ATOM_119 = (_semver || _load_semver()).default.gte(atom.getVersion(), '1.19.0-beta0'); /**
                                                                                                 * Copyright (c) 2015-present, Facebook, Inc.
                                                                                                 * All rights reserved.
                                                                                                 *
                                                                                                 * This source code is licensed under the license found in the LICENSE file in
                                                                                                 * the root directory of this source tree.
                                                                                                 *
                                                                                                 * 
                                                                                                 * @format
                                                                                                 */

const TEXT_BUFFER_PARAMS = {
  shouldDestroyOnFileDelete: () => atom.config.get('core.closeDeletedFileTabs')
};

function loadBufferForUriStatic(uri) {
  if ((_nuclideUri || _load_nuclideUri()).default.isLocal(uri)) {
    // $FlowFixMe: Add after 1.19
    return _atom.TextBuffer.load(uri, TEXT_BUFFER_PARAMS);
  }
  const connection = (_ServerConnection || _load_ServerConnection()).ServerConnection.getForUri(uri);
  if (connection == null) {
    throw new Error(`ServerConnection cannot be found for uri: ${uri}`);
  }
  // $FlowFixMe: Add after 1.19
  return _atom.TextBuffer.load(new (_RemoteFile || _load_RemoteFile()).RemoteFile(connection, uri), TEXT_BUFFER_PARAMS);
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
  if ((_nuclideUri || _load_nuclideUri()).default.isLocal(uri)) {
    buffer = new _atom.TextBuffer(params);
  } else {
    const connection = (_ServerConnection || _load_ServerConnection()).ServerConnection.getForUri(uri);
    if (connection == null) {
      throw new Error(`ServerConnection cannot be found for uri: ${uri}`);
    }
    if (IS_ATOM_119) {
      buffer = new _atom.TextBuffer(params);
      // $FlowIgnore: Add setFile after 1.19
      buffer.setFile(new (_RemoteFile || _load_RemoteFile()).RemoteFile(connection, uri));
    } else {
      // TODO: (hansonw) T19829039 Remove after 1.19
      buffer = new (_NuclideTextBuffer || _load_NuclideTextBuffer()).default(connection, params);
    }
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