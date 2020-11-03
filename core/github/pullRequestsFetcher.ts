import { PullRequest } from './pullRequest';
import { PullRequestsQueryResult } from '../../types/query';
import { graphql } from '@octokit/graphql';

export class PullRequestsFetcher {
    private readonly owner: string;
    private readonly repository: string;

    private whitelist = [
        'denis-y-krasilnikov',
        'nikita-perep',
        'MrViktorNikolaevich',
        'RomanLi182',
        'RomanMishushin',
        'ilya-mishushin',
        'dmitrychelyaev',
    ];

    public userToIdMapping = {
        'denis-y-krasilnikov': 'MDQ6VXNlcjIzMjA5ODg5',
        'nikita-perep': 'MDQ6VXNlcjM0NjQ1MzIy',
        MrViktorNikolaevich: 'MDQ6VXNlcjQyNjE1MjU4',
        RomanLi182: 'MDQ6VXNlcjQ2NzA5ODI0',
        RomanMishushin: 'MDQ6VXNlcjUxMDc3NzQ3',
        'ilya-mishushin': 'MDQ6VXNlcjU2MDY3MjEz',
        dmitrychelyaev: 'MDQ6VXNlcjU4NDE1MzIw',
    };

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

    async requestReviews(pr: PullRequest): Promise<void> {
        const alreadyRequested = [...pr.getReviews(), ...pr.getRequestedReviews()];
        const needToBeRequested = [...alreadyRequested];
        Object.entries(this.userToIdMapping).forEach(([login, id]) => {
            if (!needToBeRequested.find((it) => it.login === login) && pr.getAuthor() !== login) {
                needToBeRequested.push({ id, login });
            }
        });
        if (JSON.stringify(alreadyRequested) !== JSON.stringify(needToBeRequested)) {
            await this.query(`
              mutation RequestReviews {
                requestReviews(input: {pullRequestId: "${pr.getId()}", userIds: [${needToBeRequested
                .map((it) => `"${it.id}"`)
                .join(',')}]}) {
                  actor {
                    login
                  }
                }
              }
            `);
        }
    }

    async fetch(): Promise<{ [key: string]: PullRequest }> {
        const result = (await this.query(`
        {
          repository(owner: "${this.owner}", name: "${this.repository}") {
            pullRequests(last: 100, states: OPEN) {
              nodes {
                id
                reviewRequests(last: 100) {
                  nodes {
                    requestedReviewer {
                      ... on User {
                        id
                        login
                      }
                    }
                  }
                }
                mergeStateStatus
                mergeable
                number
                author {
                  login
                }
                latestReviews(last: 100) {
                  nodes {
                    state
                    author {
                      ... on User {
                        login
                        id
                      }
                    }
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
                        id: pr.id,
                        author: pr.author.login,
                        mergeStateStatus: pr.mergeStateStatus,
                        number: pr.number,
                        reviews: pr.latestReviews.nodes.map((review) => ({
                            state: review.state,
                            author: review.author,
                        })),
                        status: pr.commits.nodes[0].commit.statusCheckRollup
                            ? pr.commits.nodes[0].commit.statusCheckRollup.state
                            : 'PENDING',
                        requestedReviews:
                            pr.reviewRequests.nodes
                                .map((reviewRequest) =>
                                    reviewRequest.requestedReviewer
                                        ? reviewRequest.requestedReviewer
                                        : null,
                                )
                                .filter((it) => it) || [],
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
