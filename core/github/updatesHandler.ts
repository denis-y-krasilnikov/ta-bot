
import { forEachSeries } from 'p-iteration';
import { Events, Messenger } from "../messenger/messenger";
import { PullRequestsFetcher } from "./pullRequestsFetcher";
import { PullRequest } from "./pullRequest";

export class UpdatesHandler {
    private readonly messenger: Messenger;

    private pullRequestsFetcher: PullRequestsFetcher;
    private storedPullRequests: { [key: string]: PullRequest };

    private interval = 30000;

    constructor({
        owner,
        repository,
        messenger,
    }: {
        owner: string;
        repository: string;
        messenger: Messenger;
    }) {
        this.pullRequestsFetcher = new PullRequestsFetcher({ owner, repository });
        this.messenger = messenger;
    }

    async init(): Promise<void> {
        this.storedPullRequests = await this.pullRequestsFetcher.fetch();
    }

    async run(): Promise<void> {
        try {
            const newPullRequests = await this.pullRequestsFetcher.fetch();
            await forEachSeries(Object.entries(newPullRequests), async ([number, newPR]) => {
                const oldPR = this.storedPullRequests[number];

                if (oldPR) {
                    if (JSON.stringify(oldPR) === JSON.stringify(newPR)) return;

                    await this.messenger.message(Events.DEBUG, newPR, '----- UPDATED -----');
                    await this.messenger.message(Events.DEBUG, newPR, 'Old PR');
                    await this.messenger.message(Events.DEBUG, newPR, oldPR);
                    await this.messenger.message(Events.DEBUG, newPR, 'New PR');
                    await this.messenger.message(Events.DEBUG, newPR, newPR);

                    if (!oldPR.hasConflicts() && newPR.hasConflicts())
                        await this.messenger.message(Events.CONFLICTING, newPR);
                    if (!oldPR.isFailing() && newPR.isFailing())
                        await this.messenger.message(Events.FAILING, newPR);
                    if (!oldPR.isBehind() && newPR.isBehind())
                        await this.messenger.message(Events.BEHIND, newPR);
                    if (!oldPR.hasChangeRequest() && newPR.hasChangeRequest())
                        await this.messenger.message(Events.CHANGE_REQUEST, newPR);
                    if (!oldPR.isUnstable() && newPR.isUnstable())
                        await this.messenger.message(Events.UNSTABLE, newPR);

                    if (
                        (oldPR.hasConflicts() ||
                            oldPR.isFailing() ||
                            oldPR.isBehind() ||
                            oldPR.hasChangeRequest() ||
                            !oldPR.isSuccess() ||
                            oldPR.isBlocked()) &&
                        !newPR.hasConflicts() &&
                        !newPR.isFailing() &&
                        !newPR.isBehind() &&
                        !newPR.hasChangeRequest() &&
                        newPR.isSuccess() &&
                        !newPR.isBlocked()
                    ) {
                        const approvesCount = newPR.getApprovesCount();
                        if (approvesCount >= 2) {
                            await this.messenger.message(Events.CLEAR, newPR);
                        } else {
                            await this.messenger.message(Events.PASSING, newPR, 2 - approvesCount);
                        }
                    }

                    await this.messenger.message(Events.DEBUG, newPR, '-------------------');
                    this.storedPullRequests[number] = newPR;
                    return;
                }

                await this.messenger.message(Events.CREATED, newPR);
                await this.pullRequestsFetcher.requestReviews(newPR);
                this.storedPullRequests[number] = newPR;
            });

            await forEachSeries(Object.keys(this.storedPullRequests), async (number) => {
                if (newPullRequests[number]) return;
                await this.messenger.message(Events.CLOSED, this.storedPullRequests[number]);
                delete this.storedPullRequests[number];
            });
        } catch (e) {
            await this.messenger.message(Events.ERROR, null, e.stack);
        } finally {
            setTimeout(this.run.bind(this), this.interval);
        }
    }
}
