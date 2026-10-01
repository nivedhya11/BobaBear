CREATE TABLE "app"."first_order_purchase_guards" (
	"id" uuid PRIMARY KEY NOT NULL,
	"customer_auth_user_id" text NOT NULL,
	"checkout_id" uuid NOT NULL,
	"checkout_snapshot_id" uuid NOT NULL,
	"payment_id" uuid,
	"payment_attempt_id" uuid,
	"status" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"consumed_at" timestamp with time zone,
	"released_at" timestamp with time zone,
	CONSTRAINT "first_order_purchase_guards_status_check" CHECK ("app"."first_order_purchase_guards"."status" in ('RESERVED', 'CONSUMED', 'RELEASED')),
	CONSTRAINT "first_order_purchase_guards_payment_attempt_pair_check" CHECK (("app"."first_order_purchase_guards"."payment_id" is null) = ("app"."first_order_purchase_guards"."payment_attempt_id" is null)),
	CONSTRAINT "first_order_purchase_guards_zero_must_be_consumed_check" CHECK ("app"."first_order_purchase_guards"."payment_id" is not null or "app"."first_order_purchase_guards"."status" = 'CONSUMED'),
	CONSTRAINT "first_order_purchase_guards_reserved_timestamps_check" CHECK ("app"."first_order_purchase_guards"."status" <> 'RESERVED' or (
        "app"."first_order_purchase_guards"."consumed_at" is null and "app"."first_order_purchase_guards"."released_at" is null
      )),
	CONSTRAINT "first_order_purchase_guards_consumed_timestamps_check" CHECK ("app"."first_order_purchase_guards"."status" <> 'CONSUMED' or (
        "app"."first_order_purchase_guards"."consumed_at" is not null and "app"."first_order_purchase_guards"."released_at" is null
      )),
	CONSTRAINT "first_order_purchase_guards_released_timestamps_check" CHECK ("app"."first_order_purchase_guards"."status" <> 'RELEASED' or (
        "app"."first_order_purchase_guards"."consumed_at" is null and "app"."first_order_purchase_guards"."released_at" is not null
      ))
);
--> statement-breakpoint
ALTER TABLE "app"."promotion_benefits" DROP CONSTRAINT "promotion_benefits_type_check";--> statement-breakpoint
ALTER TABLE "app"."checkout_snapshot_lines" ALTER COLUMN "source_cart_line_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "app"."checkout_snapshot_lines" ADD COLUMN "line_origin" text DEFAULT 'cart' NOT NULL;--> statement-breakpoint
ALTER TABLE "app"."checkout_snapshot_promotion_effects" ADD COLUMN "snapshot_line_id" uuid;--> statement-breakpoint
ALTER TABLE "app"."checkout_snapshot_promotion_effects" ADD COLUMN "promotion_revision" bigint;--> statement-breakpoint
ALTER TABLE "app"."promotion_benefits" ADD COLUMN "complimentary_product_id" uuid;--> statement-breakpoint
ALTER TABLE "app"."promotion_benefits" ADD COLUMN "complimentary_variant_id" uuid;--> statement-breakpoint
ALTER TABLE "app"."promotions" ADD COLUMN "first_order_only" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "app"."promotions" ADD COLUMN "eligible_fulfilment_modes" text[];--> statement-breakpoint
ALTER TABLE "app"."promotions" ADD COLUMN "eligible_fulfilment_timings" text[];--> statement-breakpoint
ALTER TABLE "app"."promotions" ADD COLUMN "maximum_redemptions" integer;--> statement-breakpoint
ALTER TABLE "app"."promotions" ADD COLUMN "maximum_redemptions_per_customer" integer;--> statement-breakpoint
ALTER TABLE "app"."promotions" ADD COLUMN "complimentary_item" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "app"."first_order_purchase_guards" ADD CONSTRAINT "first_order_purchase_guards_customer_fk" FOREIGN KEY ("customer_auth_user_id") REFERENCES "app"."customer_auth_users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."first_order_purchase_guards" ADD CONSTRAINT "first_order_purchase_guards_checkout_fk" FOREIGN KEY ("checkout_id") REFERENCES "app"."checkouts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."first_order_purchase_guards" ADD CONSTRAINT "first_order_purchase_guards_checkout_snapshot_fk" FOREIGN KEY ("checkout_snapshot_id") REFERENCES "app"."checkout_snapshots"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."first_order_purchase_guards" ADD CONSTRAINT "first_order_purchase_guards_payment_snapshot_fk" FOREIGN KEY ("payment_id","checkout_snapshot_id") REFERENCES "app"."payments"("id","checkout_snapshot_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."first_order_purchase_guards" ADD CONSTRAINT "first_order_purchase_guards_attempt_payment_fk" FOREIGN KEY ("payment_attempt_id","payment_id") REFERENCES "app"."payment_attempts"("id","payment_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "first_order_purchase_guards_active_customer_uidx" ON "app"."first_order_purchase_guards" USING btree ("customer_auth_user_id") WHERE "app"."first_order_purchase_guards"."status" in ('RESERVED', 'CONSUMED');--> statement-breakpoint
CREATE UNIQUE INDEX "first_order_purchase_guards_active_payment_uidx" ON "app"."first_order_purchase_guards" USING btree ("payment_id") WHERE "app"."first_order_purchase_guards"."payment_id" is not null and "app"."first_order_purchase_guards"."status" in ('RESERVED', 'CONSUMED');--> statement-breakpoint
CREATE UNIQUE INDEX "first_order_purchase_guards_zero_snapshot_uidx" ON "app"."first_order_purchase_guards" USING btree ("checkout_snapshot_id") WHERE "app"."first_order_purchase_guards"."payment_id" is null;--> statement-breakpoint
CREATE UNIQUE INDEX "first_order_purchase_guards_attempt_uidx" ON "app"."first_order_purchase_guards" USING btree ("payment_attempt_id") WHERE "app"."first_order_purchase_guards"."payment_attempt_id" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX "checkout_snapshot_lines_id_snapshot_uidx" ON "app"."checkout_snapshot_lines" USING btree ("id","snapshot_id");--> statement-breakpoint
ALTER TABLE "app"."checkout_snapshot_promotion_effects" ADD CONSTRAINT "checkout_snapshot_promotion_effects_line_ownership_fk" FOREIGN KEY ("snapshot_line_id","snapshot_id") REFERENCES "app"."checkout_snapshot_lines"("id","snapshot_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."promotion_benefits" ADD CONSTRAINT "promotion_benefits_complimentary_product_fk" FOREIGN KEY ("complimentary_product_id") REFERENCES "app"."catalog_products"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."promotion_benefits" ADD CONSTRAINT "promotion_benefits_complimentary_variant_fk" FOREIGN KEY ("complimentary_variant_id") REFERENCES "app"."catalog_variants"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "promotions_one_active_complimentary_per_brand_uidx" ON "app"."promotions" USING btree ("brand_id") WHERE "app"."promotions"."status" = 'active' and "app"."promotions"."complimentary_item";--> statement-breakpoint
ALTER TABLE "app"."checkout_snapshot_lines" ADD CONSTRAINT "checkout_snapshot_lines_line_origin_check" CHECK ("app"."checkout_snapshot_lines"."line_origin" in ('cart', 'complimentary_offer'));--> statement-breakpoint
ALTER TABLE "app"."checkout_snapshot_lines" ADD CONSTRAINT "checkout_snapshot_lines_cart_origin_shape_check" CHECK ("app"."checkout_snapshot_lines"."line_origin" <> 'cart' or "app"."checkout_snapshot_lines"."source_cart_line_id" is not null);--> statement-breakpoint
ALTER TABLE "app"."checkout_snapshot_lines" ADD CONSTRAINT "checkout_snapshot_lines_complimentary_origin_shape_check" CHECK ("app"."checkout_snapshot_lines"."line_origin" <> 'complimentary_offer' or (
        "app"."checkout_snapshot_lines"."source_cart_line_id" is null
        and "app"."checkout_snapshot_lines"."quantity" = 1
        and "app"."checkout_snapshot_lines"."line_modifier_adjustments_paise" = 0
        and "app"."checkout_snapshot_lines"."line_bundle_adjustments_paise" = 0
      ));--> statement-breakpoint
ALTER TABLE "app"."promotion_benefits" ADD CONSTRAINT "promotion_benefits_delivery_fee_waiver_shape_check" CHECK ("app"."promotion_benefits"."benefit_type" <> 'delivery_fee_waiver' or (
        "app"."promotion_benefits"."percentage_bps" is null
        and "app"."promotion_benefits"."fixed_amount_paise" is null
        and "app"."promotion_benefits"."maximum_discount_paise" is null
        and "app"."promotion_benefits"."buy_quantity" is null
        and "app"."promotion_benefits"."get_quantity" is null
        and "app"."promotion_benefits"."repeatable" is null
        and "app"."promotion_benefits"."maximum_reward_quantity" is null
        and "app"."promotion_benefits"."complimentary_product_id" is null
        and "app"."promotion_benefits"."complimentary_variant_id" is null
      ));--> statement-breakpoint
ALTER TABLE "app"."promotion_benefits" ADD CONSTRAINT "promotion_benefits_complimentary_item_shape_check" CHECK ("app"."promotion_benefits"."benefit_type" <> 'complimentary_item' or (
        "app"."promotion_benefits"."complimentary_product_id" is not null
        and "app"."promotion_benefits"."complimentary_variant_id" is not null
        and "app"."promotion_benefits"."percentage_bps" is null
        and "app"."promotion_benefits"."fixed_amount_paise" is null
        and "app"."promotion_benefits"."maximum_discount_paise" is null
        and "app"."promotion_benefits"."buy_quantity" is null
        and "app"."promotion_benefits"."get_quantity" is null
        and "app"."promotion_benefits"."repeatable" is null
        and "app"."promotion_benefits"."maximum_reward_quantity" is null
      ));--> statement-breakpoint
ALTER TABLE "app"."promotion_benefits" ADD CONSTRAINT "promotion_benefits_complimentary_refs_check" CHECK ((
        "app"."promotion_benefits"."benefit_type" = 'complimentary_item'
        and "app"."promotion_benefits"."complimentary_product_id" is not null
        and "app"."promotion_benefits"."complimentary_variant_id" is not null
      ) or (
        "app"."promotion_benefits"."benefit_type" <> 'complimentary_item'
        and "app"."promotion_benefits"."complimentary_product_id" is null
        and "app"."promotion_benefits"."complimentary_variant_id" is null
      ));--> statement-breakpoint
ALTER TABLE "app"."promotion_benefits" ADD CONSTRAINT "promotion_benefits_type_check" CHECK ("app"."promotion_benefits"."benefit_type" in (
        'percentage_discount',
        'fixed_amount_discount',
        'buy_x_get_y',
        'delivery_fee_waiver',
        'complimentary_item'
      ));--> statement-breakpoint
ALTER TABLE "app"."promotions" ADD CONSTRAINT "promotions_eligible_fulfilment_modes_check" CHECK ("app"."promotions"."eligible_fulfilment_modes" is null or (
        cardinality("app"."promotions"."eligible_fulfilment_modes") between 1 and 2
        and "app"."promotions"."eligible_fulfilment_modes" <@ array['DELIVERY', 'PICKUP']::text[]
        and cardinality(array_remove("app"."promotions"."eligible_fulfilment_modes", null)) = cardinality("app"."promotions"."eligible_fulfilment_modes")
        and (
          cardinality("app"."promotions"."eligible_fulfilment_modes") = 1
          or "app"."promotions"."eligible_fulfilment_modes"[1] is distinct from "app"."promotions"."eligible_fulfilment_modes"[2]
        )
      ));--> statement-breakpoint
ALTER TABLE "app"."promotions" ADD CONSTRAINT "promotions_eligible_fulfilment_timings_check" CHECK ("app"."promotions"."eligible_fulfilment_timings" is null or (
        cardinality("app"."promotions"."eligible_fulfilment_timings") between 1 and 2
        and "app"."promotions"."eligible_fulfilment_timings" <@ array['ASAP', 'SCHEDULED']::text[]
        and cardinality(array_remove("app"."promotions"."eligible_fulfilment_timings", null)) = cardinality("app"."promotions"."eligible_fulfilment_timings")
        and (
          cardinality("app"."promotions"."eligible_fulfilment_timings") = 1
          or "app"."promotions"."eligible_fulfilment_timings"[1] is distinct from "app"."promotions"."eligible_fulfilment_timings"[2]
        )
      ));--> statement-breakpoint
ALTER TABLE "app"."promotions" ADD CONSTRAINT "promotions_maximum_redemptions_check" CHECK ("app"."promotions"."maximum_redemptions" is null or "app"."promotions"."maximum_redemptions" > 0);--> statement-breakpoint
ALTER TABLE "app"."promotions" ADD CONSTRAINT "promotions_maximum_redemptions_per_customer_check" CHECK ("app"."promotions"."maximum_redemptions_per_customer" is null or "app"."promotions"."maximum_redemptions_per_customer" > 0);