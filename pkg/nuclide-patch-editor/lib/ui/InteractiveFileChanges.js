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
import parse from 'diffparser';
import {Button} from '../../../nuclide-ui/Button';

type Props = {
  diffContent: string,
  onConfirm: string => any,
  onManualEdit: string => any,
  onQuit: () => any,
};

export default class InteractiveFileChanges extends React.Component {
  props: Props;

  constructor(props: Props) {
    super(props);

    (this: any)._onClickConfirm = this._onClickConfirm.bind(this);
    (this: any)._onClickManual = this._onClickManual.bind(this);
    (this: any)._onClickQuit = this._onClickQuit.bind(this);
  }

  render(): React.Element<any> {
    const parsedDiffFiles = parse(this.props.diffContent);

    return (
      <div>
        <Button onClick={this._onClickConfirm}>Confirm</Button>
        <Button onClick={this._onClickQuit}>Quit</Button>
        <Button onClick={this._onClickManual}>Manual Edit</Button>
        {parsedDiffFiles.map(file =>
          <FileChanges diff={file} key={`${file.from}:${file.to}`} />,
        )}
      </div>
    );
  }

  _onClickConfirm(): void {
    this.props.onConfirm(this.props.diffContent);
  }

  _onClickManual(): void {
    this.props.onManualEdit(this.props.diffContent);
  }

  _onClickQuit(): void {
    this.props.onQuit();
  }
}
