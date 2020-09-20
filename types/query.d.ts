type Commit = {
  commit: {
    statusCheckRollup: { state: string };
  }
}
type Review = {
  state: string;
}
type Author = {
  login: string;
}
type PullRequest = {
  mergeable: string;
  number: number;
  author: Author;
  commits: {
    nodes: Commit[]
  };
  latestReviews: {
    nodes: Review[];
  }
  mergeStateStatus: string;
}
export type PullRequestsQueryResult = {
  repository: {
    pullRequests: {
      nodes: PullRequest[];
    }
  }
};
