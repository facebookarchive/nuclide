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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _reactForAtom;

function _load_reactForAtom() {
  return _reactForAtom = require('react-for-atom');
}

var _assert;

function _load_assert() {
  return _assert = _interopRequireDefault(require('assert'));
}

var _nuclideUiButton;

function _load_nuclideUiButton() {
  return _nuclideUiButton = require('../../../nuclide-ui/Button');
}

var _PickRefactorComponent;

function _load_PickRefactorComponent() {
  return _PickRefactorComponent = require('./PickRefactorComponent');
}

var _RenameComponent;

function _load_RenameComponent() {
  return _RenameComponent = require('./RenameComponent');
}

var _refactorActions;

function _load_refactorActions() {
  return _refactorActions = _interopRequireWildcard(require('../refactorActions'));
}

var MainRefactorComponent = (function (_React$Component) {
  _inherits(MainRefactorComponent, _React$Component);

  function MainRefactorComponent() {
    _classCallCheck(this, MainRefactorComponent);

    _get(Object.getPrototypeOf(MainRefactorComponent.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(MainRefactorComponent, [{
    key: 'render',
    value: function render() {
      if (this.props.appState.type === 'closed') {
        return null;
      } else {
        // TODO consider passing appState in here so the refinement holds and we don't need an
        // invariant
        return this._render();
      }
    }
  }, {
    key: '_render',
    value: function _render() {
      return (_reactForAtom || _load_reactForAtom()).React.createElement(
        'div',
        null,
        this.getHeaderElement(),
        this.getInnerElement()
      );
    }
  }, {
    key: 'getHeaderElement',
    value: function getHeaderElement() {
      var _this = this;

      var appState = this.props.appState;
      (0, (_assert || _load_assert()).default)(appState.type === 'open');
      return (_reactForAtom || _load_reactForAtom()).React.createElement(
        'div',
        null,
        (_reactForAtom || _load_reactForAtom()).React.createElement(
          'span',
          null,
          'Refactor'
        ),
        (_reactForAtom || _load_reactForAtom()).React.createElement(
          (_nuclideUiButton || _load_nuclideUiButton()).Button,
          { onClick: function () {
              return _this.props.store.dispatch((_refactorActions || _load_refactorActions()).close());
            } },
          'Close'
        )
      );
    }
  }, {
    key: 'getInnerElement',
    value: function getInnerElement() {
      var appState = this.props.appState;
      (0, (_assert || _load_assert()).default)(appState.type === 'open');
      var phase = appState.phase;
      switch (phase.type) {
        case 'get-refactorings':
          return (_reactForAtom || _load_reactForAtom()).React.createElement(
            'div',
            null,
            'Waiting for refactorings...'
          );
        case 'pick':
          return (_reactForAtom || _load_reactForAtom()).React.createElement((_PickRefactorComponent || _load_PickRefactorComponent()).PickRefactorComponent, { pickPhase: phase, store: this.props.store });
        case 'rename':
          return (_reactForAtom || _load_reactForAtom()).React.createElement((_RenameComponent || _load_RenameComponent()).RenameComponent, { phase: phase, store: this.props.store });
        case 'execute':
          return (_reactForAtom || _load_reactForAtom()).React.createElement(
            'div',
            null,
            'Executing refactoring...'
          );
        default:
          throw new Error('Unknown phase ' + phase.type);
      }
    }
  }]);

  return MainRefactorComponent;
})((_reactForAtom || _load_reactForAtom()).React.Component);

exports.MainRefactorComponent = MainRefactorComponent;