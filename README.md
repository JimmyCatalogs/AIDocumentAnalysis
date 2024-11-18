# PDF Analysis App

This application uses AWS services to analyze and summarize PDF documents.

## Features
- Text summarization using AWS Bedrock (Titan)

## Setup
1. Clone the repository
2. Install dependencies:
```bash
npm install
```
3. Set up environment variables in `.env`:
```
VITE_AWS_REGION=your_region
VITE_AWS_ACCESS_KEY_ID=your_access_key
VITE_AWS_SECRET_ACCESS_KEY=your_secret_key
```
4. Run the development server:
```bash
npm run dev
```

## Environment Variables
The following environment variables are required:
- `VITE_AWS_REGION`: Your AWS region
- `VITE_AWS_ACCESS_KEY_ID`: AWS access key ID
- `VITE_AWS_SECRET_ACCESS_KEY`: AWS secret access key

## AWS Services Used
- AWS Bedrock (Titan model) for text summarization
