/*
  Warnings:

  - The primary key for the `RoleButton` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "RoleButton" DROP CONSTRAINT "RoleButton_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "RoleButton_pkey" PRIMARY KEY ("id");
