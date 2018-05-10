/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

import type {TestResult, AggregatedResults} from './types';

import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import React from 'react';
import ReactDOM from 'react-dom';
import nullthrows from 'nullthrows';

import Model from 'nuclide-commons/Model';
import Jest from './frontend/Jest';

const div = document.createElement('div');
nullthrows(document.body).appendChild(div);

type GlobalConfig = Object;

// Jest seems to be particular about this being a commonjs export
// eslint-disable-next-line nuclide-internal/no-commonjs
module.exports = class AtomReporter {
  _modelSubscription: UniversalDisposable;
  _globalConfig: Object;
  _options: Object;
  model: Model<{
    results: ?AggregatedResults,
  }>;

  constructor(globalConfig: GlobalConfig, options: Object) {
    this._globalConfig = globalConfig;
    this._options = options;

    this.model = new Model({results: null});
    this._modelSubscription = new UniversalDisposable(
      this.model.subscribe(state => {
        ReactDOM.render(<Jest results={state.results} />, div);
      }),
    );
  }

  onTestResult(
    config: GlobalConfig,
    result: TestResult,
    results: AggregatedResults,
  ) {
    this.model.setState({results});
  }

  onRunComplete(contexts: mixed, results: AggregatedResults) {
    this.model.setState({results});
    this._modelSubscription.dispose();
  }
};
