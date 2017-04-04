/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {NuclideEvaluationExpression} from '../../nuclide-debugger-interfaces/rpc-types';
import type {LanguageService} from './LanguageService';

import {trackTiming} from '../../nuclide-analytics';
import {ConnectionCache} from '../../nuclide-remote-connection';
import {getFileVersionOfEditor} from '../../nuclide-open-files';
import {wordAtPosition} from '../../commons-atom/range';

export type EvaluationExpressionConfig = {|
  version: '0.0.0',
  analyticsEventName: string,
  regexp?: RegExp,
|};

export class EvaluationExpressionProvider<T: LanguageService> {
  selector: string;
  name: string;
  _analyticsEventName: string;
  _regexp: ?RegExp;
  _connectionToLanguageService: ConnectionCache<T>;

  constructor(
    name: string,
    selector: string,
    analyticsEventName: string,
    regexp: ?RegExp,
    connectionToLanguageService: ConnectionCache<T>,
  ) {
    this.name = name;
    this.selector = selector;
    this._analyticsEventName = analyticsEventName;
    this._regexp = regexp;
    this._connectionToLanguageService = connectionToLanguageService;
  }

  static register(
    name: string,
    selector: string,
    config: EvaluationExpressionConfig,
    connectionToLanguageService: ConnectionCache<T>,
  ): IDisposable {
    return atom.packages.serviceHub.provide(
      'nuclide-evaluation-expression.provider',
      config.version,
      new EvaluationExpressionProvider(
        name,
        selector,
        config.analyticsEventName,
        config.regexp == null ? null : config.regexp, // turn string|void into string|null
        connectionToLanguageService,
      ));
  }

  getEvaluationExpression(
    editor: atom$TextEditor,
    position: atom$Point,
  ): Promise<?NuclideEvaluationExpression> {
    return trackTiming(this._analyticsEventName, async () => {
      if (this._regexp != null) {
        return getEvaluationExpressionFromRegexp(editor, position, this._regexp);
      }

      const fileVersion = await getFileVersionOfEditor(editor);
      const languageService = this._connectionToLanguageService.getForUri(editor.getPath());
      if (languageService == null || fileVersion == null) {
        return null;
      }

      return (await languageService).getEvaluationExpression(
        fileVersion, position);
    });
  }
}

export function getEvaluationExpressionFromRegexp(
  editor: atom$TextEditor,
  position: atom$Point,
  regexp: RegExp,
): ?NuclideEvaluationExpression {
  const extractedIdentifier = wordAtPosition(editor, position, regexp);
  if (extractedIdentifier == null) {
    return null;
  }
  const {range, wordMatch} = extractedIdentifier;
  const [expression] = wordMatch;
  return (expression == null) ? null : {expression, range};
}
