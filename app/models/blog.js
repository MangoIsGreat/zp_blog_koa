const { sequelize } = require("../../core/db");
const { Sequelize, Model } = require("sequelize");
const { User } = require("./user");
const { Tag } = require("./tag");
const { Fans } = require("./fans");
const { CollectHistory } = require("./collectHistory");

class Blog extends Model {
  // 创建博客
  async createBlog(content) {
    const blog = await Blog.create(content);

    return blog;
  }

  // 获取博客列表
  static async getHomePageBlogList({ where }, status, pageIndex, pageSize) {
    // 文章排序状态：
    let ranking = "blogReadNum";

    if (status === "new") ranking = "updated_at";

    // 多表查询(一对多)
    Blog.belongsTo(User, {
      foreignKey: "author",
    });

    Blog.belongsTo(Tag, {
      foreignKey: "tag",
      targetKey: "tagType",
    });

    const blogs = await Blog.findAndCountAll({
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
          model: Tag,
          attributes: ["tagName"],
        },
      ],
      attributes: [
        "author",
        "blogLikeNum",
        "blogReadNum",
        "created_at",
        "description",
        "id",
        "tag",
        "title",
        "titlePic",
        "updated_at",
      ],
    });

    return blogs;
  }

  // 热门文章推荐
  static async getHotList(content) {
    const blog = await Blog.findOne({
      where: {
        id: content.blog,
      },
    });

    const list = await Blog.findAndCountAll({
      order: [["blogLikeNum", "DESC"]],
      where: {
        tag: blog.tag,
      },
      limit: 5,
      attributes: ["id", "title", "author", "tag", "blogLikeNum", "commentNum"],
    });

    return list;
  }

  // 相关文章推荐
  static async relatedList({ blogID, pageIndex, pageSize }) {
    const blog = await Blog.findOne({
      where: {
        id: blogID,
      },
    });

    // 多表查询(一对多)
    Blog.belongsTo(User, {
      foreignKey: "author",
    });

    Blog.belongsTo(Tag, {
      foreignKey: "tag",
      targetKey: "tagType",
    });

    const list = await Blog.findAndCountAll({
      order: [["blogReadNum", "DESC"]],
      where: {
        tag: blog.tag,
      },
      offset: (pageIndex * 1 - 1) * pageSize,
      limit: pageSize * 1,
      include: [
        {
          model: User,
          attributes: ["nickname"],
        },
        {
          model: Tag,
          attributes: ["tagName"],
        },
      ],
      attributes: [
        "id",
        "title",
        "author",
        "tag",
        "blogLikeNum",
        "blogReadNum",
        "commentNum",
        "description",
        "created_at",
        "titlePic",
      ],
    });

    return list;
  }

  // 获取某一篇文章
  static async getArticle(blogId, uid) {
    // 多表查询(一对多)
    Blog.belongsTo(User, {
      foreignKey: "author",
    });

    Blog.belongsTo(Tag, {
      foreignKey: "tag",
      targetKey: "tagType",
    });

    const blog = await Blog.findOne({
      where: {
        id: blogId,
      },
    });

    // 获取博客的作者
    const author = blog.author;

    // 查看当前用户和博客作者是否已经建立“关注”关系
    const attention = await Fans.findOne({
      where: {
        byFollowers: author,
        followers: uid,
      },
    });

    // 查询文章的点赞状态
    const blogStatus = await sequelize.models.BLike.findOne({
      where: {
        blog: blogId,
        user: uid,
      },
    });

    // 标记是否已建立“关注”关系
    let isAttention = false;

    if (attention && attention.isFollower) {
      isAttention = true;
    }

    // 标记博客作者是不是当前用户自己
    let isSelf = false;

    if (author === uid) {
      isSelf = true;
    }

    let blogs = await Blog.findOne({
      where: {
        id: blogId,
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
          model: Tag,
          attributes: ["tagName", "id"],
        },
      ],
      attributes: [
        "id",
        "title",
        "content",
        "author",
        "titlePic",
        "blogLikeNum",
        "blogReadNum",
        "created_at",
        "updated_at",
      ],
    });

    // 阅读数+1
    blogs.increment("blogReadNum", { by: 1 });

    // 该博客作者被阅读数+1
    const user = await User.findOne({
      id: blogs.author,
    });

    user.increment("blogReadNum", { by: 1 });

    blogs = JSON.parse(JSON.stringify(blogs));

    // 当前用户是否点赞该博客
    blogs.isLike = false;

    if (blogStatus && blogStatus.isLike) {
      blogs.isLike = true;
    }

    // 是否已关注
    blogs.User.isAttention = isAttention;
    // 是否作者是当前用户本人
    blogs.User.isSelf = isSelf;

    // 标记当前用户是否已经收藏该文章
    const collection = await CollectHistory.findOne({
      where: {
        blogId,
        userId: uid,
      },
    });

    let isCollect = false; // 当前用户是否收藏该文章默认false

    if (collection) {
      isCollect = true;
    }

    blogs.isCollect = isCollect;

    return blogs;
  }
}

Blog.init(
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
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    titlePic: {
      type: Sequelize.STRING,
    },
    blogLikeNum: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    blogReadNum: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    commentNum: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: "blog",
  }
);

module.exports = {
  Blog,
};
