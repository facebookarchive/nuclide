'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Props, State} from '../../nuclide-ui/lib/ObservingComponent';

import {React} from 'react-for-atom';
import {bufferForUri} from '../../commons-atom/text-editor';
import {AtomTextEditor} from '../../nuclide-ui/lib/AtomTextEditor';
import {ObservingComponent} from '../../nuclide-ui/lib/ObservingComponent';

export type Location = {
  path: string;
  position: atom$Point;
};

export type PreviewContent = {
  location: Location;
  grammar: atom$Grammar;
};

export class CodePreviewView extends ObservingComponent<PreviewContent> {
  _loadAndScroll: ?() =>Promise<void>;

  constructor(props: Props<PreviewContent>) {
    super(props);
    this._loadAndScroll = null;
  }

  componentWillReceiveProps(newProps: Props<PreviewContent>): void {
    if (newProps.data === this.props.data) {
      return;
    }
    super.componentWillReceiveProps(newProps);
    this._loadAndScroll = null;
  }

  componentDidUpdate(): void {
    // Kick this off after we have the editor rendered.
    if (this._loadAndScroll != null) {
      this._loadAndScroll();
    }
  }

  shouldComponentUpdate(newProps: Props<PreviewContent>, newState: State<PreviewContent>): boolean {
    return newState.data !== this.state.data;
  }

  render(): React.Element {
    return (
      <div className="pane-item padded nuclide-definition-preview">
        {this._maybeContent()}
      </div>
    );
  }

  _maybeContent(): React.Element {
    const previewContent = this.state.data;
    return previewContent == null
      ? <div className="nuclide-definition-container"><span>Unknown Definition</span></div>
      : this._previewDefinition(previewContent);
  }

  _previewDefinition(content: PreviewContent): React.Element {
    this._loadAndScroll = null;

    const definition = content.location;

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

    return <div className="nuclide-definition-preview-container">
        <AtomTextEditor
          ref="editor"
          gutterHidden={true}
          lineNumberGutterVisible={false}
          path={path}
          readOnly={true}
          textBuffer={textBuffer}
          grammar={content.grammar}
          syncTextContents={false}
        />
      </div>;
  }

  getEditor(): atom$TextEditor {
    return this.refs.editor.getModel();
  }

  _scrollToRow(row: number): void {
    // TODO: Don't scroll to a center - scroll to top of buffer.
    this.getEditor().scrollToBufferPosition([row, 0], {center: true});
  }
}
