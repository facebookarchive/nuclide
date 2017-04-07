"use strict";

let Observable;

module.exports = _client => {
  const remoteModule = {};

  remoteModule.get_completions = function (arg0, arg1, arg2, arg3) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "src",
      type: {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 76
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "contents",
      type: {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 77
        },
        kind: "string"
      }
    }, {
      name: "line",
      type: {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 78
        },
        kind: "number"
      }
    }, {
      name: "column",
      type: {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 79
        },
        kind: "number"
      }
    }]).then(args => {
      return _client.callRemoteFunction("get_completions", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 80
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 80
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 80
            },
            kind: "named",
            name: "JediCompletion"
          }
        }
      });
    });
  };

  remoteModule.get_definitions = function (arg0, arg1, arg2, arg3) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "src",
      type: {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 85
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "contents",
      type: {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 86
        },
        kind: "string"
      }
    }, {
      name: "line",
      type: {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 87
        },
        kind: "number"
      }
    }, {
      name: "column",
      type: {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 88
        },
        kind: "number"
      }
    }]).then(args => {
      return _client.callRemoteFunction("get_definitions", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 89
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 89
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 89
            },
            kind: "named",
            name: "JediDefinition"
          }
        }
      });
    });
  };

  remoteModule.get_references = function (arg0, arg1, arg2, arg3) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "src",
      type: {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 94
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "contents",
      type: {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 95
        },
        kind: "string"
      }
    }, {
      name: "line",
      type: {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 96
        },
        kind: "number"
      }
    }, {
      name: "column",
      type: {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 97
        },
        kind: "number"
      }
    }]).then(args => {
      return _client.callRemoteFunction("get_references", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 98
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 98
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 98
            },
            kind: "named",
            name: "JediReference"
          }
        }
      });
    });
  };

  remoteModule.get_outline = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "src",
      type: {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 103
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "contents",
      type: {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 104
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("get_outline", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 105
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 105
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 105
            },
            kind: "named",
            name: "JediOutlineItem"
          }
        }
      });
    });
  };

  remoteModule.add_paths = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "paths",
      type: {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 110
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 110
          },
          kind: "string"
        }
      }
    }]).then(args => {
      return _client.callRemoteFunction("add_paths", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 111
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 111
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 111
            },
            kind: "string"
          }
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
    JediCompletion: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "JediService.js",
        line: 15
      },
      name: "JediCompletion",
      definition: {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 15
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 16
          },
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 16
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 17
          },
          name: "text",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 17
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 18
          },
          name: "description",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 18
            },
            kind: "string"
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 19
          },
          name: "params",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 19
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "JediService.js",
                line: 19
              },
              kind: "string"
            }
          },
          optional: true
        }]
      }
    },
    JediDefinition: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "JediService.js",
        line: 22
      },
      name: "JediDefinition",
      definition: {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 22
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 23
          },
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 23
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 24
          },
          name: "text",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 24
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 25
          },
          name: "file",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 25
            },
            kind: "named",
            name: "NuclideUri"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 26
          },
          name: "line",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 26
            },
            kind: "number"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 27
          },
          name: "column",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 27
            },
            kind: "number"
          },
          optional: false
        }]
      }
    },
    JediReference: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "JediService.js",
        line: 30
      },
      name: "JediReference",
      definition: {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 30
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 31
          },
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 31
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 32
          },
          name: "text",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 32
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 33
          },
          name: "file",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 33
            },
            kind: "named",
            name: "NuclideUri"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 34
          },
          name: "line",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 34
            },
            kind: "number"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 35
          },
          name: "column",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 35
            },
            kind: "number"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 36
          },
          name: "parentName",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 36
            },
            kind: "string"
          },
          optional: true
        }]
      }
    },
    Position: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "JediService.js",
        line: 39
      },
      name: "Position",
      definition: {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 39
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 40
          },
          name: "line",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 40
            },
            kind: "number"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 41
          },
          name: "column",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 41
            },
            kind: "number"
          },
          optional: false
        }]
      }
    },
    JediFunctionItem: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "JediService.js",
        line: 44
      },
      name: "JediFunctionItem",
      definition: {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 44
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 45
          },
          name: "kind",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 45
            },
            kind: "string-literal",
            value: "function"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 46
          },
          name: "name",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 46
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 47
          },
          name: "start",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 47
            },
            kind: "named",
            name: "Position"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 48
          },
          name: "end",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 48
            },
            kind: "named",
            name: "Position"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 49
          },
          name: "children",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 49
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "JediService.js",
                line: 49
              },
              kind: "named",
              name: "JediOutlineItem"
            }
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 50
          },
          name: "docblock",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 50
            },
            kind: "string"
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 51
          },
          name: "params",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 51
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "JediService.js",
                line: 51
              },
              kind: "string"
            }
          },
          optional: true
        }]
      }
    },
    JediClassItem: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "JediService.js",
        line: 54
      },
      name: "JediClassItem",
      definition: {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 54
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 55
          },
          name: "kind",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 55
            },
            kind: "string-literal",
            value: "class"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 56
          },
          name: "name",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 56
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 57
          },
          name: "start",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 57
            },
            kind: "named",
            name: "Position"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 58
          },
          name: "end",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 58
            },
            kind: "named",
            name: "Position"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 59
          },
          name: "children",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 59
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "JediService.js",
                line: 59
              },
              kind: "named",
              name: "JediOutlineItem"
            }
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 60
          },
          name: "docblock",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 60
            },
            kind: "string"
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 62
          },
          name: "params",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 62
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "JediService.js",
                line: 62
              },
              kind: "string"
            }
          },
          optional: true
        }]
      }
    },
    JediStatementItem: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "JediService.js",
        line: 65
      },
      name: "JediStatementItem",
      definition: {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 65
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 66
          },
          name: "kind",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 66
            },
            kind: "string-literal",
            value: "statement"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 67
          },
          name: "name",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 67
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 68
          },
          name: "start",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 68
            },
            kind: "named",
            name: "Position"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 69
          },
          name: "end",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 69
            },
            kind: "named",
            name: "Position"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 70
          },
          name: "docblock",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 70
            },
            kind: "string"
          },
          optional: true
        }]
      }
    },
    JediOutlineItem: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "JediService.js",
        line: 73
      },
      name: "JediOutlineItem",
      definition: {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 73
        },
        kind: "union",
        types: [{
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 44
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 45
            },
            name: "kind",
            type: {
              location: {
                type: "source",
                fileName: "JediService.js",
                line: 45
              },
              kind: "string-literal",
              value: "function"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 46
            },
            name: "name",
            type: {
              location: {
                type: "source",
                fileName: "JediService.js",
                line: 46
              },
              kind: "string"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 47
            },
            name: "start",
            type: {
              location: {
                type: "source",
                fileName: "JediService.js",
                line: 47
              },
              kind: "named",
              name: "Position"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 48
            },
            name: "end",
            type: {
              location: {
                type: "source",
                fileName: "JediService.js",
                line: 48
              },
              kind: "named",
              name: "Position"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 49
            },
            name: "children",
            type: {
              location: {
                type: "source",
                fileName: "JediService.js",
                line: 49
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "JediService.js",
                  line: 49
                },
                kind: "named",
                name: "JediOutlineItem"
              }
            },
            optional: true
          }, {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 50
            },
            name: "docblock",
            type: {
              location: {
                type: "source",
                fileName: "JediService.js",
                line: 50
              },
              kind: "string"
            },
            optional: true
          }, {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 51
            },
            name: "params",
            type: {
              location: {
                type: "source",
                fileName: "JediService.js",
                line: 51
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "JediService.js",
                  line: 51
                },
                kind: "string"
              }
            },
            optional: true
          }]
        }, {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 54
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 55
            },
            name: "kind",
            type: {
              location: {
                type: "source",
                fileName: "JediService.js",
                line: 55
              },
              kind: "string-literal",
              value: "class"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 56
            },
            name: "name",
            type: {
              location: {
                type: "source",
                fileName: "JediService.js",
                line: 56
              },
              kind: "string"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 57
            },
            name: "start",
            type: {
              location: {
                type: "source",
                fileName: "JediService.js",
                line: 57
              },
              kind: "named",
              name: "Position"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 58
            },
            name: "end",
            type: {
              location: {
                type: "source",
                fileName: "JediService.js",
                line: 58
              },
              kind: "named",
              name: "Position"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 59
            },
            name: "children",
            type: {
              location: {
                type: "source",
                fileName: "JediService.js",
                line: 59
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "JediService.js",
                  line: 59
                },
                kind: "named",
                name: "JediOutlineItem"
              }
            },
            optional: true
          }, {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 60
            },
            name: "docblock",
            type: {
              location: {
                type: "source",
                fileName: "JediService.js",
                line: 60
              },
              kind: "string"
            },
            optional: true
          }, {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 62
            },
            name: "params",
            type: {
              location: {
                type: "source",
                fileName: "JediService.js",
                line: 62
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "JediService.js",
                  line: 62
                },
                kind: "string"
              }
            },
            optional: true
          }]
        }, {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 65
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 66
            },
            name: "kind",
            type: {
              location: {
                type: "source",
                fileName: "JediService.js",
                line: 66
              },
              kind: "string-literal",
              value: "statement"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 67
            },
            name: "name",
            type: {
              location: {
                type: "source",
                fileName: "JediService.js",
                line: 67
              },
              kind: "string"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 68
            },
            name: "start",
            type: {
              location: {
                type: "source",
                fileName: "JediService.js",
                line: 68
              },
              kind: "named",
              name: "Position"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 69
            },
            name: "end",
            type: {
              location: {
                type: "source",
                fileName: "JediService.js",
                line: 69
              },
              kind: "named",
              name: "Position"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 70
            },
            name: "docblock",
            type: {
              location: {
                type: "source",
                fileName: "JediService.js",
                line: 70
              },
              kind: "string"
            },
            optional: true
          }]
        }],
        discriminantField: "kind"
      }
    },
    get_completions: {
      kind: "function",
      name: "get_completions",
      location: {
        type: "source",
        fileName: "JediService.js",
        line: 75
      },
      type: {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 75
        },
        kind: "function",
        argumentTypes: [{
          name: "src",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 76
            },
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "contents",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 77
            },
            kind: "string"
          }
        }, {
          name: "line",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 78
            },
            kind: "number"
          }
        }, {
          name: "column",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 79
            },
            kind: "number"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 80
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 80
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "JediService.js",
                line: 80
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "JediService.js",
                  line: 80
                },
                kind: "named",
                name: "JediCompletion"
              }
            }
          }
        }
      }
    },
    get_definitions: {
      kind: "function",
      name: "get_definitions",
      location: {
        type: "source",
        fileName: "JediService.js",
        line: 84
      },
      type: {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 84
        },
        kind: "function",
        argumentTypes: [{
          name: "src",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 85
            },
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "contents",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 86
            },
            kind: "string"
          }
        }, {
          name: "line",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 87
            },
            kind: "number"
          }
        }, {
          name: "column",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 88
            },
            kind: "number"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 89
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 89
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "JediService.js",
                line: 89
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "JediService.js",
                  line: 89
                },
                kind: "named",
                name: "JediDefinition"
              }
            }
          }
        }
      }
    },
    get_references: {
      kind: "function",
      name: "get_references",
      location: {
        type: "source",
        fileName: "JediService.js",
        line: 93
      },
      type: {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 93
        },
        kind: "function",
        argumentTypes: [{
          name: "src",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 94
            },
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "contents",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 95
            },
            kind: "string"
          }
        }, {
          name: "line",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 96
            },
            kind: "number"
          }
        }, {
          name: "column",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 97
            },
            kind: "number"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 98
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 98
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "JediService.js",
                line: 98
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "JediService.js",
                  line: 98
                },
                kind: "named",
                name: "JediReference"
              }
            }
          }
        }
      }
    },
    get_outline: {
      kind: "function",
      name: "get_outline",
      location: {
        type: "source",
        fileName: "JediService.js",
        line: 102
      },
      type: {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 102
        },
        kind: "function",
        argumentTypes: [{
          name: "src",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 103
            },
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "contents",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 104
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 105
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 105
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "JediService.js",
                line: 105
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "JediService.js",
                  line: 105
                },
                kind: "named",
                name: "JediOutlineItem"
              }
            }
          }
        }
      }
    },
    add_paths: {
      kind: "function",
      name: "add_paths",
      location: {
        type: "source",
        fileName: "JediService.js",
        line: 109
      },
      type: {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 109
        },
        kind: "function",
        argumentTypes: [{
          name: "paths",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 110
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "JediService.js",
                line: 110
              },
              kind: "string"
            }
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 111
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 111
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "JediService.js",
                line: 111
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "JediService.js",
                  line: 111
                },
                kind: "string"
              }
            }
          }
        }
      }
    }
  }
});