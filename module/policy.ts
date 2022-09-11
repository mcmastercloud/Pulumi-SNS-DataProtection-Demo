import * as aws from "@pulumi/aws";
import { PolicyArgs } from "./classes";

export function GetPolicy(args: PolicyArgs): Promise<aws.iam.GetPolicyDocumentResult> {
    return aws.iam.getPolicyDocument({
        statements: [
            {
                sid: "RootAccess",
                actions: ["kms:*"],
                principals: [{
                    type: "AWS",
                    identifiers: [`arn:aws:iam::${args.account}:root`]
                }],
                effect: "Allow",
                resources: ["*"]
            },
            {
                sid: "SNSAccess",
                actions: [
                    "kms:GenerateDataKey*",
                    "kms:Encrypt"
                ],
                effect: "Allow",
                principals: [{
                    type: "Service",
                    identifiers: ["sns.amazonaws.com"]
                }],
                resources: ["*"],
                conditions: [{
                    test: "ArnEquals",
                    values: [`arn:aws:sns:${args.region}:${args.account}:${args.name}`],
                    variable: "aws.SourceArn"
                }]
            }
        ]
    })
}