

var tape = require('tape')

var DTS = require('../index.js')

var sampleTree = require('./tree.json')


tape('Test Binary Condition', function (t) {
  var DT = new DTS()

  var subject = {
    target: 1
  }

  var decisions = [{
        property: 'target',
        operation: '>',
        value: 2
      }]

  var result = DT.runDecisions(0, decisions, subject, {})
  t.equal(result, false, 'Binary condition returns false')

  subject.target = 3
  var result = DT.runDecisions(0, decisions, subject, {})
  t.equal(result, true, 'Binary condition returns true')

  t.end()
})

tape('Test Decision with Multiple Conditions', function (t) {
  var DT = new DTS()

  var subject = {
    testFirst: 1,
    testSecond: 1
  }

  var decisions = [
      {
        property: 'testFirst',
        operation: '>',
        value: 0
      },
      {
        property: 'testSecond',
        operation: '>',
        value: 2
      }
    ]

  var result = DT.runDecisions(0, decisions, subject, {})
  t.equal(result, false, 'Multiple conditions return false')

  subject.testSecond = 3
  var result = DT.runDecisions(0, decisions, subject, {})
  t.equal(result, true, 'Multiple conditions returns true')

  t.end()
})

tape('Test Arbitrary Condition', function (t) {
  var DT = new DTS()

  var subject = {
    random: 85
  }

  var node = {
    branches: [
      {
        decisions: [{
            property: 'random',
            operation: '<',
            value: 30
          }],
        node: 'first'
      },
      {
        decisions: [{
            property: 'random',
            operation: '<',
            value: 50
          }],
        node: 'second'
      },
      {
        decisions: [{
            property: 'random',
            operation: '<',
            value: 100
          }],
        node: 'third'
      }
    ]
  }

  DT.runNode(0, node, subject, {}, function (err, result) {
    t.equal(result, 'third', 'Node returns third node')
    subject.random = 35
    DT.runNode(0, node, subject, {}, function (err, result) {
      t.equal(result, 'second', 'Node returns second node')
      subject.random = 5
      DT.runNode(0, node, subject, {}, function (err, result) {
        t.equal(result, 'first', 'Node returns first node')
        t.end()
      })
    })
  })
})


tape('Test Deep Tree', function (t) {
  var DT = new DTS()

  var subject = {
    random: 29,
    age: 16
  }

  var node = {
    branches: [
      {
        decisions: [{
            property: 'random',
            operation: '<',
            value: 30
          }],
        node: {
          branches: [
            {
              decisions: [{
                  property: 'age',
                  operation: '<',
                  value: 18
                }],
              node: 'underage'
            },
            'adult'
          ]
        }
      },
      {
        decisions: [{
            property: 'random',
            operation: '<',
            value: 50
          }],
        node: 'second'
      }
    ]
  }

  DT.runNode(0, node, subject, {}, function (err, result) {
    t.equal(result, 'underage', 'Returns deep node')
    subject.age = 21
    DT.runNode(0, node, subject, {}, function (err, result) {
      t.equal(result, 'adult', 'Returns simple node')
      t.end()
    })
  })
})


