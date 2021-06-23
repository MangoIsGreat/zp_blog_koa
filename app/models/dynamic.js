const { sequelize } = require("../../core/db");
const { Sequelize, Model } = require("sequelize");

class Dynamic extends Model {
  async createDynamic(content) {
    const dynamic = await Dynamic.create(content);

    return dynamic;
  }

  static async getDynamicList() {
    const dynamic = await Dynamic.findAll();

    return dynamic;
  }
}

Dynamic.init(
  {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
      allowNull: false,
      defaultValue: Sequelize.UUIDV4,
    },
    theme: {
      type: Sequelize.STRING,
    },
    content: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    author: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    likeNum: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    commNum: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: "dynamic",
  }
);

module.exports = {
  Dynamic,
};
