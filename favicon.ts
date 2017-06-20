import * as favicon from 'serve-favicon';
import * as path from 'path';

const fav = favicon(path.join(__dirname, './views/img', 'favicon.png'));

export = { fav };