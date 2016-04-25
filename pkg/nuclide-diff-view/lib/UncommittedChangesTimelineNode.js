'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import classnames from 'classnames';
import {React} from 'react-for-atom';

type Props = {
  dirtyFileCount: number;
};

export default function UncommittedChangesTimelineNode(props: Props): React.Element {
  const hasChanges = props.dirtyFileCount > 0;
  const bubbleClassName = classnames('revision-bubble revision-bubble--uncommitted', {
    'revision-bubble--no-changes': !hasChanges,
  });
  const filesMsg = hasChanges ? `(files with changes: ${props.dirtyFileCount})` : '(no changes)';

  return (
    <div className="revision selected-revision-inrange selected-revision-start">
      <div className={bubbleClassName} />
      <div className="revision-label revision-label--uncommitted">
        Uncommitted {filesMsg}
      </div>
    </div>
  );

}
