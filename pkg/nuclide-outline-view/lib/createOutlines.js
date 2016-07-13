Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.createOutlines = createOutlines;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _rxjsBundlesRxUmdMinJs2;

function _rxjsBundlesRxUmdMinJs() {
  return _rxjsBundlesRxUmdMinJs2 = require('rxjs/bundles/Rx.umd.min.js');
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _commonsAtomTextEditor2;

function _commonsAtomTextEditor() {
  return _commonsAtomTextEditor2 = require('../../commons-atom/text-editor');
}

var LOADING_DELAY_MS = 500;

function createOutlines(editorService) {
  return outlinesForProviderResults(editorService.getResultsStream());
}

function outlinesForProviderResults(providerResults) {
  return providerResults.switchMap(uiOutlinesForResult);
}

function uiOutlinesForResult(result) {
  switch (result.kind) {
    case 'not-text-editor':
      return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.of({ kind: 'not-text-editor' });
    case 'no-provider':
      return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.of({
        kind: 'no-provider',
        grammar: result.grammar.name
      });
    case 'pane-change':
      // Render a blank outline when we change panes.
      // If we haven't received anything after LOADING_DELAY_MS, display a loading indicator.
      return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.concat((_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.of({ kind: 'empty' }), (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.of({ kind: 'loading' }).delay(LOADING_DELAY_MS));
    case 'result':
      var outline = result.result;
      if (outline == null) {
        return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.of({ kind: 'provider-no-outline' });
      }
      return highlightedOutlines(outline, result.editor);
    case 'provider-error':
      return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.of({ kind: 'provider-no-outline' });
    default:
      // Don't change the UI after 'edit' or 'save' events.
      // It's better to just leave the existing outline visible until the new results come in.
      return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.empty();
  }
}

function highlightedOutlines(outline, editor) {
  var outlineForUi = {
    kind: 'outline',
    outlineTrees: outline.outlineTrees.map(treeToUiTree),
    editor: editor
  };

  return (0, (_commonsAtomTextEditor2 || _commonsAtomTextEditor()).getCursorPositions)(editor).map(function (cursorLocation) {
    return highlightCurrentNode(outlineForUi, cursorLocation);
  });
}

function treeToUiTree(outlineTree) {
  return {
    plainText: outlineTree.plainText,
    tokenizedText: outlineTree.tokenizedText,
    startPosition: outlineTree.startPosition,
    endPosition: outlineTree.endPosition,
    highlighted: false,
    children: outlineTree.children.map(treeToUiTree)
  };
}

// Return an outline object with the node under the cursor highlighted. Does not mutate the
// original.
function highlightCurrentNode(outline, cursorLocation) {
  (0, (_assert2 || _assert()).default)(outline.kind === 'outline');
  // $FlowIssue
  return _extends({}, outline, {
    outlineTrees: highlightCurrentNodeInTrees(outline.outlineTrees, cursorLocation)
  });
}

function highlightCurrentNodeInTrees(outlineTrees, cursorLocation) {
  return outlineTrees.map(function (tree) {
    return _extends({}, tree, {
      highlighted: shouldHighlightNode(tree, cursorLocation),
      children: highlightCurrentNodeInTrees(tree.children, cursorLocation)
    });
  });
}

function shouldHighlightNode(outlineTree, cursorLocation) {
  var startPosition = outlineTree.startPosition;
  var endPosition = outlineTree.endPosition;
  if (endPosition == null) {
    return false;
  }
  if (outlineTree.children.length !== 0) {
    var childStartPosition = outlineTree.children[0].startPosition;
    // Since the parent is rendered in the list above the children, it doesn't really make sense to
    // highlight it if you are below the start position of any child. However, if you are at the top
    // of a class it does seem desirable to highlight it.
    return cursorLocation.isGreaterThanOrEqual(startPosition) && cursorLocation.isLessThan(childStartPosition);
  }
  return cursorLocation.isGreaterThanOrEqual(startPosition) && cursorLocation.isLessThanOrEqual(endPosition);
}