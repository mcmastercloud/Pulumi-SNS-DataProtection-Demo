import * as sns from './module/index.js'

let response = await sns.createTopic({
    name: "sns-dataprotection-test",
    main: {},       // The main object can be used to update default configuration for the SNS Topic
    dataProtection: true,
    dataProtectionIdentifiers: ["Name", "CreditCardNumber"]
});
