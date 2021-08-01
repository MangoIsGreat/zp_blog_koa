/**
 * author: zp
 * description: 动态评论模块 -- 评论表
 * date: 2021/8/1
 */
const { sequelize } = require("../../core/db");
const { Sequelize, Model } = require("sequelize");
const { User } = require("./user");
const { DReply } = require("./dReply");

class DComment extends Model {
  // 评论博客
  static async comment(content) {
    await DComment.create(content);

    return "评论成功";
  }

  static async getList({ dynamicId }) {
    let result = await DComment.findAll({
      order: [["created_at", "DESC"]],
      where: { dynamicId },
      attributes: [
        "id",
        "dynamicId",
        "content",
        "created_at",
        "fromId",
        "likeNum",
      ],
      include: [
        {
          model: sequelize.models.User,
          as: "comment",
          attributes: ["nickname", "id", "avatar", "profession", "signature"],
        },
      ],
    });

    result = JSON.parse(JSON.stringify(result));

    for (let i = 0; i < result.length; i++) {
      let data = await DReply.findAll({
        where: {
          commentId: result[i].id,
        },
        include: [
          {
            model: sequelize.models.User,
            as: "from",
            attributes: ["nickname", "id", "avatar", "profession", "signature"],
          },
          {
            model: sequelize.models.User,
            as: "to",
            attributes: ["nickname", "id", "avatar", "profession", "signature"],
          },
        ],
      });

      data = JSON.parse(JSON.stringify(data));

      result[i].child = data;
    }

    return result;
  }

  static async getCommentList(dynamicId) {
    const result = await DComment.findAll({
      where: { dynamicId },
    });

    return result;
  }
}

DComment.init(
  {
    id: {
      type: Sequelize.UUID, // 评论id
      primaryKey: true,
      allowNull: false,
      defaultValue: Sequelize.UUIDV4,
    },
    dynamicId: {
      type: Sequelize.STRING, // 动态id
      allowNull: false,
    },
    content: {
      type: Sequelize.TEXT, // 评论内容
      allowNull: false,
    },
    fromId: {
      type: Sequelize.STRING, // 评论人id
      allowNull: false,
    },
    likeNum: {
      type: Sequelize.INTEGER, // 被点赞数量
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: "dcomment",
  }
);

sequelize.models.DComment.belongsTo(User, {
  as: "comment",
  foreignKey: "fromId",
});

sequelize.models.DReply.belongsTo(User, {
  as: "from",
  foreignKey: "fromUid",
});

sequelize.models.DReply.belongsTo(User, {
  as: "to",
  foreignKey: "toUid",
});

module.exports = {
  DComment,
};
