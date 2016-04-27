

var jscs = require('jscodeshift');

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _require = require('./StringUtils');

var isLowerCase = _require.isLowerCase;

// TODO: make this configurable somehow, we probably don't want to explicitly
// list out all of the lowercase html tags that are built-in
var LOWER_CASE_WHITE_LIST = new Set(['fbt']);

/**
 * This will get a list of identifiers for JSXElements in the AST
 */
function getJSXIdentifiers(root) {
  var ids = new Set();
  root
  // There should be an opening element for every single closing element so
  // we can just look for opening ones
  .find(jscs.JSXOpeningElement).filter(function (path) {
    return jscs.JSXIdentifier.check(path.node.name);
  }).forEach(function (path) {
    var name = path.node.name.name;
    // TODO: should this be here or in addMissingRequires?
    if (!isLowerCase(name) || LOWER_CASE_WHITE_LIST.has(name)) {
      ids.add(name);
    }
  });
  return ids;
}

module.exports = getJSXIdentifiers;