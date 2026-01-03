/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as activities from "../activities.js";
import type * as auth from "../auth.js";
import type * as campaigns from "../campaigns.js";
import type * as dashboard from "../dashboard.js";
import type * as healthCenters from "../healthCenters.js";
import type * as http from "../http.js";
import type * as managerAnalytics from "../managerAnalytics.js";
import type * as monthlyStats from "../monthlyStats.js";
import type * as notifications from "../notifications.js";
import type * as posterFeatures from "../posterFeatures.js";
import type * as posterRatings from "../posterRatings.js";
import type * as posters from "../posters.js";
import type * as router from "../router.js";
import type * as userManagement from "../userManagement.js";
import type * as weeklyStats from "../weeklyStats.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  activities: typeof activities;
  auth: typeof auth;
  campaigns: typeof campaigns;
  dashboard: typeof dashboard;
  healthCenters: typeof healthCenters;
  http: typeof http;
  managerAnalytics: typeof managerAnalytics;
  monthlyStats: typeof monthlyStats;
  notifications: typeof notifications;
  posterFeatures: typeof posterFeatures;
  posterRatings: typeof posterRatings;
  posters: typeof posters;
  router: typeof router;
  userManagement: typeof userManagement;
  weeklyStats: typeof weeklyStats;
}>;
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {};
