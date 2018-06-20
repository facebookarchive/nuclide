'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UI_COMPONENT_TOOLS_INDEXING_GK = undefined;
exports.getComponentDefinitionFromAst = getComponentDefinitionFromAst;

var _constants;

function _load_constants() {
  return _constants = require('./constants');
}

Object.defineProperty(exports, 'UI_COMPONENT_TOOLS_INDEXING_GK', {
  enumerable: true,
  get: function () {
    return (_constants || _load_constants()).UI_COMPONENT_TOOLS_INDEXING_GK;
  }
});

var _uiComponentAst;

function _load_uiComponentAst() {
  return _uiComponentAst = require('./uiComponentAst');
}

function getComponentDefinitionFromAst(fileUri, ast) {
  // The component must have a matching file name and component.
  const componentName = (0, (_uiComponentAst || _load_uiComponentAst()).getComponentNameFromUri)(fileUri);
  if (componentName == null) {
    return null;
  }
  const requiredProps = (0, (_uiComponentAst || _load_uiComponentAst()).getRequiredPropsFromAst)(componentName, ast);
  const defaultProps = (0, (_uiComponentAst || _load_uiComponentAst()).getDefaultPropNames)(componentName, ast);
  const leadingComment = (0, (_uiComponentAst || _load_uiComponentAst()).getLeadingCommentForComponent)(componentName, ast);
  return {
    name: componentName,
    requiredProps,
    defaultProps,
    leadingComment
  };
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   *  strict-local
   * @format
   */