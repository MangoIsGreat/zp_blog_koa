/**
 * author: zp
 * description: “动态”点赞功能
 * date: 2021/6/23
 */
const { sequelize } = require("../../core/db");
const { Sequelize, Model } = require("sequelize");
const { Dynamic } = require("./dynamic");

class DLike extends Model {
  async likeDynamic(content) {
    const like = await DLike.findOne({
      where: { dynamic: content.dynamic, user: content.user },
    });

    if (like) {
      return null;
    }

    const dyna = await Dynamic.findOne({
      where: {
        id: content.dynamic,
      },
    });

    await dyna.increment("likeNum", { by: 1 });

    const result = await DLike.create(content);

    return result;
  }
}

DLike.init(
  {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
      allowNull: false,
      defaultValue: Sequelize.UUIDV4,
    },
    dynamic: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    user: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "dlike",
  }
);

module.exports = {
  DLike,
};
