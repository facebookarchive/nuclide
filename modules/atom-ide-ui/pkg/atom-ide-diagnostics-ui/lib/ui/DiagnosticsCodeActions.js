"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = DiagnosticsCodeActions;

var _atom = require("atom");

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

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */
// Maximum number of CodeActions to show for a given Diagnostic.
const MAX_CODE_ACTIONS = 4;

function DiagnosticsCodeActions(props) {
  return React.createElement("div", {
    className: "diagnostics-code-actions"
  }, Array.from(props.codeActions.entries()).splice(0, MAX_CODE_ACTIONS) // TODO: (seansegal) T21130259 Display a "more" indicator when there are many CodeActions.
  .map(([title, codeAction], i) => {
    return React.createElement(_ButtonGroup().ButtonGroup, {
      key: i
    }, React.createElement(_Button().Button, {
      className: "diagnostics-code-action-button",
      size: "EXTRA_SMALL",
      onClick: () => {
        // TODO: (seansegal) T21130332 Display CodeAction status indicators
        codeAction.apply().catch(handleCodeActionFailure).then(() => {
          // Return focus to the editor after clicking.
          const activeItem = atom.workspace.getActivePaneItem();

          if (activeItem && activeItem instanceof _atom.TextEditor) {
            activeItem.element.focus();
          }
        });
      }
    }, React.createElement("span", {
      className: "inline-block"
    }, title)));
  }));
}

function handleCodeActionFailure(error) {
  atom.notifications.addWarning('Code action could not be applied', {
    description: error ? error.message : '',
    dismissable: true
  });
}