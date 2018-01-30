"use strict";

let Observable;

module.exports = _client => {
  const remoteModule = {};
  remoteModule.HhvmDebuggerService = class {
    constructor() {
      _client.createRemoteObject("HhvmDebuggerService", this, [], []);
    }

    getOutputWindowObservable() {
      return Observable.fromPromise(Promise.all([_client.marshalArguments(Array.from(arguments), []), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "main.js",
          line: 36
        },
        name: "HhvmDebuggerService"
      })])).switchMap(([args, id]) => _client.callRemoteMethod(id, "getOutputWindowObservable", "observable", args)).concatMap(value => {
        return _client.unmarshal(value, {
          kind: "string"
        });
      }).publish();
    }

    getAtomNotificationObservable() {
      return Observable.fromPromise(Promise.all([_client.marshalArguments(Array.from(arguments), []), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "main.js",
          line: 36
        },
        name: "HhvmDebuggerService"
      })])).switchMap(([args, id]) => _client.callRemoteMethod(id, "getAtomNotificationObservable", "observable", args)).concatMap(value => {
        return _client.unmarshal(value, {
          kind: "named",
          name: "AtomNotification"
        });
      }).publish();
    }

    getNotificationObservable() {
      return Observable.fromPromise(Promise.all([_client.marshalArguments(Array.from(arguments), []), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "main.js",
          line: 36
        },
        name: "HhvmDebuggerService"
      })])).switchMap(([args, id]) => _client.callRemoteMethod(id, "getNotificationObservable", "observable", args)).concatMap(value => {
        return _client.unmarshal(value, {
          kind: "named",
          name: "AtomNotification"
        });
      }).publish();
    }

    getServerMessageObservable() {
      return Observable.fromPromise(Promise.all([_client.marshalArguments(Array.from(arguments), []), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "main.js",
          line: 36
        },
        name: "HhvmDebuggerService"
      })])).switchMap(([args, id]) => _client.callRemoteMethod(id, "getServerMessageObservable", "observable", args)).concatMap(value => {
        return _client.unmarshal(value, {
          kind: "string"
        });
      }).publish();
    }

    debug(arg0) {
      return Promise.all([_client.marshalArguments(Array.from(arguments), [{
        name: "config",
        type: {
          kind: "union",
          types: [{
            kind: "object",
            fields: [{
              name: "action",
              type: {
                kind: "string-literal",
                value: "attach"
              },
              optional: false
            }, {
              name: "targetUri",
              type: {
                kind: "named",
                name: "NuclideUri"
              },
              optional: false
            }, {
              name: "startupDocumentPath",
              type: {
                kind: "string"
              },
              optional: true
            }, {
              name: "debugPort",
              type: {
                kind: "number"
              },
              optional: true
            }]
          }, {
            kind: "object",
            fields: [{
              name: "action",
              type: {
                kind: "string-literal",
                value: "launch"
              },
              optional: false
            }, {
              name: "targetUri",
              type: {
                kind: "named",
                name: "NuclideUri"
              },
              optional: false
            }, {
              name: "startupDocumentPath",
              type: {
                kind: "string"
              },
              optional: true
            }, {
              name: "launchScriptPath",
              type: {
                kind: "named",
                name: "NuclideUri"
              },
              optional: false
            }, {
              name: "scriptArgs",
              type: {
                kind: "array",
                type: {
                  kind: "string"
                }
              },
              optional: false
            }, {
              name: "hhvmRuntimePath",
              type: {
                kind: "string"
              },
              optional: true
            }, {
              name: "hhvmRuntimeArgs",
              type: {
                kind: "array",
                type: {
                  kind: "string"
                }
              },
              optional: false
            }, {
              name: "deferLaunch",
              type: {
                kind: "boolean"
              },
              optional: false
            }, {
              name: "launchWrapperCommand",
              type: {
                kind: "string"
              },
              optional: true
            }]
          }],
          discriminantField: "action"
        }
      }]), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "main.js",
          line: 36
        },
        name: "HhvmDebuggerService"
      })]).then(([args, id]) => _client.callRemoteMethod(id, "debug", "promise", args)).then(value => {
        return _client.unmarshal(value, {
          kind: "string"
        });
      });
    }

    sendCommand(arg0) {
      return Promise.all([_client.marshalArguments(Array.from(arguments), [{
        name: "message",
        type: {
          kind: "string"
        }
      }]), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "main.js",
          line: 36
        },
        name: "HhvmDebuggerService"
      })]).then(([args, id]) => _client.callRemoteMethod(id, "sendCommand", "promise", args)).then(value => {
        return _client.unmarshal(value, {
          kind: "void"
        });
      });
    }

    getLaunchArgs(arg0) {
      return Promise.all([_client.marshalArguments(Array.from(arguments), [{
        name: "config",
        type: {
          kind: "named",
          name: "HHVMLaunchConfig"
        }
      }]), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "main.js",
          line: 36
        },
        name: "HhvmDebuggerService"
      })]).then(([args, id]) => _client.callRemoteMethod(id, "getLaunchArgs", "promise", args)).then(value => {
        return _client.unmarshal(value, {
          kind: "named",
          name: "Object"
        });
      });
    }

    createLogFilePaste() {
      return Promise.all([_client.marshalArguments(Array.from(arguments), []), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "main.js",
          line: 36
        },
        name: "HhvmDebuggerService"
      })]).then(([args, id]) => _client.callRemoteMethod(id, "createLogFilePaste", "promise", args)).then(value => {
        return _client.unmarshal(value, {
          kind: "string"
        });
      });
    }

    getAttachTargetList() {
      return Promise.all([_client.marshalArguments(Array.from(arguments), []), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "main.js",
          line: 36
        },
        name: "HhvmDebuggerService"
      })]).then(([args, id]) => _client.callRemoteMethod(id, "getAttachTargetList", "promise", args)).then(value => {
        return _client.unmarshal(value, {
          kind: "array",
          type: {
            kind: "object",
            fields: [{
              name: "pid",
              type: {
                kind: "number"
              },
              optional: false
            }, {
              name: "command",
              type: {
                kind: "string"
              },
              optional: false
            }]
          }
        });
      });
    }

    dispose() {
      return _client.disposeRemoteObject(this);
    }

  };
  return remoteModule;
};

Object.defineProperty(module.exports, "inject", {
  value: function () {
    Observable = arguments[0];
  }
});
Object.defineProperty(module.exports, "defs", {
  value: {
    Object: {
      kind: "alias",
      name: "Object",
      location: {
        type: "builtin"
      }
    },
    Date: {
      kind: "alias",
      name: "Date",
      location: {
        type: "builtin"
      }
    },
    RegExp: {
      kind: "alias",
      name: "RegExp",
      location: {
        type: "builtin"
      }
    },
    Buffer: {
      kind: "alias",
      name: "Buffer",
      location: {
        type: "builtin"
      }
    },
    "fs.Stats": {
      kind: "alias",
      name: "fs.Stats",
      location: {
        type: "builtin"
      }
    },
    NuclideUri: {
      kind: "alias",
      name: "NuclideUri",
      location: {
        type: "builtin"
      }
    },
    atom$Point: {
      kind: "alias",
      name: "atom$Point",
      location: {
        type: "builtin"
      }
    },
    atom$Range: {
      kind: "alias",
      name: "atom$Range",
      location: {
        type: "builtin"
      }
    },
    HHVMAttachConfig: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 26
      },
      name: "HHVMAttachConfig",
      definition: {
        kind: "object",
        fields: [{
          name: "action",
          type: {
            kind: "string-literal",
            value: "attach"
          },
          optional: false
        }, {
          name: "targetUri",
          type: {
            kind: "named",
            name: "NuclideUri"
          },
          optional: false
        }, {
          name: "startupDocumentPath",
          type: {
            kind: "string"
          },
          optional: true
        }, {
          name: "debugPort",
          type: {
            kind: "number"
          },
          optional: true
        }]
      }
    },
    HHVMLaunchConfig: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 14
      },
      name: "HHVMLaunchConfig",
      definition: {
        kind: "object",
        fields: [{
          name: "action",
          type: {
            kind: "string-literal",
            value: "launch"
          },
          optional: false
        }, {
          name: "targetUri",
          type: {
            kind: "named",
            name: "NuclideUri"
          },
          optional: false
        }, {
          name: "startupDocumentPath",
          type: {
            kind: "string"
          },
          optional: true
        }, {
          name: "launchScriptPath",
          type: {
            kind: "named",
            name: "NuclideUri"
          },
          optional: false
        }, {
          name: "scriptArgs",
          type: {
            kind: "array",
            type: {
              kind: "string"
            }
          },
          optional: false
        }, {
          name: "hhvmRuntimePath",
          type: {
            kind: "string"
          },
          optional: true
        }, {
          name: "hhvmRuntimeArgs",
          type: {
            kind: "array",
            type: {
              kind: "string"
            }
          },
          optional: false
        }, {
          name: "deferLaunch",
          type: {
            kind: "boolean"
          },
          optional: false
        }, {
          name: "launchWrapperCommand",
          type: {
            kind: "string"
          },
          optional: true
        }]
      }
    },
    AtomNotificationType: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 18
      },
      name: "AtomNotificationType",
      definition: {
        kind: "union",
        types: [{
          kind: "string-literal",
          value: "info"
        }, {
          kind: "string-literal",
          value: "warning"
        }, {
          kind: "string-literal",
          value: "error"
        }, {
          kind: "string-literal",
          value: "fatalError"
        }]
      }
    },
    AtomNotification: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 19
      },
      name: "AtomNotification",
      definition: {
        kind: "object",
        fields: [{
          name: "type",
          type: {
            kind: "named",
            name: "AtomNotificationType"
          },
          optional: false
        }, {
          name: "message",
          type: {
            kind: "string"
          },
          optional: false
        }]
      }
    },
    HhvmDebuggerService: {
      kind: "interface",
      name: "HhvmDebuggerService",
      location: {
        type: "source",
        fileName: "main.js",
        line: 36
      },
      constructorArgs: [],
      staticMethods: {},
      instanceMethods: {
        getOutputWindowObservable: {
          location: {
            type: "source",
            fileName: "main.js",
            line: 43
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            kind: "observable",
            type: {
              kind: "string"
            }
          }
        },
        getAtomNotificationObservable: {
          location: {
            type: "source",
            fileName: "main.js",
            line: 47
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            kind: "observable",
            type: {
              kind: "named",
              name: "AtomNotification"
            }
          }
        },
        getNotificationObservable: {
          location: {
            type: "source",
            fileName: "main.js",
            line: 54
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            kind: "observable",
            type: {
              kind: "named",
              name: "AtomNotification"
            }
          }
        },
        getServerMessageObservable: {
          location: {
            type: "source",
            fileName: "main.js",
            line: 58
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            kind: "observable",
            type: {
              kind: "string"
            }
          }
        },
        debug: {
          location: {
            type: "source",
            fileName: "main.js",
            line: 62
          },
          kind: "function",
          argumentTypes: [{
            name: "config",
            type: {
              kind: "union",
              types: [{
                kind: "object",
                fields: [{
                  name: "action",
                  type: {
                    kind: "string-literal",
                    value: "attach"
                  },
                  optional: false
                }, {
                  name: "targetUri",
                  type: {
                    kind: "named",
                    name: "NuclideUri"
                  },
                  optional: false
                }, {
                  name: "startupDocumentPath",
                  type: {
                    kind: "string"
                  },
                  optional: true
                }, {
                  name: "debugPort",
                  type: {
                    kind: "number"
                  },
                  optional: true
                }]
              }, {
                kind: "object",
                fields: [{
                  name: "action",
                  type: {
                    kind: "string-literal",
                    value: "launch"
                  },
                  optional: false
                }, {
                  name: "targetUri",
                  type: {
                    kind: "named",
                    name: "NuclideUri"
                  },
                  optional: false
                }, {
                  name: "startupDocumentPath",
                  type: {
                    kind: "string"
                  },
                  optional: true
                }, {
                  name: "launchScriptPath",
                  type: {
                    kind: "named",
                    name: "NuclideUri"
                  },
                  optional: false
                }, {
                  name: "scriptArgs",
                  type: {
                    kind: "array",
                    type: {
                      kind: "string"
                    }
                  },
                  optional: false
                }, {
                  name: "hhvmRuntimePath",
                  type: {
                    kind: "string"
                  },
                  optional: true
                }, {
                  name: "hhvmRuntimeArgs",
                  type: {
                    kind: "array",
                    type: {
                      kind: "string"
                    }
                  },
                  optional: false
                }, {
                  name: "deferLaunch",
                  type: {
                    kind: "boolean"
                  },
                  optional: false
                }, {
                  name: "launchWrapperCommand",
                  type: {
                    kind: "string"
                  },
                  optional: true
                }]
              }],
              discriminantField: "action"
            }
          }],
          returnType: {
            kind: "promise",
            type: {
              kind: "string"
            }
          }
        },
        sendCommand: {
          location: {
            type: "source",
            fileName: "main.js",
            line: 88
          },
          kind: "function",
          argumentTypes: [{
            name: "message",
            type: {
              kind: "string"
            }
          }],
          returnType: {
            kind: "promise",
            type: {
              kind: "void"
            }
          }
        },
        getLaunchArgs: {
          location: {
            type: "source",
            fileName: "main.js",
            line: 120
          },
          kind: "function",
          argumentTypes: [{
            name: "config",
            type: {
              kind: "named",
              name: "HHVMLaunchConfig"
            }
          }],
          returnType: {
            kind: "promise",
            type: {
              kind: "named",
              name: "Object"
            }
          }
        },
        createLogFilePaste: {
          location: {
            type: "source",
            fileName: "main.js",
            line: 195
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            kind: "promise",
            type: {
              kind: "string"
            }
          }
        },
        getAttachTargetList: {
          location: {
            type: "source",
            fileName: "main.js",
            line: 276
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            kind: "promise",
            type: {
              kind: "array",
              type: {
                kind: "object",
                fields: [{
                  name: "pid",
                  type: {
                    kind: "number"
                  },
                  optional: false
                }, {
                  name: "command",
                  type: {
                    kind: "string"
                  },
                  optional: false
                }]
              }
            }
          }
        },
        dispose: {
          location: {
            type: "source",
            fileName: "main.js",
            line: 297
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            kind: "promise",
            type: {
              kind: "void"
            }
          }
        }
      }
    }
  }
});