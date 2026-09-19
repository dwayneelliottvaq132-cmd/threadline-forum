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

The included build is a front-end MVP. Uploaded media and activity are saved on the current device when browser storage is available; production accounts, moderation, database records, real-time chat, geolocation, and cloud media storage should be connected to your backend before public launch.

## Deploy to AWS Amplify

1. Push this folder to a GitHub, GitLab, Bitbucket, or CodeCommit repository.
2. In AWS Amplify Hosting, choose **New app → Host web app** and connect the repository.
3. Amplify will detect `amplify.yml` and deploy the Next.js build from `.next/`.
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

The static export is written to `out/`; Amplify deploys the corresponding Next.js build metadata from `.next/` as required for Next.js 14 and later.

## Device activity update

- Feed search matches post text, author, and community.
- Saved feed shows bookmarked posts; My groups uses joined communities.
- Comments, bookmarks, likes, posts, media, group membership, RSVPs, and separate conversation histories persist in IndexedDB on the current browser/device.
- Existing local activity is imported on first use. Storage failures display a visible warning.
- Sharing copies post text and its link to the clipboard.
- Links accept only HTTP/HTTPS; local media is limited to 10 MB per file. Photo brightness and rotation are retained when posted.

This remains a device-local prototype: demo profiles, simulated dating matches, and messages are not real accounts or delivered messages. No AWS identity, shared database, cloud uploads, or protected admin backend is configured. Video trim controls currently preview a selection and do not encode a trimmed video. Clearing browser data removes local activity.

Run focused feed and link validation checks with `node --test tests/feed.test.mjs`.
