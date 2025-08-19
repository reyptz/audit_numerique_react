import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(1, "Nom d'utilisateur requis"),
  password: z.string().min(1, "Mot de passe requis"),
});

export const registerSchema = z.object({
  username: z.string().min(1, "Nom d'utilisateur requis"),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  password: z.string().min(8, "Au moins 8 caractères"),
  confirmPassword: z.string().min(8, "Confirmez le mot de passe"),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

export const changePwdSchema = z.object({
  old_password: z.string().min(1, "Ancien mot de passe requis"),
  new_password: z.string().min(8, "Au moins 8 caractères"),
  confirmPassword: z.string().min(8, "Confirmez le mot de passe"),
}).refine((d) => d.new_password === d.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

export const forgotSchema = z.object({
  email: z.string().email("Email invalide"),
});

export const resetSchema = z.object({
  token: z.string().min(6, "Jeton requis"),
  new_password: z.string().min(8, "Au moins 8 caractères"),
  confirmPassword: z.string().min(8, "Confirmez le mot de passe"),
}).refine((d) => d.new_password === d.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});