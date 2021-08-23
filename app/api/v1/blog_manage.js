const Router = require("koa-router");
const { Blog } = require("../../models/blog");
const { Auth } = require("../../../middlewares/auth");
const { RecommendValidator } = require("../../validators/validator");
const router = new Router({
  prefix: "/v1/admin/blog",
});

// 获取博客列表
router.get("/list", new Auth().m, async (ctx, next) => {
  const blogList = await Blog.getAllBlogList(ctx.request.query);

  ctx.body = {
    code: 200,
    error_code: 0,
    msg: "ok",
    data: blogList,
  };
});

// 删除博客
router.post("/delete", new Auth().m, async (ctx, next) => {
  const v = await new RecommendValidator().validate(ctx);

  const result = await Blog.deleteAdminBlog(v.get("body.id"));

  ctx.body = {
    code: 200,
    error_code: 0,
    msg: "ok",
    data: result,
  };
});

// 隐藏博客
router.post("/hidden", new Auth().m, async (ctx, next) => {
  const v = await new RecommendValidator().validate(ctx);

  const result = await Blog.hiddenAdminBlog(v.get("body.id"));

  ctx.body = {
    code: 200,
    error_code: 0,
    msg: "ok",
    data: result,
  };
});

// 获取某一篇博客
router.get("/findBlog", new Auth().m, async (ctx, next) => {
  const v = await new RecommendValidator().validate(ctx);

  const result = await Blog.getAdminBlog(v.get("query.id"));

  ctx.body = {
    code: 200,
    error_code: 0,
    msg: "ok",
    data: result,
  };
});

// 更新某一篇博客
router.post("/update", new Auth().m, async (ctx, next) => {
  const result = await Blog.updateAdminBlog(ctx.request.body);

  ctx.body = {
    code: 200,
    error_code: 0,
    msg: "ok",
    data: result,
  };
});

module.exports = router;
