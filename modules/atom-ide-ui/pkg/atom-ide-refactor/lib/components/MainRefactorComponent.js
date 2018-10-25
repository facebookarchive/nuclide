"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MainRefactorComponent = void 0;

var React = _interopRequireWildcard(require("react"));

function _Button() {
  const data = require("../../../../../nuclide-commons-ui/Button");

  _Button = function () {
    return data;
  };

  return data;
}

function _ButtonGroup() {
  const data = require("../../../../../nuclide-commons-ui/ButtonGroup");

  _ButtonGroup = function () {
    return data;
  };

  return data;
}

function _ConfirmRefactorComponent() {
  const data = require("./ConfirmRefactorComponent");

  _ConfirmRefactorComponent = function () {
    return data;
  };

  return data;
}

function _DiffPreviewComponent() {
  const data = require("./DiffPreviewComponent");

  _DiffPreviewComponent = function () {
    return data;
  };

  return data;
}

function _FreeformRefactorComponent() {
  const data = require("./FreeformRefactorComponent");

  _FreeformRefactorComponent = function () {
    return data;
  };

  return data;
}

function _PickRefactorComponent() {
  const data = require("./PickRefactorComponent");

  _PickRefactorComponent = function () {
    return data;
  };

  return data;
}

function _ProgressComponent() {
  const data = require("./ProgressComponent");

  _ProgressComponent = function () {
    return data;
  };

  return data;
}

function Actions() {
  const data = _interopRequireWildcard(require("../refactorActions"));

  Actions = function () {
    return data;
  };

  return data;
}

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
class MainRefactorComponent extends React.Component {
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
    return React.createElement("div", null, this.getHeaderElement(), this.getInnerElement());
  }

  _getBackButton() {
    const appState = this.props.appState;
    const previousPhase = appState.phase && appState.phase.previousPhase || null;
    return previousPhase ? React.createElement(_Button().Button, {
      onClick: () => this.props.store.dispatch(Actions().backFromDiffPreview(previousPhase))
    }, "Back") : null;
  }

  getHeaderElement() {
    const appState = this.props.appState;

    if (!(appState.type === 'open')) {
      throw new Error("Invariant violation: \"appState.type === 'open'\"");
    }

    return React.createElement("div", {
      className: "nuclide-refactorizer-header"
    }, React.createElement("span", null, "Refactor"), React.createElement(_ButtonGroup().ButtonGroup, null, this._getBackButton(), React.createElement(_Button().Button, {
      onClick: () => this.props.store.dispatch(Actions().close())
    }, "Close")));
  }

  getInnerElement() {
    const appState = this.props.appState;

    if (!(appState.type === 'open')) {
      throw new Error("Invariant violation: \"appState.type === 'open'\"");
    }

    const phase = appState.phase;

    switch (phase.type) {
      case 'get-refactorings':
        return React.createElement("div", null, "Waiting for refactorings...");

      case 'pick':
        return React.createElement(_PickRefactorComponent().PickRefactorComponent, {
          pickPhase: phase,
          store: this.props.store
        });

      case 'freeform':
        return React.createElement(_FreeformRefactorComponent().FreeformRefactorComponent, {
          phase: phase,
          store: this.props.store
        });

      case 'execute':
        return React.createElement("div", null, "Executing refactoring...");

      case 'confirm':
        return React.createElement(_ConfirmRefactorComponent().ConfirmRefactorComponent, {
          phase: phase,
          store: this.props.store
        });

      case 'progress':
        return React.createElement(_ProgressComponent().ProgressComponent, {
          phase: phase
        });

      case 'diff-preview':
        return React.createElement(_DiffPreviewComponent().DiffPreviewComponent, {
          phase: phase
        });

      default:
        return React.createElement("div", null);
    }
  }

}

exports.MainRefactorComponent = MainRefactorComponent;