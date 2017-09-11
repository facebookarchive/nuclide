"use strict";

let Observable;

module.exports = _client => {
  const remoteModule = {};

  remoteModule.findArcConfigDirectory = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "fileName",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("ArcanistService/findArcConfigDirectory", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "nullable",
        type: {
          kind: "named",
          name: "NuclideUri"
        }
      });
    });
  };

  remoteModule.readArcConfig = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "fileName",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("ArcanistService/readArcConfig", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "nullable",
        type: {
          kind: "any"
        }
      });
    });
  };

  remoteModule.getArcConfigKey = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "fileName",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "key",
      type: {
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("ArcanistService/getArcConfigKey", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "nullable",
        type: {
          kind: "string"
        }
      });
    });
  };

  remoteModule.findArcProjectIdOfPath = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "fileName",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("ArcanistService/findArcProjectIdOfPath", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "nullable",
        type: {
          kind: "string"
        }
      });
    });
  };

  remoteModule.findArcProjectIdAndDirectory = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "fileName",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("ArcanistService/findArcProjectIdAndDirectory", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "nullable",
        type: {
          kind: "object",
          fields: [{
            name: "projectId",
            type: {
              kind: "string"
            },
            optional: false
          }, {
            name: "directory",
            type: {
              kind: "named",
              name: "NuclideUri"
            },
            optional: false
          }]
        }
      });
    });
  };

  remoteModule.getProjectRelativePath = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "fileName",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("ArcanistService/getProjectRelativePath", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "nullable",
        type: {
          kind: "string"
        }
      });
    });
  };

  remoteModule.findDiagnostics = function (arg0, arg1) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "path",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "skip",
      type: {
        kind: "array",
        type: {
          kind: "string"
        }
      }
    }])).switchMap(args => {
      return _client.callRemoteFunction("ArcanistService/findDiagnostics", "observable", args);
    }).concatMap(value => {
      return _client.unmarshal(value, {
        kind: "named",
        name: "ArcDiagnostic"
      });
    }).publish();
  };

  remoteModule.createPhabricatorRevision = function (arg0, arg1, arg2) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "filePath",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "isPrepareMode",
      type: {
        kind: "boolean"
      }
    }, {
      name: "lintExcuse",
      type: {
        kind: "nullable",
        type: {
          kind: "string"
        }
      }
    }])).switchMap(args => {
      return _client.callRemoteFunction("ArcanistService/createPhabricatorRevision", "observable", args);
    }).concatMap(value => {
      return _client.unmarshal(value, {
        kind: "object",
        fields: [{
          name: "stderr",
          type: {
            kind: "string"
          },
          optional: true
        }, {
          name: "stdout",
          type: {
            kind: "string"
          },
          optional: true
        }]
      });
    }).publish();
  };

  remoteModule.updatePhabricatorRevision = function (arg0, arg1, arg2, arg3, arg4) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "filePath",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "message",
      type: {
        kind: "string"
      }
    }, {
      name: "allowUntracked",
      type: {
        kind: "boolean"
      }
    }, {
      name: "lintExcuse",
      type: {
        kind: "nullable",
        type: {
          kind: "string"
        }
      }
    }, {
      name: "verbatimModeEnabled",
      type: {
        kind: "boolean"
      }
    }])).switchMap(args => {
      return _client.callRemoteFunction("ArcanistService/updatePhabricatorRevision", "observable", args);
    }).concatMap(value => {
      return _client.unmarshal(value, {
        kind: "object",
        fields: [{
          name: "stderr",
          type: {
            kind: "string"
          },
          optional: true
        }, {
          name: "stdout",
          type: {
            kind: "string"
          },
          optional: true
        }]
      });
    }).publish();
  };

  remoteModule.execArcPull = function (arg0, arg1, arg2) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "cwd",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "fetchLatest",
      type: {
        kind: "boolean"
      }
    }, {
      name: "allowDirtyChanges",
      type: {
        kind: "boolean"
      }
    }])).switchMap(args => {
      return _client.callRemoteFunction("ArcanistService/execArcPull", "observable", args);
    }).concatMap(value => {
      return _client.unmarshal(value, {
        kind: "named",
        name: "LegacyProcessMessage"
      });
    }).publish();
  };

  remoteModule.execArcLand = function (arg0) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "cwd",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }])).switchMap(args => {
      return _client.callRemoteFunction("ArcanistService/execArcLand", "observable", args);
    }).concatMap(value => {
      return _client.unmarshal(value, {
        kind: "named",
        name: "LegacyProcessMessage"
      });
    }).publish();
  };

  remoteModule.execArcPatch = function (arg0, arg1) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "cwd",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "differentialRevision",
      type: {
        kind: "string"
      }
    }])).switchMap(args => {
      return _client.callRemoteFunction("ArcanistService/execArcPatch", "observable", args);
    }).concatMap(value => {
      return _client.unmarshal(value, {
        kind: "named",
        name: "LegacyProcessMessage"
      });
    }).publish();
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
    ArcDiagnostic: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "ArcanistService.js",
        line: 38
      },
      name: "ArcDiagnostic",
      definition: {
        kind: "object",
        fields: [{
          name: "type",
          type: {
            kind: "union",
            types: [{
              kind: "string-literal",
              value: "Error"
            }, {
              kind: "string-literal",
              value: "Warning"
            }]
          },
          optional: false
        }, {
          name: "text",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "filePath",
          type: {
            kind: "named",
            name: "NuclideUri"
          },
          optional: false
        }, {
          name: "row",
          type: {
            kind: "number"
          },
          optional: false
        }, {
          name: "col",
          type: {
            kind: "number"
          },
          optional: false
        }, {
          name: "code",
          type: {
            kind: "nullable",
            type: {
              kind: "string"
            }
          },
          optional: false
        }, {
          name: "original",
          type: {
            kind: "string"
          },
          optional: true
        }, {
          name: "replacement",
          type: {
            kind: "string"
          },
          optional: true
        }]
      }
    },
    findArcConfigDirectory: {
      kind: "function",
      name: "findArcConfigDirectory",
      location: {
        type: "source",
        fileName: "ArcanistService.js",
        line: 57
      },
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 57
        },
        kind: "function",
        argumentTypes: [{
          name: "fileName",
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
    readArcConfig: {
      kind: "function",
      name: "readArcConfig",
      location: {
        type: "source",
        fileName: "ArcanistService.js",
        line: 70
      },
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 70
        },
        kind: "function",
        argumentTypes: [{
          name: "fileName",
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
              kind: "any"
            }
          }
        }
      }
    },
    getArcConfigKey: {
      kind: "function",
      name: "getArcConfigKey",
      location: {
        type: "source",
        fileName: "ArcanistService.js",
        line: 89
      },
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 89
        },
        kind: "function",
        argumentTypes: [{
          name: "fileName",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "key",
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
    findArcProjectIdOfPath: {
      kind: "function",
      name: "findArcProjectIdOfPath",
      location: {
        type: "source",
        fileName: "ArcanistService.js",
        line: 98
      },
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 98
        },
        kind: "function",
        argumentTypes: [{
          name: "fileName",
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
              kind: "string"
            }
          }
        }
      }
    },
    findArcProjectIdAndDirectory: {
      kind: "function",
      name: "findArcProjectIdAndDirectory",
      location: {
        type: "source",
        fileName: "ArcanistService.js",
        line: 105
      },
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 105
        },
        kind: "function",
        argumentTypes: [{
          name: "fileName",
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
              kind: "object",
              fields: [{
                name: "projectId",
                type: {
                  kind: "string"
                },
                optional: false
              }, {
                name: "directory",
                type: {
                  kind: "named",
                  name: "NuclideUri"
                },
                optional: false
              }]
            }
          }
        }
      }
    },
    getProjectRelativePath: {
      kind: "function",
      name: "getProjectRelativePath",
      location: {
        type: "source",
        fileName: "ArcanistService.js",
        line: 122
      },
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 122
        },
        kind: "function",
        argumentTypes: [{
          name: "fileName",
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
              kind: "string"
            }
          }
        }
      }
    },
    findDiagnostics: {
      kind: "function",
      name: "findDiagnostics",
      location: {
        type: "source",
        fileName: "ArcanistService.js",
        line: 130
      },
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 130
        },
        kind: "function",
        argumentTypes: [{
          name: "path",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "skip",
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
            name: "ArcDiagnostic"
          }
        }
      }
    },
    createPhabricatorRevision: {
      kind: "function",
      name: "createPhabricatorRevision",
      location: {
        type: "source",
        fileName: "ArcanistService.js",
        line: 254
      },
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 254
        },
        kind: "function",
        argumentTypes: [{
          name: "filePath",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "isPrepareMode",
          type: {
            kind: "boolean"
          }
        }, {
          name: "lintExcuse",
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
            kind: "object",
            fields: [{
              name: "stderr",
              type: {
                kind: "string"
              },
              optional: true
            }, {
              name: "stdout",
              type: {
                kind: "string"
              },
              optional: true
            }]
          }
        }
      }
    },
    updatePhabricatorRevision: {
      kind: "function",
      name: "updatePhabricatorRevision",
      location: {
        type: "source",
        fileName: "ArcanistService.js",
        line: 263
      },
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 263
        },
        kind: "function",
        argumentTypes: [{
          name: "filePath",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "message",
          type: {
            kind: "string"
          }
        }, {
          name: "allowUntracked",
          type: {
            kind: "boolean"
          }
        }, {
          name: "lintExcuse",
          type: {
            kind: "nullable",
            type: {
              kind: "string"
            }
          }
        }, {
          name: "verbatimModeEnabled",
          type: {
            kind: "boolean"
          }
        }],
        returnType: {
          kind: "observable",
          type: {
            kind: "object",
            fields: [{
              name: "stderr",
              type: {
                kind: "string"
              },
              optional: true
            }, {
              name: "stdout",
              type: {
                kind: "string"
              },
              optional: true
            }]
          }
        }
      }
    },
    ProcessExitMessage: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "process.js",
        line: 590
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
        line: 596
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
        line: 609
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
    execArcPull: {
      kind: "function",
      name: "execArcPull",
      location: {
        type: "source",
        fileName: "ArcanistService.js",
        line: 279
      },
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 279
        },
        kind: "function",
        argumentTypes: [{
          name: "cwd",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "fetchLatest",
          type: {
            kind: "boolean"
          }
        }, {
          name: "allowDirtyChanges",
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
    execArcLand: {
      kind: "function",
      name: "execArcLand",
      location: {
        type: "source",
        fileName: "ArcanistService.js",
        line: 305
      },
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 305
        },
        kind: "function",
        argumentTypes: [{
          name: "cwd",
          type: {
            kind: "named",
            name: "NuclideUri"
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
    execArcPatch: {
      kind: "function",
      name: "execArcPatch",
      location: {
        type: "source",
        fileName: "ArcanistService.js",
        line: 321
      },
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 321
        },
        kind: "function",
        argumentTypes: [{
          name: "cwd",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "differentialRevision",
          type: {
            kind: "string"
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
    }
  }
});