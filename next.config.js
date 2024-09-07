// const withPlugins = require("next-compose-plugins");
// const withLess = require("@zeit/next-less");
// module.exports = withPlugins(
//   [
//     [
//       withLess,
//       {
//         lessLoaderOptions: {
//           javascriptEnabled: true,
//         },
//       },
//     ],
//   ],
//   {
//     // 其他 Next.js 配置
//   }
// );
// const withLess = require("next-with-less");

// module.exports = withLess({
//   lessLoaderOptions: {
//     lessOptions: {
//       javascriptEnabled: true,
//     },
//   },
// });

const withPlugins = require("next-compose-plugins");
const withLess = require("next-with-less");

module.exports = withPlugins(
  [
    [
      withLess,
      {
        lessLoaderOptions: {
          lessOptions: {
            javascriptEnabled: true,
          },
        },
      },
    ],
  ],
  {
    // 其他 Next.js 配置
  }
);
