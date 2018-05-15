'use strict';var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));var _log4js;

































function _load_log4js() {return _log4js = require('log4js');}
var _atom = require('atom');var _analytics;

function _load_analytics() {return _analytics = _interopRequireDefault(require('../../../../nuclide-commons/analytics'));}var _createPackage;
function _load_createPackage() {return _createPackage = _interopRequireDefault(require('../../../../nuclide-commons-atom/createPackage'));}var _featureConfig;
function _load_featureConfig() {return _featureConfig = _interopRequireDefault(require('../../../../nuclide-commons-atom/feature-config'));}var _range;
function _load_range() {return _range = require('../../../../nuclide-commons-atom/range');}var _nuclideUri;
function _load_nuclideUri() {return _nuclideUri = _interopRequireDefault(require('../../../../nuclide-commons/nuclideUri'));}var _ProviderRegistry;
function _load_ProviderRegistry() {return _ProviderRegistry = _interopRequireDefault(require('../../../../nuclide-commons-atom/ProviderRegistry'));}var _UniversalDisposable;
function _load_UniversalDisposable() {return _UniversalDisposable = _interopRequireDefault(require('../../../../nuclide-commons/UniversalDisposable'));}var _goToLocation;
function _load_goToLocation() {return _goToLocation = require('../../../../nuclide-commons-atom/go-to-location');}var _DefinitionCache;

function _load_DefinitionCache() {return _DefinitionCache = _interopRequireDefault(require('./DefinitionCache'));}var _getPreviewDatatipFromDefinitionResult;
function _load_getPreviewDatatipFromDefinitionResult() {return _getPreviewDatatipFromDefinitionResult = _interopRequireDefault(require('./getPreviewDatatipFromDefinitionResult'));}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };} /**
                                                                                                                                                                                                                                                                                   * Copyright (c) 2017-present, Facebook, Inc.
                                                                                                                                                                                                                                                                                   * All rights reserved.
                                                                                                                                                                                                                                                                                   *
                                                                                                                                                                                                                                                                                   * This source code is licensed under the BSD-style license found in the
                                                                                                                                                                                                                                                                                   * LICENSE file in the root directory of this source tree. An additional grant
                                                                                                                                                                                                                                                                                   * of patent rights can be found in the PATENTS file in the same directory.
                                                                                                                                                                                                                                                                                   *
                                                                                                                                                                                                                                                                                   * 
                                                                                                                                                                                                                                                                                   * @format
                                                                                                                                                                                                                                                                                   */ // This package provides Hyperclick results for any language which provides a
// DefinitionProvider.
class Activation {constructor() {this._providers = new (_ProviderRegistry || _load_ProviderRegistry()).default();this._definitionCache = new (_DefinitionCache || _load_DefinitionCache()).default();this._triggerKeys = new Set();

    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(
    (_featureConfig || _load_featureConfig()).default.observe(
    getPlatformKeys(process.platform),
    newValue => {
      this._triggerKeys = new Set(
      // flowlint-next-line sketchy-null-string:off
      newValue ? newValue.split(',') : null);

    }));


  }

  dispose() {
    this._disposables.dispose();
  }

  _getDefinition(
  editor,
  position)
  {var _this = this;return (0, _asyncToGenerator.default)(function* () {
      for (const provider of _this._providers.getAllProvidersForEditor(editor)) {
        try {
          // eslint-disable-next-line no-await-in-loop
          const result = yield provider.getDefinition(editor, position);
          if (result != null) {
            if (result.queryRange == null) {
              const match = (0, (_range || _load_range()).wordAtPosition)(editor, position, {
                includeNonWordCharacters: false });

              result.queryRange = [
              match != null ? match.range : new _atom.Range(position, position)];

            }
            return result;
          }
        } catch (err) {
          (0, (_log4js || _load_log4js()).getLogger)('atom-ide-definitions').error(
          `Error getting definition for ${String(editor.getPath())}`,
          err);

        }
      }
      return null;})();
  }

  getSuggestion(
  editor,
  position)
  {var _this2 = this;return (0, _asyncToGenerator.default)(function* () {
      const result = yield _this2._definitionCache.get(editor, position, function () {return (
          _this2._getDefinition(editor, position));});


      if (result == null) {
        return null;
      }

      const { queryRange, definitions } = result;if (!(
      definitions.length > 0)) {throw new Error('Invariant violation: "definitions.length > 0"');}
      // queryRange might be null coming out of the provider, but the output
      // of _getDefinition has ensured it's not null.
      if (!(queryRange != null)) {throw new Error('Invariant violation: "queryRange != null"');}

      function createCallback(definition) {
        return () => {
          (0, (_goToLocation || _load_goToLocation()).goToLocation)(definition.path, {
            line: definition.position.row,
            column: definition.position.column });

          (_analytics || _load_analytics()).default.track('go-to-definition', {
            path: definition.path,
            line: definition.position.row,
            column: definition.position.column,
            from: editor.getPath() });

        };
      }

      function createTitle(definition) {
        const filePath =
        definition.projectRoot == null ?
        definition.path :
        (_nuclideUri || _load_nuclideUri()).default.relative(definition.projectRoot, definition.path);
        if (definition.name == null) {
          // Fall back to just displaying the path:line.
          return `${filePath}:${definition.position.row + 1}`;
        }
        return `${definition.name} (${filePath})`;
      }

      if (definitions.length === 1) {
        return {
          range: queryRange,
          callback: createCallback(definitions[0]) };

      } else {
        return {
          range: queryRange,
          callback: definitions.map(function (definition) {
            return {
              title: createTitle(definition),
              callback: createCallback(definition) };

          }) };

      }})();
  }

  getPreview(
  editor,
  position,
  heldKeys)
  {var _this3 = this;return (0, _asyncToGenerator.default)(function* () {
      if (
      !_this3._triggerKeys ||
      // are the required keys held down?
      !Array.from(_this3._triggerKeys).every(function (key) {return heldKeys.has(key);}))
      {
        return;
      }

      const result = yield _this3._getDefinition(editor, position);
      if (result == null) {
        return null;
      }
      const queryRange = result.queryRange;
      // queryRange might be null coming out of the provider, but the output
      // of _getDefinition has ensured it's not null.
      if (!(queryRange != null)) {throw new Error('Invariant violation: "queryRange != null"');}

      const grammar = editor.getGrammar();
      const previewDatatip = (0, (_getPreviewDatatipFromDefinitionResult || _load_getPreviewDatatipFromDefinitionResult()).default)(
      queryRange[0],
      result.definitions,
      _this3._definitionPreviewProvider,
      grammar);


      // $FlowFixMe(>=0.68.0) Flow suppress (T27187857)
      if (previewDatatip != null && previewDatatip.markedStrings) {
        (_analytics || _load_analytics()).default.track('hyperclick-preview-popup', {
          grammar: grammar.name,
          definitionCount: result.definitions.length });

      }

      return previewDatatip;})();
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
      modifierDatatip: (
      editor,
      bufferPosition,
      heldKeys) =>
      this.getPreview(editor, bufferPosition, heldKeys) };


    const disposable = service.addModifierProvider(datatipProvider);
    this._disposables.add(disposable);
    return disposable;
  }

  getHyperclickProvider() {
    return {
      priority: 20,
      providerName: 'atom-ide-definitions',
      getSuggestion: (editor, position) => this.getSuggestion(editor, position) };

  }}


function getPlatformKeys(platform) {
  if (platform === 'darwin') {
    return 'hyperclick.darwinTriggerKeys';
  } else if (platform === 'win32') {
    return 'hyperclick.win32TriggerKeys';
  }
  return 'hyperclick.linuxTriggerKeys';
}

(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);