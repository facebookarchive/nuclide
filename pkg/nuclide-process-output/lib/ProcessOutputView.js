'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {ProcessOutputStore} from '../../nuclide-process-output-store';
import type {ProcessOutputHandler} from './types';

import {CompositeDisposable, TextBuffer} from 'atom';
import {AtomTextEditor} from '../../nuclide-ui/lib/AtomTextEditor';
import {React, ReactDOM} from 'react-for-atom';

const PROCESS_OUTPUT_PATH = 'nuclide-process-output.ansi';

type Props = {
  title: string;
  processOutputStore: ProcessOutputStore;
  processOutputHandler: ?ProcessOutputHandler;
  processOutputViewTopElement: ?HTMLElement;
  textBuffer: TextBuffer;
};

class ProcessOutputView extends React.Component<void, Props, void> {
  props: Props;

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
    this._textBuffer = props.textBuffer;
    this._disposables = new CompositeDisposable();
  }

  getTitle(): string {
    return this.props.title;
  }

  componentDidMount() {
    this._disposables.add(
      this._textBuffer.onDidChange(this._handleBufferChange.bind(this)),
    );
  }

  _handleBufferChange(): void {
    const el = this.refs['process-output-editor'];

    if (el == null) {
      return;
    }

    const textEditor = el.getElement();

    // It's possible that the element exists but doesn't have a component. I'm honestly not sure
    // how since `component` is set in the webcomponent's [attached callback][1] (which should
    // happen before our `componentDidMount`) and nulled in the [detached callback][2] (which
    // should happen after our `componentWillUnmount`). In any case, we need to guard against it.
    // See GH-483.
    // [1]: https://github.com/atom/atom/blob/dd24e3b22304b495625140f74be9d221238074ab/src/text-editor-element.coffee#L75
    // [2]: https://github.com/atom/atom/blob/dd24e3b22304b495625140f74be9d221238074ab/src/text-editor-element.coffee#L83
    if (textEditor.component == null) {
      return;
    }

    const shouldScroll =
      textEditor.getScrollHeight() - (textEditor.getHeight() + textEditor.getScrollTop()) <= 5;
    if (shouldScroll) {
      textEditor.scrollToBottom();
    }
  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

  render(): React.Element<any> {
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

  copy(): Object {
    return ProcessOutputView.createView({...this.props});
  }

  static createView(props: ?Object): Object {
    const container = document.createElement('div');
    const component = ReactDOM.render(
      <ProcessOutputView {...props} />,
      container,
    );
    // $FlowIgnore -- an Atom-ism
    component.element = container;
    return component;
  }

}

module.exports = ProcessOutputView;
