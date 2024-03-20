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

export const getRandomUnsplashImage = ({
  tags = ['fun'],
  w = 900,
  h = 700,
}: {
  tags?: string[],
  w?: number,
  h?: number,
}) => {
  const _tags = tags.join(",");
  const rnds = getRandomString();

  // const url = `https://source.unsplash.com/random/${w}x${h}/?${_tags}&last-mod=${rnds}`;

  const url = new URL(`https://source.unsplash.com/random/${w}x${h}/`);
  url.searchParams.append("last-mod", rnds);
  url.searchParams.append(_tags, '');

  return url.toString();
};