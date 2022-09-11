import * as aws from "@pulumi/aws";
import { PolicyArgs } from "./classes";
export declare function GetPolicy(args: PolicyArgs): Promise<aws.iam.GetPolicyDocumentResult>;
