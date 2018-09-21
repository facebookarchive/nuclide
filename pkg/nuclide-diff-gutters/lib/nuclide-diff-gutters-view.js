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

import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {repositoryForPath} from '../../nuclide-vcs-base';

const MAX_BUFFER_LENGTH_TO_DIFF = 2 * 1024 * 1024;

export class NuclideDiffGuttersView {
  updateDiffs: () => any;
  _editor: atom$TextEditor;
  _subscriptions: UniversalDisposable;
  _markers: Array<atom$Marker>;
  _repository: ?atom$Repository;
  _immediateId: any;
  _diffs: ?Array<RepositoryLineDiff>;

  constructor(editor: any) {
    this.updateDiffs = this.updateDiffs.bind(this);
    this._editor = editor;
    this._subscriptions = new UniversalDisposable();
    this._markers = [];

    this._subscriptions.add(this._editor.onDidStopChanging(this.updateDiffs));

    this.subscribeToRepository();
    this._subscriptions.add(
      atom.project.onDidChangePaths(() => this.subscribeToRepository()),
    );

    this._subscriptions.add(
      this._editor.onDidDestroy(() => {
        this.cancelUpdate();
        this.removeDecorations();
        return this._subscriptions.dispose();
      }),
    );

    this._subscriptions.add(
      atom.config.onDidChange('git-diff.showIconsInEditorGutter', () => {
        return this.updateIconDecoration();
      }),
    );

    this._subscriptions.add(
      atom.config.onDidChange('editor.showLineNumbers', () => {
        return this.updateIconDecoration();
      }),
    );

    const editorElement = atom.views.getView(this._editor);
    this._subscriptions.add(
      editorElement.onDidAttach(() => {
        return this.updateIconDecoration();
      }),
    );

    this.updateIconDecoration();
    this.scheduleUpdate();
  }

  updateIconDecoration() {
    const gutter = atom.views.getView(this._editor).querySelector('.gutter');
    if (
      atom.config.get('editor.showLineNumbers') &&
      atom.config.get('git-diff.showIconsInEditorGutter')
    ) {
      return gutter != null
        ? gutter.classList.add('nuclide-diff-gutters-icon')
        : undefined;
    } else {
      return gutter != null
        ? gutter.classList.remove('nuclide-diff-gutters-icon')
        : undefined;
    }
  }

  subscribeToRepository() {
    const editorPath = this._editor.getPath();
    if (editorPath == null) {
      return;
    }
    this._repository = repositoryForPath(editorPath);
    if (this._repository != null) {
      this._subscriptions.add(
        this._repository.onDidChangeStatuses(() => {
          return this.scheduleUpdate();
        }),
      );
      if (this._repository == null) {
        return;
      }
      return this._subscriptions.add(
        this._repository.onDidChangeStatus(changedPath => {
          if (changedPath === this._editor.getPath()) {
            return this.scheduleUpdate();
          }
        }),
      );
    }
  }

  cancelUpdate() {
    return clearImmediate(this._immediateId);
  }

  scheduleUpdate() {
    this.cancelUpdate();
    return (this._immediateId = setImmediate(this.updateDiffs));
  }

  updateDiffs() {
    const path = this._editor != null ? this._editor.getPath() : null;
    if (this._editor.isDestroyed()) {
      return;
    }

    this.removeDecorations();
    if (path != null) {
      const length = this._editor.getBuffer().getLength();
      if (length != null && length < MAX_BUFFER_LENGTH_TO_DIFF) {
        this._diffs =
          this._repository != null
            ? this._repository.getLineDiffs(path, this._editor.getText())
            : null;
        if (this._diffs) {
          return this.addDecorations(this._diffs);
        }
      }
    }
  }

  addDecorations(diffs: ?Array<RepositoryLineDiff>) {
    if (diffs == null) {
      return;
    }
    for (const {newStart, oldLines, newLines} of diffs) {
      const startRow = newStart - 1;
      const endRow = newStart + newLines - 1;
      if (oldLines === 0 && newLines > 0) {
        this.markRange(startRow, endRow, 'nuclide-line-added');
      } else if (newLines === 0 && oldLines > 0) {
        if (startRow < 0) {
          this.markRange(0, 0, 'nuclide-previous-line-removed');
        } else {
          this.markRange(startRow, startRow, 'nuclide-line-removed');
        }
      } else {
        this.markRange(startRow, endRow, 'nuclide-line-modified');
      }
    }
  }

  removeDecorations() {
    for (const marker of this._markers) {
      marker.destroy();
    }
    return (this._markers = []);
  }

  markRange(startRow: number, endRow: number, klass: string) {
    const marker = this._editor.markBufferRange([[startRow, 0], [endRow, 0]], {
      invalidate: 'never',
    });
    const markerParams: DecorateMarkerParams = {
      type: 'line-number',
      class: klass,
    };
    this._editor.decorateMarker(marker, markerParams);
    return this._markers.push(marker);
  }
}
