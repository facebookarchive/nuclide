'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {CommitModeType} from './types';
import type DiffViewModel from './DiffViewModel';

import AtomTextEditor from '../../ui/atom-text-editor';
import classnames from 'classnames';
import {CommitMode} from './constants';
import {CompositeDisposable} from 'atom';

import {React} from 'react-for-atom';

type Props = {
  diffModel: DiffViewModel;
};

class DiffCommitView extends React.Component {
  props: Props;

  _disposables: CompositeDisposable;

  constructor(props: Props) {
    super(props);
    this._disposables = new CompositeDisposable();
    (this: any)._onClickCommit = this._onClickCommit.bind(this);
  }

  componentDidMount(): void {
    this._disposables.add(
      this.props.diffModel.addChangeListener(() => {
        this.forceUpdate();
      })
    );
    this.props.diffModel.loadCommitMessage();
  }

  componentDidUpdate(): void {
    this.refs['message'].getTextBuffer().setText(this.props.diffModel.getCommitMessage() || '');
  }

  componentWillUnmount(): void {
    this._disposables.dispose();
  }

  _onClickCommit(): void {
    // TODO(most): real commit/amend logic.
  }

  _onChangeCommitMode(commitMode: CommitModeType): void {
    this.props.diffModel.setCommitMode(commitMode);
  }

  render(): ReactElement {
    let loadingIndicator = null;
    let commitButton = null;
    const commitMode = this.props.diffModel.getCommitMode();
    const loading = this.props.diffModel.getIsCommitMessageLoading();

    if (loading) {
      loadingIndicator = (
        <span className="loading loading-spinner-tiny inline-block"></span>
      );
    } else {
      commitButton = (
        <button className="btn btn-sm btn-success commit-button"
          onClick={this._onClickCommit}>
          {commitMode} to HEAD
        </button>
      );
    }

    const commitModes = Object.keys(CommitMode).map(modeId => {
      const modeValue = CommitMode[modeId];
      const className = classnames({
        'btn': true,
        'btn-sm': true,
        'selected': modeValue === commitMode,
      });
      return (
        <button
          className={className}
          key={modeValue}
          onClick={() => this._onChangeCommitMode(modeValue)}>
          {modeValue}
        </button>
      );
    });
    return (
      <div className="nuclide-diff-commit-view">
        <div className="message-editor-wrapper">
          <AtomTextEditor
            ref="message"
            readOnly={loading}
            gutterHidden={true}
          />
        </div>
        <div className="padded">
          <div className="btn-group btn-group-sm inline-block">
            {commitModes}
          </div>
          {loadingIndicator}
          {commitButton}
        </div>
      </div>
    );
  }
}

module.exports = DiffCommitView;
