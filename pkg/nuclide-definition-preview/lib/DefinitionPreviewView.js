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
import {track} from '../../nuclide-analytics';

export type Location = {
  path: string,
  position: atom$Point,
};

export type PreviewContent = {
  location: Location,
  grammar: atom$Grammar,
};

export class DefinitionPreviewView extends React.Component {
  _loadAndScroll: ?() => Promise<void>;

  props: ContextElementProps;

  constructor(props: ContextElementProps) {
    super(props);
    this._loadAndScroll = null;
    (this: any)._openInMainEditor = this._openInMainEditor.bind(this);
  }

  componentWillReceiveProps(newProps: ContextElementProps): void {
    this._loadAndScroll = null;
  }

  componentDidUpdate(): void {
    // Kick this off after we have the editor rendered.
    if (this._loadAndScroll != null) {
      this._loadAndScroll();
    }
  }

  render(): React.Element<any> {
    const {ContextViewMessage, definition} = this.props;
    // Show either the definition in an editor or a message
    if (definition != null) {
      return (
        <div className="pane-item nuclide-definition-preview">
          {this._previewDefinition(definition)}
        </div>
      );
    } else {
      return <ContextViewMessage message={ContextViewMessage.NO_DEFINITION} />;
    }
  }

  _previewDefinition(definition: Definition): React.Element<any> {
    this._loadAndScroll = null;

    const path = definition.path;
    const textBuffer = bufferForUri(path);
    const loadAndScroll = async () => {
      if (this._loadAndScroll !== loadAndScroll) {
        return;
      }

      if (!textBuffer.loaded) {
        // TODO: figure out what to do if loading fails
        // TODO(peterhal): Can we use TextBuffer.onDidReload here?
        await textBuffer.load();
        if (this._loadAndScroll !== loadAndScroll) {
          return;
        }
      }

      // Scroll after loading is complete.
      // TODO(peterhal): Add an initial scroll position property to AtomTextEditor
      setTimeout(() => {
        if (this._loadAndScroll !== loadAndScroll) {
          return;
        }
        this._scrollToRow(definition.position.row);
        this._loadAndScroll = null;
      }, 50);
    };
    // Defer loading and scrolling until after rendering.
    this._loadAndScroll = loadAndScroll;

    return (
      <div className="nuclide-definition-preview-editor">
        <AtomTextEditor
          ref="editor"
          gutterHidden={true}
          lineNumberGutterVisible={false}
          path={path}
          readOnly={true}
          textBuffer={textBuffer}
          syncTextContents={false}
        />
        <div className="nuclide-definition-preview-button-container">
          <Button onClick={this._openInMainEditor} size={ButtonSizes.SMALL}>
            Open in main editor
          </Button>
        </div>
      </div>
    );
  }

  _openInMainEditor(): void {
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
