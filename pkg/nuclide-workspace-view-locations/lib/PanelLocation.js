'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {PanelLocationId, SerializedPanelLocation} from './types';
import type {Viewable} from '../../nuclide-workspace-views/lib/types';
import type {Subscription} from 'rxjs';

import {SimpleModel} from '../../commons-node/SimpleModel';
import {bindObservableAsProps} from '../../nuclide-ui/lib/bindObservableAsProps';
import * as PanelLocationIds from './PanelLocationIds';
import {Panel} from './ui/Panel';
import invariant from 'assert';
import {React} from 'react-for-atom';
import {Observable} from 'rxjs';

type State = {
  activeItemIndex: number,
  visible: boolean,
  items: Array<Viewable>,
  size: ?number,
};

/**
 * Manages views for an Atom panel.
 */
export class PanelLocation extends SimpleModel<State> {
  _addPanel: any;
  _panel: ?atom$Panel;
  _locationId: PanelLocationId;
  _visibleSubscription: Subscription;

  // We pass serialized items so that the location can lazily deserialize them when it needs to.
  constructor(locationId: PanelLocationId, serializedState: Object = {}) {
    super();
    (this: any)._createPanel = this._createPanel.bind(this);
    (this: any)._handlePanelResize = this._handlePanelResize.bind(this);
    this._locationId = locationId;
    const serializedData = serializedState.data || {};
    this.state = {
      activeItemIndex: serializedData.activeItemIndex || 0,
      visible: serializedData.visible !== false,
      items: (serializedData.items || []).map(x => atom.deserializers.deserialize(x)),
      size: serializedData.size || null,
    };

    // Lazily create the panel when we want to display an item.
    // $FlowIssue: We need to teach flow about Symbol.observable.
    this._visibleSubscription = Observable.from(this)
      .map(this._getItemToDisplay)
      .filter(item => item != null)
      .first()
      .subscribe(this._createPanel);
  }

  _createPanel(): void {
    if (this._panel != null) { return; }

    // Create an item to display in the panel. Atom will associate this item with a view via the
    // view registry (and its `getReactElement` method). That view will be used to display views
    // for this panel.
    // $FlowIssue: We need to teach flow about Symbol.observable.
    const props = Observable.from(this).map(state => ({
      initialSize: this.state.size,
      item: this._getItemToDisplay(state),
      position: locationsToPosition.get(this._locationId),
      onResize: this._handlePanelResize,
    }));
    const Component = bindObservableAsProps(props, Panel);
    // $FlowFixMe: Flow doesn't understand bindObservableAsProps
    const item = {getReactElement: () => <Component />};

    // Create the panel and add the item to it.
    const addPanel = locationsToAddPanelFunctions.get(this._locationId);
    invariant(addPanel != null);
    this._panel = addPanel({item, visible: true});
  }

  itemIsVisible(item: Viewable): boolean {
    return item === this._getItemToDisplay(this.state);
  }

  _getItemToDisplay(state: State): ?Viewable {
    return state.visible ? state.items[state.activeItemIndex] : null;
  }

  _handlePanelResize(size: number): void {
    // If the user resizes the pane, store it so that we can serialize it for the next session.
    this.setState({size});
  }

  destroy(): void {
    this._visibleSubscription.unsubscribe();

    // Destroy every item.
    this.state.items.forEach(item => {
      if (typeof item.destroy === 'function') {
        item.destroy();
      }
    });
    this.setState({items: []});

    if (this._panel != null) {
      this._panel.destroy();
    }
  }

  destroyItem(item: Object): void {
    // Make sure the item is actually in the panel.
    const index = this.state.items.findIndex(it => it === item);
    if (index === -1) { return; }

    const nextItems = this.state.items.slice();
    nextItems.splice(index, 1);
    const prevActiveItemIndex = this.state.activeItemIndex;
    this.setState({
      items: nextItems,
      // Make sure we update the index to account for the removed element.
      activeItemIndex: index <= prevActiveItemIndex
        ? Math.max(0, prevActiveItemIndex - 1)
        : prevActiveItemIndex,
    });
  }

  getItems(): Array<Viewable> {
    return this.state.items.slice();
  }

  showItem(item: Viewable): void {
    const index = this.state.items.findIndex(it => it === item);
    if (index === -1) {
      // Add and activate the item.
      this.setState({
        activeItemIndex: this.state.items.length,
        items: this.state.items.concat([item]),
        visible: true,
      });
      return;
    }
    this.setState({
      activeItemIndex: index,
      visible: true,
    });
  }

  /**
   * Hide the specified item. Currently, the panels are modal (they show one item at a time), so we
   * just hide the whole thing (iff the provided item is the visible one). In the future, we may
   * have tabs or configurable behavior and this will change.
   */
  hideItem(item: Viewable): void {
    const activeItem = this.state.items[this.state.activeItemIndex];

    // Since we're only showing the active item, if a different item is active, we know that this
    // item's already hidden and we don't have to do anything.
    if (item !== activeItem) { return; }

    // Otherwise, hide the panel altogether.
    this.setState({visible: false});
  }

  serialize(): ?SerializedPanelLocation {
    // Serialize all the items, taking care to update the active item index if one of them isn't
    // serializable.
    let activeItemIndex = this.state.activeItemIndex;
    const serializedItems = [];
    this.state.items.forEach((item, index) => {
      const serialized = typeof item.serialize === 'function' ? item.serialize() : null;
      if (serialized != null) {
        serializedItems.push(serialized);
      } else if (index < activeItemIndex) {
        activeItemIndex -= 1;
      }
    });

    return {
      deserializer: 'PanelLocation',
      data: {
        activeItemIndex,
        items: serializedItems,
        size: this.state.size,
        visible: this.state.visible,
      },
    };
  }
}

const locationsToAddPanelFunctions = new Map([
  [PanelLocationIds.TOP_PANEL, atom.workspace.addTopPanel.bind(atom.workspace)],
  [PanelLocationIds.RIGHT_PANEL, atom.workspace.addRightPanel.bind(atom.workspace)],
  [PanelLocationIds.BOTTOM_PANEL, atom.workspace.addBottomPanel.bind(atom.workspace)],
  [PanelLocationIds.LEFT_PANEL, atom.workspace.addLeftPanel.bind(atom.workspace)],
]);

const locationsToPosition = new Map([
  [PanelLocationIds.TOP_PANEL, 'top'],
  [PanelLocationIds.RIGHT_PANEL, 'right'],
  [PanelLocationIds.BOTTOM_PANEL, 'bottom'],
  [PanelLocationIds.LEFT_PANEL, 'left'],
]);
