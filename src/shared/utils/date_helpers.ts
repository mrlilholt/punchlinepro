export type ReleaseSlotType = 'AM' | 'PM';

interface LocalReleaseSlotContext {
  currentDateKey: string;
  currentSlot: ReleaseSlotType;
  fallbackDateKey: string;
  fallbackSlot: ReleaseSlotType;
  nextReleaseDate: Date;
}

function format_local_date_key(date_value: Date): string {
  const year = date_value.getFullYear();
  const month = String(date_value.getMonth() + 1).padStart(2, '0');
  const day = String(date_value.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function get_local_today_date_key(): string {
  return format_local_date_key(new Date());
}

export function get_local_yesterday_date_key(): string {
  const yesterday_date = new Date();
  yesterday_date.setDate(yesterday_date.getDate() - 1);

  return format_local_date_key(yesterday_date);
}

function get_release_slot_for_local_time(date_value: Date): ReleaseSlotType {
  return date_value.getHours() < 12 ? 'AM' : 'PM';
}

export function get_release_slot_sort_value(slot: ReleaseSlotType): number {
  return slot === 'PM' ? 2 : 1;
}

export function get_release_slot_label(slot: ReleaseSlotType): string {
  return slot === 'AM' ? '12:00 AM Drop' : '12:00 PM Drop';
}

export function get_local_release_slot_context(now = new Date()): LocalReleaseSlotContext {
  const currentDate = new Date(now);
  const currentDateKey = format_local_date_key(currentDate);
  const currentSlot = get_release_slot_for_local_time(currentDate);

  const fallbackDate = new Date(currentDate);
  let fallbackSlot: ReleaseSlotType;

  if (currentSlot === 'PM') {
    fallbackSlot = 'AM';
  } else {
    fallbackSlot = 'PM';
    fallbackDate.setDate(fallbackDate.getDate() - 1);
  }

  const nextReleaseDate = new Date(currentDate);

  if (currentSlot === 'AM') {
    nextReleaseDate.setHours(12, 0, 0, 0);
  } else {
    nextReleaseDate.setDate(nextReleaseDate.getDate() + 1);
    nextReleaseDate.setHours(0, 0, 0, 0);
  }

  return {
    currentDateKey,
    currentSlot,
    fallbackDateKey: format_local_date_key(fallbackDate),
    fallbackSlot,
    nextReleaseDate,
  };
}

export function format_countdown_clock(totalMilliseconds: number): string {
  const safeMilliseconds = Math.max(totalMilliseconds, 0);
  const totalSeconds = Math.floor(safeMilliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':');
}

export function format_local_time_label(date_value: Date): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date_value);
}
