'use strict';
/* @noflow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const DISABLE_FLAKY_RULES = true;

const whitelistedComments = [
  /@flow/,
  /^\s*eslint-/,
];

function isWhitelisted(text) {
  return whitelistedComments.some(function (regex) {
    return regex.test(text);
  });
}

const identifiers = {};

/**
 * Often you want to reference an identifier in a comment. This allows that
 * identifier to appear as the first word in a comment even if it begins with a
 * lower-case letter.
 *
 * Note that this only works for identifiers that appear in the current file.
 */
function findIdentifiers(tokens) {
  tokens.forEach(function (token) {
    if (token.type === 'Identifier') {
      identifiers[token.value] = true;
    }
  });
}

function startsWithIdentifier(comment) {
  return identifiers.hasOwnProperty(comment.trim().split(/\s/, 1));
}

module.exports = function(context) {
  findIdentifiers(context.getSourceCode().ast.tokens);
  function checkComment(node) {
    if (node.type === 'Block') {
      checkBlockComment(node);
    }

    // Currently disabled due to false positives.
    if (DISABLE_FLAKY_RULES) { return; }
    if (isWhitelisted(node.value)) {
      return;
    }
    if (/^[\s*]*[a-z]/.test(node.value)) {
      if (!startsWithIdentifier(node.value)) {
        context.report(node, 'Comments should not start with lower-case letters');
      }
    }
    if (!/[.!?:]\s*$/.test(node.value)) {
      context.report(node, 'Comments should end with a full stop');
    }
  }

  function checkBlockComment(node) {
    const lines = node.value.split('\n');
    if (lines.length > 1) {
      const firstLine = lines[0];
      const lastLine = lines[lines.length - 1];
      // The first line must be empty or start with * for a docblock.
      if (firstLine !== '' && firstLine !== '*') {
        context.report(node, 'First line of multiline comment should be empty');
      }
      // The last line must be empty (leading whitespace before */ is allowed,
      // though).
      if (!/^\s*$/.test(lastLine)) {
        context.report(node, 'Last line of multiline comment should be empty');
      }
    }
    // The first line need not start with '*'.
    lines.slice(1).forEach(function (line) {
      // If the first non-whitespace character is not '*'.
      if (/^\s*[^*\s]/.test(line)) {
        context.report(node, 'Continuing comment lines should start with *');
      }
    });
  }

  function checkDocComments(node) {
    // Currently disabled due to false positives.
    if (DISABLE_FLAKY_RULES) { return; }
    const leadingComments = context.getSourceCode().getComments(node).leading;
    if (leadingComments.length > 0) {
      const docComment = leadingComments[leadingComments.length - 1];
      const lastCommentLine = docComment.loc.end.line;
      const firstNodeLine = node.loc.start.line;
      if (firstNodeLine === lastCommentLine + 1) {
        if (docComment.type !== 'Block' || docComment.value.charAt(0) !== '*') {
          context.report(docComment, 'Documentation comments should start with /**');
        }
      }
    }
  }

  return {
    BlockComment: checkComment,
    LineComment: checkComment,
    FunctionDeclaration: checkDocComments,
    ClassDeclaration: checkDocComments,
    ClassProperty: checkDocComments,
    MethodDefinition: checkDocComments,
  };
};
