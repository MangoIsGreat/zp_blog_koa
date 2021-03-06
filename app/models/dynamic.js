const { sequelize } = require("../../core/db");
const { Sequelize, Model } = require("sequelize");
const { Fans } = require("./fans");
const { User } = require("./user");
const { Theme } = require("./theme");

class Dynamic extends Model {
  async createDynamic(content) {
    const dynamic = await Dynamic.create(content);

    // 创建成功则响应主题“动态数”+1
    let theme = null;
    if (content.theme) {
      theme = await Theme.findOne({
        where: {
          themeName: content.theme,
        },
      });
    }

    if (theme) {
      theme.increment("artNum", { by: 1 });
    }

    return dynamic;
  }

  // 获取动态列表
  static async getDynamicList(query) {
    // 排序的方式
    let ranking = "created_at";
    if (query.type === "hot") {
      ranking = "likeNum";
    }

    const dynamic = await Dynamic.findAll({
      order: [[ranking, "DESC"]],
      limit: Number(query.pageSize),
      offset: (Number(query.pageIndex) - 1) * Number(query.pageSize),
      where: query.theme
        ? {
            theme: query.theme,
          }
        : null,
      include: [
        {
          model: sequelize.models.User,
          as: "userInfo",
          attributes: ["nickname", "id", "avatar", "profession", "signature"],
        },
      ],
    });

    return dynamic;
  }

  // 获取动态列表（管理后台）
  static async getAllDynamicList({
    pageIndex,
    pageSize,
    dynId,
    author,
    theme,
  }) {
    const params = {};
    if (dynId) {
      params.id = dynId;
    }

    if (author) {
      params.author = author;
    }

    if (theme) {
      params.theme = theme;
    }

    const dynamics = await Dynamic.findAndCountAll({
      where: { ...params },
      order: [["created_at", "DESC"]],
      offset: (Number(pageIndex) - 1) * Number(pageSize),
      limit: Number(pageSize),
      include: [
        {
          model: sequelize.models.User,
          as: "userInfo",
          attributes: ["nickname", "id", "avatar", "profession", "signature"],
        },
      ],
      attributes: [
        "id",
        "theme",
        "content",
        "author",
        "likeNum",
        "commNum",
        "picUrl",
      ],
    });

    return dynamics;
  }

  // 获取关注人动态列表
  static async getAttentionDynamic(content) {
    let idols = await Fans.findAll({
      where: {
        followers: content.uid,
        isFollower: true,
      },
    });

    // 获取的动态
    let dynamics = [];
    for (let i = 0; i < idols.length; i++) {
      const dyns = await Dynamic.findAll({
        where: {
          author: idols[i].byFollowers,
        },
        include: [
          {
            model: sequelize.models.User,
            as: "userInfo",
            attributes: ["nickname", "id", "avatar", "profession", "signature"],
          },
        ],
      });

      dynamics.push(...dyns);
    }

    dynamics.sort(function (a, b) {
      return b.created_at - a.created_at;
    });

    dynamics = dynamics.slice(
      Number(content.pageIndex) - 1,
      Number(content.pageSize)
    );

    return dynamics;
  }

  static async getFavDynamicList() {
    // 获取精选“动态”
    const dynamic = await Dynamic.findAll({
      order: [["likeNum", "DESC"]],
      limit: 3,
      attributes: [
        "id",
        "theme",
        "content",
        "author",
        "likeNum",
        "commNum",
        "picUrl",
      ],
    });

    return dynamic;
  }

  static async getFavDynamicList() {
    // 获取精选“动态”
    const dynamic = await Dynamic.findAll({
      order: [["likeNum", "DESC"]],
      limit: 3,
      attributes: [
        "id",
        "theme",
        "content",
        "author",
        "likeNum",
        "commNum",
        "picUrl",
      ],
    });

    return dynamic;
  }

  static async getOneDynamic({ id }) {
    // 获取精选“动态”
    const dynamic = await Dynamic.findOne({
      where: { id },
      attributes: [
        "id",
        "theme",
        "content",
        "author",
        "likeNum",
        "commNum",
        "picUrl",
      ],
    });

    return dynamic;
  }

  static async updateDyn({ id, theme, content }) {
    const params = {};

    if (theme) {
      params.theme = theme;
    }

    if (content) {
      params.content = content;
    }

    // 更新动态
    await Dynamic.update({ ...params }, { where: { id } });

    return "ok";
  }

  // 获取某一条动态
  static async getDynamic(dynamicId, uid) {
    // 多表查询(一对多)
    Dynamic.belongsTo(User, {
      foreignKey: "author",
    });

    const dynamic = await Dynamic.findOne({
      where: {
        id: dynamicId,
      },
    });

    // 获取动态的作者
    const author = dynamic && dynamic.author;

    // 查看当前用户和动态作者是否已经建立“关注”关系
    const attention = await Fans.findOne({
      where: {
        byFollowers: author,
        followers: uid,
      },
    });

    // 查询动态的点赞状态
    const dynamicStatus = await sequelize.models.DLike.findOne({
      where: {
        dynamic: dynamicId,
        user: uid,
      },
    });

    // 标记是否已建立“关注”关系
    let isAttention = false;

    if (attention && attention.isFollower) {
      isAttention = true;
    }

    // 标记动态作者是不是当前用户自己
    let isSelf = false;

    if (author === uid) {
      isSelf = true;
    }

    let dynamics = await Dynamic.findOne({
      where: {
        id: dynamicId,
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
      ],
      attributes: [
        "id",
        "content",
        "author",
        "likeNum",
        "commNum",
        "created_at",
        "updated_at",
        "theme",
        "picUrl",
      ],
    });

    dynamics = JSON.parse(JSON.stringify(dynamics));

    // 当前用户是否点赞该博客
    if (dynamics) {
      dynamics.isLike = false;

      // 是否已关注
      dynamics.User.isAttention = isAttention;
      // 是否作者是当前用户本人
      dynamics.User.isSelf = isSelf;
    }

    if (dynamicStatus && dynamicStatus.isLike) {
      dynamics.isLike = true;
    }

    return dynamics;
  }

  // 获取某个作者的动态列表
  static async getUserDynList(params) {
    const dynamic = await Dynamic.findAndCountAll({
      order: [["created_at", "DESC"]],
      limit: Number(params.pageSize),
      offset: (Number(params.pageIndex) - 1) * Number(params.pageSize),
      where: {
        author: params.uid,
      },
      include: [
        {
          as: "userInfo",
          model: User,
          attributes: ["id", "nickname", "avatar", "profession"],
        },
      ],
      attributes: [
        "id",
        "theme",
        "content",
        "likeNum",
        "commNum",
        "picUrl",
        "created_at",
      ],
    });

    return dynamic;
  }

  // 获取“作者”喜欢的"动态"列表
  static async getLikeDyn(dynId) {
    const result = await Dynamic.findOne({
      where: { id: dynId },
      attributes: [
        "id",
        "theme",
        "content",
        "likeNum",
        "commNum",
        "picUrl",
        "created_at",
      ],
      include: [
        {
          as: "userInfo",
          model: User,
          attributes: ["id", "nickname", "avatar"],
        },
      ],
    });

    return result;
  }

  // 获取作者发布的所有动态
  static async getUserDynamic(uid) {
    const result = await Dynamic.findAll({
      where: { author: uid },
      attributes: [
        "id",
        "theme",
        "content",
        "likeNum",
        "commNum",
        "picUrl",
        "created_at",
      ],
      include: [
        {
          as: "userInfo",
          model: User,
          attributes: ["id", "nickname", "avatar"],
        },
      ],
    });

    return result;
  }

  // 删除某一条动态
  static async deleteDyn(id, uid) {
    const result = await Dynamic.destroy({
      where: {
        id,
        author: uid,
      },
    });

    return result;
  }

  // 删除某一条动态(管理后台)
  static async deleteAdminDyn(id) {
    const result = await Dynamic.destroy({
      where: {
        id,
      },
    });

    return result;
  }
}

Dynamic.init(
  {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
      allowNull: false,
      defaultValue: Sequelize.UUIDV4,
    },
    theme: {
      type: Sequelize.STRING,
    },
    content: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    author: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    likeNum: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    commNum: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    picUrl: {
      type: Sequelize.STRING,
    },
  },
  {
    sequelize,
    tableName: "dynamic",
  }
);

sequelize.models.Dynamic.belongsTo(User, {
  as: "userInfo",
  foreignKey: "author",
});

module.exports = {
  Dynamic,
};
