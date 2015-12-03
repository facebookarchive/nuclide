'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {Disposable} from 'atom';
import createAtomCommands from '../lib/createAtomCommands';
import Immutable from 'immutable';

const noop = () => null;

describe('createAtomCommands', () => {

  // Get a list of the commands registered from the list of calls on an `atom.commands.add` spy.
  const getAddedCommands = calls => calls.map(call => call.args[1]);

  it('registers a show command for each gadget', () => {
    const gadgetId = 'my-awesome-gadget';
    const gadgets = Immutable.Map({
      'my-awesome-gadget': {gadgetId},
    });
    spyOn(atom.commands, 'add').andReturn(new Disposable(noop));
    createAtomCommands(gadgets, {});
    expect(getAddedCommands(atom.commands.add.calls)).toContain(`${gadgetId}:show`);
  });

});
