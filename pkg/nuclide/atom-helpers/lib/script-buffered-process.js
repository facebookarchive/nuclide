'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
var {BufferedProcess} = require('atom');
var {object} = require('nuclide-commons');

/**
 * Wrapper around BufferedProcess that runs the command using unix `script`
 * command. Most of the commands (scripts) we run will color output only if
 * their stdout is terminal. `script` ensures terminal-like environment and
 * commands we run give colored output.
 */
module.exports =
class ScriptBufferedProcess extends BufferedProcess {
  constructor(options) {
    options = object.assign({}, options);
    if (options.args == null) {
      options.args = [];
    }
    options.args = ['-q', '/dev/null', options.command].concat(options.args);
    options.command = 'script';
    super(options);
  }
}
