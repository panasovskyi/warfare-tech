import { createInterface } from 'node:readline/promises';

export const confirm = async (question: string): Promise<boolean> => {
  if (!process.stdin.isTTY) {
    throw new Error(
      'Not published: a question needs an answer, but this is not an interactive terminal. Run the command in a terminal',
    );
  }

  const readline = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    const answer = await readline.question(`${question} (y/n) `);

    return ['y', 'yes'].includes(answer.trim().toLowerCase());
  } finally {
    readline.close();
  }
};
