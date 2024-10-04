DO $$ BEGIN
 ALTER TABLE "comments" ADD CONSTRAINT "comment_parent" FOREIGN KEY ("parent_id") REFERENCES "public"."comments"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
