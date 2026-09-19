# Threadline

Threadline is an independent social-network MVP built with Next.js and React. It combines a visual feed, topic communities, private messaging, local meetups, dating discovery, recommendations, media uploads, and browser-based photo/video editing.

## Run locally

Requirements: Node.js 22 and pnpm 11.

```bash
corepack enable
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

## Included product flows

- Personalized `For you`, `Following`, and `Local` feeds
- Text, photo, video, and link composer
- Photo filters, brightness, and rotation controls
- Video preview, trim range, and audio toggle
- Direct-message inbox with send flow
- Community discovery and join/leave state
- Nearby meetup discovery and RSVP state
- 18+ dating discovery, mutual-match flow, and safety cues
- Responsive desktop and mobile layouts
- Local persistence for joins, RSVPs, and messages

The included build is a front-end MVP. Uploaded media stays in the current browser session; production accounts, moderation, database records, real-time chat, geolocation, and cloud media storage should be connected to your backend before public launch.

## Deploy to AWS Amplify

1. Push this folder to a GitHub, GitLab, Bitbucket, or CodeCommit repository.
2. In AWS Amplify Hosting, choose **New app → Host web app** and connect the repository.
3. Amplify will detect `amplify.yml` and build the static export from `out/`.
4. Keep the build image on Node.js 22. The included `.nvmrc` and build file request that version.
5. Deploy. No ChatGPT account, API, service, or runtime is required.

## Production backend path

For a public launch on AWS, pair this interface with:

- Amazon Cognito for accounts and 18+ onboarding
- AWS AppSync and DynamoDB for posts, comments, recommendations, messages, matches, and events
- Amazon S3 plus CloudFront for original and edited media
- AWS Lambda or MediaConvert for server-side video processing
- Amazon Rekognition plus a human-review queue for media moderation
- EventBridge and SNS/Pinpoint for notification delivery

Do not rely on the UI alone for permissions. Enforce ownership, blocking, reporting, visibility, rate limits, consent, and age rules in the backend.

## Build

```bash
pnpm build
```

The deployable site is written to `out/`.
