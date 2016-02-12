'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {getCommandInfo} from './getCommandInfo';
import ReactNativeServerActions from './ReactNativeServerActions';
import ReactNativeServerManager from './ReactNativeServerManager';
import {CompositeDisposable, Disposable} from 'atom';
import {Dispatcher} from 'flux';
import Rx from 'rx';

/**
 * Runs the server in the appropriate place. This class encapsulates all the state of the packager
 * so as to keep the Activation class (which brings together various RN features) clean.
 */
export class PackagerActivation {

  _actions: ReactNativeServerActions;
  _connectionDisposables: ?IDisposable;
  _disposables: IDisposable;
  _stopped: boolean;

  constructor() {
    this._disposables = new CompositeDisposable(
      atom.commands.add('atom-workspace', {
        'nuclide-react-native:start-packager': () => this._restart(),
        'nuclide-react-native:stop-packager': () => this._stop(),
        'nuclide-react-native:restart-packager': () => this._restart(),
      }),
      new Disposable(() => this._stop()),
    );

    // TODO(matthewwithanm): Remove all this flux stuff. All we need is an object that represents
    //   the packager server. We don't actually have a store here, we're just using the
    //   actions/dispatcher as a roundabout way of calling methods on the server so we can just
    //   merge that stuff into this class (after removing extra logic, etc).
    const dispatcher = new Dispatcher();
    const actions = this._actions = new ReactNativeServerActions(dispatcher);
    new ReactNativeServerManager(dispatcher, actions); // eslint-disable-line no-new
  }

  dispose(): void {
    this._disposables.dispose();
  }

  _restart(): void {
    this._stop();

    this._connectionDisposables = new CompositeDisposable(
      Rx.Observable.fromPromise(getCommandInfo())
        .subscribe(commandInfo => {
          if (commandInfo == null) {
            atom.notifications.addError("Couldn't find a React Native project", {
              description:
                'Make sure that one of the folders in your Atom project (or its ancestor)' +
                ' contains either a package.json with a "react-native" dependency, or a' +
                ' .buckconfig file with a "[react-native]" section that has a "server" key.',
            });
            return;
          }

          // TODO(matthewwithanm): We also need to pass along the projectRoot and use that as the
          //   cwd.
          this._actions.startServer(commandInfo.command);
        }),
      new Disposable(() => this._actions.stopServer()),
    );
  }

  _stop(): void {
    if (this._connectionDisposables) {
      this._connectionDisposables.dispose();
      this._connectionDisposables = null;
    }
  }

}
