import * as aws from "@pulumi/aws"

export class Attributes {
    name: string = "";
    main: aws.sns.TopicArgs;
    dataProtection: boolean = false;
    dataProtectionIdentifiers: string[] = []

    constructor(init?: Partial<Attributes>) {
        Object.assign(this, init);
        this.main = {}
    }
}

export class PolicyArgs {
    name: string = "";
    account: string = "";
    region: string = "";
}

export class Response {
    topic: aws.sns.Topic | undefined;

    constructor(init?: Partial<Response>) {
        Object.assign(this, init);
    }
}