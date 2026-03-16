/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as agora from "../agora.js";
import type * as callActions from "../callActions.js";
import type * as calls from "../calls.js";
import type * as demo from "../demo.js";
import type * as lib_aiClassification from "../lib/aiClassification.js";
import type * as lib_assignAgent from "../lib/assignAgent.js";
import type * as lib_classifyCall from "../lib/classifyCall.js";
import type * as lib_constants from "../lib/constants.js";
import type * as lib_demoData from "../lib/demoData.js";
import type * as lib_validators from "../lib/validators.js";
import type * as supportAgents from "../supportAgents.js";
import type * as tickets from "../tickets.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  agora: typeof agora;
  callActions: typeof callActions;
  calls: typeof calls;
  demo: typeof demo;
  "lib/aiClassification": typeof lib_aiClassification;
  "lib/assignAgent": typeof lib_assignAgent;
  "lib/classifyCall": typeof lib_classifyCall;
  "lib/constants": typeof lib_constants;
  "lib/demoData": typeof lib_demoData;
  "lib/validators": typeof lib_validators;
  supportAgents: typeof supportAgents;
  tickets: typeof tickets;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
