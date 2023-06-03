import { Context } from "./context";
import { ZodError } from "zod";
import { experimental_createServerActionHandler } from "@trpc/next/app-dir/server";
import { headers } from "next/headers";
import { initTRPC } from "@trpc/server";
import superjson from "superjson";

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter(opts) {
    const { shape, error } = opts;
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.code === "BAD_REQUEST" && error.cause instanceof ZodError
            ? error.cause.flatten()
            : null,
      },
    };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;

export const createAction = experimental_createServerActionHandler(t, {
  createContext() {
    return {
      headers: Object.fromEntries(headers()),
    };
  },
});
