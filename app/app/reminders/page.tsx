import { ReminderList } from "@/components/life/reminder-list";
import { demoReminders } from "@/lib/demo-data";

export default function RemindersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">提醒</h1>
        <p className="mt-2 text-muted-foreground">
          账单、预约、待办和保修日期会自动进入提醒列表。
        </p>
      </div>
      <ReminderList reminders={demoReminders} />
    </div>
  );
}
