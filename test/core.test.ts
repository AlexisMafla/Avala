import { describe, expect, it } from "vitest";
import {
  validateArCbu,
  validateArCuit,
  validateArDni,
  validateBankAccount,
  validateCoCedula,
  validateCoNit,
  validateEsCif,
  validateEsDniNie,
  validateIban,
  validateTaxId,
} from "../src/core/index.js";

describe("Spanish DNI / NIE", () => {
  it("accepts a valid DNI", () => {
    expect(validateEsDniNie("12345678Z").valid).toBe(true);
  });
  it("rejects a DNI with wrong letter", () => {
    const r = validateEsDniNie("12345678A");
    expect(r.valid).toBe(false);
    expect(r.reason).toBe("invalid_checksum");
  });
  it("accepts a valid NIE", () => {
    expect(validateEsDniNie("X1234567L").valid).toBe(true);
  });
  it("rejects malformed input", () => {
    expect(validateEsDniNie("ABC").valid).toBe(false);
  });
});

describe("Spanish CIF", () => {
  it("accepts a valid CIF", () => {
    expect(validateEsCif("A58818501").valid).toBe(true);
    expect(validateEsCif("B12345674").valid).toBe(true);
  });
  it("rejects a CIF with wrong control character", () => {
    const r = validateEsCif("B12345670");
    expect(r.valid).toBe(false);
    expect(r.reason).toBe("invalid_checksum");
  });
  it("rejects malformed CIF", () => {
    expect(validateEsCif("Z1234567A").valid).toBe(false);
  });
});

describe("Colombian cédula", () => {
  it("accepts a valid cédula format", () => {
    const r = validateCoCedula("1234567890");
    expect(r.valid).toBe(true);
    expect(r.details?.note).toContain("no official checksum");
  });
  it("rejects too short cédula", () => {
    expect(validateCoCedula("12345").valid).toBe(false);
  });
});

describe("Argentine DNI", () => {
  it("accepts a valid DNI format", () => {
    const r = validateArDni("30123456");
    expect(r.valid).toBe(true);
    expect(r.details?.note).toContain("no official checksum");
  });
  it("rejects non-numeric DNI", () => {
    expect(validateArDni("3012345A").valid).toBe(false);
  });
});

describe("Colombian NIT", () => {
  it("accepts a valid NIT with verification digit", () => {
    expect(validateCoNit("830084433-7").valid).toBe(true);
  });
  it("accepts the same NIT without a dash", () => {
    expect(validateCoNit("8300844337").valid).toBe(true);
  });
  it("rejects a wrong verification digit", () => {
    const r = validateCoNit("830084433-1");
    expect(r.valid).toBe(false);
    expect(r.reason).toBe("invalid_checksum");
  });
});

describe("Argentine CUIT / CUIL", () => {
  it("accepts a valid CUIT", () => {
    expect(validateArCuit("20-12345678-6").valid).toBe(true);
  });
  it("rejects a wrong check digit", () => {
    expect(validateArCuit("20-12345678-9").valid).toBe(false);
  });
});

describe("Argentine CBU", () => {
  it("accepts a valid CBU", () => {
    expect(validateArCbu("0070099300000041534001").valid).toBe(true);
  });
  it("rejects a tampered CBU", () => {
    expect(validateArCbu("0070099300000041534009").valid).toBe(false);
  });
  it("rejects wrong length", () => {
    expect(validateArCbu("123").valid).toBe(false);
  });
});

describe("IBAN", () => {
  it("accepts a valid Spanish IBAN", () => {
    expect(validateIban("ES9121000418450200051332").valid).toBe(true);
  });
  it("accepts a valid GB IBAN", () => {
    expect(validateIban("GB82WEST12345698765432").valid).toBe(true);
  });
  it("rejects when country enforcement fails", () => {
    expect(validateIban("GB82WEST12345698765432", "ES").valid).toBe(false);
  });
  it("rejects a tampered IBAN", () => {
    expect(validateIban("ES9121000418450200051333").valid).toBe(false);
  });
});

describe("high-level dispatchers", () => {
  it("validateTaxId routes by country", () => {
    expect(validateTaxId("ES", "12345678Z").valid).toBe(true);
    expect(validateTaxId("CO", "830084433-7").valid).toBe(true);
    expect(validateTaxId("AR", "20-12345678-6").valid).toBe(true);
  });
  it("validateTaxId routes by type", () => {
    expect(validateTaxId("ES", "A58818501", "cif").valid).toBe(true);
    expect(validateTaxId("CO", "1234567890", "cedula").valid).toBe(true);
    expect(validateTaxId("AR", "30123456", "dni").valid).toBe(true);
  });
  it("validateBankAccount handles ES (IBAN) and AR (CBU)", () => {
    expect(validateBankAccount("ES", "ES9121000418450200051332").valid).toBe(true);
    expect(validateBankAccount("AR", "0070099300000041534001").valid).toBe(true);
  });
  it("validateBankAccount marks CO as unsupported", () => {
    const r = validateBankAccount("CO", "123");
    expect(r.valid).toBe(false);
    expect(r.reason).toBe("unsupported");
  });
});
