const Router = require("koa-router");
const { Blog } = require("../../models/blog");
const { success } = require("../../lib/helper");
const { Auth } = require("../../../middlewares/auth");
const {
  BlogValidator,
  RecommendValidator,
} = require("../../validators/validator");
const router = new Router({
  prefix: "/v1/blog",
});

router.post("/create", new Auth().m, async (ctx, next) => {
  const v = await new BlogValidator().validate(ctx);
  const content = {
    title: v.get("body.title"),
    content: v.get("body.content"),
    description: v.get("body.description"),
    tag: v.get("body.tag"),
    author: ctx.auth.uid,
  };

  await new Blog().createBlog(content);

  success();
});

router.get("/list", async (ctx, next) => {
  const blogList = await Blog.getHomePageBlogList();

  ctx.body = {
    code: 200,
    error_code: 0,
    msg: "ok",
    data: blogList,
  };
});

// 相关推荐
router.get("/recommend", async (ctx, next) => {
  const v = await new RecommendValidator().validate(ctx);
  const content = {
    profession: v.get("query.profession"),
  };

  const recomBlogList = await new Blog().getRecomList(content);

  ctx.body = {
    code: 200,
    error_code: 0,
    msg: "ok",
    data: recomBlogList,
  };
});

// 热门文章
router.get("/hot", async (ctx, next) => {
  const v = await new RecommendValidator().validate(ctx);
  const content = {
    profession: v.get("query.profession"),
  };

  const hotBlogList = await new Blog().getHotList(content);

  ctx.body = {
    code: 200,
    error_code: 0,
    msg: "ok",
    data: hotBlogList,
  };
});

module.exports = router;
