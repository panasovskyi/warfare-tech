ALTER TABLE "articles" ADD COLUMN     "reading_time" INTEGER;

UPDATE "articles"
SET "reading_time" = GREATEST(
  1,
  CEIL(
    array_length(regexp_split_to_array(btrim("body", E' \t\r\n'), '\s+'), 1) / 250.0
  )::INTEGER
);

ALTER TABLE "articles" ALTER COLUMN "reading_time" SET NOT NULL;
