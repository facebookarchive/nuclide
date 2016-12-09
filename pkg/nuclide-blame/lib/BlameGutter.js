/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {RevisionInfo} from '../../nuclide-hg-rpc/lib/HgService';
import type {
  BlameForEditor,
  BlameProvider,
} from './types';

import {track, trackTiming} from '../../nuclide-analytics';
import {CompositeDisposable} from 'atom';
import invariant from 'assert';
import {shell} from 'electron';
// eslint-disable-next-line nuclide-internal/no-cross-atom-imports
import {shortNameForAuthor} from '../../nuclide-vcs-log';

const CHANGESET_CSS_CLASS = 'nuclide-blame-hash';
const CLICKABLE_CHANGESET_CSS_CLASS = 'nuclide-blame-hash-clickable';
const HG_CHANGESET_DATA_ATTRIBUTE = 'hgChangeset';
const BLAME_DECORATION_CLASS = 'blame-decoration';

export default class BlameGutter {
  _editor: atom$TextEditor;
  _blameProvider: BlameProvider;
  _changesetSpanClassName: string;
  _bufferLineToDecoration: Map<number, atom$Decoration>;
  _gutter: atom$Gutter;
  _loadingSpinnerDiv: ?HTMLElement;
  _isDestroyed: boolean;
  _isEditorDestroyed: boolean;
  _subscriptions: CompositeDisposable;

  /**
   * @param gutterName A name for this gutter. Must not be used by any another
   *   gutter in this TextEditor.
   * @param editor The TextEditor this BlameGutter should create UI for.
   * @param blameProvider The BlameProvider that provides the appropriate blame
   *   information for this BlameGutter.
   */
  constructor(gutterName: string, editor: atom$TextEditor, blameProvider: BlameProvider) {
    this._isDestroyed = false;
    this._isEditorDestroyed = false;

    this._subscriptions = new CompositeDisposable();
    this._editor = editor;
    this._blameProvider = blameProvider;
    this._changesetSpanClassName = CHANGESET_CSS_CLASS;
    this._bufferLineToDecoration = new Map();
    // Priority is -200 by default and 0 is the line number
    this._gutter = editor.addGutter({name: gutterName, priority: -1200});
    const gutterView: HTMLElement = atom.views.getView(this._gutter);
    gutterView.classList.add('nuclide-blame');

    // If getUrlForRevision() is available, add a single, top-level click handler for the gutter.
    if (typeof blameProvider.getUrlForRevision === 'function') {
      // We also want to style the changeset differently if it is clickable.
      this._changesetSpanClassName += ' ' + CLICKABLE_CHANGESET_CSS_CLASS;

      const onClick: (evt: Event) => Promise<void> = this._onClick.bind(this);
      gutterView.addEventListener('click', onClick);
      this._subscriptions.add(this._gutter.onDidDestroy(
          () => gutterView.removeEventListener('click', onClick),
      ));
    }

    this._subscriptions.add(editor.onDidDestroy(() => {
      this._isEditorDestroyed = true;
    }));
    this._fetchAndDisplayBlame();
  }

  /**
   * If the user clicked on a ChangeSet ID, extract it from the DOM element via the data- attribute
   * and find the corresponding Differential revision. If successful, open the URL for the revision.
   */
  async _onClick(e: Event): Promise<void> {
    const target = e.target;
    if (!target) {
      return;
    }

    const dataset: {[key: string]: string} = (target: any).dataset;
    const changeset = dataset[HG_CHANGESET_DATA_ATTRIBUTE];
    if (!changeset) {
      return;
    }

    const blameProvider = this._blameProvider;
    invariant(typeof blameProvider.getUrlForRevision === 'function');
    const url = await blameProvider.getUrlForRevision(this._editor, changeset);
    if (url) {
      // Note that 'shell' is not the public 'shell' package on npm but an Atom built-in.
      shell.openExternal(url);
    } else {
      atom.notifications.addWarning(`No URL found for ${changeset}.`);
    }

    track('blame-gutter-click-revision', {
      editorPath: this._editor.getPath() || '',
      url: url || '',
    });
  }

  async _fetchAndDisplayBlame(): Promise<void> {
    // Add a loading spinner while we fetch the blame.
    this._addLoadingSpinner();

    let newBlame;
    try {
      newBlame = await this._blameProvider.getBlameForEditor(this._editor);
    } catch (error) {
      atom.notifications.addError(
        'Failed to fetch blame to display. ' +
        'The file is empty or untracked or the repository cannot be reached.',
        {detail: error},
      );
      atom.commands.dispatch(
        atom.views.getView(this._editor),
        'nuclide-blame:hide-blame',
      );
      return;
    }
    // The BlameGutter could have been destroyed while blame was being fetched.
    if (this._isDestroyed) {
      return;
    }

    // Remove the loading spinner before setting the contents of the blame gutter.
    this._cleanUpLoadingSpinner();

    this._updateBlame(newBlame);
  }

  _addLoadingSpinner(): void {
    if (this._loadingSpinnerDiv) {
      return;
    }
    const gutterView = atom.views.getView(this._gutter);
    this._loadingSpinnerDiv = document.createElement('div');
    this._loadingSpinnerDiv.className = 'nuclide-blame-spinner';
    gutterView.appendChild(this._loadingSpinnerDiv);
  }

  _cleanUpLoadingSpinner(): void {
    if (this._loadingSpinnerDiv) {
      this._loadingSpinnerDiv.remove();
      this._loadingSpinnerDiv = null;
    }
  }

  destroy(): void {
    this._isDestroyed = true;
    this._cleanUpLoadingSpinner();
    if (!this._isEditorDestroyed) {
      // Due to a bug in the Gutter API, destroying a Gutter after the editor
      // has been destroyed results in an exception.
      this._gutter.destroy();
    }
    for (const decoration of this._bufferLineToDecoration.values()) {
      decoration.getMarker().destroy();
    }
  }

  _updateBlame(blameForEditor: BlameForEditor): void {
    return trackTiming(
      'blame-ui.blame-gutter.updateBlame',
      () => this.__updateBlame(blameForEditor),
    );
  }

  // The BlameForEditor completely replaces any previous blame information.
  __updateBlame(blameForEditor: BlameForEditor): void {
    if (blameForEditor.length === 0) {
      atom.notifications.addInfo(
          `Found no blame to display. Is this file empty or untracked?
          If not, check for errors in the Nuclide logs local to your repo.`);
    }
    const allPreviousBlamedLines = new Set(this._bufferLineToDecoration.keys());

    let longestBlame = 0;
    for (const blameInfo of blameForEditor) {
      if (!blameInfo) {
        continue;
      }
      const blameLength = shortNameForAuthor(blameInfo.author).length + 1 + blameInfo.hash.length;
      if (blameLength > longestBlame) {
        longestBlame = blameLength;
      }
    }

    for (let bufferLine = 0; bufferLine < blameForEditor.length; ++bufferLine) {
      const blameInfo = blameForEditor[bufferLine];
      if (blameInfo) {
        this._setBlameLine(bufferLine, blameInfo, longestBlame);
      }
      allPreviousBlamedLines.delete(bufferLine);
    }

    // Any lines that weren't in the new blameForEditor are outdated.
    for (const oldLine of allPreviousBlamedLines) {
      this._removeBlameLine(oldLine);
    }

    // Update the width of the gutter according to the new contents.
    this._updateGutterWidthToCharacterLength(longestBlame);
  }

  _updateGutterWidthToCharacterLength(characters: number): void {
    const gutterView = atom.views.getView(this._gutter);
    gutterView.style.width = `${characters}ch`;
  }

  _setBlameLine(bufferLine: number, blameInfo: RevisionInfo, longestBlame: number): void {
    const item = this._createGutterItem(blameInfo, longestBlame);
    const decorationProperties = {
      type: 'gutter',
      gutterName: this._gutter.name,
      class: BLAME_DECORATION_CLASS,
      item,
    };

    let decoration = this._bufferLineToDecoration.get(bufferLine);
    if (!decoration) {
      const marker = this._editor.markBufferRange(
        [
          [bufferLine, 0],
          [bufferLine, 100000],
        ],
        {invalidate: 'touch'},
      );
      decoration = this._editor.decorateMarker(marker, decorationProperties);
      this._bufferLineToDecoration.set(bufferLine, decoration);
    } else {
      decoration.setProperties(decorationProperties);
    }
  }

  _removeBlameLine(bufferLine: number): void {
    const blameDecoration = this._bufferLineToDecoration.get(bufferLine);
    if (!blameDecoration) {
      return;
    }
    // The recommended way of destroying a decoration is by destroying its marker.
    blameDecoration.getMarker().destroy();
    this._bufferLineToDecoration.delete(bufferLine);
  }

  _createGutterItem(blameInfo: RevisionInfo, longestBlame: number): HTMLElement {
    const doc = window.document;
    const item = doc.createElement('div');

    const authorSpan = doc.createElement('span');
    const author = shortNameForAuthor(blameInfo.author);
    authorSpan.innerText = author;
    item.appendChild(authorSpan);

    const numSpaces = longestBlame - author.length - blameInfo.hash.length;
    // Insert non-breaking spaces to ensure the changeset is right-aligned.
    // Admittedly, this is a little gross, but it seems better than setting style.width on every
    // item that we create and having to give it a special flexbox layout. Hooray monospace!
    item.appendChild(doc.createTextNode('\u00A0'.repeat(numSpaces)));

    const changesetSpan = doc.createElement('span');
    changesetSpan.className = this._changesetSpanClassName;
    changesetSpan.dataset[HG_CHANGESET_DATA_ATTRIBUTE] = blameInfo.hash;
    changesetSpan.innerText = blameInfo.hash;
    item.appendChild(changesetSpan);

    return item;
  }
}
