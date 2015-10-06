'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

export type HomeFragments = {
  // A string that a package can publish to the main part of the home panel. This allows for
  // customized welcome messages, but should be used judiciously.
  welcome?: ReactElement;
  feature?: {
    title: string;
    icon: string;
    description: ReactElement | string;
    command?: string;
  };
  priority?: number;
};
