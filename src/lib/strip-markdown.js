/**
 * Strip markdown code fences from LLM output that was supposed to be raw JSON.
 * Models sometimes wrap JSON in ```json ... ``` despite being told not to.
 */
export function stripMarkdownFences(text) {
  return text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
}
