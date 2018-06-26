'use strict';

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('../../../modules/nuclide-commons/fsPromise'));
}

var _;

function _load_() {
  return _ = require('..');
}

var _uiComponentAst;

function _load_uiComponentAst() {
  return _uiComponentAst = require('../lib/uiComponentAst');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * This is a convenience script to look at the ComponentDefinition instances for
 * components in a given folder.
 */
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

(async () => {
  if (process.argv.length !== 3) {
    console.log('Must specify a path.');
    return;
  }

  const components = await (_fsPromise || _load_fsPromise()).default.glob((_nuclideUri || _load_nuclideUri()).default.join(process.argv[2], '**', '*.react.js'));

  components.forEach(async path => {
    const ast = await (0, (_uiComponentAst || _load_uiComponentAst()).parseCode)((await (_fsPromise || _load_fsPromise()).default.readFile(path, 'utf8')));
    if (ast == null) {
      return;
    }

    const definition = (0, (_ || _load_()).getComponentDefinitionFromAst)(path, ast);
    console.log(`${(_nuclideUri || _load_nuclideUri()).default.basename(path)}:`);
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