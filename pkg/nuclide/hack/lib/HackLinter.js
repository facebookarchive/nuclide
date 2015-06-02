'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var url = require('url');
var {findDiagnostics} = require('./hack');
var {HACK_GRAMMAR, HACK_LINTER_NAME} = require('nuclide-hack-common/lib/constants');
var Linter = require(`${atom.packages.resolvePackagePath('linter')}/lib/linter`);

class HackLinter extends Linter {
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
  async lintFile(filePath, callback): array {
    var file = this.editor.getBuffer().file;

    // RemoteFile has a getRealPath() method that returns a Promise but Atom's
    // built-in File does not.
    var getRealPath = file.getRealPath ? file.getRealPath :
        Promise.resolve(file.getRealPathSync());
    var [diagnostics, fileRealPath] = await Promise.all([
      findDiagnostics(this.editor),
      getRealPath,
    ]);
    if (!diagnostics.length) {
      callback([]);
      return;
    }
    var {path} = url.parse(file.getPath());
    var messages = diagnostics.filter((diagnostic) => {
      return diagnostic.path === path ||
          diagnostic.path === fileRealPath;
    });
    callback(messages);
  }
}

HackLinter.syntax = HACK_GRAMMAR;

HackLinter.prototype.linterName = HACK_LINTER_NAME;

module.exports = HackLinter;
