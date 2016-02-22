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
import {CommitMode} from './constants';
import classnames from 'classnames';
import {notifyInternalError} from './notifications';

import {React} from 'react-for-atom';

type Props = {
  diffModel: DiffViewModel;
};

type State = {
  commitMode: CommitModeType;
  loading: boolean;
  commitMessage: ?string;
};

class DiffCommitView extends React.Component {
  props: Props;
  state: State;

  constructor(props: Props) {
    super(props);
    const commitMode = CommitMode.COMMIT;
    this.state = {
      commitMode,
      commitMessage: null,
      loading: true,
    };
    (this: any)._onClickCommit = this._onClickCommit.bind(this);
  }

  componentWillMount(): void {
    this._loadCommitMessage(this.state.commitMode);
  }

  render(): ReactElement {
    let loadingIndicator = null;
    let commitButton = null;
    const {commitMode, loading} = this.state;
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
            readOnly={this.state.loading}
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

  componentDidUpdate(): void {
    this.refs['message'].getTextBuffer().setText(this.state.commitMessage || '');
  }

  _onClickCommit(): void {
    // TODO(most): real commit/amend logic.
  }

  _onChangeCommitMode(commitMode: CommitModeType): void {
    if (commitMode === this.state.commitMode) {
      return;
    }
    this.setState({commitMode, loading: true, commitMessage: null});
    this._loadCommitMessage(commitMode);
  }

  _loadCommitMessage(commitMode: CommitModeType): void {
    const {diffModel} = this.props;
    const commitMessagePromise = commitMode === CommitMode.COMMIT
      ? diffModel.getActiveRepositoryTemplateCommitMessage()
      : diffModel.getActiveRepositoryLatestCommitMessage();
    commitMessagePromise.then(
      commitMessage => {
        this.setState({commitMode, loading: false, commitMessage});
      },
      error => {
        this.setState({commitMode, loading: false, commitMessage: null});
        notifyInternalError(error);
      },
    );
  }
}

module.exports = DiffCommitView;
