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

var _nuclideUiLibButton2;

function _nuclideUiLibButton() {
  return _nuclideUiLibButton2 = require('../../nuclide-ui/lib/Button');
}

var HomeFeatureComponent = (function (_React$Component) {
  _inherits(HomeFeatureComponent, _React$Component);

  function HomeFeatureComponent() {
    _classCallCheck(this, HomeFeatureComponent);

    _get(Object.getPrototypeOf(HomeFeatureComponent.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(HomeFeatureComponent, [{
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
            (_nuclideUiLibButton2 || _nuclideUiLibButton()).Button,
            {
              className: 'pull-right nuclide-home-tryit',
              size: (_nuclideUiLibButton2 || _nuclideUiLibButton()).ButtonSizes.SMALL,
              onClick: function () {
                return atom.commands.dispatch(atom.views.getView(atom.workspace), command);
              } },
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
  }], [{
    key: 'propTypes',
    value: {
      title: (_reactForAtom2 || _reactForAtom()).React.PropTypes.string.isRequired,
      icon: (_reactForAtom2 || _reactForAtom()).React.PropTypes.string.isRequired,
      description: (_reactForAtom2 || _reactForAtom()).React.PropTypes.oneOfType([(_reactForAtom2 || _reactForAtom()).React.PropTypes.string, (_reactForAtom2 || _reactForAtom()).React.PropTypes.element]).isRequired,
      command: (_reactForAtom2 || _reactForAtom()).React.PropTypes.string
    },
    enumerable: true
  }]);

  return HomeFeatureComponent;
})((_reactForAtom2 || _reactForAtom()).React.Component);

module.exports = HomeFeatureComponent;