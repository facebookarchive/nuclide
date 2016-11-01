'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _dec, _desc, _value, _class;

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _FlowServiceFactory;

function _load_FlowServiceFactory() {
  return _FlowServiceFactory = require('./FlowServiceFactory');
}

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
  var desc = {};
  Object['ke' + 'ys'](descriptor).forEach(function (key) {
    desc[key] = descriptor[key];
  });
  desc.enumerable = !!desc.enumerable;
  desc.configurable = !!desc.configurable;

  if ('value' in desc || desc.initializer) {
    desc.writable = true;
  }

  desc = decorators.slice().reverse().reduce(function (desc, decorator) {
    return decorator(target, property, desc) || desc;
  }, desc);

  if (context && desc.initializer !== void 0) {
    desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
    desc.initializer = undefined;
  }

  if (desc.initializer === void 0) {
    Object['define' + 'Property'](target, property, desc);
    desc = null;
  }

  return desc;
}

let FlowAutocompleteProvider = (_dec = (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)('flow.autocomplete'), (_class = class FlowAutocompleteProvider {
  static getSuggestions(request) {
    const editor = request.editor,
          prefix = request.prefix,
          activatedManually = request.activatedManually;

    const filePath = editor.getPath();
    const contents = editor.getText();
    const cursor = editor.getLastCursor();
    const line = cursor.getBufferRow();
    const col = cursor.getBufferColumn();

    if (filePath == null) {
      return Promise.resolve(null);
    }

    const flowService = (0, (_FlowServiceFactory || _load_FlowServiceFactory()).getFlowServiceByNuclideUri)(filePath);

    if (!flowService) {
      throw new Error('Invariant violation: "flowService"');
    }

    return flowService.flowGetAutocompleteSuggestions(filePath, contents, line, col, prefix,
    // Needs to be a boolean, but autocomplete-plus gives us undefined instead of false.
    Boolean(activatedManually));
  }
}, (_applyDecoratedDescriptor(_class, 'getSuggestions', [_dec], Object.getOwnPropertyDescriptor(_class, 'getSuggestions'), _class)), _class));
exports.default = FlowAutocompleteProvider;
module.exports = exports['default'];