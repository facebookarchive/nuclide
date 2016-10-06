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

var _nuclideUiButton2;

function _nuclideUiButton() {
  return _nuclideUiButton2 = require('../../nuclide-ui/Button');
}

var HomeFeatureComponent = (function (_React$Component) {
  _inherits(HomeFeatureComponent, _React$Component);

  function HomeFeatureComponent(props) {
    _classCallCheck(this, HomeFeatureComponent);

    _get(Object.getPrototypeOf(HomeFeatureComponent.prototype), 'constructor', this).call(this, props);
    this._tryIt = this._tryIt.bind(this);
  }

  _createClass(HomeFeatureComponent, [{
    key: '_tryIt',
    value: function _tryIt() {
      var command = this.props.command;

      if (command == null) {
        return;
      }
      switch (typeof command) {
        case 'string':
          atom.commands.dispatch(atom.views.getView(atom.workspace), command);
          return;
        case 'function':
          command();
          return;
        default:
          throw new Error('Invalid command value');
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var _props = this.props;
      var title = _props.title;
      var command = _props.command;

      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'details',
        { className: 'nuclide-home-card' },
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'summary',
          { className: 'nuclide-home-summary icon icon-' + this.props.icon },
          title,
          command ? (_reactForAtom2 || _reactForAtom()).React.createElement(
            (_nuclideUiButton2 || _nuclideUiButton()).Button,
            {
              className: 'pull-right nuclide-home-tryit',
              size: (_nuclideUiButton2 || _nuclideUiButton()).ButtonSizes.SMALL,
              onClick: this._tryIt },
            'Try it'
          ) : null
        ),
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'div',
          { className: 'nuclide-home-detail' },
          this.props.description
        )
      );
    }
  }]);

  return HomeFeatureComponent;
})((_reactForAtom2 || _reactForAtom()).React.Component);

module.exports = HomeFeatureComponent;