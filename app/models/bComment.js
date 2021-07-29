/**
 * author: zp
 * description: 博文评论模块 -- 评论表
 * date: 2021/7/29
 */
const { sequelize } = require("../../core/db");
const { Sequelize, Model } = require("sequelize");
const { User } = require("./user");
const { BReply } = require("./bReply");

class BComment extends Model {
  // 评论博客
  static async comment(content) {
    await BComment.create(content);

    return "评论成功";
  }

  static async getList({ blogId }) {
    let result = await BComment.findAll({
      where: { blogId },
      attributes: ["id", "blogId", "content", "created_at", "fromId"],
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
      let data = await BReply.findAll({
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
}

BComment.init(
  {
    id: {
      type: Sequelize.UUID, // 评论id
      primaryKey: true,
      allowNull: false,
      defaultValue: Sequelize.UUIDV4,
    },
    blogId: {
      type: Sequelize.STRING, // 博客id
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
  },
  {
    sequelize,
    tableName: "bcomment",
  }
);

sequelize.models.BComment.belongsTo(User, {
  as: "comment",
  foreignKey: "fromId",
});

sequelize.models.BReply.belongsTo(User, {
  as: "from",
  foreignKey: "fromUid",
});

sequelize.models.BReply.belongsTo(User, {
  as: "to",
  foreignKey: "toUid",
});

module.exports = {
  BComment,
};
