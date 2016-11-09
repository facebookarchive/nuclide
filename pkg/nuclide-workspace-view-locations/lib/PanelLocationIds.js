'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});

const TOP_PANEL = exports.TOP_PANEL = 'top-panel';
const RIGHT_PANEL = exports.RIGHT_PANEL = 'right-panel';
const BOTTOM_PANEL = exports.BOTTOM_PANEL = 'bottom-panel';
const LEFT_PANEL = exports.LEFT_PANEL = 'left-panel';

// For now, we just show the bottom and right panels.
exports.default = [RIGHT_PANEL, BOTTOM_PANEL];