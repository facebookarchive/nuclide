"use strict";

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

var _atom = require("atom");

function _analytics() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons/analytics"));

  _analytics = function () {
    return data;
  };

  return data;
}

function _createPackage() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons-atom/createPackage"));

  _createPackage = function () {
    return data;
  };

  return data;
}

function _featureConfig() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons-atom/feature-config"));

  _featureConfig = function () {
    return data;
  };

  return data;
}

function _range() {
  const data = require("../../../../nuclide-commons-atom/range");

  _range = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _ProviderRegistry() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons-atom/ProviderRegistry"));

  _ProviderRegistry = function () {
    return data;
  };

  return data;
}

function _performanceNow() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons/performanceNow"));

  _performanceNow = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _goToLocation() {
  const data = require("../../../../nuclide-commons-atom/go-to-location");

  _goToLocation = function () {
    return data;
  };

  return data;
}

function _DefinitionCache() {
  const data = _interopRequireDefault(require("./DefinitionCache"));

  _DefinitionCache = function () {
    return data;
  };

  return data;
}

function _getPreviewDatatipFromDefinitionResult() {
  const data = _interopRequireDefault(require("./getPreviewDatatipFromDefinitionResult"));

  _getPreviewDatatipFromDefinitionResult = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
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
// This package provides Hyperclick results for any language which provides a
// DefinitionProvider.
const TRACK_TIMING_SAMPLE_RATIO = 0.1;

class Activation {
  constructor() {
    this._providers = new (_ProviderRegistry().default)();
    this._definitionCache = new (_DefinitionCache().default)();
    this._triggerKeys = new Set();
    this._disposables = new (_UniversalDisposable().default)(_featureConfig().default.observe(getPlatformKeys(process.platform), newValue => {
      this._triggerKeys = new Set( // flowlint-next-line sketchy-null-string:off
      newValue ? newValue.split(',') : null);
    }));
  }

  dispose() {
    this._disposables.dispose();
  }

  async _getDefinition(editor, position) {
    for (const provider of this._providers.getAllProvidersForEditor(editor)) {
      try {
        // eslint-disable-next-line no-await-in-loop
        const result = await provider.getDefinition(editor, position);

        if (result != null) {
          if (result.queryRange == null) {
            const match = (0, _range().wordAtPosition)(editor, position, provider.wordRegExp != null ? provider.wordRegExp : {
              includeNonWordCharacters: false
            });
            result.queryRange = [match != null ? match.range : new _atom.Range(position, position)];
          }

          return result;
        }
      } catch (err) {
        (0, _log4js().getLogger)('atom-ide-definitions').error(`Error getting definition for ${String(editor.getPath())}`, err);
      }
    }

    return null;
  }

  _getDefinitionCached(editor, position) {
    return this._definitionCache.get(editor, position, () => {
      return _analytics().default.trackTimingSampled('get-definition', () => this._getDefinition(editor, position), TRACK_TIMING_SAMPLE_RATIO, {
        path: editor.getPath()
      });
    });
  }

  async getSuggestion(editor, position) {
    const startTime = (0, _performanceNow().default)();
    const result = await this._getDefinitionCached(editor, position);
    const duration = (0, _performanceNow().default)() - startTime;

    if (result == null) {
      return null;
    }

    const {
      queryRange,
      definitions
    } = result;

    if (!(definitions.length > 0)) {
      throw new Error("Invariant violation: \"definitions.length > 0\"");
    } // queryRange might be null coming out of the provider, but the output
    // of _getDefinition has ensured it's not null.


    if (!(queryRange != null)) {
      throw new Error("Invariant violation: \"queryRange != null\"");
    }

    function createCallback(definition) {
      return () => {
        (0, _goToLocation().goToLocation)(definition.path, {
          line: definition.position.row,
          column: definition.position.column
        });

        _analytics().default.track('go-to-definition', {
          path: definition.path,
          line: definition.position.row,
          column: definition.position.column,
          from: editor.getPath(),
          name: definition.name,
          duration
        });
      };
    }

    function createTitle(definition) {
      const filePath = definition.projectRoot == null ? definition.path : _nuclideUri().default.relative(definition.projectRoot, definition.path);

      if (definition.name == null) {
        // Fall back to just displaying the path:line.
        return `${filePath}:${definition.position.row + 1}`;
      }

      return `${definition.name} (${filePath})`;
    }

    if (definitions.length === 1) {
      return {
        range: queryRange,
        callback: createCallback(definitions[0])
      };
    } else {
      return {
        range: queryRange,
        callback: definitions.map(definition => {
          return {
            title: createTitle(definition),
            callback: createCallback(definition)
          };
        })
      };
    }
  }

  async getPreview(editor, position, heldKeys) {
    if (!this._triggerKeys || // are the required keys held down?
    !Array.from(this._triggerKeys).every(key => heldKeys.has(key))) {
      return;
    } // Datatips are debounced, so this request should always come in after the getDefinition request.
    // Thus we should always be able to rely on the value being in the cache.
    // If it's not in the cache, this implies that a newer getDefinition request came in,
    // in which case the result of this function will be ignored anyway.


    const result = await this._definitionCache.getCached(editor, position);

    if (result == null) {
      return null;
    }

    const queryRange = result.queryRange; // queryRange might be null coming out of the provider, but the output
    // of _getDefinition has ensured it's not null.

    if (!(queryRange != null)) {
      throw new Error("Invariant violation: \"queryRange != null\"");
    }

    const grammar = editor.getGrammar();
    const previewDatatip = (0, _getPreviewDatatipFromDefinitionResult().default)(queryRange[0], result.definitions, this._definitionPreviewProvider, grammar); // $FlowFixMe(>=0.68.0) Flow suppress (T27187857)

    if (previewDatatip != null && previewDatatip.markedStrings) {
      _analytics().default.track('hyperclick-preview-popup', {
        grammar: grammar.name,
        definitionCount: result.definitions.length
      });
    }

    return previewDatatip;
  }

  consumeDefinitionProvider(provider) {
    const disposable = this._providers.addProvider(provider);

    this._disposables.add(disposable);

    return disposable;
  }

  consumeDefinitionPreviewProvider(provider) {
    this._definitionPreviewProvider = provider;
  }

  consumeDatatipService(service) {
    const datatipProvider = {
      providerName: 'hyperclick-preview',
      priority: 1,
      modifierDatatip: (editor, bufferPosition, heldKeys) => this.getPreview(editor, bufferPosition, heldKeys)
    };
    const disposable = service.addModifierProvider(datatipProvider);

    this._disposables.add(disposable);

    return disposable;
  }

  getHyperclickProvider() {
    return {
      priority: 20,
      providerName: 'atom-ide-definitions',
      getSuggestion: (editor, position) => this.getSuggestion(editor, position)
    };
  }

}

function getPlatformKeys(platform) {
  if (platform === 'darwin') {
    return 'hyperclick.darwinTriggerKeys';
  } else if (platform === 'win32') {
    return 'hyperclick.win32TriggerKeys';
  }

  return 'hyperclick.linuxTriggerKeys';
}

(0, _createPackage().default)(module.exports, Activation);