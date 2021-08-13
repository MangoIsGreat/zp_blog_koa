/**
 * author: zp
 * description: 作者模块
 * date: 2021/8/4
 */
const Router = require("koa-router");
const { User } = require("../../models/user");
const { Blog } = require("../../models/blog");
const { News } = require("../../models/news");
const { Collection } = require("../../models/collection");
const { BLike } = require("../../models/blike");
const { DLike } = require("../../models/dlike");
const { NewsLike } = require("../../models/newsLike");
const { Dynamic } = require("../../models/dynamic");
const { Fans } = require("../../models/fans");
const { Auth } = require("../../../middlewares/auth");
const { AuthorUIDValidator } = require("../../validators/validator");
const router = new Router({
  prefix: "/v1/author",
});

// 获取作者排行
router.get("/ranking", new Auth().getUID, async (ctx, next) => {
  const { pageIndex, pageSize } = ctx.request.query;

  let result = await User.getAuthorRanking({ pageIndex, pageSize });

  // 对数据进行深拷贝
  result = JSON.parse(JSON.stringify(result));

  if (ctx.auth && ctx.auth.uid) {
    for (let i = 0; i < result.rows.length; i++) {
      // 标记是否是用户本人
      if (ctx.auth.uid === result.rows[i].id) {
        result.rows[i].isSelf = true;
      } else {
        result.rows[i].isSelf = false;
      }

      // 标记是否关注
      const attention = await Fans.findOne({
        where: {
          byFollowers: result.rows[i].id,
          followers: ctx.auth.uid,
        },
      });

      if (attention && attention.isFollower) {
        result.rows[i].isAttention = true;
      } else {
        result.rows[i].isAttention = false;
      }
    }
  }

  ctx.body = {
    code: 200,
    error_code: 0,
    msg: "ok",
    data: result,
  };
});

// 获得用户的相关信息
router.get("/userinfo", new Auth().getUID, async (ctx, next) => {
  const v = await new AuthorUIDValidator().validate(ctx);

  let result = await User.getUserInfo({ id: v.get("query.uid") });
  result = JSON.parse(JSON.stringify(result));

  // 获取用户收藏夹相关信息
  const collections = await Collection.getCollections({
    pageIndex: 1,
    pageSize: 15,
    uid: v.get("query.uid"),
  });

  result.collections_num = collections.count;

  // 标记当前用户是否是本人
  let isSelf = false;
  if (ctx.auth && ctx.auth.uid) {
    if (result.id === ctx.auth.uid) isSelf = true;

    result.isSelf = isSelf;

    // 若当前用户不是自己，标记当前用户是否已经关注
    if (!isSelf) {
      let isAttention = false;
      const attention = await Fans.findOne({
        where: {
          byFollowers: v.get("query.uid"),
          followers: ctx.auth.uid,
        },
      });

      if (attention && attention.isFollower) {
        isAttention = true;
      }

      result.isAttention = isAttention;
    }
  }

  ctx.body = {
    code: 200,
    error_code: 0,
    msg: "ok",
    data: result,
  };
});

// 获取作者的文章列表
router.get("/artlist", new Auth().getUID, async (ctx, next) => {
  const { pageIndex, pageSize, uid, type } = ctx.request.query;

  let listData = await Blog.getUserArtList({
    pageIndex,
    pageSize,
    uid,
    type,
  });

  let records = null;
  if (ctx.auth && ctx.auth.uid) {
    records = await BLike.getRecord({ user: ctx.auth.uid });

    records = JSON.parse(JSON.stringify(records));
  }

  listData = JSON.parse(JSON.stringify(listData));

  for (let i = 0; i < listData.rows.length; i++) {
    listData.rows[i].isLike = false;

    // 当前用户是否已经点赞该博客
    if (ctx.auth && ctx.auth.uid) {
      for (let j = 0; j < records.rows.length; j++) {
        if (listData.rows[i].id === records.rows[j].blog) {
          listData.rows[i].isLike = true;
        }
      }
    }
  }

  ctx.body = {
    code: 200,
    error_code: 0,
    msg: "ok",
    data: {
      count: listData.count,
      list: listData.rows,
    },
  };
});

// 获取作者的动态列表
router.get("/dynlist", new Auth().getUID, async (ctx, next) => {
  const { pageIndex, pageSize, uid } = ctx.request.query;

  let listData = await Dynamic.getUserDynList({ pageIndex, pageSize, uid });

  listData = JSON.parse(JSON.stringify(listData));

  for (let i = 0; i < listData.rows.length; i++) {
    // 标记是否已建立"关注关系"
    let isAttention = false;
    // 标记是否是用户本人
    let isSelf = false;
    if (ctx.auth && ctx.auth.uid) {
      const attention = await Fans.findOne({
        where: {
          byFollowers: listData.rows[i].id,
          followers: ctx.auth.uid,
        },
      });

      if (attention && attention.isFollower) {
        isAttention = true;
      }

      if (listData.rows[i].userInfo.id === ctx.auth.uid) {
        isSelf = true;
      }
    }

    listData.rows[i].isSelf = isSelf;

    listData.rows[i].isAttention = isAttention;
  }

  // 添加是否点赞标记
  let records = null;
  if (ctx.auth && ctx.auth.uid) {
    records = await DLike.getRecord({ user: ctx.auth.uid });

    records = JSON.parse(JSON.stringify(records));
  }

  for (let i = 0; i < listData.rows.length; i++) {
    listData.rows[i].isLike = false;

    // 当前用户是否已经点赞该博客
    if (ctx.auth && ctx.auth.uid) {
      for (let j = 0; j < records.rows.length; j++) {
        if (listData.rows[i].id === records.rows[j].dynamic) {
          listData.rows[i].isLike = true;
        }
      }
    }
  }

  ctx.body = {
    code: 200,
    error_code: 0,
    msg: "ok",
    data: {
      count: listData.count,
      list: listData.rows,
    },
  };
});

// 获取作者赞过的文章
router.get("/likeBlog", new Auth().getUID, async (ctx, next) => {
  const { pageIndex, pageSize, uid } = ctx.request.query;

  const listData = await BLike.getUserLike({ pageIndex, pageSize, uid });

  let result = [];
  for (let i = 0; i < listData.rows.length; i++) {
    const tmp = await Blog.getLikeBlog(listData.rows[i].blog);

    tmp && result.push(tmp);
  }

  result = JSON.parse(JSON.stringify(result));

  let records = null;
  if (ctx.auth && ctx.auth.uid) {
    records = await BLike.getRecord({ user: ctx.auth.uid });

    records = JSON.parse(JSON.stringify(records));
  }

  for (let i = 0; i < result.length; i++) {
    result[i].isLike = false;

    // 当前用户是否已经点赞该博客
    if (ctx.auth && ctx.auth.uid) {
      for (let j = 0; j < records.rows.length; j++) {
        if (result[i].id === records.rows[j].blog) {
          result[i].isLike = true;
        }
      }
    }
  }

  ctx.body = {
    code: 200,
    error_code: 0,
    msg: "ok",
    data: {
      list: result,
      count: listData.count,
    },
  };
});

// 获取作者赞过的“动态”
router.get("/likeDyn", new Auth().getUID, async (ctx, next) => {
  const { pageIndex, pageSize, uid } = ctx.request.query;

  const listData = await DLike.getUserLike({ pageIndex, pageSize, uid });

  let result = [];
  for (let i = 0; i < listData.rows.length; i++) {
    const tmp = await Dynamic.getLikeDyn(listData.rows[i].dynamic);

    tmp && result.push(tmp);
  }

  result = JSON.parse(JSON.stringify(result));

  for (let i = 0; i < result.length; i++) {
    // 标记是否已建立"关注关系"
    let isAttention = false;
    // 标记是否是用户本人
    let isSelf = false;
    if (ctx.auth && ctx.auth.uid) {
      const attention = await Fans.findOne({
        where: {
          byFollowers: result[i].id,
          followers: ctx.auth.uid,
        },
      });

      if (attention && attention.isFollower) {
        isAttention = true;
      }

      if (result[i].userInfo.id === ctx.auth.uid) {
        isSelf = true;
      }
    }

    result[i].isSelf = isSelf;

    result[i].isAttention = isAttention;
  }

  // 添加是否点赞标记
  let records = null;
  if (ctx.auth && ctx.auth.uid) {
    records = await DLike.getRecord({ user: ctx.auth.uid });

    records = JSON.parse(JSON.stringify(records));
  }

  for (let i = 0; i < result.length; i++) {
    result[i].isLike = false;

    // 当前用户是否已经点赞该博客
    if (ctx.auth && ctx.auth.uid) {
      for (let j = 0; j < records.rows.length; j++) {
        if (result[i].id === records.rows[j].dynamic) {
          result[i].isLike = true;
        }
      }
    }
  }

  ctx.body = {
    code: 200,
    error_code: 0,
    msg: "ok",
    data: {
      list: result,
      count: listData.count,
    },
  };
});

// 作者赞过的资讯
router.get("/likeNews", new Auth().getUID, async (ctx, next) => {
  const { pageIndex, pageSize, uid } = ctx.request.query;

  const listData = await NewsLike.getUserLike({ pageIndex, pageSize, uid });

  const result = [];
  for (let i = 0; i < listData.rows.length; i++) {
    const tmp = await News.getLikeNews(listData.rows[i].newsId);

    result.push(tmp);
  }

  ctx.body = {
    code: 200,
    error_code: 0,
    msg: "ok",
    data: {
      list: result,
      count: listData.count,
    },
  };
});

// 作者的收藏集
router.get("/collection", new Auth().getUID, async (ctx, next) => {
  const { pageIndex, pageSize, uid } = ctx.request.query;

  const result = await Collection.getCollections({ pageIndex, pageSize, uid });

  ctx.body = {
    code: 200,
    error_code: 0,
    msg: "ok",
    data: {
      list: result.rows,
      count: result.count,
    },
  };
});

// 作者关注的人
router.get("/byfollowers", new Auth().getUID, async (ctx, next) => {
  const { pageIndex, pageSize, uid } = ctx.request.query;

  let result = await Fans.getUserAttention({ pageIndex, pageSize, uid });

  result = JSON.parse(JSON.stringify(result));

  for (let i = 0; i < result.rows.length; i++) {
    // 标记是否已建立"关注关系"
    let isAttention = false;
    if (ctx.auth && ctx.auth.uid) {
      const attention = await Fans.findOne({
        where: {
          byFollowers: result.rows[i].beAttention.id,
          followers: ctx.auth.uid,
        },
      });

      if (attention && attention.isFollower) {
        isAttention = true;
      }
    }

    result.rows[i].isAttention = isAttention;
  }

  ctx.body = {
    code: 200,
    error_code: 0,
    msg: "ok",
    data: {
      list: result.rows,
      count: result.count,
    },
  };
});

// 作者的粉丝
router.get("/followers", new Auth().getUID, async (ctx, next) => {
  const { pageIndex, pageSize, uid } = ctx.request.query;

  let result = await Fans.getUserFans({ pageIndex, pageSize, uid });

  result = JSON.parse(JSON.stringify(result));

  for (let i = 0; i < result.rows.length; i++) {
    // 标记是否已建立"关注关系"
    let isAttention = false;
    if (ctx.auth && ctx.auth.uid) {
      const attention = await Fans.findOne({
        where: {
          byFollowers: ctx.auth.uid,
          followers: result.rows[i].attention.id,
        },
      });

      if (attention && attention.isFollower) {
        isAttention = true;
      }
    }

    result.rows[i].isAttention = isAttention;
  }

  ctx.body = {
    code: 200,
    error_code: 0,
    msg: "ok",
    data: {
      list: result.rows,
      count: result.count,
    },
  };
});

// 获取用户赞过的文章/沸点/资讯数
router.get("/likeNum", new Auth().getUID, async (ctx, next) => {
  const v = await new AuthorUIDValidator().validate(ctx);

  // 赞过的文章
  const likeBlog = await BLike.getUserLike({
    pageIndex: 1,
    pageSize: 15,
    uid: v.get("query.uid"),
  });

  // 赞过的动态
  const likeDyn = await DLike.getUserLike({
    pageIndex: 1,
    pageSize: 15,
    uid: v.get("query.uid"),
  });

  // 赞过的资讯
  const likeNews = await NewsLike.getUserLike({
    pageIndex: 1,
    pageSize: 15,
    uid: v.get("query.uid"),
  });

  ctx.body = {
    code: 200,
    error_code: 0,
    msg: "ok",
    data: {
      like_blog_num: likeBlog.count,
      like_dyn_num: likeDyn.count,
      like_news_num: likeNews.count,
      like_count: likeBlog.count + likeDyn.count + likeNews.count,
    },
  };
});

// 作者的各种活跃动态汇总
router.get("/dynamic", new Auth().getUID, async (ctx, next) => {
  const v = await new AuthorUIDValidator().validate(ctx);
  const { pageIndex, pageSize } = ctx.request.query;

  // 最终数据集
  let infoData = [];

  // 发表的"文章"
  let userArt = await Blog.getUserArticle(v.get("query.uid"));
  userArt = JSON.parse(JSON.stringify(userArt));

  userArt.forEach((item) => {
    item.type = 100;
  });

  // 发表的"动态"
  let userDyn = await Dynamic.getUserDynamic(v.get("query.uid"));
  userDyn = JSON.parse(JSON.stringify(userDyn));

  userDyn.forEach((item) => {
    item.type = 200;
  });
  // 发表的"资讯"
  let userNews = await News.getUserNews(v.get("query.uid"));
  userNews = JSON.parse(JSON.stringify(userNews));

  userNews.forEach((item) => {
    item.type = 300;
  });
  // 赞过的文章
  let userLikeArt = await BLike.getUserLikeArt(v.get("query.uid"));
  userLikeArt = JSON.parse(JSON.stringify(userLikeArt));

  userLikeArt.forEach((item) => {
    item.type = 400;
  });
  // 赞过的动态
  let userLikeDyn = await DLike.getUserLikeDyn(v.get("query.uid"));
  userLikeDyn = JSON.parse(JSON.stringify(userLikeDyn));

  userLikeDyn.forEach((item) => {
    item.type = 500;
  });
  // 赞过的资讯
  let userLikeNews = await NewsLike.getUserLikeNews(v.get("query.uid"));
  userLikeNews = JSON.parse(JSON.stringify(userLikeNews));

  userLikeNews.forEach((item) => {
    item.type = 600;
  });
  // 关注的用户
  let userIdols = await Fans.getUserIdols(v.get("query.uid"));
  userIdols = JSON.parse(JSON.stringify(userIdols));

  userIdols.forEach((item) => {
    item.type = 700;
  });

  // 将所有数据全部合并
  infoData = [
    ...userArt,
    ...userDyn,
    ...userNews,
    ...userLikeArt,
    ...userLikeDyn,
    ...userLikeNews,
    ...userIdols,
  ];

  // 按时间先后排序
  infoData.sort(function (a, b) {
    // return b.created_at - a.created_at;
    return b.created_at < a.created_at ? -1 : 1;
  });

  const finalData = infoData.slice(
    (Number(pageIndex) - 1) * Number(pageSize),
    Number(pageIndex) * Number(pageSize)
  );

  ctx.body = {
    code: 200,
    error_code: 0,
    msg: "ok",
    data: {
      count: infoData.length,
      list: finalData,
    },
  };
});

// 更新用户信息
router.post("/updateUserInfo", new Auth().m, async (ctx, next) => {
  const { nickname, profession, signature, avatar, uid } = ctx.request.body;

  const result = await User.updateUserInfo({
    nickname,
    profession,
    signature,
    avatar,
    uid,
  });

  ctx.body = {
    code: 200,
    error_code: 0,
    msg: "ok",
    data: result,
  };
});

module.exports = router;
