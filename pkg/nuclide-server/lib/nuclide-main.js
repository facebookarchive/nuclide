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
/* eslint-disable babel/func-params-comma-dangle, prefer-object-spread/prefer-object-spread */

/**
 * This is the main insertion point for starting nuclide-server.
 */

// Set up the on-the-fly transpiler.
require('../../nuclide-node-transpiler');

// Load the ES6+ server code now that the transpiler is in place.
require('./main');
