/**
 * author: zp
 * description: 用户浏览记录
 * date: 2021/8/20
 */
const Router = require("koa-router");
const { ReadHistory } = require("../../models/readHistory");
const { Auth } = require("../../../middlewares/auth");
const router = new Router({
  prefix: "/v1/readhistory",
});

// 获取用户浏览过的博客
router.get("/list", new Auth().m, async (ctx, next) => {
  const { pageIndex, pageSize } = ctx.request.query;

  const result = await ReadHistory.getReadHistory({
    uid: ctx.auth.uid,
    pageIndex,
    pageSize,
  });

  ctx.body = {
    code: 200,
    error_code: 0,
    msg: "ok",
    data: result,
  };
});

module.exports = router;
