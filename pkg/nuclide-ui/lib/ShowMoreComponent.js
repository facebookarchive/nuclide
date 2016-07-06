Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _MeasuredComponent2;

function _MeasuredComponent() {
  return _MeasuredComponent2 = require('./MeasuredComponent');
}

var _Button2;

function _Button() {
  return _Button2 = require('./Button');
}

/** A component which sets a max height and includes a "Show More" button
 * aligned at the bottom. Clicking "Show More" will remove the max height restriction
 * and expand the component to full height.
 **/

var ShowMoreComponent = (function (_React$Component) {
  _inherits(ShowMoreComponent, _React$Component);

  function ShowMoreComponent(props) {
    _classCallCheck(this, ShowMoreComponent);

    _get(Object.getPrototypeOf(ShowMoreComponent.prototype), 'constructor', this).call(this, props);
    this.state = {
      // Defaults to false if showMoreByDefault not specified
      showingMore: this.props.showMoreByDefault != null && this.props.showMoreByDefault,
      currentHeight: 0
    };
    this._toggleShowMore = this._toggleShowMore.bind(this);
    this._updateMeasurements = this._updateMeasurements.bind(this);
  }

  _createClass(ShowMoreComponent, [{
    key: '_updateMeasurements',
    value: function _updateMeasurements(newMeasurements) {
      if (newMeasurements.scrollHeight !== this.state.currentHeight) {
        this.setState({
          currentHeight: newMeasurements.scrollHeight
        });
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var _state = this.state;
      var showingMore = _state.showingMore;
      var currentHeight = _state.currentHeight;
      var maxHeight = this.props.maxHeight;

      var showMessage = showingMore ? 'Show Less' : 'Show More';
      var conditionalStyle = !showingMore ? { 'max-height': maxHeight + 'px', 'overflow-y': 'hidden' } : {};
      var displayNoneIfBelowMaxHeight = currentHeight <= maxHeight ? { display: 'none' } : {};
      var showMoreButton = (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        {
          className: 'nuclide-ui-show-more-button-container',
          style: displayNoneIfBelowMaxHeight },
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          (_Button2 || _Button()).Button,
          { onClick: this._toggleShowMore, size: 'EXTRA_SMALL' },
          showMessage
        )
      );

      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        null,
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'div',
          { className: 'nuclide-ui-show-more-component', style: conditionalStyle },
          (_reactForAtom2 || _reactForAtom()).React.createElement('div', { className: 'nuclide-ui-show-more-gradient', style: displayNoneIfBelowMaxHeight }),
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            (_MeasuredComponent2 || _MeasuredComponent()).MeasuredComponent,
            { onMeasurementsChanged: this._updateMeasurements },
            this.props.children
          )
        ),
        showMoreButton
      );
    }
  }, {
    key: '_toggleShowMore',
    value: function _toggleShowMore() {
      this.setState({ showingMore: !this.state.showingMore });
    }
  }]);

  return ShowMoreComponent;
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.ShowMoreComponent = ShowMoreComponent;
// Maximum height of the component in px