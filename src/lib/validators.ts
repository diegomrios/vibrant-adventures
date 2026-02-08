import { z } from "zod";

function validateCPF(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, "");
  if (cleaned.length !== 11) return false;
  if (/^(\d)\1+$/.test(cleaned)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(cleaned[i]) * (10 - i);
  let remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== parseInt(cleaned[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(cleaned[i]) * (11 - i);
  remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  return remainder === parseInt(cleaned[10]);
}

function luhnCheck(cardNumber: string): boolean {
  const cleaned = cardNumber.replace(/\s/g, "");
  if (!/^\d{13,19}$/.test(cleaned)) return false;
  let sum = 0;
  let alternate = false;
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let n = parseInt(cleaned[i]);
    if (alternate) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alternate = !alternate;
  }
  return sum % 10 === 0;
}

export const checkoutSchema = z.object({
  fullName: z.string().trim().min(3, "Nome deve ter pelo menos 3 caracteres").max(100),
  cpf: z
    .string()
    .trim()
    .refine((val) => validateCPF(val), { message: "CPF inválido" }),
  cardNumber: z
    .string()
    .trim()
    .refine((val) => luhnCheck(val), { message: "Número do cartão inválido" }),
  expiry: z
    .string()
    .trim()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Formato MM/AA")
    .refine((val) => {
      const [month, year] = val.split("/").map(Number);
      const now = new Date();
      const expDate = new Date(2000 + year, month);
      return expDate > now;
    }, { message: "Cartão expirado" }),
  cvv: z.string().trim().regex(/^\d{3,4}$/, "CVV inválido"),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;
