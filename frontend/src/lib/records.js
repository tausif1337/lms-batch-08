/** The list endpoints return either a bare array or a paginated
 *  { results: [...] } envelope. Callers should not have to care which. */
export function recordsFrom(answer) {
  if (Array.isArray(answer)) {
    return answer;
  }

  return answer?.results || [];
}
