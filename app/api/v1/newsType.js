/**
 * author: zp
 * description: "资讯"分类标签
 * date: 2021/8/4
 */
const Router = require("koa-router");
const { NewsType } = require("../../models/newsType");
const { Auth } = require("../../../middlewares/auth");
const router = new Router({
  prefix: "/v1/newstype",
});

// 创建资讯分类标签
router.post("/create", new Auth().m, async (ctx, next) => {
  const data = await NewsType.createNewsType({
    tagName: ctx.request.query.name,
    tagType: ctx.request.query.type,
  });

  ctx.body = {
    code: 200,
    error_code: 0,
    msg: "ok",
    data: data,
  };
});

// 获取资讯分类标签列表
router.get("/list", async (ctx, next) => {
  const data = await NewsType.getNewsTypeList();

  ctx.body = {
    code: 200,
    error_code: 0,
    msg: "ok",
    data: data,
  };
});

module.exports = router;
