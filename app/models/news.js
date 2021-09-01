const { sequelize } = require("../../core/db");
const { Sequelize, Model } = require("sequelize");
const { User } = require("./user");
const { Fans } = require("./fans");
const { NewsType } = require("./newsType");

class News extends Model {
  // 创建资讯
  static async createNews(content) {
    const news = await News.create(content);

    return news;
  }

  // 删除资讯
  static async deleteNews(id) {
    const result = await News.destroy({
      where: {
        id,
      },
    });

    return result;
  }

  // 更新资讯
  static async updateNews({ id, title, content, description, tag }) {
    await News.update({ title, content, description, tag }, { where: { id } });

    return "ok";
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

    // 标注作者是否关注
    let author = "";
    author = newsItem ? newsItem.author : "";
    // 查看当前用户和资讯作者是否已经建立关注关系
    const attention = await Fans.findOne({
      where: {
        byFollowers: author,
        followers: uid,
      },
    });

    // 标记是否已建立“关注”关系
    let isAttention = false;

    if (attention && attention.isFollower) {
      isAttention = true;
    }

    // 是否已关注
    newsItem.User.isAttention = isAttention;

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

  static async getOneNews(newsId) {
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
          attributes: ["tagName", "id", "tagType"],
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

    return newsItem;
  }

  // 获取作者发表的所有资讯
  static async getUserNews(uid) {
    const result = await News.findAll({
      where: { author: uid },
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

  // 获取作者发表的所有资讯
  static async getNewsList({ pageIndex, pageSize, newsId, author, type }) {
    const params = {};
    if (newsId) {
      params.id = newsId;
    }

    if (author) {
      params.author = author;
    }

    if (type) {
      params.tag = type;
    }

    const result = await News.findAndCountAll({
      where: { ...params },
      offset: (Number(pageIndex) - 1) * Number(pageSize),
      limit: Number(pageSize),
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
