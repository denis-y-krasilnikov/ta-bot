export class PullRequest {
    private readonly author: string;
    private readonly mergeStateStatus: string;
    private readonly number: number;
    private readonly status: string;
    private readonly owner: string;
    private readonly repository: string;
    private reviews: { state: string }[];

    constructor({
        author,
        mergeStateStatus,
        number,
        reviews,
        status,
        owner,
        repository,
    }: {
        author: string;
        mergeStateStatus: string;
        number: number;
        reviews: { state: string }[];
        status: string;
        owner: string,
        repository: string,
    }) {
        this.author = author;
        this.mergeStateStatus = mergeStateStatus;
        this.number = number;
        this.reviews = reviews;
        this.status = status;
        this.owner = owner;
        this.repository = repository;
    }

    public getAuthor(): string {
        return this.author;
    }

    public getNumber(): number {
        return this.number;
    }

    public hasConflicts(): boolean {
        return ['DIRTY'].includes(this.mergeStateStatus);
    }

    public isFailing(): boolean {
        return ['ERROR', 'FAILURE'].includes(this.status);
    }

    public isBehind(): boolean {
        return ['BEHIND'].includes(this.mergeStateStatus);
    }

    public hasChangeRequest(): boolean {
        return this.reviews.some((review) => ['CHANGES_REQUESTED'].includes(review.state));
    }

    public getApprovesCount(): number {
        return this.reviews.filter((review) => ['APPROVED'].includes(review.state)).length;
    }

    public isSuccess(): boolean {
        return ['SUCCESS'].includes(this.status);
    }

    public isUnstable(): boolean {
        return ['UNSTABLE'].includes(this.mergeStateStatus);
    }

    public getHref(): string {
        return `https://github.com/${this.owner}/${this.repository}/pull/${this.number}`;
    }
}
