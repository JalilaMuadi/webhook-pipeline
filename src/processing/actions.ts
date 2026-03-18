export type ProcessingType = "uppercase" | "lowercase" | "passthrough";

export function transformPayload(payload: string, type: ProcessingType): string {
  switch (type) {
    case "uppercase":
      return payload.toUpperCase();
    
    case "lowercase":
      return payload.toLowerCase();
    
    case "passthrough":
      return payload;

    default:
      console.warn(`[Transformer] Unknown type: ${type}, returning original payload.`);
      return payload;
  }
}