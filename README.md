# Summary
This module provides example code for creating an SNS Topic, and adding a Data Protection Policy to this topic.

Please update values in index.ts for your chosen SNS Topic Name.


# Using this Module

1. Make sure you can access AWS before running this script (i.e. you can test this will `aws sts get-caller-identity`) 
2. Set your default region for deployment.  You can do this using this code: `pulumi config set aws:region eu-west-2`;
3. Run npm install within the root folder of this project.  This will install all of the required Node dependencies;
4. Run `npm run build` to build the project, or `npm run all`, to build and then execute the project.