-- DropForeignKey
ALTER TABLE "RoleButton" DROP CONSTRAINT "RoleButton_roleGroupId_fkey";

-- DropForeignKey
ALTER TABLE "RoleGroups" DROP CONSTRAINT "RoleGroups_guildId_fkey";

-- AlterTable
ALTER TABLE "RoleGroups" ADD COLUMN     "groupLabel" TEXT NOT NULL DEFAULT E'Get your roles by clicking the buttons here!';

-- AddForeignKey
ALTER TABLE "RoleGroups" ADD CONSTRAINT "RoleGroups_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleButton" ADD CONSTRAINT "RoleButton_roleGroupId_fkey" FOREIGN KEY ("roleGroupId") REFERENCES "RoleGroups"("groupId") ON DELETE CASCADE ON UPDATE CASCADE;
