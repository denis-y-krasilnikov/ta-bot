import { format } from 'util';
import * as fs from 'fs';

const stream = fs.createWriteStream('./log.log', { flags: 'a' });
export const logInFile = (msg: unknown): void => {
    stream.write(format(msg) + '\n');
};
