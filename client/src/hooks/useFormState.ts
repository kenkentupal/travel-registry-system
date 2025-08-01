// hooks/useFormState.ts
import { useState } from "react";

export function useFormState<T extends object>(initialState: T) {
  const [state, setState] = useState<T>(initialState);

  const updateField = (field: keyof T, value: any) => {
    setState((prev) => ({ ...prev, [field]: value }));
  };

  return [state, updateField, setState] as const;
}
