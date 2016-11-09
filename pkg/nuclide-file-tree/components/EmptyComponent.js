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
exports.EmptyComponent = undefined;

var _reactForAtom = require('react-for-atom');

var _Button;

function _load_Button() {
  return _Button = require('../../nuclide-ui/Button');
}

let EmptyComponent = exports.EmptyComponent = class EmptyComponent extends _reactForAtom.React.Component {

  render() {
    return _reactForAtom.React.createElement(
      'div',
      { className: 'padded' },
      _reactForAtom.React.createElement(
        (_Button || _load_Button()).Button,
        {
          onClick: () => this.runCommand('application:add-project-folder'),
          icon: 'device-desktop',
          className: 'btn-block' },
        'Add Project Folder'
      ),
      _reactForAtom.React.createElement(
        (_Button || _load_Button()).Button,
        {
          onClick: () => this.runCommand('nuclide-remote-projects:connect'),
          icon: 'cloud-upload',
          className: 'btn-block' },
        'Add Remote Project Folder'
      )
    );
  }

  runCommand(command) {
    atom.commands.dispatch(atom.views.getView(atom.workspace), command);
  }

};