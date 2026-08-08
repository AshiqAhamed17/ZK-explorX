CREATE TABLE "ecosystem_snapshots" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"date" date NOT NULL,
	"health_score" integer NOT NULL,
	"activity" integer NOT NULL,
	"momentum" integer NOT NULL,
	"community" integer NOT NULL,
	"maintenance" integer NOT NULL,
	"breadth" integer NOT NULL,
	"stars" integer NOT NULL,
	"commits_90d" integer NOT NULL,
	"contributors" integer NOT NULL,
	"releases_last_90d" integer NOT NULL,
	"open_issues" integer NOT NULL,
	"tvl_usd" double precision,
	"adoption_score" integer,
	"partial" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "ecosystem_snapshots_slug_date_idx" ON "ecosystem_snapshots" USING btree ("slug","date");