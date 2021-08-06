/**
 * author: zp
 * description: “动态”点赞功能
 * date: 2021/8/1
 */
const { sequelize } = require("../../core/db");
const { Sequelize, Model } = require("sequelize");
const { Dynamic } = require("./dynamic");

class DLike extends Model {
  // 点赞动态功能：
  static async likeDynamic(content) {
    const like = await DLike.findOne({
      where: { dynamic: content.dynamic, user: content.user },
    });

    const dynamic = await Dynamic.findOne({
      where: {
        id: content.dynamic,
      },
    });

    // 点赞记录存在&已点赞
    if (like && like.isLike) {
      await dynamic.decrement("likeNum", { by: 1 });

      await DLike.update(
        { isLike: false },
        { where: { dynamic: content.dynamic, user: content.user } }
      );

      return "cancel";
    }

    // 点赞记录存在&未点赞
    if (like && !like.isLike) {
      await dynamic.increment("likeNum", { by: 1 });

      await DLike.update(
        { isLike: true },
        { where: { dynamic: content.dynamic, user: content.user } }
      );

      return "ok";
    }

    // 未点过赞
    if (!like) {
      await dynamic.increment("likeNum", { by: 1 });

      await DLike.create({
        dynamic: content.dynamic,
        user: content.user,
        isLike: true,
      });

      return "ok";
    }

    return false;
  }

  // 获取所有点赞记录
  static async getRecord(where) {
    const records = await DLike.findAndCountAll({
      where,
    });

    return records;
  }

  // 获取某个作者点赞过的"动态"记录
  static async getUserLike({ pageIndex, pageSize, uid }) {
    const result = await DLike.findAndCountAll({
      where: {
        user: uid,
        isLike: true,
      },
      limit: Number(pageSize),
      offset: (Number(pageIndex) - 1) * Number(pageSize),
      attributes: ["dynamic", "created_at"],
    });

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
      type: Sequelize.STRING, // 动态id
      allowNull: false,
    },
    user: {
      type: Sequelize.STRING, // 点赞用户
      allowNull: false,
    },
    isLike: {
      type: Sequelize.BOOLEAN, // 点赞状态/是否点赞
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
