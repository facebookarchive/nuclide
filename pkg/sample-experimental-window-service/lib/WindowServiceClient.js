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

import type {ServiceConnection} from 'nuclide-commons-atom/ExperimentalMessageRouter';

import invariant from 'assert';
import {Observable} from 'rxjs';
import {getLogger} from 'log4js';

const logger = getLogger('sample-experimental-window-service.connectClient');

export type WindowServiceClient = {
  open(options: WindowOptions<*, *>): Window,
};

export type OpenParams<T> = {
  width: number,
  height: number,
  frame: boolean,
  view: {
    componentId: string,
    initialState: T,
  },
};

export type UpdateParams<U> = {
  id: number,
  update: U,
};

type View<T, U> = {
  componentId: string,
  render(): T,
  +updates: Observable<U>,
  +dispose?: () => mixed,
  +handleAction?: (action: Object) => mixed, // TODO: Type action?
};

type WindowOptions<T, U> = {|
  width: number,
  height: number,
  frame?: boolean,
  createView: () => View<T, U>,
|};

type Window = {|
  destroy(): void,
|};

export default function createClient(
  connection: ServiceConnection,
): WindowServiceClient {
  return {
    open(options: WindowOptions<*, *>): Window {
      const view = options.createView();
      const idPromise = connection.sendRequest('open', {
        width: options.width,
        height: options.height,
        frame: options.frame,
        view: {
          componentId: view.componentId,
          initialState: view.render(),
        },
      });
      const updatesSubscription = Observable.fromPromise(idPromise)
        .switchMap(id => view.updates.map(update => ({id, update})))
        .subscribe(params => {
          connection.sendNotification('update', params);
        });
      if (view.handleAction != null) {
        connection.onNotification({method: 'dispatch'}, ({action}) => {
          logger.info(`client receiving action: ${JSON.stringify(action)}`);
          invariant(view.handleAction != null);
          view.handleAction(action);
        });
      }
      return {
        destroy(): void {
          updatesSubscription.unsubscribe();
          if (view.dispose != null) {
            view.dispose();
          }
          idPromise.then(id => {
            connection.sendNotification('destroy', {id});
          });
        },
      };
    },
  };
}
