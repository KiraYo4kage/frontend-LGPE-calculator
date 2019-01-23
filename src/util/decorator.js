import lodash from 'lodash';

export const debounce = (delay = 300, option) => (target, name, descriptor) => ({
  ...descriptor,
  value: lodash.debounce(target[name], delay, option),
});

export const throttle = (delay = 300, option) => (target, name, descriptor) => ({
  ...descriptor,
  value: lodash.throttle(target[name],delay, { trailing: false, ...option }),
});
