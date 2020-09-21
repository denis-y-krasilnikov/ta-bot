type Commit = {
    commit: {
        statusCheckRollup: { state: string };
    };
};
type Review = {
    state: string;
    author: {
        id: string;
        login: string;
    };
};
type ReviewRequest = {
    requestedReviewer: {
        id: string;
        login: string;
    };
};
type Author = {
    login: string;
};
type PullRequest = {
    id: number;
    mergeable: string;
    number: number;
    author: Author;
    commits: {
        nodes: Commit[];
    };
    latestReviews: {
        nodes: Review[];
    };
    reviewRequests: {
        nodes: ReviewRequest[];
    };
    mergeStateStatus: string;
};
export type PullRequestsQueryResult = {
    repository: {
        pullRequests: {
            nodes: PullRequest[];
        };
    };
};
