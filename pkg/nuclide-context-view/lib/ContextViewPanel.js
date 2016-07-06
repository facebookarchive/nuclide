Object.defineProperty(exports, '__esModule', {
  value: true
});

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

var _nuclideUiLibPanelComponent2;

function _nuclideUiLibPanelComponent() {
  return _nuclideUiLibPanelComponent2 = require('../../nuclide-ui/lib/PanelComponent');
}

var _nuclideUiLibButton2;

function _nuclideUiLibButton() {
  return _nuclideUiLibButton2 = require('../../nuclide-ui/lib/Button');
}

/**
 * The Atom panel containing context provider views. This is the sidebar that
 * is rendered in the atom workspace.
 */

var ContextViewPanel = (function (_React$Component) {
  _inherits(ContextViewPanel, _React$Component);

  function ContextViewPanel() {
    _classCallCheck(this, ContextViewPanel);

    _get(Object.getPrototypeOf(ContextViewPanel.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(ContextViewPanel, [{
    key: 'render',
    value: function render() {
      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        (_nuclideUiLibPanelComponent2 || _nuclideUiLibPanelComponent()).PanelComponent,
        {
          dock: 'right',
          initialLength: this.props.initialWidth,
          noScroll: true,
          onResize: this.props.onResize },
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'div',
          { style: { display: 'flex', flexDirection: 'column', width: '100%' } },
          (_reactForAtom2 || _reactForAtom()).React.createElement(Header, { onHide: this.props.onHide }),
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            'div',
            { className: 'nuclide-context-view-content' },
            this.props.children
          )
        )
      );
    }
  }], [{
    key: 'propTypes',
    value: {
      initialWidth: (_reactForAtom2 || _reactForAtom()).React.PropTypes.number.isRequired,
      onResize: (_reactForAtom2 || _reactForAtom()).React.PropTypes.func.isRequired, // Should be (newWidth: number) => void
      children: (_reactForAtom2 || _reactForAtom()).React.PropTypes.oneOfType([(_reactForAtom2 || _reactForAtom()).React.PropTypes.arrayOf((_reactForAtom2 || _reactForAtom()).React.PropTypes.node), (_reactForAtom2 || _reactForAtom()).React.PropTypes.node]),
      onHide: (_reactForAtom2 || _reactForAtom()).React.PropTypes.func
    },
    enumerable: true
  }]);

  return ContextViewPanel;
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.ContextViewPanel = ContextViewPanel;

var Header = (function (_React$Component2) {
  _inherits(Header, _React$Component2);

  function Header() {
    _classCallCheck(this, Header);

    _get(Object.getPrototypeOf(Header.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(Header, [{
    key: 'render',
    value: function render() {
      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        { className: 'panel-heading' },
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'h4',
          null,
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            'span',
            null,
            'Context View'
          ),
          (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiLibButton2 || _nuclideUiLibButton()).Button, { icon: 'x', className: 'pull-right',
            onClick: this.props.onHide, title: 'Hide context view'
          })
        )
      );
    }
  }], [{
    key: 'propTypes',
    value: {
      onHide: (_reactForAtom2 || _reactForAtom()).React.PropTypes.func
    },
    enumerable: true
  }]);

  return Header;
})((_reactForAtom2 || _reactForAtom()).React.Component);