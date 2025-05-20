
# Firebase Chat Agent

This repository contains a Firebase Cloud Function named `processMessage` that listens to new user messages from Firestore, uses OpenAI to detect intent, and calls corresponding API routes through an API Gateway.

## Workflow

1. User message is written to the Firestore `messages` collection.
2. The function is triggered automatically.
3. Intent and parameters are extracted using OpenAI.
4. Appropriate API call is made through the gateway.
5. The API response is written back to Firestore.

## Environment Setup

Create a `.env` file in the `functions/` directory:

```
OPENAI_API_KEY=...
GATEWAY_URL=https://ocelot-gateway-xyz.onrender.com
JWT_TOKEN=Bearer ...
```

## Deployment

```bash
firebase deploy --only functions
```

## Related Repositories

Frontend UI: ai-chat-ui  
API Gateway: ocelot-gateway

## Developer

Name: Efe Demirtaş  
Course: SE4458 Software Architecture (Spring 2025)  
Project: AI Chat Agent (Function)
