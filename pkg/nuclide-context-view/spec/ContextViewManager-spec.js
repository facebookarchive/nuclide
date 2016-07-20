'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {ContextProvider} from '../lib/ContextViewManager';
import type {Definition} from '../../nuclide-definition-service';

import {CompositeDisposable} from 'atom';
import {ContextViewManager} from '../lib/ContextViewManager';
import {React} from 'react-for-atom';

const PROVIDER1_ID = 'context-provider-1';
const PROVIDER1_TITLE = 'Provider One';
const PROVIDER2_ID = 'context-provider-2';
const PROVIDER2_TITLE = 'Provider Two';

describe('ContextViewManager', () => {

  let managerShowing: ContextViewManager; // Initialized as showing
  let disposables: CompositeDisposable;
  let provider1: ContextProvider;
  let provider2: ContextProvider;

  function elementFactory() {
    return (props: {definition: ?Definition}) => {
      return (<div>Some context provider view</div>);
    };
  }

  beforeEach(() => {
    disposables = new CompositeDisposable();

    managerShowing = new ContextViewManager(300, true);
    provider1 = {
      getElementFactory: elementFactory,
      id: PROVIDER1_ID,
      title: PROVIDER1_TITLE,
      isEditorBased: false,
    };
    provider2 = {
      getElementFactory: elementFactory,
      id: PROVIDER2_ID,
      title: PROVIDER2_TITLE,
      isEditorBased: false,
    };
    disposables.add(managerShowing);
  });

  afterEach(() => {
    disposables.dispose();
  });

  /** Registration/deregistration API */

  it('correctly registers a single context provider and rerenders', () => {
    spyOn(managerShowing, '_render');
    const registered = managerShowing.registerProvider(provider1);
    expect(registered).toBe(true);
    expect(managerShowing._contextProviders.length).toBe(1);
    expect(managerShowing._render).toHaveBeenCalled();
  });
  it('correctly registers multiple context provdiers and rerenders', () => {
    spyOn(managerShowing, '_render');
    const registered1 = managerShowing.registerProvider(provider1);
    const registered2 = managerShowing.registerProvider(provider2);
    expect(registered1).toBe(true);
    expect(registered2).toBe(true);
    expect(managerShowing._contextProviders.length).toBe(2);
    expect(managerShowing._render).toHaveBeenCalled();
  });
  it('does not register a provider with an already existing ID', () => {
    const registered1 = managerShowing.registerProvider(provider1);
    const registeredAgain = managerShowing.registerProvider(provider1);
    expect(registered1).toBe(true);
    expect(registeredAgain).toBe(false); // Shouldn't re-register provider with same ID
    expect(managerShowing._contextProviders.length).toBe(1);
  });
  it('deregisters a provider and rerenders', () => {
    spyOn(managerShowing, '_render');
    managerShowing.registerProvider(provider1);
    const deregistered = managerShowing.deregisterProvider(PROVIDER1_ID);
    expect(deregistered).toBe(true);
    expect(managerShowing._contextProviders.length).toBe(0);
    expect(managerShowing._render).toHaveBeenCalled();
  });
  it('does not deregister a provider that has not been registered', () => {
    spyOn(managerShowing, '_render');
    const deregistered1 = managerShowing.deregisterProvider(PROVIDER1_ID);
    expect(deregistered1).toBe(false);
    expect(managerShowing._contextProviders.length).toBe(0);
    managerShowing.registerProvider(provider1);
    const deregistered2 = managerShowing.deregisterProvider(PROVIDER2_ID);
    expect(deregistered2).toBe(false);
    expect(managerShowing._contextProviders.length).toBe(1);
  });
});
