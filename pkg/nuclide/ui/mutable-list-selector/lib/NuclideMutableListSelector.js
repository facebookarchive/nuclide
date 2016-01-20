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
  deletable?: boolean;
  displayTitle: string;
  id: string;
};

type Props = {
  items: Array<NuclideListSelectorItem>;
  // If null, no item is initially selected.
  idOfSelectedItem: ?string;
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

const DELETE_BUTTON_TITLE_DEFAULT = 'Delete selected item';
const DELETE_BUTTON_TITLE_NONE = 'No item selected to delete';
const DELETE_BUTTON_TITLE_UNDELETABLE = 'Selected item can not be deleted';

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
export default class NuclideMutableListSelector extends React.Component<void, Props, void> {
  _boundOnDeleteButtonClicked: mixed;

  constructor(props: Props) {
    super(props);
    this._boundOnDeleteButtonClicked = this._onDeleteButtonClicked.bind(this);
  }

  _onDeleteButtonClicked() {
    this.props.onDeleteButtonClicked(this.props.idOfSelectedItem);
  }

  _onItemClicked(itemId: string) {
    this.props.onItemClicked(itemId);
  }

  render(): ?ReactElement {
    let selectedItem;
    const listItems = this.props.items.map(item => {
      let classes = 'list-item';
      if (item.id === this.props.idOfSelectedItem) {
        classes += ' selected';
        selectedItem = item;
      }
      return (
        <li
          key={item.id}
          className={classes}
          onClick={this._onItemClicked.bind(this, item.id)}>
          {item.displayTitle}
        </li>
      );
    });

    // Explain why the delete button is disabled if the current selection, or lack thereof, is
    // undeletable.
    let deleteButtonTitle;
    if (selectedItem == null) {
      deleteButtonTitle = DELETE_BUTTON_TITLE_NONE;
    } else if (selectedItem.deletable === false) {
      deleteButtonTitle = DELETE_BUTTON_TITLE_UNDELETABLE;
    } else {
      deleteButtonTitle = DELETE_BUTTON_TITLE_DEFAULT;
    }

    return (
      <div>
        <div className="block select-list">
          <ol className="list-group">
            {listItems}
          </ol>
        </div>
        <div className="text-right">
          <div className="btn-group">
            <button
              className="btn"
              disabled={selectedItem == null || selectedItem.deletable === false}
              onClick={this._boundOnDeleteButtonClicked}
              title={deleteButtonTitle}>
              -
            </button>
            <button
              className="btn"
              onClick={this.props.onAddButtonClicked}
              title="Create new item">
              +
            </button>
          </div>
        </div>
      </div>
    );
  }
}
/* eslint-enable react/prop-types */
