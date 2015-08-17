'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

// Since nuclide-commons is a Node package, we might end up having multiple copy of it running in
// Node/Atom. To make sure we only have one copy of sessionId, we store it as a property of `global`
// object with SESSION_ID_KEY as key.
var SESSION_ID_KEY = '_nuclide_session_id_key';

module.exports = {
  /**
   * Get a RFC4122 (http://www.ietf.org/rfc/rfc4122.txt) v4 UUID as current session's ID.
   * Unless node process is terminated or `reset()` is called, the session id will keep identical.
   */
  get id(): string {
    if (global[SESSION_ID_KEY] === undefined) {
      var uuid = require('uuid');
      var sessionId = uuid.v4();
      global[SESSION_ID_KEY] = sessionId;
    }
    return global[SESSION_ID_KEY];
  },

  reset(): void {
    global[SESSION_ID_KEY] = undefined;
  },

  __test__: {
    SESSION_ID_KEY,
  },
};
