/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import {StreamMessageReader} from 'vscode-jsonrpc';

/**
 * vscode-jsonrpc's StreamMessageReader has a fatal flaw of throwing exceptions!
 * It's hard to catch asynchronous exceptions, and it crashes the Nuclide server.
 * Until this is addressed, this captures exceptions and emits errors instead.
 *
 * https://github.com/Microsoft/vscode-languageserver-node/issues/270
 */
export default class SafeStreamMessageReader extends StreamMessageReader {
  onData(data: Buffer | string) {
    try {
      super.onData(data);
    } catch (err) {
      this.fireError(err);
      // Stop handling events, as stream errors are unrecoverable.
      // The owner of the reader should tear itself down as well.
      this.dispose();
      this.readable.removeAllListeners();
    }
  }
}
