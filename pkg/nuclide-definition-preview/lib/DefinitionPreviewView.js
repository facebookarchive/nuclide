'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {ContextElementProps} from '../../nuclide-context-view/lib/types';
import type {Definition} from '../../nuclide-definition-service';

import {Button, ButtonSizes} from '../../nuclide-ui/lib/Button';
import {React} from 'react-for-atom';
import {goToLocation} from '../../commons-atom/go-to-location';
import {bufferForUri} from '../../commons-atom/text-editor';
import {AtomTextEditor} from '../../nuclide-ui/lib/AtomTextEditor';
import {existingEditorForUri} from '../../commons-atom/text-editor';
import {track} from '../../nuclide-analytics';
import invariant from 'assert';
import {TextBuffer} from 'atom';

type State = {
  buffer: atom$TextBuffer,
  oldBuffer: ?atom$TextBuffer,
};

export class DefinitionPreviewView extends React.Component {
  props: ContextElementProps;
  state: State;

  constructor(props: ContextElementProps) {
    super(props);
    const buffer = props.definition != null
      ? bufferForUri(props.definition.path)
      : new TextBuffer();
    this.state = {
      buffer,
      oldBuffer: null,
    };
    (this: any)._openCurrentDefinitionInMainEditor =
      this._openCurrentDefinitionInMainEditor.bind(this);
  }

  componentWillReceiveProps(newProps: ContextElementProps): void {
    if (newProps.definition != null) {
      const definition = newProps.definition;
      // The buffer always needs to point to the right file path, so create a new one with
      // the correct path if the new definition prop has a different path than the
      // currently loaded buffer.
      if (definition.path !== this.state.buffer.getPath()) {
        this.setState({buffer: bufferForUri(definition.path), oldBuffer: this.state.buffer});
      }
    } else {
      // A null definition has no associated file path, so make a new TextBuffer()
      // that doesn't have an associated file path.
      const oldBuffer = this.state.buffer;
      this.setState({buffer: new TextBuffer(), oldBuffer});
    }
  }

  // Loads the current buffer in state if it's not already loaded.
  async _loadBuffer(): Promise<void> {
    if (!this.state.buffer.loaded) {
      await this.state.buffer.load();
    }
  }

  componentDidUpdate(prevProps: ContextElementProps, prevState: State): void {
    if (this.props.definition != null) {
      this._finishRendering(this.props.definition);
    }
  }

  componentWillUnmount(): void {
    this.state.buffer.destroy();
    if (this.state.oldBuffer != null) {
      this.state.oldBuffer.destroy();
    }
  }

  async _finishRendering(definition: Definition): Promise<void> {
    await this._loadBuffer();
    this._scrollToRow(definition.position.row);

    const editor = this.getEditor();
    editor.getDecorations().forEach(decoration => decoration.destroy());
    invariant(this.props.definition != null);
    const marker = editor.markBufferPosition(definition.position);
    editor.decorateMarker(marker, {
      type: 'line',
      class: 'nuclide-current-line-highlight',
    });
    if (this.state.oldBuffer != null) {
      // Only destroy oldBuffer if it's not already open in a tab - otherwise it'll
      // close the tab using oldBuffer
      if (existingEditorForUri(this.state.oldBuffer.getPath()) == null) {
        invariant(this.state.oldBuffer != null);
        this.state.oldBuffer.destroy();
      }
    }
  }

  render(): React.Element<any> {
    const {ContextViewMessage, definition} = this.props;
    // Show either a "No definition" message or the definition in an editors
    return definition == null
      ? <ContextViewMessage message={ContextViewMessage.NO_DEFINITION} />
      : <div className="pane-item nuclide-definition-preview">
          <div className="nuclide-definition-preview-editor">
            <AtomTextEditor
              ref="editor"
              gutterHidden={true}
              lineNumberGutterVisible={false}
              path={definition.path}
              readOnly={true}
              textBuffer={this.state.buffer}
              syncTextContents={false}
            />
            <div className="nuclide-definition-preview-button-container">
              <Button onClick={this._openCurrentDefinitionInMainEditor} size={ButtonSizes.SMALL}>
                Open in main editor
              </Button>
            </div>
          </div>
        </div>;
  }

  _openCurrentDefinitionInMainEditor(): void {
    track('nuclide-definition-preview:openInMainEditor');
    const def = this.props.definition;
    if (def != null) {
      goToLocation(def.path, def.position.row, def.position.column, true);
    }
  }

  getEditor(): atom$TextEditor {
    return this.refs.editor.getModel();
  }

  _scrollToRow(row: number): void {
    // TODO: Don't scroll to a center - scroll to top of buffer.
    this.getEditor().scrollToBufferPosition([row, 0], {center: true});
  }
}
