

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/**
 * This is the set of types that are "built-in" and never need to be imported.
 *
 * NOTE: This is in addition to the standard set of "built-in" modules. This
 * should only be for declared types that are not actual modules.
 */
module.exports = new Set(['$jsx', 'AdAccountID', 'FBID', 'Fbt', 'Function', 'HTMLElement', 'Iterable', 'Map', 'ReactElement', 'Set']);