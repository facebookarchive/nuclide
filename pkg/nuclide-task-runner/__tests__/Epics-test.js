'use strict';

var _reduxObservable;

function _load_reduxObservable() {
  return _reduxObservable = require('../../../modules/nuclide-commons/redux-observable');
}

var _tasks;

function _load_tasks() {
  return _tasks = require('../../commons-node/tasks');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../../modules/nuclide-commons/UniversalDisposable'));
}

var _Actions;

function _load_Actions() {
  return _Actions = _interopRequireWildcard(require('../lib/redux/Actions'));
}

var _Epics;

function _load_Epics() {
  return _Epics = _interopRequireWildcard(require('../lib/redux/Epics'));
}

var _dummy;

function _load_dummy() {
  return _dummy = _interopRequireWildcard(require('../__mocks__/dummy'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _immutable;

function _load_immutable() {
  return _immutable = _interopRequireWildcard(require('immutable'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getRootEpic() {
  const epics = Object.keys(_Epics || _load_Epics()).filter(k => k !== 'trackEpic') // Omit the tracking epic
  .map(k => (_Epics || _load_Epics())[k]).filter(epic => typeof epic === 'function');
  return (0, (_reduxObservable || _load_reduxObservable()).combineEpics)(...epics);
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   * @format
   */

describe('Epics', () => {
  describe('SET_PROJECT_ROOT', () => {
    describe('when packages arent activated', () => {
      const state = { initialPackagesActivated: false };

      it('does nothing', async () => {
        await (async () => {
          const output = await runActions([(_Actions || _load_Actions()).setProjectRoot(null)], state).toArray().toPromise();
          expect(output).toEqual([]);
        })();
      });
    });

    describe('when there are no task runners', () => {
      const state = {
        initialPackagesActivated: true,
        taskRunners: (_immutable || _load_immutable()).List()
      };

      it('set task runners states to an empty map', async () => {
        await (async () => {
          const output = await runActions([(_Actions || _load_Actions()).setProjectRoot(null)], state).first().toPromise();

          if (!(output.type === (_Actions || _load_Actions()).SET_STATES_FOR_TASK_RUNNERS)) {
            throw new Error('Invariant violation: "output.type === Actions.SET_STATES_FOR_TASK_RUNNERS"');
          }

          expect(output.payload.statesForTaskRunners).toEqual((_immutable || _load_immutable()).Map());
        })();
      });
    });

    describe('when there are task runners', () => {
      let taskRunner;
      let state;

      beforeEach(() => {
        taskRunner = new (_dummy || _load_dummy()).TaskRunner();
        const task = new (_dummy || _load_dummy()).createTask('test task');
        taskRunner = Object.assign({}, taskRunner, {
          setProjectRoot: (projectRoot, callback) => {
            callback(true, [task]);
            return new (_UniversalDisposable || _load_UniversalDisposable()).default();
          }
        });
        state = {
          initialPackagesActivated: true,
          taskRunners: (_immutable || _load_immutable()).List([taskRunner])
        };
      });

      it('updates states after collecting them from all task runners', async () => {
        await (async () => {
          const output = await runActions([(_Actions || _load_Actions()).setProjectRoot(null)], state).first().toPromise();

          if (!(output.type === (_Actions || _load_Actions()).SET_STATES_FOR_TASK_RUNNERS)) {
            throw new Error('Invariant violation: "output.type === Actions.SET_STATES_FOR_TASK_RUNNERS"');
          }

          const runnerState = output.payload.statesForTaskRunners.get(taskRunner);

          if (!runnerState) {
            throw new Error('Invariant violation: "runnerState"');
          }

          expect(runnerState.enabled).toEqual(true);
          expect(runnerState.tasks[0].type).toEqual('test task');
        })();
      });
    });
  });

  describe('SET_STATES_FOR_TASK_RUNNERS', () => {
    let state;
    let newStates;

    beforeEach(() => {
      const disabledTaskRunner = new (_dummy || _load_dummy()).TaskRunner('a');
      const loPriTaskRunner = new (_dummy || _load_dummy()).TaskRunner('b');
      let hiPriTaskRunner = new (_dummy || _load_dummy()).TaskRunner('c');
      hiPriTaskRunner = Object.assign({}, hiPriTaskRunner, {
        getPriority: () => 1
      });

      newStates = (_immutable || _load_immutable()).Map([[disabledTaskRunner, { enabled: false, tasks: [] }], [loPriTaskRunner, { enabled: true, tasks: [] }], [hiPriTaskRunner, { enabled: true, tasks: [] }]]);

      state = {
        projectRoot: 'foo',
        taskRunners: (_immutable || _load_immutable()).List([disabledTaskRunner, loPriTaskRunner, hiPriTaskRunner]),
        statesForTaskRunners: newStates
      };
    });

    describe("if this working root doesn't have a preference", () => {
      it('selects an enabled runner with the highest priority', async () => {
        await (async () => {
          const output = await runActions([(_Actions || _load_Actions()).setStatesForTaskRunners(newStates)], state).toArray().toPromise();
          expect(output.length).toEqual(2);
          const action = output[0];

          if (!(action.type === (_Actions || _load_Actions()).SELECT_TASK_RUNNER)) {
            throw new Error('Invariant violation: "action.type === Actions.SELECT_TASK_RUNNER"');
          }

          if (!action.payload.taskRunner) {
            throw new Error('Invariant violation: "action.payload.taskRunner"');
          }

          expect(action.payload.taskRunner.id).toEqual('c');
        })();
      });

      it('shows the toolbar since it might be useful', async () => {
        await (async () => {
          const output = await runActions([(_Actions || _load_Actions()).setStatesForTaskRunners(newStates)], state).toArray().toPromise();
          expect(output.length).toEqual(2);
          const action = output[1];

          if (!(action.type === (_Actions || _load_Actions()).SET_TOOLBAR_VISIBILITY)) {
            throw new Error('Invariant violation: "action.type === Actions.SET_TOOLBAR_VISIBILITY"');
          }

          expect(action.payload.updateUserPreferences).toEqual(true);
          expect(action.payload.visible).toEqual(true);
        })();
      });
    });

    describe('if this root has a preference', () => {
      let preference;
      beforeEach(() => {
        preference = { taskRunnerId: 'b', visible: true };
      });

      it('restores task runner and visibility based on the preference', async () => {
        await (async () => {
          const output = await runActions([(_Actions || _load_Actions()).setStatesForTaskRunners(newStates)], state, createMockPreferences([{ key: 'foo', value: preference }])).toArray().toPromise();
          expect(output.length).toEqual(2);
          const taskRunnerAction = output[0];
          const visibilityAction = output[1];

          if (!(taskRunnerAction.type === (_Actions || _load_Actions()).SELECT_TASK_RUNNER)) {
            throw new Error('Invariant violation: "taskRunnerAction.type === Actions.SELECT_TASK_RUNNER"');
          }

          if (!(visibilityAction.type === (_Actions || _load_Actions()).SET_TOOLBAR_VISIBILITY)) {
            throw new Error('Invariant violation: "visibilityAction.type === Actions.SET_TOOLBAR_VISIBILITY"');
          }

          if (!taskRunnerAction.payload.taskRunner) {
            throw new Error('Invariant violation: "taskRunnerAction.payload.taskRunner"');
          }

          expect(taskRunnerAction.payload.taskRunner.id).toEqual('b');
          expect(visibilityAction.payload.visible).toEqual(true);
          expect(visibilityAction.payload.updateUserPreferences).toEqual(false);
        })();
      });
    });
  });

  describe('SET_CONSOLE_SERVICE', () => {
    describe('if the console service is null', () => {
      it('does nothing', async () => {
        await (async () => {
          const state = {
            consoleService: null,
            initialPackagesActivated: true
          };
          const output = await runActions([(_Actions || _load_Actions()).setConsoleService(null)], state).toArray().toPromise();
          expect(output).toEqual([]);
        })();
      });
    });

    describe('if the console service exists', () => {
      it('sets consoles for all registered task runners', async () => {
        await (async () => {
          const state = {
            consoleService: createMockConsole,
            initialPackagesActivated: true,
            taskRunners: (_immutable || _load_immutable()).List([new (_dummy || _load_dummy()).TaskRunner()])
          };
          const output = await runActions([(_Actions || _load_Actions()).setConsoleService(createMockConsole)], state).toArray().toPromise();

          expect(output.length).toEqual(1);
          const setConsolesAction = output[0];

          if (!(setConsolesAction.type === (_Actions || _load_Actions()).SET_CONSOLES_FOR_TASK_RUNNERS)) {
            throw new Error('Invariant violation: "setConsolesAction.type === Actions.SET_CONSOLES_FOR_TASK_RUNNERS"');
          }

          const { consolesForTaskRunners } = setConsolesAction.payload;
          expect(consolesForTaskRunners.count()).toEqual(1);
        })();
      });
    });
  });

  describe('DID_ACTIVATE_INITIAL_PACKAGES', () => {
    it('sends another project root message', async () => {
      await (async () => {
        const mockProjectRoot = 'foo';
        const state = {
          consoleService: null,
          initialPackagesActivated: true,
          taskRunners: (_immutable || _load_immutable()).List(),
          projectRoot: mockProjectRoot
        };
        const output = await runActions([(_Actions || _load_Actions()).didActivateInitialPackages()], state).toArray().toPromise();

        expect(output.length).toEqual(1);
        const setProjectRootAction = output[0];

        if (!(setProjectRootAction.type === (_Actions || _load_Actions()).SET_STATES_FOR_TASK_RUNNERS)) {
          throw new Error('Invariant violation: "setProjectRootAction.type === Actions.SET_STATES_FOR_TASK_RUNNERS"');
        }

        expect(setProjectRootAction.payload.statesForTaskRunners.count()).toEqual(0);
      })();
    });
  });

  describe('REGISTER_TASK_RUNNER', () => {
    describe('if the console service is null', () => {
      it('sets the state for the task runner', async () => {
        await (async () => {
          const taskRunner = new (_dummy || _load_dummy()).TaskRunner();
          const task = new (_dummy || _load_dummy()).createTask('test task');
          const mockTaskRunner = Object.assign({}, taskRunner, {
            setProjectRoot: (projectRoot, callback) => {
              callback(true, [task]);
              return new (_UniversalDisposable || _load_UniversalDisposable()).default();
            }
          });
          const state = {
            consoleService: null,
            initialPackagesActivated: true,
            projectRoot: 'foo'
          };
          const output = await runActions([(_Actions || _load_Actions()).registerTaskRunner(mockTaskRunner)], state).first().toPromise();

          if (!(output.type === (_Actions || _load_Actions()).SET_STATE_FOR_TASK_RUNNER)) {
            throw new Error('Invariant violation: "output.type === Actions.SET_STATE_FOR_TASK_RUNNER"');
          }

          expect(output.payload.taskRunner).toEqual(mockTaskRunner);

          const taskRunnerState = output.payload.taskRunnerState;
          expect(taskRunnerState.enabled).toEqual(true);
          expect(taskRunnerState.tasks.length).toEqual(1);
          expect(taskRunnerState.tasks[0]).toEqual(task);
        })();
      });
    });

    describe('if the task runners arent ready', () => {
      it('sets the console service for the runner', async () => {
        await (async () => {
          const state = {
            consoleService: createMockConsole,
            initialPackagesActivated: false,
            projectRoot: 'foo'
          };
          const mockTaskRunner = new (_dummy || _load_dummy()).TaskRunner();
          const output = await runActions([(_Actions || _load_Actions()).registerTaskRunner(mockTaskRunner)], state).toArray().toPromise();
          expect(output.length).toEqual(1);
          const addConsoleAction = output[0];

          if (!(addConsoleAction.type === (_Actions || _load_Actions()).ADD_CONSOLE_FOR_TASK_RUNNER)) {
            throw new Error('Invariant violation: "addConsoleAction.type === Actions.ADD_CONSOLE_FOR_TASK_RUNNER"');
          }

          expect(addConsoleAction.payload.taskRunner).toEqual(mockTaskRunner);
        })();
      });
    });

    describe('if the task runners are ready and the console service exists', () => {
      it('sets the project root for new task runner, sets consoles for all registered task runners', async () => {
        await (async () => {
          const taskRunner = new (_dummy || _load_dummy()).TaskRunner();
          const task = new (_dummy || _load_dummy()).createTask('test task');
          const mockTaskRunner = Object.assign({}, taskRunner, {
            setProjectRoot: (projectRoot, callback) => {
              callback(true, [task]);
              return new (_UniversalDisposable || _load_UniversalDisposable()).default();
            }
          });
          const state = {
            consoleService: createMockConsole,
            projectRoot: 'foo',
            initialPackagesActivated: true,
            taskRunners: (_immutable || _load_immutable()).List([])
          };
          const output = await runActions([(_Actions || _load_Actions()).registerTaskRunner(mockTaskRunner)], state).take(2).toArray().toPromise();

          const setStateAction = output[0];
          const addConsoleAction = output[1];

          if (!(addConsoleAction.type === (_Actions || _load_Actions()).ADD_CONSOLE_FOR_TASK_RUNNER)) {
            throw new Error('Invariant violation: "addConsoleAction.type === Actions.ADD_CONSOLE_FOR_TASK_RUNNER"');
          }

          expect(addConsoleAction.payload.taskRunner).toEqual(mockTaskRunner);
          expect(Object.getOwnPropertyNames(addConsoleAction.payload.consoleApi).length).toEqual(0);

          if (!(setStateAction.type === (_Actions || _load_Actions()).SET_STATE_FOR_TASK_RUNNER)) {
            throw new Error('Invariant violation: "setStateAction.type === Actions.SET_STATE_FOR_TASK_RUNNER"');
          }

          expect(setStateAction.payload.taskRunner).toEqual(mockTaskRunner);

          const taskRunnerState = setStateAction.payload.taskRunnerState;
          expect(taskRunnerState.enabled).toEqual(true);
          expect(taskRunnerState.tasks.length).toEqual(1);
          expect(taskRunnerState.tasks[0]).toEqual(task);
        })();
      });
    });
  });

  describe('UNREGISTER_TASK_RUNNER', () => {
    describe('if the console service is null', () => {
      it('does nothing', async () => {
        await (async () => {
          const taskRunner = new (_dummy || _load_dummy()).TaskRunner();
          const state = {
            consoleService: null,
            initialPackagesActivated: true,
            taskRunners: (_immutable || _load_immutable()).List([taskRunner]),
            projectRoot: 'foo'
          };
          const output = await runActions([(_Actions || _load_Actions()).unregisterTaskRunner(taskRunner)], state).toArray().toPromise();

          expect(output.length).toEqual(0);
        })();
      });
    });

    describe('if the task runner to be removed is the active task runner', () => {
      it('removes the active task runner and the old task runner console', async () => {
        await (async () => {
          const taskRunner = new (_dummy || _load_dummy()).TaskRunner();
          const state = {
            consoleService: createMockConsole,
            initialPackagesActivated: true,
            taskRunners: (_immutable || _load_immutable()).List([taskRunner]),
            activeTaskRunner: taskRunner
          };

          const output = await runActions([(_Actions || _load_Actions()).unregisterTaskRunner(taskRunner)], state).toArray().toPromise();

          const removeConsoleAction = output[0];
          const setTaskRunnerAction = output[1];

          expect(removeConsoleAction.type).toEqual((_Actions || _load_Actions()).REMOVE_CONSOLE_FOR_TASK_RUNNER);

          if (!(removeConsoleAction.type === (_Actions || _load_Actions()).REMOVE_CONSOLE_FOR_TASK_RUNNER)) {
            throw new Error('Invariant violation: "removeConsoleAction.type === Actions.REMOVE_CONSOLE_FOR_TASK_RUNNER"');
          }

          expect(removeConsoleAction.payload.taskRunner).toEqual(taskRunner);

          expect(setTaskRunnerAction.type).toEqual((_Actions || _load_Actions()).SELECT_TASK_RUNNER);

          if (!(setTaskRunnerAction.type === (_Actions || _load_Actions()).SELECT_TASK_RUNNER)) {
            throw new Error('Invariant violation: "setTaskRunnerAction.type === Actions.SELECT_TASK_RUNNER"');
          }

          expect(setTaskRunnerAction.payload.taskRunner).toEqual(null);
          expect(setTaskRunnerAction.payload.updateUserPreferences).toEqual(false);
        })();
      });
    });

    describe('if the console service exists', () => {
      it('sets consoles for all registered task runners', async () => {
        await (async () => {
          const mockProjectRoot = 'foo';
          const taskRunner = new (_dummy || _load_dummy()).TaskRunner();
          const state = {
            consoleService: createMockConsole,
            projectRoot: mockProjectRoot,
            initialPackagesActivated: true,
            taskRunners: (_immutable || _load_immutable()).List([taskRunner])
          };
          const output = await runActions([(_Actions || _load_Actions()).unregisterTaskRunner(taskRunner)], state).toArray().toPromise();

          expect(output.length).toEqual(1);
          const removeConsoleAction = output[0];

          if (!(removeConsoleAction.type === (_Actions || _load_Actions()).REMOVE_CONSOLE_FOR_TASK_RUNNER)) {
            throw new Error('Invariant violation: "removeConsoleAction.type === Actions.REMOVE_CONSOLE_FOR_TASK_RUNNER"');
          }

          expect(removeConsoleAction.payload.taskRunner).toEqual(taskRunner);
        })();
      });
    });
  });

  describe('TASK_STOPPED', () => {
    it('cancels the current task', async () => {
      await (async () => {
        const task = (0, (_tasks || _load_tasks()).taskFromObservable)(new _rxjsBundlesRxMinJs.Subject());
        const taskRunner = new (_dummy || _load_dummy()).TaskRunner();
        jest.spyOn(taskRunner, 'runTask').mockReturnValue(task);
        jest.spyOn(task, 'cancel').mockImplementation(() => {});
        const state = {
          activeTaskRunner: taskRunner,
          taskRunners: (_immutable || _load_immutable()).List([taskRunner])
        };
        const taskMeta = (_dummy || _load_dummy()).createTask('test');

        const actions = [(_Actions || _load_Actions()).runTask(Object.assign({}, taskMeta, { taskRunner }), false), {
          type: (_Actions || _load_Actions()).TASK_STOPPED,
          payload: {
            taskStatus: {
              metadata: taskMeta,
              task,
              progress: 1,
              startDate: new Date()
            },
            taskRunner
          }
        }];
        await runActions(actions, state).toArray().toPromise();
        expect(task.cancel).toHaveBeenCalled();
      })();
    });
  });

  describe('RUN_TASK', () => {
    it('runs a task to completion', async () => {
      await (async () => {
        const taskRunner = new (_dummy || _load_dummy()).TaskRunner();
        const taskEvents = new _rxjsBundlesRxMinJs.Subject();
        const task = (0, (_tasks || _load_tasks()).taskFromObservable)(taskEvents);
        jest.spyOn(task, 'cancel').mockImplementation(() => {});
        jest.spyOn(task, 'onDidComplete');
        jest.spyOn(taskRunner, 'runTask').mockReturnValue(task);

        const state = {
          activeTaskRunner: taskRunner,
          taskRunners: (_immutable || _load_immutable()).List([taskRunner])
        };
        const taskMeta = (_dummy || _load_dummy()).createTask('test');

        const output = runActions([(_Actions || _load_Actions()).runTask(Object.assign({}, taskMeta, { taskRunner }), false)], state);

        expect(task.onDidComplete).toHaveBeenCalled();
        taskEvents.complete();

        const result = await output.toArray().toPromise();
        expect(result.map(action => action.type).slice(-2)).toEqual([(_Actions || _load_Actions()).TASK_STARTED, (_Actions || _load_Actions()).TASK_COMPLETED]);
        expect(task.cancel).not.toHaveBeenCalled();
      })();
    });
  });
});

function createMockStore(state) {
  const store = {
    getState: () => state
  };
  return store;
}

function runActions(actions, initialState, preferencesForWorkingRoots = createMockPreferences([])) {
  const store = createMockStore(initialState);
  const input = new _rxjsBundlesRxMinJs.Subject();
  const output = new _rxjsBundlesRxMinJs.ReplaySubject();
  const options = {
    preferencesForWorkingRoots,
    states: _rxjsBundlesRxMinJs.Observable.never()
  };
  getRootEpic()(new (_reduxObservable || _load_reduxObservable()).ActionsObservable(input), store, options).subscribe(output);
  actions.forEach(input.next.bind(input));
  input.complete();
  return output;
}

function createMockPreferences(db) {
  return new (_dummy || _load_dummy()).ToolbarStatePreferences(db);
}

function createMockConsole(source) {
  const consoleApi = {};
  return consoleApi;
}