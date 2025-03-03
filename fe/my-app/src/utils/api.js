import db from '../db.json';

const api = {
  get: (endpoint) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: db });
      }, 300);
    });
  }
};

export default api;
