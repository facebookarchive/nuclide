'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const DEBUGGER_LOGGER_CATEGORY = 'nuclide-hhvm-debugger';
export default require('../../logging').getCategoryLogger(DEBUGGER_LOGGER_CATEGORY);
