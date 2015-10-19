'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var React = require('react-for-atom');
var {PropTypes} = React;

type NuclideListSelectorItem = {
  id: string;
  displayTitle: string;
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
export default class NuclideMutableListSelector extends React.Component {
  // $FlowIssue t8486988
  static propTypes = {
    items: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      displayTitle: PropTypes.string.isRequired,
    })).isRequired,
    idOfInitiallySelectedItem: PropTypes.string,      // If null, no item is initially selected.
    onItemClicked: PropTypes.func.isRequired,         // (idOfClickedItem: string) => mixed
    onAddButtonClicked: PropTypes.func.isRequired,    // () => mixed
    onDeleteButtonClicked: PropTypes.func.isRequired, // (idOfCurrentlySelectedItem: ?string) => mixed
  };

  _boundOnAddButtonClicked: mixed;
  _boundOnDeleteButtonClicked: mixed;

  constructor(props: any) {
    super(props);
    this.state = {
      idOfSelectedItem: props.idOfInitiallySelectedItem,
    };
    this._boundOnAddButtonClicked = props.onAddButtonClicked.bind(this);
    this._boundOnDeleteButtonClicked = this._onDeleteButtonClicked.bind(this);
  }

  _onDeleteItemClicked() {
    this.props.onDeleteButtonClicked(this.state.idOfSelectedItem);
  }

  _onItemClicked(itemId: string) {
    this.setState({idOfSelectedItem: itemId});
    this.props.onItemClicked(itemId);
  }

  render() {
    var listItems = [];
    for (let item of this.props.items) {
      (item : NuclideListSelectorItem);
      var classes = 'nuclide-list-selector list-item';
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
      <div className="nuclide-list-selector">
        <div className="nuclide-list-selector list-container">
          {listItems}
        </div>
        <div className="nuclide-list-selector button-container">
          <button
            className="nuclide-list-selector button"
            onClick={this._boundOnAddButtonClicked}>
            +
          </button>
          <button
            className="nuclide-list-selector button"
            onClick={this._boundOnDeleteButtonClicked}>
            -
          </button>
        </div>
      </div>
    );
  }
}
