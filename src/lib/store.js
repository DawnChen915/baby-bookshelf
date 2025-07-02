import { createError, ERROR_CODES } from './errorHandler.js';

const DB_NAME = 'baby-bookshelf';
const DB_VERSION = 1;
const STORE_NAME = 'books';

let db;
let dbPromise = null;

// 优化的数据库连接函数，支持重试机制
function openDB() {
  if (dbPromise) {
    return dbPromise;
  }

  dbPromise = new Promise((resolve, reject) => {
    if (db) {
      return resolve(db);
    }

    if (!window.indexedDB) {
      reject(createError(ERROR_CODES.STORAGE_ERROR, '浏览器不支持 IndexedDB'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error("Database error: ", event.target.error);
      dbPromise = null; // 重置 promise，允许重试
      reject(new Error(`数据库连接失败: ${event.target.error?.message || '未知错误'}`));
    };

    request.onupgradeneeded = (event) => {
      const database = event.target.result;
      try {
        if (!database.objectStoreNames.contains(STORE_NAME)) {
          const store = database.createObjectStore(STORE_NAME, {
            keyPath: 'id',
            autoIncrement: true
          });
          // 添加索引以支持更好的查询
          store.createIndex('title', 'title', { unique: false });
          store.createIndex('createdAt', 'createdAt', { unique: false });
        }
      } catch (error) {
        console.error('数据库升级失败:', error);
        reject(error);
      }
    };

    request.onsuccess = (event) => {
      db = event.target.result;

      // 添加数据库错误处理
      db.onerror = (event) => {
        console.error('数据库运行时错误:', event);
      };

      resolve(db);
    };
  });

  return dbPromise;
}

// 数据验证函数
function validateBook(book) {
  if (!book || typeof book !== 'object') {
    throw new Error('书籍数据无效');
  }
  if (!book.title || typeof book.title !== 'string' || book.title.trim().length === 0) {
    throw new Error('书籍标题不能为空');
  }
  if (!Array.isArray(book.pages) || book.pages.length === 0) {
    throw new Error('书籍必须至少包含一页内容');
  }

  // 验证每一页的数据结构
  book.pages.forEach((page, index) => {
    if (!page || typeof page !== 'object') {
      throw new Error(`第 ${index + 1} 页数据格式无效`);
    }
    // 检查页面是否至少有图片或音频内容
    if (!page.image && !page.audio) {
      console.warn(`第 ${index + 1} 页没有任何内容（图片或音频）`);
    }
  });

  // 检查是否至少有一页包含内容
  const hasContent = book.pages.some(page => page.image || page.audio);
  if (!hasContent) {
    throw new Error('书籍必须至少包含一页有效内容（图片或音频）');
  }
}

// 保存书籍（优化版本）
export async function saveBook(book) {
  try {
    // 数据验证
    validateBook(book);

    // 处理数据，确保 Blob 数据可以正确存储
    const processedBook = {
      ...book,
      title: book.title.trim(),
      pages: book.pages.map(page => ({
        image: page.image, // Blob 数据可以直接存储到 IndexedDB
        audio: page.audio  // Blob 数据可以直接存储到 IndexedDB
      })),
      createdAt: book.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    console.log('准备保存书籍:', {
      title: processedBook.title,
      pageCount: processedBook.pages.length,
      hasImages: processedBook.pages.filter(p => p.image).length,
      hasAudio: processedBook.pages.filter(p => p.audio).length
    });

    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(processedBook);

      request.onsuccess = () => {
        const savedId = request.result;
        console.log('书籍保存成功，ID:', savedId);
        resolve(savedId);
      };

      request.onerror = (event) => {
        const error = new Error(`保存书籍失败: ${event.target.error?.message || '未知错误'}`);
        console.error(error);
        reject(error);
      };

      transaction.onerror = (event) => {
        const error = new Error(`事务失败: ${event.target.error?.message || '未知错误'}`);
        console.error(error);
        reject(error);
      };

      transaction.oncomplete = () => {
        console.log('保存事务完成');
      };
    });
  } catch (error) {
    console.error('saveBook 错误:', error);
    throw error;
  }
}

// 获取所有书籍（优化版本）
export async function getBooks() {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const books = request.result || [];
        console.log('获取到书籍数量:', books.length);
        resolve(books);
      };

      request.onerror = (event) => {
        const error = new Error(`获取书籍失败: ${event.target.error?.message || '未知错误'}`);
        console.error(error);
        reject(error);
      };

      transaction.onerror = (event) => {
        const error = new Error(`事务失败: ${event.target.error?.message || '未知错误'}`);
        console.error(error);
        reject(error);
      };
    });
  } catch (error) {
    console.error('getBooks 错误:', error);
    throw error;
  }
}

// 根据 ID 获取特定书籍
export async function getBookById(id) {
  try {
    if (!id) {
      throw new Error('书籍 ID 不能为空');
    }

    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = (event) => {
        const error = new Error(`获取书籍失败: ${event.target.error?.message || '未知错误'}`);
        console.error(error);
        reject(error);
      };
    });
  } catch (error) {
    console.error('getBookById 错误:', error);
    throw error;
  }
}

// 删除书籍
export async function deleteBook(id) {
  try {
    if (!id) {
      throw new Error('书籍 ID 不能为空');
    }

    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => {
        console.log('书籍删除成功，ID:', id);
        resolve(true);
      };

      request.onerror = (event) => {
        const error = new Error(`删除书籍失败: ${event.target.error?.message || '未知错误'}`);
        console.error(error);
        reject(error);
      };
    });
  } catch (error) {
    console.error('deleteBook 错误:', error);
    throw error;
  }
}

// 清空所有书籍
export async function clearAllBooks() {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => {
        console.log('所有书籍已清空');
        resolve(true);
      };

      request.onerror = (event) => {
        const error = new Error(`清空书籍失败: ${event.target.error?.message || '未知错误'}`);
        console.error(error);
        reject(error);
      };
    });
  } catch (error) {
    console.error('clearAllBooks 错误:', error);
    throw error;
  }
}

// 测试函数 - 验证保存和读取功能
export async function testBookStorage() {
  try {
    console.log('开始测试书籍存储功能...');

    // 创建测试数据
    const testBook = {
      title: '测试书籍',
      pages: [
        { image: null, audio: null },
        { image: 'data:image/png;base64,test', audio: null }
      ]
    };

    // 保存测试书籍
    const savedId = await saveBook(testBook);
    console.log('测试书籍保存成功，ID:', savedId);

    // 读取所有书籍
    const books = await getBooks();
    console.log('读取书籍成功，数量:', books.length);

    // 查找测试书籍
    const foundBook = books.find(book => book.id === savedId);
    if (foundBook) {
      console.log('测试书籍验证成功:', foundBook.title);
    } else {
      console.error('测试书籍未找到');
    }

    return true;
  } catch (error) {
    console.error('书籍存储测试失败:', error);
    return false;
  }
}
