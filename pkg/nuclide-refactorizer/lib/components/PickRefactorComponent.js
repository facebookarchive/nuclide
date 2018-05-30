'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PickRefactorComponent = undefined;

var _react = _interopRequireWildcard(require('react'));

var _refactorActions;

function _load_refactorActions() {
  return _refactorActions = _interopRequireWildcard(require('../refactorActions'));
}

var _Button;

function _load_Button() {
  return _Button = require('../../../../modules/nuclide-commons-ui/Button');
}

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

class PickRefactorComponent extends _react.Component {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this.state = {
      selectedRefactoring: null
    }, _temp;
  }

  render() {
    const { availableRefactorings } = this.props.pickPhase;
    if (availableRefactorings.length === 0) {
      return _react.createElement(
        'div',
        null,
        'No refactorings available at this location'
      );
    }

    const elements = availableRefactorings.map(r => this._renderRefactorOption(r));

    return _react.createElement(
      'div',
      { className: 'select-list nuclide-refactorizer-pick-refactor' },
      _react.createElement(
        'ol',
        { className: 'list-group' },
        elements
      )
    );
  }

  _pickRefactor(refactoring) {
    if (refactoring.kind === 'freeform' && refactoring.arguments.length === 0) {
      this.props.store.dispatch((_refactorActions || _load_refactorActions()).execute(this.props.pickPhase.provider, {
        kind: 'freeform',
        editor: this.props.pickPhase.editor,
        originalRange: this.props.pickPhase.originalRange,
        id: refactoring.id,
        range: refactoring.range,
        arguments: new Map()
      }));
      return;
    }
    this.props.store.dispatch((_refactorActions || _load_refactorActions()).pickedRefactor(refactoring));
  }

  _select(selectedRefactoring) {
    this.setState({
      selectedRefactoring
    });
  }

  _renderRefactorOption(refactoring) {
    switch (refactoring.kind) {
      case 'rename':
        return _react.createElement(
          'li',
          null,
          _react.createElement(
            (_Button || _load_Button()).Button
            // Used to identify this element in integration tests
            ,
            { className: 'nuclide-refactorizer-pick-rename',
              onClick: () => {
                this._pickRefactor(refactoring);
              } },
            'Rename'
          )
        );
      case 'freeform':
        const selectable = !refactoring.disabled;
        const selected = selectable && refactoring === this.state.selectedRefactoring;
        const props = {};
        props.className = (0, (_classnames || _load_classnames()).default)('two-lines', {
          'nuclide-refactorizer-selectable': selectable,
          'nuclide-refactorizer-selected': selected,
          'nuclide-refactorizer-unselectable': !selectable
        });
        props.onMouseEnter = () => this._select(refactoring);
        if (!refactoring.disabled) {
          props.onClick = () => {
            this._pickRefactor(refactoring);
          };
        }
        const refactoringOption = _react.createElement(
          'li',
          props,
          _react.createElement(
            'div',
            {
              className: (0, (_classnames || _load_classnames()).default)({
                'nuclide-refactorizer-selectable-text': selectable,
                'nuclide-refactorizer-selected-text': selected,
                'nuclide-refactorizer-unselectable-text': !selectable
              }) },
            refactoring.name
          ),
          _react.createElement(
            'div',
            {
              className: (0, (_classnames || _load_classnames()).default)('text-smaller', {
                'nuclide-refactorizer-selectable-text': selectable,
                'nuclide-refactorizer-selected-text': selected,
                'nuclide-refactorizer-unselectable-text': !selectable
              }) },
            refactoring.description
          )
        );
        return refactoringOption;
      default:
        refactoring.kind;
        throw new Error(`Unknown refactoring kind ${refactoring.kind}`);
    }
  }
}
exports.PickRefactorComponent = PickRefactorComponent;