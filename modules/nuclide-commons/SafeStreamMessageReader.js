"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _vscodeJsonrpc() {
  const data = require("vscode-jsonrpc");

  _vscodeJsonrpc = function () {
    return data;
  };

  return data;
}

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict
 * @format
 */

/**
 * vscode-jsonrpc's StreamMessageReader has a fatal flaw of throwing exceptions!
 * It's hard to catch asynchronous exceptions, and it crashes the Nuclide server.
 * Until this is addressed, this captures exceptions and emits errors instead.
 *
 * https://github.com/Microsoft/vscode-languageserver-node/issues/270
 */
class SafeStreamMessageReader extends _vscodeJsonrpc().StreamMessageReader {
  onData(data) {
    try {
      super.onData(data);
    } catch (err) {
      this.fireError(err); // Stop handling events, as stream errors are unrecoverable.
      // The owner of the reader should tear itself down as well.

      this.dispose();
      this.readable.removeAllListeners();
    }
  }

}

exports.default = SafeStreamMessageReader;