"use strict";

module.exports = _client => {
  const remoteModule = {};

  remoteModule.getRootForPath = function (arg0) {
    return _client.callRemoteFunction("BuckService/getRootForPath", "promise", _client.marshalArguments(Array.from(arguments), [{
      name: "file",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }])).then(value => {
      return _client.unmarshal(value, {
        kind: "nullable",
        type: {
          kind: "named",
          name: "NuclideUri"
        }
      });
    });
  };

  remoteModule.getBuildFile = function (arg0, arg1) {
    return _client.callRemoteFunction("BuckService/getBuildFile", "promise", _client.marshalArguments(Array.from(arguments), [{
      name: "rootPath",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "targetName",
      type: {
        kind: "string"
      }
    }])).then(value => {
      return _client.unmarshal(value, {
        kind: "nullable",
        type: {
          kind: "string"
        }
      });
    });
  };

  remoteModule.getOwners = function (arg0, arg1, arg2, arg3) {
    return _client.callRemoteFunction("BuckService/getOwners", "promise", _client.marshalArguments(Array.from(arguments), [{
      name: "rootPath",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "filePath",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "extraArguments",
      type: {
        kind: "array",
        type: {
          kind: "string"
        }
      }
    }, {
      name: "kindFilter",
      type: {
        kind: "nullable",
        type: {
          kind: "string"
        }
      }
    }])).then(value => {
      return _client.unmarshal(value, {
        kind: "array",
        type: {
          kind: "string"
        }
      });
    });
  };

  remoteModule.getBuckConfig = function (arg0, arg1, arg2) {
    return _client.callRemoteFunction("BuckService/getBuckConfig", "promise", _client.marshalArguments(Array.from(arguments), [{
      name: "rootPath",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "section",
      type: {
        kind: "string"
      }
    }, {
      name: "property",
      type: {
        kind: "string"
      }
    }])).then(value => {
      return _client.unmarshal(value, {
        kind: "nullable",
        type: {
          kind: "string"
        }
      });
    });
  };

  remoteModule.build = function (arg0, arg1, arg2) {
    return _client.callRemoteFunction("BuckService/build", "promise", _client.marshalArguments(Array.from(arguments), [{
      name: "rootPath",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "buildTargets",
      type: {
        kind: "array",
        type: {
          kind: "string"
        }
      }
    }, {
      name: "options",
      type: {
        kind: "nullable",
        type: {
          kind: "named",
          name: "BaseBuckBuildOptions"
        }
      }
    }])).then(value => {
      return _client.unmarshal(value, {
        kind: "any"
      });
    });
  };

  remoteModule.install = function (arg0, arg1, arg2, arg3, arg4) {
    return _client.callRemoteFunction("BuckService/install", "promise", _client.marshalArguments(Array.from(arguments), [{
      name: "rootPath",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "buildTargets",
      type: {
        kind: "array",
        type: {
          kind: "string"
        }
      }
    }, {
      name: "simulator",
      type: {
        kind: "nullable",
        type: {
          kind: "string"
        }
      }
    }, {
      name: "run",
      type: {
        kind: "boolean"
      }
    }, {
      name: "debug",
      type: {
        kind: "boolean"
      }
    }])).then(value => {
      return _client.unmarshal(value, {
        kind: "any"
      });
    });
  };

  remoteModule.buildWithOutput = function (arg0, arg1, arg2) {
    return _client.callRemoteFunction("BuckService/buildWithOutput", "observable", _client.marshalArguments(Array.from(arguments), [{
      name: "rootPath",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "buildTargets",
      type: {
        kind: "array",
        type: {
          kind: "string"
        }
      }
    }, {
      name: "extraArguments",
      type: {
        kind: "array",
        type: {
          kind: "string"
        }
      }
    }])).map(value => {
      return _client.unmarshal(value, {
        kind: "named",
        name: "LegacyProcessMessage"
      });
    }).publish();
  };

  remoteModule.testWithOutput = function (arg0, arg1, arg2, arg3) {
    return _client.callRemoteFunction("BuckService/testWithOutput", "observable", _client.marshalArguments(Array.from(arguments), [{
      name: "rootPath",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "buildTargets",
      type: {
        kind: "array",
        type: {
          kind: "string"
        }
      }
    }, {
      name: "extraArguments",
      type: {
        kind: "array",
        type: {
          kind: "string"
        }
      }
    }, {
      name: "debug",
      type: {
        kind: "boolean"
      }
    }])).map(value => {
      return _client.unmarshal(value, {
        kind: "named",
        name: "LegacyProcessMessage"
      });
    }).publish();
  };

  remoteModule.installWithOutput = function (arg0, arg1, arg2, arg3, arg4, arg5) {
    return _client.callRemoteFunction("BuckService/installWithOutput", "observable", _client.marshalArguments(Array.from(arguments), [{
      name: "rootPath",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "buildTargets",
      type: {
        kind: "array",
        type: {
          kind: "string"
        }
      }
    }, {
      name: "extraArguments",
      type: {
        kind: "array",
        type: {
          kind: "string"
        }
      }
    }, {
      name: "simulator",
      type: {
        kind: "nullable",
        type: {
          kind: "string"
        }
      }
    }, {
      name: "run",
      type: {
        kind: "boolean"
      }
    }, {
      name: "debug",
      type: {
        kind: "boolean"
      }
    }])).map(value => {
      return _client.unmarshal(value, {
        kind: "named",
        name: "LegacyProcessMessage"
      });
    }).publish();
  };

  remoteModule.runWithOutput = function (arg0, arg1, arg2, arg3) {
    return _client.callRemoteFunction("BuckService/runWithOutput", "observable", _client.marshalArguments(Array.from(arguments), [{
      name: "rootPath",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "buildTargets",
      type: {
        kind: "array",
        type: {
          kind: "string"
        }
      }
    }, {
      name: "extraArguments",
      type: {
        kind: "array",
        type: {
          kind: "string"
        }
      }
    }, {
      name: "simulator",
      type: {
        kind: "nullable",
        type: {
          kind: "string"
        }
      }
    }])).map(value => {
      return _client.unmarshal(value, {
        kind: "named",
        name: "LegacyProcessMessage"
      });
    }).publish();
  };

  remoteModule.listAliases = function (arg0) {
    return _client.callRemoteFunction("BuckService/listAliases", "promise", _client.marshalArguments(Array.from(arguments), [{
      name: "rootPath",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }])).then(value => {
      return _client.unmarshal(value, {
        kind: "array",
        type: {
          kind: "string"
        }
      });
    });
  };

  remoteModule.listFlavors = function (arg0, arg1, arg2) {
    return _client.callRemoteFunction("BuckService/listFlavors", "promise", _client.marshalArguments(Array.from(arguments), [{
      name: "rootPath",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "targets",
      type: {
        kind: "array",
        type: {
          kind: "string"
        }
      }
    }, {
      name: "additionalArgs",
      type: {
        kind: "nullable",
        type: {
          kind: "array",
          type: {
            kind: "string"
          }
        }
      }
    }])).then(value => {
      return _client.unmarshal(value, {
        kind: "nullable",
        type: {
          kind: "named",
          name: "Object"
        }
      });
    });
  };

  remoteModule.showOutput = function (arg0, arg1, arg2) {
    return _client.callRemoteFunction("BuckService/showOutput", "promise", _client.marshalArguments(Array.from(arguments), [{
      name: "rootPath",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "aliasOrTarget",
      type: {
        kind: "string"
      }
    }, {
      name: "extraArguments",
      type: {
        kind: "nullable",
        type: {
          kind: "array",
          type: {
            kind: "string"
          }
        }
      }
    }])).then(value => {
      return _client.unmarshal(value, {
        kind: "array",
        type: {
          kind: "named",
          name: "Object"
        }
      });
    });
  };

  remoteModule.buildRuleTypeFor = function (arg0, arg1) {
    return _client.callRemoteFunction("BuckService/buildRuleTypeFor", "promise", _client.marshalArguments(Array.from(arguments), [{
      name: "rootPath",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "aliasesOrTargets",
      type: {
        kind: "string"
      }
    }])).then(value => {
      return _client.unmarshal(value, {
        kind: "nullable",
        type: {
          kind: "named",
          name: "ResolvedRuleType"
        }
      });
    });
  };

  remoteModule.clean = function (arg0) {
    return _client.callRemoteFunction("BuckService/clean", "promise", _client.marshalArguments(Array.from(arguments), [{
      name: "rootPath",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }])).then(value => {
      return _client.unmarshal(value, {
        kind: "void"
      });
    });
  };

  remoteModule.kill = function (arg0) {
    return _client.callRemoteFunction("BuckService/kill", "promise", _client.marshalArguments(Array.from(arguments), [{
      name: "rootPath",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }])).then(value => {
      return _client.unmarshal(value, {
        kind: "void"
      });
    });
  };

  remoteModule.getHTTPServerPort = function (arg0) {
    return _client.callRemoteFunction("BuckService/getHTTPServerPort", "promise", _client.marshalArguments(Array.from(arguments), [{
      name: "rootPath",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }])).then(value => {
      return _client.unmarshal(value, {
        kind: "number"
      });
    });
  };

  remoteModule.query = function (arg0, arg1, arg2) {
    return _client.callRemoteFunction("BuckService/query", "promise", _client.marshalArguments(Array.from(arguments), [{
      name: "rootPath",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "queryString",
      type: {
        kind: "string"
      }
    }, {
      name: "extraArguments",
      type: {
        kind: "array",
        type: {
          kind: "string"
        }
      }
    }])).then(value => {
      return _client.unmarshal(value, {
        kind: "array",
        type: {
          kind: "string"
        }
      });
    });
  };

  remoteModule.queryWithArgs = function (arg0, arg1, arg2) {
    return _client.callRemoteFunction("BuckService/queryWithArgs", "promise", _client.marshalArguments(Array.from(arguments), [{
      name: "rootPath",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "queryString",
      type: {
        kind: "string"
      }
    }, {
      name: "args",
      type: {
        kind: "array",
        type: {
          kind: "string"
        }
      }
    }])).then(value => {
      return _client.unmarshal(value, {
        kind: "object",
        fields: []
      });
    });
  };

  remoteModule.queryWithAttributes = function (arg0, arg1, arg2) {
    return _client.callRemoteFunction("BuckService/queryWithAttributes", "promise", _client.marshalArguments(Array.from(arguments), [{
      name: "rootPath",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "queryString",
      type: {
        kind: "string"
      }
    }, {
      name: "attributes",
      type: {
        kind: "array",
        type: {
          kind: "string"
        }
      }
    }])).then(value => {
      return _client.unmarshal(value, {
        kind: "object",
        fields: []
      });
    });
  };

  remoteModule.getWebSocketStream = function (arg0, arg1) {
    return _client.callRemoteFunction("BuckService/getWebSocketStream", "observable", _client.marshalArguments(Array.from(arguments), [{
      name: "rootPath",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "httpPort",
      type: {
        kind: "number"
      }
    }])).map(value => {
      return _client.unmarshal(value, {
        kind: "named",
        name: "Object"
      });
    }).publish();
  };

  remoteModule.resetCompilationDatabaseForSource = function (arg0, arg1) {
    return _client.callRemoteFunction("BuckService/resetCompilationDatabaseForSource", "promise", _client.marshalArguments(Array.from(arguments), [{
      name: "src",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "params",
      type: {
        kind: "named",
        name: "CompilationDatabaseParams"
      }
    }])).then(value => {
      return _client.unmarshal(value, {
        kind: "void"
      });
    });
  };

  remoteModule.resetCompilationDatabase = function (arg0) {
    return _client.callRemoteFunction("BuckService/resetCompilationDatabase", "promise", _client.marshalArguments(Array.from(arguments), [{
      name: "params",
      type: {
        kind: "named",
        name: "CompilationDatabaseParams"
      }
    }])).then(value => {
      return _client.unmarshal(value, {
        kind: "void"
      });
    });
  };

  remoteModule.getCompilationDatabase = function (arg0, arg1) {
    return _client.callRemoteFunction("BuckService/getCompilationDatabase", "observable", _client.marshalArguments(Array.from(arguments), [{
      name: "src",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "params",
      type: {
        kind: "named",
        name: "CompilationDatabaseParams"
      }
    }])).map(value => {
      return _client.unmarshal(value, {
        kind: "nullable",
        type: {
          kind: "named",
          name: "BuckClangCompilationDatabase"
        }
      });
    }).publish();
  };

  return remoteModule;
};

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
    BuckWebSocketMessage: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 34
      },
      name: "BuckWebSocketMessage",
      definition: {
        kind: "union",
        types: [{
          kind: "object",
          fields: [{
            name: "type",
            type: {
              kind: "string-literal",
              value: "SocketConnected"
            },
            optional: false
          }]
        }, {
          kind: "object",
          fields: [{
            name: "type",
            type: {
              kind: "string-literal",
              value: "BuildProgressUpdated"
            },
            optional: false
          }, {
            name: "progressValue",
            type: {
              kind: "number"
            },
            optional: false
          }]
        }, {
          kind: "object",
          fields: [{
            name: "type",
            type: {
              kind: "string-literal",
              value: "BuildFinished"
            },
            optional: false
          }, {
            name: "exitCode",
            type: {
              kind: "number"
            },
            optional: false
          }]
        }, {
          kind: "object",
          fields: [{
            name: "type",
            type: {
              kind: "string-literal",
              value: "BuildStarted"
            },
            optional: false
          }]
        }, {
          kind: "object",
          fields: [{
            name: "type",
            type: {
              kind: "string-literal",
              value: "ConsoleEvent"
            },
            optional: false
          }, {
            name: "message",
            type: {
              kind: "string"
            },
            optional: false
          }, {
            name: "level",
            type: {
              kind: "object",
              fields: [{
                name: "name",
                type: {
                  kind: "union",
                  types: [{
                    kind: "string-literal",
                    value: "OFF"
                  }, {
                    kind: "string-literal",
                    value: "SEVERE"
                  }, {
                    kind: "string-literal",
                    value: "WARNING"
                  }, {
                    kind: "string-literal",
                    value: "INFO"
                  }, {
                    kind: "string-literal",
                    value: "CONFIG"
                  }, {
                    kind: "string-literal",
                    value: "FINE"
                  }, {
                    kind: "string-literal",
                    value: "FINER"
                  }, {
                    kind: "string-literal",
                    value: "FINEST"
                  }, {
                    kind: "string-literal",
                    value: "ALL"
                  }]
                },
                optional: false
              }]
            },
            optional: false
          }]
        }, {
          kind: "object",
          fields: [{
            name: "type",
            type: {
              kind: "string-literal",
              value: "ParseStarted"
            },
            optional: false
          }]
        }, {
          kind: "object",
          fields: [{
            name: "type",
            type: {
              kind: "string-literal",
              value: "ParseFinished"
            },
            optional: false
          }]
        }, {
          kind: "object",
          fields: [{
            name: "type",
            type: {
              kind: "string-literal",
              value: "InstallFinished"
            },
            optional: false
          }, {
            name: "success",
            type: {
              kind: "boolean"
            },
            optional: false
          }, {
            name: "pid",
            type: {
              kind: "number"
            },
            optional: true
          }]
        }, {
          kind: "object",
          fields: [{
            name: "type",
            type: {
              kind: "string-literal",
              value: "RunStarted"
            },
            optional: false
          }]
        }, {
          kind: "object",
          fields: [{
            name: "type",
            type: {
              kind: "string-literal",
              value: "RunComplete"
            },
            optional: false
          }]
        }, {
          kind: "object",
          fields: [{
            name: "type",
            type: {
              kind: "string-literal",
              value: "ResultsAvailable"
            },
            optional: false
          }, {
            name: "results",
            type: {
              kind: "object",
              fields: [{
                name: "buildTarget",
                type: {
                  kind: "object",
                  fields: [{
                    name: "shortName",
                    type: {
                      kind: "string"
                    },
                    optional: false
                  }, {
                    name: "baseName",
                    type: {
                      kind: "string"
                    },
                    optional: false
                  }]
                },
                optional: false
              }, {
                name: "success",
                type: {
                  kind: "boolean"
                },
                optional: false
              }, {
                name: "failureCount",
                type: {
                  kind: "number"
                },
                optional: false
              }, {
                name: "totalNumberOfTests",
                type: {
                  kind: "number"
                },
                optional: false
              }, {
                name: "testCases",
                type: {
                  kind: "array",
                  type: {
                    kind: "object",
                    fields: [{
                      name: "success",
                      type: {
                        kind: "boolean"
                      },
                      optional: false
                    }, {
                      name: "failureCount",
                      type: {
                        kind: "number"
                      },
                      optional: false
                    }, {
                      name: "skippedCount",
                      type: {
                        kind: "number"
                      },
                      optional: false
                    }, {
                      name: "testCaseName",
                      type: {
                        kind: "string"
                      },
                      optional: false
                    }, {
                      name: "testResults",
                      type: {
                        kind: "array",
                        type: {
                          kind: "object",
                          fields: [{
                            name: "testCaseName",
                            type: {
                              kind: "string"
                            },
                            optional: false
                          }, {
                            name: "testName",
                            type: {
                              kind: "string"
                            },
                            optional: false
                          }, {
                            name: "type",
                            type: {
                              kind: "string"
                            },
                            optional: false
                          }, {
                            name: "time",
                            type: {
                              kind: "number"
                            },
                            optional: false
                          }, {
                            name: "message",
                            type: {
                              kind: "string"
                            },
                            optional: false
                          }, {
                            name: "stacktrace",
                            type: {
                              kind: "nullable",
                              type: {
                                kind: "string"
                              }
                            },
                            optional: false
                          }, {
                            name: "stdOut",
                            type: {
                              kind: "string"
                            },
                            optional: false
                          }, {
                            name: "stdErr",
                            type: {
                              kind: "string"
                            },
                            optional: false
                          }]
                        }
                      },
                      optional: false
                    }]
                  }
                },
                optional: false
              }]
            },
            optional: false
          }]
        }, {
          kind: "object",
          fields: [{
            name: "type",
            type: {
              kind: "string-literal",
              value: "CompilerErrorEvent"
            },
            optional: false
          }, {
            name: "error",
            type: {
              kind: "string"
            },
            optional: false
          }, {
            name: "suggestions",
            type: {
              kind: "array",
              type: {
                kind: "mixed"
              }
            },
            optional: false
          }, {
            name: "compilerType",
            type: {
              kind: "string"
            },
            optional: false
          }]
        }],
        discriminantField: "type"
      }
    },
    getRootForPath: {
      kind: "function",
      name: "getRootForPath",
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 124
      },
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 124
        },
        kind: "function",
        argumentTypes: [{
          name: "file",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "nullable",
            type: {
              kind: "named",
              name: "NuclideUri"
            }
          }
        }
      }
    },
    getBuildFile: {
      kind: "function",
      name: "getBuildFile",
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 131
      },
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 131
        },
        kind: "function",
        argumentTypes: [{
          name: "rootPath",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "targetName",
          type: {
            kind: "string"
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "nullable",
            type: {
              kind: "string"
            }
          }
        }
      }
    },
    getOwners: {
      kind: "function",
      name: "getOwners",
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 150
      },
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 150
        },
        kind: "function",
        argumentTypes: [{
          name: "rootPath",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "filePath",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "extraArguments",
          type: {
            kind: "array",
            type: {
              kind: "string"
            }
          }
        }, {
          name: "kindFilter",
          type: {
            kind: "nullable",
            type: {
              kind: "string"
            }
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "array",
            type: {
              kind: "string"
            }
          }
        }
      }
    },
    getBuckConfig: {
      kind: "function",
      name: "getBuckConfig",
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 172
      },
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 172
        },
        kind: "function",
        argumentTypes: [{
          name: "rootPath",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "section",
          type: {
            kind: "string"
          }
        }, {
          name: "property",
          type: {
            kind: "string"
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "nullable",
            type: {
              kind: "string"
            }
          }
        }
      }
    },
    BaseBuckBuildOptions: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 14
      },
      name: "BaseBuckBuildOptions",
      definition: {
        kind: "object",
        fields: [{
          name: "install",
          type: {
            kind: "boolean"
          },
          optional: true
        }, {
          name: "run",
          type: {
            kind: "boolean"
          },
          optional: true
        }, {
          name: "test",
          type: {
            kind: "boolean"
          },
          optional: true
        }, {
          name: "debug",
          type: {
            kind: "boolean"
          },
          optional: true
        }, {
          name: "simulator",
          type: {
            kind: "nullable",
            type: {
              kind: "string"
            }
          },
          optional: true
        }, {
          name: "commandOptions",
          type: {
            kind: "named",
            name: "Object"
          },
          optional: true
        }, {
          name: "extraArguments",
          type: {
            kind: "array",
            type: {
              kind: "string"
            }
          },
          optional: true
        }]
      }
    },
    build: {
      kind: "function",
      name: "build",
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 210
      },
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 210
        },
        kind: "function",
        argumentTypes: [{
          name: "rootPath",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "buildTargets",
          type: {
            kind: "array",
            type: {
              kind: "string"
            }
          }
        }, {
          name: "options",
          type: {
            kind: "nullable",
            type: {
              kind: "named",
              name: "BaseBuckBuildOptions"
            }
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "any"
          }
        }
      }
    },
    install: {
      kind: "function",
      name: "install",
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 229
      },
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 229
        },
        kind: "function",
        argumentTypes: [{
          name: "rootPath",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "buildTargets",
          type: {
            kind: "array",
            type: {
              kind: "string"
            }
          }
        }, {
          name: "simulator",
          type: {
            kind: "nullable",
            type: {
              kind: "string"
            }
          }
        }, {
          name: "run",
          type: {
            kind: "boolean"
          }
        }, {
          name: "debug",
          type: {
            kind: "boolean"
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "any"
          }
        }
      }
    },
    ProcessExitMessage: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "process.js",
        line: 665
      },
      name: "ProcessExitMessage",
      definition: {
        kind: "object",
        fields: [{
          name: "kind",
          type: {
            kind: "string-literal",
            value: "exit"
          },
          optional: false
        }, {
          name: "exitCode",
          type: {
            kind: "nullable",
            type: {
              kind: "number"
            }
          },
          optional: false
        }, {
          name: "signal",
          type: {
            kind: "nullable",
            type: {
              kind: "string"
            }
          },
          optional: false
        }]
      }
    },
    ProcessMessage: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "process.js",
        line: 671
      },
      name: "ProcessMessage",
      definition: {
        kind: "union",
        types: [{
          kind: "object",
          fields: [{
            name: "kind",
            type: {
              kind: "string-literal",
              value: "stdout"
            },
            optional: false
          }, {
            name: "data",
            type: {
              kind: "string"
            },
            optional: false
          }]
        }, {
          kind: "object",
          fields: [{
            name: "kind",
            type: {
              kind: "string-literal",
              value: "stderr"
            },
            optional: false
          }, {
            name: "data",
            type: {
              kind: "string"
            },
            optional: false
          }]
        }, {
          kind: "object",
          fields: [{
            name: "kind",
            type: {
              kind: "string-literal",
              value: "exit"
            },
            optional: false
          }, {
            name: "exitCode",
            type: {
              kind: "nullable",
              type: {
                kind: "number"
              }
            },
            optional: false
          }, {
            name: "signal",
            type: {
              kind: "nullable",
              type: {
                kind: "string"
              }
            },
            optional: false
          }]
        }],
        discriminantField: "kind"
      }
    },
    LegacyProcessMessage: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "process.js",
        line: 684
      },
      name: "LegacyProcessMessage",
      definition: {
        kind: "union",
        types: [{
          kind: "object",
          fields: [{
            name: "kind",
            type: {
              kind: "string-literal",
              value: "stdout"
            },
            optional: false
          }, {
            name: "data",
            type: {
              kind: "string"
            },
            optional: false
          }]
        }, {
          kind: "object",
          fields: [{
            name: "kind",
            type: {
              kind: "string-literal",
              value: "stderr"
            },
            optional: false
          }, {
            name: "data",
            type: {
              kind: "string"
            },
            optional: false
          }]
        }, {
          kind: "object",
          fields: [{
            name: "kind",
            type: {
              kind: "string-literal",
              value: "exit"
            },
            optional: false
          }, {
            name: "exitCode",
            type: {
              kind: "nullable",
              type: {
                kind: "number"
              }
            },
            optional: false
          }, {
            name: "signal",
            type: {
              kind: "nullable",
              type: {
                kind: "string"
              }
            },
            optional: false
          }]
        }, {
          kind: "object",
          fields: [{
            name: "kind",
            type: {
              kind: "string-literal",
              value: "error"
            },
            optional: false
          }, {
            name: "error",
            type: {
              kind: "named",
              name: "Object"
            },
            optional: false
          }]
        }],
        discriminantField: "kind"
      }
    },
    buildWithOutput: {
      kind: "function",
      name: "buildWithOutput",
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 255
      },
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 255
        },
        kind: "function",
        argumentTypes: [{
          name: "rootPath",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "buildTargets",
          type: {
            kind: "array",
            type: {
              kind: "string"
            }
          }
        }, {
          name: "extraArguments",
          type: {
            kind: "array",
            type: {
              kind: "string"
            }
          }
        }],
        returnType: {
          kind: "observable",
          type: {
            kind: "named",
            name: "LegacyProcessMessage"
          }
        }
      }
    },
    testWithOutput: {
      kind: "function",
      name: "testWithOutput",
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 275
      },
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 275
        },
        kind: "function",
        argumentTypes: [{
          name: "rootPath",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "buildTargets",
          type: {
            kind: "array",
            type: {
              kind: "string"
            }
          }
        }, {
          name: "extraArguments",
          type: {
            kind: "array",
            type: {
              kind: "string"
            }
          }
        }, {
          name: "debug",
          type: {
            kind: "boolean"
          }
        }],
        returnType: {
          kind: "observable",
          type: {
            kind: "named",
            name: "LegacyProcessMessage"
          }
        }
      }
    },
    installWithOutput: {
      kind: "function",
      name: "installWithOutput",
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 300
      },
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 300
        },
        kind: "function",
        argumentTypes: [{
          name: "rootPath",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "buildTargets",
          type: {
            kind: "array",
            type: {
              kind: "string"
            }
          }
        }, {
          name: "extraArguments",
          type: {
            kind: "array",
            type: {
              kind: "string"
            }
          }
        }, {
          name: "simulator",
          type: {
            kind: "nullable",
            type: {
              kind: "string"
            }
          }
        }, {
          name: "run",
          type: {
            kind: "boolean"
          }
        }, {
          name: "debug",
          type: {
            kind: "boolean"
          }
        }],
        returnType: {
          kind: "observable",
          type: {
            kind: "named",
            name: "LegacyProcessMessage"
          }
        }
      }
    },
    runWithOutput: {
      kind: "function",
      name: "runWithOutput",
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 318
      },
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 318
        },
        kind: "function",
        argumentTypes: [{
          name: "rootPath",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "buildTargets",
          type: {
            kind: "array",
            type: {
              kind: "string"
            }
          }
        }, {
          name: "extraArguments",
          type: {
            kind: "array",
            type: {
              kind: "string"
            }
          }
        }, {
          name: "simulator",
          type: {
            kind: "nullable",
            type: {
              kind: "string"
            }
          }
        }],
        returnType: {
          kind: "observable",
          type: {
            kind: "named",
            name: "LegacyProcessMessage"
          }
        }
      }
    },
    listAliases: {
      kind: "function",
      name: "listAliases",
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 369
      },
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 369
        },
        kind: "function",
        argumentTypes: [{
          name: "rootPath",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "array",
            type: {
              kind: "string"
            }
          }
        }
      }
    },
    listFlavors: {
      kind: "function",
      name: "listFlavors",
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 381
      },
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 381
        },
        kind: "function",
        argumentTypes: [{
          name: "rootPath",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "targets",
          type: {
            kind: "array",
            type: {
              kind: "string"
            }
          }
        }, {
          name: "additionalArgs",
          type: {
            kind: "nullable",
            type: {
              kind: "array",
              type: {
                kind: "string"
              }
            }
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "nullable",
            type: {
              kind: "named",
              name: "Object"
            }
          }
        }
      }
    },
    showOutput: {
      kind: "function",
      name: "showOutput",
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 407
      },
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 407
        },
        kind: "function",
        argumentTypes: [{
          name: "rootPath",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "aliasOrTarget",
          type: {
            kind: "string"
          }
        }, {
          name: "extraArguments",
          type: {
            kind: "nullable",
            type: {
              kind: "array",
              type: {
                kind: "string"
              }
            }
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "array",
            type: {
              kind: "named",
              name: "Object"
            }
          }
        }
      }
    },
    ResolvedBuildTarget: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 25
      },
      name: "ResolvedBuildTarget",
      definition: {
        kind: "object",
        fields: [{
          name: "qualifiedName",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "flavors",
          type: {
            kind: "array",
            type: {
              kind: "string"
            }
          },
          optional: false
        }]
      }
    },
    ResolvedRuleType: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 30
      },
      name: "ResolvedRuleType",
      definition: {
        kind: "object",
        fields: [{
          name: "type",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "buildTarget",
          type: {
            kind: "named",
            name: "ResolvedBuildTarget"
          },
          optional: false
        }]
      }
    },
    buildRuleTypeFor: {
      kind: "function",
      name: "buildRuleTypeFor",
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 422
      },
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 422
        },
        kind: "function",
        argumentTypes: [{
          name: "rootPath",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "aliasesOrTargets",
          type: {
            kind: "string"
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "nullable",
            type: {
              kind: "named",
              name: "ResolvedRuleType"
            }
          }
        }
      }
    },
    clean: {
      kind: "function",
      name: "clean",
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 446
      },
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 446
        },
        kind: "function",
        argumentTypes: [{
          name: "rootPath",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "void"
          }
        }
      }
    },
    kill: {
      kind: "function",
      name: "kill",
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 450
      },
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 450
        },
        kind: "function",
        argumentTypes: [{
          name: "rootPath",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "void"
          }
        }
      }
    },
    getHTTPServerPort: {
      kind: "function",
      name: "getHTTPServerPort",
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 527
      },
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 527
        },
        kind: "function",
        argumentTypes: [{
          name: "rootPath",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "number"
          }
        }
      }
    },
    query: {
      kind: "function",
      name: "query",
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 560
      },
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 560
        },
        kind: "function",
        argumentTypes: [{
          name: "rootPath",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "queryString",
          type: {
            kind: "string"
          }
        }, {
          name: "extraArguments",
          type: {
            kind: "array",
            type: {
              kind: "string"
            }
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "array",
            type: {
              kind: "string"
            }
          }
        }
      }
    },
    queryWithArgs: {
      kind: "function",
      name: "queryWithArgs",
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 577
      },
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 577
        },
        kind: "function",
        argumentTypes: [{
          name: "rootPath",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "queryString",
          type: {
            kind: "string"
          }
        }, {
          name: "args",
          type: {
            kind: "array",
            type: {
              kind: "string"
            }
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "object",
            fields: []
          }
        }
      }
    },
    queryWithAttributes: {
      kind: "function",
      name: "queryWithAttributes",
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 610
      },
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 610
        },
        kind: "function",
        argumentTypes: [{
          name: "rootPath",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "queryString",
          type: {
            kind: "string"
          }
        }, {
          name: "attributes",
          type: {
            kind: "array",
            type: {
              kind: "string"
            }
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "object",
            fields: []
          }
        }
      }
    },
    getWebSocketStream: {
      kind: "function",
      name: "getWebSocketStream",
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 631
      },
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 631
        },
        kind: "function",
        argumentTypes: [{
          name: "rootPath",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "httpPort",
          type: {
            kind: "number"
          }
        }],
        returnType: {
          kind: "observable",
          type: {
            kind: "named",
            name: "Object"
          }
        }
      }
    },
    CompilationDatabaseParams: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 122
      },
      name: "CompilationDatabaseParams",
      definition: {
        kind: "object",
        fields: [{
          name: "flavorsForTarget",
          type: {
            kind: "array",
            type: {
              kind: "string"
            }
          },
          optional: false
        }, {
          name: "args",
          type: {
            kind: "array",
            type: {
              kind: "string"
            }
          },
          optional: false
        }, {
          name: "useDefaultPlatform",
          type: {
            kind: "boolean"
          },
          optional: true
        }]
      }
    },
    resetCompilationDatabaseForSource: {
      kind: "function",
      name: "resetCompilationDatabaseForSource",
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 638
      },
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 638
        },
        kind: "function",
        argumentTypes: [{
          name: "src",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "params",
          type: {
            kind: "named",
            name: "CompilationDatabaseParams"
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "void"
          }
        }
      }
    },
    resetCompilationDatabase: {
      kind: "function",
      name: "resetCompilationDatabase",
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 645
      },
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 645
        },
        kind: "function",
        argumentTypes: [{
          name: "params",
          type: {
            kind: "named",
            name: "CompilationDatabaseParams"
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "void"
          }
        }
      }
    },
    BuckClangCompilationDatabase: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 35
      },
      name: "BuckClangCompilationDatabase",
      definition: {
        kind: "object",
        fields: [{
          name: "file",
          type: {
            kind: "nullable",
            type: {
              kind: "string"
            }
          },
          optional: false
        }, {
          name: "flagsFile",
          type: {
            kind: "nullable",
            type: {
              kind: "string"
            }
          },
          optional: false
        }, {
          name: "libclangPath",
          type: {
            kind: "nullable",
            type: {
              kind: "string"
            }
          },
          optional: false
        }, {
          name: "warnings",
          type: {
            kind: "array",
            type: {
              kind: "string"
            }
          },
          optional: false
        }]
      }
    },
    getCompilationDatabase: {
      kind: "function",
      name: "getCompilationDatabase",
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 651
      },
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 651
        },
        kind: "function",
        argumentTypes: [{
          name: "src",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "params",
          type: {
            kind: "named",
            name: "CompilationDatabaseParams"
          }
        }],
        returnType: {
          kind: "observable",
          type: {
            kind: "nullable",
            type: {
              kind: "named",
              name: "BuckClangCompilationDatabase"
            }
          }
        }
      }
    }
  }
});