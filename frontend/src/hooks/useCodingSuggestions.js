import { useState } from "react";

export function useCodingSuggestions() {
  const [suggestions, setSuggestions] = useState([]);
  return { suggestions, setSuggestions };
}
