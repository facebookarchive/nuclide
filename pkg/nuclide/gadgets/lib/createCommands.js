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
import type {Gadget} from '../../gadgets-interfaces';
import type Immutable from 'immutable';
import type {PaneItemContainer} from '../types/PaneItemContainer';

import * as ActionTypes from './ActionTypes';
import * as ContainerVisibility from './ContainerVisibility';
import createComponentItem from './createComponentItem';
import * as ExpandedFlexScale from './ExpandedFlexScale';
import findPaneAndItem from './findPaneAndItem';
import getContainerToHide from './getContainerToHide';
import getResizableContainers from './getResizableContainers';
import GadgetPlaceholder from './GadgetPlaceholder';
import * as GadgetUri from './GadgetUri';
import React from 'react-for-atom';
import Rx from 'rx';
import shallowEqual from 'shallowequal';
import wrapGadget from './wrapGadget';

/**
 * Create an object that provides commands ("action creators")
 */
export default function createCommands(
  observer: rx$IObserver,
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

      return this.showGadget(parsed.gadgetId);
    },

    /**
     * Creates a new pane item for the specified gadget. This is meant to be the single point
     * through which all pane item creation goes (new pane item creation, deserialization,
     * splitting, reopening, etc.).
     */
    createPaneItem(gadgetId: string, props: Object, isNew: boolean = true) {
      // Look up the gadget.
      const gadget = getState().get('gadgets').get(gadgetId);

      // If there's no gadget registered with the provided ID, abort. Maybe the user just
      // deactivated that package.
      if (gadget == null) {
        return;
      }

      const GadgetComponent = gadget;
      const reactElement = createComponentItem(<GadgetComponent {...props} />);

      observer.onNext({
        type: ActionTypes.CREATE_PANE_ITEM,
        payload: {
          item: reactElement,
          component: GadgetComponent,
          gadgetId,
          props,
          isNew,
        },
      });

      return reactElement;
    },

    hideGadget(gadgetId: string): void {
      // Hiding a gadget doesn't just mean closing its pane; it means getting it out of the way.
      // Just closing its pane and would potentially leave siblings which, presumably, the user
      // would then have to also close. Instead, it's more useful to identify the group of gadgets
      // to which this one belongs and get it out of the way. Though groups can be nested, the most
      // useful to hide is almost certainly the topmost, so that's what we do.

      const match = findPaneAndItem(item => getGadgetId(item) === gadgetId);

      // If the gadget isn't present, no biggie; just no-op.
      if (match == null) {
        return;
      }

      const {item: gadgetItem, pane: parentPane} = match;
      const containerToHide = getContainerToHide(parentPane);

      // If gadget is at the top level "hiding" is kind of a murky concept but we'll take it to mean
      // "close."
      if (containerToHide == null) {
        parentPane.destroyItem(gadgetItem);

        // TODO: Store the location of the closed pane for serialization so we can reopen this
        //       gadget there next time. (This isn't necessary if the gadget's default location is
        //       at the top, but is if it was moved there.)
        return;
      }

      ContainerVisibility.hide(containerToHide);
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

            // Don't re-render if the props haven't changed.
            if (shallowEqual(oldProps, newProps)) {
              continue;
            }

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

      const realItem = this.createPaneItem(gadgetId, {initialState, visible: isActive}, false);

      // Copy the metadata about the container from the placeholder.
      realItem._expandedFlexScale = item._expandedFlexScale;

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
    showGadget(gadgetId: string): Object {
      const match = findPaneAndItem(item => getGadgetId(item) === gadgetId);

      if (match == null) {
        // If the gadget isn't in the workspace, create it.
        // TODO: Where it gets created should be customizable with a `defaultLocation` (or similar)
        //       static property on the gadget. This is similar to the `split` option of
        //       `atom.workspace.open`, but uses absolute locations (e.g. it doesn't matter what the
        //       current active pane is).
        const newItem = this.createPaneItem(gadgetId);
        const pane = atom.workspace.getPanes()[0];
        pane.addItem(newItem);
        pane.activateItem(newItem);
        return newItem;
      }

      const {item, pane} = match;
      pane.activateItem(item);

      // If the item isn't in a hidable container (i.e. it's a top-level pane item), we're done.
      const hiddenContainer = getContainerToHide(pane);
      if (hiddenContainer == null) {
        return item;
      }

      // Show all of the containers recursively up the tree.
      for (const container of getResizableContainers(hiddenContainer)) {
        ContainerVisibility.show(container);
      }

      return item;
    },

    toggleGadget(gadgetId: string): void {
      // Show the gadget if it doesn't already exist in the workspace.
      const match = findPaneAndItem(item => getGadgetId(item) === gadgetId);
      if (match == null) {
        this.showGadget(gadgetId);
        return;
      }

      const {pane} = match;

      // Show the gadget if it's hidden.
      for (const container of getResizableContainers(pane)) {
        if (ContainerVisibility.isHidden(container)) {
          this.showGadget(gadgetId);
          return;
        }
      }

      this.hideGadget(gadgetId);
    },

    unregisterGadget(gadgetId: string): void {
      observer.onNext({
        type: ActionTypes.UNREGISTER_GADGET,
        payload: {gadgetId},
      });
    },

    /**
     * Update the provided container's expanded flex scale to its current flex scale.
     */
    updateExpandedFlexScale(container: PaneItemContainer): void {
      const flexScale = container.getFlexScale();

      // If the flex scale is zero, the container isn't expanded.
      if (flexScale === 0) {
        return;
      }

      ExpandedFlexScale.set(container, flexScale);
    },

  };

}

function getGadgetId(item) {
  return item.getGadgetId ? item.getGadgetId() : item.constructor.gadgetId;
}
