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

import {trackTiming} from 'nuclide-analytics';

class FlowAutocompleteProvider {
  @trackTiming('flow.autocomplete')
  getSuggestions(request: atom$AutocompleteRequest): Promise<atom$AutocompleteSuggestion> {
    var {editor, prefix} = request;
    var file = editor.getPath();
    var contents = editor.getText();
    var cursor = editor.getLastCursor();
    var line = cursor.getBufferRow();
    var col = cursor.getBufferColumn();

    var flowService = require('nuclide-client').getServiceByNuclideUri('FlowService', file);
    invariant(flowService);
    return flowService.getAutocompleteSuggestions(file, contents, line, col, prefix);
  }
}

module.exports = FlowAutocompleteProvider;
