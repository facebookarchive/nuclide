Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/**
 * An object specifying methods that will be called with output from a process.
 * @param stdout A function that receives output from stdout.
 * @param stderr A function that receives output from stderr.
 * @param error A function that receives errors from the process.
 * @param exit A function that receives the exit code when the process exits.
 */

/**
 * A function that kicks off a process.
 * @param options A set of options specifying methods that will be called with
 *   output from the process.
 * @return A Promise that resolves to an object on which 'kill' can be called to
 *   kill the process.
 */