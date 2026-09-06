import { index, integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const projects = sqliteTable("projects", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  client: text("client").notNull().default(""),
  address: text("address").notNull().default(""),
  contractValue: real("contract_value").notNull().default(0),
  billingType: text("billing_type").notNull().default("undecided"),
  status: text("status").notNull().default("active"),
  progress: integer("progress").notNull().default(0),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const entries = sqliteTable("entries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  people: integer("people"),
  hoursPerPerson: real("hours_per_person"),
  amount: real("amount"),
  workerName: text("worker_name"),
  travelHours: real("travel_hours"),
  invoiced: integer("invoiced", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull(),
}, (table) => [index("idx_entries_project_created").on(table.projectId, table.createdAt)]);

export const priceItems = sqliteTable("price_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  category: text("category").notNull(),
  name: text("name").notNull(),
  unit: text("unit").notNull(),
  costPrice: real("cost_price").notNull().default(0),
  salesPrice: real("sales_price").notNull().default(0),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  updatedAt: text("updated_at").notNull(),
}, (table) => [index("idx_price_items_category_active").on(table.category, table.active)]);

export const quotes = sqliteTable("quotes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("project_id").references(() => projects.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  customerRequest: text("customer_request").notNull().default(""),
  status: text("status").notNull().default("draft"),
  overheadPct: real("overhead_pct").notNull().default(10),
  riskPct: real("risk_pct").notNull().default(5),
  vatPct: real("vat_pct").notNull().default(19),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
}, (table) => [index("idx_quotes_project_status").on(table.projectId, table.status)]);

export const quoteItems = sqliteTable("quote_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  quoteId: integer("quote_id").notNull().references(() => quotes.id, { onDelete: "cascade" }),
  priceItemId: integer("price_item_id").references(() => priceItems.id, { onDelete: "set null" }),
  position: integer("position").notNull().default(1),
  description: text("description").notNull(),
  unit: text("unit").notNull(),
  quantity: real("quantity").notNull().default(0),
  unitCost: real("unit_cost").notNull().default(0),
  unitPrice: real("unit_price").notNull().default(0),
  actualQuantity: real("actual_quantity").notNull().default(0),
  invoicedQuantity: real("invoiced_quantity").notNull().default(0),
}, (table) => [index("idx_quote_items_quote_position").on(table.quoteId, table.position)]);

export const attachments = sqliteTable("attachments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  entryId: integer("entry_id").references(() => entries.id, { onDelete: "set null" }),
  fileName: text("file_name").notNull(),
  contentType: text("content_type").notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  objectKey: text("object_key").notNull().unique(),
  createdAt: text("created_at").notNull(),
}, (table) => [index("idx_attachments_project_entry").on(table.projectId, table.entryId)]);
