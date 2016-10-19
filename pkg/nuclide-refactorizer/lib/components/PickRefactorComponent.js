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

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _reactForAtom;

function _load_reactForAtom() {
  return _reactForAtom = require('react-for-atom');
}

var _nuclideUiButton;

function _load_nuclideUiButton() {
  return _nuclideUiButton = require('../../../nuclide-ui/Button');
}

var _refactorActions;

function _load_refactorActions() {
  return _refactorActions = _interopRequireWildcard(require('../refactorActions'));
}

var PickRefactorComponent = (function (_React$Component) {
  _inherits(PickRefactorComponent, _React$Component);

  function PickRefactorComponent() {
    _classCallCheck(this, PickRefactorComponent);

    _get(Object.getPrototypeOf(PickRefactorComponent.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(PickRefactorComponent, [{
    key: 'render',
    value: function render() {
      var _this = this;

      var elements = this.props.pickPhase.availableRefactorings.map(function (r, i) {
        return (_reactForAtom || _load_reactForAtom()).React.createElement(
          'div',
          { key: i },
          _this._renderRefactorOption(r)
        );
      });
      return (_reactForAtom || _load_reactForAtom()).React.createElement(
        'div',
        null,
        elements
      );
    }
  }, {
    key: '_pickRefactor',
    value: function _pickRefactor(refactoring) {
      this.props.store.dispatch((_refactorActions || _load_refactorActions()).pickedRefactor(refactoring));
    }
  }, {
    key: '_renderRefactorOption',
    value: function _renderRefactorOption(refactoring) {
      var _this2 = this;

      switch (refactoring.kind) {
        case 'rename':
          return (_reactForAtom || _load_reactForAtom()).React.createElement(
            (_nuclideUiButton || _load_nuclideUiButton()).Button,
            { onClick: function () {
                _this2._pickRefactor(refactoring);
              } },
            'Rename'
          );
        default:
          throw new Error('Unknown refactoring kind ' + refactoring.kind);
      }
    }
  }]);

  return PickRefactorComponent;
})((_reactForAtom || _load_reactForAtom()).React.Component);

exports.PickRefactorComponent = PickRefactorComponent;