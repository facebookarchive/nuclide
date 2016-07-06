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

var _nuclideUiLibSection2;

function _nuclideUiLibSection() {
  return _nuclideUiLibSection2 = require('../../nuclide-ui/lib/Section');
}

var _nuclideUiLibShowMoreComponent2;

function _nuclideUiLibShowMoreComponent() {
  return _nuclideUiLibShowMoreComponent2 = require('../../nuclide-ui/lib/ShowMoreComponent');
}

/**
 * Each context provider view is rendered inside a ProviderContainer.
 */

var ProviderContainer = (function (_React$Component) {
  _inherits(ProviderContainer, _React$Component);

  function ProviderContainer() {
    _classCallCheck(this, ProviderContainer);

    _get(Object.getPrototypeOf(ProviderContainer.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(ProviderContainer, [{
    key: 'render',
    value: function render() {
      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        { className: 'nuclide-context-view-provider-container' },
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          (_nuclideUiLibSection2 || _nuclideUiLibSection()).Section,
          { headline: this.props.title, collapsable: true },
          this.props.isEditorBased ? this.props.children : this._textBasedComponent()
        )
      );
    }
  }, {
    key: '_textBasedComponent',
    value: function _textBasedComponent() {
      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        (_nuclideUiLibShowMoreComponent2 || _nuclideUiLibShowMoreComponent()).ShowMoreComponent,
        { maxHeight: 600, showMoreByDefault: false },
        this.props.children
      );
    }
  }]);

  return ProviderContainer;
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.ProviderContainer = ProviderContainer;