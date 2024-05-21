-- CreateTable
CREATE TABLE "Item" (
    "id" INT8 NOT NULL DEFAULT unique_rowid(),
    "name" STRING NOT NULL,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recipe" (
    "id" INT8 NOT NULL DEFAULT unique_rowid(),
    "inputItem1Id" INT8 NOT NULL,
    "inputItem2Id" INT8 NOT NULL,
    "outputItemId" INT8 NOT NULL,

    CONSTRAINT "Recipe_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Recipe" ADD CONSTRAINT "Recipe_inputItem1Id_fkey" FOREIGN KEY ("inputItem1Id") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recipe" ADD CONSTRAINT "Recipe_inputItem2Id_fkey" FOREIGN KEY ("inputItem2Id") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recipe" ADD CONSTRAINT "Recipe_outputItemId_fkey" FOREIGN KEY ("outputItemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
