import * as tsConfigPaths from 'tsconfig-paths';
import path from 'path';

// Register paths from tsconfig relative to the dist folder
tsConfigPaths.register({
  baseUrl: path.resolve(__dirname),
  paths: {
    '@config/*': ['config/*'],
    '@routes/*': ['routes/*'],
    '@services/*': ['services/*'],
    '@schemas/*': ['schemas/*'],
    '@middleware/*': ['middleware/*'],
  },
});
