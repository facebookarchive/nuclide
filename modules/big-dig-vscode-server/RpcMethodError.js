"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RpcMethodError = void 0;

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

/**
 * Represents an error from an RPC method that will be serialized and sent
 * back to the client. Use this to send extra parameters back to the client;
 * they will be serialized via `JSON.stringify()`.
 *
 * All errors thrown from an RPC method will be automatically wrapped via
 * `RpcMethodError.wrap` and sent to the client.
 */
class RpcMethodError extends Error {
  /** Extra information that will be sent back to the client. */

  /**
   * @param message - the error message.
   * @param parameters - any extra parameters that should be sent back to the
   * client.
   */
  constructor(message, parameters = {}) {
    super(message);
    this.parameters = parameters;
  }
  /**
   * Create an `RpcMethodError` from an arbitrary error. If the error is already
   * an `RpcMethodError`, it will be returned as-is. Otherwise, this will
   * extract an error message (either via `error.message` or `error.toString()`)
   * and attempt to find any parameters that are worth passing to the client.
   * For example, if `error` is a System Error, fields `code` and `errno` will
   * be extracted as parameters.
   */


  static wrap(error) {
    if (error instanceof RpcMethodError) {
      return error;
    }

    const message = (error.message || error).toString();
    const parameters = {};

    if (error.code != null) {
      parameters.code = error.code;
    }

    if (error.errno != null) {
      parameters.errno = error.errno;
    }

    return new RpcMethodError(message, parameters);
  }

}

exports.RpcMethodError = RpcMethodError;