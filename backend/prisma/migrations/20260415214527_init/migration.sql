-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "first_name" TEXT,
    "age" INTEGER NOT NULL,
    "gender" TEXT NOT NULL,
    "height_cm" INTEGER NOT NULL,
    "weight_kg" DECIMAL(5,2) NOT NULL,
    "goal" TEXT NOT NULL,
    "fitness_level" TEXT NOT NULL,
    "weekly_availability" INTEGER NOT NULL,
    "equipment" TEXT NOT NULL,
    "dietary_restrictions" TEXT[],
    "bmi" DECIMAL(4,2),
    "bmr" INTEGER,
    "tdee" INTEGER,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "programs" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "week_start" DATE NOT NULL,
    "content" JSONB NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "programs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nutrition_plans" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "week_start" DATE NOT NULL,
    "content" JSONB NOT NULL,
    "shopping_list" JSONB NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nutrition_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "points" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "total" INTEGER NOT NULL DEFAULT 0,
    "streak" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "points_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "point_transactions" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "point_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_logs" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "program_id" INTEGER,
    "session_date" DATE NOT NULL,
    "duration_min" INTEGER,
    "feeling" TEXT,
    "notes" TEXT,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "session_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weight_history" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "weight_kg" DECIMAL(5,2) NOT NULL,
    "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "weight_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_user_id_key" ON "profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "points_user_id_key" ON "points"("user_id");

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programs" ADD CONSTRAINT "programs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nutrition_plans" ADD CONSTRAINT "nutrition_plans_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "points" ADD CONSTRAINT "points_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "point_transactions" ADD CONSTRAINT "point_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_logs" ADD CONSTRAINT "session_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_logs" ADD CONSTRAINT "session_logs_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "programs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weight_history" ADD CONSTRAINT "weight_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
