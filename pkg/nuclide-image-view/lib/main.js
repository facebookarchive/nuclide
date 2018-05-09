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

import disablePackage from '../../commons-atom/disablePackage';
import createPackage from 'nuclide-commons-atom/createPackage';
import nuclideUri from 'nuclide-commons/nuclideUri';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import ImageEditor from './ImageEditor';

class Activation {
  _disposables: IDisposable;

  constructor(state: ?mixed) {
    this._disposables = new UniversalDisposable(
      atom.workspace.addOpener(openUri),
      // If you enable this package, we need to disable image-view.
      disablePackage('image-view'),
    );
  }

  deserializeImageEditor(state): ImageEditor {
    return new ImageEditor(state.filePath);
  }

  dispose(): void {
    this._disposables.dispose();
  }
}

createPackage(module.exports, Activation);

const imageExtensions = new Set([
  '.bmp',
  '.gif',
  '.ico',
  '.jpeg',
  '.jpg',
  '.png',
  '.webp',
]);
function openUri(uri: string): ?ImageEditor {
  const ext = nuclideUri.extname(uri).toLowerCase();
  return imageExtensions.has(ext) ? new ImageEditor(uri) : null;
}
