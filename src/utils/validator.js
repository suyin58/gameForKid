/**
 * 表单验证工具
 */
export const validators = {
  /**
   * 验证非空
   */
  required(value) {
    return {
      valid: !!value && value.trim() !== '',
      message: '此项不能为空'
    }
  },

  /**
   * 验证长度
   */
  length(value, min, max) {
    const len = value ? value.length : 0
    if (min !== undefined && len < min) {
      return {
        valid: false,
        message: `至少需要${min}个字符`
      }
    }
    if (max !== undefined && len > max) {
      return {
        valid: false,
        message: `不能超过${max}个字符`
      }
    }
    return { valid: true }
  },

  /**
   * 验证游戏描述
   */
  gameDescription(value) {
    if (!value || value.trim() === '') {
      return {
        valid: false,
        message: '请描述你想做的游戏'
      }
    }
    const result = this.length(value, 5, 500)
    if (!result.valid) {
      return result
    }
    return { valid: true }
  },

  /**
   * 验证游戏名称
   */
  gameTitle(value) {
    if (!value || value.trim() === '') {
      return {
        valid: false,
        message: '请输入游戏名称'
      }
    }
    const result = this.length(value, 2, 30)
    if (!result.valid) {
      return result
    }
    return { valid: true }
  }
}

/**
 * 表单验证类
 */
export class FormValidator {
  constructor(rules) {
    this.rules = rules
    this.errors = {}
  }

  /**
   * 验证单个字段
   */
  validateField(field, value) {
    const fieldRules = this.rules[field]
    if (!fieldRules) {
      return { valid: true }
    }

    for (const rule of fieldRules) {
      const result = rule.validator
        ? rule.validator(value)
        : validators[rule.type](value, rule.min, rule.max)

      if (!result.valid) {
        this.errors[field] = result.message
        return result
      }
    }

    delete this.errors[field]
    return { valid: true }
  }

  /**
   * 验证所有字段
   */
  validate(data) {
    let valid = true
    this.errors = {}

    for (const field in this.rules) {
      const result = this.validateField(field, data[field])
      if (!result.valid) {
        valid = false
      }
    }

    return {
      valid,
      errors: this.errors
    }
  }

  /**
   * 获取错误信息
   */
  getError(field) {
    return this.errors[field]
  }

  /**
   * 清除错误
   */
  clearErrors() {
    this.errors = {}
  }
}
