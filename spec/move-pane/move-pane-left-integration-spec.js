'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {testMovePaneDirection} from '../lib/move-pane-common';

describe('Left Move Pane Integration Test', () => {
  testMovePaneDirection('left');
});
