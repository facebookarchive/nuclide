'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _immutable;

function _load_immutable() {
  return _immutable = _interopRequireDefault(require('immutable'));
}

var _atom = require('atom');

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getPlatformKeys(platform) {
  if (platform === 'darwin') {
    return 'nuclide.hyperclick.darwinTriggerKeys';
  } else if (platform === 'win32') {
    return 'nuclide.hyperclick.win32TriggerKeys';
  }
  return 'nuclide.hyperclick.linuxTriggerKeys';
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   * @format
   */

class HyperclickPreviewManager {

  constructor() {
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this._triggerKeys = new Set();

    this._disposables.add(atom.config.observe(getPlatformKeys(process.platform), newValue => {
      this._triggerKeys = new Set(newValue.split(','));
    }));
  }

  dispose() {
    this._disposables.dispose();
  }

  modifierDatatip(editor, position, heldKeys) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (!_this._triggerKeys ||
      // are the required keys held down?
      heldKeys.intersect(_this._triggerKeys).size !== _this._triggerKeys.size) {
        return;
      }

      const grammar = editor.getGrammar();
      if (_this._definitionService == null) {
        return null;
      }
      const result = yield _this._definitionService.getDefinition(editor, position);
      if (result == null) {
        return null;
      }

      const { queryRange, definitions } = result;
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('hyperclick-preview-popup', {
        grammar: grammar.name,
        definitionCount: definitions.length
      });

      if (definitions.length === 1) {
        const definition = definitions.pop();
        // Some providers (e.g. Flow) return negative positions.
        if (definition.position.row < 0) {
          return null;
        }

        const { getDefinitionPreview } = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getDefinitionPreviewServiceByNuclideUri)(definition.path);

        const definitionPreview = yield (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)('hyperclickPreview.getDefinitionPreview', function () {
          return getDefinitionPreview(definition);
        });
        return {
          markedStrings: [{
            type: 'snippet',
            value: definitionPreview,
            grammar
          }],
          range: queryRange[0]
        };
      }

      return {
        markedStrings: [{
          type: 'markdown',
          value: `${definitions.length} definitions found. Click to jump.`,
          grammar
        }],
        range: queryRange[0]
      };
    })();
  }

  setDefinitionService(service) {
    this._definitionService = service;

    return new _atom.Disposable(() => {
      this._definitionService = null;
    });
  }
}
exports.default = HyperclickPreviewManager;