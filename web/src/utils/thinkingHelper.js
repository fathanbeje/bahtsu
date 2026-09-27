/**
 * Utility to extract and strip model reasoning / thinking blocks (<think>...</think>)
 */

export function extractThoughts(content) {
  if (!content || typeof content !== 'string') {
    return { thoughtText: '', mainContent: '' };
  }

  const thoughtBlocks = [];

  // 1. Extract all closed <think>...</think> blocks
  let mainContent = content.replace(/<think>([\s\S]*?)<\/think>/gi, (match, thought) => {
    const trimmed = thought.trim();
    if (trimmed) {
      thoughtBlocks.push(trimmed);
    }
    return '';
  });

  // 2. Extract any unclosed <think>... block at the end (e.g. while streaming)
  const unclosedMatch = mainContent.match(/<think>([\s\S]*)$/i);
  if (unclosedMatch) {
    const unclosedThought = unclosedMatch[1].trim();
    if (unclosedThought) {
      thoughtBlocks.push(unclosedThought);
    }
    mainContent = mainContent.replace(/<think>([\s\S]*)$/i, '');
  }

  return {
    thoughtText: thoughtBlocks.join('\n\n---\n\n').trim(),
    mainContent: mainContent.trim(),
  };
}

export function stripThinkingTags(content) {
  if (!content || typeof content !== 'string') return '';
  return content
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/<think>[\s\S]*$/gi, '')
    .trim();
}
