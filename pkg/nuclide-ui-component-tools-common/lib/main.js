"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getComponentDefinitionFromAst = getComponentDefinitionFromAst;
Object.defineProperty(exports, "UI_COMPONENT_TOOLS_INDEXING_GK", {
  enumerable: true,
  get: function () {
    return _constants().UI_COMPONENT_TOOLS_INDEXING_GK;
  }
});

function _uiComponentAst() {
  const data = require("./uiComponentAst");

  _uiComponentAst = function () {
    return data;
  };

  return data;
}

function _constants() {
  const data = require("./constants");

  _constants = function () {
    return data;
  };

  return data;
}

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */
function getComponentDefinitionFromAst(fileUri, ast) {
  // The component must have a matching file name and component.
  const componentName = (0, _uiComponentAst().getComponentNameFromUri)(fileUri);

  if (componentName == null) {
    return null;
  }

  const requiredProps = (0, _uiComponentAst().getRequiredPropsFromAst)(componentName, ast);

  if (requiredProps == null) {
    // There is a difference between having no required props and being unable
    // to traverse for required props. If this case is the latter, it probably
    // isn't an actual React component and we wouldn't want to supply the wrong
    // ComponentDefinition.
    return null;
  }

  const defaultProps = (0, _uiComponentAst().getDefaultPropNames)(componentName, ast);
  const leadingComment = (0, _uiComponentAst().getLeadingCommentForComponent)(componentName, ast);
  return {
    name: componentName,
    requiredProps,
    defaultProps,
    leadingComment
  };
}