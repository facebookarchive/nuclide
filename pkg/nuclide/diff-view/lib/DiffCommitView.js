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

import {React} from 'react-for-atom';

type Props = {
  diffModel: DiffViewModel;
};

class DiffCommitView extends React.Component {
  props: Props;

  constructor(props: Props) {
    super(props);
    (this: any)._onClickCommit = this._onClickCommit.bind(this);
  }

  componentDidMount(): void {
    this.props.diffModel.loadCommitMessage();
  }

  componentDidUpdate(): void {
    const {commitMessage} = this.props.diffModel.getState();
    this.refs['message'].getTextBuffer().setText(commitMessage || '');
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

    const {commitMode, isCommitMessageLoading} = this.props.diffModel.getState();
    if (isCommitMessageLoading) {
      loadingIndicator = (
        <span className="loading loading-spinner-tiny inline-block pull-right"></span>
      );
    } else {
      commitButton = (
        <button className="btn btn-sm btn-success pull-right"
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
      <div className="nuclide-diff-mode">
        <div className="message-editor-wrapper">
          <AtomTextEditor
            ref="message"
            readOnly={isCommitMessageLoading}
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
