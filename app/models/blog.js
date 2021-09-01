const { sequelize } = require("../../core/db");
const { Sequelize, Model, Op } = require("sequelize");
const { User } = require("./user");
const { Tag } = require("./tag");
const { Fans } = require("./fans");
const { CollectHistory } = require("./collectHistory");
const { Collection } = require("./collection");
const { ReadHistory } = require("./readHistory");

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

    if (status === "new") ranking = "created_at";

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
        "commentNum",
      ],
    });

    return blogs;
  }

  // 获取博客列表(搜索)
  static async getSearchPageBlogList({ where }, content) {
    const blogs = await Blog.findAndCountAll({
      where: {
        ...where,
        title: {
          [Op.like]: "%" + content + "%",
        },
      },
      order: [["created_at", "DESC"]],
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
        "commentNum",
      ],
    });

    return blogs;
  }

  // 获取博客列表（管理后台）
  static async getAllBlogList({ pageIndex, pageSize, blogId, author, type }) {
    const params = {};
    if (blogId) {
      params.id = blogId;
    }

    if (author) {
      params.author = author;
    }

    if (type) {
      params.tag = type;
    }

    const blogs = await Blog.findAndCountAll({
      where: { ...params },
      order: [["created_at", "DESC"]],
      offset: (Number(pageIndex) - 1) * Number(pageSize),
      limit: Number(pageSize),
      include: [
        {
          model: User,
          attributes: ["nickname", "id", "avatar"],
        },
        {
          model: Tag,
          attributes: ["tagName", "tagType"],
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
        "commentNum",
        "isShow",
      ],
    });

    return blogs;
  }

  // 获取关注人博客
  static async getAttentionBlogList(uid, status, pageIndex, pageSize) {
    let idols = await Fans.findAll({
      where: {
        followers: uid,
        isFollower: true,
      },
    });

    const blogs = [];
    for (let i = 0; i < idols.length; i++) {
      const blog = await Blog.findAll({
        where: {
          author: idols[i].byFollowers,
        },
        include: [
          {
            model: User,
            attributes: ["nickname", "avatar", "id"],
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
          "commentNum",
        ],
      });

      blogs.push(...blog);
    }

    // 排序
    if (status === "new") {
      blogs.sort(function (a, b) {
        return b.created_at - a.created_at;
      });
    } else {
      blogs.sort(function (a, b) {
        return b.blogReadNum - a.blogReadNum;
      });
    }

    // 分页
    let oBlogs = blogs.slice(Number(pageIndex) - 1, Number(pageSize));

    return {
      count: oBlogs,
      rows: blogs,
    };
  }

  // 获取关注人博客(搜索)
  static async getSearchAttentionBlogList(uid, content) {
    let idols = await Fans.findAll({
      where: {
        followers: uid,
        isFollower: true,
      },
    });

    const blogs = [];
    for (let i = 0; i < idols.length; i++) {
      const blog = await Blog.findAll({
        where: {
          author: idols[i].byFollowers,
          title: {
            [Op.like]: "%" + content + "%",
          },
        },
        include: [
          {
            model: User,
            attributes: ["nickname", "avatar", "id"],
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
          "commentNum",
        ],
      });

      blogs.push(...blog);
    }

    // 排序
    blogs.sort(function (a, b) {
      return b.created_at - a.created_at;
    });

    return {
      count: blogs.length,
      rows: blogs,
    };
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
      include: [
        {
          model: User,
          attributes: ["nickname", "avatar", "id"],
        },
      ],
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
    const blog = await Blog.findOne({
      where: {
        id: blogId,
      },
    });

    if (uid) {
      await ReadHistory.setHistory({
        blog: blogId,
        user: uid,
      });
    }

    // 获取博客的作者
    let author = "";
    author = blog ? blog.author : "";

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
        "commentNum",
      ],
    });

    // 阅读数+1
    blogs.increment("blogReadNum", { by: 1 });

    // 该博客作者被阅读数+1
    const user = await User.findOne({
      where: {
        id: blogs.author,
      },
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

  // 获取某个作者的文章列表
  static async getUserArtList(params) {
    // 定义文章排序方式
    let orderType = "blogReadNum";
    if (params.type === "new") {
      orderType = "created_at";
    }

    const result = await Blog.findAndCountAll({
      order: [[orderType, "DESC"]],
      limit: Number(params.pageSize),
      offset: (Number(params.pageIndex) - 1) * Number(params.pageSize),
      where: {
        author: params.uid,
      },
      include: [
        {
          model: User,
          attributes: ["id", "nickname"],
        },
        {
          model: Tag,
          attributes: ["tagName"],
        },
      ],
      attributes: [
        "id",
        "title",
        "description",
        "titlePic",
        "blogLikeNum",
        "blogReadNum",
        "commentNum",
        "created_at",
      ],
    });

    return result;
  }

  // 获取“作者”喜欢的博客列表
  static async getLikeBlog(blogId) {
    const result = await Blog.findOne({
      where: { id: blogId },
      attributes: [
        "id",
        "title",
        "description",
        "titlePic",
        "blogLikeNum",
        "blogReadNum",
        "commentNum",
        "created_at",
      ],
      include: [
        {
          model: User,
          attributes: ["id", "nickname"],
        },
        {
          model: Tag,
          attributes: ["tagName"],
        },
      ],
    });

    return result;
  }

  // 获取用户发表的所有文章
  static async getUserArticle(uid) {
    const resut = await Blog.findAll({
      where: {
        author: uid,
      },
      attributes: [
        "id",
        "title",
        "description",
        "titlePic",
        "blogLikeNum",
        "blogReadNum",
        "commentNum",
        "created_at",
      ],
      include: [
        {
          model: User,
          attributes: ["id", "nickname", "avatar"],
        },
        {
          model: Tag,
          attributes: ["tagName"],
        },
      ],
    });

    return resut;
  }

  // 删除某一条博客
  static async deleteBlog(id, uid) {
    const result = await Blog.destroy({
      where: {
        id,
        author: uid,
      },
    });

    // 删除博客后，该用户相应收藏夹文章数-1
    const histories = await CollectHistory.findAll({
      where: {
        blogId: id,
      },
    });

    for (let i = 0; i < histories.length; i++) {
      const collection = await Collection.findOne({
        where: {
          id: histories[i].collectionId,
        },
      });

      await collection.decrement("number", { by: 1 });
    }

    return result;
  }

  // 删除某一条博客(管理后台)
  static async deleteAdminBlog(id) {
    const result = await Blog.destroy({
      where: {
        id,
      },
    });

    // 删除博客后，该用户相应收藏夹文章数-1
    const histories = await CollectHistory.findAll({
      where: {
        blogId: id,
      },
    });

    for (let i = 0; i < histories.length; i++) {
      const collection = await Collection.findOne({
        where: {
          id: histories[i].collectionId,
        },
      });

      await collection.decrement("number", { by: 1 });
    }

    return result;
  }

  // 隐藏某一条博客(管理后台)
  static async hiddenAdminBlog(id) {
    const blog = await Blog.findOne({
      id,
    });

    if (blog.isShow) {
      await Blog.update({ isShow: false }, { where: { id } });

      return 0;
    }

    await Blog.update({ isShow: true }, { where: { id } });

    return 1;
  }

  // 更新某一条博客(管理后台)
  static async updateAdminBlog({ id, title, content, description, tag }) {
    await Blog.update({ title, content, description, tag }, { where: { id } });

    return "ok";
  }

  // 获取某一篇博客
  static async getBlog(blogId, uid) {
    const result = await Blog.findOne({
      where: {
        id: blogId,
        author: uid,
      },
      attributes: [
        "id",
        "title",
        "content",
        "description",
        "author",
        "tag",
        "titlePic",
      ],
    });

    return result;
  }

  // 获取某一篇博客(后台管理系统)
  static async getAdminBlog(blogId, uid) {
    const result = await Blog.findOne({
      where: {
        id: blogId,
      },
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
        "commentNum",
        "content",
      ],
      include: [
        {
          model: User,
          attributes: ["id", "nickname", "avatar"],
        },
        {
          model: Tag,
          attributes: ["tagName", "tagType"],
        },
      ],
    });

    return result;
  }

  // 获取某一篇博客
  static async getOneBlog(blogId) {
    const data = await Blog.findOne({
      where: {
        id: blogId,
      },
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
        "commentNum",
      ],
      include: [
        {
          model: User,
          attributes: ["id", "nickname", "avatar"],
        },
        {
          model: Tag,
          attributes: ["tagName"],
        },
      ],
    });

    return data;
  }

  // 获取用户浏览博客记录
  static async getReadBlog(blogId) {
    const result = await Blog.findOne({
      where: {
        id: blogId,
      },
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
        "commentNum",
      ],
      include: [
        {
          model: User,
          attributes: ["id", "nickname", "avatar"],
        },
        {
          model: Tag,
          attributes: ["tagName"],
        },
      ],
    });

    return result;
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
    isShow: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: "blog",
  }
);

// 建立表关联关系
sequelize.models.Blog.belongsTo(User, {
  foreignKey: "author",
});

sequelize.models.Blog.belongsTo(Tag, {
  foreignKey: "tag",
  targetKey: "tagType",
});

module.exports = {
  Blog,
};
