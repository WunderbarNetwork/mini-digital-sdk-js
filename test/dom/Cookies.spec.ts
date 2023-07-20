/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from "vitest";

import Cookies from "js-cookie";

describe(`Testing the Cookies functionality within JSDOM`, () => {
  it("Can set a cookie", async () => {
    const cookieName = "testCookie";
    const cookieValue = "testValue";

    Cookies.set(cookieName, cookieValue);
    const retrievedValue = Cookies.get(cookieName);

    expect(cookieValue).toMatch(retrievedValue ?? "");
  });
});
