/*
  这里存放后端的业务码
  后端响应统一为这种格式，业务码为 0 表示成功，非 0 表示失败
  {
    "code": 0, // 业务码
    "message": "操作成功", // 提示信息
    "data": null // 数据
  }
*/
export const SUCCESS = 0 // 操作成功
export const TOKEN_EXPIRED = 1 // token 过期或无效
export const LOGIN_FAILED = 2 // 登录失败
