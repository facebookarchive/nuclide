'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Gadget} from '../../gadgets-interfaces';

import {React} from 'react-for-atom';

export default function createOutputGadget(): Gadget {

  class OutputGadget extends React.Component {

    static gadgetId = 'nuclide-output';

    getTitle(): string {
      return 'Output';
    }

    render(): ?ReactElement {
      return <div>Hello World</div>;
    }

  }

  return ((OutputGadget: any): Gadget);
}
