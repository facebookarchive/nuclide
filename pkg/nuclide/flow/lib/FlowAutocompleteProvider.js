'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import invariant from 'assert';

import {trackTiming} from '../../analytics';

import {getFlowServiceByNuclideUri} from './FlowServiceFactory';

class FlowAutocompleteProvider {
  @trackTiming('flow.autocomplete')
  getSuggestions(request: atom$AutocompleteRequest): Promise<?Array<atom$AutocompleteSuggestion>> {
    const {editor, prefix, activatedManually} = request;
    const filePath = editor.getPath();
    const contents = editor.getText();
    const cursor = editor.getLastCursor();
    const line = cursor.getBufferRow();
    const col = cursor.getBufferColumn();

    if (filePath == null) {
      return Promise.resolve(null);
    }

    const flowService = getFlowServiceByNuclideUri(filePath);
    invariant(flowService);
    return flowService.flowGetAutocompleteSuggestions(
      filePath,
      contents,
      line,
      col,
      prefix,
      // Needs to be a boolean, but autocomplete-plus gives us undefined instead of false.
      !!activatedManually,
    );
  }
}

module.exports = FlowAutocompleteProvider;
