import {fetch as fetchPolyfill} from 'whatwg-fetch'

export const fetchTimeout = (url, options?) => {
  options = options || {};
  const timeout = options.timeout || 15000;
  delete options.timeout;
  const requestPromise = fetchDefault(url, options);
  const timerPromise = new Promise((resolve, reject) => {
    setTimeout(() => {
      reject({result: 'timeout'})
    }, timeout)
  }) as Promise<{result: 'string'}>;
  return Promise.race([requestPromise, timerPromise]);
};

const fetchDefault = (url, options?) => {
  options = options || {};
  options.credentials = 'include';
  const bodyIsObject = Object.prototype.toString.call(options.body).slice(8, -1) === 'Object';
  options.body = bodyIsObject ? JSON.stringify(options.body) : options.body;
  if (bodyIsObject) {
    options.headers = Object.assign({}, {
      'Content-Type': 'application/json;charset=UTF-8'
    }, options.headers)
  }
  const Authorization = localStorage.getItem('authorization');
  if (!!Authorization) {
    options.headers = Object.assign({}, {Authorization}, options.headers)
  }
  if (!options.noTimestamp) {
    url = url + (url.match(/\?/) ? '&' : '?') + 'timestamp=' + new Date().getTime();
  } else {
    delete options.noTimestamp
  }

  return fetchPolyfill(url, options)
    .then(async response => {
      let data;
      try {
        data = await response.json();
        return response.status === 200 ? Promise.resolve(data) : Promise.reject(data);
      } catch (e) {
        return Promise.reject(e);
      }
    })
};

export default fetchDefault
