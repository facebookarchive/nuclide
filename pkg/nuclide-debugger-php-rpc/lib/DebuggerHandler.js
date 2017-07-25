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

import * as DebugProtocol from 'vscode-debugprotocol';

import {
  Breakpoint,
  BreakpointEvent,
  Handles,
  OutputEvent,
  Scope,
  Source,
  StackFrame,
  StoppedEvent,
  TerminatedEvent,
} from 'vscode-debugadapter';

import invariant from 'assert';
import {makeExpressionHphpdCompatible} from './utils';
import logger from './utils';
import {functionOfFrame, locationOfFrame} from './frame';
import {
  COMMAND_STEP_INTO,
  COMMAND_STEP_OVER,
  COMMAND_STEP_OUT,
  BREAKPOINT_RESOLVED_NOTIFICATION,
} from './DbgpSocket';
import {
  ConnectionMultiplexer,
  ConnectionMultiplexerStatus,
} from './ConnectionMultiplexer';
import nuclideUri from 'nuclide-commons/nuclideUri';
import {sleep} from 'nuclide-commons/promise';
import {BREAKPOINT} from './Connection';
import {arrayFlatten, setDifference} from 'nuclide-commons/collection';
import nullthrows from 'nullthrows';

import {CompositeDisposable} from 'event-kit';
import type {
  Breakpoint as HhBreakpointType,
  ExceptionState,
} from './BreakpointStore';

const RESOLVE_BREAKPOINT_DELAY_MS = 500;

export class DebuggerHandler {
  _connectionMultiplexer: ConnectionMultiplexer;
  _subscriptions: CompositeDisposable;
  _hadFirstContinuationCommand: boolean;
  _temporaryBreakpointpointId: ?string;
  _eventSender: (event: DebugProtocol.Event) => mixed;

  // Since we want to send breakpoint events, we will assign an id to every event
  // so that the frontend can match events with breakpoints.
  _breakpointId = 0;
  _breakpoints: Map<string, DebugProtocol.Breakpoint[]> = new Map();
  _variableHandles: Handles<string> = new Handles();

  _sendOutput(message: string, level: string): void {
    this._eventSender(new OutputEvent(message, level));
  }

  _sendNotification(message: string, type: string): void {
    this._eventSender(new OutputEvent(message, 'nuclide_notification', {type}));
  }

  constructor(eventSender: (event: DebugProtocol.Event) => mixed) {
    this._eventSender = eventSender;
    this._hadFirstContinuationCommand = false;
    this._connectionMultiplexer = new ConnectionMultiplexer(
      this._sendOutput.bind(this),
      this._sendNotification.bind(this),
    );
    this._subscriptions = new CompositeDisposable(
      this._connectionMultiplexer.onStatus(this._onStatusChanged.bind(this)),
      this._connectionMultiplexer.onNotification(
        this._onNotification.bind(this),
      ),
      this._connectionMultiplexer,
    );
  }

  setPauseOnExceptions(
    breakpointId: number,
    state: ExceptionState,
  ): Promise<void> {
    return this._connectionMultiplexer
      .getBreakpointStore()
      .setPauseOnExceptions(String(breakpointId), state);
  }

  async setBreakpoints(
    path: string,
    bpSources: Array<DebugProtocol.SourceBreakpoint>,
  ): Promise<Array<DebugProtocol.Breakpoint>> {
    const existingBreakpoints = this._breakpoints.get(path) || [];
    const existingBsSet = new Set(existingBreakpoints);
    const newBpSources = new Set(bpSources);

    const addedBreakpoints = await Promise.all(
      Array.from(
        setDifference(newBpSources, existingBsSet, v => v.line),
      ).map((sourceBp: any) => {
        return this._setBreakpointFromSource(
          ++this._breakpointId,
          path,
          sourceBp,
        );
      }),
    );

    const removedBpIds = new Set(
      await Promise.all(
        Array.from(
          setDifference(existingBsSet, newBpSources, v => v.line),
        ).map(async (existingBp: any) => {
          const bpId: number = existingBp.id;
          await this._removeBreakpoint(bpId);
          return bpId;
        }),
      ),
    );

    const newBreakpoints = existingBreakpoints
      .filter(bp => !removedBpIds.has(bp.id))
      .concat(addedBreakpoints);

    this._breakpoints.set(path, newBreakpoints);
    return newBreakpoints;
  }

  async _setBreakpointFromSource(
    id: number,
    path: string,
    bpSource: DebugProtocol.SourceBreakpoint,
  ): Promise<DebugProtocol.Breakpoint> {
    const breakpointStore = this._connectionMultiplexer.getBreakpointStore();
    // Chrome lineNumber is 0-based while xdebug lineno is 1-based.
    const breakpointId = await breakpointStore.setFileLineBreakpoint(
      String(id),
      path,
      bpSource.line,
      bpSource.condition,
    );
    const hhBreakpoint = await breakpointStore.getBreakpoint(breakpointId);
    invariant(hhBreakpoint != null);
    const bp: DebugProtocol.Breakpoint = new Breakpoint(
      hhBreakpoint.resolved,
      bpSource.line,
    );
    bp.id = id;
    return bp;
  }

  _removeBreakpoint(breakpointId: number): Promise<void> {
    return this._connectionMultiplexer.removeBreakpoint(String(breakpointId));
  }

  async getStackFrames(id: number): Promise<Array<DebugProtocol.StackFrame>> {
    // this._connectionMultiplexer.selectThread(id);
    const frames = await this._connectionMultiplexer.getConnectionStackFrames(
      id,
    );
    if ((frames != null && frames.stack != null) || frames.stack.length === 0) {
      return Promise.all(
        frames.stack.map((frame, frameIndex) =>
          this._convertFrame(frame, frameIndex),
        ),
      );
    }

    return [];
  }

  async getScopesForFrame(
    frameIndex: number,
  ): Promise<Array<DebugProtocol.Scope>> {
    const scopes = await this._connectionMultiplexer.getScopesForFrame(
      frameIndex,
    );
    return scopes.map(scope => {
      return new Scope(
        scope.object.description || scope.name || scope.type,
        this._variableHandles.create(nullthrows(scope.object.objectId)),
        true,
      );
    });
  }

  async _convertFrame(
    frame: Object,
    frameIndex: number,
  ): Promise<DebugProtocol.StackFrame> {
    logger.debug('Converting frame: ' + JSON.stringify(frame));
    const location = locationOfFrame(frame);
    const hasSource = true; // TODO;
    if (!hasSource) {
      location.scriptId = '';
    }

    return new StackFrame(
      frameIndex,
      functionOfFrame(frame),
      hasSource
        ? new Source(nuclideUri.basename(location.scriptId), location.scriptId)
        : null,
      location.lineNumber,
      0,
    );
  }

  _sendContinuationCommand(command: string): void {
    logger.debug('Sending continuation command: ' + command);
    this._connectionMultiplexer.sendContinuationCommand(command);
  }

  pause(): void {
    this._connectionMultiplexer.pause();
  }

  resume(): void {
    if (!this._hadFirstContinuationCommand) {
      this._hadFirstContinuationCommand = true;
      this._subscriptions.add(
        this._connectionMultiplexer.listen(this._endSession.bind(this)),
      );
      return;
    }
    this._connectionMultiplexer.resume();
  }

  _updateBreakpointHitCount() {
    // If the enabled connection just hit a breakpoint, update its hit count.
    if (this._connectionMultiplexer.getEnabledConnection == null) {
      return;
    }
    const currentConnection = this._connectionMultiplexer.getEnabledConnection();
    if (
      currentConnection == null ||
      currentConnection.getStopReason() !== BREAKPOINT
    ) {
      return;
    }
    const stopLocation = currentConnection.getStopBreakpointLocation();
    if (stopLocation == null) {
      return;
    }
    const hhBp = this._connectionMultiplexer
      .getBreakpointStore()
      .findBreakpoint(stopLocation.filename, stopLocation.lineNumber);
    if (hhBp == null) {
      return;
    }
    hhBp.hitCount++;
    const vsBreakpoint = this._getBreakpointById(Number(hhBp.chromeId));
    if (vsBreakpoint == null) {
      return;
    }
    vsBreakpoint.nuclide_hitCount = hhBp.hitCount;
    this._eventSender(new BreakpointEvent('update', vsBreakpoint));
  }

  async continueToLocation(
    params: DebugProtocol.nuclide_ContinueToLocationArguments,
  ): Promise<void> {
    const enabledConnection = this._connectionMultiplexer.getEnabledConnection();
    const {source, line} = params;
    if (enabledConnection == null) {
      throw new Error('No active connection to continue on!');
    }

    const breakpointStore = this._connectionMultiplexer.getBreakpointStore();

    if (this._temporaryBreakpointpointId != null) {
      await breakpointStore.removeBreakpoint(this._temporaryBreakpointpointId);
      this._temporaryBreakpointpointId = null;
    }

    // Chrome lineNumber is 0-based while xdebug lineno is 1-based.
    this._temporaryBreakpointpointId = await breakpointStore.setFileLineBreakpointForConnection(
      enabledConnection,
      String(++this._breakpointId),
      nullthrows(source.path),
      line,
      /* condition */ '',
    );

    const breakpoint = breakpointStore.getBreakpoint(
      this._temporaryBreakpointpointId,
    );
    invariant(breakpoint != null);
    invariant(breakpoint.connectionId === enabledConnection.getId());

    // TODO change to resume on resolve notification when it's received after setting a breakpoint.
    await sleep(RESOLVE_BREAKPOINT_DELAY_MS);
    this.resume();
  }

  stepOver(): void {
    this._sendContinuationCommand(COMMAND_STEP_OVER);
  }

  stepInto(): void {
    this._sendContinuationCommand(COMMAND_STEP_INTO);
  }

  stepOut(): void {
    this._sendContinuationCommand(COMMAND_STEP_OUT);
  }

  async _onStatusChanged(status: string): Promise<void> {
    logger.debug('Sending status: ' + status);
    switch (status) {
      case ConnectionMultiplexerStatus.AllConnectionsPaused:
      case ConnectionMultiplexerStatus.SingleConnectionPaused:
        this._updateBreakpointHitCount();
        await this._sendPausedMessage();
        break;
      case ConnectionMultiplexerStatus.End:
        this._endSession();
        break;
      default:
        const message = 'Unexpected status: ' + status;
        logger.error(message);
        throw new Error(message);
    }
  }

  async _onNotification(notifyName: string, params: ?Object): Promise<void> {
    switch (notifyName) {
      case BREAKPOINT_RESOLVED_NOTIFICATION:
        invariant(params);
        const breakpoint: HhBreakpointType = params;
        this._resolveBreakpoint(Number(breakpoint.chromeId));
        break;
      default:
        const message = `Unexpected notification: ${notifyName}`;
        logger.error(message);
        throw new Error(message);
    }
  }

  _resolveBreakpoint(bpId: number): void {
    const breakpoint = this._getBreakpointById(bpId);
    if (breakpoint == null) {
      logger.warn('Cannot resolve non-existing breakpoint', bpId);
    } else {
      breakpoint.verified = true;
      this._eventSender(new BreakpointEvent('update', breakpoint));
    }
  }

  _getBreakpointById(bpId: number): ?DebugProtocol.Breakpoint {
    return arrayFlatten(Array.from(this._breakpoints.values())).find(
      bp => bp.id === bpId,
    );
  }

  // May only call when in paused state.
  async _sendPausedMessage(): Promise<any> {
    const requestSwitchMessage = this._connectionMultiplexer.getRequestSwitchMessage();
    this._connectionMultiplexer.resetRequestSwitchMessage();
    if (requestSwitchMessage != null) {
      this._sendOutput(requestSwitchMessage, 'info');
    }
    const enabledConnectionId = this._connectionMultiplexer.getEnabledConnectionId();
    if (enabledConnectionId == null) {
      throw new Error('No active hhvm connection to pause!');
    }
    this._eventSender(new StoppedEvent('breakpoint', enabledConnectionId));
  }

  dispose(): void {
    this._endSession();
  }

  _endSession(): void {
    logger.debug('DebuggerHandler: Ending session');
    this._eventSender(new TerminatedEvent());
    this._subscriptions.dispose();
  }

  async getProperties(
    variablesReference: number,
  ): Promise<Array<DebugProtocol.Variable>> {
    const id: string = this._variableHandles.get(variablesReference);
    if (id == null) {
      return [];
    }
    const properties = await this._connectionMultiplexer.getProperties(id);
    return properties.map(prop => {
      return {
        name: prop.name,
        type: (prop.value && prop.value.type) || 'unknown',
        value:
          (prop.value && (prop.value.value || prop.value.description)) || 'N/A',
        variablesReference:
          prop.value && prop.value.objectId
            ? this._variableHandles.create(prop.value.objectId)
            : 0,
      };
    });
  }

  async evaluate(
    expression: string,
    frameId: ?number,
    response: DebugProtocol.EvaluateResponse,
  ): Promise<void> {
    const hphpdExpression = makeExpressionHphpdCompatible(expression);
    let hhResult;
    if (frameId == null) {
      hhResult = await this._connectionMultiplexer.runtimeEvaluate(
        hphpdExpression,
      );
    } else {
      hhResult = await this._connectionMultiplexer.evaluateOnCallFrame(
        frameId,
        hphpdExpression,
      );
    }
    if (hhResult.wasThrown) {
      response.success = false;
      // $FlowIgnore: returning an ErrorResponse.
      response.body = {
        error: {
          id: hhResult.error.$.code,
          format: hhResult.error.message[0],
        },
      };
    } else {
      response.body = {
        type: hhResult.result.type,
        result: hhResult.result.value || hhResult.result.description,
        variablesReference: hhResult.result.objectId
          ? this._variableHandles.create(hhResult.result.objectId)
          : 0,
      };
    }
  }
}
