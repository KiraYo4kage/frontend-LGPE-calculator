import { request } from './request';

export const fetchCharactor = async () => {
  const charactor = await request('/public/charactor.json');
  window.charactor = charactor;
};
