"use strict";

function _fsPromise() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/fsPromise"));

  _fsPromise = function () {
    return data;
  };

  return data;
}

function _() {
  const data = require("..");

  _ = function () {
    return data;
  };

  return data;
}

function _uiComponentAst() {
  const data = require("../lib/uiComponentAst");

  _uiComponentAst = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
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
 * @format
 */

/* eslint
  no-console: 0,
 */

/**
 * This is a convenience script to look at the ComponentDefinition instances for
 * components in a given folder.
 */
(async () => {
  if (process.argv.length !== 3) {
    console.log('Must specify a path.');
    return;
  }

  const components = await _fsPromise().default.glob(_nuclideUri().default.join(process.argv[2], '**', '*.react.js'));
  components.forEach(async path => {
    const ast = await (0, _uiComponentAst().parseCode)((await _fsPromise().default.readFile(path, 'utf8')));

    if (ast == null) {
      return;
    }

    const definition = (0, _().getComponentDefinitionFromAst)(path, ast);
    console.log(`${_nuclideUri().default.basename(path)}:`);

    if (definition == null) {
      console.log('Could not get component definition from', path);
      return;
    }

    console.log(definition.name);

    if (definition.leadingComment != null) {
      console.log(definition.leadingComment.replace('\n', '<br>'));
    }

    console.log('Required Props:', definition.requiredProps);
    console.log('Default Props:', definition.defaultProps);
    console.log();
  });
})();