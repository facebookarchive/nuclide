'use strict';

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _vscodeDebugprotocol;

function _load_vscodeDebugprotocol() {
  return _vscodeDebugprotocol = _interopRequireWildcard(require('vscode-debugprotocol'));
}

var _fs = _interopRequireWildcard(require('fs'));

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../nuclide-commons/nuclideUri'));
}

var _process;

function _load_process() {
  return _process = require('../../nuclide-commons/process');
}

var _VsDebugSession;

function _load_VsDebugSession() {
  return _VsDebugSession = _interopRequireDefault(require('../../nuclide-debugger-common/VsDebugSession'));
}

var _JavaDebuggerHelpersService;

function _load_JavaDebuggerHelpersService() {
  return _JavaDebuggerHelpersService = require('../JavaDebuggerHelpersService');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

const logger = (0, (_log4js || _load_log4js()).getLogger)('vscode-java-debugger-spec'); /**
                                                                                         * Copyright (c) 2017-present, Facebook, Inc.
                                                                                         * All rights reserved.
                                                                                         *
                                                                                         * This source code is licensed under the BSD-style license found in the
                                                                                         * LICENSE file in the root directory of this source tree. An additional grant
                                                                                         * of patent rights can be found in the PATENTS file in the same directory.
                                                                                         *
                                                                                         * 
                                                                                         * @format
                                                                                         */

const JAVA_FIXTURES = (_nuclideUri || _load_nuclideUri()).default.join(__dirname, '../__mocks__/fixtures', 'java');
const THREAD_ID = 1;
const JAVA_DEBUGGER_PKG = (_nuclideUri || _load_nuclideUri()).default.join(__dirname, '..');

function makeSource(name) {
  return {
    name,
    path: (_nuclideUri || _load_nuclideUri()).default.join(JAVA_FIXTURES, name)
  };
}

async function checkResponse(responsePromise, additionalValidation) {
  const response = await responsePromise;
  expect(response.success).toBeTruthy(`Expected successful response, got ${JSON.stringify(response)}`);

  if (additionalValidation != null) {
    additionalValidation(response);
  }

  return response;
}

async function checkLine(session, expectedLine) {
  await checkResponse(session.stackTrace({ threadId: THREAD_ID }), response => {
    expect(response.body.stackFrames[0].line).toBe(expectedLine);
  });
}

async function withSessionLaunch(className, breakpoints, sessionContinuation) {
  let session = null;
  try {
    session = new (_VsDebugSession || _load_VsDebugSession()).default(process.pid.toString(), logger, (await (0, (_JavaDebuggerHelpersService || _load_JavaDebuggerHelpersService()).getJavaVSAdapterExecutableInfo)(false)));
    await checkResponse(session.initialize({
      adapterID: 'java',
      clientID: 'Nuclide-Spec',
      columnsStartAt1: true,
      linesStartAt1: true,
      pathFormat: 'path'
    }));

    await Promise.all([checkResponse(session.launch({
      classPath: JAVA_FIXTURES,
      entryPointClass: className
    })), session.observeThreadEvents().take(4).toPromise(), session.observeInitializeEvents().take(1).toPromise()]);

    await checkResponse(session.setExceptionBreakpoints({ filters: [] }));

    let unverifiedBreakpoints = [];
    if (breakpoints != null) {
      await checkResponse(session.setBreakpoints(breakpoints), response => {
        unverifiedBreakpoints = response.body.breakpoints.filter(bp => !bp.verified);
      });
    }

    await checkResponse(session.configurationDone());

    await session.observeContinuedEvents().take(1).toPromise();

    await sessionContinuation(session, unverifiedBreakpoints);
  } catch (error) {
    logger.error('error in withSessionLaunch', error, error.stack);
    throw error;
  } finally {
    if (session != null) {
      session.dispose();
    }
  }
}

async function continueSession(session) {
  await Promise.all([session.observeContinuedEvents().take(1).toPromise(), checkResponse(session.continue({ threadId: THREAD_ID }))]);
}

async function verifyUnverifiedBreakpoints(session, unverifiedBreakpoints) {
  if (unverifiedBreakpoints.length > 0) {
    let allBreakpointsVerified = false;
    await session.observeBreakpointEvents().take(unverifiedBreakpoints.length).toArray().toPromise().then(result => allBreakpointsVerified = true);

    expect(allBreakpointsVerified).toBeTruthy(`The following breakpoints could not be set: ${JSON.stringify(unverifiedBreakpoints)}`);
  }
}

// eslint-disable-next-line jasmine/no-disabled-tests
xdescribe('vscode-java-debugger', () => {
  let hasDoneSetup = false;
  beforeEach(async () => {
    await (async () => {
      if (hasDoneSetup) {
        return;
      }

      await (0, (_process || _load_process()).runCommand)('env', ['-u', 'NO_BUCKD', './scripts/build'], {
        cwd: JAVA_DEBUGGER_PKG
      }).toPromise();

      const javaFiles = await new Promise((resolve, reject) => {
        _fs.readdir(JAVA_FIXTURES, (err, files) => {
          if (err) {
            reject(err);
          }

          resolve(files.filter(file => file.endsWith('.java')));
        });
      });

      await Promise.all(javaFiles.map(file => (0, (_process || _load_process()).runCommand)('javac', ['-g', file], { cwd: JAVA_FIXTURES }).toPromise()));

      hasDoneSetup = true;
    })();
  });

  afterEach(() => {
    // The java debugger, when it launches a script, uses a port. We need to
    //   wait between each test case to give the system a moment to realize
    //   that the port has been free'd up.
    waits(2000);
  });

  it('launches and outputs console messages', async () => {
    await (async () => {
      await withSessionLaunch('SimpleClass', {
        source: makeSource('SimpleClass.java'),
        breakpoints: [{ line: 11 }]
      }, async (session, unverifiedBreakpoints) => {
        await session.observeOutputEvents().filter(response => response.body.category === 'stdout').map(response => response.body.output).take(1).toPromise().then(output => {
          expect(output).toEqual('Name: Not Aman Agarwal with id: 1234567890\n');
        });
      });
    })();
  });

  it('breaks at a breakpoint', async () => {
    await (async () => {
      await withSessionLaunch('SimpleClass', {
        source: makeSource('SimpleClass.java'),
        breakpoints: [{ line: 11 }]
      }, async (session, unverifiedBreakpoints) => {
        await verifyUnverifiedBreakpoints(session, unverifiedBreakpoints);

        await session.observeStopEvents().take(1).toPromise();

        await checkLine(session, 11);
      });
    })();
  });

  it('sets multiple breakpoints', async () => {
    await (async () => {
      await withSessionLaunch('SimpleClass', {
        source: makeSource('SimpleClass.java'),
        breakpoints: [{ line: 8 }, { line: 23 }]
      }, async (session, unverifiedBreakpoints) => {
        await verifyUnverifiedBreakpoints(session, unverifiedBreakpoints);

        await session.observeStopEvents().take(1).toPromise();
        await checkLine(session, 8);

        await continueSession(session);

        await session.observeStopEvents().take(1).toPromise();
        await checkLine(session, 23);
      });
    })();
  });

  it('supports step-over, step-in, and step-out', async () => {
    await (async () => {
      await withSessionLaunch('SimpleClass', {
        source: makeSource('SimpleClass.java'),
        breakpoints: [{ line: 11 }]
      }, async (session, unverifiedBreakpoints) => {
        await verifyUnverifiedBreakpoints(session, unverifiedBreakpoints);

        await session.observeStopEvents().take(1).toPromise();
        await checkLine(session, 11);

        await checkResponse(session.next({ threadId: THREAD_ID }));
        await checkLine(session, 12);

        await checkResponse(session.stepIn({ threadId: THREAD_ID }));
        await checkLine(session, 22);

        await checkResponse(session.stepOut({ threadId: THREAD_ID }));
        await checkLine(session, 12);
      });
    })();
  });

  it('evaluates expressions', async () => {
    await (async () => {
      await withSessionLaunch('SimpleClass', {
        source: makeSource('SimpleClass.java'),
        breakpoints: [{ line: 11 }]
      }, async (session, unverifiedBreakpoints) => {
        await verifyUnverifiedBreakpoints(session, unverifiedBreakpoints);

        await session.observeStopEvents().take(1).toPromise();
        await checkLine(session, 11);

        const frameId = (await checkResponse(session.stackTrace({ threadId: THREAD_ID }))).body.stackFrames[0].id;
        await checkResponse(session.evaluate({ expression: 'tc', frameId }), response => {
          // we do not check the exact id of the class because any changes made in the class
          //   preparation code causes this id to change, I may add the id back into the test
          //   once the Java debugger codebase has stabilized
          expect(response.body.result.includes('class SimpleClass (loaded by instance of sun.misc.Launcher$AppClassLoader(id=')).toBeTruthy();
        });
      });
    })();
  });

  it('checks threads', async () => {
    await (async () => {
      await withSessionLaunch('SimpleClass', {
        source: makeSource('SimpleClass.java'),
        breakpoints: [{ line: 11 }]
      }, async (session, unverifiedBreakpoints) => {
        await verifyUnverifiedBreakpoints(session, unverifiedBreakpoints);

        await session.observeStopEvents().take(1).toPromise();

        await checkLine(session, 11);

        await checkResponse(session.threads(), response => {
          const { threads } = response.body;
          expect(threads.length).toEqual(4);
          const threadNames = new Set(threads.map(t => t.name));
          const THREAD_NAMES = ['Signal Dispatcher', 'Finalizer', 'Reference Handler', 'main'];
          expect(THREAD_NAMES.every(name => {
            const foundThread = threadNames.has(name);
            expect(foundThread).toBeTruthy('Could not find thread with name: ' + name);
            return foundThread;
          })).toBeTruthy('We are missing some threads');
          expect(threads.filter(t => t.name === 'main' && t.id === 1).length).toBe(1, 'Main thread not found with correct id');
        });
      });
    })();
  });
  // end
});