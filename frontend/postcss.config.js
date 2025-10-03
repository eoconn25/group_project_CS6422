import tailwindcss from '@tailwindcss/postcss';
import autoprefixer from 'autoprefixer';

/** @type {import('postcss').ProcessOptions} */
export default {
  plugins: [
    tailwindcss,
    autoprefixer
  ]
};