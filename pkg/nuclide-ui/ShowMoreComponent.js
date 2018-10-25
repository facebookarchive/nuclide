"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ShowMoreComponent = void 0;

var React = _interopRequireWildcard(require("react"));

function _MeasuredComponent() {
  const data = require("../../modules/nuclide-commons-ui/MeasuredComponent");

  _MeasuredComponent = function () {
    return data;
  };

  return data;
}

function _Button() {
  const data = require("../../modules/nuclide-commons-ui/Button");

  _Button = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

/** A component which sets a max height and includes a "Show More" button
 * aligned at the bottom. Clicking "Show More" will remove the max height restriction
 * and expand the component to full height.
 */
class ShowMoreComponent extends React.Component {
  constructor(props) {
    super(props);

    this._updateMeasurements = (newMeasurements, target) => {
      const newHeight = target.scrollHeight;

      if (newHeight !== this.state.currentHeight) {
        this.setState({
          currentHeight: newHeight
        });
      }
    };

    this._toggleShowMore = () => {
      // TODO: (wbinnssmith) T30771435 this setState depends on current state
      // and should use an updater function rather than an object
      // eslint-disable-next-line react/no-access-state-in-setstate
      this.setState({
        showingMore: !this.state.showingMore
      });
    };

    this.state = {
      // Defaults to false if showMoreByDefault not specified
      showingMore: this.props.showMoreByDefault != null && this.props.showMoreByDefault,
      currentHeight: 0
    };
  }

  render() {
    const {
      showingMore,
      currentHeight
    } = this.state;
    const {
      maxHeight
    } = this.props;
    const showMessage = showingMore ? 'Show Less' : 'Show More';
    const conditionalStyle = !showingMore ? {
      maxHeight: `${maxHeight}px`,
      overflowY: 'hidden'
    } : {};
    const displayNoneIfBelowMaxHeight = currentHeight <= maxHeight ? {
      display: 'none'
    } : {};
    const showMoreButton = React.createElement("div", {
      className: "nuclide-ui-show-more-button-container",
      style: displayNoneIfBelowMaxHeight
    }, React.createElement(_Button().Button, {
      onClick: this._toggleShowMore,
      size: "EXTRA_SMALL"
    }, showMessage));
    return React.createElement("div", null, React.createElement("div", {
      className: "nuclide-ui-show-more-component",
      style: conditionalStyle
    }, React.createElement("div", {
      className: "nuclide-ui-show-more-gradient",
      style: displayNoneIfBelowMaxHeight
    }), React.createElement(_MeasuredComponent().MeasuredComponent, {
      onMeasurementsChanged: this._updateMeasurements
    }, this.props.children)), showMoreButton);
  }

}

exports.ShowMoreComponent = ShowMoreComponent;