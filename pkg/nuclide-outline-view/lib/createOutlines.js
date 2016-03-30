'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Outline, OutlineForUi, OutlineTree, OutlineTreeForUi} from '..';
import type {ProviderRegistry} from './ProviderRegistry';

import {Observable} from 'rx';
import invariant from 'assert';

import {event as commonsEvent} from '../../nuclide-commons';
const {observableFromSubscribeFunction} = commonsEvent;

import {getCursorPositions} from '../../nuclide-atom-helpers';

import {getLogger} from '../../nuclide-logging';
const logger = getLogger();

const TAB_SWITCH_DELAY = 200; // ms
export function createOutlines(providers: ProviderRegistry): Observable<OutlineForUi> {
  const paneChanges = observableFromSubscribeFunction(
      atom.workspace.observeActivePaneItem.bind(atom.workspace),
    )
    // Delay the work on tab switch to keep tab switches snappy and avoid doing a bunch of
    // computation if there are a lot of consecutive tab switches.
    .debounce(TAB_SWITCH_DELAY);

  return paneChanges
    .map(() => atom.workspace.getActiveTextEditor())
    .flatMapLatest(editor => outlinesForEditor(providers, editor));
}

function outlinesForEditor(
  providers: ProviderRegistry,
  editorArg: ?atom$TextEditor,
): Observable<OutlineForUi> {
  // needs to be const so the refinement holds in closures
  const editor = editorArg;
  if (editor == null) {
    return Observable.just({
      kind: 'not-text-editor',
    });
  }

  const editorEvents = Observable.concat(
    // Emit one event at the beginning to trigger the computation of the initial outline
    Observable.just(),
    observableFromSubscribeFunction(editor.onDidStopChanging.bind(editor)),
  );

  const outlines = editorEvents.flatMap(() => outlineForEditor(providers, editor));

  const highlightedOutlines = outlines.flatMapLatest(outline => {
    if (outline.kind !== 'outline') {
      return Observable.just(outline);
    }
    return getCursorPositions(editor)
      .map(cursorLocation => {
        return highlightCurrentNode(outline, cursorLocation);
      });
  });

  return Observable.concat(
    Observable.just({ kind: 'empty' }),
    highlightedOutlines,
  );
}

async function outlineForEditor(
  providers: ProviderRegistry,
  editor: atom$TextEditor
): Promise<OutlineForUi> {
  const scopeName = editor.getGrammar().scopeName;
  const readableGrammarName = editor.getGrammar().name;

  const outlineProvider = providers.findProvider(scopeName);
  if (outlineProvider == null) {
    return {
      kind: 'no-provider',
      grammar: readableGrammarName,
    };
  }
  let outline: ?Outline;
  try {
    outline = await outlineProvider.getOutline(editor);
  } catch (e) {
    logger.error('Error in outline provider:', e);
    outline = null;
  }
  if (outline == null) {
    return {
      kind: 'provider-no-outline',
    };
  }
  return {
    kind: 'outline',
    outlineTrees: outline.outlineTrees.map(treeToUiTree),
    editor,
  };
}

function treeToUiTree(outlineTree: OutlineTree): OutlineTreeForUi {
  return {
    tokenizedText: outlineTree.tokenizedText,
    startPosition: outlineTree.startPosition,
    endPosition: outlineTree.endPosition,
    highlighted: false,
    children: outlineTree.children.map(treeToUiTree),
  };
}

// Return an outline object with the node under the cursor highlighted. Does not mutate the
// original.
function highlightCurrentNode(outline: OutlineForUi, cursorLocation: atom$Point): OutlineForUi {
  invariant(outline.kind === 'outline');
  return {
    ...outline,
    outlineTrees: highlightCurrentNodeInTrees(outline.outlineTrees, cursorLocation),
  };
}

function highlightCurrentNodeInTrees(
  outlineTrees: Array<OutlineTreeForUi>,
  cursorLocation: atom$Point
): Array<OutlineTreeForUi> {
  return outlineTrees.map(tree => {
    return {
      ...tree,
      highlighted: shouldHighlightNode(tree, cursorLocation),
      children: highlightCurrentNodeInTrees(tree.children, cursorLocation),
    };
  });
}

function shouldHighlightNode(outlineTree: OutlineTreeForUi, cursorLocation: atom$Point): boolean {
  const startPosition = outlineTree.startPosition;
  const endPosition = outlineTree.endPosition;
  if (endPosition == null) {
    return false;
  }
  if (outlineTree.children.length !== 0) {
    const childStartPosition = outlineTree.children[0].startPosition;
    // Since the parent is rendered in the list above the children, it doesn't really make sense to
    // highlight it if you are below the start position of any child. However, if you are at the top
    // of a class it does seem desirable to highlight it.
    return cursorLocation.isGreaterThanOrEqual(startPosition) &&
      cursorLocation.isLessThan(childStartPosition);
  }
  return cursorLocation.isGreaterThanOrEqual(startPosition) &&
   cursorLocation.isLessThanOrEqual(endPosition);
}
