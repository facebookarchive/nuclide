'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/*eslint-disable no-unused-vars */
declare class node$CallSite {
  toString(): ?string;
  getFunctionName(): ?string;
  getMethodName(): ?string;
  getFileName(): ?string;
  getLineNumber(): ?number;
  getColumnNumber(): ?number;
  getEvalOrigin(): ?string;
  isToplevel(): boolean;
  isEval(): boolean;
  isNative(): boolean;
  isConstructor(): boolean;
}
