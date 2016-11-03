'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ShowMoreComponent = undefined;

var _reactForAtom = require('react-for-atom');

var _MeasuredComponent;

function _load_MeasuredComponent() {
  return _MeasuredComponent = require('./MeasuredComponent');
}

var _Button;

function _load_Button() {
  return _Button = require('./Button');
}

/** A component which sets a max height and includes a "Show More" button
 * aligned at the bottom. Clicking "Show More" will remove the max height restriction
 * and expand the component to full height.
 */
let ShowMoreComponent = exports.ShowMoreComponent = class ShowMoreComponent extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
    this.state = {
      // Defaults to false if showMoreByDefault not specified
      showingMore: this.props.showMoreByDefault != null && this.props.showMoreByDefault,
      currentHeight: 0
    };
    this._toggleShowMore = this._toggleShowMore.bind(this);
    this._updateMeasurements = this._updateMeasurements.bind(this);
  }

  _updateMeasurements(newMeasurements) {
    if (newMeasurements.scrollHeight !== this.state.currentHeight) {
      this.setState({
        currentHeight: newMeasurements.scrollHeight
      });
    }
  }

  render() {
    var _state = this.state;
    const showingMore = _state.showingMore,
          currentHeight = _state.currentHeight;
    const maxHeight = this.props.maxHeight;


    const showMessage = showingMore ? 'Show Less' : 'Show More';
    const conditionalStyle = !showingMore ? { 'max-height': `${ maxHeight }px`, 'overflow-y': 'hidden' } : {};
    const displayNoneIfBelowMaxHeight = currentHeight <= maxHeight ? { display: 'none' } : {};
    const showMoreButton = _reactForAtom.React.createElement(
      'div',
      {
        className: 'nuclide-ui-show-more-button-container',
        style: displayNoneIfBelowMaxHeight },
      _reactForAtom.React.createElement(
        (_Button || _load_Button()).Button,
        { onClick: this._toggleShowMore, size: 'EXTRA_SMALL' },
        showMessage
      )
    );

    return _reactForAtom.React.createElement(
      'div',
      null,
      _reactForAtom.React.createElement(
        'div',
        { className: 'nuclide-ui-show-more-component', style: conditionalStyle },
        _reactForAtom.React.createElement('div', { className: 'nuclide-ui-show-more-gradient', style: displayNoneIfBelowMaxHeight }),
        _reactForAtom.React.createElement(
          (_MeasuredComponent || _load_MeasuredComponent()).MeasuredComponent,
          { onMeasurementsChanged: this._updateMeasurements },
          this.props.children
        )
      ),
      showMoreButton
    );
  }

  _toggleShowMore() {
    this.setState({ showingMore: !this.state.showingMore });
  }
};