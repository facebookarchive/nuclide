'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FileVersionNotifier = undefined;

var _constants;

function _load_constants() {
  return _constants = require('./constants');
}

var _promise;

function _load_promise() {
  return _promise = require('../../commons-node/promise');
}

var _collection;

function _load_collection() {
  return _collection = require('../../commons-node/collection');
}

class FileVersionNotifier {

  constructor() {
    this._versions = new Map();
    this._requests = new (_collection || _load_collection()).MultiMap();
  }

  // If any out of sync state is detected then an Error is thrown.
  // This will force the client to send a 'sync' event to get back on track.
  onEvent(event) {
    const filePath = event.fileVersion.filePath;
    const changeCount = event.fileVersion.version;
    switch (event.kind) {
      case (_constants || _load_constants()).FileEventKind.OPEN:
        this._versions.set(filePath, changeCount);
        break;
      case (_constants || _load_constants()).FileEventKind.CLOSE:
        this._versions.delete(filePath);
        break;
      case (_constants || _load_constants()).FileEventKind.EDIT:
        this._versions.set(filePath, changeCount);
        break;
      default:
        throw new Error(`Unexpected LocalFileEvent.kind: ${event.kind}`);
    }
    this._checkRequests(filePath);
  }

  dispose() {
    for (const request of this._requests.values()) {
      request.reject(createRejectError());
    }
  }

  getVersion(filePath) {
    return this._versions.get(filePath);
  }

  waitForBufferAtVersion(fileVersion) {
    const filePath = fileVersion.filePath;
    const version = fileVersion.version;
    const currentVersion = this._versions.get(filePath);
    if (currentVersion === version) {
      return Promise.resolve(true);
    } else if (currentVersion != null && currentVersion > version) {
      return Promise.resolve(false);
    }
    const request = new Request(filePath, version);
    this._requests.add(filePath, request);
    return request.promise;
  }

  _checkRequests(filePath) {
    const currentVersion = this._versions.get(filePath);
    if (currentVersion == null) {
      return;
    }

    const requests = Array.from(this._requests.get(filePath));
    const resolves = requests.filter(request => request.changeCount === currentVersion);
    const rejects = requests.filter(request => request.changeCount < currentVersion);
    const remaining = requests.filter(request => request.changeCount > currentVersion);
    this._requests.set(filePath, remaining);

    resolves.forEach(request => request.resolve(true));
    rejects.forEach(request => request.resolve(false));
  }
}

exports.FileVersionNotifier = FileVersionNotifier; /**
                                                    * Copyright (c) 2015-present, Facebook, Inc.
                                                    * All rights reserved.
                                                    *
                                                    * This source code is licensed under the license found in the LICENSE file in
                                                    * the root directory of this source tree.
                                                    *
                                                    * 
                                                    */

function createRejectError() {
  return new Error('File modified past requested change');
}

class Request extends (_promise || _load_promise()).Deferred {

  constructor(filePath, changeCount) {
    super();

    this.filePath = filePath;
    this.changeCount = changeCount;
  }
}