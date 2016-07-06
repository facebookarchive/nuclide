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

/* FLOW STATUS */

// Types for the old `flow status` output -- v0.22 and below

// Same as FlowStatusErrorMessageComponent, except without the 'level' field.

// New types for `flow status` v0.23.0 (or possibly v0.24.0, it has yet to be finalized)

// The old path, line, etc. fields also currently exist here, but they are deprecated in favor of
// `loc`.

// This is not actually the Flow version; instead it is a build ID or something.

// If there is no path component, this is the empty string. We should make it null instead, in
// that case (t8644340)

// e.g. parse, infer, maybe others?

// file path