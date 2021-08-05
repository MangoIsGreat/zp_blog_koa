/**
 * author: zp
 * description: 作者模块
 * date: 2021/8/4
 */
const Router = require("koa-router");
const { User } = require("../../models/user");
const { Blog } = require("../../models/blog");
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
  const { pageIndex, pageSize, uid } = ctx.request.query;

  const listData = await Blog.getUserArtList({ pageIndex, pageSize, uid });

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

  const listData = await Dynamic.getUserDynList({ pageIndex, pageSize, uid });

  ctx.body = {
    code: 200,
    error_code: 0,
    msg: "ok",
    data: listData,
  };
});

module.exports = router;
