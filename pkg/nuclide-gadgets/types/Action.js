'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

export type Action =
  CreatePaneItemAction |
  DestroyPaneItemAction |
  RegisterGadgetAction |
  DeactivateAction |
  UnregisterGadgetAction |
  UpdatePaneItemAction;

// The duplication of string literals here is necessary to make the disjoint unions work properly.
export type CreatePaneItemAction = {
  type: 'CREATE_PANE_ITEM';
  payload: {
    component?: ReactComponent;
    gadgetId: string;
    item: Object;
    props?: Object;
    isNew: boolean;
  };
};

export type DeactivateAction = {
  type: 'DEACTIVATE';
}

export type DestroyPaneItemAction = {
  type: 'DESTROY_PANE_ITEM';
  payload: {
    item: Object;
  };
}

export type RegisterGadgetAction = {
  type: 'REGISTER_GADGET';
  payload: {
    gadget: Object;
  };
}

export type UnregisterGadgetAction = {
  type: 'UNREGISTER_GADGET';
  payload: {
    gadgetId: string;
  };
};

export type UpdatePaneItemAction = {
  type: 'UPDATE_PANE_ITEM';
  payload: {
    item: Object;
    props: Object;
  };
};
