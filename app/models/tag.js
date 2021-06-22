const { sequelize } = require("../../core/db");
const { Sequelize, Model } = require("sequelize");

class Tag extends Model {
}

Tag.init(
  {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
      allowNull: false,
      defaultValue: Sequelize.UUIDV4,
    },
    tagType: {
        type: Sequelize.INTEGER,
    },
    tagName: {
        type: Sequelize.STRING,
    }
  },
  {
    sequelize,
    tableName: "tag",
  }
);

module.exports = {
    Tag,
};
