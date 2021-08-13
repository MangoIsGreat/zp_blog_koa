/**
 * author: zp
 * description: 资讯点赞模块
 * date: 2021/8/4
 */
const { sequelize } = require("../../core/db");
const { Sequelize, Model } = require("sequelize");
const { News } = require("./news");
const { User } = require("./user");

class NewsLike extends Model {
  // 点赞资讯功能：
  static async likeNews(content) {
    const like = await NewsLike.findOne({
      where: { newsId: content.newsId, user: content.user },
    });

    const news = await News.findOne({
      where: {
        id: content.newsId,
      },
    });

    // 点赞记录存在&已点赞
    if (like && like.isLike) {
      await news.decrement("newsLikeNum", { by: 1 });

      await NewsLike.update(
        { isLike: false },
        { where: { newsId: content.newsId, user: content.user } }
      );

      return "cancel";
    }

    // 点赞记录存在&未点赞
    if (like && !like.isLike) {
      await news.increment("newsLikeNum", { by: 1 });

      await NewsLike.update(
        { isLike: true },
        { where: { newsId: content.newsId, user: content.user } }
      );

      return "ok";
    }

    // 未点过赞
    if (!like) {
      await news.increment("newsLikeNum", { by: 1 });

      await NewsLike.create({
        newsId: content.newsId,
        user: content.user,
        isLike: true,
      });

      return "ok";
    }

    return false;
  }

  // 获取所有点赞记录
  static async getRecord(where) {
    const records = await NewsLike.findAndCountAll({
      where,
    });

    return records;
  }

  // 获取某个作者点赞过的资讯记录
  static async getUserLike({ pageIndex, pageSize, uid }) {
    const result = await NewsLike.findAndCountAll({
      order: [["created_at", "DESC"]],
      where: {
        user: uid,
        isLike: true,
      },
      limit: Number(pageSize),
      offset: (Number(pageIndex) - 1) * Number(pageSize),
      attributes: ["newsId", "created_at"],
    });

    return result;
  }

  // 获取用户点赞过的所有资讯记录
  static async getUserLikeNews(uid) {
    const result = await NewsLike.findAll({
      where: {
        user: uid,
        isLike: true,
      },
      attributes: ["newsId", "created_at"],
      include: [
        {
          model: News,
          attributes: [
            "author",
            "newsLikeNum",
            "newsReadNum",
            "created_at",
            "description",
            "id",
            "tag",
            "title",
            "titlePic",
            "updated_at",
          ],
        },
        {
          model: User,
          attributes: ["id", "nickname", "avatar", "profession"],
        },
      ],
    });

    return result;
  }
}

NewsLike.init(
  {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
      allowNull: false,
      defaultValue: Sequelize.UUIDV4,
    },
    newsId: {
      type: Sequelize.STRING, // 资讯Id
      allowNull: false,
    },
    user: {
      type: Sequelize.STRING, // 点赞用户
      allowNull: false,
    },
    isLike: {
      type: Sequelize.BOOLEAN, // 是否点赞
    },
  },
  {
    sequelize,
    tableName: "newslike",
  }
);

sequelize.models.NewsLike.belongsTo(News, {
  foreignKey: "newsId",
});

sequelize.models.NewsLike.belongsTo(User, {
  foreignKey: "user",
});

module.exports = {
  NewsLike,
};
