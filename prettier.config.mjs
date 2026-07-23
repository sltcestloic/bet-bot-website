/** @type {import('prettier').Config} */
export default {
  arrowParens: 'avoid',
  endOfLine: 'lf',
  plugins: ['prettier-plugin-tailwindcss'],
  printWidth: 140,
  semi: false,
  singleQuote: true,
  tailwindStylesheet: './src/client/app/styles/index.css',
  trailingComma: 'all',
}
