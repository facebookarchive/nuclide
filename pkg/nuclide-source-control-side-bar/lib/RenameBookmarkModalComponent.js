/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {BookmarkInfo} from '../../nuclide-hg-rpc/lib/HgService';

import {AtomInput} from '../../nuclide-ui/AtomInput';
import {Button} from '../../nuclide-ui/Button';
import {ButtonGroup} from '../../nuclide-ui/ButtonGroup';
import {CompositeDisposable} from 'atom';
import React from 'react';
import ReactDOM from 'react-dom';

type Props = {
  bookmark: BookmarkInfo,
  onCancel: () => mixed,
  onRename: (bookmark: BookmarkInfo, nextName: string, repo: atom$Repository) => mixed,
  repository: atom$Repository,
};

export default class RenameBookmarkModal extends React.Component {
  _disposables: CompositeDisposable;
  props: Props;

  constructor(props: Props): void {
    super(props);
    this._disposables = new CompositeDisposable();
    (this: any)._handleRenameClick = this._handleRenameClick.bind(this);
  }

  componentDidMount(): void {
    this._disposables.add(
      // $FlowFixMe
      atom.commands.add(ReactDOM.findDOMNode(this), 'core:confirm', this._handleRenameClick),
    );
    this.refs.atomTextEditor.focus();
  }

  componentWillUnmount(): void {
    this._disposables.dispose();
  }

  _handleRenameClick(): void {
    this.props.onRename(
      this.props.bookmark,
      this.refs.atomTextEditor.getText(),
      this.props.repository,
    );
  }

  render(): React.Element<any> {
    return (
      <div>
        <h6 style={{marginTop: 0}}><strong>Rename bookmark</strong></h6>
        <label>New name for bookmark '{this.props.bookmark.bookmark}':</label>
        <AtomInput
          initialValue={this.props.bookmark.bookmark}
          ref="atomTextEditor"
        />
        <div style={{display: 'flex', flexDirection: 'row-reverse'}}>
          <ButtonGroup size="SMALL">
            <Button onClick={this.props.onCancel}>
              Cancel
            </Button>
            <Button buttonType="PRIMARY" onClick={this._handleRenameClick}>
              Rename
            </Button>
          </ButtonGroup>
        </div>
      </div>
    );
  }
}
