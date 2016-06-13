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
import {Section} from '../../nuclide-ui/lib/Section';
import {bindObservableAsProps} from '../../nuclide-ui/lib/bindObservableAsProps';
import {WatchExpressionComponent} from './WatchExpressionComponent';
import {DebuggerSteppingComponent} from './DebuggerSteppingComponent';

type Props = {
  model: DebuggerModel;
  watchExpressionListStore: WatchExpressionListStore;
};

export class NewDebuggerView extends React.Component {
  props: Props;
  _wrappedComponent: ReactClass<any>;

  constructor(props: Props) {
    super(props);
    this._wrappedComponent = bindObservableAsProps(
      props.watchExpressionListStore.getWatchExpressions().map(
        watchExpressions => ({watchExpressions})
      ),
      WatchExpressionComponent
    );
  }

  render(): React.Element<any> {
    const {
      model,
    } = this.props;
    const actions = model.getActions();
    const WatchExpressionComponentWrapped = this._wrappedComponent;
    return (
      <div className="nuclide-debugger-container-new">
        <Section headline="Debugger Controls">
          <DebuggerSteppingComponent
            actions={actions}
          />
        </Section>
        <Section headline="Watch Expressions">
          <WatchExpressionComponentWrapped
          onAddWatchExpression={actions.addWatchExpression.bind(model)}
          onRemoveWatchExpression={actions.removeWatchExpression.bind(model)}
          onUpdateWatchExpression={actions.updateWatchExpression.bind(model)}
          watchExpressionStore={model.getWatchExpressionStore()}
          />
        </Section>
      </div>
    );
  }
}
