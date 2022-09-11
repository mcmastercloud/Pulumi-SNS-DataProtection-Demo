import * as sns from './module/index.js'

let response = await sns.createTopic({
    name: "test",
    main: {},
    dataProtection: true
});
