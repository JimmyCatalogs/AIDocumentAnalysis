import { 
  TextractClient, 
  DetectDocumentTextCommand,
  Block
} from "@aws-sdk/client-textract";
import { 
  BedrockRuntimeClient,
  InvokeModelCommand
} from "@aws-sdk/client-bedrock-runtime";

const textractClient = new TextractClient({
  region: import.meta.env.VITE_AWS_REGION,
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID!,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY!
  }
});

const bedrockClient = new BedrockRuntimeClient({
  region: import.meta.env.VITE_AWS_REGION,
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID!,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY!
  }
});

async function invokeTitan(text: string): Promise<string> {
  const prompt = `
    Your task is to summarize the following legal document. 
    Please provide a clear, structured summary that includes:
    1. Document type
    2. Key parties involved
    3. Main terms and conditions
    4. Important dates or deadlines
    5. Any critical obligations

    Document to summarize:
    ${text}

    Please format the summary in a clear, organized way.
  `;

  const payload = {
    inputText: prompt,
    textGenerationConfig: {
      maxTokenCount: 4096,
      stopSequences: [],
      temperature: 0.7,
      topP: 1
    }
  };

  const command = new InvokeModelCommand({
    modelId: "amazon.titan-text-express-v1",
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify(payload)
  });

  const response = await bedrockClient.send(command);
  const responseBody = new TextDecoder().decode(response.body);
  const parsedResponse = JSON.parse(responseBody);

  return parsedResponse.results[0].outputText;
}

export async function testAWSCredentials() {
  try {
    const response = await invokeTitan("This is a test document.");
    console.log("AWS Credentials test response:", response);
    return true;
  } catch (error) {
    console.error("AWS Credentials error:", error);
    return false;
  }
}

export async function analyzePDF(file: File): Promise<string> {
  try {
    // Convert PDF to base64
    const fileBuffer = await file.arrayBuffer();
    const fileBytes = new Uint8Array(fileBuffer);

    // Extract text using Textract
    const textractResponse = await textractClient.send(
      new DetectDocumentTextCommand({
        Document: {
          Bytes: fileBytes
        }
      })
    );

    // Combine all detected text
    const extractedText = textractResponse.Blocks
      ?.filter((block: Block) => block.BlockType === 'LINE')
      .map((block: Block) => block.Text)
      .join(' ') || '';

    // Generate summary using Titan
    const summary = await invokeTitan(extractedText);

    return `Summary:\n${summary}\n\nFull Text:\n${extractedText}`;
  } catch (error) {
    console.error('Error analyzing PDF:', error);
    throw error;
  }
}