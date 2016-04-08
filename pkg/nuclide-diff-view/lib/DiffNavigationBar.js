'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {OffsetMap} from './types';

import {React} from 'react-for-atom';
import {getLineCountWithOffsets, getOffsetLineNumber} from './diff-utils';
import classnames from 'classnames';

type DiffNavigationBarProps = {
  elementHeight: number;
  addedLines: Array<number>;
  removedLines: Array<number>;
  oldContents: string;
  newContents: string;
  oldOffsets: OffsetMap;
  newOffsets: OffsetMap;
  onClick: (lineNumber: number, isAddedLine: boolean) => any;
};

export default class DiffNavigationBar extends React.Component {
  props: DiffNavigationBarProps;

  constructor(props: DiffNavigationBarProps) {
    super(props);
    (this: any)._handleClick = this._handleClick.bind(this);
  }

  render(): ?ReactElement {
    const {
      addedLines,
      removedLines,
      newContents,
      oldContents,
      newOffsets,
      oldOffsets,
      elementHeight,
    } = this.props;
    const newLinesCount = getLineCountWithOffsets(newContents, newOffsets);
    const oldLinesCount = getLineCountWithOffsets(oldContents, oldOffsets);

    const linesCount = Math.max(newLinesCount, oldLinesCount);

    // The old and new text editor contents use offsets to create a global line number identifier
    // being the line number with offset.

    // Here are the mapping between the offset line numbers to the original line number.
    const addedLinesWithOffsets = new Map(addedLines.map(
      addedLine => [getOffsetLineNumber(addedLine, newOffsets), addedLine]
    ));
    const removedLinesWithOffsets = new Map(removedLines.map(
      removedLine => [getOffsetLineNumber(removedLine, oldOffsets), removedLine]
    ));
    // Interset the added and removed lines maps, taking the values of the added lines.
    const changedLinesWithOffsets = new Map(
      Array.from(addedLinesWithOffsets.keys())
      .filter(addedLineWithOffset => removedLinesWithOffsets.has(addedLineWithOffset))
      .map(changedLineWithOffset => [
        changedLineWithOffset,
        addedLinesWithOffsets.get(changedLineWithOffset),
      ])
    );

    // These regions will now be 'modified' regions.
    for (const changedLineWithOffset of changedLinesWithOffsets.keys()) {
      addedLinesWithOffsets.delete(changedLineWithOffset);
      removedLinesWithOffsets.delete(changedLineWithOffset);
    }

    const jumpTargets = [];

    for (const [addedLineWithOffset, addedLine] of addedLinesWithOffsets) {
      jumpTargets.push(
        <NavigatonBarJumpTarget
          offsetLineNumber={addedLineWithOffset}
          key={addedLineWithOffset}
          lineNumber={addedLine}
          linesCount={linesCount}
          lineChangeClass="added"
          isAddedLine={true}
          containerHeight={elementHeight}
          onClick={this._handleClick}
        />
      );
    }

    for (const [changedLineWithOffset, changedLine] of changedLinesWithOffsets) {
      jumpTargets.push(
        <NavigatonBarJumpTarget
          offsetLineNumber={changedLineWithOffset}
          key={changedLineWithOffset}
          lineNumber={changedLine}
          linesCount={linesCount}
          lineChangeClass="modified"
          isAddedLine={true}
          containerHeight={elementHeight}
          onClick={this._handleClick}
        />
      );
    }

    for (const [removedLineWithOffset, removedLine] of removedLinesWithOffsets) {
      jumpTargets.push(
        <NavigatonBarJumpTarget
          offsetLineNumber={removedLineWithOffset}
          key={removedLineWithOffset}
          lineNumber={removedLine}
          linesCount={linesCount}
          lineChangeClass="removed"
          isAddedLine={false}
          containerHeight={elementHeight}
          onClick={this._handleClick}
        />
      );
    }

    return (
      <div className="nuclide-diff-view-navigation-bar">
        {jumpTargets}
      </div>
    );
  }

  _handleClick(lineNumber: number, isAddedLine: boolean): void {
    this.props.onClick(lineNumber, isAddedLine);
  }
}

type NavigatonBarJumpTargetProps = {
  offsetLineNumber: number;
  lineNumber: number;
  lineChangeClass: string;
  linesCount: number;
  isAddedLine: boolean;
  containerHeight: number;
  onClick: (lineNumber: number, isAddedLine: boolean) => any;
};

class NavigatonBarJumpTarget extends React.Component {
  props: NavigatonBarJumpTargetProps;

  constructor(props: NavigatonBarJumpTargetProps) {
    super(props);
    (this: any)._handleClick = this._handleClick.bind(this);
  }

  render(): ReactElement {
    const {offsetLineNumber, linesCount, containerHeight, lineChangeClass} = this.props;
    const targertTop = Math.ceil(containerHeight * offsetLineNumber / linesCount);
    const targertHeight = Math.ceil(containerHeight / linesCount);
    const targetStyle = {
      top: `${targertTop}px`,
      height: `${targertHeight}px`,
    };
    const targetClassName = classnames({
      'nuclide-diff-view-navigation-target': true,
      [lineChangeClass]: true,
    });

    return (
      <div
        className={targetClassName}
        style={targetStyle}
        onClick={this._handleClick}
      />
    );
  }

  _handleClick(): void {
    this.props.onClick(this.props.lineNumber, this.props.isAddedLine);
  }
}
