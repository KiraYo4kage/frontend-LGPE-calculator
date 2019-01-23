export const request = (url, body = {}, option = {
  method: 'get',
}) => {
  if (option.method === 'get') {
    url = url + '?' + Object.keys(body).map(key => `${key}=${body[key]}`).join('&');
    body = undefined;
  } else {
    body = JSON.stringify(body);
    option.headers = {
      ...(option.headers || {}),
      'content-type': 'application/json',
    };
  }
  return fetch(url, Object.assign(option, { body })).then(data => data.json());
}
