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

// TODO: [ @rageandqq | 05-23-16 ]: Add more trigger types as use cases are developed

// Represents the 'viewed' state of a NUX

/**
 * An optional gatekeeper ID to to pass in with this NUX.
 * If omitted, the NUX will always show.
 * If supplied, the NUX will show iff both this and the global `GK_NUX` pass.
 */