'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MainRefactorComponent = undefined;

var _reactForAtom = require('react-for-atom');

var _Button;

function _load_Button() {
  return _Button = require('../../../nuclide-ui/Button');
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

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

let MainRefactorComponent = exports.MainRefactorComponent = class MainRefactorComponent extends _reactForAtom.React.Component {
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
    return _reactForAtom.React.createElement(
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

    return _reactForAtom.React.createElement(
      'div',
      { className: 'nuclide-refactorizer-header' },
      _reactForAtom.React.createElement(
        'span',
        null,
        'Refactor'
      ),
      _reactForAtom.React.createElement(
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
        return _reactForAtom.React.createElement(
          'div',
          null,
          'Waiting for refactorings...'
        );
      case 'pick':
        return _reactForAtom.React.createElement((_PickRefactorComponent || _load_PickRefactorComponent()).PickRefactorComponent, { pickPhase: phase, store: this.props.store });
      case 'rename':
        return _reactForAtom.React.createElement((_RenameComponent || _load_RenameComponent()).RenameComponent, { phase: phase, store: this.props.store });
      case 'execute':
        return _reactForAtom.React.createElement(
          'div',
          null,
          'Executing refactoring...'
        );
      default:
        throw new Error(`Unknown phase ${ phase.type }`);
    }
  }
};