'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const React = require('react-for-atom');

class EmptyComponent extends React.Component {

  render(): ReactElement {
    return (
      <div className="padded">
        <button
          onClick={() => this.runCommand('application:add-project-folder')}
          className="btn btn-block icon icon-device-desktop">
          Add Project Folder
        </button>
        <button
          onClick={() => this.runCommand('nuclide-remote-projects:connect')}
          className="btn btn-block icon icon-cloud-upload">
          Add Remote Project Folder
        </button>
      </div>

    );
  }

  runCommand(command: string): void {
    atom.commands.dispatch(atom.views.getView(atom.workspace), command);
  }

}

module.exports = EmptyComponent;
