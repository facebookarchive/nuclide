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
import GadgetPlaceholder from './GadgetPlaceholder';
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

    destroyPaneItem(item): void {
      if (!getState().get('components').has(item)) {
        return;
      }

      React.unmountComponentAtNode(item.element);

      observer.onNext({
        type: ActionTypes.DESTROY_PANE_ITEM,
        payload: {item},
      });
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
    createPaneItem(gadgetId: string, props: Object) {
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
      const notify = () => state$.onNext(reactElement.state);
      // Wrap each callback so that we don't leak the fact that it's implemented with observables
      // (by accepting Observers as well as callbacks).
      const subscribe = cb => state$.forEach(() => cb());

      const GadgetComponent = gadget;
      props = {
        ...props,
        notify,
        subscribe,
      };
      const reactElement = createComponentItem(<GadgetComponent {...props} />);

      observer.onNext({
        type: ActionTypes.CREATE_PANE_ITEM,
        payload: {
          item: reactElement,
          component: GadgetComponent,
          props,
        },
      });

      return reactElement;
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
     * Make sure all of the pane items reflect the current state of the app.
     */
    renderPaneItems(): void {
      const state = getState();

      atom.workspace.getPanes()
        .forEach(pane => {
          const items = pane.getItems();
          const activeItem = pane.getActiveItem();

          // Iterate in reverse so that we can't get tripped up by the items we're adding.
          for (let index = items.length - 1; index >= 0; index--) {
            const item = items[index];

            // If the item is a placeholder, try to replace it. If we were successful, then we know
            // the item is up-to-date, so there's no need to update it and we can move on to the
            // next item.
            if (this.replacePlaceholder(item, pane, index) != null) {
              continue;
            }

            const GadgetComponent = state.get('components').get(item);

            // If there's no component for this item, it isn't a gadget.
            if (GadgetComponent == null) {
              continue;
            }

            // Update the props for the item.
            const oldProps = state.get('props').get(item);
            const newProps = {
              ...oldProps,
              visible: item === activeItem,
            };

            // Re-render the item with the new props.
            React.render(
              <GadgetComponent {...newProps} />,
              item.element,
            );

            observer.onNext({
              type: ActionTypes.UPDATE_PANE_ITEM,
              payload: {
                item,
                props: newProps,
              },
            });
          }
        });
    },

    /**
     * Replace the item if it is a placeholder, returning the new item.
     */
    replacePlaceholder(item, pane, index): ?Object {
      if (!(item instanceof GadgetPlaceholder)) {
        return null;
      }

      const gadgetId = item.getGadgetId();
      const gadget = getState().get('gadgets').get(gadgetId);

      if (gadget == null) {
        // Still don't have the gadget.
        return null;
      }

      // Now that we have the gadget, we can deserialize the state. **IMPORTANT:** if it
      // doesn't have any (e.g. it's `== null`) that's okay! It allows components to provide a
      // default initial state in their constructor; for example:
      //
      //     constructor(props) {
      //       super(props);
      //       this.state = props.initialState || {count: 1};
      //     }
      const rawInitialGadgetState = item.getRawInitialGadgetState();
      const initialState = (
        typeof gadget.deserializeState === 'function' ?
          gadget.deserializeState(rawInitialGadgetState) : rawInitialGadgetState
      );

      const isActive = pane.getActiveItem() === item;

      const realItem = this.createPaneItem(gadgetId, {initialState, visible: isActive});

      // Replace the placeholder with the real item. We'll add the real item first and then
      // remove the old one so that we don't risk dropping down to zero items.
      pane.addItem(realItem, index + 1);
      pane.destroyItem(item);
      if (isActive) {
        pane.setActiveItem(realItem);
      }

      return realItem;
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
