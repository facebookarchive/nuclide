/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import typeof * as BoundActionCreators from '../redux/Actions';
import type {FileData} from '../types';

import {Checkbox} from '../../../nuclide-ui/Checkbox';
import FileChanges from '../../../nuclide-ui/FileChanges';
import React from 'react';
import {SelectedState} from '../constants';

type Props = {
  actionCreators: BoundActionCreators,
  fileData: FileData,
  patchId: string,
};

export class SelectFileChanges extends React.Component {
  props: Props;

  constructor(props: Props) {
    super(props);

    (this: any)._onToggleFile = this._onToggleFile.bind(this);
  }

  render(): React.Element<any> {
    const {fileData: {selected, fileDiff}} = this.props;

    return (
      <div className="nuclide-patch-editor-select-file-changes">
        <Checkbox
          checked={selected === SelectedState.ALL}
          indeterminate={selected === SelectedState.SOME}
          onChange={this._onToggleFile}
        />
        <div className="nuclide-patch-editor-file-changes">
          <FileChanges collapsable={true} diff={fileDiff} />
        </div>
      </div>
    );
  }

  _onToggleFile(): void {
    this.props.actionCreators.toggleFile(this.props.patchId, this.props.fileData.id);
  }
}
