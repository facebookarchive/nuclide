"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.breakpointFromArgList = breakpointFromArgList;

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict-local
 * @format
 */
// The format of all of the breakpoint commands that take a breakpoint is the
// same: index for a single breakpoint, 'all' for all breakpoints, empty for
// the breakpoint we're stopped at. Parse that.
//
// Throws on any error. If null is returned, it means 'all breakpoints'
//
function breakpointFromArgList(dbg, args, cmd) {
  let bpt = null;

  if (args.length === 0) {
    if (!dbg.supportsStoppedAtBreakpoint()) {
      throw new Error('This adapter does not support operations on the current breakpoint.');
    }

    bpt = dbg.getStoppedAtBreakpoint();

    if (bpt == null) {
      throw new Error('The debugger is not stopped at a user created breakpoint.');
    }

    return bpt;
  }

  let index = NaN;

  if (args.length !== 1 || !'all'.startsWith(args[0]) && isNaN(index = parseInt(args[0], 10))) {
    throw new Error(`Format is 'breakpoint ${cmd} [index | 'all']'`);
  }

  if (isNaN(index)) {
    return null;
  } // This call will throw already if index is out of range.


  bpt = dbg.getBreakpointByIndex(index);

  if (!(bpt != null)) {
    throw new Error("Invariant violation: \"bpt != null\"");
  }

  return bpt;
}