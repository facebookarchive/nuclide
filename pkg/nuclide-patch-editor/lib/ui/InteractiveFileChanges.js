/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {PatchData} from '../types';

import React from 'react';
import FileChanges from '../../../nuclide-ui/FileChanges';
import {Button} from '../../../nuclide-ui/Button';
import {patchToString} from '../utils';

type Props = {
  checkboxFactory: (file: string, hunkOldStartLine?: number, line?: number) => React.Element<any>,
  onConfirm: string => mixed,
  onManualEdit: () => mixed,
  onQuit: () => mixed,
  patchData: PatchData,
};

export default class InteractiveFileChanges extends React.Component {
  props: Props;
  _patch: Array<diffparser$FileDiff>;

  constructor(props: Props) {
    super(props);

    this._patch = Array.from(props.patchData.files.values()).map(file => file.fileDiff);

    (this: any)._onClickConfirm = this._onClickConfirm.bind(this);
    (this: any)._onClickDirectEdit = this._onClickDirectEdit.bind(this);
    (this: any)._onClickQuit = this._onClickQuit.bind(this);
  }

  shouldComponentUpdate(nextProps: Props): boolean {
    return nextProps.patchData !== this.props.patchData;
  }

  render(): React.Element<any> {
    return (
      <div className="nuclide-patch-editor">
        <Button onClick={this._onClickConfirm}>Confirm</Button>
        <Button onClick={this._onClickQuit}>Quit</Button>
        <Button onClick={this._onClickDirectEdit}>Direct Edit</Button>
        {this._patch.map(file =>
          <FileChanges
            checkboxFactory={this.props.checkboxFactory}
            collapsable={true}
            diff={file}
            key={`${file.from}:${file.to}`}
          />,
        )}
      </div>
    );
  }

  _onClickConfirm(): void {
    this.props.onConfirm(patchToString(this.props.patchData));
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
