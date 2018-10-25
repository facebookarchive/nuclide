"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */
class HandleMap {
  constructor(nextHandle) {
    this.DEFAULT_STARTING_HANDLE = 1000;
    this._startingHandle = nextHandle == null ? 1000 : nextHandle;
    this.clear();
  }

  clear() {
    this._nextHandle = this._startingHandle;
    this._objectsByHandle = new Map();
    this._handlesByObject = new Map();
  }

  get allObjects() {
    return Array.from(this._objectsByHandle.values());
  }

  put(obj) {
    // maintain 1:1 mapping
    let handle = this._handlesByObject.get(obj);

    if (handle == null) {
      handle = this._nextHandle++;

      this._objectsByHandle.set(handle, obj);

      this._handlesByObject.set(obj, handle);
    }

    return handle;
  }

  getObjectByHandle(handle) {
    return this._objectsByHandle.get(handle);
  }

  getHandleByObject(obj) {
    return this._handlesByObject.get(obj);
  }

  removeHandle(handle) {
    const obj = this._objectsByHandle.get(handle);

    if (obj != null) {
      this._handlesByObject.delete(obj);

      this._objectsByHandle.delete(handle);
    }
  }

  removeObject(obj) {
    const handle = this._handlesByObject.get(obj);

    if (handle != null) {
      this._handlesByObject.delete(obj);

      this._objectsByHandle.delete(handle);
    }
  }

  toString() {
    return JSON.stringify([...this._objectsByHandle]);
  }

}

exports.default = HandleMap;