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

/* NON-TRANSPILED FILE */

/* eslint-disable no-console */

process.on('uncaughtException', err => {
  console.error(err.stack);
  process.exit(1);
});

require('../../nuclide-node-transpiler');
require('../lib/generate-proxy-main');
