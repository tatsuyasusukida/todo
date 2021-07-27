module.exports = function (sequelize, DataTypes) {
  const todo = sequelize.define('todo', {
    date: {type: DataTypes.DATE, allowNull: false},
    content: {type: DataTypes.TEXT, allowNull: false},
  })

  return todo
}
