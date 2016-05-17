Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x4, _x5, _x6) { var _again = true; _function: while (_again) { var object = _x4, property = _x5, receiver = _x6; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x4 = parent; _x5 = property; _x6 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

exports.highlightOnUpdate = highlightOnUpdate;

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

/**
 * Wraps DecoratedComponent in a special `span` with a configurable classname whenever the
 * component's props change.
 */

function highlightOnUpdate(ComposedComponent) {
  var
  /**
   * The result of this function determines whether to apply the highlight or not.
   */
  arePropsEqual = arguments.length <= 1 || arguments[1] === undefined ? require('shallowequal') : arguments[1];
  var
  /**
   * className used in the wrapper. You can style both `className` and `<className>-highlight`.
   */
  className = arguments.length <= 2 || arguments[2] === undefined ? 'nuclide-ui-highlight-on-render' : arguments[2];
  var
  /**
   * Delay in ms until the `*-highlight` className gets removed from the wrapper.
   * Effectively throttles the frequency of highlight pulses.
   */
  unhighlightDelay = arguments.length <= 3 || arguments[3] === undefined ? 200 : arguments[3];

  // $FlowIssue The return type is guaranteed to be the same as the type of ComposedComponent.
  return (function (_React$Component) {
    _inherits(_class, _React$Component);

    function _class(props) {
      _classCallCheck(this, _class);

      _get(Object.getPrototypeOf(_class.prototype), 'constructor', this).call(this, props);
      this.showFlash = false;
    }

    _createClass(_class, [{
      key: 'componentWillUpdate',
      value: function componentWillUpdate(nextProps, nextState) {
        var _this = this;

        if (arePropsEqual(nextProps, this.props)) {
          // Skip if prop values didn't actually change.
          return;
        }
        if (this.timeout != null || this.showFlash) {
          // Skip if already scheduled.
          return;
        }
        this.showFlash = true;
        this.timeout = setTimeout(function () {
          _this.showFlash = false;
          _this.timeout = null;
          _this.forceUpdate();
        }, unhighlightDelay);
      }
    }, {
      key: 'render',
      value: function render() {
        return (_reactForAtom2 || _reactForAtom()).React.createElement(
          'span',
          { className: className + ' ' + (this.showFlash ? className + '-highlight' : '') },
          (_reactForAtom2 || _reactForAtom()).React.createElement(ComposedComponent, this.props)
        );
      }
    }]);

    return _class;
  })((_reactForAtom2 || _reactForAtom()).React.Component);
}