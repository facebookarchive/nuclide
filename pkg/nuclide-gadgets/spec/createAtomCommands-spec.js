'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Gadget} from '../lib/types';

import createAtomCommands from '../lib/createAtomCommands';

describe('createAtomCommands', () => {

  const gadgetId = 'my-awesome-gadget';
  const gadget = (({gadgetId}: any): Gadget);

  it('outputs a show command for the gadget', () => {
    const atomCommands = createAtomCommands(gadget, ({}: any));
    expect(Object.keys(atomCommands['atom-workspace'])).toContain(`${gadgetId}:show`);
  });

});
