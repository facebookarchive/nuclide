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

import type {StatusData} from '../../nuclide-language-service/lib/LanguageService';

import * as React from 'react';

export type ServerStatus = {
  name: string,
  statusData: StatusData,
};

type Props = {};

export default class StatusComponent extends React.Component<Props> {
  props: Props = {};
  render(): React.Node {
    return <div> Hello World </div>;
  }
}
