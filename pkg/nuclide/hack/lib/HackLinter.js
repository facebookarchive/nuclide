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
var {HACK_GRAMMAR} = require('nuclide-hack-common/lib/constants');

module.exports = {
  grammarScopes: [HACK_GRAMMAR],
  scope: 'file',
  lintOnFly: true,
  async lint(textEditor: TextEditor): Promise<Array<Object>> {
    var file = textEditor.getBuffer().file;
    if (!file) {
      return [];
    }
    // RemoteFile has a getRealPath() method that returns a Promise but Atom's
    // built-in File does not.
    var getRealPath = file.getRealPath ? file.getRealPath :
        Promise.resolve(file.getRealPathSync());
    var [diagnostics, fileRealPath] = await Promise.all([
      findDiagnostics(textEditor),
      getRealPath,
    ]);
    if (!diagnostics.length) {
      return [];
    }
    var {path} = url.parse(file.getPath());
    var messages = diagnostics.filter((diagnostic) => {
      return diagnostic.filePath === path ||
          diagnostic.filePath === fileRealPath;
    });
    return messages;
  },
};
