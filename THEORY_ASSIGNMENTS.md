#### Question 1:

To make this project production ready, several important steps need to be taken into account. Here are my suggestions and architectural changes proposal:

- Scan the project with ESLint and Prettier to improve code quality and maintain consistent formatting.
- Organize and separate endpoints into individual files with single responsibility instead of placing them in index.js.
- Document the API endpoints and their expected request and response formats by generating interactive documentation with Swagger.
- Implement proper validation and sanitization for all user-generated input to prevent Cross-Site Scripting (XSS) attacks (For example: using Joi, Zod, etc.).
- Ensure that all SQL queries are parameterized to prevent SQL injection attacks.
- Add secure middleware to verify authentication (For example: JWT signature verification).
- If the API consumers are other systems, secure the API with mTLS certificates to ensure system-to-system authentication.
- Sign API responses with a private key, allowing verification on the frontend using a public key.
- Use robust frameworks like TypeScript to enable static typing and consider using NestJS for better structure.
- Add unit tests to ensure code quality as the existing tests seem to be integrated tests not unit tests (external calls should be mocked).
- Implement a database backup strategy to ensure data protection.
- Improve the GET /api/games endpoint by adding pagination to enhance response time and scalability.
- Set up automated CI/CD pipelines for testing, buildin and deploying code to production.
- Add Semantic Release to reduce time to market by automatically generating CHANGELOG.md and JIRA releases.
- Integrate an observability tool (For example: New Relic, Grafana, OpenTelemetry) to monitor application performance and errors.
- Based on the app’s hosting environment (cloud or on-premises), implement caching, load balancing, and a WAF (Web Application Firewall) for improved performance and security.
- Rework games by adding the game identifier in addition to the autoincrement id.
- The project architecture can be migrated to a serverless model by deploying multiple endpoints behind an AWS API Gateway which efficiently routes traffic to AWS Lambda functions for scalable and cost-effective execution.



#### Question 2:

- Configure an S3 event notification on the bucket to trigger an event when new files are added.
- Enable S3 versioning on the bucket to retain previous versions of files and allow recovery in case of disaster.
- Configure a new Lambda function that is triggered each time a new file is uploaded to S3.
- The Lambda function should read the games from the file and publish batches (For example 10 games) to an SQS queue to improve scalability and resilience.
- When a new message is published to the SQS queue, another AWS Lambda function should be triggered to insert the games into the database.
- With this solution, we are now notified in real-time whenever a new file is deposited.