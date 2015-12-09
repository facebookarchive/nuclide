'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type RelatedFileFinder from './RelatedFileFinder';

import {trackOperationTiming} from '../../analytics';

const GRAMMARS = [
  'source.c',
  'source.cpp',
  'source.objc',
  'source.objcpp',
];

module.exports =
/**
 * Sets up listeners so the user can jump to related files.
 *
 * Clients must call `disable()` once they're done with an instance.
 */
class JumpToRelatedFile {
  _commandSubscriptionsMap: Map;
  _relatedFileFinder: RelatedFileFinder;
  _languageListener: ?Disposable;

  constructor(relatedFileFinder: RelatedFileFinder) {
    this._relatedFileFinder = relatedFileFinder;
    this._commandSubscriptionsMap = new Map();
  }

  enable(): void {
    // The feature is already enabled.
    if (this._languageListener) {
      return;
    }

    // A map from TextEditor to Disposable.
    const {observeLanguageTextEditors} = require('../../atom-helpers');
    this._languageListener = observeLanguageTextEditors(
        GRAMMARS,
        textEditor => this._enableInTextEditor(textEditor),
        textEditor => this._disableInTextEditor(textEditor));
  }

  disable(): void {
    // The feature is already disabled.
    const languageListener = this._languageListener;
    if (!languageListener) {
      return;
    }

    this._commandSubscriptionsMap.forEach(subscription => subscription.dispose());
    this._commandSubscriptionsMap.clear();
    languageListener.dispose();
    this._languageListener = null;
  }

  _enableInTextEditor(textEditor: TextEditor) {
    // We add this class to make our keybinding's selector more specific than
    // the one for `editor:move-line-up` and `editor:move-line-down`.
    const textEditorEl = atom.views.getView(textEditor);
    textEditorEl.classList.add('editor-objc');

    const commandSubscription = atom.commands.add(
      textEditorEl,
      {
        'autocomplete-plus-clang:jump-to-next-related-file': () => {
          const path = textEditor.getPath();
          if (path) {
            trackOperationTiming(
              'autocomplete-plus-clang:jump-to-next-related-file',
              () => this._open(this.getNextRelatedFile(path)));
          }
        },
        'autocomplete-plus-clang:jump-to-previous-related-file': () => {
          const path = textEditor.getPath();
          if (path) {
            trackOperationTiming(
              'autocomplete-plus-clang:jump-to-previous-related-file',
              () => this._open(this.getPreviousRelatedFile(path)));
          }
        },
      });
    this._commandSubscriptionsMap.set(textEditor, commandSubscription);
  }

  _disableInTextEditor(textEditor: TextEditor): void {
    const subscription = this._commandSubscriptionsMap.get(textEditor);
    if (subscription) {
      subscription.dispose();
      this._commandSubscriptionsMap.delete(textEditor);
    }
  }

  /**
   * Gets the next related file, which Xcode defines as the one that comes
   * before the current one alphabetically.
   */
  getNextRelatedFile(path: string): string {
    const {relatedFiles, index} = this._relatedFileFinder.find(path);
    return relatedFiles[(relatedFiles.length + index - 1) % relatedFiles.length];
  }

  /**
   * Gets the previous related file, which Xcode defines as the one that comes
   * after the current one alphabetically.
   */
  getPreviousRelatedFile(path: string): string {
    const {relatedFiles, index} = this._relatedFileFinder.find(path);
    return relatedFiles[(index + 1) % relatedFiles.length];
  }

  /**
   * Opens the path in the next pane, or the current one if there's only one.
   *
   * We navigate to a file if it's already open, instead of opening it in a new tab.
   */
  _open(path: string) {
    atom.workspace.activateNextPane();
    atom.workspace.open(path, {searchAllPanes: true});
  }

}
