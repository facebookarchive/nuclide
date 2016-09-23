'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import xfetch from '../../commons-node/xfetch';
import {Disposable, CompositeDisposable} from 'atom';
import createPackage from '../../commons-atom/createPackage';
import {React, ReactDOM} from 'react-for-atom';
import {RequestEditDialog} from './RequestEditDialog';

export type HttpRequestSenderApi = {
  sendRequest: (uri: string, options: Object) => mixed,
};

class Activation {
  _disposables: CompositeDisposable;
  _requestEditDialog: ?atom$Panel;

  constructor(): void {
    this._requestEditDialog = null;
    this._disposables = new CompositeDisposable(
      atom.commands.add('atom-workspace', {
        'nuclide-http-request-sender:send-http-request': () => {
          xfetch('facebook.com', {});
        },
        'nuclide-http-request-sender:toggle-http-request-edit-dialog': () => {
          this._toggleRequestEditDialog();
        },
      }),
    );
  }

  _toggleRequestEditDialog(): void {
    const dialog = this._createModalIfNeeded();
    if (dialog.isVisible()) {
      dialog.hide();
    } else {
      dialog.show();
    }
  }

  _createModalIfNeeded(): atom$Panel {
    if (this._requestEditDialog != null) {
      return this._requestEditDialog;
    }
    const container = document.createElement('div');
    ReactDOM.render(<RequestEditDialog />, container);
    const requestEditDialog = atom.workspace.addModalPanel({
      item: container,
      visible: false,
    });
    this._disposables.add(
      new Disposable(() => {
        requestEditDialog.destroy();
        this._requestEditDialog = null;
        ReactDOM.unmountComponentAtNode(container);
      }),
    );
    return requestEditDialog;
  }

  provideHttpRequestSender(): HttpRequestSenderApi {
    return {
      sendRequest: (uri, options) => xfetch(uri, options),
    };
  }

  dispose(): void {
    this._disposables.dispose();
  }
}

export default createPackage(Activation);
