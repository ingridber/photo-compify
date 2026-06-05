import { z } from "zod";
import { Types } from "mongoose";

export const requiredString = (message: string) =>
    z.string({
        error: (issue) =>
            issue.input === undefined ? message : "Expected a string",
    });

export const objectId = (field = "ID") =>
    z.string({ error: `${field} is required` }).refine(
        (value) => Types.ObjectId.isValid(value),
        `${field} is invalid`,
    );
