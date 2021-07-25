const { LinValidator, Rule } = require("../../core/lin-validator-v2");
const { User } = require("../models/user");
const { LoginType } = require("../lib/enum");

class PositiveIntegerValidator extends LinValidator {
  constructor() {
    super();
    this.id = [new Rule("isInt", "需要是正整数", { min: 1 })];
  }
}

class RegisterValidator extends LinValidator {
  constructor() {
    super();
    this.email = [new Rule("isEmail", "不符合Email规范")];
    this.password = [
      new Rule("isLength", "密码至少6个字符，最多32个字符", {
        min: 6,
        max: 32,
      }),
      new Rule(
        "matches",
        "密码长度必须在6~22位之间，包含字符、数字或则 _",
        "^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]"
      ),
    ];
    this.nickname = [
      new Rule("isLength", "昵称不符合长度规范", {
        min: 4,
        max: 32,
      }),
    ];
  }

  validatePassword(vals) {
    const psw1 = vals.body.password1;
    const psw2 = vals.body.password2;
    if (psw1 !== psw2) {
      throw new Error("两个密码必须相同");
    }
  }

  async validateEmail(vals) {
    const email = vals.body.email;
    const user = await User.findOne({
      where: {
        email: email,
      },
    });

    if (user) {
      throw new Error("email已存在");
    }
  }
}

class TokenValidator extends LinValidator {
  constructor() {
    super();
    this.account = [
      new Rule("isLength", "不符合账号规则", {
        min: 4,
        max: 32,
      }),
    ];
    this.secret = [
      new Rule("isOptional"),
      new Rule("isLength", "至少6个字符", {
        min: 6,
        max: 128,
      }),
    ];
  }

  validateLoginType(vals) {
    if (!vals.body.type) {
      throw new Error("type是必填参数");
    }
    if (!LoginType.isThisType(vals.body.type)) {
      throw new Error("type参数不合法");
    }
  }
}

class BlogValidator extends LinValidator {
  constructor() {
    super();
    this.title = [
      new Rule("isLength", "标题长度不符合规范", {
        min: 1,
        max: 30,
      }),
    ];
    this.content = [
      new Rule("isLength", "不允许为空", {
        min: 1,
      }),
    ];
    this.tag = [
      new Rule("isLength", "不允许为空", {
        min: 1,
      }),
      new Rule("isInt", "需要是正整数", { min: 1 }),
    ];
  }
}

class DynamicValidator extends LinValidator {
  constructor() {
    super();
    this.content = [
      new Rule("isLength", "内容长度不符合规则！", {
        min: 1,
        max: 500,
      }),
    ];
  }
}

class DLikeValidator extends LinValidator {
  constructor() {
    super();
    this.dynamic = [
      new Rule("isLength", "动态ID号不能为空", {
        min: 1,
      }),
    ];
  }
}

class BLikeValidator extends LinValidator {
  constructor() {
    super();
    this.blog = [
      new Rule("isLength", "博客ID号不能为空", {
        min: 1,
      }),
    ];
  }
}

class RecommendValidator extends LinValidator {
  constructor() {
    super();
    this.profession = [new Rule("isInt", "需要是正整数", { min: 1 })];
  }
}

class AuthorRankingValidator extends LinValidator {
  constructor() {
    super();
    this.profession = [new Rule("isOptional")];
  }
}

// 文件上传
class UploadValidator extends LinValidator {
  constructor() {
    super();
    this.type = [
      new Rule("isLength", "上传类型不能为空", {
        min: 1,
      }),
    ];
  }
}

module.exports = {
  PositiveIntegerValidator,
  RegisterValidator,
  TokenValidator,
  BlogValidator,
  DynamicValidator,
  DLikeValidator,
  BLikeValidator,
  RecommendValidator,
  AuthorRankingValidator,
  UploadValidator,
};
