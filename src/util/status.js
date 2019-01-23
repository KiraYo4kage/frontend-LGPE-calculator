import { request } from './request';

export const fetchStatus = async () => {
  const status = await request('/public/status.json');
  window.statusCondition = status;
};

export const attrWithStatus = (type, attr) => {
  let result = 1;
  switch (type) {
    case 'Paralysis':
      attr === 'spe' && (result *= 0.5);break;
    default:
      break;
  }
  return result;
};

export const damageWithStatus = (type) => {
  let result = 1;
  switch (type) {
    case 'Burn':
      result *= 0.5;break;
    default:
      break;
  }
  return result;
};
