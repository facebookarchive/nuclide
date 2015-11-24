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
const SESSION_ID_KEY = '_nuclide_session_id_key';

module.exports = {
  /**
   * Get a RFC4122 (http://www.ietf.org/rfc/rfc4122.txt) v4 UUID as current session's ID.
   * Unless node process is terminated or `reset()` is called, the session id will keep identical.
   */
  get id(): string {
    return require('./singleton').get(
      SESSION_ID_KEY,
      require('uuid').v4);
  },

  reset(): void {
    require('./singleton').clear(SESSION_ID_KEY);
  },
};
