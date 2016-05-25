'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type DebuggerModel from './DebuggerModel';
import type {
  WatchExpressionListStore,
} from './WatchExpressionListStore';

import {
  React,
} from 'react-for-atom';
import {bindObservableAsProps} from '../../nuclide-ui/lib/bindObservableAsProps';
import {
  WatchExpressionComponent,
} from './WatchExpressionComponent';

type Props = {
  model: DebuggerModel;
  watchExpressionListStore: WatchExpressionListStore;
};

export class NewDebuggerView extends React.Component {
  props: Props;
  _wrappedComponent: ReactClass;

  constructor(props: Props) {
    super(props);
    this._wrappedComponent = bindObservableAsProps(
      props.watchExpressionListStore.getWatchExpressions().map(
        watchExpressions => ({watchExpressions})
      ),
      WatchExpressionComponent
    );
  }

  render(): React.Element {
    const {
      model,
    } = this.props;
    const actions = model.getActions();
    const Component = this._wrappedComponent;
    return (
      <div className="nuclide-debugger-container-new">
        <Component
          onAddWatchExpression={actions.addWatchExpression.bind(model)}
          onRemoveWatchExpression={actions.removeWatchExpression.bind(model)}
          onUpdateWatchExpression={actions.updateWatchExpression.bind(model)}
          watchExpressionStore={model.getWatchExpressionStore()}
        />
      </div>
    );
  }
}
