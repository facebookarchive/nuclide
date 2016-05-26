'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {CompositeDisposable} from 'atom';
import {React, ReactDOM} from 'react-for-atom';

type Props = {
  onCancel: () => mixed;
  onCreate: (name: string, repo: atom$Repository) => mixed;
  repo: atom$Repository;
};

export default class CreateBookmarkModal extends React.Component {
  disposables: CompositeDisposable;
  props: Props;

  constructor(props: Props): void {
    super(props);
    this.disposables = new CompositeDisposable();

    (this: any)._handleCreateClick = this._handleCreateClick.bind(this);
  }

  componentDidMount(): void {
    this.disposables.add(
      atom.commands.add(ReactDOM.findDOMNode(this), 'core:confirm', this._handleCreateClick)
    );
    this.refs.atomTextEditor.focus();
  }

  componentWillUnmount(): void {
    this.disposables.dispose();
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
          <div className="btn-group btn-group-sm">
            <button className="btn" onClick={this.props.onCancel}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={this._handleCreateClick}>
              Create
            </button>
          </div>
        </div>
      </div>
    );
  }
}
