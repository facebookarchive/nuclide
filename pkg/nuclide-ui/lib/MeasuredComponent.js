Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var observerConfig = {
  childList: true,
  attributes: true,
  characterData: true,
  subtree: true,
  attributeOldValue: true,
  characterDataOldValue: true
};

/** A container which invokes a callback function supplied in props whenever the
 * container's height and width measurements change. The callback is invoked once
 * when the MeasuredComponent has mounted.
 **/

var MeasuredComponent = (function (_React$Component) {
  _inherits(MeasuredComponent, _React$Component);

  function MeasuredComponent(props) {
    _classCallCheck(this, MeasuredComponent);

    _get(Object.getPrototypeOf(MeasuredComponent.prototype), 'constructor', this).call(this, props);
    this._previousMeasurements = null;
    this._updateDomNode = this._updateDomNode.bind(this);
  }

  _createClass(MeasuredComponent, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      // MutationObserver.observe() doesn't invoke its callback, so explicitly invoke it here
      this._considerInvokingMutationCallback();
    }
  }, {
    key: '_considerInvokingMutationCallback',
    value: function _considerInvokingMutationCallback() {
      if (this._domNode == null) {
        return;
      }
      var _domNode = this._domNode;
      var clientHeight = _domNode.clientHeight;
      var clientWidth = _domNode.clientWidth;
      var offsetHeight = _domNode.offsetHeight;
      var offsetWidth = _domNode.offsetWidth;
      var scrollHeight = _domNode.scrollHeight;
      var scrollWidth = _domNode.scrollWidth;

      if (this._previousMeasurements != null && clientHeight === this._previousMeasurements.clientHeight && clientWidth === this._previousMeasurements.clientWidth && offsetHeight === this._previousMeasurements.offsetHeight && offsetWidth === this._previousMeasurements.offsetWidth && scrollHeight === this._previousMeasurements.scrollHeight && scrollWidth === this._previousMeasurements.scrollWidth) {
        return; // Because the measurements are all the same
      }
      var measurements = {
        clientHeight: clientHeight,
        clientWidth: clientWidth,
        offsetHeight: offsetHeight,
        offsetWidth: offsetWidth,
        scrollHeight: scrollHeight,
        scrollWidth: scrollWidth
      };
      // Measurements changed, so invoke callback
      this.props.onMeasurementsChanged(_extends({}, measurements));
      // Update measurements
      this._previousMeasurements = measurements;
    }
  }, {
    key: '_updateDomNode',
    value: function _updateDomNode(node) {
      var _this = this;

      if (node == null) {
        this._domNode = null;
        // _updateDomNode is called before component unmount, so don't need to disconect() in componentWillUnmount()
        this._mutationObserver.disconnect();
        return;
      }
      this._mutationObserver = new MutationObserver(function (mutations) {
        // Invoke callback and update _previousMeasurements if measurements have changed
        _this._considerInvokingMutationCallback();
      });
      this._domNode = node;
      this._mutationObserver.observe(this._domNode, observerConfig);
    }
  }, {
    key: 'render',
    value: function render() {
      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        { ref: this._updateDomNode },
        this.props.children
      );
    }
  }]);

  return MeasuredComponent;
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.MeasuredComponent = MeasuredComponent;

// Listens to the container DOM node for mutations