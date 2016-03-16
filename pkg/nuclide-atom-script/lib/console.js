'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import net from 'net';

/* eslint-disable no-console */

// TODO(mbolin): This redefinition of console.log() does not appear to be bulletproof.
// For example, if you do: `./bin/atom-script ./samples/keybindings.js | head`, you get
// an error.

/**
 * Logic to work around this issue: https://github.com/atom/atom/issues/10952.
 * Specifically, we want to ensure that `console.log()` writes "clean" output to stdout.
 * This means we need to wrap the appropriate functions so they do not include the extra
 * information added by Chromium's chatty logger.
 */
export function instrumentConsole(stdout: string) {
  console.log = (...args: string[]) => {
    const message = args.join(' ');
    const socket = net.connect(
      {path: stdout},
      () => socket.write(message + '\n'),
    );
  };
}
