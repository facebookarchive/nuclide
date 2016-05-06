'use strict';
/* @noflow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const FAKE_DISABLE_RE = /\s*eslint-disable\s+nuclide-internal\/license-header\s*/;

const SHEBANG_RE = /^#!\/usr\/bin\/env node\n/;
const DIRECTIVES_RE = /^['"]use (babel|strict)['"];\n/;
const FLOW_PRAGMA_RE = /^\/\* @(no)?flow \*\//;

const LICENSE = `\
/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */`;

const LINE_RE = /^\n/;
const LINE_OR_END_RE = /^(\n|$)/;

module.exports = context => {
  // "eslint-disable" disables rules after it. Since the directives have to go
  // first, we can't use that mechanism to disable this check.
  const comments = context.getAllComments();
  for (let i = 0; i < comments.length; i++) {
    if (FAKE_DISABLE_RE.test(comments[i].value)) {
      return {};
    }
  }

  const sourceCode = context.getSourceCode();

  return {
    Program(node) {
      let source = sourceCode.text;

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
          comments.some(comment => {
            const text = sourceCode.getText(comment);
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
      if (source.startsWith(LICENSE)) {
        source = source.replace(LICENSE, '').replace(LINE_RE, '');
        if (LINE_OR_END_RE.test(source)) {
          // all ok
        } else {
          comments.some(comment => {
            const text = sourceCode.getText(comment);
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

module.exports.schema = [];
