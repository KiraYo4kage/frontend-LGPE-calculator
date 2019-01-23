import { request } from './request';

export const fetchAttribute = async () => {
  const attribute = await request('/public/attribute.json');
  window.attribute = attribute;
};
