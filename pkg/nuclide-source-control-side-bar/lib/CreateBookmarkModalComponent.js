/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import {CompositeDisposable} from 'atom';
import {React, ReactDOM} from 'react-for-atom';
import {Checkbox} from '../../nuclide-ui/Checkbox';
import featureConfig from '../../commons-atom/featureConfig';
import {
  Button,
  ButtonTypes,
} from '../../nuclide-ui/Button';
import {
  ButtonGroup,
  ButtonGroupSizes,
} from '../../nuclide-ui/ButtonGroup';
import {STACKED_CONFIG_KEY} from './constants';

type Props = {
  onCancel: () => mixed,
  onCreate: (name: string, repo: atom$Repository) => mixed,
  repo: atom$Repository,
};

export default class CreateBookmarkModal extends React.Component {
  disposables: CompositeDisposable;
  props: Props;

  constructor(props: Props): void {
    super(props);
    this.disposables = new CompositeDisposable();

    (this: any)._handleCreateClick = this._handleCreateClick.bind(this);
  }

  componentDidMount(): void {
    this.disposables.add(
      // $FlowFixMe
      atom.commands.add(ReactDOM.findDOMNode(this), 'core:confirm', this._handleCreateClick),
      featureConfig.observe(STACKED_CONFIG_KEY, () => this.forceUpdate()),
    );
    this.refs.atomTextEditor.focus();
  }

  componentWillUnmount(): void {
    this.disposables.dispose();
  }

  _handleCreateClick(): void {
    this.props.onCreate(this.refs.atomTextEditor.getModel().getText(), this.props.repo);
  }

  render(): React.Element<any> {
    return (
      <div>
        <h6 style={{marginTop: 0}}><strong>Create bookmark</strong></h6>
        <label>Bookmark name:</label>
        <atom-text-editor mini ref="atomTextEditor" tabIndex="0" />
        <Checkbox
          label="Stack the feature on top of the current one"
          checked={(featureConfig.get(STACKED_CONFIG_KEY): any)}
          onChange={stacked => featureConfig.set(STACKED_CONFIG_KEY, stacked)}
        />
        <div className="text-right">
          <ButtonGroup size={ButtonGroupSizes.SMALL}>
            <Button onClick={this.props.onCancel}>
              Cancel
            </Button>
            <Button
              buttonType={ButtonTypes.PRIMARY}
              onClick={this._handleCreateClick}>
              Create
            </Button>
          </ButtonGroup>
        </div>
      </div>
    );
  }
}
