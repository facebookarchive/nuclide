'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createOutlines = createOutlines;

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('../../commons-atom/featureConfig'));
}

var _textEditor;

function _load_textEditor() {
  return _textEditor = require('../../commons-atom/text-editor');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

const LOADING_DELAY_MS = 500;

function createOutlines(editorService) {
  return outlinesForProviderResults(editorService.getResultsStream());
}

function outlinesForProviderResults(providerResults) {
  return providerResults.switchMap(uiOutlinesForResult);
}

function uiOutlinesForResult(result) {
  switch (result.kind) {
    case 'not-text-editor':
      return _rxjsBundlesRxMinJs.Observable.of({ kind: 'not-text-editor' });
    case 'no-provider':
      return _rxjsBundlesRxMinJs.Observable.of({
        kind: 'no-provider',
        grammar: result.grammar.name
      });
    case 'pane-change':
      // Render a blank outline when we change panes.
      // If we haven't received anything after LOADING_DELAY_MS, display a loading indicator.
      return _rxjsBundlesRxMinJs.Observable.concat(_rxjsBundlesRxMinJs.Observable.of({ kind: 'empty' }), _rxjsBundlesRxMinJs.Observable.of({ kind: 'loading' }).delay(LOADING_DELAY_MS));
    case 'result':
      const outline = result.result;
      if (outline == null) {
        return _rxjsBundlesRxMinJs.Observable.of({ kind: 'provider-no-outline' });
      }
      return highlightedOutlines(outline, result.editor);
    case 'provider-error':
      return _rxjsBundlesRxMinJs.Observable.of({ kind: 'provider-no-outline' });
    default:
      // Don't change the UI after 'edit' or 'save' events.
      // It's better to just leave the existing outline visible until the new results come in.
      return _rxjsBundlesRxMinJs.Observable.empty();
  }
}

function highlightedOutlines(outline, editor) {
  const nameOnly = (_featureConfig || _load_featureConfig()).default.get('nuclide-outline-view.nameOnly');
  const outlineForUi = {
    kind: 'outline',
    outlineTrees: outline.outlineTrees.map(outlineTree => treeToUiTree(outlineTree, Boolean(nameOnly))),
    editor
  };

  return (0, (_textEditor || _load_textEditor()).getCursorPositions)(editor).map(cursorLocation => highlightCurrentNode(outlineForUi, cursorLocation));
}

function treeToUiTree(outlineTree, nameOnly) {
  const shortName = nameOnly && outlineTree.representativeName != null;
  return {
    plainText: shortName ? outlineTree.representativeName : outlineTree.plainText,
    tokenizedText: shortName ? undefined : outlineTree.tokenizedText,
    startPosition: outlineTree.startPosition,
    endPosition: outlineTree.endPosition,
    highlighted: false,
    children: outlineTree.children.map(tree => treeToUiTree(tree, nameOnly))
  };
}

// Return an outline object with the node under the cursor highlighted. Does not mutate the
// original.
function highlightCurrentNode(outline, cursorLocation) {
  if (!(outline.kind === 'outline')) {
    throw new Error('Invariant violation: "outline.kind === \'outline\'"');
  }
  // $FlowIssue


  return Object.assign({}, outline, {
    outlineTrees: highlightCurrentNodeInTrees(outline.outlineTrees, cursorLocation)
  });
}

function highlightCurrentNodeInTrees(outlineTrees, cursorLocation) {
  return outlineTrees.map(tree => {
    return Object.assign({}, tree, {
      highlighted: shouldHighlightNode(tree, cursorLocation),
      children: highlightCurrentNodeInTrees(tree.children, cursorLocation)
    });
  });
}

function shouldHighlightNode(outlineTree, cursorLocation) {
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
    return cursorLocation.isGreaterThanOrEqual(startPosition) && cursorLocation.isLessThan(childStartPosition);
  }
  return cursorLocation.isGreaterThanOrEqual(startPosition) && cursorLocation.isLessThanOrEqual(endPosition);
}