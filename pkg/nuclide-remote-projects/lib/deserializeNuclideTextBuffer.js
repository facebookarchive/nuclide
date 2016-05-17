

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

// Since we register these buffers with the project, they will get serialized
// with NuclideTextBuffer as the deserializer. We deserialize them as regular
// TextBuffers since at this point in the Atom lifecycle, there is no remote
// connection that can be associated with the NuclideTextBuffer. After the
// remote connection is reestablished, nuclide-remote-projects will convert
// the TextBuffer to NuclideTextBuffer.

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

module.exports = function (state, params) {
  return (_atom2 || _atom()).TextBuffer.deserialize(state, params);
};