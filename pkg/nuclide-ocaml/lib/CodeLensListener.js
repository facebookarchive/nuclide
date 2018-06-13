'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.observeForCodeLens = observeForCodeLens;

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('../../../modules/nuclide-commons-atom/feature-config'));
}

var _textEditor;

function _load_textEditor() {
  return _textEditor = require('../../../modules/nuclide-commons-atom/text-editor');
}

var _event;

function _load_event() {
  return _event = require('../../../modules/nuclide-commons/event');
}

var _observable;

function _load_observable() {
  return _observable = require('../../../modules/nuclide-commons/observable');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../../modules/nuclide-commons/UniversalDisposable'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _nuclideOpenFiles;

function _load_nuclideOpenFiles() {
  return _nuclideOpenFiles = require('../../nuclide-open-files');
}

var _dompurify;

function _load_dompurify() {
  return _dompurify = _interopRequireDefault(require('dompurify'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const domPurify = (0, (_dompurify || _load_dompurify()).default)(); /**
                                                                     * Copyright (c) 2015-present, Facebook, Inc.
                                                                     * All rights reserved.
                                                                     *
                                                                     * This source code is licensed under the license found in the LICENSE file in
                                                                     * the root directory of this source tree.
                                                                     *
                                                                     * 
                                                                     * @format
                                                                     */

const RETRIES = 3;

function makeResolvableLens(editor, markerLayer, lens) {
  const marker = markerLayer.markBufferPosition(lens.range.start);
  const element = document.createElement('span');

  element.classList.add('code-lens-content');

  // Put in a nonbreaking space to reserve the space in the editor. If
  // the space is already reserved, Atom won't have to scroll the
  // editor down as we resolve code lenses.
  element.innerHTML = '\xa0';
  const listener = () => {
    if (element.innerText != null && (_featureConfig || _load_featureConfig()).default.get('nuclide-ocaml.codeLensCopy')) {
      atom.clipboard.write(element.innerText);
      const tooltipDispose = atom.tooltips.add(element, {
        title: 'Copied code lens to clipboard.',
        placement: 'auto',
        trigger: 'manual'
      });
      setTimeout(() => tooltipDispose.dispose(), 3000);
    }
  };
  element.addEventListener('click', listener);
  marker.onDidDestroy(() => element.removeEventListener('click', listener));

  const leadingWhitespace = document.createElement('span');
  leadingWhitespace.innerText = ' '.repeat(lens.range.start.column);

  // We do a span inside a div so that the tooltip and clickable area
  // only cover the part of the code lens that has text, but the
  // code-lens style will be applied to the entire editor row.
  const containingElement = document.createElement('div');
  containingElement.classList.add('code-lens');
  containingElement.appendChild(leadingWhitespace);
  containingElement.appendChild(element);

  editor.decorateMarker(marker, {
    type: 'block',
    position: 'before',
    item: containingElement
  });

  return { lens, element, marker, resolved: false, retries: 0 };
}

function getCodeLensPositions(atomLanguageService, logger, editor) {
  const uri = editor.getPath();
  return _rxjsBundlesRxMinJs.Observable.defer(() => atomLanguageService.getLanguageServiceForUri(uri)).switchMap(languageService => {
    if (languageService == null) {
      return _rxjsBundlesRxMinJs.Observable.of(null);
    }
    return _rxjsBundlesRxMinJs.Observable.defer(() => (0, (_nuclideOpenFiles || _load_nuclideOpenFiles()).getFileVersionOfEditor)(editor)).switchMap(fileVersion => {
      if (fileVersion == null) {
        return _rxjsBundlesRxMinJs.Observable.of(null);
      }
      return _rxjsBundlesRxMinJs.Observable.defer(async () => {
        const codeLens = await languageService.getCodeLens(fileVersion);
        if (codeLens == null) {
          throw new Error('Could not retrieve code lenses.');
        }
        return { languageService, fileVersion, codeLens };
      }).retryWhen(errs => errs.zip(_rxjsBundlesRxMinJs.Observable.range(1, RETRIES)).flatMap((_, retryCount) => {
        return _rxjsBundlesRxMinJs.Observable.timer(retryCount * 1000);
      })).defaultIfEmpty(null);
    });
  });
}

function markCodeLensPositions(languageService, editor, markerLayer, fileVersion, codeLens) {
  // Sort code lenses based on their row numbers from top to bottom, so
  // later their resolution can start in the same order.
  return {
    editor,
    fileVersion,
    languageService,
    lenses: codeLens.sort((lens1, lens2) => lens1.range.start.row - lens2.range.start.row).map(lens => makeResolvableLens(editor, markerLayer, lens))
  };
}

function resolveVisible(resolveInfo) {
  const editor = resolveInfo.editor;

  // Currently undocumented, but there's an open PR to add these to the public
  // API: https://github.com/atom/atom/issues/15559
  const firstLine = editor.element.getFirstVisibleScreenRow();
  const lastLine = editor.element.getLastVisibleScreenRow() + 1;

  const firstBufferLine = editor.bufferRowForScreenRow(firstLine);
  const lastBufferLine = editor.bufferRowForScreenRow(lastLine);

  // If this begins to become a performance concern we can sort the list and
  // then do a binary search to find the starting and ending range, but in
  // practice I've observed that it's rare for a file to have more than a few
  // dozen (few hundred for large files) code lenses, and the weight of
  // going over the network and resolving the code lenses is several orders of
  // magnitude more than looping over a small array and doing simple numerical
  // comparisons.
  const resolvableLenses = resolveInfo.lenses.filter(lensInfo => lensInfo.lens.range.start.row >= firstBufferLine && lensInfo.lens.range.start.row <= lastBufferLine);

  return _rxjsBundlesRxMinJs.Observable.from(resolvableLenses).mergeMap(lensInfo => {
    const isFolded = () => editor.isFoldedAtBufferRow(lensInfo.lens.range.start.row);
    return _rxjsBundlesRxMinJs.Observable.defer(() => {
      if (lensInfo.resolved || isFolded()) {
        return Promise.resolve(lensInfo.lens);
      }

      // Set this *before* we get the data so we don't send duplicate requests.
      lensInfo.resolved = true;
      return resolveInfo.languageService.resolveCodeLens(resolveInfo.fileVersion.filePath, lensInfo.lens);
    }).do(lens => {
      lensInfo.element.classList.toggle('folded', isFolded());

      if (!lensInfo.resolved) {
        // We skipped this one because it was folded.
        return;
      }

      if (lens != null && lens.command != null) {
        const text = domPurify.sanitize(lens.command.title, {
          ALLOWED_TAGS: []
        });
        lensInfo.element.innerHTML = text;
      } else if (lensInfo.retries < RETRIES) {
        lensInfo.resolved = false;
        lensInfo.retries++;
      }
    });
  });
}

function observeForCodeLens(atomLanguageService, logger) {
  return new (_UniversalDisposable || _load_UniversalDisposable()).default((0, (_event || _load_event()).observableFromSubscribeFunction)(atom.workspace.observeTextEditors.bind(atom.workspace))
  // If the editor is already open when the user launches Atom, then *two*
  // events will be fired from observeTextEditors, so group by the editor ID
  // and then only take the first in order to avoid the second event.
  // The cause for this is:
  //  1. Atom loads the text editor and adds it to the registry
  //  2. Atom loads the grammar and then loads the OCaml package (because it
  //     only activates when an OCaml file is opened). At this point it's
  //     able to get the list of editors, and it fires observeTextEditors.
  //  3. did-add-text-editor is fired, causing the duplicated event.
  // TODO(wipi): remove once https://github.com/atom/atom/pull/17299 is
  // released.
  .distinct(editor => editor.id).mergeMap(editor => {
    const markerLayer = editor.addMarkerLayer();
    return (0, (_event || _load_event()).observableFromSubscribeFunction)(editor.onDidSave.bind(editor))
    // Add an additional event into the stream so that we don't need to
    // save the file in order to get the first set of code lenses.
    .startWith(null).switchMap(evt => getCodeLensPositions(atomLanguageService, logger, editor)).do(() => markerLayer.clear()).filter(Boolean).map(positions => markCodeLensPositions(positions.languageService, editor, markerLayer, positions.fileVersion, positions.codeLens)).switchMap((resolveInfo, iteration) => _rxjsBundlesRxMinJs.Observable.merge(iteration === 0 ? (_observable || _load_observable()).microtask.do(() => {
      editor.scrollToCursorPosition({ center: true });
    }) : _rxjsBundlesRxMinJs.Observable.empty(), _rxjsBundlesRxMinJs.Observable.timer(0, 1000).concatMap(() => resolveVisible(resolveInfo)))).takeUntil((0, (_textEditor || _load_textEditor()).observeEditorDestroy)(editor));
  }).subscribe());
}