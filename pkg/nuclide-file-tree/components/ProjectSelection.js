/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import React from 'react';
import {Button} from '../../nuclide-ui/Button';
import {FileTreeStore} from '../lib/FileTreeStore';
import UniversalDisposable from '../../commons-node/UniversalDisposable';

type Props = {};

type State = {
  extraContent: ?Array<React.Element<any>>,
};

export class ProjectSelection extends React.Component {
  _store: FileTreeStore;
  _disposables: UniversalDisposable;
  state: State;

  constructor(props: Props) {
    super(props);
    this._store = FileTreeStore.getInstance();
    this._disposables = new UniversalDisposable();
    this.state = {
      extraContent: this.calculateExtraContent(),
    };
  }

  componentDidMount(): void {
    this._processExternalUpdate();

    this._disposables.add(
      this._store.subscribe(
        this._processExternalUpdate.bind(this),
      ),
    );
  }

  componentWillUnmount(): void {
    this._disposables.dispose();
  }

  _processExternalUpdate(): void {
    this.setState({
      extraContent: this.calculateExtraContent(),
    });
  }

  calculateExtraContent() {
    const list = this._store.getExtraProjectSelectionContent();
    if (list.isEmpty()) {
      return null;
    }
    return list.toJS();
  }

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
        {this.state.extraContent}
      </div>

    );
  }

  runCommand(command: string): void {
    atom.commands.dispatch(atom.views.getView(atom.workspace), command);
  }
}
