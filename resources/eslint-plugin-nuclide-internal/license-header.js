'use strict';
/* @noflow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/* NON-TRANSPILED FILE */
/* eslint comma-dangle: [1, always-multiline], prefer-object-spread/prefer-object-spread: 0 */

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

// The LICENSE_WITH_FLOW header is meant for files that are read by flow but
// not by the transpiler. The build transpiler will transpile any file that
// starts with the right pragma (e.g. 'use babel', "use babel", /* @flow */, or
// /** @babel */). There is some flow syntax that babel can't handle, this
// header is for those files.
const LICENSE_WITH_FLOW = `\
/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
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

      if (source.startsWith(LICENSE_WITH_FLOW)) {
        return;
      }

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
          node,
          message: 'Expected a license header',
        });
      }
    },
  };
};

module.exports.schema = [];
