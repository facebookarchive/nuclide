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

import * as React from 'react';

/* Evaluation & values */
export type EvaluationResult = {
  type: string,
  // Either:
  value?: string,
  // Or:
  description?: string,
  objectId?: string,
  subtype?: string,
};

export function TextRenderer(
  evaluationResult: EvaluationResult,
): ?React.Element<any> {
  const {type, value} = evaluationResult;
  if (type === 'text') {
    return <span>{value}</span>;
  } else {
    return null;
  }
}
