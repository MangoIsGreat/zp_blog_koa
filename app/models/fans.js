const { sequelize } = require("../../core/db");
const { Sequelize, Model } = require("sequelize");

class Fans extends Model {}

Tag.init(
  {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
      allowNull: false,
      defaultValue: Sequelize.UUIDV4,
    },
    byFollowers: {
      type: Sequelize.STRING,
    },
    followers: {
      type: Sequelize.STRING,
    },
    isFollower: {
      type: Sequelize.BOOLEAN,
    },
  },
  {
    sequelize,
    tableName: "fans",
  }
);

module.exports = {
  Fans,
};
