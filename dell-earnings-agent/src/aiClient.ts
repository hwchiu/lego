import { execSync } from 'child_process';

const GITHUB_MODELS_URL = 'https://models.inference.ai.azure.com/chat/completions';
const MODEL = 'gpt-4o-mini';

function getToken(): string {
  const envToken = process.env.GITHUB_TOKEN?.trim();
  if (envToken) return envToken;
  try {
    return execSync('gh auth token', { encoding: 'utf8' }).trim();
  } catch {
    throw new Error('No GITHUB_TOKEN env var and gh auth token failed. Set GITHUB_TOKEN in .env');
  }
}

export async function chatComplete(systemPrompt: string, userContent: string, maxTokens = 2048): Promise<string> {
  const token = getToken();
  const res = await fetch(GITHUB_MODELS_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userContent },
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GitHub Models API error ${res.status}: ${body}`);
  }

  const data = await res.json() as { choices: Array<{ message: { content: string } }> };
  return data.choices[0]?.message?.content?.trim() ?? '';
}
