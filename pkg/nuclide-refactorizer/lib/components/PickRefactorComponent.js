'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PickRefactorComponent = undefined;

var _react = _interopRequireWildcard(require('react'));

var _Button;

function _load_Button() {
  return _Button = require('nuclide-commons-ui/Button');
}

var _refactorActions;

function _load_refactorActions() {
  return _refactorActions = _interopRequireWildcard(require('../refactorActions'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

class PickRefactorComponent extends _react.Component {
  render() {
    const { availableRefactorings } = this.props.pickPhase;
    if (availableRefactorings.length === 0) {
      return _react.createElement(
        'div',
        null,
        'No refactorings available at this location'
      );
    }

    const elements = availableRefactorings.map((r, i) => _react.createElement(
      'div',
      { key: i, className: 'nuclide-refactorizer-refactor-option' },
      this._renderRefactorOption(r)
    ));
    // Class used to identify this element in integration tests
    return _react.createElement(
      'div',
      { className: 'nuclide-refactorizer-pick-refactor' },
      elements
    );
  }

  _pickRefactor(refactoring) {
    if (refactoring.kind === 'freeform' && refactoring.arguments.length === 0) {
      this.props.store.dispatch((_refactorActions || _load_refactorActions()).execute(this.props.pickPhase.provider, {
        kind: 'freeform',
        editor: this.props.pickPhase.editor,
        originalPoint: this.props.pickPhase.originalPoint,
        id: refactoring.id,
        range: refactoring.range,
        arguments: new Map()
      }));
      return;
    }
    this.props.store.dispatch((_refactorActions || _load_refactorActions()).pickedRefactor(refactoring));
  }

  _renderRefactorOption(refactoring) {
    switch (refactoring.kind) {
      case 'rename':
        return _react.createElement(
          (_Button || _load_Button()).Button
          // Used to identify this element in integration tests
          ,
          { className: 'nuclide-refactorizer-pick-rename',
            onClick: () => {
              this._pickRefactor(refactoring);
            } },
          'Rename'
        );
      case 'freeform':
        // TODO: Make sure the buttons are aligned.
        return _react.createElement(
          'div',
          null,
          _react.createElement(
            (_Button || _load_Button()).Button,
            {
              className: 'nuclide-refactorizer-button',
              onClick: () => {
                this._pickRefactor(refactoring);
              },
              disabled: refactoring.disabled },
            refactoring.name
          ),
          refactoring.description
        );
      default:
        throw new Error(`Unknown refactoring kind ${refactoring.kind}`);
    }
  }
}
exports.PickRefactorComponent = PickRefactorComponent; /**
                                                        * Copyright (c) 2015-present, Facebook, Inc.
                                                        * All rights reserved.
                                                        *
                                                        * This source code is licensed under the license found in the LICENSE file in
                                                        * the root directory of this source tree.
                                                        *
                                                        * 
                                                        * @format
                                                        */