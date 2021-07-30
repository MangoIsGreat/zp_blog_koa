/**
 * author: zp
 * description: “博客评论”点赞功能(comment like)
 * date: 2021/7/30
 */
const { sequelize } = require("../../core/db");
const { Sequelize, Model } = require("sequelize");
const { BComment } = require("./bComment");

class CLike extends Model {
  // 点赞博客功能：
  static async likeComment(content) {
    const like = await CLike.findOne({
      where: { commentId: content.commentId, userId: content.user },
    });

    const comment = await BComment.findOne({
      where: {
        id: content.commentId,
      },
    });

    // 点赞记录存在&已点赞
    if (like && like.isLike) {
      await comment.decrement("likeNum", { by: 1 });

      await CLike.update(
        { isLike: false },
        { where: { commentId: content.commentId, userId: content.user } }
      );

      return "cancel";
    }

    // 点赞记录存在&未点赞
    if (like && !like.isLike) {
      await comment.increment("likeNum", { by: 1 });

      await CLike.update(
        { isLike: true },
        { where: { commentId: content.commentId, userId: content.user } }
      );

      return "ok";
    }

    // 未点过赞
    if (!like) {
      await comment.increment("likeNum", { by: 1 });

      await CLike.create({
        commentId: content.commentId,
        userId: content.user,
        isLike: true,
      });

      return "ok";
    }

    return false;
  }

  // 获取所有点赞记录
  static async getRecord(where) {
    const records = await CLike.findAll({
      where,
    });

    return records;
  }
}

CLike.init(
  {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
      allowNull: false,
      defaultValue: Sequelize.UUIDV4,
    },
    commentId: {
      type: Sequelize.STRING, // 评论id
      allowNull: false,
    },
    userId: {
      type: Sequelize.STRING, // 点赞用户
      allowNull: false,
    },
    isLike: {
      type: Sequelize.BOOLEAN, // 是否点赞
    },
  },
  {
    sequelize,
    tableName: "clike",
  }
);

module.exports = {
  CLike,
};
