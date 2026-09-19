# Threadline AWS deployment

Threadline can be delivered through AWS CloudFront while the current forum
runtime, database, authentication, and admin tools remain intact.

## One-time AWS setup

1. Sign in to the AWS Console and open CloudFormation in us-east-1.
2. Create a stack using aws/github-oidc-role.yaml.
3. Keep the default GitHub owner and repository values.
4. Acknowledge that the template creates an IAM role and create the stack.
5. Copy the stack output named RoleArn.

## Connect GitHub

In dwayneelliottvaq132-cmd/threadline-forum, open Settings, then Secrets and
variables, Actions, Variables, and add:

- AWS_ROLE_ARN: the RoleArn output from the bootstrap stack
- AWS_REGION: us-east-1

No long-lived AWS access key is required.

## Deploy

Open Actions, Deploy Threadline to AWS, then Run workflow. The workflow creates
the threadline-forum-aws CloudFormation stack and prints the CloudFront URL in
the workflow summary.

## Architecture note

This is a safe first-stage AWS deployment: CloudFront becomes the AWS delivery
endpoint while the existing hosted runtime continues to provide database and
identity services. A full re-platform to Cognito, DynamoDB, S3, and an AWS-native
Next.js runtime is a separate migration and should be completed before removing
the current origin.
