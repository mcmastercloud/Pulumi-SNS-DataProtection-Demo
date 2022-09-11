import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { Attributes, Response } from "./classes.js"
import { GetPolicy } from './policy.js'
 
export async function createTopic(attributes: Attributes): Promise<Response> {

    let updated_attributes = attributes.main;
    const current_account = await aws.getCallerIdentity({});
    const current_region = await aws.getRegion();


    if(updated_attributes?.kmsMasterKeyId == undefined) {
        // Do not allow an SNS Topic to be unencrypted, create a new KMS Key because one has not already been specified
        // This is to enhance the security posture

        // Create a Policy Document that restricts access to the KMS Key to the SNS Topic that is being created
        const policy = await GetPolicy({
            account: current_account.id,
            region: current_region.id,
            name: attributes.name
        })
        
        const kms_key = new aws.kms.Key(
            `kms-${attributes.name}`,
            {
                policy: policy.json,
                description: `kms-sns-${attributes.name}`,
                tags: {"name": `kms-sns-${attributes.name}`}
            }
        )

        new aws.kms.Alias(
            `kms-sns-alias-${attributes.name}`,
            {
                name: `alias/sns/${attributes.name}`,
                targetKeyId: kms_key.id
            }
        )

        updated_attributes.kmsMasterKeyId = kms_key.id
    }

    const sns_topic = new aws.sns.Topic(
        attributes.name,
        updated_attributes
    );

    let response = new Response();
    response.topic = sns_topic;
    return response;

}
