import { v4 as uuid } from "uuid";

/**
 * Generates a unique anonymous User Id (UUID)
 */
export function generateAnonymousUserId(): string {
  return uuid();
}

/**
 * Get all the params from the **parent** iframe (the script reading this must be executed within the iframe).
 *
 * For example, if the iframe is loaded as follows: `<iframe id="my-iframe" src="http://example.com" width="640" height="480"></iframe>`
 * ... then the method would return the following string: `id="my-iframe" src="http://example.com" width="640" height="480"`
 */
export function getBrowserIframeAttributes(): string {
  const iframe = window.frameElement;

  if (iframe === null) {
    return "";
  }

  const iframeAttributes = Array.from(iframe.attributes);
  const attributeStrings = [];

  for (const attr of iframeAttributes) {
    const attrString = `${attr.nodeName}="${attr.nodeValue ?? ""}"`;
    attributeStrings.push(attrString);
  }

  // Merge the attribute strings into a single string
  return attributeStrings.join(" ");
}
