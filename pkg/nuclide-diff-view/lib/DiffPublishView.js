'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type DiffViewModel from './DiffViewModel';
import type {PublishModeType, PublishModeStateType} from './types';

import {getPhabricatorRevisionFromCommitMessage} from '../../nuclide-arcanist-rpc/lib/utils';
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
import UniversalDisposable from '../../commons-node/UniversalDisposable';

type DiffRevisionViewProps = {
  commitMessage: string,
};

class DiffRevisionView extends React.Component {
  props: DiffRevisionViewProps;

  render(): React.Element<any> {
    const {commitMessage} = this.props;
    const commitTitle = commitMessage.split(/\n/)[0];
    const revision = getPhabricatorRevisionFromCommitMessage(commitMessage);

    return (revision == null)
      ? <span />
      : (
        <a href={revision.url} title={commitTitle}>
          {revision.name}
        </a>
      );
  }
}

type Props = {
  message: ?string,
  publishMode: PublishModeType,
  publishModeState: PublishModeStateType,
  headCommitMessage: ?string,
  diffModel: DiffViewModel,
};

export default class DiffPublishView extends React.Component {
  props: Props;
  _textBuffer: TextBuffer;
  _subscriptions: CompositeDisposable;

  constructor(props: Props) {
    super(props);
    (this: any)._onClickBack = this._onClickBack.bind(this);
    (this: any).__onClickPublish = this.__onClickPublish.bind(this);
  }

  componentDidMount(): void {
    this._textBuffer = new TextBuffer();
    this._subscriptions = new CompositeDisposable();

    this._subscriptions.add(
      new UniversalDisposable(
        this.props.diffModel
          .getPublishUpdates()
          .subscribe(this._onPublishUpdate.bind(this)),
      ),
    );
    this.__populatePublishText();
  }

  _onPublishUpdate(message: Object): void {
    this._textBuffer.append(message.text);
    const updatesEditor = this.refs.publishUpdates;
    if (updatesEditor != null) {
      updatesEditor.getElement().scrollToBottom();
    }
  }

  componentDidUpdate(prevProps: Props): void {
    if (
      this.props.message !== prevProps.message ||
      this.props.publishModeState !== prevProps.publishModeState
    ) {
      this.__populatePublishText();
    }
  }

  componentWillUnmount(): void {
    this._subscriptions.dispose();
    // Save the latest edited publish message for layout switches.
    const message = this.__getPublishMessage();
    const {diffModel} = this.props;
    // Let the component unmount before propagating the final message change to the model,
    // So the subsequent change event avoids re-rendering this component.
    process.nextTick(() => {
      diffModel.setPublishMessage(message);
    });
  }

  __populatePublishText(): void {
    const messageEditor = this.refs.message;
    if (messageEditor != null) {
      messageEditor.getTextBuffer().setText(this.props.message || '');
    }
  }

  __onClickPublish(): void {
    this._textBuffer.setText('');
    this.props.diffModel.publishDiff(this.__getPublishMessage() || '');
  }

  __getPublishMessage(): ?string {
    const messageEditor = this.refs.message;
    if (messageEditor != null) {
      return messageEditor.getTextBuffer().getText();
    } else {
      return this.props.message;
    }
  }

  __getStatusEditor(): React.Element<any> {
    const {publishModeState} = this.props;
    let isBusy;
    let statusEditor;

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
        statusEditor = getPublishMessageEditor();
        break;
      case PublishModeState.LOADING_PUBLISH_MESSAGE:
        isBusy = true;
        statusEditor = getPublishMessageEditor();
        break;
      case PublishModeState.AWAITING_PUBLISH:
        isBusy = true;
        statusEditor = getStreamStatusEditor();
        break;
      case PublishModeState.PUBLISH_ERROR:
        isBusy = false;
        statusEditor = getStreamStatusEditor();
        break;
      default:
        throw new Error('Invalid publish mode!');
    }

    return statusEditor;
  }

  _getToolbar(): Toolbar {
    const {publishModeState, publishMode, headCommitMessage} = this.props;
    let revisionView;
    if (headCommitMessage != null) {
      revisionView = <DiffRevisionView commitMessage={headCommitMessage} />;
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
      case PublishModeState.PUBLISH_ERROR:
        isBusy = false;
        publishMessage = 'Fixed? - Retry Publishing';
        break;
      default:
        throw new Error('Invalid publish mode!');
    }

    const publishButton = (
      <Button
        className={classnames({'btn-progress': isBusy})}
        size={ButtonSizes.SMALL}
        buttonType={ButtonTypes.SUCCESS}
        onClick={this.__onClickPublish}
        disabled={isBusy}>
        {publishMessage}
      </Button>
    );

    return (
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
    );
  }

  render(): React.Element<any> {
    return (
      <div className="nuclide-diff-mode">
        <div className="message-editor-wrapper">
          {this.__getStatusEditor()}
        </div>
        {this._getToolbar()}
      </div>
    );
  }

  _onClickBack(): void {
    this.props.diffModel.setViewMode(DiffMode.BROWSE_MODE);
  }
}
