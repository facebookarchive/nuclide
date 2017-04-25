"use strict";

let Observable;

module.exports = _client => {
  const remoteModule = {};

  remoteModule.findArcConfigDirectory = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "fileName",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 60
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("ArcanistService/findArcConfigDirectory", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 60
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 60
          },
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
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 68
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("ArcanistService/readArcConfig", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 68
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 68
          },
          kind: "any"
        }
      });
    });
  };

  remoteModule.getArcConfigKey = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "fileName",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 84
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "key",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 85
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("ArcanistService/getArcConfigKey", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 86
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 86
          },
          kind: "string"
        }
      });
    });
  };

  remoteModule.findArcProjectIdOfPath = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "fileName",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 94
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("ArcanistService/findArcProjectIdOfPath", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 94
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 94
          },
          kind: "string"
        }
      });
    });
  };

  remoteModule.findArcProjectIdAndDirectory = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "fileName",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 99
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("ArcanistService/findArcProjectIdAndDirectory", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 99
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 99
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 100
            },
            name: "projectId",
            type: {
              location: {
                type: "source",
                fileName: "ArcanistService.js",
                line: 100
              },
              kind: "string"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 101
            },
            name: "directory",
            type: {
              location: {
                type: "source",
                fileName: "ArcanistService.js",
                line: 101
              },
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
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 114
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("ArcanistService/getProjectRelativePath", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 114
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 114
          },
          kind: "string"
        }
      });
    });
  };

  remoteModule.findDiagnostics = function (arg0, arg1) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "path",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 120
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "skip",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 121
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 121
          },
          kind: "string"
        }
      }
    }]).then(args => {
      return _client.callRemoteFunction("ArcanistService/findDiagnostics", "observable", args);
    })).concatMap(id => id).concatMap(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 122
        },
        kind: "named",
        name: "ArcDiagnostic"
      });
    }).publish();
  };

  remoteModule.createPhabricatorRevision = function (arg0, arg1, arg2) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "filePath",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 235
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "isPrepareMode",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 236
        },
        kind: "boolean"
      }
    }, {
      name: "lintExcuse",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 237
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 237
          },
          kind: "string"
        }
      }
    }]).then(args => {
      return _client.callRemoteFunction("ArcanistService/createPhabricatorRevision", "observable", args);
    })).concatMap(id => id).concatMap(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 238
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 238
          },
          name: "stderr",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 238
            },
            kind: "string"
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 238
          },
          name: "stdout",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 238
            },
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
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 244
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "message",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 245
        },
        kind: "string"
      }
    }, {
      name: "allowUntracked",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 246
        },
        kind: "boolean"
      }
    }, {
      name: "lintExcuse",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 247
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 247
          },
          kind: "string"
        }
      }
    }, {
      name: "verbatimModeEnabled",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 248
        },
        kind: "boolean"
      }
    }]).then(args => {
      return _client.callRemoteFunction("ArcanistService/updatePhabricatorRevision", "observable", args);
    })).concatMap(id => id).concatMap(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 249
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 249
          },
          name: "stderr",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 249
            },
            kind: "string"
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 249
          },
          name: "stdout",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 249
            },
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
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 263
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "fetchLatest",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 264
        },
        kind: "boolean"
      }
    }, {
      name: "allowDirtyChanges",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 265
        },
        kind: "boolean"
      }
    }]).then(args => {
      return _client.callRemoteFunction("ArcanistService/execArcPull", "observable", args);
    })).concatMap(id => id).concatMap(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 266
        },
        kind: "named",
        name: "LegacyProcessMessage"
      });
    }).publish();
  };

  remoteModule.execArcLand = function (arg0) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "cwd",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 289
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("ArcanistService/execArcLand", "observable", args);
    })).concatMap(id => id).concatMap(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 290
        },
        kind: "named",
        name: "LegacyProcessMessage"
      });
    }).publish();
  };

  remoteModule.execArcPatch = function (arg0, arg1) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "cwd",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 305
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "differentialRevision",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 306
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("ArcanistService/execArcPatch", "observable", args);
    })).concatMap(id => id).concatMap(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 307
        },
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
        line: 43
      },
      name: "ArcDiagnostic",
      definition: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 43
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 44
          },
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 44
            },
            kind: "union",
            types: [{
              location: {
                type: "source",
                fileName: "ArcanistService.js",
                line: 44
              },
              kind: "string-literal",
              value: "Error"
            }, {
              location: {
                type: "source",
                fileName: "ArcanistService.js",
                line: 44
              },
              kind: "string-literal",
              value: "Warning"
            }]
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 45
          },
          name: "text",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 45
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 46
          },
          name: "filePath",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 46
            },
            kind: "named",
            name: "NuclideUri"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 47
          },
          name: "row",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 47
            },
            kind: "number"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 48
          },
          name: "col",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 48
            },
            kind: "number"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 49
          },
          name: "code",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 49
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "ArcanistService.js",
                line: 49
              },
              kind: "string"
            }
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 52
          },
          name: "original",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 52
            },
            kind: "string"
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 53
          },
          name: "replacement",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 53
            },
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
        line: 60
      },
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 60
        },
        kind: "function",
        argumentTypes: [{
          name: "fileName",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 60
            },
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 60
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 60
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "ArcanistService.js",
                line: 60
              },
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
        line: 68
      },
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 68
        },
        kind: "function",
        argumentTypes: [{
          name: "fileName",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 68
            },
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 68
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 68
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "ArcanistService.js",
                line: 68
              },
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
        line: 83
      },
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 83
        },
        kind: "function",
        argumentTypes: [{
          name: "fileName",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 84
            },
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "key",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 85
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 86
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 86
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "ArcanistService.js",
                line: 86
              },
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
        line: 94
      },
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 94
        },
        kind: "function",
        argumentTypes: [{
          name: "fileName",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 94
            },
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 94
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 94
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "ArcanistService.js",
                line: 94
              },
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
        line: 99
      },
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 99
        },
        kind: "function",
        argumentTypes: [{
          name: "fileName",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 99
            },
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 99
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 99
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "ArcanistService.js",
                line: 99
              },
              kind: "object",
              fields: [{
                location: {
                  type: "source",
                  fileName: "ArcanistService.js",
                  line: 100
                },
                name: "projectId",
                type: {
                  location: {
                    type: "source",
                    fileName: "ArcanistService.js",
                    line: 100
                  },
                  kind: "string"
                },
                optional: false
              }, {
                location: {
                  type: "source",
                  fileName: "ArcanistService.js",
                  line: 101
                },
                name: "directory",
                type: {
                  location: {
                    type: "source",
                    fileName: "ArcanistService.js",
                    line: 101
                  },
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
        line: 114
      },
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 114
        },
        kind: "function",
        argumentTypes: [{
          name: "fileName",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 114
            },
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 114
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 114
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "ArcanistService.js",
                line: 114
              },
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
        line: 119
      },
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 119
        },
        kind: "function",
        argumentTypes: [{
          name: "path",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 120
            },
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "skip",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 121
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "ArcanistService.js",
                line: 121
              },
              kind: "string"
            }
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 122
          },
          kind: "observable",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 122
            },
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
        line: 234
      },
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 234
        },
        kind: "function",
        argumentTypes: [{
          name: "filePath",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 235
            },
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "isPrepareMode",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 236
            },
            kind: "boolean"
          }
        }, {
          name: "lintExcuse",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 237
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "ArcanistService.js",
                line: 237
              },
              kind: "string"
            }
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 238
          },
          kind: "observable",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 238
            },
            kind: "object",
            fields: [{
              location: {
                type: "source",
                fileName: "ArcanistService.js",
                line: 238
              },
              name: "stderr",
              type: {
                location: {
                  type: "source",
                  fileName: "ArcanistService.js",
                  line: 238
                },
                kind: "string"
              },
              optional: true
            }, {
              location: {
                type: "source",
                fileName: "ArcanistService.js",
                line: 238
              },
              name: "stdout",
              type: {
                location: {
                  type: "source",
                  fileName: "ArcanistService.js",
                  line: 238
                },
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
        line: 243
      },
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 243
        },
        kind: "function",
        argumentTypes: [{
          name: "filePath",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 244
            },
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "message",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 245
            },
            kind: "string"
          }
        }, {
          name: "allowUntracked",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 246
            },
            kind: "boolean"
          }
        }, {
          name: "lintExcuse",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 247
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "ArcanistService.js",
                line: 247
              },
              kind: "string"
            }
          }
        }, {
          name: "verbatimModeEnabled",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 248
            },
            kind: "boolean"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 249
          },
          kind: "observable",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 249
            },
            kind: "object",
            fields: [{
              location: {
                type: "source",
                fileName: "ArcanistService.js",
                line: 249
              },
              name: "stderr",
              type: {
                location: {
                  type: "source",
                  fileName: "ArcanistService.js",
                  line: 249
                },
                kind: "string"
              },
              optional: true
            }, {
              location: {
                type: "source",
                fileName: "ArcanistService.js",
                line: 249
              },
              name: "stdout",
              type: {
                location: {
                  type: "source",
                  fileName: "ArcanistService.js",
                  line: 249
                },
                kind: "string"
              },
              optional: true
            }]
          }
        }
      }
    },
    execArcPull: {
      kind: "function",
      name: "execArcPull",
      location: {
        type: "source",
        fileName: "ArcanistService.js",
        line: 262
      },
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 262
        },
        kind: "function",
        argumentTypes: [{
          name: "cwd",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 263
            },
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "fetchLatest",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 264
            },
            kind: "boolean"
          }
        }, {
          name: "allowDirtyChanges",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 265
            },
            kind: "boolean"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 266
          },
          kind: "observable",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 266
            },
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
        line: 288
      },
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 288
        },
        kind: "function",
        argumentTypes: [{
          name: "cwd",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 289
            },
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 290
          },
          kind: "observable",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 290
            },
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
        line: 304
      },
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 304
        },
        kind: "function",
        argumentTypes: [{
          name: "cwd",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 305
            },
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "differentialRevision",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 306
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 307
          },
          kind: "observable",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 307
            },
            kind: "named",
            name: "LegacyProcessMessage"
          }
        }
      }
    },
    ProcessExitMessage: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "process-rpc-types.js",
        line: 13
      },
      name: "ProcessExitMessage",
      definition: {
        location: {
          type: "source",
          fileName: "process-rpc-types.js",
          line: 13
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 14
          },
          name: "kind",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 14
            },
            kind: "string-literal",
            value: "exit"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 15
          },
          name: "exitCode",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 15
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 15
              },
              kind: "number"
            }
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 16
          },
          name: "signal",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 16
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 16
              },
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
        fileName: "process-rpc-types.js",
        line: 20
      },
      name: "ProcessMessage",
      definition: {
        location: {
          type: "source",
          fileName: "process-rpc-types.js",
          line: 21
        },
        kind: "union",
        types: [{
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 21
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 22
            },
            name: "kind",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 22
              },
              kind: "string-literal",
              value: "stdout"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 23
            },
            name: "data",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 23
              },
              kind: "string"
            },
            optional: false
          }]
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 25
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 26
            },
            name: "kind",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 26
              },
              kind: "string-literal",
              value: "stderr"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 27
            },
            name: "data",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 27
              },
              kind: "string"
            },
            optional: false
          }]
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 13
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 14
            },
            name: "kind",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 14
              },
              kind: "string-literal",
              value: "exit"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 15
            },
            name: "exitCode",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 15
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "process-rpc-types.js",
                  line: 15
                },
                kind: "number"
              }
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 16
            },
            name: "signal",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 16
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "process-rpc-types.js",
                  line: 16
                },
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
        fileName: "process-rpc-types.js",
        line: 33
      },
      name: "LegacyProcessMessage",
      definition: {
        location: {
          type: "source",
          fileName: "process-rpc-types.js",
          line: 33
        },
        kind: "union",
        types: [{
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 21
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 22
            },
            name: "kind",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 22
              },
              kind: "string-literal",
              value: "stdout"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 23
            },
            name: "data",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 23
              },
              kind: "string"
            },
            optional: false
          }]
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 25
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 26
            },
            name: "kind",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 26
              },
              kind: "string-literal",
              value: "stderr"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 27
            },
            name: "data",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 27
              },
              kind: "string"
            },
            optional: false
          }]
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 13
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 14
            },
            name: "kind",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 14
              },
              kind: "string-literal",
              value: "exit"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 15
            },
            name: "exitCode",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 15
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "process-rpc-types.js",
                  line: 15
                },
                kind: "number"
              }
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 16
            },
            name: "signal",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 16
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "process-rpc-types.js",
                  line: 16
                },
                kind: "string"
              }
            },
            optional: false
          }]
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 33
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 33
            },
            name: "kind",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 33
              },
              kind: "string-literal",
              value: "error"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 33
            },
            name: "error",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 33
              },
              kind: "named",
              name: "Object"
            },
            optional: false
          }]
        }],
        discriminantField: "kind"
      }
    },
    ProcessInfo: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "process-rpc-types.js",
        line: 35
      },
      name: "ProcessInfo",
      definition: {
        location: {
          type: "source",
          fileName: "process-rpc-types.js",
          line: 35
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 36
          },
          name: "parentPid",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 36
            },
            kind: "number"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 37
          },
          name: "pid",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 37
            },
            kind: "number"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 38
          },
          name: "command",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 38
            },
            kind: "string"
          },
          optional: false
        }]
      }
    }
  }
});