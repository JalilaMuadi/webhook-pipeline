// src/processing/actions.ts

export type ProcessingType =
  | "uppercase"
  | "lowercase"
  | "passthrough"
  | "add_timestamp"
  | "mask_emails";

export function transformPayload(
  payload: string,
  type: ProcessingType,
): string {
  // Try to parse the payload to an object for easier manipulation
  let data: any;
  try {
    data = JSON.parse(payload);
  } catch (e) {
    // If not valid JSON (plain text), treat it as a raw string
    data = payload;
  }

  switch (type) {
    case "uppercase":
      // Convert all string values to uppercase
      return typeof data === "string"
        ? data.toUpperCase()
        : JSON.stringify(data).toUpperCase();

    case "lowercase":
      // Convert all string values to lowercase
      return typeof data === "string"
        ? data.toLowerCase()
        : JSON.stringify(data).toLowerCase();

    case "add_timestamp":
      // If JSON, append a processedAt timestamp; otherwise, append to the string
      if (typeof data === "object" && data !== null) {
        return JSON.stringify({
          ...data,
          processedAt: new Date().toISOString(),
        });
      }
      return `${data} (Processed at: ${new Date().toISOString()})`;

    case "mask_emails":
      // Stringify data and use Regex to mask any email addresses for privacy
      const fullString = JSON.stringify(data);
      const masked = fullString.replace(
        /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
        "******@***.com",
      );
      return masked;

    case "passthrough":
      return payload;

    default:
      console.warn(
        `[Transformer] Unknown processing type: ${type}, returning original payload.`,
      );
      return payload;
  }
}
