CREATE TABLE "accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"supabase_user_id" uuid NOT NULL,
	"privy_wallet_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "accounts_supabase_user_id_unique" UNIQUE("supabase_user_id")
);
--> statement-breakpoint
ALTER TABLE "accounts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "agent_versions" ADD COLUMN "purpose" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "agent_versions" ADD COLUMN "inputs" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "agent_versions" ADD COLUMN "outputs" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "agent_versions" ADD COLUMN "allowed_tools" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "agent_versions" ADD COLUMN "prohibited_actions" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "agent_versions" ADD COLUMN "allowed_payees" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "agents" ADD COLUMN "privy_wallet_id" text;--> statement-breakpoint
ALTER TABLE "agents" ADD CONSTRAINT "agents_creator_id_accounts_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."accounts"("id") ON DELETE restrict ON UPDATE no action;