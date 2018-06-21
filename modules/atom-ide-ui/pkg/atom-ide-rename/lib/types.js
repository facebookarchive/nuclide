/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow strict-local
 * @format
 */
import type {TextEdit} from 'nuclide-commons-atom/text-edit';
import type {NuclideUri} from 'nuclide-commons/nuclideUri';

export type RenameProvider = {
  // If there are multiple providers for a given grammar,
  // the one with the highest priority will be used.
  priority: number,
  grammarScopes: Array<string>,

  // Obtains a mapping of document paths to their text edits.
  //  Each text edit is a rename of the same subject
  rename: (
    editor: TextEditor,
    position: atom$Point,
    newName: string,
  ) => Promise<?Map<NuclideUri, Array<TextEdit>>>,
};
