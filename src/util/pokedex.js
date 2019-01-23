import { request } from './request';

export const fetchPokedex = async () => {
  const pokedex = await request('/public/pokeDex.json');
  window.pokedex = pokedex;
};
