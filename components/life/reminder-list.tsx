import { Bell } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Reminder } from "@/lib/demo-data";
import { formatDateTime } from "@/lib/utils";

export function ReminderList({ reminders }: { reminders: Reminder[] }) {
  return (
    <div className="space-y-3">
      {reminders.map((reminder) => (
        <Card key={reminder.id}>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
              <Bell className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium">{reminder.title}</p>
              <p className="text-sm text-muted-foreground">
                {formatDateTime(reminder.remindAt)}
              </p>
            </div>
            <span className="rounded-full bg-accent/15 px-2.5 py-1 text-xs font-medium text-foreground">
              {reminder.status === "pending" ? "待提醒" : reminder.status}
            </span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
