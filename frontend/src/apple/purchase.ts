import type { Account, Software } from "../types";
import { appleRequest } from "./request";
import { buildPlist, parsePlist } from "./plist";
import { mergeCookies, parseCookieHeaders } from "./cookies";
import { purchaseAPIHost } from "./config";

export class PurchaseError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "PurchaseError";
  }
}

export async function purchaseApp(
  account: Account,
  app: Software,
): Promise<{ updatedCookies: typeof account.cookies }> {
  if ((app.price ?? 0) > 0) {
    throw new PurchaseError("Purchasing paid apps is not supported");
  }

  try {
    return await purchaseWithParams(account, app, "STDQ");
  } catch (e) {
    if (
      e instanceof Error &&
      e.message.includes("item is temporarily unavailable")
    ) {
      return await purchaseWithParams(account, app, "GAME");
    }
    throw e;
  }
}

async function purchaseWithParams(
  account: Account,
  app: Software,
  pricingParameters: string,
): Promise<{ updatedCookies: typeof account.cookies }> {
  const deviceId = account.deviceIdentifier;
  const host = purchaseAPIHost(account.pod);
  const path = "/WebObjects/MZFinance.woa/wa/buyProduct";

  const payload: Record<string, any> = {
    appExtVrsId: "0",
    hasAskedToFulfillPreorder: "true",
    buyWithoutAuthorization: "true",
    hasDoneAgeCheck: "true",
    guid: deviceId,
    needDiv: "0",
    origPage: `Software-${app.id}`,
    origPageLocation: "Buy",
    price: "0",
    pricingParameters,
    productType: "C",
    salableAdamId: app.id,
  };

  const plistBody = buildPlist(payload);

  const headers: Record<string, string> = {
    "Content-Type": "application/x-apple-plist",
    "iCloud-DSID": account.directoryServicesIdentifier,
    "X-Dsid": account.directoryServicesIdentifier,
    "X-Apple-Store-Front": `${account.store}-1`,
    "X-Token": account.passwordToken,
  };

  const response = await appleRequest({
    method: "POST",
    host,
    path,
    headers,
    body: plistBody,
    cookies: account.cookies,
  });

  let updatedCookies = account.cookies;
  const setCookies: string[] = [];
  for (const [key, value] of response.rawHeaders) {
    if (key.toLowerCase() === "set-cookie") {
      setCookies.push(value);
    }
  }
  if (setCookies.length > 0) {
    updatedCookies = mergeCookies(
      updatedCookies,
      parseCookieHeaders(setCookies),
    );
  }

  const dict = parsePlist(response.body) as Record<string, any>;

  if (dict.failureType) {
    const failureType = String(dict.failureType);
    const customerMessage = dict.customerMessage as string | undefined;
    switch (failureType) {
      case "2059":
        throw new PurchaseError("Item is temporarily unavailable", "2059");
      case "2034":
      case "2042":
        throw new PurchaseError("Password token is expired", failureType);
      default: {
        if (customerMessage === "Your password has changed.") {
          throw new PurchaseError("Password token is expired", failureType);
        }
        if (customerMessage === "Subscription Required") {
          throw new PurchaseError("Subscription required", failureType);
        }
        // Check for terms page action
        const action = dict.action as Record<string, any> | undefined;
        if (action) {
          const actionUrl = (action.url || action.URL) as string | undefined;
          if (actionUrl && actionUrl.endsWith("termsPage")) {
            throw new PurchaseError(
              `You must accept the Terms & Conditions: ${actionUrl}`,
              failureType,
            );
          }
        }
        throw new PurchaseError(
          customerMessage ?? `Purchase failed: ${failureType}`,
          failureType,
        );
      }
    }
  }

  const jingleDocType = dict.jingleDocType as string | undefined;
  const status = dict.status as number | undefined;

  if (jingleDocType !== "purchaseSuccess" || status !== 0) {
    throw new PurchaseError("Failed to purchase app");
  }

  return { updatedCookies };
}
