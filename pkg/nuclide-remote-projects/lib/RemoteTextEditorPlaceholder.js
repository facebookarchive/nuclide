/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import {renderReactRoot} from 'nuclide-commons-ui/renderReactRoot';
import nuclideUri from 'nuclide-commons/nuclideUri';
import * as React from 'react';
import RemoteTextEditorPlaceholderComponent from './RemoteTextEditorPlaceholderComponent';

export type RemoteTextEditorPlaceholderState = {
  deserializer: 'RemoteTextEditorPlaceholder',
  data: {
    uri: string,
    contents: string,
    // If the editor was unsaved, we'll restore the unsaved contents after load.
    isModified: boolean,
  },
};

export class RemoteTextEditorPlaceholder implements atom$PaneItem {
  _uri: string;
  _contents: string;
  _isModified: boolean;

  constructor({data}: RemoteTextEditorPlaceholderState) {
    this._uri = data.uri;
    this._contents = data.contents;
    this._isModified = data.isModified;
  }

  destroy() {}

  serialize(): RemoteTextEditorPlaceholderState {
    return {
      deserializer: 'RemoteTextEditorPlaceholder',
      data: {
        uri: this._uri,
        contents: this._contents,
        // If the editor was unsaved, we'll restore the unsaved contents after load.
        isModified: this._isModified,
      },
    };
  }

  getTitle(): string {
    return nuclideUri.basename(this._uri);
  }

  // This shouldn't *exactly* match the real URI.
  // Otherwise it makes it difficult to swap it out for the real editor.
  getURI(): string {
    return this._uri.replace('nuclide://', 'nuclide-placeholder://');
  }

  getPath(): string {
    return this._uri;
  }

  getText(): string {
    return this._contents;
  }

  isModified(): boolean {
    return this._isModified;
  }

  getElement(): HTMLElement {
    return renderReactRoot(
      <RemoteTextEditorPlaceholderComponent
        contents={this._contents}
        uri={this._uri}
      />,
    );
  }
}
