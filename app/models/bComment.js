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
    BComment.create(content);

    return "评论成功";
  }

  static async getList({ blogId }) {
    // 多表查询(一对多)
    BComment.belongsTo(User, {
      foreignKey: "fromId",
    });

    BComment.belongsTo(BReply, {
      foreignKey: "id",
      targetKey: "commentId",
    });

    BReply.belongsTo(User, {
      foreignKey: "fromUid",
    });

    const result = BComment.findAndCountAll({
      where: { blogId },
      attributes: ["id", "blogId", "content", "created_at", "fromId"],
      include: [
        {
          model: User,
          attributes: ["nickname", "id", "avatar", "profession", "signature"],
        },
        {
          model: BReply,
          include: [
            {
              model: User,
              attributes: [
                "nickname",
                "id",
                "avatar",
                "profession",
                "signature",
              ],
            },
          ],
          // attributes: [
          //   "blogId",
          //   "id",
          //   "commentId",
          //   "content",
          //   "fromUid",
          //   "toUid",
          // ],
        },
      ],
    });

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

module.exports = {
  BComment,
};
