export class PullRequest {
    private readonly id: number;
    private readonly author: string;
    private readonly mergeStateStatus: string;
    private readonly number: number;
    private readonly status: string;
    private readonly owner: string;
    private readonly repository: string;
    private readonly requestedReviews: { id: string; login: string }[];
    private readonly reviews: { state: string; author: { id: string; login: string } }[];

    constructor({
        id,
        author,
        mergeStateStatus,
        number,
        reviews,
        status,
        owner,
        repository,
        requestedReviews,
    }: {
        id: number;
        author: string;
        mergeStateStatus: string;
        number: number;
        reviews: { state: string; author: { id: string; login: string } }[];
        status: string;
        owner: string;
        repository: string;
        requestedReviews: { id: string; login: string }[];
    }) {
        this.id = id;
        this.author = author;
        this.mergeStateStatus = mergeStateStatus;
        this.number = number;
        this.reviews = reviews;
        this.status = status;
        this.owner = owner;
        this.repository = repository;
        this.requestedReviews = requestedReviews;
    }

    public getAuthor(): string {
        return this.author;
    }

    public getId(): number {
        return this.id;
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

    public isDraft(): boolean {
        return ['DRAFT'].includes(this.mergeStateStatus);
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

    public isBlocked(): boolean {
        return ['BLOCKED'].includes(this.mergeStateStatus);
    }

    public getRequestedReviews(): { id: string; login: string }[] {
        return this.requestedReviews;
    }

    public getReviews(): { id: string; login: string }[] {
        return this.reviews.map((review) => review.author);
    }
}
