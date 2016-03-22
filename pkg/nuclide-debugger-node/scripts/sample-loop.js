#!/usr/bin/env node
'use strict';
/* @noflow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/*eslint-disable no-var, no-console*/

// This is a very simple program that can be used to test nuclide-debugger-node.

var i = 0;
(function f() {
  i++;
  console.log(i);
  setTimeout(f, 1000);
})();
