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
import type {CoverageResult} from '../../nuclide-type-coverage/lib/types';
import type {FlowCoverageResult} from '../../nuclide-flow-base';
import featureConfig from '../../nuclide-feature-config';

import invariant from 'assert';
import {Range} from 'atom';

import {getFlowServiceByNuclideUri} from './FlowServiceFactory';

export async function getCoverage(path: NuclideUri): Promise<?CoverageResult> {
  const flowService = await getFlowServiceByNuclideUri(path);
  invariant(flowService != null);

  const useDumpTypes = featureConfig.get('nuclide-flow.useDumpTypes');
  invariant(typeof useDumpTypes === 'boolean');

  const flowCoverage: ?FlowCoverageResult = await flowService.flowGetCoverage(
    path,
    useDumpTypes,
  );
  return flowCoverageToCoverage(flowCoverage);
}

function flowCoverageToCoverage(flowCoverage: ?FlowCoverageResult): ?CoverageResult {
  if (flowCoverage == null) {
    return null;
  }

  return {
    percentage: flowCoverage.percentage,
    uncoveredRegions: flowCoverage.uncoveredRanges.map(
      flowRange => ({
        range: new Range(
          [flowRange.start.line, flowRange.start.column],
          [flowRange.end.line, flowRange.end.column],
        ),
      })
    ),
  };
}
