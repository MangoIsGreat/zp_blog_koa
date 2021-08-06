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

// 获取作者的文章列表
router.get("/artlist", new Auth().getUID, async (ctx, next) => {
  const { pageIndex, pageSize, uid, type } = ctx.request.query;

  const listData = await Blog.getUserArtList({
    pageIndex,
    pageSize,
    uid,
    type,
  });

  ctx.body = {
    code: 200,
    error_code: 0,
    msg: "ok",
    data: listData,
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
    data: listData,
  };
});

// 获取作者赞过的文章
router.get("/likeBlog", new Auth().getUID, async (ctx, next) => {
  const { pageIndex, pageSize, uid } = ctx.request.query;

  const listData = await BLike.getUserLike({ pageIndex, pageSize, uid });

  const result = [];
  for (let i = 0; i < listData.rows.length; i++) {
    const tmp = await Blog.getLikeBlog(listData.rows[i].blog);

    result.push(tmp);
  }

  ctx.body = {
    code: 200,
    error_code: 0,
    msg: "ok",
    data: result,
    count: listData.count,
  };
});

// 获取作者赞过的“动态”
router.get("/likeDyn", new Auth().getUID, async (ctx, next) => {
  const { pageIndex, pageSize, uid } = ctx.request.query;

  const listData = await DLike.getUserLike({ pageIndex, pageSize, uid });

  const result = [];
  for (let i = 0; i < listData.rows.length; i++) {
    const tmp = await Dynamic.getLikeDyn(listData.rows[i].dynamic);

    result.push(tmp);
  }

  ctx.body = {
    code: 200,
    error_code: 0,
    msg: "ok",
    data: result,
    count: listData.count,
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
    data: result,
    count: listData.count,
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
    data: result,
  };
});

// 作者关注的人
router.get("/byfollowers", new Auth().getUID, async (ctx, next) => {
  const { pageIndex, pageSize, uid } = ctx.request.query;

  const result = await Fans.getUserAttention({ pageIndex, pageSize, uid });

  ctx.body = {
    code: 200,
    error_code: 0,
    msg: "ok",
    data: result,
  };
});

// 作者的粉丝
router.get("/followers", new Auth().getUID, async (ctx, next) => {
  const { pageIndex, pageSize, uid } = ctx.request.query;

  const result = await Fans.getUserFans({ pageIndex, pageSize, uid });

  ctx.body = {
    code: 200,
    error_code: 0,
    msg: "ok",
    data: result,
  };
});

module.exports = router;
