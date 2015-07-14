'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {TextBuffer} = require('atom');

class ReadOnlyTextBuffer extends TextBuffer {

  // Make deleting in the text buffer a no-op to disallow editing (read-only).
  delete() {}

}

module.exports = ReadOnlyTextBuffer;
