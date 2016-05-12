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

import {getPhabricatorRevisionFromCommitMessage} from '../../nuclide-arcanist-base/lib/utils';
import {AtomTextEditor} from '../../nuclide-ui/lib/AtomTextEditor';
import classnames from 'classnames';
import {DiffMode, PublishMode, PublishModeState} from './constants';
import {React} from 'react-for-atom';
import {
  Button,
  ButtonSizes,
  ButtonTypes,
} from '../../nuclide-ui/lib/Button';
import {Toolbar} from '../../nuclide-ui/lib/Toolbar';
import {ToolbarLeft} from '../../nuclide-ui/lib/ToolbarLeft';
import {ToolbarRight} from '../../nuclide-ui/lib/ToolbarRight';
import {CompositeDisposable, TextBuffer} from 'atom';
import {DisposableSubscription} from '../../nuclide-commons';

type DiffRevisionViewProps = {
  revision: RevisionInfo;
};

class DiffRevisionView extends React.Component {
  props: DiffRevisionViewProps;

  render(): React.Element {
    const {hash, title, description} = this.props.revision;
    const tooltip = `${hash}: ${title}`;
    const revision = getPhabricatorRevisionFromCommitMessage(description);

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
  _textBuffer: TextBuffer;
  _subscriptions: CompositeDisposable;

  constructor(props: Props) {
    super(props);
    (this: any)._onClickBack = this._onClickBack.bind(this);
    (this: any)._onClickPublish = this._onClickPublish.bind(this);
  }

  componentDidMount(): void {
    this._textBuffer = new TextBuffer();
    this._subscriptions = new CompositeDisposable();

    this._subscriptions.add(
      new DisposableSubscription(
        this.props.diffModel
          .getPublishUpdates()
          .subscribe(this._onPublishUpdate.bind(this))
      )
    );
    this._setPublishText();
  }

  _onPublishUpdate(message: Object): void {
    this._textBuffer.append(message.text);
    const updatesEditor = this.refs['publishUpdates'];
    if (updatesEditor != null) {
      updatesEditor.getElement().scrollToBottom();
    }
  }

  componentDidUpdate(prevProps: Props): void {
    if (
      this.props.message !== prevProps.message ||
      this.props.publishModeState !== prevProps.publishModeState
    ) {
      this._setPublishText();
    }
  }

  componentWillUnmount(): void {
    this._subscriptions.dispose();
    // Save the latest edited publish message for layout switches.
    const message = this._getPublishMessage();
    const {diffModel} = this.props;
    // Let the component unmount before propagating the final message change to the model,
    // So the subsequent change event avoids re-rendering this component.
    process.nextTick(() => {
      diffModel.setPublishMessage(message);
    });
  }

  _setPublishText(): void {
    const messageEditor = this.refs['message'];
    if (messageEditor != null) {
      messageEditor.getTextBuffer().setText(this.props.message || '');
    }
  }

  _onClickPublish(): void {
    this._textBuffer.setText('');
    this.props.diffModel.publishDiff(this._getPublishMessage() || '');
  }

  _getPublishMessage(): ?string {
    const messageEditor = this.refs['message'];
    if (messageEditor != null) {
      return messageEditor.getTextBuffer().getText();
    } else {
      return this.props.message;
    }
  }

  render(): React.Element {
    const {publishModeState, publishMode, headRevision} = this.props;

    let revisionView;
    if (headRevision != null) {
      revisionView = <DiffRevisionView revision={headRevision} />;
    }

    let isBusy;
    let publishMessage;
    let statusEditor = null;

    const getStreamStatusEditor = () => {
      return (
        <AtomTextEditor
          ref="publishUpdates"
          textBuffer={this._textBuffer}
          readOnly={true}
          syncTextContents={false}
          gutterHidden={true}
        />
      );
    };

    const getPublishMessageEditor = () => {
      return (
        <AtomTextEditor
          ref="message"
          readOnly={isBusy}
          syncTextContents={false}
          gutterHidden={true}
        />
      );
    };

    switch (publishModeState) {
      case PublishModeState.READY:
        isBusy = false;
        if (publishMode === PublishMode.CREATE) {
          publishMessage = 'Publish Phabricator Revision';
        } else {
          publishMessage = 'Update Phabricator Revision';
        }
        statusEditor = getPublishMessageEditor();
        break;
      case PublishModeState.LOADING_PUBLISH_MESSAGE:
        isBusy = true;
        publishMessage = 'Loading...';
        statusEditor = getPublishMessageEditor();
        break;
      case PublishModeState.AWAITING_PUBLISH:
        isBusy = true;
        publishMessage = 'Publishing...';
        statusEditor = getStreamStatusEditor();
        break;
      case PublishModeState.PUBLISH_ERROR:
        isBusy = false;
        statusEditor = getStreamStatusEditor();
        publishMessage = 'Fixed? - Retry Publishing';
        break;
    }

    const publishButton = (
      <Button
        className={classnames({'btn-progress': isBusy})}
        size={ButtonSizes.SMALL}
        buttonType={ButtonTypes.SUCCESS}
        onClick={this._onClickPublish}
        disabled={isBusy}>
        {publishMessage}
      </Button>
    );

    return (
      <div className="nuclide-diff-mode">
        <div className="message-editor-wrapper">
          {statusEditor}
        </div>
        <Toolbar location="bottom">
          <ToolbarLeft>
            {revisionView}
          </ToolbarLeft>
          <ToolbarRight>
            <Button
              size={ButtonSizes.SMALL}
              onClick={this._onClickBack}>
              Back
            </Button>
            {publishButton}
          </ToolbarRight>
        </Toolbar>
      </div>
    );
  }

  _onClickBack(): void {
    this.props.diffModel.setViewMode(DiffMode.BROWSE_MODE);
  }
}

module.exports = DiffPublishView;
