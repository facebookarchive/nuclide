'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const React = require('react-for-atom');

type NuclideListSelectorItem = {
  id: string;
  displayTitle: string;
};

type DefaultProps = {};
type Props = {
  items: Array<{id: string; displayTitle: string;}>;
  // If null, no item is initially selected.
  idOfInitiallySelectedItem: ?string;
  onItemClicked: (idOfClickedItem: string) => mixed;
  // Function that is called when the "+" button on the list is clicked.
  // The user's intent is to create a new item for the list.
  onAddButtonClicked: () => mixed;
  // Function that is called when the "-" button on the list is clicked.
  // The user's intent is to delete the currently-selected item.
  // If the `idOfCurrentlySelectedItem` is null, this means there is
  // no item selected.
  onDeleteButtonClicked: (idOfCurrentlySelectedItem: ?string) => mixed;
};
type State = {
  idOfSelectedItem: ?string;
};

/**
 * A generic component that displays selectable list items, and offers
 * the ability to add and remove items. It looks roughly like the following:
 *
 *   - - - - -
 *  | Item 1  |
 *  |---------|
 *  | Item 2  |
 *  |---------|
 *  |         |
 *  |         |
 *  |---------|
 *  | +  |  - |
 *   ---------
 */
/* eslint-disable react/prop-types */
export default class NuclideMutableListSelector
    extends React.Component<DefaultProps, Props, State> {
  _boundOnDeleteButtonClicked: mixed;

  constructor(props: Props) {
    super(props);
    this.state = {
      idOfSelectedItem: props.idOfInitiallySelectedItem,
    };
    this._boundOnDeleteButtonClicked = this._onDeleteButtonClicked.bind(this);
  }

  _onDeleteButtonClicked() {
    this.props.onDeleteButtonClicked(this.state.idOfSelectedItem);
  }

  _onItemClicked(itemId: string) {
    this.setState({idOfSelectedItem: itemId});
    this.props.onItemClicked(itemId);
  }

  render(): ?ReactElement {
    const listItems = [];
    for (const item of this.props.items) {
      (item : NuclideListSelectorItem);
      let classes = 'nuclide-mutable-list-selector list-item';
      if (item.id === this.state.idOfSelectedItem) {
        classes += ' selected';
      }
      listItems.push(
        <div
          key={item.id}
          className={classes}
          onClick={this._onItemClicked.bind(this, item.id)}>
          {item.displayTitle}
        </div>
      );
    }

    return (
      <div className="nuclide-mutable-list-selector">
        <div className="nuclide-mutable-list-selector list-container">
          {listItems}
        </div>
        <div className="nuclide-mutable-list-selector button-container">
          <button
            className="nuclide-mutable-list-selector button"
            onClick={this.props.onAddButtonClicked}>
            +
          </button>
          <button
            className="nuclide-mutable-list-selector button"
            onClick={this._boundOnDeleteButtonClicked}>
            -
          </button>
        </div>
      </div>
    );
  }
}
/* eslint-enable react/prop-types */
