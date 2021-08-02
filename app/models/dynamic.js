const { sequelize } = require("../../core/db");
const { Sequelize, Model } = require("sequelize");
const { Fans } = require("./fans");
const { User } = require("./user");
const { DLike } = require("./dlike");

class Dynamic extends Model {
  async createDynamic(content) {
    const dynamic = await Dynamic.create(content);

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
      where: {
        theme: query.theme,
      },
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

  // 获取关注人动态列表
  static async getAttentionDynamic(content) {
    const idols = await Fans.findAll({
      where: {
        followers: content.uid,
        isFollower: true,
      },
    });

    // 获取的动态
    const dynamics = [];
    for (let i = 0; i < idols.length; i++) {
      const dyns = await Dynamic.findAll({
        order: [["created_at", "DESC"]],
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
        limit: Number(content.pageSize),
        offset: (Number(content.pageIndex) - 1) * Number(content.pageSize),
      });

      dynamics.push([...dyns]);
    }

    dynamics.sort(function (a, b) {
      return b.created_at - a.created_at;
    });

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

  // 获取某一条动态
  static async getDynamic(dynamicId, uid) {
    // 多表查询(一对多)
    Dynamic.belongsTo(User, {
      foreignKey: "author",
    });

    // Dynamic.belongsTo(Tag, {
    //   foreignKey: "tag",
    //   targetKey: "tagType",
    // });

    const dynamic = await Dynamic.findOne({
      where: {
        id: dynamicId,
      },
    });

    // 获取动态的作者
    const author = dynamic.author;

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
        // {
        //   model: Tag,
        //   attributes: ["tagName", "id"],
        // },
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
    dynamics.isLike = false;

    if (dynamicStatus && dynamicStatus.isLike) {
      dynamics.isLike = true;
    }

    // 是否已关注
    dynamics.User.isAttention = isAttention;
    // 是否作者是当前用户本人
    dynamics.User.isSelf = isSelf;

    return dynamics;
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
