

DecisionTree = module.exports = function (opts) {
  if (!opts.conditions) {
    return new Error("Must specify all condition functions!")
  }
  this.opts = opts
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
      if (self.opts.decider) {
        var decide = self.opts.decider
      } else {
        var decide = self.defaultDecider
      }
      decision = decide(result)
      self.handleDecision(node, subjectData, decision, cb)
    })
  } else if (node.conditions) {
  } else {
    cb(null, node)
  }
}

DecisionTree.prototype.testCondition = function (condition, subjectData, cb) {
  if (this.opts.conditions[condition.name]) {
    var fn = this.opts.conditions[condition.name]
    if (this.opts.conditions[condition.name].run) {
      fn = this.opts.conditions[condition.name].run
    }
    fn(condition.opts, subjectData, function (err, result) {
      if (err) return cb(err)
      cb(null, result)
    })
  } else {
    cb(new Error('Condition named: "'+condition.name+'" does not exist!'))
  }
}

DecisionTree.prototype.handleDecision = function (node, subjectData, decision, cb) {
  if (node.paths) {
    if (!node.paths[decision]) {
      return cb(new Error("result path does not exist"))
    }
    this.runNode(node.paths[decision], subjectData, cb)
  } else {
    cb(new Error('Node with decisions has no paths!'))
  }
}


DecisionTree.prototype.testConditions = function (conditions, req, res, cb) {
  for (var index in conditions) {
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

  if (node.paths) {
    for (var index in node.paths) {
      count++
      self.walkTree(node.paths[index], perNode, function (err) {
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

