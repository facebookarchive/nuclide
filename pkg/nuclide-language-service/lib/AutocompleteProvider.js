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

import type {AutocompleteCacherConfig} from '../../commons-atom/AutocompleteCacher';

import type {
  AutocompleteResult,
  Completion,
  LanguageService,
} from './LanguageService';

import {Point, Range} from 'simple-text-buffer';
import {wordAtPosition} from 'nuclide-commons-atom/range';
import {ConnectionCache} from '../../nuclide-remote-connection';
import {trackTiming, track} from '../../nuclide-analytics';
import {getFileVersionOfEditor} from '../../nuclide-open-files';
import AutocompleteCacher from '../../commons-atom/AutocompleteCacher';

export type OnDidInsertSuggestionArgument = {
  editor: atom$TextEditor,
  triggerPosition: atom$Point,
  suggestion: Completion,
};

export type OnDidInsertSuggestionCallback = (
  arg: OnDidInsertSuggestionArgument,
) => mixed;

export type AutocompleteConfig = {|
  inclusionPriority: number,
  suggestionPriority: number,
  disableForSelector: ?string,
  excludeLowerPriority: boolean,
  version: '2.0.0',
  analyticsEventName: string,
  onDidInsertSuggestionAnalyticsEventName: string,
  autocompleteCacherConfig: ?AutocompleteCacherConfig<AutocompleteResult>,
|};

export class AutocompleteProvider<T: LanguageService> {
  name: string;
  selector: string;
  inclusionPriority: number;
  suggestionPriority: number;
  disableForSelector: ?string;
  excludeLowerPriority: boolean;
  _onDidInsertSuggestion: ?OnDidInsertSuggestionCallback;
  onDidInsertSuggestion: OnDidInsertSuggestionCallback;
  _analyticsEventName: string;
  _connectionToLanguageService: ConnectionCache<T>;
  _autocompleteCacher: ?AutocompleteCacher<AutocompleteResult>;

  constructor(
    name: string,
    selector: string,
    inclusionPriority: number,
    suggestionPriority: number,
    disableForSelector: ?string,
    excludeLowerPriority: boolean,
    analyticsEventName: string,
    onDidInsertSuggestion: ?OnDidInsertSuggestionCallback,
    onDidInsertSuggestionAnalyticsEventName: string,
    autocompleteCacherConfig: ?AutocompleteCacherConfig<AutocompleteResult>,
    connectionToLanguageService: ConnectionCache<T>,
  ) {
    this.name = name;
    this.selector = selector;
    this.inclusionPriority = inclusionPriority;
    this.suggestionPriority = suggestionPriority;
    this.disableForSelector = disableForSelector;
    this.excludeLowerPriority = excludeLowerPriority;
    this._analyticsEventName = analyticsEventName;
    this._connectionToLanguageService = connectionToLanguageService;

    if (autocompleteCacherConfig != null) {
      this._autocompleteCacher = new AutocompleteCacher(
        request => this._getSuggestionsFromLanguageService(request),
        autocompleteCacherConfig,
      );
    }

    this._onDidInsertSuggestion = onDidInsertSuggestion;

    this.onDidInsertSuggestion = arg => {
      track(onDidInsertSuggestionAnalyticsEventName);
      if (this._onDidInsertSuggestion != null) {
        this._onDidInsertSuggestion(arg);
      }
    };
  }

  static register(
    name: string,
    grammars: Array<string>,
    config: AutocompleteConfig,
    onDidInsertSuggestion: ?OnDidInsertSuggestionCallback,
    connectionToLanguageService: ConnectionCache<T>,
  ): IDisposable {
    return atom.packages.serviceHub.provide(
      'autocomplete.provider',
      config.version,
      new AutocompleteProvider(
        name,
        grammars.map(grammar => '.' + grammar).join(', '),
        config.inclusionPriority,
        config.suggestionPriority,
        config.disableForSelector,
        config.excludeLowerPriority,
        config.analyticsEventName,
        onDidInsertSuggestion,
        config.onDidInsertSuggestionAnalyticsEventName,
        config.autocompleteCacherConfig,
        connectionToLanguageService,
      ),
    );
  }

  getSuggestions(
    request: atom$AutocompleteRequest,
  ): Promise<?Array<Completion>> {
    return trackTiming(this._analyticsEventName, async () => {
      let result;
      if (this._autocompleteCacher != null) {
        result = await this._autocompleteCacher.getSuggestions(request);
      } else {
        result = await this._getSuggestionsFromLanguageService(request);
      }
      return result != null ? result.items : null;
    });
  }

  async _getSuggestionsFromLanguageService(
    request: atom$AutocompleteRequest,
  ): Promise<?AutocompleteResult> {
    const {editor, activatedManually, prefix} = request;
    const position = editor.getLastCursor().getBufferPosition();

    // 'prefix' has to do with what's replaced when the user accepts an
    // autocomplete suggestion. It's based on the current word. For instance,
    //  '$c|'      => suggestion '$compare'  => hopefully replace '$c'
    //  'Vec\com|' => suggestion 'compare'   => hopefully replace 'com'
    // The way autocomplete works is: the language service might say what prefix
    // its suggestion will replace; and if it doesn't, then autocomplete will
    // replace whatever prefix was part of the 'request' object.
    //
    // Atom has its own way of computing the current word (to support gestures
    // like cursor-past-word). It bases this on 'editor.nonWordCharacters', by
    // default roughly [a-zA-Z0-9_]. But language packages can and do override
    // this -- e.g. PHP allows '$' in identifiers.
    //
    // Autocomplete doesn't use Atom's technique (I suspect because the html and
    // css and xml packages never bothered overriding it). Instead autocomplete
    // has its own regex, roughly the same but allowing '-' as well. It uses
    // this to populate 'prefix'.
    //
    // Autocomplete's suggestion is wrong for languages like PHP which have
    // their own regex, is right for languages like HTML which should but don't,
    // and is wrong for languages like Java which don't provide their own
    // regex and which don't allow hyphens.
    //
    // What we'll do is work around this mess right here as best we can:
    // if the language-package provides its own regex which gives a different
    // prefix from Autocomplete's, then we'll suggest that to the language
    // service, and we'll patch the output of the language service to reflect
    // this.

    let langSpecificPrefix = prefix;
    const defaultWordRules = editor.getNonWordCharacters();
    const scope = editor.scopeDescriptorForBufferPosition(position);
    const langWordRules = editor.getNonWordCharacters(scope); // {scope} ?
    if (defaultWordRules !== langWordRules) {
      langSpecificPrefix = findAtomWordPrefix(editor, position);
    }

    const path = editor.getPath();
    const fileVersion = await getFileVersionOfEditor(editor);

    const languageService = this._connectionToLanguageService.getForUri(path);
    if (languageService == null || fileVersion == null) {
      return {isIncomplete: false, items: []};
    }

    const results = await (await languageService).getAutocompleteSuggestions(
      fileVersion,
      position,
      activatedManually == null ? false : activatedManually,
      langSpecificPrefix,
    );

    // Here's where we patch up the prefix in the results, if necessary
    if (langSpecificPrefix !== prefix && results != null) {
      results.items = results.items.map((c: Completion) => {
        return c.replacementPrefix == null
          ? {replacementPrefix: langSpecificPrefix, ...c}
          : c;
      });
    }
    return results;
  }
}

function findAtomWordPrefix(
  editor: atom$TextEditor,
  position: atom$Point,
): string {
  const positionOneCharBefore = new Point(
    position.row,
    Math.max(0, position.column - 1),
  );
  const match = wordAtPosition(editor, positionOneCharBefore, {
    includeNonWordCharacters: false,
  });
  if (match == null) {
    return '';
  } else {
    return editor.getTextInBufferRange(new Range(match.range.start, position));
  }
}
