import { lerp, clamp } from './math';

export const getRandomInteger = (min: number, max: number) => {
  const value = lerp(min, max, Math.random());
  return clamp(min, max, Math.round(value));
};

export const getRandomArrayItem = <T>(array: T[]) => {
  const index = getRandomInteger(0, array.length - 1);
  return array[index];
};


export const getRandomColor = () => {
  const h = getRandomInteger(0, 255);
  const s = getRandomInteger(0, 100);
  const l = getRandomInteger(0, 100);
  return {
    h,
    s,
    l,
    hsl: `hsl(${h} ${s}% ${l}% )`,
  };
};

export const getRandomString = () => {
  return `${new Date().valueOf()}-${Number(Math.random() * 100000).toFixed(0)}`;
};

export const getRandomPicsumImage = ({
  w = 900,
  h = 700,
}: {
  w?: number;
  h?: number;
}) => {

  // https://picsum.photos/200/300?random=1
  const url = new URL(
    `https://picsum.photos/${w}/${h}?random=${getRandomInteger(1, 2000)}`,
  );
  return url.toString();

};
