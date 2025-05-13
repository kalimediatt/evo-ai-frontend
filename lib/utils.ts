/*
┌──────────────────────────────────────────────────────────────────────────────┐
│ @author: Davidson Gomes                                                      │
│ @file: /lib/utils.ts                                                         │
│ Developed by: Davidson Gomes                                                 │
│ Creation date: May 13, 2025                                                  │
│ Contact: contato@evolution-api.com                                           │
├──────────────────────────────────────────────────────────────────────────────┤
│ @copyright © Evolution API 2025. All rights reserved.                        │
│ Licensed under the Apache License, Version 2.0                               │
│                                                                              │
│ You may not use this file except in compliance with the License.             │
│ You may obtain a copy of the License at                                      │
│                                                                              │
│    http://www.apache.org/licenses/LICENSE-2.0                                │
│                                                                              │
│ Unless required by applicable law or agreed to in writing, software          │
│ distributed under the License is distributed on an "AS IS" BASIS,            │
│ WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.     │
│ See the License for the specific language governing permissions and          │
│ limitations under the License.                                               │
├──────────────────────────────────────────────────────────────────────────────┤
│ @important                                                                   │
│ For any future changes to the code in this file, it is recommended to        │
│ include, together with the modification, the information of the developer    │
│ who changed it and the date of modification.                                 │
└──────────────────────────────────────────────────────────────────────────────┘
*/
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getAccessTokenFromCookie() {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(/(?:^|; )access_token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : "";
}

/**
 * Obtém um parâmetro específico da URL atual
 */
export function getQueryParam(param: string): string | null {
  if (typeof window === "undefined") return null;
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

/**
 * Sanitizes the agent name by removing accents,
 * replacing spaces with underscores and removing special characters
 */
export function sanitizeAgentName(name: string): string {
  // Remove accents (normalize to basic form without combined characters)
  const withoutAccents = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // Replace spaces with underscores and remove special characters
  return withoutAccents
    .replace(/\s+/g, "_") // Spaces to underscores
    .replace(/[^a-zA-Z0-9_]/g, ""); // Remove everything that is not alphanumeric or underscore
}

/**
 * Escapes braces in instruction prompts to avoid interpretation errors
 * as context variables in Python. Uses a more robust approach to ensure
 * Python doesn't interpret any brace patterns as variables.
 */
export function escapePromptBraces(text: string): string {
  if (!text) return text;
  
  // replace { per [ and } per ]
  return text.replace(/\{/g, "[").replace(/\}/g, "]");
}
