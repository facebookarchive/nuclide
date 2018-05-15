'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.default =



















installTextEditorStyles;var _UniversalDisposable;function _load_UniversalDisposable() {return _UniversalDisposable = _interopRequireDefault(require('../../../../../nuclide-commons/UniversalDisposable'));}var _event;function _load_event() {return _event = require('../../../../../nuclide-commons/event');}var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');var _semver;function _load_semver() {return _semver = _interopRequireDefault(require('semver'));}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };} /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * Copyright (c) 2017-present, Facebook, Inc.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * This source code is licensed under the BSD-style license found in the
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * LICENSE file in the root directory of this source tree. An additional grant
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * of patent rights can be found in the PATENTS file in the same directory.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * 
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @format
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            */const DEFAULT_FONT_STACK = "Menlo, Consolas, 'DejaVu Sans Mono', monospace";function installTextEditorStyles() {if ((_semver || _load_semver()).default.gte(atom.appVersion, '1.26.0')) {// this behavior is part of 1.26 and greater
    return new (_UniversalDisposable || _load_UniversalDisposable()).default();}let styleSheetDisposable = new (_UniversalDisposable || _load_UniversalDisposable()).default();return new (_UniversalDisposable || _load_UniversalDisposable()).default(() => styleSheetDisposable.dispose(), _rxjsBundlesRxMinJs.Observable.combineLatest((0, (_event || _load_event()).observableFromSubscribeFunction)(
  atom.config.observe.bind(atom.config, 'editor.fontSize')),

  (0, (_event || _load_event()).observableFromSubscribeFunction)(
  atom.config.observe.bind(atom.config, 'editor.fontFamily')),

  (0, (_event || _load_event()).observableFromSubscribeFunction)(
  atom.config.observe.bind(atom.config, 'editor.lineHeight'))).

  subscribe(([fontSize, fontFamily, lineHeight]) => {if (!(

    typeof fontSize === 'number' &&
    typeof fontFamily === 'string' &&
    typeof lineHeight === 'number')) {throw new Error('Invariant violation: "typeof fontSize === \'number\' &&\\n          typeof fontFamily === \'string\' &&\\n          typeof lineHeight === \'number\'"');}


    const styleSheetSource = `
        atom-workspace {
          --editor-font-size: ${fontSize}px;
          --editor-font-family: ${fontFamily || DEFAULT_FONT_STACK};
          --editor-line-height: ${lineHeight};
        }
      `;

    styleSheetDisposable.dispose();
    // $FlowIgnore
    styleSheetDisposable = atom.workspace.styleManager.addStyleSheet(
    styleSheetSource,
    {
      sourcePath: 'text-editor-styles-backport',
      priority: -1 });


  }));

}