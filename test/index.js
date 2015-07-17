

var tape = require('tape')

var DTS = require('../index.js')

var conditions = { 
  conditionBasic: function (opts, data, cb) {
    if (data.value > 0) {
      return cb(null, true)
    }   
    return cb(null, false)
  },
  conditionOpts: function (opts, data, cb) {
    if (opts.value > data.value) {
      return cb(null, true)
    }   
    return cb(null, false)
  },
  conditionAge: function (opts, data, cb) {
    if (eval(data.age+opts.operator+opts.value)){
      return cb(null, true)
    }   
    return cb(null, false)
  }
}


tape('Test Basic Condition', function (t) {
  var DT = new DTS({conditions:conditions})

  var subject = {
    value: 1
  }

  var condition = {
    name: 'conditionBasic',
    opts: {}
  }

  DT.testCondition(condition, subject, function (err, result) {
    t.ok(result, 'Basic condition returns true')
    subject.value = 0
    DT.testCondition(condition, subject, function (err, result) {
      t.notOk(result, 'Basic condition returns false')
      t.end()
    })
  })
})

tape('Test Condition With Opts', function (t) {
  var DT = new DTS({conditions:conditions})

  var subject = {
    value: 1
  }

  var condition = {
    name: 'conditionOpts',
    opts: {
      value: 2
    }
  }

  DT.testCondition(condition, subject, function (err, result) {
    t.ok(result, 'Condition with opts returns true')
    subject.value = 3
    DT.testCondition(condition, subject, function (err, result) {
      t.notOk(result, 'Condition with opts returns false')
      t.end()
    })
  })
})

tape('Test runNode', function (t) {
  var DT = new DTS({conditions:conditions})

  var subject = {
    age: 37
  }

  var node = {
    condition: {
      name: "conditionAge",
      opts: {
        operator: ">",
        value: 20
      }   
    },  
    paths: [
      {   
        result: "Leaf A: Aged under 20" 
      },  
      {   
        result: "Leaf B: Aged 21 or over" 
      }   
    ]   
  }

  DT.runNode(node, subject, function (err, result) {
    t.ok(result, 'Leaf B: Aged 21 or over')
    subject.age = 8
    DT.runNode(node, subject, function (err, result) {
      t.ok(result, 'Leaf A: Aged under 20')
      t.end()
    })
  })
})

tape('Test defaultDecider', function (t) {
  var DT = new DTS({conditions:conditions})

  var result

  result = DT.defaultDecider(true)
  t.equal(result, 1, 'Decider properly handles "true"')

  result = DT.defaultDecider(false)
  t.equal(result, 0, 'Decider properly handles "false"')

  result = DT.defaultDecider(1)
  t.equal(result, 1, 'Decider properly handles "1"')

  result = DT.defaultDecider(0)
  t.equal(result, 0, 'Decider properly handles "0"')

  result = DT.defaultDecider(2)
  t.equal(result, 2, 'Decider properly handles "2"')

  result = DT.defaultDecider('Oops')
  t.equal(result instanceof Error, new Error() instanceof Error, 'Decider properly returns an error on strings')

  t.end()
})
