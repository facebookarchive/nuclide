"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PickRefactorComponent = void 0;

var React = _interopRequireWildcard(require("react"));

function Actions() {
  const data = _interopRequireWildcard(require("../refactorActions"));

  Actions = function () {
    return data;
  };

  return data;
}

function _classnames() {
  const data = _interopRequireDefault(require("classnames"));

  _classnames = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict-local
 * @format
 */
class PickRefactorComponent extends React.Component {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this.state = {
      selectedRefactoring: null
    }, _temp;
  }

  render() {
    const {
      availableRefactorings
    } = this.props.pickPhase;

    if (availableRefactorings.length === 0) {
      return React.createElement("div", null, "No refactorings available at this location");
    }

    const elements = availableRefactorings.map(r => this._renderRefactorOption(r));
    return React.createElement("div", {
      className: "select-list nuclide-refactorizer-pick-refactor"
    }, React.createElement("ol", {
      className: "list-group"
    }, elements));
  }

  _pickRefactor(refactoring) {
    if (refactoring.kind === 'freeform' && refactoring.arguments.length === 0) {
      this.props.store.dispatch(Actions().execute(this.props.pickPhase.provider, {
        kind: 'freeform',
        editor: this.props.pickPhase.editor,
        originalRange: this.props.pickPhase.originalRange,
        id: refactoring.id,
        range: refactoring.range,
        arguments: new Map()
      }));
      return;
    }

    this.props.store.dispatch(Actions().pickedRefactor(refactoring));
  }

  _select(selectedRefactoring) {
    this.setState({
      selectedRefactoring
    });
  }

  _renderRefactorOption(refactoring) {
    switch (refactoring.kind) {
      case 'freeform':
        const selectable = !refactoring.disabled;
        const selected = selectable && refactoring === this.state.selectedRefactoring;
        const props = {};
        props.className = (0, _classnames().default)('two-lines', {
          'nuclide-refactorizer-selectable': selectable,
          'nuclide-refactorizer-selected': selected,
          'nuclide-refactorizer-unselectable': !selectable
        });

        props.onMouseEnter = () => this._select(refactoring);

        if (refactoring.disabled == null || refactoring.disabled === false) {
          props.onClick = () => {
            this._pickRefactor(refactoring);
          };
        }

        const refactoringOption = React.createElement("li", props, React.createElement("div", {
          className: (0, _classnames().default)({
            'nuclide-refactorizer-selectable-text': selectable,
            'nuclide-refactorizer-selected-text': selected,
            'nuclide-refactorizer-unselectable-text': !selectable
          })
        }, refactoring.name), React.createElement("div", {
          className: (0, _classnames().default)('text-smaller', {
            'nuclide-refactorizer-selectable-text': selectable,
            'nuclide-refactorizer-selected-text': selected,
            'nuclide-refactorizer-unselectable-text': !selectable
          })
        }, refactoring.description));
        return refactoringOption;

      default:
        refactoring.kind;
        throw new Error(`Unknown refactoring kind ${refactoring.kind}`);
    }
  }

}

exports.PickRefactorComponent = PickRefactorComponent;