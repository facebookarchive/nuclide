'use strict';
/* @noflow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/*eslint-disable no-var, prefer-const*/

var FAKE_DISABLE_RE = /\s*eslint-disable\s+nuclide-internal\/fb-license-header\s*/;

var SHEBANG_RE = /^#!\/usr\/bin\/env node --harmony\n/;
var DIRECTIVES_RE = /^['"]use (babel|strict)['"];\n/;
var FLOW_PRAGMA_RE = /^\/\* @(no)?flow \*\//;

var LICENSE =
  '/*\n' +
  ' * Copyright (c) 2015-present, Facebook, Inc.\n' +
  ' * All rights reserved.\n' +
  ' *\n' +
  ' * This source code is licensed under the license found in the LICENSE file in\n' +
  ' * the root directory of this source tree.\n' +
  ' */';

var LINE_RE = /^\n/;
var LINE_OR_END_RE = /^(\n|$)/;

module.exports = function(context) {
  // "eslint-disable" disables rules after it. Since the directives have to go
  // first, we can't use that mechanism to disable this check.
  var comments = context.getAllComments();
  for (var i = 0; i < comments.length; i++) {
    if (FAKE_DISABLE_RE.test(comments[i].value)) {
      return {};
    }
  }

  var sourceCode = context.getSourceCode();

  return {
    Program: function(node) {
      var source = sourceCode.text;

      // shebangs and directives are optional
      source = source.replace(SHEBANG_RE, '');
      source = source.replace(DIRECTIVES_RE, '');

      // flow pragma is optional...
      if (FLOW_PRAGMA_RE.test(source)) {
        source = source.replace(FLOW_PRAGMA_RE, '').replace(LINE_RE, '');
        if (LINE_OR_END_RE.test(source)) {
          source = source.replace(LINE_OR_END_RE, '');
        } else {
          // ...but, if used, it needs a line break
          comments.some(function(comment) {
            var text = sourceCode.getText(comment);
            if (FLOW_PRAGMA_RE.test(text)) {
              context.report({
                node: comment,
                message: 'Expected one line break after the flow pragma',
              });
              return true;
            }
          });
        }
      }

      // license is NOT optional
      if (startsWith(source, LICENSE)) {
        source = source.replace(LICENSE, '').replace(LINE_RE, '');
        if (LINE_OR_END_RE.test(source)) {
          // all ok
        } else {
          comments.some(function(comment) {
            var text = sourceCode.getText(comment);
            if (text === LICENSE) {
              context.report({
                node: comment,
                message: 'Expected a line break after the license header',
              });
              return true;
            }
          });
        }
      } else {
        context.report({
          node: node,
          message: 'Expected a license header',
        });
      }
    },
  };
};

function startsWith(str, prefix) {
  return typeof str === 'string' && str.indexOf(prefix) === 0;
}

module.exports.schema = [];
