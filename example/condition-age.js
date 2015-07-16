


Age = module.exports = function (opts) {
  this.title = 'Age'
  this.schema = {
    operator: {
      default: '=',
      options: [
        '=',
        '>',
        '>=',
        '<',
        '<='
      ]
    },
    value: {
      default: 0,
      type: 'number'
    }
  }
}

Age.prototype.run = function (opts, data) {

}
