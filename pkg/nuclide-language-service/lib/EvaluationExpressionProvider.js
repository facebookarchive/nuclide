'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideEvaluationExpression} from '../../nuclide-debugger-interfaces/service';
import type {LanguageService} from './LanguageService';

import {trackOperationTiming} from '../../nuclide-analytics';
import {ConnectionCache} from '../../nuclide-remote-connection';
import {wordAtPosition} from '../../commons-atom/range';

export type EvaluationExpressionConfig = {
  version: string,
  analyticsEventName: string,
};

export class EvaluationExpressionProvider<T: LanguageService> {
  selector: string;
  name: string;
  identifierRegexp: RegExp;
  _analyticsEventName: string;
  _connectionToLanguageService: ConnectionCache<T>;

  constructor(
    name: string,
    selector: string,
    identifierRegexp: RegExp,
    analyticsEventName: string,
    connectionToLanguageService: ConnectionCache<T>,
  ) {
    this.name = name;
    this.selector = selector;
    this.identifierRegexp = identifierRegexp;
    this._analyticsEventName = analyticsEventName;
    this._connectionToLanguageService = connectionToLanguageService;
  }

  static register(
    name: string,
    selector: string,
    identifierRegexp: RegExp,
    config: EvaluationExpressionConfig,
    connectionToLanguageService: ConnectionCache<T>,
  ): IDisposable {
    return atom.packages.serviceHub.provide(
      'nuclide-evaluation-expression.provider',
      config.version,
      new EvaluationExpressionProvider(
        name,
        selector,
        identifierRegexp,
        config.analyticsEventName,
        connectionToLanguageService,
      ));
  }

  getEvaluationExpression(
    editor: atom$TextEditor,
    position: atom$Point,
  ): Promise<?NuclideEvaluationExpression> {
    return trackOperationTiming(this._analyticsEventName, () => {
      // TODO: Replace RegExp with AST-based, more accurate approach.
      const extractedIdentifier = wordAtPosition(editor, position, this.identifierRegexp);
      if (extractedIdentifier == null) {
        return Promise.resolve(null);
      }
      const {
        range,
        wordMatch,
      } = extractedIdentifier;
      const [expression] = wordMatch;
      if (expression == null) {
        return Promise.resolve(null);
      }
      return Promise.resolve({
        expression,
        range,
      });
    });
  }
}
