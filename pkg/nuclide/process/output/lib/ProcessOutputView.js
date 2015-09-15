'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {ProcessOutputStore} from 'nuclide-process-output-store';
import type ProcessOutputHandler from './types';

var {CompositeDisposable, TextBuffer} = require('atom');
var AtomTextEditor = require('nuclide-ui-atom-text-editor');
var React = require('react-for-atom');

var PROCESS_OUTPUT_PATH = 'nuclide-process-output.ansi';

class ProcessOutputView extends React.Component {
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
  constructor(props: {[key: string]: mixed}) {
    super(props);
    this._processOutputStore = props.processOutputStore;
    this._outputHandler = props.processOutputHandler;
    this._textBuffer = new TextBuffer({
      load: false,
      text: '',
    });
    this._disposables = new CompositeDisposable();
  }

  componentDidMount() {
    this._disposables.add(
      this._processOutputStore.observeStdout(data => this._updateTextBuffer(data))
    );
    this._disposables.add(
      this._processOutputStore.observeStderr(data => this._updateTextBuffer(data))
    );
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
      <AtomTextEditor
        ref="process-output-editor"
        textBuffer={this._textBuffer}
        gutterHidden={true}
        readOnly={true}
        path={PROCESS_OUTPUT_PATH}
      />
    );
  }
}

ProcessOutputView.propTypes = {
  processOutputStore: React.PropTypes.object.isRequired,
  processOutputHandler: React.PropTypes.func,
};

module.exports = ProcessOutputView;
