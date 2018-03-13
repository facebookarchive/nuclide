/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import type {AtomLanguageService} from '../../nuclide-language-service';
import type {
  LanguageService,
  CodeLensData,
} from '../../nuclide-language-service/lib/LanguageService';
import type {FileVersion} from '../../nuclide-open-files-rpc/lib/rpc-types';

import featureConfig from 'nuclide-commons-atom/feature-config';
import {observeTextEditors} from 'nuclide-commons-atom/text-editor';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {getFileVersionOfEditor} from '../../nuclide-open-files';

const RETRIES = 3;

type ResolveInfo = {
  fileVersion: FileVersion,
  languageService: LanguageService,
  lenses: Array<{
    lens: CodeLensData,
    element: HTMLElement,
    resolved: boolean,
    retries: number,
  }>,
};

const allEditors: Map<atom$TextEditor, ResolveInfo> = new Map();

async function getCodeLens(
  languageService: LanguageService,
  fileVersion: FileVersion,
): Promise<?Array<CodeLensData>> {
  // This method is all about retries and waits, so it needs to await inside a
  // loop. We'd rather not do retries, but until we get some way for LSP servers
  // to differentiate "I can't give an answer right now but will soon" vs "I
  // have no answer full stop" vs "here's an event for when I will have an
  // answer," this is the best we can do.
  for (let i = 0; i < RETRIES; i++) {
    // eslint-disable-next-line no-await-in-loop
    const codeLens: ?Array<CodeLensData> = await languageService.getCodeLens(
      fileVersion,
    );
    if (codeLens != null) {
      return codeLens;
    }

    // eslint-disable-next-line no-await-in-loop
    await new Promise((resolve, reject) => {
      // Standard linear backoff.
      setTimeout(resolve, (i + 1) * 1000);
    });
  }

  return null;
}

function resolveVisible(): void {
  for (const [editor, resolveInfo] of allEditors.entries()) {
    // Currently undocumented, but there's an open PR to add these to the public
    // API: https://github.com/atom/atom/issues/15559
    //  -wipi
    const firstLine = (editor: any).element.getFirstVisibleScreenRow();
    const lastLine = (editor: any).element.getLastVisibleScreenRow() + 1;

    // If this begins to become a performance concern we can sort the list and
    // then do a binary search to find the starting and ending range, but in
    // practice I've observed that it's rare for a file to have more than a few
    // dozen (few hundred for large files) code lenses, and the weight of
    // going over the network and resolving the code lenses is several orders of
    // magnitude more than looping over a small array and doing simple numerical
    // comparisons.
    //  -wipi
    const resolvableLenses = resolveInfo.lenses.filter(
      lensInfo =>
        !lensInfo.resolved &&
        lensInfo.lens.range.start.row >= firstLine &&
        lensInfo.lens.range.start.row <= lastLine,
    );
    resolvableLenses.forEach(async lensInfo => {
      // Set this *before* we get the data so we don't send duplicate
      // requests.
      lensInfo.resolved = true;
      const lens: ?CodeLensData = await resolveInfo.languageService.resolveCodeLens(
        resolveInfo.fileVersion.filePath,
        lensInfo.lens,
      );

      const currentInfo = allEditors.get(editor);
      if (
        currentInfo == null ||
        currentInfo.fileVersion.version !== resolveInfo.fileVersion.version
      ) {
        // This request is stale.
        return;
      }

      if (lens != null && lens.command != null) {
        lensInfo.element.innerHTML = lens.command.title;
      } else if (lensInfo.retries < RETRIES) {
        lensInfo.resolved = false;
        lensInfo.retries++;
      }
    });
  }
}

export function observeForCodeLens(
  atomLanguageService: AtomLanguageService<LanguageService>,
  logger: log4js$Logger,
): IDisposable {
  const disposable = new UniversalDisposable();
  disposable.add(
    observeTextEditors(async editor => {
      const editorDisposable = new UniversalDisposable();
      editorDisposable.add(
        editor.onDidDestroy(() => {
          logger.info(`Destroying ${JSON.stringify(editor.getPath())}`);
          editorDisposable.dispose();
          disposable.remove(editorDisposable);
        }),
      );

      let elementsDisposable;
      const markerLayer = editor.addMarkerLayer();
      const updateCodeLens = async () => {
        const uri = editor.getPath();
        const languageService: ?LanguageService = await atomLanguageService.getLanguageServiceForUri(
          uri,
        );
        if (languageService == null) {
          logger.warn(
            `Could not find language service for ${JSON.stringify(uri)}.`,
          );
          return null;
        }

        const fileVersion = await getFileVersionOfEditor(editor);
        if (fileVersion == null) {
          logger.warn(
            `Could not find file version for ${JSON.stringify(uri)}.`,
          );
          return null;
        }

        const codeLens = await getCodeLens(languageService, fileVersion);
        if (codeLens != null) {
          markerLayer.clear();

          if (elementsDisposable != null) {
            elementsDisposable.dispose();
            editorDisposable.remove(elementsDisposable);
          }

          elementsDisposable = new UniversalDisposable();
          editorDisposable.add(elementsDisposable);

          const lenses = codeLens.map(lens => {
            const marker = markerLayer.markBufferPosition([
              lens.range.start.row,
              lens.range.start.column,
            ]);

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
              item: containingElement,
            });
            element.addEventListener('click', () => {
              if (
                element.innerText != null &&
                featureConfig.get('nuclide-ocaml.codeLensCopy')
              ) {
                atom.clipboard.write(element.innerText);
                const tooltipDispose = atom.tooltips.add(element, {
                  title: 'Copied code lens to clipboard.',
                  placement: 'auto',
                  trigger: 'manual',
                });
                setTimeout(() => tooltipDispose.dispose(), 3000);
              }
            });

            return {lens, element, resolved: false, retries: 0};
          });

          allEditors.set(editor, {
            fileVersion,
            languageService,
            lenses,
          });
        }
      };

      editorDisposable.add(editor.onDidSave(updateCodeLens));
      disposable.add(editorDisposable);
      await updateCodeLens();
    }),
  );

  const resolveVisibleTimeoutID = setInterval(resolveVisible, 1000);
  disposable.add(() => clearInterval(resolveVisibleTimeoutID));
  return disposable;
}
