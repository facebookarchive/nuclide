'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {React} from 'react-for-atom';
import {Button} from '../../nuclide-ui/Button';

export class EmptyComponent extends React.Component {

  render(): React.Element<any> {
    return (
      <div className="padded">
        <Button
          onClick={() => this.runCommand('application:add-project-folder')}
          icon="device-desktop"
          className="btn-block">
          Add Project Folder
        </Button>
        <Button
          onClick={() => this.runCommand('nuclide-remote-projects:connect')}
          icon="cloud-upload"
          className="btn-block">
          Add Remote Project Folder
        </Button>
      </div>

    );
  }

  runCommand(command: string): void {
    atom.commands.dispatch(atom.views.getView(atom.workspace), command);
  }

}
