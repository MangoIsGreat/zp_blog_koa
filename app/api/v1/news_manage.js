const Router = require("koa-router");
const { News } = require("../../models/news");
const { Auth } = require("../../../middlewares/auth");
const router = new Router({
  prefix: "/v1/admin/news",
});

// 获取资讯列表
router.get("/list", new Auth().m, async (ctx, next) => {
  const newsList = await News.getNewsList(ctx.request.query);

  ctx.body = {
    code: 200,
    error_code: 0,
    msg: "ok",
    data: newsList,
  };
});

// 获取某一篇资讯
router.get("/info", new Auth().m, async (ctx, next) => {
  const result = await News.getOneNews(ctx.request.query.newsId);

  ctx.body = {
    code: 200,
    error_code: 0,
    msg: "ok",
    data: result,
  };
});

// 删除某一篇资讯
router.post("/delete", new Auth().m, async (ctx, next) => {
  const result = await News.deleteNews(ctx.request.body.newsId);

  ctx.body = {
    code: 200,
    error_code: 0,
    msg: "ok",
    data: result,
  };
});

// 修改某一篇资讯
router.post("/update", new Auth().m, async (ctx, next) => {
  const result = await News.updateNews(ctx.request.body);

  ctx.body = {
    code: 200,
    error_code: 0,
    msg: "ok",
    data: result,
  };
});

module.exports = router;
