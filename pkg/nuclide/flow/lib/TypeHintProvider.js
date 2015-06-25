'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {extractWordAtPosition} = require('nuclide-atom-helpers');
var {getServiceByNuclideUri} = require('nuclide-client');
var {Range} = require('atom');
var {getConfigValueAsync} = require('nuclide-commons');

const JAVASCRIPT_WORD_REGEX = /[a-zA-Z0-9_$]+/g;

module.exports = class TypeHintProvider {

  async typeHint(editor: TextEditor, position: Point): Promise<?TypeHint> {
    var enabled = await getConfigValueAsync('nuclide-flow.enableTypeHints')();
    if (!enabled) {
      return null;
    }
    var filePath = editor.getPath();
    var contents = editor.getText();
    var flowService = await getServiceByNuclideUri('FlowService', filePath);

    var type = await flowService.getType(filePath, contents, position.row, position.column);
    if (type === null) {
      return null;
    }

    // TODO(nmote) refine this regex to better capture JavaScript expressions.
    // Having this regex be not quite right is just a display issue, though --
    // it only affects the location of the tooltip.
    var word = extractWordAtPosition(editor, position, JAVASCRIPT_WORD_REGEX);
    var range;
    if (word) {
      range = word.range;
    } else {
      range = new Range(position, position);
    }
    return {
      hint: type,
      range,
    };
  }

};
