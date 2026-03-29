import type { Field } from "@/src/core/schema/schema.model";

export type EntityTemplate = {
  name: string;
  fields: Field[];
};

export const ENTITY_TEMPLATES: EntityTemplate[] = [
  {
    name: "users",
    fields: [
      { name: "id", type: "uuid", nullable: false },
      { name: "email", type: "string", nullable: false },
      { name: "first_name", type: "string", nullable: false },
      { name: "last_name", type: "string", nullable: false },
      { name: "is_active", type: "boolean", nullable: false },
      { name: "created_at", type: "timestamp", nullable: false },
    ],
  },
  {
    name: "organizations",
    fields: [
      { name: "id", type: "uuid", nullable: false },
      { name: "name", type: "string", nullable: false },
      { name: "industry", type: "string", nullable: true },
      { name: "country", type: "string", nullable: false },
      { name: "created_at", type: "timestamp", nullable: false },
    ],
  },
  {
    name: "products",
    fields: [
      { name: "id", type: "uuid", nullable: false },
      { name: "sku", type: "string", nullable: false },
      { name: "name", type: "string", nullable: false },
      { name: "description", type: "text", nullable: true },
      { name: "unit_price", type: "decimal", nullable: false },
      { name: "is_active", type: "boolean", nullable: false },
      { name: "created_at", type: "timestamp", nullable: false },
    ],
  },
  {
    name: "orders",
    fields: [
      { name: "id", type: "uuid", nullable: false },
      { name: "order_number", type: "string", nullable: false },
      { name: "status", type: "enum", nullable: false, enumValues: ["pending", "paid", "shipped", "cancelled"] },
      { name: "currency", type: "string", nullable: false },
      { name: "total_amount", type: "decimal", nullable: false },
      { name: "placed_at", type: "timestamp", nullable: false },
    ],
  },
  {
    name: "order_items",
    fields: [
      { name: "id", type: "uuid", nullable: false },
      { name: "quantity", type: "int", nullable: false },
      { name: "unit_price", type: "decimal", nullable: false },
      { name: "discount_amount", type: "decimal", nullable: true },
      { name: "line_total", type: "decimal", nullable: false },
    ],
  },
  {
    name: "payments",
    fields: [
      { name: "id", type: "uuid", nullable: false },
      { name: "provider", type: "string", nullable: false },
      { name: "status", type: "enum", nullable: false, enumValues: ["initiated", "authorized", "captured", "failed"] },
      { name: "amount", type: "decimal", nullable: false },
      { name: "processed_at", type: "timestamp", nullable: true },
    ],
  },
  {
    name: "addresses",
    fields: [
      { name: "id", type: "uuid", nullable: false },
      { name: "line1", type: "string", nullable: false },
      { name: "line2", type: "string", nullable: true },
      { name: "city", type: "string", nullable: false },
      { name: "state", type: "string", nullable: true },
      { name: "postal_code", type: "string", nullable: false },
      { name: "country", type: "string", nullable: false },
    ],
  },
  {
    name: "subscriptions",
    fields: [
      { name: "id", type: "uuid", nullable: false },
      { name: "plan_code", type: "string", nullable: false },
      { name: "status", type: "enum", nullable: false, enumValues: ["trialing", "active", "past_due", "cancelled"] },
      { name: "started_at", type: "timestamp", nullable: false },
      { name: "ended_at", type: "timestamp", nullable: true },
    ],
  },
  {
    name: "invoices",
    fields: [
      { name: "id", type: "uuid", nullable: false },
      { name: "invoice_number", type: "string", nullable: false },
      { name: "subtotal", type: "decimal", nullable: false },
      { name: "tax_amount", type: "decimal", nullable: false },
      { name: "total_amount", type: "decimal", nullable: false },
      { name: "issued_at", type: "timestamp", nullable: false },
    ],
  },
  {
    name: "sessions",
    fields: [
      { name: "id", type: "uuid", nullable: false },
      { name: "ip_address", type: "string", nullable: false },
      { name: "user_agent", type: "text", nullable: false },
      { name: "expires_at", type: "timestamp", nullable: false },
      { name: "created_at", type: "timestamp", nullable: false },
    ],
  },
  {
    name: "events",
    fields: [
      { name: "id", type: "uuid", nullable: false },
      { name: "event_type", type: "string", nullable: false },
      { name: "source", type: "string", nullable: false },
      { name: "payload", type: "json", nullable: false },
      { name: "occurred_at", type: "timestamp", nullable: false },
    ],
  },
  {
    name: "notifications",
    fields: [
      { name: "id", type: "uuid", nullable: false },
      { name: "channel", type: "enum", nullable: false, enumValues: ["email", "sms", "push"] },
      { name: "subject", type: "string", nullable: false },
      { name: "body", type: "text", nullable: false },
      { name: "sent_at", type: "timestamp", nullable: true },
    ],
  },
];

export const EXTENSION_FIELDS: Field[] = [
  { name: "status", type: "string", nullable: true },
  { name: "metadata", type: "json", nullable: true },
  { name: "source", type: "string", nullable: true },
  { name: "reference_code", type: "string", nullable: true },
  { name: "updated_at", type: "timestamp", nullable: true },
];
