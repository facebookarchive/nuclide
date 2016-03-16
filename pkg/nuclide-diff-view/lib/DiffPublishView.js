'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {RevisionInfo} from '../../nuclide-hg-repository-base/lib/HgService';
import type DiffViewModel from './DiffViewModel';
import type {PublishModeType, PublishModeStateType} from './types';

import arcanist from '../../nuclide-arcanist-client';
import AtomTextEditor from '../../nuclide-ui-atom-text-editor';
import classnames from 'classnames';
import {PublishMode, PublishModeState} from './constants';
import {React} from 'react-for-atom';

type DiffRevisionViewProps = {
  revision: RevisionInfo;
};

class DiffRevisionView extends React.Component {
  props: DiffRevisionViewProps;

  render(): ReactElement {
    const {hash, title, description} = this.props.revision;
    const tooltip = `${hash}: ${title}`;
    const revision = arcanist.getPhabricatorRevisionFromCommitMessage(description);

    return (revision == null)
      ? <span />
      : (
        <a href={revision.url} title={tooltip}>
          {revision.id}
        </a>
      );
  }
}

type Props = {
  message: ?string;
  publishMode: PublishModeType;
  publishModeState: PublishModeStateType;
  headRevision: ?RevisionInfo;
  diffModel: DiffViewModel;
};

class DiffPublishView extends React.Component {
  props: Props;

  constructor(props: Props) {
    super(props);
    (this: any)._onClickPublish = this._onClickPublish.bind(this);
  }

  componentDidMount(): void {
    this._setPublishText();
  }

  componentDidUpdate(prevProps: Props): void {
    if (this.props.message !== prevProps.message) {
      this._setPublishText();
    }
  }

  componentWillUnmount(): void {
    // Save the latest edited publish message for layout switches.
    const message = this._getPublishMessage();
    // Let the component unmount before propagating the final message change to the model,
    // So the subsequent change event avoids re-rendering this component.
    process.nextTick(() => {
      this.props.diffModel.setPublishMessage(message);
    });
  }

  _setPublishText(): void {
    this.refs['message'].getTextBuffer().setText(this.props.message || '');
  }

  _onClickPublish(): void {
    this.props.diffModel.publishDiff(this._getPublishMessage());
  }

  _getPublishMessage(): string {
    return this.refs['message'].getTextBuffer().getText();
  }

  render(): ReactElement {
    const {publishModeState, publishMode, headRevision} = this.props;

    let revisionView;
    if (headRevision != null) {
      revisionView = <DiffRevisionView revision={headRevision} />;
    }

    let isBusy;
    let publishMessage;
    switch (publishModeState) {
      case PublishModeState.READY:
        isBusy = false;
        if (publishMode === PublishMode.CREATE) {
          publishMessage = 'Publish Phabricator Revision';
        } else {
          publishMessage = 'Update Phabricator Revision';
        }
        break;
      case PublishModeState.LOADING_PUBLISH_MESSAGE:
        isBusy = true;
        publishMessage = 'Loading...';
        break;
      case PublishModeState.AWAITING_PUBLISH:
        isBusy = true;
        publishMessage = 'Publishing...';
        break;
    }

    const publishButton = (
      <button
        className={classnames('btn btn-sm btn-success', {'btn-progress': isBusy})}
        onClick={this._onClickPublish}
        disabled={isBusy}>
        {publishMessage}
      </button>
    );

    return (
      <div className="nuclide-diff-mode">
        <div className="message-editor-wrapper">
          <AtomTextEditor
            ref="message"
            readOnly={isBusy}
            gutterHidden={true}
          />
        </div>
        <div className="nuclide-diff-view-toolbar nuclide-diff-view-toolbar-bottom">
          <div className="nuclide-diff-view-toolbar-left">
            {revisionView}
          </div>
          <div className="nuclide-diff-view-toolbar-right">
            {publishButton}
          </div>
        </div>
      </div>
    );
  }
}

module.exports = DiffPublishView;
