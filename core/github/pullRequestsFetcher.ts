import { PullRequest } from "./pullRequest";
import { PullRequestsQueryResult } from "../../types/query";
import { graphql } from "@octokit/graphql";

export class PullRequestsFetcher {
    private readonly owner: string;
    private readonly repository: string;

    private whitelist = [
        'denis-y-krasilnikov',
        'nikita-perep',
        'MrViktorNikolaevich',
        'RomanLi182',
        'RomanMishushin',
        'AleksanderMolodtsov',
        'ilya-mishushin',
        'dmitrychelyaev',
    ];

    private query = graphql.defaults({
        headers: {
            authorization: `token ${process.env.GITHUB_TOKEN}`,
            accept: 'application/vnd.github.merge-info-preview+json',
        },
    });

    constructor({ owner, repository }: { owner: string; repository: string }) {
        this.owner = owner;
        this.repository = repository;
    }

    async fetch(): Promise<{ [key: string]: PullRequest }> {
        const result = (await this.query(`
        {
          repository(owner: "${this.owner}", name: "${this.repository}") {
            pullRequests(last: 100, states: OPEN) {
              nodes {
                mergeStateStatus
                mergeable
                number
                author {
                  login
                }
                latestReviews(last: 100) {
                  nodes {
                    state
                  }
                }
                commits(last: 1) {
                  nodes {
                    commit {
                      statusCheckRollup {
                        state
                      }
                    }
                  }
                }
              }
            }
          }
        }
        `)) as PullRequestsQueryResult;
        return result.repository.pullRequests.nodes
            .map(
                (pr) =>
                    new PullRequest({
                        author: pr.author.login,
                        mergeStateStatus: pr.mergeStateStatus,
                        number: pr.number,
                        reviews: pr.latestReviews.nodes,
                        status: pr.commits.nodes[0].commit.statusCheckRollup
                            ? pr.commits.nodes[0].commit.statusCheckRollup.state
                            : 'PENDING',
                        owner: this.owner,
                        repository: this.repository,
                    }),
            )
            .filter((pr) => this.whitelist.includes(pr.getAuthor()))
            .reduce(
                (res, cur) => ({
                    ...res,
                    [cur.getNumber()]: cur,
                }),
                {},
            );
    }
}
