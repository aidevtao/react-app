import axios from "axios";
import qs from "qs";

const API_ROOT =
  process.env.REACT_APP_BACKEND_URL ?? "http://localhost:3000/api";

let token = null;

// 创建 axios 实例
const instance = axios.create({
  baseURL: API_ROOT,
  timeout: 10000, // 设置超时时间为 10 秒
  headers: {
    "Content-Type": "application/json",
  },
  paramsSerializer: (params) =>
    qs.stringify(params, { arrayFormat: "brackets" }), // 参数序列化
});

// 请求拦截器：动态添加 Authorization 头
instance.interceptors.request.use((config) => {
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

// 响应拦截器：统一处理响应和错误
instance.interceptors.response.use(
  (response) => response.data, // 解包响应数据
  (error) => {
    if (error.response) {
      // 后端返回的错误
      return Promise.reject(error.response.data);
    } else if (error.request) {
      // 网络错误
      return Promise.reject({
        errors: { "Network Error": ["Please check your network connection"] },
      });
    } else {
      // 其他未知错误
      return Promise.reject({ errors: { "Unknown Error": [error.message] } });
    }
  }
);

// 请求方法封装
const requests = {
  del: (url) => instance.delete(url),
  get: (url, query = {}) => {
    if (Number.isSafeInteger(query?.page)) {
      query.limit = query.limit ? query.limit : 10;
      query.offset = query.page * query.limit;
    }
    delete query.page;
    return instance.get(url, { params: query });
  },
  put: (url, body) => instance.put(url, body),
  post: (url, body) => instance.post(url, body),
};

// 模块化 API 封装
const Auth = {
  current: () => requests.get("/user"),
  login: (email, password) =>
    requests.post("/users/login", { user: { email, password } }),
  register: (username, email, password) =>
    requests.post("/users", { user: { username, email, password } }),
  save: (user) => requests.put("/user", { user }),
};

const Tags = {
  getAll: () => requests.get("/tags"),
};

const Articles = {
  all: (query) => requests.get("/articles", query),
  byAuthor: (author, page) =>
    requests.get("/articles", { author, limit: 5, page }),
  byTag: (tag, page) => requests.get("/articles", { tag, page }),
  del: (slug) => requests.del(`/articles/${slug}`),
  favorite: (slug) => requests.post(`/articles/${slug}/favorite`),
  unfavorite: (slug) => requests.del(`/articles/${slug}/favorite`),
  update: ({ slug, ...article }) =>
    requests.put(`/articles/${slug}`, { article }),
  create: (article) => requests.post("/articles", { article }),
  get: (slug) => requests.get(`/articles/${slug}`),
  favoritedBy: (username, page) =>
    requests.get("/articles", { favorited: username, limit: 5, page }),
  feed: (page) => requests.get("/articles/feed", { page }),
};

const Comments = {
  create: (slug, comment) =>
    requests.post(`/articles/${slug}/comments`, { comment }),
  delete: (slug, commentId) =>
    requests.del(`/articles/${slug}/comments/${commentId}`),
  forArticle: (slug) => requests.get(`/articles/${slug}/comments`),
};

const Profile = {
  follow: (username) => requests.post(`/profiles/${username}/follow`),
  get: (username) => requests.get(`/profiles/${username}`),
  unfollow: (username) => requests.del(`/profiles/${username}/follow`),
};

// 设置 Token 方法
const setToken = (_token) => {
  token = _token;
  if (token) {
    localStorage.setItem("jwt", token); // 将 token 存储到 localStorage
  } else {
    localStorage.removeItem("jwt"); // 清除 token
  }
  instance.defaults.headers.Authorization = token ? `Token ${token}` : "";
};

export default {
  Articles,
  Auth,
  Comments,
  Profile,
  Tags,
  setToken,
};
