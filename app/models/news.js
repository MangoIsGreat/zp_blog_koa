const { sequelize } = require("../../core/db");
const { Sequelize, Model } = require("sequelize");
const { User } = require("./user");
const { NewsType } = require("./newsType");
// const { Fans } = require("./fans");
// const { CollectHistory } = require("./collectHistory");

class News extends Model {
  // 创建资讯
  static async createNews(content) {
    const news = await News.create(content);

    return news;
  }

  // 获取博客列表
  static async getHomePageNewsList({ where }, status, pageIndex, pageSize) {
    // 文章排序状态(默认按阅读量排序)：
    let ranking = "newsReadNum";

    if (status === "new") ranking = "updated_at";

    // 多表查询(一对多)
    // News.belongsTo(User, {
    //   foreignKey: "author",
    // });

    // News.belongsTo(Tag, {
    //   foreignKey: "tag",
    //   targetKey: "tagType",
    // });

    const news = await News.findAndCountAll({
      where,
      order: [[ranking, "DESC"]],
      offset: (pageIndex * 1 - 1) * pageSize,
      limit: pageSize * 1,
      include: [
        {
          model: User,
          attributes: ["nickname"],
        },
        {
          model: NewsType,
          attributes: ["newsName"],
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
      order: [["blogLikeNum", "DESC"]],
      where: {
        tag: news.tag,
      },
      limit: 5,
      attributes: ["id", "title", "author", "tag", "newsLikeNum"],
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

    // 多表查询(一对多)
    // News.belongsTo(User, {
    //   foreignKey: "author",
    // });

    // News.belongsTo(Tag, {
    //   foreignKey: "tag",
    //   targetKey: "tagType",
    // });

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
          attributes: ["nickname"],
        },
        {
          model: NewsType,
          attributes: ["newsName"],
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
    // 多表查询(一对多)
    // News.belongsTo(User, {
    //   foreignKey: "author",
    // });

    // News.belongsTo(Tag, {
    //   foreignKey: "tag",
    //   targetKey: "tagType",
    // });

    // const news = await News.findOne({
    //   where: {
    //     id: newsId,
    //   },
    // });

    // 获取博客的作者
    // const author = news.author;

    // 查看当前用户和博客作者是否已经建立“关注”关系
    // const attention = await Fans.findOne({
    //   where: {
    //     byFollowers: author,
    //     followers: uid,
    //   },
    // });

    const newsStatus = await sequelize.models.NewsLike.findOne({
      where: {
        newsId: newsId,
        user: uid,
      },
    });

    // 标记是否已建立“关注”关系
    // let isAttention = false;

    // if (attention && attention.isFollower) {
    //   isAttention = true;
    // }

    // 标记博客作者是不是当前用户自己
    // let isSelf = false;

    // if (author === uid) {
    //   isSelf = true;
    // }

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
            "blogReadNum",
            "blogLikeNum",
            "fansNum",
            "idolNum",
          ],
        },
        {
          model: NewsType,
          attributes: ["newsName", "id"],
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

    // 该博客作者被阅读数+1
    // const user = await User.findOne({
    //   where: {
    //     id: blogs.author,
    //   },
    // });

    // user.increment("blogReadNum", { by: 1 });

    newsItem = JSON.parse(JSON.stringify(newsItem));

    // 当前用户是否点赞该博客
    newsItem.isLike = false;

    if (newsStatus && newsStatus.isLike) {
      newsItem.isLike = true;
    }

    // 是否已关注
    // blogs.User.isAttention = isAttention;
    // 是否作者是当前用户本人
    // blogs.User.isSelf = isSelf;

    // 标记当前用户是否已经收藏该文章
    // const collection = await CollectHistory.findOne({
    //   where: {
    //     blogId,
    //     userId: uid,
    //   },
    // });

    // let isCollect = false; // 当前用户是否收藏该文章默认false

    // if (collection) {
    //   isCollect = true;
    // }

    // blogs.isCollect = isCollect;

    return newsItem;
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
      allowNull: false,
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
  targetKey: "newsType",
});

module.exports = {
  News,
};
