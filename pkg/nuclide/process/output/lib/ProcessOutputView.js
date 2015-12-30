'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {ProcessOutputStore} from '../../output-store';
import type {ProcessOutputHandler} from './types';

const {CompositeDisposable, TextBuffer} = require('atom');
const AtomTextEditor = require('../../../ui/atom-text-editor');
const React = require('react-for-atom');

const PROCESS_OUTPUT_PATH = 'nuclide-process-output.ansi';

/* eslint-disable react/prop-types */

type DefaultProps = {};
type Props = {
  title: string;
  processOutputStore: ProcessOutputStore,
  processOutputHandler: ?ProcessOutputHandler,
  processOutputViewTopElement: ?HTMLElement,
};
type State = {};


class ProcessOutputView extends React.Component<DefaultProps, Props, State> {
  _processOutputStore: ProcessOutputStore;
  _textBuffer: atom$TextBuffer;
  _disposables: atom$CompositeDisposable;
  _outputHandler: ?ProcessOutputHandler;

  /**
   * @param props.processOutputStore The ProcessOutputStore that provides the
   *   output to display in this view.
   * @param props.processOutputHandler (optional) A function that acts on the
   *   output of the process. If not provided, the default action is to simply
   *   append the output of the process to the view.
   */
  constructor(props: Props) {
    super(props);
    this._processOutputStore = props.processOutputStore;
    this._outputHandler = props.processOutputHandler;
    this._textBuffer = new TextBuffer({
      load: false,
      text: '',
    });
    this._disposables = new CompositeDisposable();
  }

  getTitle(): string {
    return this.props.title;
  }

  componentDidMount() {
    this._disposables.add(
      this._textBuffer.onDidChange(this._handleBufferChange.bind(this)),
      this._processOutputStore.observeStdout(data => this._updateTextBuffer(data)),
      this._processOutputStore.observeStderr(data => this._updateTextBuffer(data)),
    );
  }

  _handleBufferChange(): void {
    const el = React.findDOMNode(this);
    // TODO(natthu): Consider scrolling conditionally i.e. don't scroll if user has scrolled up the
    //               output pane.
    el.scrollTop = el.scrollHeight;
  }

  _updateTextBuffer(newText: string) {
    if (this._outputHandler) {
      this._outputHandler(this._textBuffer, newText);
    } else {
      // `{undo: 'skip'}` disables the TextEditor's "undo system".
      this._textBuffer.append(newText, {undo: 'skip'});
    }
  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

  render(): ReactElement {
    return (
      <div className="nuclide-process-output-view">
        {this.props.processOutputViewTopElement}
        <AtomTextEditor
          ref="process-output-editor"
          textBuffer={this._textBuffer}
          gutterHidden={true}
          readOnly={true}
          path={PROCESS_OUTPUT_PATH}
        />
      </div>
    );
  }

  static createView(props: ?Object): Object {
    const container = document.createElement('div');
    const component = React.render(
      <ProcessOutputView {...props} />,
      container,
    );
    component.element = container;
    return component;
  }

}

module.exports = ProcessOutputView;

/* eslint-enable react/prop-types */
