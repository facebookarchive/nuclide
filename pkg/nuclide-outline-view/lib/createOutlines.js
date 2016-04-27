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
import type {ActiveEditorBasedService, Result} from '../../nuclide-active-editor-based-service';

import {Observable} from 'rxjs';
import invariant from 'assert';

import {getCursorPositions} from '../../nuclide-atom-helpers';

export function createOutlines(editorService: ActiveEditorBasedService): Observable<OutlineForUi> {
  return outlinesForProviderResults(editorService.getResultsStream());
}

function outlinesForProviderResults(
  providerResults: Observable<Result<?Outline>>,
): Observable<OutlineForUi> {
  return providerResults.switchMap(uiOutlinesForResult);
}

function uiOutlinesForResult(result: Result<?Outline>): Observable<OutlineForUi> {
  switch (result.kind) {
    case 'not-text-editor':
      return Observable.of({ kind: 'not-text-editor' });
    case 'no-provider':
      return Observable.of({
        kind: 'no-provider',
        grammar: result.grammar.name,
      });
    case 'pane-change':
      // Render a blank outline when we change panes
      return Observable.of({ kind: 'empty' });
    case 'result':
      const outline = result.result;
      if (outline == null) {
        return Observable.of({ kind: 'provider-no-outline' });
      }
      return highlightedOutlines(outline, result.editor);
    case 'provider-error':
      return Observable.of({ kind: 'provider-no-outline' });
    default:
      // The remaining kind is 'edit', but we don't want to render a blank outline whenever an edit
      // happens. Better just to display slightly out of date results while we wait for the new
      // results to come in than to flicker
      return Observable.empty();
  }
}

function highlightedOutlines(outline: Outline, editor: atom$TextEditor): Observable<OutlineForUi> {
  const outlineForUi = {
    kind: 'outline',
    outlineTrees: outline.outlineTrees.map(treeToUiTree),
    editor,
  };

  return getCursorPositions(editor)
    .map(cursorLocation => highlightCurrentNode(outlineForUi, cursorLocation));
}

function treeToUiTree(outlineTree: OutlineTree): OutlineTreeForUi {
  return {
    plainText: outlineTree.plainText,
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
