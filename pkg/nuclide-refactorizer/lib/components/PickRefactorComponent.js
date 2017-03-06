/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {
  Store,
  PickPhase,
} from '../types';

import type {AvailableRefactoring} from '../..';

import {React} from 'react-for-atom';

import {Button} from '../../../nuclide-ui/Button';

import * as Actions from '../refactorActions';

export class PickRefactorComponent extends React.Component {
  props: {
    pickPhase: PickPhase,
    store: Store,
  };

  render(): React.Element<any> {
    const {availableRefactorings} = this.props.pickPhase;
    if (availableRefactorings.length === 0) {
      return <div>No refactorings available at this location</div>;
    }

    const elements = availableRefactorings
      .map((r, i) => (
        <div key={i} className="nuclide-refactorizer-refactor-option">
          {this._renderRefactorOption(r)}
        </div>
      ));
    // Class used to identify this element in integration tests
    return <div className="nuclide-refactorizer-pick-refactor">{elements}</div>;
  }

  _pickRefactor(refactoring: AvailableRefactoring): void {
    this.props.store.dispatch(Actions.pickedRefactor(refactoring));
  }

  _renderRefactorOption(refactoring: AvailableRefactoring): React.Element<any> {
    switch (refactoring.kind) {
      case 'rename':
        return (
          <Button
              // Used to identify this element in integration tests
              className="nuclide-refactorizer-pick-rename"
              onClick={() => { this._pickRefactor(refactoring); }}>
            Rename
          </Button>
        );
      case 'freeform':
        // TODO: Make sure the buttons are aligned.
        return (
          <div>
            <Button
                className="nuclide-refactorizer-pick-freeform"
                onClick={() => { this._pickRefactor(refactoring); }}
                disabled={refactoring.disabled}>
              {refactoring.name}
            </Button>
            {refactoring.description}
          </div>
        );
      default:
        throw new Error(`Unknown refactoring kind ${refactoring.kind}`);
    }
  }
}
