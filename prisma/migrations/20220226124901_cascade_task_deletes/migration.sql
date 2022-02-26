-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_taskInfoId_fkey";

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_taskInfoId_fkey" FOREIGN KEY ("taskInfoId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
