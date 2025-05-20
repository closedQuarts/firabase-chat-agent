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

## Challenges Encountered

- Coordinating communication between the React frontend, Firebase functions, and the Ocelot API Gateway required precise endpoint and method alignment.
- Managing CORS and authorization headers when calling the gateway from cloud functions.
- Parsing natural language reliably using OpenAI and designing consistent JSON outputs for varying user intents.
- Handling asynchronous behavior between Firestore message writes and delayed function triggers.
- Configuring Firebase project permissions to allow the frontend to write and read from Firestore.
- Debugging unexpected 401 and 404 errors from the gateway during early integration.
