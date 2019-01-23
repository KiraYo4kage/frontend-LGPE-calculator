import { request } from './request';

export const fetchMoves = async () => {
  const moves = await request('/public/move.json');
  window.moves = moves;
};
