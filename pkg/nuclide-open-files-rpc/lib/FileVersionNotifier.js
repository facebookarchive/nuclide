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
  return _promise = require('nuclide-commons/promise');
}

var _collection;

function _load_collection() {
  return _collection = require('nuclide-commons/collection');
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

  isBufferAtVersion(fileVersion) {
    const filePath = fileVersion.filePath;
    const version = fileVersion.version;
    const currentVersion = this._versions.get(filePath);
    return currentVersion === version;
  }

  // waitForBufferAtVersion:
  // Asynchronously waits until a FileEdit has passed through fileNotifier.onEvent
  // for this particular version of the file. If for whatever reason this precise version
  // doesn't get passed through onEvent then returns false as soon as we discover that.
  //
  // Fast-typing scenario where it might return false:
  // (1) File is at version N
  // (2) User types to version N+1 which invokes onEvent for N+1
  // (3) It also invoked autocomplete (which needs N+1 buffer to do its job right)
  // (4) User quickly types to version N+2 which invokes onEvent for N+2
  // (5) Autocomplete gets around to requesting N+1
  // At step 5 we know we will never be able to deliver buffer at version N+1, so we return false.
  //
  // Network-connectivity scenario where it might return false:
  // (1) File is at version N
  // (2) User types to version N+1 which invokes autocomplete (which needs N+1 to do its job right)
  // (3) Network goes down before the onEvent for N+1 can be dispatched
  // (4) Network goes back up
  // (5) User types to version N+2 which invokes onEvent for N+2
  // At step 5 we know we will never be able to deliver buffer at version N+1, so we return false.
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
                                                    * @format
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