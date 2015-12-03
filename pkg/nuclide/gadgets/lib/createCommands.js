'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Commands} from '../types/Commands';
import type {Gadget} from '../types/Gadget';
import type Immutable from 'immutable';

import * as ActionTypes from './ActionTypes';
import createComponentItem from './createComponentItem';
import * as GadgetUri from './GadgetUri';
import React from 'react-for-atom';
import Rx from 'rx';
import wrapGadget from './wrapGadget';

/**
 * Create an object that provides commands ("action creators")
 */
export default function createCommands(
  observer: Rx.Observer,
  getState: () => Immutable.Map,
): Commands {

  return {

    deactivate(): void {
      observer.onNext({
        type: ActionTypes.DEACTIVATE,
      });
      observer.onCompleted();
    },

    /**
     * Creates a new gadget instance.
     */
    openUri(uri: string): ?Object {
      const parsed = GadgetUri.parse(uri);

      if (parsed == null) {
        return;
      }

      return this.createPaneItem(parsed.gadgetId);
    },

    /**
     * Creates a new pane item for the specified gadget. This is meant to be the single point
     * through which all pane item creation goes (new pane item creation, deserialization,
     * splitting, reopening, etc.).
     */
    createPaneItem(gadgetId: string): ?Object {
      // Look up the gadget.
      const gadget = getState().get('gadgets').get(gadgetId);

      // If there's no gadget registered with the provided ID, abort. Maybe the user just
      // deactivated that package.
      if (gadget == null) {
        return;
      }

      // Create a mini pub-sub system for the component. This is used internally by the wrapper
      // component (see `wrapGadget()`) to communicate state changes to Atom. Note that, even though
      // the stream contains component states, we intentionally don't omit duplicates (i.e. using
      // `distinctUntilChanged`) since the event may be communicating an external side-effect (e.g.
      // in a Flux store).
      const state$ = new Rx.Subject();
      const notify = () => state$.onNext(component.state);
      // Wrap each callback so that we don't leak the fact that it's implemented with observables
      // (by accepting Observers as well as callbacks).
      const subscribe = cb => state$.forEach(() => cb());

      const GadgetComponent = gadget;
      const component = createComponentItem(
        <GadgetComponent notify={notify} subscribe={subscribe} />
      );
      return component;
    },

    registerGadget(gadget: Gadget): void {
      // Wrap the gadget so it has Atom-specific stuff.
      gadget = wrapGadget(gadget);

      observer.onNext({
        type: ActionTypes.REGISTER_GADGET,
        payload: {gadget},
      });
    },

    /**
     * Ensure that a gadget of the specified gadgetId is visible, creating one if necessary.
     */
    showGadget(gadgetId: string): void {
      const uri = GadgetUri.format({gadgetId});
      atom.workspace.open(uri, {searchAllPanes: true});
    },

    unregisterGadget(gadgetId: string): void {
      observer.onNext({
        type: ActionTypes.UNREGISTER_GADGET,
        payload: {gadgetId},
      });
    },

  };

}
