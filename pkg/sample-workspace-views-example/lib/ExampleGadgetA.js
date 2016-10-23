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
import {renderReactRoot} from '../../commons-atom/renderReactRoot';

export class ExampleGadgetA {

  getTitle(): string {
    return 'Example Gadget A';
  }

  getIconName(): atom$Octicon {
    return 'squirrel';
  }

  getElement(): HTMLElement {
    return renderReactRoot(<View />);
  }

  serialize(): Object {
    return {deserializer: 'ExampleGadgetA'};
  }

}

function View(): React.Element<*> {
  return (
    <div className="pane-item padded nuclide-example-gadget">
      This gadget was defined with a separate model and React component.
    </div>
  );
}
