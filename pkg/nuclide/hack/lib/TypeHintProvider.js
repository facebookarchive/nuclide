'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var hack = require('./hack');

module.exports = class TypeHintProvider {

  typeHint(editor: TextEditor, position: Point): Promise<TypeHint> {
    return hack.typeHintFromEditor(editor, position);
  }

};
