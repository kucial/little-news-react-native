const apiKey = 'd1b4447155144d21af69c107fc155d05';

const stringify = (params) => {
  return Object.entries(params)
    .map(([key, value]) => {
      if (value !== undefined) {
        return key + '=' + encodeURIComponent(value);
      }
    })
    .filter((item) => !!item)
    .join('&');
};

export function getNews(params = {}) {
  const url = 'https://newsapi.org/v2/everything?' + stringify(params);
  console.log(url);
  return fetch(url, {
    headers: {
      'x-api-key': apiKey,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.status === 'ok') {
        return data;
      }
      const error = new Error(data.message);
      error.code = data.code;
      throw error;
    });
}
