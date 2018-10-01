"use strict";

function _IpcTransports() {
  const data = require("../lib/IpcTransports");

  _IpcTransports = function () {
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
const transport = new (_IpcTransports().IpcServerTransport)();

if (!!transport.isClosed()) {
  throw new Error("Invariant violation: \"!transport.isClosed()\"");
}

transport.onMessage().subscribe(message => {
  if (message === 'exit') {
    process.exit(0);
  } else {
    transport.send(message.toUpperCase());
  }
});