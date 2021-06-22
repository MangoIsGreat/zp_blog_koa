const Router = require("koa-router");
const { Blog } = require("../../models/blog");
const { success } = require("../../lib/helper");
const { Auth } = require("../../../middlewares/auth");
const { BlogValidator } = require("../../validators/validator");
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
    list: blogList,
  };
});

module.exports = router;
