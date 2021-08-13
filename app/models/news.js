const { sequelize } = require("../../core/db");
const { Sequelize, Model } = require("sequelize");
const { User } = require("./user");
const { NewsType } = require("./newsType");

class News extends Model {
  // 创建资讯
  static async createNews(content) {
    const news = await News.create(content);

    return news;
  }

  // 获取资讯列表
  static async getHomePageNewsList({ where }, status, pageIndex, pageSize) {
    // 文章排序状态(默认按阅读量排序)：
    let ranking = "newsReadNum";

    if (status === "new") ranking = "created_at";

    const news = await News.findAndCountAll({
      where,
      order: [[ranking, "DESC"]],
      offset: (pageIndex * 1 - 1) * pageSize,
      limit: pageSize * 1,
      include: [
        {
          model: User,
          attributes: ["id", "nickname"],
        },
        {
          model: NewsType,
          attributes: ["tagName"],
        },
      ],
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
    });

    return news;
  }

  // 热门文章推荐
  static async getHotList(content) {
    const news = await News.findOne({
      where: {
        id: content.newsId,
      },
    });

    const list = await News.findAndCountAll({
      order: [["newsReadNum", "DESC"]],
      where: {
        tag: news.tag,
      },
      limit: 5,
      attributes: [
        "id",
        "title",
        "author",
        "tag",
        "newsLikeNum",
        "newsReadNum",
      ],
    });

    return list;
  }

  // 最新文章推荐
  static async getNewList(content) {
    const news = await News.findOne({
      where: {
        id: content.newsId,
      },
    });

    const list = await News.findAndCountAll({
      order: [["created_at", "DESC"]],
      where: {
        tag: news.tag,
      },
      limit: 5,
      attributes: [
        "id",
        "title",
        "author",
        "tag",
        "newsLikeNum",
        "newsReadNum",
      ],
    });

    return list;
  }

  // 相关文章推荐
  static async relatedList({ newsID, pageIndex, pageSize }) {
    const news = await News.findOne({
      where: {
        id: newsID,
      },
    });

    const list = await News.findAndCountAll({
      order: [["newsReadNum", "DESC"]],
      where: {
        tag: news.tag,
      },
      offset: (pageIndex * 1 - 1) * pageSize,
      limit: pageSize * 1,
      include: [
        {
          model: User,
          attributes: ["id", "nickname"],
        },
        {
          model: NewsType,
          attributes: ["tagName"],
        },
      ],
      attributes: [
        "id",
        "title",
        "author",
        "tag",
        "newsLikeNum",
        "newsReadNum",
        "description",
        "created_at",
        "titlePic",
      ],
    });

    return list;
  }

  // 获取某一篇文章
  static async getNews(newsId, uid) {
    const newsStatus = await sequelize.models.NewsLike.findOne({
      where: {
        newsId: newsId,
        user: uid,
      },
    });

    let newsItem = await News.findOne({
      where: {
        id: newsId,
      },
      include: [
        {
          model: User,
          attributes: [
            "id",
            "nickname",
            "avatar",
            "profession",
            "signature",
            "fansNum",
            "idolNum",
          ],
        },
        {
          model: NewsType,
          attributes: ["tagName", "id"],
        },
      ],
      attributes: [
        "id",
        "title",
        "content",
        "author",
        "titlePic",
        "newsLikeNum",
        "newsReadNum",
        "created_at",
        "updated_at",
      ],
    });

    // 阅读数+1
    newsItem.increment("newsReadNum", { by: 1 });

    newsItem = JSON.parse(JSON.stringify(newsItem));

    // 当前用户是否点赞该博客
    newsItem.isLike = false;

    if (newsStatus && newsStatus.isLike) {
      newsItem.isLike = true;
    }

    return newsItem;
  }

  // 获取“作者”喜欢的"资讯"列表
  static async getLikeNews(newsId) {
    const result = await News.findOne({
      where: { id: newsId },
      attributes: [
        "id",
        "title",
        "description",
        "titlePic",
        "newsLikeNum",
        "newsReadNum",
        "created_at",
      ],
      include: [
        {
          model: User,
          attributes: ["id", "nickname", "avatar"],
        },
        {
          model: NewsType,
          attributes: ["tagName", "id"],
        },
      ],
    });

    return result;
  }

  // 获取作者发表的所有资讯
  static async getUserNews() {
    const result = await News.findAll({
      include: [
        {
          model: User,
          attributes: ["id", "nickname", "avatar"],
        },
        {
          model: NewsType,
          attributes: ["tagName"],
        },
      ],
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
        "created_at",
      ],
    });

    return result;
  }
}

News.init(
  {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
      allowNull: false,
      defaultValue: Sequelize.UUIDV4,
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    content: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    author: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    tag: {
      type: Sequelize.INTEGER, // 资讯类型
    },
    titlePic: {
      type: Sequelize.STRING,
    },
    newsLikeNum: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    newsReadNum: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: "news",
  }
);

// 建立表关联关系
sequelize.models.News.belongsTo(User, {
  foreignKey: "author",
});

sequelize.models.News.belongsTo(NewsType, {
  foreignKey: "tag",
  targetKey: "tagType",
});

module.exports = {
  News,
};
