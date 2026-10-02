CREATE TABLE "app"."cart_checkout_activations" (
	"activation_id" uuid PRIMARY KEY NOT NULL,
	"cart_id" uuid NOT NULL,
	"checkout_journey_key" uuid,
	"checkout_id" uuid,
	"watermark_sequence" bigint,
	"occurred_at" timestamp with time zone NOT NULL,
	"review_reach_fact_id" uuid,
	CONSTRAINT "cart_checkout_activations_watermark_nonnegative_check" CHECK ("app"."cart_checkout_activations"."watermark_sequence" is null or "app"."cart_checkout_activations"."watermark_sequence" >= 0)
);
--> statement-breakpoint
CREATE TABLE "app"."checkout_journey_facts" (
	"fact_id" uuid PRIMARY KEY NOT NULL,
	"checkout_journey_key" uuid NOT NULL,
	"fact_kind" text NOT NULL,
	"journey_sequence" bigint NOT NULL,
	"occurred_at" timestamp with time zone NOT NULL,
	"idempotency_key" "bytea" NOT NULL,
	"evaluation_id" uuid,
	"activation_id" uuid,
	"result_fingerprint" "bytea",
	"presentation_class" text,
	"coarse_outcome" text,
	CONSTRAINT "checkout_journey_facts_sequence_positive_check" CHECK ("app"."checkout_journey_facts"."journey_sequence" > 0),
	CONSTRAINT "checkout_journey_facts_idempotency_key_present_check" CHECK (octet_length("app"."checkout_journey_facts"."idempotency_key") > 0),
	CONSTRAINT "checkout_journey_facts_fingerprint_sha256_check" CHECK ("app"."checkout_journey_facts"."result_fingerprint" is null or octet_length("app"."checkout_journey_facts"."result_fingerprint") = 32),
	CONSTRAINT "checkout_journey_facts_coarse_outcome_token_check" CHECK ("app"."checkout_journey_facts"."coarse_outcome" is null or "app"."checkout_journey_facts"."coarse_outcome" ~ '^[A-Z][A-Z0-9_]*$'),
	CONSTRAINT "checkout_journey_facts_kind_shape_check" CHECK ((
        (
          "app"."checkout_journey_facts"."fact_kind" = 'REVIEW_PRESENTED'
          and "app"."checkout_journey_facts"."evaluation_id" is not null
          and "app"."checkout_journey_facts"."presentation_class" is not null
          and "app"."checkout_journey_facts"."presentation_class" in (
  'CHANGED_TOTAL_RECOVERY',
  'COMPLIMENTARY_ITEM',
  'EQUAL_PAYABLE_SELECTED',
  'COUPON_SELECTED',
  'EQUAL_PAYABLE_NOT_SELECTED',
  'COUPON_VALID_NOT_SELECTED',
  'THRESHOLD_PROGRESS',
  'AUTOMATIC_SAVING',
  'NO_OFFER'
)
        )
        or
        (
          "app"."checkout_journey_facts"."fact_kind" = 'COUPON_ATTEMPT'
          and "app"."checkout_journey_facts"."presentation_class" is null
        )
        or
        (
          "app"."checkout_journey_facts"."fact_kind" = 'COMMERCIAL_STATE_CHANGE'
          and "app"."checkout_journey_facts"."presentation_class" is null
          and "app"."checkout_journey_facts"."result_fingerprint" is not null
        )
        or
        (
          "app"."checkout_journey_facts"."fact_kind" = 'CART_REVIEW_REACH'
          and "app"."checkout_journey_facts"."presentation_class" is null
          and "app"."checkout_journey_facts"."activation_id" is not null
          and "app"."checkout_journey_facts"."evaluation_id" is not null
        )
        or
        (
          "app"."checkout_journey_facts"."fact_kind" = 'REVIEW_TO_PAYMENT'
          and "app"."checkout_journey_facts"."presentation_class" is null
        )
        or
        (
          "app"."checkout_journey_facts"."fact_kind" = 'PAYMENT_ATTEMPT'
          and "app"."checkout_journey_facts"."presentation_class" is null
        )
        or
        (
          "app"."checkout_journey_facts"."fact_kind" = 'DIRECT_ORDER_COMPLETION'
          and "app"."checkout_journey_facts"."presentation_class" is null
        )
      )),
	CONSTRAINT "checkout_journey_facts_kind_check" CHECK ("app"."checkout_journey_facts"."fact_kind" in (
  'REVIEW_PRESENTED',
  'COUPON_ATTEMPT',
  'COMMERCIAL_STATE_CHANGE',
  'CART_REVIEW_REACH',
  'REVIEW_TO_PAYMENT',
  'PAYMENT_ATTEMPT',
  'DIRECT_ORDER_COMPLETION'
))
);
--> statement-breakpoint
CREATE TABLE "app"."checkout_journey_heads" (
	"checkout_journey_key" uuid PRIMARY KEY NOT NULL,
	"next_sequence" bigint NOT NULL,
	"closed_at" timestamp with time zone,
	CONSTRAINT "checkout_journey_heads_next_sequence_positive_check" CHECK ("app"."checkout_journey_heads"."next_sequence" > 0)
);
--> statement-breakpoint
CREATE TABLE "app"."checkout_review_surface_tokens" (
	"token_sha256" "bytea" PRIMARY KEY NOT NULL,
	"checkout_id" uuid NOT NULL,
	"cart_id" uuid NOT NULL,
	CONSTRAINT "checkout_review_surface_tokens_sha256_check" CHECK (octet_length("app"."checkout_review_surface_tokens"."token_sha256") = 32)
);
--> statement-breakpoint
CREATE TABLE "app"."commercial_command_origins" (
	"source_command_id" uuid PRIMARY KEY NOT NULL,
	"origin_kind" text NOT NULL,
	"cart_id" uuid NOT NULL,
	"checkout_id" uuid,
	"checkout_journey_key" uuid,
	"cart_origin_ordinal" bigint NOT NULL,
	"resolved_change_fact_id" uuid,
	"resolution" text,
	CONSTRAINT "commercial_command_origins_kind_check" CHECK ("app"."commercial_command_origins"."origin_kind" in (
        'COUPON_APPLY',
        'COUPON_REPLACE',
        'COUPON_REMOVE',
        'FULFILMENT_CHANGE',
        'STALE_RECOVERY'
      )),
	CONSTRAINT "commercial_command_origins_ordinal_positive_check" CHECK ("app"."commercial_command_origins"."cart_origin_ordinal" > 0),
	CONSTRAINT "commercial_command_origins_resolution_check" CHECK ((
        "app"."commercial_command_origins"."resolution" is null
        or (
          "app"."commercial_command_origins"."resolution" in ('NO_RESULT_CHANGE', 'JOURNEY_BOUNDARY')
          and "app"."commercial_command_origins"."resolved_change_fact_id" is null
        )
      ))
);
--> statement-breakpoint
CREATE TABLE "app"."commercial_command_results" (
	"source_command_id" uuid PRIMARY KEY NOT NULL,
	"cart_id" uuid NOT NULL,
	"surface" text NOT NULL,
	"coarse_outcome" text NOT NULL,
	"payable_changed_vs_valid_alternative" boolean,
	"occurred_at" timestamp with time zone NOT NULL,
	"checkout_journey_key" uuid,
	CONSTRAINT "commercial_command_results_surface_check" CHECK ("app"."commercial_command_results"."surface" in ('CART', 'CHECKOUT_REVIEW')),
	CONSTRAINT "commercial_command_results_coarse_outcome_token_check" CHECK ("app"."commercial_command_results"."coarse_outcome" ~ '^[A-Z][A-Z0-9_]*$')
);
--> statement-breakpoint
CREATE TABLE "app"."commercial_evaluations" (
	"evaluation_id" uuid PRIMARY KEY NOT NULL,
	"cart_id" uuid NOT NULL,
	"checkout_id" uuid,
	"checkout_journey_key" uuid,
	"surface_scope" text NOT NULL,
	"result_fingerprint" "bytea" NOT NULL,
	"expected_components" jsonb NOT NULL,
	"expected_total_saved_paise" bigint NOT NULL,
	"expected_progress_present" boolean NOT NULL,
	"expected_progress_remaining_paise" bigint,
	"expected_coarse_shape" text NOT NULL,
	"explanation_reason_class" text NOT NULL,
	"complimentary_variant_id" uuid,
	"projected_complimentary_line_sha256" "bytea",
	"server_explanation_integrity" boolean NOT NULL,
	"cart_origin_ordinal_inclusive" bigint,
	"occurrence_ordinal" bigint NOT NULL,
	"occurred_at" timestamp with time zone NOT NULL,
	CONSTRAINT "commercial_evaluations_surface_scope_check" CHECK ((
        (
          "app"."commercial_evaluations"."surface_scope" = 'CART'
          and "app"."commercial_evaluations"."checkout_id" is null
        )
        or
        (
          "app"."commercial_evaluations"."surface_scope" = 'CHECKOUT'
          and "app"."commercial_evaluations"."checkout_id" is not null
        )
      )),
	CONSTRAINT "commercial_evaluations_fingerprint_sha256_check" CHECK (octet_length("app"."commercial_evaluations"."result_fingerprint") = 32),
	CONSTRAINT "commercial_evaluations_components_array_check" CHECK (jsonb_typeof("app"."commercial_evaluations"."expected_components") = 'array'),
	CONSTRAINT "commercial_evaluations_total_saved_nonnegative_check" CHECK ("app"."commercial_evaluations"."expected_total_saved_paise" >= 0),
	CONSTRAINT "commercial_evaluations_progress_check" CHECK ((
        (
          "app"."commercial_evaluations"."expected_progress_present" = false
          and "app"."commercial_evaluations"."expected_progress_remaining_paise" is null
        )
        or
        (
          "app"."commercial_evaluations"."expected_progress_present" = true
          and "app"."commercial_evaluations"."expected_progress_remaining_paise" is not null
          and "app"."commercial_evaluations"."expected_progress_remaining_paise" >= 0
        )
      )),
	CONSTRAINT "commercial_evaluations_coarse_shape_check" CHECK ("app"."commercial_evaluations"."expected_coarse_shape" in (
  'NONE',
  'AUTOMATIC_SAVING',
  'ORDER_SAVING',
  'DELIVERY_SAVING',
  'BOTH_SAVINGS',
  'COMPLIMENTARY_LINE',
  'COUPON_SELECTED',
  'COUPON_VALID_NOT_SELECTED',
  'EQUAL_PAYABLE_SELECTED',
  'EQUAL_PAYABLE_NOT_SELECTED',
  'THRESHOLD_PROGRESS'
)),
	CONSTRAINT "commercial_evaluations_reason_class_token_check" CHECK ("app"."commercial_evaluations"."explanation_reason_class" ~ '^[A-Z][A-Z0-9_]*$'),
	CONSTRAINT "commercial_evaluations_complimentary_line_sha256_check" CHECK ("app"."commercial_evaluations"."projected_complimentary_line_sha256" is null or octet_length("app"."commercial_evaluations"."projected_complimentary_line_sha256") = 32),
	CONSTRAINT "commercial_evaluations_origin_ordinal_positive_check" CHECK ("app"."commercial_evaluations"."cart_origin_ordinal_inclusive" is null or "app"."commercial_evaluations"."cart_origin_ordinal_inclusive" > 0),
	CONSTRAINT "commercial_evaluations_occurrence_ordinal_positive_check" CHECK ("app"."commercial_evaluations"."occurrence_ordinal" > 0)
);
--> statement-breakpoint
CREATE TABLE "app"."commercial_presentation_observations" (
	"evaluation_id" uuid NOT NULL,
	"surface" text NOT NULL,
	"observed_components" jsonb NOT NULL,
	"observed_progress_present" boolean NOT NULL,
	"observed_progress_remaining_paise" bigint,
	"observed_coarse_shape" text NOT NULL,
	"observed_complimentary_present" boolean NOT NULL,
	"observed_complimentary_line_sha256" "bytea",
	"server_presentation_match" boolean,
	"mismatch_flags" text[] NOT NULL,
	"occurred_at" timestamp with time zone NOT NULL,
	CONSTRAINT "commercial_presentation_observations_surface_check" CHECK ("app"."commercial_presentation_observations"."surface" in ('CART', 'CHECKOUT_REVIEW')),
	CONSTRAINT "commercial_presentation_observations_components_array_check" CHECK (jsonb_typeof("app"."commercial_presentation_observations"."observed_components") = 'array'),
	CONSTRAINT "commercial_presentation_observations_progress_check" CHECK ((
        (
          "app"."commercial_presentation_observations"."observed_progress_present" = false
          and "app"."commercial_presentation_observations"."observed_progress_remaining_paise" is null
        )
        or
        (
          "app"."commercial_presentation_observations"."observed_progress_present" = true
          and "app"."commercial_presentation_observations"."observed_progress_remaining_paise" is not null
          and "app"."commercial_presentation_observations"."observed_progress_remaining_paise" >= 0
        )
      )),
	CONSTRAINT "commercial_presentation_observations_coarse_shape_check" CHECK ("app"."commercial_presentation_observations"."observed_coarse_shape" in (
  'NONE',
  'AUTOMATIC_SAVING',
  'ORDER_SAVING',
  'DELIVERY_SAVING',
  'BOTH_SAVINGS',
  'COMPLIMENTARY_LINE',
  'COUPON_SELECTED',
  'COUPON_VALID_NOT_SELECTED',
  'EQUAL_PAYABLE_SELECTED',
  'EQUAL_PAYABLE_NOT_SELECTED',
  'THRESHOLD_PROGRESS'
)),
	CONSTRAINT "commercial_presentation_observations_complimentary_line_sha256_check" CHECK ("app"."commercial_presentation_observations"."observed_complimentary_line_sha256" is null or octet_length("app"."commercial_presentation_observations"."observed_complimentary_line_sha256") = 32),
	CONSTRAINT "commercial_presentation_observations_mismatch_flags_check" CHECK ("app"."commercial_presentation_observations"."mismatch_flags" <@ ARRAY[
  'WRONG_AMOUNT',
  'OMITTED_ROW',
  'EXTRA_ROW',
  'WRONG_COMPONENT',
  'WRONG_COMPLIMENTARY_ITEM',
  'WRONG_TOTAL_SAVED',
  'WRONG_ZERO_STATE',
  'WRONG_SHAPE',
  'PROGRESS_MISMATCH'
]::text[])
);
--> statement-breakpoint
CREATE TABLE "app"."measurement_report_snapshots" (
	"metric" text NOT NULL,
	"window_start" timestamp with time zone NOT NULL,
	"window_end" timestamp with time zone NOT NULL,
	"report_as_of" timestamp with time zone NOT NULL,
	CONSTRAINT "measurement_report_snapshots_publication_pk" PRIMARY KEY("metric","window_start","window_end","report_as_of"),
	CONSTRAINT "measurement_report_snapshots_metric_check" CHECK ("app"."measurement_report_snapshots"."metric" ~ '^[A-Z][A-Z0-9_]*$'),
	CONSTRAINT "measurement_report_snapshots_window_check" CHECK ("app"."measurement_report_snapshots"."window_start" < "app"."measurement_report_snapshots"."window_end")
);
--> statement-breakpoint
CREATE TABLE "app"."offer_result_views" (
	"evaluation_id" uuid PRIMARY KEY NOT NULL,
	"surface" text NOT NULL,
	"occurred_at" timestamp with time zone NOT NULL,
	CONSTRAINT "offer_result_views_surface_check" CHECK ("app"."offer_result_views"."surface" in ('CART', 'CHECKOUT_REVIEW'))
);
--> statement-breakpoint
ALTER TABLE "app"."checkouts" ADD COLUMN "checkout_journey_key" uuid;--> statement-breakpoint
ALTER TABLE "app"."checkouts" ADD COLUMN "cart_causal_ordinal" bigint;--> statement-breakpoint
ALTER TABLE "app"."cart_checkout_activations" ADD CONSTRAINT "cart_checkout_activations_cart_fk" FOREIGN KEY ("cart_id") REFERENCES "app"."carts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."cart_checkout_activations" ADD CONSTRAINT "cart_checkout_activations_checkout_fk" FOREIGN KEY ("checkout_id") REFERENCES "app"."checkouts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."cart_checkout_activations" ADD CONSTRAINT "cart_checkout_activations_journey_head_fk" FOREIGN KEY ("checkout_journey_key") REFERENCES "app"."checkout_journey_heads"("checkout_journey_key") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."cart_checkout_activations" ADD CONSTRAINT "cart_checkout_activations_review_reach_fact_fk" FOREIGN KEY ("review_reach_fact_id") REFERENCES "app"."checkout_journey_facts"("fact_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."checkout_journey_facts" ADD CONSTRAINT "checkout_journey_facts_head_fk" FOREIGN KEY ("checkout_journey_key") REFERENCES "app"."checkout_journey_heads"("checkout_journey_key") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."checkout_journey_facts" ADD CONSTRAINT "checkout_journey_facts_evaluation_fk" FOREIGN KEY ("evaluation_id") REFERENCES "app"."commercial_evaluations"("evaluation_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."checkout_review_surface_tokens" ADD CONSTRAINT "checkout_review_surface_tokens_checkout_fk" FOREIGN KEY ("checkout_id") REFERENCES "app"."checkouts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."checkout_review_surface_tokens" ADD CONSTRAINT "checkout_review_surface_tokens_cart_fk" FOREIGN KEY ("cart_id") REFERENCES "app"."carts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."commercial_command_origins" ADD CONSTRAINT "commercial_command_origins_cart_fk" FOREIGN KEY ("cart_id") REFERENCES "app"."carts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."commercial_command_origins" ADD CONSTRAINT "commercial_command_origins_checkout_fk" FOREIGN KEY ("checkout_id") REFERENCES "app"."checkouts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."commercial_command_origins" ADD CONSTRAINT "commercial_command_origins_journey_head_fk" FOREIGN KEY ("checkout_journey_key") REFERENCES "app"."checkout_journey_heads"("checkout_journey_key") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."commercial_command_origins" ADD CONSTRAINT "commercial_command_origins_change_fact_fk" FOREIGN KEY ("resolved_change_fact_id") REFERENCES "app"."checkout_journey_facts"("fact_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."commercial_command_results" ADD CONSTRAINT "commercial_command_results_cart_fk" FOREIGN KEY ("cart_id") REFERENCES "app"."carts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."commercial_evaluations" ADD CONSTRAINT "commercial_evaluations_cart_fk" FOREIGN KEY ("cart_id") REFERENCES "app"."carts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."commercial_evaluations" ADD CONSTRAINT "commercial_evaluations_checkout_fk" FOREIGN KEY ("checkout_id") REFERENCES "app"."checkouts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."commercial_evaluations" ADD CONSTRAINT "commercial_evaluations_journey_head_fk" FOREIGN KEY ("checkout_journey_key") REFERENCES "app"."checkout_journey_heads"("checkout_journey_key") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."commercial_evaluations" ADD CONSTRAINT "commercial_evaluations_complimentary_variant_fk" FOREIGN KEY ("complimentary_variant_id") REFERENCES "app"."catalog_variants"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."commercial_presentation_observations" ADD CONSTRAINT "commercial_presentation_observations_evaluation_fk" FOREIGN KEY ("evaluation_id") REFERENCES "app"."commercial_evaluations"("evaluation_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."offer_result_views" ADD CONSTRAINT "offer_result_views_evaluation_fk" FOREIGN KEY ("evaluation_id") REFERENCES "app"."commercial_evaluations"("evaluation_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "cart_checkout_activations_cart_id_idx" ON "app"."cart_checkout_activations" USING btree ("cart_id");--> statement-breakpoint
CREATE INDEX "cart_checkout_activations_checkout_id_idx" ON "app"."cart_checkout_activations" USING btree ("checkout_id");--> statement-breakpoint
CREATE UNIQUE INDEX "checkout_journey_facts_journey_sequence_uidx" ON "app"."checkout_journey_facts" USING btree ("checkout_journey_key","journey_sequence");--> statement-breakpoint
CREATE UNIQUE INDEX "checkout_journey_facts_review_presented_uidx" ON "app"."checkout_journey_facts" USING btree ("checkout_journey_key","evaluation_id") WHERE "app"."checkout_journey_facts"."fact_kind" = 'REVIEW_PRESENTED';--> statement-breakpoint
CREATE UNIQUE INDEX "checkout_journey_facts_coupon_attempt_uidx" ON "app"."checkout_journey_facts" USING btree ("idempotency_key") WHERE "app"."checkout_journey_facts"."fact_kind" = 'COUPON_ATTEMPT';--> statement-breakpoint
CREATE UNIQUE INDEX "checkout_journey_facts_commercial_state_change_uidx" ON "app"."checkout_journey_facts" USING btree ("idempotency_key") WHERE "app"."checkout_journey_facts"."fact_kind" = 'COMMERCIAL_STATE_CHANGE';--> statement-breakpoint
CREATE UNIQUE INDEX "checkout_journey_facts_cart_review_reach_uidx" ON "app"."checkout_journey_facts" USING btree ("activation_id") WHERE "app"."checkout_journey_facts"."fact_kind" = 'CART_REVIEW_REACH';--> statement-breakpoint
CREATE UNIQUE INDEX "checkout_journey_facts_review_to_payment_uidx" ON "app"."checkout_journey_facts" USING btree ("idempotency_key") WHERE "app"."checkout_journey_facts"."fact_kind" = 'REVIEW_TO_PAYMENT';--> statement-breakpoint
CREATE UNIQUE INDEX "checkout_journey_facts_payment_attempt_uidx" ON "app"."checkout_journey_facts" USING btree ("idempotency_key") WHERE "app"."checkout_journey_facts"."fact_kind" = 'PAYMENT_ATTEMPT';--> statement-breakpoint
CREATE UNIQUE INDEX "checkout_journey_facts_direct_order_completion_uidx" ON "app"."checkout_journey_facts" USING btree ("checkout_journey_key") WHERE "app"."checkout_journey_facts"."fact_kind" = 'DIRECT_ORDER_COMPLETION';--> statement-breakpoint
CREATE INDEX "checkout_journey_facts_evaluation_id_idx" ON "app"."checkout_journey_facts" USING btree ("evaluation_id");--> statement-breakpoint
CREATE INDEX "checkout_review_surface_tokens_checkout_id_idx" ON "app"."checkout_review_surface_tokens" USING btree ("checkout_id");--> statement-breakpoint
CREATE INDEX "checkout_review_surface_tokens_cart_id_idx" ON "app"."checkout_review_surface_tokens" USING btree ("cart_id");--> statement-breakpoint
CREATE INDEX "commercial_command_origins_cart_id_idx" ON "app"."commercial_command_origins" USING btree ("cart_id");--> statement-breakpoint
CREATE INDEX "commercial_command_origins_checkout_id_idx" ON "app"."commercial_command_origins" USING btree ("checkout_id");--> statement-breakpoint
CREATE INDEX "commercial_command_results_cart_id_idx" ON "app"."commercial_command_results" USING btree ("cart_id");--> statement-breakpoint
CREATE UNIQUE INDEX "commercial_evaluations_cart_occurrence_uidx" ON "app"."commercial_evaluations" USING btree ("cart_id","result_fingerprint","occurrence_ordinal") WHERE "app"."commercial_evaluations"."surface_scope" = 'CART';--> statement-breakpoint
CREATE UNIQUE INDEX "commercial_evaluations_checkout_occurrence_uidx" ON "app"."commercial_evaluations" USING btree ("checkout_id","result_fingerprint","occurrence_ordinal") WHERE "app"."commercial_evaluations"."surface_scope" = 'CHECKOUT';--> statement-breakpoint
CREATE INDEX "commercial_evaluations_cart_id_idx" ON "app"."commercial_evaluations" USING btree ("cart_id");--> statement-breakpoint
CREATE INDEX "commercial_evaluations_checkout_id_idx" ON "app"."commercial_evaluations" USING btree ("checkout_id");--> statement-breakpoint
CREATE UNIQUE INDEX "commercial_presentation_observations_evaluation_surface_uidx" ON "app"."commercial_presentation_observations" USING btree ("evaluation_id","surface");--> statement-breakpoint
CREATE UNIQUE INDEX "checkouts_cart_causal_ordinal_uidx" ON "app"."checkouts" USING btree ("cart_id","cart_causal_ordinal") WHERE "app"."checkouts"."cart_causal_ordinal" is not null;--> statement-breakpoint
CREATE INDEX "checkouts_checkout_journey_key_idx" ON "app"."checkouts" USING btree ("checkout_journey_key");--> statement-breakpoint
ALTER TABLE "app"."checkouts" ADD CONSTRAINT "checkouts_cart_causal_ordinal_positive_check" CHECK ("app"."checkouts"."cart_causal_ordinal" is null or "app"."checkouts"."cart_causal_ordinal" > 0);
--> statement-breakpoint
CREATE OR REPLACE FUNCTION app.enforce_measurement_surface_scope()
RETURNS trigger
LANGUAGE plpgsql
AS $fn$
DECLARE
  scope text;
BEGIN
  SELECT surface_scope INTO scope
  FROM app.commercial_evaluations
  WHERE evaluation_id = NEW.evaluation_id;
  IF scope IS NULL THEN
    RAISE EXCEPTION 'measurement surface requires an evaluation'
      USING ERRCODE = '23503';
  END IF;
  IF scope = 'CART' AND NEW.surface IS DISTINCT FROM 'CART' THEN
    RAISE EXCEPTION 'CART evaluation accepts surface CART only'
      USING ERRCODE = '23514';
  END IF;
  IF scope = 'CHECKOUT' AND NEW.surface NOT IN ('CART', 'CHECKOUT_REVIEW') THEN
    RAISE EXCEPTION 'CHECKOUT evaluation rejects this surface'
      USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$fn$;--> statement-breakpoint
CREATE TRIGGER commercial_presentation_observations_surface_scope
BEFORE INSERT OR UPDATE ON app.commercial_presentation_observations
FOR EACH ROW
EXECUTE FUNCTION app.enforce_measurement_surface_scope();--> statement-breakpoint
CREATE TRIGGER offer_result_views_surface_scope
BEFORE INSERT OR UPDATE ON app.offer_result_views
FOR EACH ROW
EXECUTE FUNCTION app.enforce_measurement_surface_scope();--> statement-breakpoint
CREATE OR REPLACE FUNCTION app.measurement_report_snapshots_forbid_update()
RETURNS trigger
LANGUAGE plpgsql
AS $fn$
BEGIN
  RAISE EXCEPTION 'measurement_report_snapshots cannot be updated'
    USING ERRCODE = '23514';
END;
$fn$;--> statement-breakpoint
CREATE TRIGGER measurement_report_snapshots_forbid_update
BEFORE UPDATE ON app.measurement_report_snapshots
FOR EACH ROW
EXECUTE FUNCTION app.measurement_report_snapshots_forbid_update();
