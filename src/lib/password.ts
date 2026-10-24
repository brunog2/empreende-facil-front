import { z } from "zod";

export const passwordRules = [
  {
    id: "length",
    label: "Pelo menos 8 caracteres",
    test: (value: string) => value.length >= 8,
  },
  {
    id: "lower",
    label: "Uma letra minúscula",
    test: (value: string) => /[a-z]/.test(value),
  },
  {
    id: "upper",
    label: "Uma letra maiúscula",
    test: (value: string) => /[A-Z]/.test(value),
  },
  {
    id: "number",
    label: "Um número",
    test: (value: string) => /\d/.test(value),
  },
  {
    id: "special",
    label: "Um caractere especial",
    test: (value: string) => /[^A-Za-z0-9]/.test(value),
  },
] as const;

export function isStrongPassword(value: string) {
  return passwordRules.every((rule) => rule.test(value));
}

export const strongPasswordSchema = z.string().refine(isStrongPassword, {
  message: "A senha ainda não atende aos requisitos",
});
