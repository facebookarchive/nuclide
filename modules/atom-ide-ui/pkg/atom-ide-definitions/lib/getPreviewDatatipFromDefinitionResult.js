"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _analytics() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons/analytics"));

  _analytics = function () {
    return data;
  };

  return data;
}

function _symbolDefinitionPreview() {
  const data = require("../../../../nuclide-commons/symbol-definition-preview");

  _symbolDefinitionPreview = function () {
    return data;
  };

  return data;
}

var _react = _interopRequireDefault(require("react"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict-local
 * @format
 */
var getPreviewDatatipFromDefinition = async function getPreviewDatatipFromDefinition(range, definitions, definitionPreviewProvider, grammar) {
  if (definitions.length === 1) {
    const definition = definitions[0]; // Some providers (e.g. Flow) return negative positions.

    if (definition.position.row < 0) {
      return null;
    }

    const definitionPreview = await getPreview(definition, definitionPreviewProvider);

    if (definitionPreview == null) {
      return null;
    } // if mimetype is image return image component with base-64 encoded
    //  image contents, otherwise use markedStrings


    if (definitionPreview.mime.startsWith('image/')) {
      return {
        component: () => _react.default.createElement("img", {
          src: `data:${definitionPreview.mime};${definitionPreview.encoding},${definitionPreview.contents}`
        }),
        range
      };
    }

    return {
      markedStrings: [{
        type: 'snippet',
        value: definitionPreview.contents,
        grammar
      }],
      range
    };
  }

  return {
    markedStrings: [{
      type: 'markdown',
      value: `${definitions.length} definitions found. Click to jump.`,
      grammar
    }],
    range
  };
};

exports.default = getPreviewDatatipFromDefinition;

async function getPreview(definition, definitionPreviewProvider) {
  let getDefinitionPreviewFn;

  if (definitionPreviewProvider == null) {
    getDefinitionPreviewFn = _symbolDefinitionPreview().getDefinitionPreview;
  } else {
    getDefinitionPreviewFn = definitionPreviewProvider.getDefinitionPreview.bind(definitionPreviewProvider);
  }

  return _analytics().default.trackTiming('hyperclickPreview.getDefinitionPreview', () => getDefinitionPreviewFn(definition));
}