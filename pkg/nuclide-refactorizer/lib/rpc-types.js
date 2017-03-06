/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {TextEdit} from '../../nuclide-textedit/lib/rpc-types';
import type {NuclideUri} from '../../commons-node/nuclideUri';

export type RenameRefactoring = {
  kind: 'rename',
  symbolAtPoint: {
    text: string,
    range: atom$Range,
  },
};

export type FreeformEnumValue = {
  value: string,
  description: string,
};

// Factoring out `description` confuses Flow when filtering on the type.
export type FreeformRefactoringArgument =
  | {
      type: 'string',
      description: string,
      default?: string,
    }
  | {
      type: 'boolean',
      description: string,
      default?: boolean,
    }
  | {
      type: 'enum',
      description: string,
      values: Array<FreeformEnumValue>,
      default?: string,
    };

// A freeform refactoring type.
// This allows providers to define completely new refactoring commands,
// as well as ask for arbitrary arguments to the refactoring command.
export type FreeformRefactoring = {
  kind: 'freeform',
  // Unique identifier which will be used in the request.
  id: string,
  // Display name of the refactoring.
  name: string,
  // User-friendly description of what the refactoring does.
  description: string,
  // Full affected range of the refactoring.
  range: atom$Range,
  // Additional arguments to be requested from the user.
  // The keys should be unique identifiers, which will be used in the request.
  args: Map<string, FreeformRefactoringArgument>,
  // Providers can return disabled refactorings to improve discoverability.
  disabled?: boolean,
};

export type AvailableRefactoring = RenameRefactoring | FreeformRefactoring;

export type RefactorResponse = {
  edits: Map<NuclideUri, Array<TextEdit>>,
};
