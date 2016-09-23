'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Store, TaskRunner} from '../types';

import {bindObservableAsProps} from '../../../nuclide-ui/lib/bindObservableAsProps';
import {viewableFromReactElement} from '../../../commons-atom/viewableFromReactElement';
import * as Actions from '../redux/Actions';
import {getActiveTaskRunner} from '../redux/Selectors';
import {Toolbar} from './Toolbar';
import memoize from 'lodash.memoize';
import {React} from 'react-for-atom';
import {Observable} from 'rxjs';

export function createPanelItem(store: Store): Object {
  const staticProps = {
    runTask: taskId => { store.dispatch(Actions.runTask(taskId)); },
    selectTask: taskId => { store.dispatch(Actions.selectTask(taskId)); },
    stopTask: () => { store.dispatch(Actions.stopTask()); },
    getActiveTaskRunnerIcon: () => {
      const activeTaskRunner = getActiveTaskRunner(store.getState());
      return activeTaskRunner && activeTaskRunner.getIcon();
    },
  };

  // Delay the inital render. This way we (probably) won't wind up rendering the wrong task
  // runner before the correct one is registered.
  const props = Observable.interval(300).first()
    // $FlowFixMe: We need to teach Flow about Symbol.observable
    .switchMap(() => Observable.from(store))
    .map(state => {
      const activeTaskRunner = getActiveTaskRunner(state);
      return {
        ...staticProps,
        taskRunnerInfo: Array.from(state.taskRunners.values()),
        getExtraUi: getExtraUiFactory(activeTaskRunner),
        progress: state.runningTaskInfo && state.runningTaskInfo.progress,
        activeTaskId: state.activeTaskId,
        taskIsRunning: state.runningTaskInfo != null,
        taskLists: state.taskLists,
      };
    });
  const StatefulToolbar = bindObservableAsProps(props, Toolbar);
  return viewableFromReactElement(<StatefulToolbar />);
}

/**
 * Since `getExtraUi` may create a React class dynamically, we want to ensure that we only ever call
 * it once. To do that, we memoize the function and cache the result.
 */
const extraUiFactories = new WeakMap();
function getExtraUiFactory(taskRunner: ?TaskRunner): ?() => ReactClass<any> {
  let getExtraUi = extraUiFactories.get(taskRunner);
  if (getExtraUi != null) { return getExtraUi; }
  if (taskRunner == null) { return null; }
  if (taskRunner.getExtraUi == null) { return null; }
  getExtraUi = memoize(taskRunner.getExtraUi.bind(taskRunner));
  extraUiFactories.set(taskRunner, getExtraUi);
  return getExtraUi;
}
