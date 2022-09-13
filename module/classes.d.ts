import * as aws from "@pulumi/aws";
export declare class Attributes {
    name: string;
    main: aws.sns.TopicArgs;
    dataProtection: boolean;
    dataProtectionIdentifiers: string[];
    constructor(init?: Partial<Attributes>);
}
export declare class PolicyArgs {
    name: string;
    account: string;
    region: string;
}
export declare class Response {
    topic: aws.sns.Topic | undefined;
    constructor(init?: Partial<Response>);
}
