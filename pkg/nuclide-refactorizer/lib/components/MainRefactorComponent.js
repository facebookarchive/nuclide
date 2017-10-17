'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MainRefactorComponent = undefined;

var _react = _interopRequireWildcard(require('react'));

var _Button;

function _load_Button() {
  return _Button = require('nuclide-commons-ui/Button');
}

var _ConfirmRefactorComponent;

function _load_ConfirmRefactorComponent() {
  return _ConfirmRefactorComponent = require('./ConfirmRefactorComponent');
}

var _FreeformRefactorComponent;

function _load_FreeformRefactorComponent() {
  return _FreeformRefactorComponent = require('./FreeformRefactorComponent');
}

var _PickRefactorComponent;

function _load_PickRefactorComponent() {
  return _PickRefactorComponent = require('./PickRefactorComponent');
}

var _ProgressComponent;

function _load_ProgressComponent() {
  return _ProgressComponent = require('./ProgressComponent');
}

var _RenameComponent;

function _load_RenameComponent() {
  return _RenameComponent = require('./RenameComponent');
}

var _refactorActions;

function _load_refactorActions() {
  return _refactorActions = _interopRequireWildcard(require('../refactorActions'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

class MainRefactorComponent extends _react.Component {
  render() {
    if (this.props.appState.type === 'closed') {
      return null;
    } else {
      // TODO consider passing appState in here so the refinement holds and we don't need an
      // invariant
      return this._render();
    }
  }

  _render() {
    return _react.createElement(
      'div',
      null,
      this.getHeaderElement(),
      this.getInnerElement()
    );
  }

  getHeaderElement() {
    const appState = this.props.appState;

    if (!(appState.type === 'open')) {
      throw new Error('Invariant violation: "appState.type === \'open\'"');
    }

    return _react.createElement(
      'div',
      { className: 'nuclide-refactorizer-header' },
      _react.createElement(
        'span',
        null,
        'Refactor'
      ),
      _react.createElement(
        (_Button || _load_Button()).Button,
        { onClick: () => this.props.store.dispatch((_refactorActions || _load_refactorActions()).close()) },
        'Close'
      )
    );
  }

  getInnerElement() {
    const appState = this.props.appState;

    if (!(appState.type === 'open')) {
      throw new Error('Invariant violation: "appState.type === \'open\'"');
    }

    const phase = appState.phase;
    switch (phase.type) {
      case 'get-refactorings':
        return _react.createElement(
          'div',
          null,
          'Waiting for refactorings...'
        );
      case 'pick':
        return _react.createElement((_PickRefactorComponent || _load_PickRefactorComponent()).PickRefactorComponent, { pickPhase: phase, store: this.props.store });
      case 'rename':
        return _react.createElement((_RenameComponent || _load_RenameComponent()).RenameComponent, { phase: phase, store: this.props.store });
      case 'freeform':
        return _react.createElement((_FreeformRefactorComponent || _load_FreeformRefactorComponent()).FreeformRefactorComponent, { phase: phase, store: this.props.store });
      case 'execute':
        return _react.createElement(
          'div',
          null,
          'Executing refactoring...'
        );
      case 'confirm':
        return _react.createElement((_ConfirmRefactorComponent || _load_ConfirmRefactorComponent()).ConfirmRefactorComponent, { phase: phase, store: this.props.store });
      case 'progress':
        return _react.createElement((_ProgressComponent || _load_ProgressComponent()).ProgressComponent, { phase: phase });
      default:
        phase;
        return _react.createElement('div', null);
    }
  }
}
exports.MainRefactorComponent = MainRefactorComponent; /**
                                                        * Copyright (c) 2015-present, Facebook, Inc.
                                                        * All rights reserved.
                                                        *
                                                        * This source code is licensed under the license found in the LICENSE file in
                                                        * the root directory of this source tree.
                                                        *
                                                        * 
                                                        * @format
                                                        */