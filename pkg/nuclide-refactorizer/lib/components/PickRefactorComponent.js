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
exports.PickRefactorComponent = undefined;

var _reactForAtom = require('react-for-atom');

var _Button;

function _load_Button() {
  return _Button = require('../../../nuclide-ui/Button');
}

var _refactorActions;

function _load_refactorActions() {
  return _refactorActions = _interopRequireWildcard(require('../refactorActions'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

let PickRefactorComponent = exports.PickRefactorComponent = class PickRefactorComponent extends _reactForAtom.React.Component {

  render() {
    const availableRefactorings = this.props.pickPhase.availableRefactorings;

    if (availableRefactorings.length === 0) {
      return _reactForAtom.React.createElement(
        'div',
        null,
        'No refactorings available at this location'
      );
    }

    const elements = availableRefactorings.map((r, i) => _reactForAtom.React.createElement(
      'div',
      { key: i },
      this._renderRefactorOption(r)
    ));
    // Class used to identify this element in integration tests
    return _reactForAtom.React.createElement(
      'div',
      { className: 'nuclide-refactorizer-pick-refactor' },
      elements
    );
  }

  _pickRefactor(refactoring) {
    this.props.store.dispatch((_refactorActions || _load_refactorActions()).pickedRefactor(refactoring));
  }

  _renderRefactorOption(refactoring) {
    switch (refactoring.kind) {
      case 'rename':
        return _reactForAtom.React.createElement(
          (_Button || _load_Button()).Button
          // Used to identify this element in integration tests
          ,
          { className: 'nuclide-refactorizer-pick-rename',
            onClick: () => {
              this._pickRefactor(refactoring);
            } },
          'Rename'
        );
      default:
        throw new Error(`Unknown refactoring kind ${ refactoring.kind }`);
    }
  }
};