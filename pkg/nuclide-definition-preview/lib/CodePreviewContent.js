'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideUri} from '../../nuclide-remote-uri';
import type {DefinitionService} from '../../nuclide-definition-service';
import type {EditorPosition} from '../../commons-atom/debounced';

import {Observable} from 'rxjs';
import {observeTextEditorsPositions} from '../../commons-atom/debounced';
import invariant from 'assert';

export type Location = {
  path: NuclideUri;
  position: atom$Point;
};

export type CodePreviewContent = {
  location: Location;
  symbolName: ?string;
  definition: Location;
  grammar: atom$Grammar;
};

async function contentOfEditor(
  definitionService: DefinitionService,
  editorPosition: ?EditorPosition,
): Promise<?CodePreviewContent> {
  if (editorPosition == null) {
    return null;
  }
  const editor = editorPosition.editor;
  const position = editorPosition.position;
  const queryResult = await definitionService.getDefinition(editor, position);
  if (queryResult == null) {
    return null;
  }
  invariant(queryResult.definitions.length > 0);
  const definition = queryResult.definitions[0];

  const path = editor.getPath();
  invariant(path != null);
  return {
    location: {
      path,
      position,
    },
    symbolName: definition.name,
    definition: {
      path: definition.path,
      position: definition.position,
    },
    grammar: editor.getGrammar(),
  };
}

export function getContent(definitionService: DefinitionService): Observable<?CodePreviewContent> {
  return Observable.concat(
    Observable.of(null),
    observeTextEditorsPositions()
      .switchMap(editorPosition => Observable.fromPromise(
        contentOfEditor(definitionService, editorPosition)))
      .filter(content => content != null));
}
