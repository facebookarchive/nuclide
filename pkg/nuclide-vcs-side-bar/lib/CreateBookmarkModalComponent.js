'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {Button} from '../../nuclide-ui/lib/Button';
import {ButtonGroup} from '../../nuclide-ui/lib/ButtonGroup';
import {CompositeDisposable} from 'atom';
import {React, ReactDOM} from 'react-for-atom';

type Props = {
  onCancel: () => mixed;
  onCreate: (name: string, repo: atom$Repository) => mixed;
  repo: atom$Repository;
};

export default class CreateBookmarkModal extends React.Component {
  _disposables: CompositeDisposable;
  props: Props;

  constructor(props: Props): void {
    super(props);
    this._disposables = new CompositeDisposable();

    (this: any)._handleCreateClick = this._handleCreateClick.bind(this);
  }

  componentDidMount(): void {
    this._disposables.add(
      atom.commands.add(ReactDOM.findDOMNode(this), 'core:confirm', this._handleCreateClick),
    );
    this.refs.atomTextEditor.focus();
  }

  componentWillUnmount(): void {
    this._disposables.dispose();
  }

  _handleCreateClick(): void {
    this.props.onCreate(this.refs.atomTextEditor.getModel().getText(), this.props.repo);
  }

  render(): React.Element {
    return (
      <div>
        <h6 style={{marginTop: 0}}><strong>Create bookmark</strong></h6>
        <label>Bookmark name:</label>
        <atom-text-editor mini ref="atomTextEditor" tabIndex="0" />
        <div className="text-right">
          <ButtonGroup size="SMALL">
            <Button onClick={this.props.onCancel}>
              Cancel
            </Button>
            <Button
              buttonType="PRIMARY"
              onClick={this._handleCreateClick}>
              Create
            </Button>
          </ButtonGroup>
        </div>
      </div>
    );
  }
}
