/*
  Warnings:

  - Added the required column `emoji` to the `Item` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "emoji" STRING NOT NULL;
