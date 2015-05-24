'use babel';
/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
/* @flow */
var {getServiceByNuclideUri} = require('nuclide-client');
var Linter = require(`${atom.packages.resolvePackagePath('linter')}/lib/linter`);
var {Range} = require('atom');

/**
 * Currently, a diagnostic from Flow is an object with a "message" property.
 * Each item in the "message" array is an object with the following fields:
 *     - path (string) File that contains the error.
 *     - descr (string) Description of the error.
 *     - line (number) Start line.
 *     - endline (number) End line.
 *     - start (number) Start column.
 *     - end (number) End column.
 *     - code (number) Presumably an error code.
 * The message array may have more than one item. For example, if there is a
 * type incompatibility error, the first item in the message array blames the
 * usage of the wrong type and the second blames the declaration of the type
 * with which the usage disagrees. Note that these could occur in different
 * files.
 */
function flowMessageToLinterMessage(message) {
  // It's unclear why the 1-based to 0-based indexing works the way that it
  // does, but this has the desired effect in the UI, in practice.
  var range = new Range(
    [message['line'] - 1, message['start'] - 1],
    [message['endline'] - 1, message['end']]
  );

  return {
    level: 'error',
    message: message['descr'],
    range: range,
    line: message['line'],
    col: message['start'],
    linter: 'flow',
  };
}

/**
 * In some cases, flow diagnostics will span multiple files. It helps in the case
 * that there's a problem with, say, the the way a function defined in another
 * file is typed conflicts with how you're calling it.
 *
 * You get diagnostics like:
 * File A: <Type string is incompatable>
 * File B: <with type number>
 *
 * We don't have any way to deal with this, so merge the descriptions, so that
 * information doesn't get cut off.
 *
 */
function mergeFlowMessages(messages: Array) {
  var message = messages[0];
  message['descr'] = messages.map((msg)=>msg['descr']).join(' ');
  return message;
}

class FlowLinter extends Linter {
  constructor(editor) {
    super(editor);
  }

  /**
   * @param filePath This is not the path of the actual file: this is the path
   *     to a temporary file with the same name as the original file that
   *     contains the (potentially unsaved) contents of the editor.
   * @param callback Takes an array of message objects that correspond to lint
   *     warnings or errors. Although undocumented
   *     (https://github.com/AtomLinter/Linter/issues/247), a message object
   *     should have the following properties:
   *     - level (string: 'warning' or 'error')
   *     - message (string) the message to display
   *     - range (Range) text to highlight to show the diagnostic
   *     - line (number) where the diagnostics occurs
   *     - col (number) where the diagnostics occurs
   *     - linter (string) linter that reported the error
   */
  async lintFile(filePath, callback): Promise<?Array> {
    var file = this.editor.getPath();
    var diagnostics = await getServiceByNuclideUri('FlowService', file).findDiagnostics(file);
    if (!diagnostics.length) {
      callback([]);
      return;
    }

    var messages = FlowLinter.processDiagnostics(diagnostics, file);
    callback(messages);
  }

   static processDiagnostics(diagnostics: Array, targetFile: string) {
     var hasMessageWithPath = function(message) {
       return message['path'] === targetFile;
     };

     // Filter messages not addressing `targetFile` and merge messages spanning multiple files.
     var messages = diagnostics.map( (diagnostic) => {
                     var diagnosticMessages = diagnostic['message'];
                     return mergeFlowMessages(diagnosticMessages);
                    }).filter(hasMessageWithPath);

     return messages.map(flowMessageToLinterMessage);
   }
}

FlowLinter.syntax = 'source.js';

FlowLinter.prototype.linterName = 'flow';

module.exports = FlowLinter;
