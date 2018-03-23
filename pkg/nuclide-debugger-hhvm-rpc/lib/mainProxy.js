"use strict";

let Observable;

module.exports = _client => {
  const remoteModule = {};

  remoteModule.getDebuggerArgs = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
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
          }, {
            name: "cwd",
            type: {
              kind: "string"
            },
            optional: true
          }]
        }],
        discriminantField: "action"
      }
    }]).then(args => {
      return _client.callRemoteFunction("HhvmDebuggerService/getDebuggerArgs", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "named",
        name: "Object"
      });
    });
  };

  remoteModule.getLaunchArgs = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "config",
      type: {
        kind: "named",
        name: "HHVMLaunchConfig"
      }
    }]).then(args => {
      return _client.callRemoteFunction("HhvmDebuggerService/getLaunchArgs", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "named",
        name: "Object"
      });
    });
  };

  remoteModule.createLogFilePaste = function () {
    return _client.marshalArguments(Array.from(arguments), []).then(args => {
      return _client.callRemoteFunction("HhvmDebuggerService/createLogFilePaste", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "string"
      });
    });
  };

  remoteModule.getAttachTargetList = function () {
    return _client.marshalArguments(Array.from(arguments), []).then(args => {
      return _client.callRemoteFunction("HhvmDebuggerService/getAttachTargetList", "promise", args);
    }).then(value => {
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
        line: 27
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
        }, {
          name: "cwd",
          type: {
            kind: "string"
          },
          optional: true
        }]
      }
    },
    getDebuggerArgs: {
      kind: "function",
      name: "getDebuggerArgs",
      location: {
        type: "source",
        fileName: "main.js",
        line: 29
      },
      type: {
        location: {
          type: "source",
          fileName: "main.js",
          line: 29
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
              }, {
                name: "cwd",
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
            kind: "named",
            name: "Object"
          }
        }
      }
    },
    getLaunchArgs: {
      kind: "function",
      name: "getLaunchArgs",
      location: {
        type: "source",
        fileName: "main.js",
        line: 55
      },
      type: {
        location: {
          type: "source",
          fileName: "main.js",
          line: 55
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
      }
    },
    createLogFilePaste: {
      kind: "function",
      name: "createLogFilePaste",
      location: {
        type: "source",
        fileName: "main.js",
        line: 186
      },
      type: {
        location: {
          type: "source",
          fileName: "main.js",
          line: 186
        },
        kind: "function",
        argumentTypes: [],
        returnType: {
          kind: "promise",
          type: {
            kind: "string"
          }
        }
      }
    },
    getAttachTargetList: {
      kind: "function",
      name: "getAttachTargetList",
      location: {
        type: "source",
        fileName: "main.js",
        line: 271
      },
      type: {
        location: {
          type: "source",
          fileName: "main.js",
          line: 271
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
      }
    }
  }
});