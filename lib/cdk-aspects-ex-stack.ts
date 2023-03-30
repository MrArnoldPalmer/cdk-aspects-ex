import * as path from 'path';
import * as cdk from 'aws-cdk-lib';
import * as cr from 'aws-cdk-lib/custom-resources';
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { CfnDNSSEC } from 'aws-cdk-lib/aws-route53';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

class CrRuntimeAspect implements cdk.IAspect {
  public visit(node: Construct): void {
    if (node instanceof lambda.Function) {
      const fnNode = node.node.tryFindChild('Resource') as lambda.CfnFunction;
      if (fnNode.runtime === 'nodejs14.x') {
        fnNode.addPropertyOverride('Runtime', 'nodejs16.x');
      }
    }
  }
}

export class CdkAspectsExStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, 'MyBucket');
    new s3deploy.BucketDeployment(this, 'Deployment', {
      sources: [s3deploy.Source.asset(path.join(__dirname, 'upload'))],
      destinationBucket: bucket,
    });
    cdk.Aspects.of(this).add(new CrRuntimeAspect());
  }
}
