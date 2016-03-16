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

  const gadgetId = 'my-awesome-gadget';
  const gadgets = Immutable.Map({
    'my-awesome-gadget': {gadgetId},
  });

  beforeEach(() => {
    spyOn(atom.commands, 'add').andReturn(new Disposable(noop));
  });

  it('registers a show command for each gadget', () => {
    createAtomCommands(gadgets, ({}: any));
    expect(getAddedCommands(atom.commands.add.calls)).toContain(`${gadgetId}:show`);
  });

  it('returns a valid disposable', () => {
    // Previously, a bug in `createAtomCommands()` caused non-disposables to be added to the
    // returned CompositeDisposable. Unfortunately, this wouldn't be noticed until `dispose()` was
    // called on the result when an error would be thrown. Things are good as long as we don't get
    // that error when invoking `dispose()`.
    const disposable = createAtomCommands(gadgets, ({}: any));
    expect(() => { disposable.dispose(); }).not.toThrow();
  });

});
