'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {React} from 'react-for-atom';

type DiagnosticsDatatipComponentProps = {};

export class DiagnosticsDatatipComponent extends React.Component {
  props: DiagnosticsDatatipComponentProps;

  render(): ReactElement {
    return (
      <div>
        I'm a DiagnosticsDatatipComponent.
      </div>
    );
  }
}
