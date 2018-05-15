'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.default =




















getSignatureDatatip;var _atom = require('atom');var _string;function _load_string() {return _string = require('../../../../nuclide-commons/string');} /**
                                                                                                                                                       * WIP: This is just what VSCode displays. We can likely make this more Atom-y.
                                                                                                                                                       */ /**
                                                                                                                                                           * Copyright (c) 2017-present, Facebook, Inc.
                                                                                                                                                           * All rights reserved.
                                                                                                                                                           *
                                                                                                                                                           * This source code is licensed under the BSD-style license found in the
                                                                                                                                                           * LICENSE file in the root directory of this source tree. An additional grant
                                                                                                                                                           * of patent rights can be found in the PATENTS file in the same directory.
                                                                                                                                                           *
                                                                                                                                                           *  strict-local
                                                                                                                                                           * @format
                                                                                                                                                           */function getSignatureDatatip(signatureHelp, point) {// Note: empty signatures have already been filtered out above.
  const activeSignature = signatureHelp.signatures[signatureHelp.activeSignature || 0];const markedStrings = [{ type: 'markdown', value: (0, (_string || _load_string()).escapeMarkdown)(activeSignature.label) }];if (activeSignature.parameters != null) {
    const activeParameterIndex = signatureHelp.activeParameter || 0;
    const activeParameter = activeSignature.parameters[activeParameterIndex];
    if (activeParameter != null) {
      if (
      activeParameter.documentation != null &&
      activeParameter.documentation !== '')
      {
        markedStrings.push({
          type: 'markdown',
          value: activeParameter.documentation });

      }
      // Find the label inside the signature label, and bolden it.
      if (activeParameter.label !== '') {
        const idx = findIndex(
        activeSignature.label,
        activeSignature.parameters,
        activeParameterIndex);

        if (idx !== -1) {
          markedStrings[0].value =
          (0, (_string || _load_string()).escapeMarkdown)(activeSignature.label.substr(0, idx)) +
          '<u>**' +
          (0, (_string || _load_string()).escapeMarkdown)(activeParameter.label) +
          '**</u>' +
          (0, (_string || _load_string()).escapeMarkdown)(
          activeSignature.label.substr(idx + activeParameter.label.length));

        }
      }
    }
  }
  if (
  activeSignature.documentation != null &&
  activeSignature.documentation !== '')
  {
    markedStrings.push({
      type: 'markdown',
      value: activeSignature.documentation });

  }
  return {
    markedStrings,
    range: new _atom.Range(point, point) };

}

/**
   * Find the index in the label corresponding to the active parameter's label.
   * This isn't as straightforward as it seems, because parameters could have names
   * that appear multiple times in label.
   *
   * Searching backwards starting with the last parameter is the most reliable method.
   *
   * @returns -1 on failure.
   */
function findIndex(
label,
parameters,
activeParameterIndex)
{
  let lastIndex = undefined;
  for (let i = parameters.length - 1; i >= activeParameterIndex; i--) {
    if (lastIndex != null) {
      // Parameter labels need to be disjoint, so leave some room.
      lastIndex -= parameters[i].label.length;
      if (lastIndex < 0) {
        return -1;
      }
    }
    const nextIndex = label.lastIndexOf(parameters[i].label, lastIndex);
    if (nextIndex === -1) {
      return -1;
    }
    lastIndex = nextIndex;
  }
  return lastIndex != null ? lastIndex : -1;
}