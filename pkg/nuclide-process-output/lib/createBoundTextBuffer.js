'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {ProcessOutputHandler} from './types';
import type {ProcessOutputStore} from '../../nuclide-process-output-store';

import {CompositeDisposable, TextBuffer} from 'atom';

/**
 * Create a text buffer that's bound to the process.
 */
export default function createBoundTextBuffer(
  processOutputStore: ProcessOutputStore,
  outputHandler: ?ProcessOutputHandler,
): TextBuffer {

  const buffer = new TextBuffer({
    load: false,
    text: '',
  });

  const update = data => {
    if (outputHandler) {
      outputHandler(buffer, data);
    } else {
      // `{undo: 'skip'}` disables the TextEditor's "undo system".
      buffer.append(data, {undo: 'skip'});
    }
  };

  // Update the text buffer with the initial contents of the store.
  update(processOutputStore.getStdout() || '');
  update(processOutputStore.getStderr() || '');

  const disposable = new CompositeDisposable(
    processOutputStore.observeStdout(update),
    processOutputStore.observeStderr(update),
  );

  buffer.onDidDestroy(() => disposable.dispose());

  return buffer;
}
