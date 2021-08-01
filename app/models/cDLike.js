/**
 * author: zp
 * description: “动态评论”点赞功能(comment like)
 * date: 2021/8/1
 */
const { sequelize } = require("../../core/db");
const { Sequelize, Model } = require("sequelize");
const { DComment } = require("./dComment");

class CDLike extends Model {
  // 点赞动态功能：
  static async likeComment(content) {
    const like = await CDLike.findOne({
      where: { commentId: content.commentId, userId: content.user },
    });

    const comment = await DComment.findOne({
      where: {
        id: content.commentId,
      },
    });

    // 点赞记录存在&已点赞
    if (like && like.isLike) {
      await comment.decrement("likeNum", { by: 1 });

      await CDLike.update(
        { isLike: false },
        { where: { commentId: content.commentId, userId: content.user } }
      );

      return "cancel";
    }

    // 点赞记录存在&未点赞
    if (like && !like.isLike) {
      await comment.increment("likeNum", { by: 1 });

      await CDLike.update(
        { isLike: true },
        { where: { commentId: content.commentId, userId: content.user } }
      );

      return "ok";
    }

    // 未点过赞
    if (!like) {
      await comment.increment("likeNum", { by: 1 });

      await CDLike.create({
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
    const records = await CDLike.findAll({
      where,
    });

    return records;
  }
}

CDLike.init(
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
    tableName: "cDlike",
  }
);

module.exports = {
    CDLike,
};
