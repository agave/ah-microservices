CREATE TABLE "users" (
    "id" serial NOT NULL,
    "balance" numeric(100, 5),
    "held_balance" numeric(100, 5),
    "email" text NOT NULL,
    PRIMARY KEY ("id"),
    UNIQUE ("id"),
    UNIQUE ("email")
);
