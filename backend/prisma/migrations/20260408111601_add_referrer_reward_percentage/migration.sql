-- AlterTable
ALTER TABLE "ReferralConfig" ADD COLUMN     "maxReferrerRewardAmount" DOUBLE PRECISION NOT NULL DEFAULT 500,
ADD COLUMN     "referrerRewardPercentage" DOUBLE PRECISION NOT NULL DEFAULT 5;
