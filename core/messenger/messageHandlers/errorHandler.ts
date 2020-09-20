import { Events } from "../messenger";
import { PullRequest } from "../../github/pullRequest";
import { logInFile } from "../../../utils/logInFile";

export const errorHandler = async (
    event: Events,
    pr: PullRequest,
    ...args: unknown[]
): Promise<void> => {
    const log = (message) => {
        console.log(`[Error] ${message}`);
        logInFile(`[Error] ${message}`);
    };
    if (event === Events.ERROR) {
        log(args[0]);
    }
};
