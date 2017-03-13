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
import FileChanges from '../../../nuclide-ui/FileChanges';
import {Button} from '../../../nuclide-ui/Button';

type Props = {
  onConfirm: () => mixed,
  onManualEdit: () => mixed,
  onQuit: () => mixed,
  patch: Array<diffparser$FileDiff>,
};

export default class InteractiveFileChanges extends React.Component {
  props: Props;

  constructor(props: Props) {
    super(props);

    (this: any)._onClickConfirm = this._onClickConfirm.bind(this);
    (this: any)._onClickDirectEdit = this._onClickDirectEdit.bind(this);
    (this: any)._onClickQuit = this._onClickQuit.bind(this);
  }

  render(): React.Element<any> {
    return (
      <div>
        <Button onClick={this._onClickConfirm}>Confirm</Button>
        <Button onClick={this._onClickQuit}>Quit</Button>
        <Button onClick={this._onClickDirectEdit}>Direct Edit</Button>
        {this.props.patch.map(file =>
          <FileChanges
            diff={file}
            key={`${file.from}:${file.to}`}
            showCheckboxes={true}
          />,
        )}
      </div>
    );
  }

  _onClickConfirm(): void {
    this.props.onConfirm();
  }

  // The "Direct Edit" button removes the patch editor UI and allows the user
  // to edit the text representation of the patch directly
  _onClickDirectEdit(): void {
    this.props.onManualEdit();
  }

  _onClickQuit(): void {
    this.props.onQuit();
  }
}
