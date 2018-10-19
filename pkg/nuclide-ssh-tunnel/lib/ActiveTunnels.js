"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ActiveTunnels = void 0;

function _immutable() {
  const data = require("immutable");

  _immutable = function () {
    return data;
  };

  return data;
}

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
// A thin wrapper around Immutable.Map with a key factory
class ActiveTunnels {
  constructor(storage = (0, _immutable().Map)()) {
    this.get = tunnel => {
      return this._storage.get(this._keyForTunnel(tunnel));
    };

    this.set = (tunnel, value) => {
      const key = this._keyForTunnel(tunnel);

      return new ActiveTunnels(this._storage.set(key, value));
    };

    this.toList = () => {
      return this._storage.toList();
    };

    this.update = (tunnel, updater) => {
      const key = this._keyForTunnel(tunnel);

      return new ActiveTunnels(this._storage.update(key, value => updater(value)));
    };

    this.delete = tunnel => {
      const key = this._keyForTunnel(tunnel);

      return new ActiveTunnels(this._storage.delete(key));
    };

    this._keyForTunnel = resolved => {
      return `${resolved.from.host}:${resolved.from.port}:${resolved.from.family}->${resolved.to.host}:${resolved.to.port}:${resolved.to.family}`;
    };

    this._storage = storage;
  }

}

exports.ActiveTunnels = ActiveTunnels;