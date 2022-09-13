import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { local } from "@pulumi/command";
import { Attributes, Response } from "./classes.js";
import { GetPolicy } from './policy.js';
import { exec } from 'child_process';
import { readFileSync, writeFile } from 'fs';

const DENY_POLICY = `
{
    "Name":"example_data_protection_policy",
    "Version":"2021-06-01",
    "Statement": [
        {
            "DataDirection":"Inbound",
            "Principal":["*"],
            "DataIdentifier":[],
            "Operation": {
                "Deny":{}
            }
        }
    ]
}`

export async function createTopic(attributes: Attributes): Promise<Response> {

    let updated_attributes = attributes.main;
    const current_account = await aws.getCallerIdentity({});
    const current_region = await aws.getRegion();


    if(updated_attributes?.kmsMasterKeyId == undefined) {
        // Do not allow an SNS Topic to be unencrypted, create a new KMS Key if one has not already been specified
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



    addDataProtectionPolicy(current_account.id, current_region.id, sns_topic.name, attributes.dataProtectionIdentifiers);

    let response = new Response();
    response.topic = sns_topic;
    return response;

}

// This function is a patch.  At the moment, Pulumi's AWS Provider does not support SNS Data Protection Policies
// However, the AWS CLI does.  Therefore, this function is used to shell out from Pulumi to the AWS CLI and patch the SNS
// topic with a Data Protection Policy, based on user Parameters
function addDataProtectionPolicy(aws_account: string, aws_region: string, topic_name: pulumi.Output<string>, dataProtectionIdentifiers: string[]) {

    let dpPolicy = JSON.parse(DENY_POLICY);

    for(var item of dataProtectionIdentifiers) {
        dpPolicy.Statement[0].DataIdentifier.push(`arn:aws:dataprotection::aws:data-identifier/${item}`)
    };
    let strPolicy = JSON.stringify(dpPolicy);

    // There appears to be an issue with the AWS Put Data Protection Policy Command when used in combination
    // with the Pulumi command (beta) provider.  Therefore, we write the JSON out to a file first,
    // and then ask AWS to read the json value from the file.  Once that is completed, the file is removed.
    writeFile('./data-protection-out.json', JSON.stringify(dpPolicy), function(err) {
        if(err) {

            pulumi.log.error('Cloud not create file');
        }
        pulumi.log.info('File read Successfully');

    });

    // This string contains the names of the DataProtection identifiers will be applied to the SNS Topic.  Because
    // values are being loaded from file, we need to find a way to force the Pulumi Command execution to run when these
    // values change.  By simply echoing this value as part of the command script, this will force the commands to
    // re-run when the DataProtection identifiers change.
    const create_trigger: string = dataProtectionIdentifiers.join()

    const putDataProtectionPolicyPatch = new local.Command("putDataProtectionPolicyPatch", {
        create: pulumi.interpolate`aws sns put-data-protection-policy --resource-arn arn:aws:sns:${aws_region}:${aws_account}:${topic_name} --region ${aws_region} --data-protection-policy file://./data-protection-out.json && rm ./data-protection-out.json && echo \'${create_trigger}\'`,
        update: pulumi.interpolate`aws sns put-data-protection-policy --resource-arn arn:aws:sns:${aws_region}:${aws_account}:${topic_name} --region ${aws_region} --data-protection-policy file://./data-protection-out.json && rm ./data-protection-out.json && echo \'${create_trigger}\'`
   });

}
