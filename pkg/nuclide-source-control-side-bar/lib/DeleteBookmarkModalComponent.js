/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {BookmarkInfo} from '../../nuclide-hg-rpc/lib/HgService';

import React from 'react';
import {
  Button,
  ButtonTypes,
} from '../../nuclide-ui/Button';
import {
  ButtonGroup,
  ButtonGroupSizes,
} from '../../nuclide-ui/ButtonGroup';

type Props = {
  bookmark: BookmarkInfo,
  onCancel: () => mixed,
  onDelete: (bookmark: BookmarkInfo, repo: atom$Repository) => mixed,
  repository: atom$Repository,
};

export default class DeleteBookmarkModalComponent extends React.Component {
  props: Props;

  constructor(props: Props): void {
    super(props);
    (this: any)._handleDeleteClick = this._handleDeleteClick.bind(this);
  }

  componentDidMount(): void {
    this.refs.cancelButton.focus();
  }

  _handleDeleteClick(): void {
    this.props.onDelete(this.props.bookmark, this.props.repository);
  }

  render(): React.Element<any> {
    return (
      <div>
        <h6 style={{marginTop: 0}}>
          <strong>Delete bookmark {this.props.bookmark.bookmark}?</strong>
        </h6>
        <div className="block">
          Are you sure you want to delete the bookmark {this.props.bookmark.bookmark}? This can not
          be undone.
        </div>
        <div className="text-right">
          <ButtonGroup size={ButtonGroupSizes.SMALL}>
            <Button onClick={this.props.onCancel} ref="cancelButton">
              Cancel
            </Button>
            <Button buttonType={ButtonTypes.ERROR} onClick={this._handleDeleteClick}>
              Delete
            </Button>
          </ButtonGroup>
        </div>
      </div>
    );
  }
}
