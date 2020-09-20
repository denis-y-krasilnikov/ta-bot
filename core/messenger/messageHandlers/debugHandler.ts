import { Events } from '../messenger';
import { PullRequest } from '../../github/pullRequest';
import { logInFile } from '../../../utils/logInFile';
import { format } from 'util';

export const debugHandler = async (
    event: Events,
    pr: PullRequest,
    ...args: unknown[]
): Promise<void> => {
    const log = (message) => {
        console.log(`[${pr.getNumber()}] ${message}`);
        logInFile(`[${pr.getNumber()}] ${format(message)}`);
    };
    if (event === Events.DEBUG) {
        log(args[0]);
    }
};
