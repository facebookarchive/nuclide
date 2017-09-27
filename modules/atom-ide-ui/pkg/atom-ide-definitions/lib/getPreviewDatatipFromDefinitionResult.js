'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let getPreview = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* (definition, definitionPreviewProvider) {
    let getDefinitionPreviewFn;
    if (definitionPreviewProvider == null) {
      getDefinitionPreviewFn = (_symbolDefinitionPreview || _load_symbolDefinitionPreview()).getDefinitionPreview;
    } else {
      getDefinitionPreviewFn = definitionPreviewProvider.getDefinitionPreview.bind(definitionPreviewProvider);
    }

    return (_analytics || _load_analytics()).default.trackTiming('hyperclickPreview.getDefinitionPreview', function () {
      return getDefinitionPreviewFn(definition);
    });
  });

  return function getPreview(_x5, _x6) {
    return _ref2.apply(this, arguments);
  };
})();

var _analytics;

function _load_analytics() {
  return _analytics = _interopRequireDefault(require('nuclide-commons-atom/analytics'));
}

var _symbolDefinitionPreview;

function _load_symbolDefinitionPreview() {
  return _symbolDefinitionPreview = require('nuclide-commons/symbol-definition-preview');
}

var _react = _interopRequireDefault(require('react'));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (range, definitions, definitionPreviewProvider, grammar) {
    if (definitions.length === 1) {
      const definition = definitions[0];
      // Some providers (e.g. Flow) return negative positions.
      if (definition.position.row < 0) {
        return null;
      }

      const definitionPreview = yield getPreview(definition, definitionPreviewProvider);

      if (definitionPreview == null) {
        return null;
      }

      // if mimetype is image return image component with base-64 encoded
      //  image contents, otherwise use markedStrings
      if (definitionPreview.mime.startsWith('image/')) {
        return {
          component: function () {
            return _react.default.createElement('img', {
              src: `data:${definitionPreview.mime};${definitionPreview.encoding},${definitionPreview.contents}`
            });
          },
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
  });

  function getPreviewDatatipFromDefinition(_x, _x2, _x3, _x4) {
    return _ref.apply(this, arguments);
  }

  return getPreviewDatatipFromDefinition;
})(); /**
       * Copyright (c) 2017-present, Facebook, Inc.
       * All rights reserved.
       *
       * This source code is licensed under the BSD-style license found in the
       * LICENSE file in the root directory of this source tree. An additional grant
       * of patent rights can be found in the PATENTS file in the same directory.
       *
       * 
       * @format
       */