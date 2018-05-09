'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));let getCodeLens = (() => {var _ref = (0, _asyncToGenerator.default)(








































  function* (
  languageService,
  fileVersion)
  {
    // This method is all about retries and waits, so it needs to await inside a
    // loop. We'd rather not do retries, but until we get some way for LSP servers
    // to differentiate "I can't give an answer right now but will soon" vs "I
    // have no answer full stop" vs "here's an event for when I will have an
    // answer," this is the best we can do.
    for (let i = 0; i < RETRIES; i++) {
      // eslint-disable-next-line no-await-in-loop
      const codeLens = yield languageService.getCodeLens(
      fileVersion);

      if (codeLens != null) {
        // sort code lenses based on their row numbers from top to bottom, so
        // later their resolution can start in the same order.
        return codeLens.sort(function (lens1, lens2) {
          return lens1.range.start.row - lens2.range.start.row;
        });
      }

      // eslint-disable-next-line no-await-in-loop
      yield new Promise(function (resolve, reject) {
        // Standard linear backoff.
        setTimeout(resolve, (i + 1) * 1000);
      });
    }

    return null;
  });return function getCodeLens(_x, _x2) {return _ref.apply(this, arguments);};})();exports.





















































observeForCodeLens = observeForCodeLens;var _featureConfig;function _load_featureConfig() {return _featureConfig = _interopRequireDefault(require('nuclide-commons-atom/feature-config'));}var _promise;function _load_promise() {return _promise = require('nuclide-commons/promise');}var _UniversalDisposable;function _load_UniversalDisposable() {return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));}var _nuclideOpenFiles;function _load_nuclideOpenFiles() {return _nuclideOpenFiles = require('../../nuclide-open-files');}var _dompurify;function _load_dompurify() {return _dompurify = _interopRequireDefault(require('dompurify'));}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };} /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  * Copyright (c) 2015-present, Facebook, Inc.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  * All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  * This source code is licensed under the license found in the LICENSE file in
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  * the root directory of this source tree.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  * 
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  * @format
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  */const domPurify = (0, (_dompurify || _load_dompurify()).default)();const RETRIES = 3;const allEditors = new Map();function resolveVisible() {for (const [editor, resolveInfo] of allEditors.entries()) {// Currently undocumented, but there's an open PR to add these to the public
    // API: https://github.com/atom/atom/issues/15559
    //  -wipi
    const firstLine = editor.element.getFirstVisibleScreenRow();const lastLine = editor.element.getLastVisibleScreenRow() + 1; // If this begins to become a performance concern we can sort the list and
    // then do a binary search to find the starting and ending range, but in
    // practice I've observed that it's rare for a file to have more than a few
    // dozen (few hundred for large files) code lenses, and the weight of
    // going over the network and resolving the code lenses is several orders of
    // magnitude more than looping over a small array and doing simple numerical
    // comparisons.
    //  -wipi
    const resolvableLenses = resolveInfo.lenses.filter(lensInfo => !lensInfo.resolved && lensInfo.lens.range.start.row >= firstLine && lensInfo.lens.range.start.row <= lastLine);resolvableLenses.forEach((() => {var _ref2 = (0, _asyncToGenerator.default)(function* (lensInfo) {// Set this *before* we get the data so we don't send duplicate
        // requests.
        lensInfo.resolved = true;const lens = yield resolveInfo.languageService.resolveCodeLens(resolveInfo.fileVersion.filePath, lensInfo.lens);const currentInfo = allEditors.get(editor);if (currentInfo == null || currentInfo.fileVersion.version !== resolveInfo.fileVersion.version) {// This request is stale.
          return;}if (lens != null && lens.command != null) {lensInfo.element.innerHTML = domPurify.sanitize(lens.command.title, { ALLOWED_TAGS: [] });} else if (lensInfo.retries < RETRIES) {lensInfo.resolved = false;lensInfo.retries++;}});return function (_x3) {return _ref2.apply(this, arguments);};})());}}function observeForCodeLens(atomLanguageService, logger) {const disposable = new (_UniversalDisposable || _load_UniversalDisposable()).default();disposable.add(atom.workspace.observeTextEditors((() => {var _ref3 = (0, _asyncToGenerator.default)(function* (editor) {let isFirstUpdate = true;const editorDisposable = new (_UniversalDisposable || _load_UniversalDisposable()).default();editorDisposable.add(editor.onDidDestroy(function () {logger.info(`Destroying ${JSON.stringify(editor.getPath())}`);editorDisposable.dispose();disposable.remove(editorDisposable);}));let elementsDisposable;const markerLayer = editor.addMarkerLayer();const updateCodeLens = (() => {var _ref4 = (0, _asyncToGenerator.default)(function* () {const uri = editor.getPath();const languageService = yield atomLanguageService.getLanguageServiceForUri(uri);
          if (languageService == null) {
            logger.warn(
            `Could not find language service for ${JSON.stringify(uri)}.`);

            return null;
          }

          const fileVersion = yield (0, (_nuclideOpenFiles || _load_nuclideOpenFiles()).getFileVersionOfEditor)(editor);
          if (fileVersion == null) {
            logger.warn(
            `Could not find file version for ${JSON.stringify(uri)}.`);

            return null;
          }

          const codeLens = yield getCodeLens(languageService, fileVersion);
          if (codeLens != null) {
            markerLayer.clear();

            if (elementsDisposable != null) {
              elementsDisposable.dispose();
              editorDisposable.remove(elementsDisposable);
            }

            elementsDisposable = new (_UniversalDisposable || _load_UniversalDisposable()).default();
            editorDisposable.add(elementsDisposable);

            const lenses = codeLens.map(function (lens) {
              const marker = markerLayer.markBufferPosition([
              lens.range.start.row,
              lens.range.start.column]);


              const element = document.createElement('span');
              element.classList.add('code-lens-content');

              // Put in a nonbreaking space to reserve the space in the editor. If
              // the space is already reserved, Atom won't have to scroll the
              // editor down as we resolve code lenses.
              element.innerHTML = '\xa0';

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
                item: containingElement });

              element.addEventListener('click', function () {
                if (
                element.innerText != null &&
                (_featureConfig || _load_featureConfig()).default.get('nuclide-ocaml.codeLensCopy'))
                {
                  atom.clipboard.write(element.innerText);
                  const tooltipDispose = atom.tooltips.add(element, {
                    title: 'Copied code lens to clipboard.',
                    placement: 'auto',
                    trigger: 'manual' });

                  setTimeout(function () {return tooltipDispose.dispose();}, 3000);
                }
              });

              return { lens, element, resolved: false, retries: 0 };
            });

            allEditors.set(editor, {
              fileVersion,
              languageService,
              lenses });


            if (isFirstUpdate) {
              yield (0, (_promise || _load_promise()).nextTick)();
              isFirstUpdate = false;
              editor.scrollToCursorPosition({ center: true });
            }
          }
        });return function updateCodeLens() {return _ref4.apply(this, arguments);};})();

      editorDisposable.add(editor.onDidSave(updateCodeLens));
      disposable.add(editorDisposable);
      yield updateCodeLens();
    });return function (_x4) {return _ref3.apply(this, arguments);};})()));


  const resolveVisibleTimeoutID = setInterval(resolveVisible, 1000);
  disposable.add(() => clearInterval(resolveVisibleTimeoutID));
  return disposable;
}