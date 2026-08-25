import { describe, expect, it } from "vitest";
import {
  ACCOUNT_DELETION_MAIL_BODY,
  ACCOUNT_DELETION_MAIL_SUBJECT,
  RIDE_CLOUD_SUPPORT_EMAIL,
  accountDeletionMailtoContainsSecrets,
  buildAccountDeletionMailto
} from "./account-deletion";

describe("buildAccountDeletionMailto", () => {
  it("ouvre un e-mail vers le support RideCloud avec l'objet attendu", () => {
    const href = buildAccountDeletionMailto();
    expect(href.startsWith(`mailto:${RIDE_CLOUD_SUPPORT_EMAIL}?`)).toBe(true);
    expect(href).toContain(`subject=${encodeURIComponent(ACCOUNT_DELETION_MAIL_SUBJECT)}`);
  });

  it("demande uniquement l'e-mail du compte et une confirmation", () => {
    expect(ACCOUNT_DELETION_MAIL_BODY.toLowerCase()).toContain("adresse e-mail");
    expect(ACCOUNT_DELETION_MAIL_BODY.toLowerCase()).toContain("je confirme");
    expect(accountDeletionMailtoContainsSecrets()).toBe(false);
  });
});
