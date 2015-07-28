

DecisionTree = module.exports = function (opts) {
  if (opts) {
    this.opts = opts
  } else {
    this.opts = {}
  }
}

DecisionTree.prototype.defaultDecider = function (result) {
  if (result === true) {
    return 1
  } else if (result === false) {
    return 0
  } else if (!isNaN(parseFloat(result)) && isFinite(result)) {
    return result
  } else {
    return new Error('Expecting a Number or Boolean result. Received: '+result)
  }
}

DecisionTree.prototype.run = function (treeData, subjectData, cb) {
  this.runNode(treeData, subjectData, function (err, result) {
    if (err) return cb(err)
    cb(err, result)
  })
}

DecisionTree.prototype.runNode = function (node, subjectData, cb) {
  var self = this
  if (node.condition) {
    this.testCondition(node.condition, subjectData, function (err, result) {
      if (err) return cb(err)
      self.handleDecision(node, subjectData, result, cb)
    })
  } else if (node.conditions) {
    this.testConditions(node.conditions, subjectData, function (err, result) {
      if (err) return cb(err)
      self.handleDecision(node, subjectData, result, cb)
    })
  } else {
    cb(null, node)
  }
}

DecisionTree.prototype.testCondition = function (condition, subjectData, cb) {
  var self = this
  var priority = {}
  if (isFunction(subjectData[condition.property])) {
    subjectData[condition.property](condition, subjectData, function (err, result) {
      priority[condition.property] = result
      var result = self.runComparisons(condition, subjectData, priority)
      return cb(null, result)
    })
  } else {
    var result = self.runComparisons(condition, subjectData, priority)
    return cb(null, result)
  }
}

DecisionTree.prototype.runComparisons = function (condition, subjectData, priority) {
  if (condition.comparison) {
    var result = this.compare(condition.property, condition.comparison, subjectData, priority)
    return result
  } else if (condition.comparisons) {
    for (var i=0; i<condition.comparisons.length; i++) {
      var result = this.compare(condition.property, condition.comparisons[i], subjectData, priority)
      if (result) {
        return i
      }
    }
    return 0
  }
}

DecisionTree.prototype.compare = function (property, comparison, subjectData, priority) {
  var result = 0;
  if (priority[property]) {
    var val = priority[property]
  } else {
    var val = subjectData[property]
  }
  switch (comparison.operation) {
    case ">":
      if (val > comparison.value) {
        result = 1;
      }
      break;
    case ">=":
      if (val >= comparison.value) {
        result = 1;
      }
      break;
    case "<":
      if (val < comparison.value) {
        result = 1;
      }
      break;
    case "<=":
      if (val <= comparison.value) {
        result = 1;
      }
      break;
    case "==":
      if (val == comparison.value) {
        result = 1;
      }
      break;
    case "===":
      if (val === comparison.value) {
        result = 1;
      }
      break;
    case "!=":
      if (val != comparison.value) {
        result = 1;
      }
      break;
    case "!==":
      if (val !== comparison.value) {
        result = 1;
      }
      break;
    case "in":
      for (var i in comparison.value) {
        if (val === comparison.value[i]) {
          result = 1;
        }
      }
      break;
    case "nin":
      result = 1;
      for (var i in comparison.value) {
        if (val === comparison.value[i]) {
          result = 0;
        }
      }
      break;
    default:
      return new Error('Invalid comparison operation')
  }
  return result
}

DecisionTree.prototype.testConditions = function (conditions, subjectData, cb) {
  var results = []
  var done = 0
  for (var i in conditions) {
    this.testCondition(conditions[i], subjectData, function (err, result) {
      if (err) return cb(err)
      results.push(result)
      done++
      if (done === conditions.length) {
        cb(null, results)
      }
    })
  }
}

DecisionTree.prototype.handleDecision = function (node, subjectData, result, cb) {
  if (this.opts.decider) {
    var decide = this.opts.decider
  } else {
    var decide = this.defaultDecider
  }
  decision = decide(result)
  if (node.branches) {
    if (!node.branches[decision]) {
      return cb(new Error("result branch does not exist"))
    }
    this.runNode(node.branches[decision], subjectData, cb)
  } else {
    cb(new Error('Node with decisions has no branches!'))
  }
}


DecisionTree.prototype.countConditions = function (treeData, finished) {
  var conditionCount = {}
  var self = this
  this.walkTree(treeData, function (node, cb) {
    if (node.condition) {
      self.incrementConditionCount(conditionCount, node.condition.name)
    } else if (node.conditions) {
      for (var index in node.conditions) {
        self.incrementConditionCount(conditionCount, node.conditions[index].name)
      }
    }
    cb(null)
  }, function (err) {
    finished(err, conditionCount)
  })
}

DecisionTree.prototype.walkTree = function (node, perNode, finishedNode) {
  var self = this
  var count = 1
  var done = 0

  if (node.branches) {
    for (var index in node.branches) {
      count++
      self.walkTree(node.branches[index], perNode, function (err) {
        done++
        if (count === done) {
          finishedNode(null)
        }
      })
    }
  }

  perNode(node, function (err) {
    done++
    if (count === done) {
      finishedNode(null)
    }
  })
}

DecisionTree.prototype.incrementConditionCount = function (conditionCount, conditionName) {
  if (!conditionCount[conditionName]) {
    conditionCount[conditionName] = 0
  }
  conditionCount[conditionName]++
}

function isFunction(functionToCheck) {
 var getType = {};
 return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}
