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

export type NuclideCodeSearchConfig = {
  localTool: string,
  localUseVcsSearch: boolean,
  remoteTool: string,
  remoteUseVcsSearch: boolean,
  maxResults: number,
};
