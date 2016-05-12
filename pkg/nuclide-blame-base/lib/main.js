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

// Map of line number (0-indexed) to the name that line blames to.

/**
 * Tries to find a URL that contains more information about the revision. If no such URL exists,
 * returns null.
 *
 * Note that this method is optional. Prefer to not define the method than to provide a dummy
 * implementation that returns `Promise.resolve(null)`. The absence of this method indicates to
 * clients that they should not expose UI that depends on this functionality.
 */