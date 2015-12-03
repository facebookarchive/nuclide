'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import Immutable from 'immutable';

/**
 * Get the initial state of the gadgets app.
 * TODO: Get this from deserialization.
 */
export default function getInitialState(): Immutable.Map {
  return Immutable.Map({
    gadgets: Immutable.Map(),
  });
}
