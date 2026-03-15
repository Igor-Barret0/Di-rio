import { Request, Response, NextFunction } from "express";
import { validationResult, body } from "express-validator";
import { AppError } from "./errorHandler";

export function validate(req: Request, _res: Response, next: NextFunction) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors
      .array()
      .map((e) => e.msg)
      .join(", ");
    return next(new AppError(422, message));
  }
  next();
}

export const registerValidators = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().normalizeEmail().withMessage("Invalid email"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
];

export const loginValidators = [
  body("email").isEmail().normalizeEmail().withMessage("Invalid email"),
  body("password").notEmpty().withMessage("Password is required"),
];

export const moodValidators = [
  body("mood")
    .isIn(["happy", "neutral", "sad", "anxious", "angry", "excited", "tired"])
    .withMessage("Invalid mood type"),
  body("note")
    .optional()
    .isString()
    .isLength({ max: 2000 })
    .withMessage("Note too long (max 2000 chars)"),
  body("dateISO")
    .optional()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage("Invalid date format (use YYYY-MM-DD)"),
];

export const changePasswordValidators = [
  body("currentPassword").notEmpty().withMessage("Current password is required"),
  body("newPassword")
    .isLength({ min: 8 })
    .withMessage("New password must be at least 8 characters"),
];
