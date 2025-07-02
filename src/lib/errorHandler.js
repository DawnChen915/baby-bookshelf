/**
 * 错误处理工具类
 */

import { Toast } from 'vant';

export class AppError extends Error {
  constructor(message, code = 'UNKNOWN_ERROR', details = null) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

// 错误代码常量
export const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  STORAGE_ERROR: 'STORAGE_ERROR',
  PERMISSION_ERROR: 'PERMISSION_ERROR',
  MEDIA_ERROR: 'MEDIA_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
};

// 错误消息映射
const ERROR_MESSAGES = {
  [ERROR_CODES.NETWORK_ERROR]: '网络连接失败，请检查网络设置',
  [ERROR_CODES.VALIDATION_ERROR]: '输入数据不符合要求',
  [ERROR_CODES.STORAGE_ERROR]: '数据存储失败，请重试',
  [ERROR_CODES.PERMISSION_ERROR]: '权限不足，请检查设备权限设置',
  [ERROR_CODES.MEDIA_ERROR]: '媒体处理失败',
  [ERROR_CODES.UNKNOWN_ERROR]: '发生未知错误，请重试'
};

/**
 * 全局错误处理器
 * @param {Error} error - 错误对象
 * @param {boolean} showToast - 是否显示 Toast 提示
 * @param {string} fallbackMessage - 备用错误消息
 */
export function handleError(error, showToast = true, fallbackMessage = '操作失败，请重试') {
  console.error('应用错误:', {
    message: error.message,
    code: error.code || 'UNKNOWN',
    stack: error.stack,
    details: error.details,
    timestamp: new Date().toISOString()
  });

  if (showToast) {
    let message = fallbackMessage;

    if (error instanceof AppError) {
      message = error.message || ERROR_MESSAGES[error.code] || fallbackMessage;
    } else if (error.message) {
      message = error.message;
    }

    Toast.fail(message);
  }

  // 这里可以添加错误上报逻辑
  // reportError(error);
}

/**
 * 创建特定类型的错误
 */
export function createError(code, message, details = null) {
  return new AppError(
    message || ERROR_MESSAGES[code] || ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR],
    code,
    details
  );
}

/**
 * 包装异步函数，自动处理错误
 * @param {Function} asyncFn - 异步函数
 * @param {string} fallbackMessage - 备用错误消息
 */
export function withErrorHandling(asyncFn, fallbackMessage = '操作失败') {
  return async (...args) => {
    try {
      return await asyncFn(...args);
    } catch (error) {
      handleError(error, true, fallbackMessage);
      throw error; // 重新抛出错误，让调用者决定如何处理
    }
  };
}

/**
 * 验证工具函数
 */
export const validators = {
  required: (value, fieldName) => {
    if (!value || (typeof value === 'string' && value.trim().length === 0)) {
      throw createError(ERROR_CODES.VALIDATION_ERROR, `${fieldName}不能为空`);
    }
  },

  maxLength: (value, maxLength, fieldName) => {
    if (value && value.length > maxLength) {
      throw createError(ERROR_CODES.VALIDATION_ERROR, `${fieldName}长度不能超过${maxLength}个字符`);
    }
  },

  fileSize: (file, maxSize, fieldName = '文件') => {
    if (file && file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024));
      throw createError(ERROR_CODES.VALIDATION_ERROR, `${fieldName}大小不能超过${maxSizeMB}MB`);
    }
  }
};
