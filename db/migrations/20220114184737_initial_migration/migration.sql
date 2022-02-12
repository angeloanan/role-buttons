-- CreateTable
CREATE TABLE "Guild" (
    "id" TEXT NOT NULL,

    CONSTRAINT "Guild_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoleGroups" (
    "groupId" SERIAL NOT NULL,
    "groupName" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,

    CONSTRAINT "RoleGroups_pkey" PRIMARY KEY ("groupId")
);

-- CreateTable
CREATE TABLE "RoleButton" (
    "roleId" TEXT NOT NULL,
    "buttonLabel" TEXT NOT NULL,
    "roleGroupId" INTEGER NOT NULL,

    CONSTRAINT "RoleButton_pkey" PRIMARY KEY ("roleId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Guild_id_key" ON "Guild"("id");

-- CreateIndex
CREATE UNIQUE INDEX "RoleGroups_groupId_key" ON "RoleGroups"("groupId");

-- CreateIndex
CREATE UNIQUE INDEX "RoleButton_roleId_key" ON "RoleButton"("roleId");

-- AddForeignKey
ALTER TABLE "RoleGroups" ADD CONSTRAINT "RoleGroups_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleButton" ADD CONSTRAINT "RoleButton_roleGroupId_fkey" FOREIGN KEY ("roleGroupId") REFERENCES "RoleGroups"("groupId") ON DELETE RESTRICT ON UPDATE CASCADE;
