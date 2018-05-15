'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.default =





















DiagnosticsCodeActions;var _atom = require('atom');var _react = _interopRequireWildcard(require('react'));var _Button;function _load_Button() {return _Button = require('../../../../../nuclide-commons-ui/Button');}var _ButtonGroup;function _load_ButtonGroup() {return _ButtonGroup = require('../../../../../nuclide-commons-ui/ButtonGroup');}function _interopRequireWildcard(obj) {if (obj && obj.__esModule) {return obj;} else {var newObj = {};if (obj != null) {for (var key in obj) {if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];}}newObj.default = obj;return newObj;}} // Maximum number of CodeActions to show for a given Diagnostic.
const MAX_CODE_ACTIONS = 4; /**
                             * Copyright (c) 2017-present, Facebook, Inc.
                             * All rights reserved.
                             *
                             * This source code is licensed under the BSD-style license found in the
                             * LICENSE file in the root directory of this source tree. An additional grant
                             * of patent rights can be found in the PATENTS file in the same directory.
                             *
                             * 
                             * @format
                             */function DiagnosticsCodeActions(props) {return _react.createElement('div', { className: 'diagnostics-code-actions' }, Array.from(props.codeActions.entries()).splice(0, MAX_CODE_ACTIONS) // TODO: (seansegal) T21130259 Display a "more" indicator when there are many CodeActions.
    .map(([title, codeAction], i) => {return _react.createElement((_ButtonGroup || _load_ButtonGroup()).ButtonGroup, { key: i }, _react.createElement((_Button || _load_Button()).Button, { className: 'diagnostics-code-action-button',
            size: 'EXTRA_SMALL',
            onClick: () => {
              // TODO: (seansegal) T21130332 Display CodeAction status indicators
              codeAction.
              apply().
              catch(handleCodeActionFailure).
              then(() => {
                // Return focus to the editor after clicking.
                const activeItem = atom.workspace.getActivePaneItem();
                if (activeItem && activeItem instanceof _atom.TextEditor) {
                  activeItem.element.focus();
                }
              });
            } },
          _react.createElement('span', { className: 'inline-block' }, title)));



    }));


}

function handleCodeActionFailure(error) {
  atom.notifications.addWarning('Code action could not be applied', {
    description: error ? error.message : '',
    dismissable: true });

}