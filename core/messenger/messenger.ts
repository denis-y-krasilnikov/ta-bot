import { forEachSeries } from 'p-iteration';
import { PullRequest } from "../github/pullRequest";

export enum Events {
    BEHIND = 'BEHIND', // Update branch (author) +
    CHANGE_REQUEST = 'CHANGE_REQUEST', // Change request (author) +
    CLEAR = 'CLEAR', // Ready to merge (leads) +
    CLOSED = 'CLOSED', // Closed (nobody) +
    CONFLICTING = 'CONFLICTING', // Conflicts (author) +
    CREATED = 'CREATED', // Create (@here) +
    FAILING = 'FAILING', // Failing (author) +
    PASSING = 'PASSING', // Needs approves (@here) +
    UNSTABLE = 'UNSTABLE', // Non required fails (plain message) +

    DEBUG = 'DEBUG',
    ERROR = 'ERROR',
}

export type MessageHandler = (event: Events, pr: PullRequest, ...args: unknown[]) => Promise<void>;

export class Messenger {
    private messageHandlers: MessageHandler[] = [];

    public addHandler(handler: MessageHandler): void {
        this.messageHandlers.push(handler);
    }

    public async message(event: Events, pr: PullRequest, ...args: unknown[]): Promise<void> {
        await forEachSeries(this.messageHandlers, async (handler) => {
            await handler(event, pr, ...args);
        });
    }
}
