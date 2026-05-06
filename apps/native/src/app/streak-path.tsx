import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CaretRightBoldIcon } from "@/components/icons/ph/caret-right-bold";
import { XIcon } from "@/components/icons/ph/x";
import { FireBoldIcon } from "@/components/icons/solar/fire-bold";
import { Text } from "@/components/ui/text";
import { toDateKey, useAppState } from "@/contexts/app-state-context";

const MONTH_LABELS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const WEEKDAY_LABELS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"] as const;
const CELL_HEIGHT = 38;
const ROW_GAP = 6;

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function buildDateKey(year: number, month: number, day: number): string {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

// Convert JS Date.getDay() (0=Sun) to Monday-first index (0=Mon ... 6=Sun).
function mondayFirstIndex(day: number): number {
  return (day + 6) % 7;
}

interface GridCell {
  empty: boolean;
  day: number;
  dateKey: string;
}

function buildGrid(year: number, month: number): GridCell[][] {
  const firstOfMonth = new Date(year, month, 1);
  const leadingEmpties = mondayFirstIndex(firstOfMonth.getDay());
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalCells = Math.ceil((leadingEmpties + daysInMonth) / 7) * 7;

  const cells: GridCell[] = [];
  for (let i = 0; i < totalCells; i++) {
    const dayNum = i - leadingEmpties + 1;
    if (dayNum < 1 || dayNum > daysInMonth) {
      cells.push({ empty: true, day: 0, dateKey: "" });
    } else {
      cells.push({
        empty: false,
        day: dayNum,
        dateKey: buildDateKey(year, month, dayNum),
      });
    }
  }

  const rows: GridCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7));
  }
  return rows;
}

type Segment =
  | { type: "empty"; span: 1 }
  | { type: "day"; span: 1; day: number; future: boolean }
  | { type: "today"; span: 1; day: number }
  | { type: "pill"; span: number; days: number[] };

function rowSegments(
  row: GridCell[],
  sealedKeys: Set<string>,
  todayKey: string
): Segment[] {
  const segs: Segment[] = [];
  let i = 0;
  while (i < row.length) {
    const cell = row[i];
    if (cell.empty) {
      segs.push({ type: "empty", span: 1 });
      i++;
      continue;
    }
    if (cell.dateKey === todayKey) {
      segs.push({ type: "today", span: 1, day: cell.day });
      i++;
      continue;
    }
    if (sealedKeys.has(cell.dateKey)) {
      let end = i;
      while (
        end < row.length &&
        !row[end].empty &&
        row[end].dateKey !== todayKey &&
        sealedKeys.has(row[end].dateKey)
      ) {
        end++;
      }
      const days = row.slice(i, end).map((c) => c.day);
      segs.push({ type: "pill", span: end - i, days });
      i = end;
      continue;
    }
    const future = cell.dateKey > todayKey;
    segs.push({ type: "day", span: 1, day: cell.day, future });
    i++;
  }
  return segs;
}

function PillSegment({ days, span }: { days: number[]; span: number }) {
  // Single-day pill renders as a centered circle so it reads as a "stamp"
  // rather than a stretched stadium; multi-day pills span the row.
  if (span === 1) {
    return (
      <View className="h-full items-center justify-center">
        <View
          className="items-center justify-center rounded-full bg-primary"
          style={{ width: CELL_HEIGHT, height: CELL_HEIGHT }}
        >
          <Text className="font-medium text-[12px] text-primary-foreground">
            {days[0]}
          </Text>
        </View>
      </View>
    );
  }
  return (
    <View className="h-full flex-row items-center justify-around rounded-full bg-primary">
      {days.map((d) => (
        <Text
          className="font-medium text-[12px] text-primary-foreground"
          key={d}
        >
          {d}
        </Text>
      ))}
    </View>
  );
}

function TodayCell({ day }: { day: number }) {
  return (
    <View className="h-full items-center justify-center">
      <View
        className="items-center justify-center rounded-full border-foreground"
        style={{
          width: CELL_HEIGHT,
          height: CELL_HEIGHT,
          borderWidth: 1.5,
        }}
      >
        <Text className="font-medium text-[12px] text-foreground">{day}</Text>
      </View>
    </View>
  );
}

function DayCell({ day, future }: { day: number; future: boolean }) {
  return (
    <View
      className="h-full items-center justify-center"
      style={{ opacity: future ? 0.3 : 1 }}
    >
      <Text className="text-[12px] text-muted-foreground">{day}</Text>
    </View>
  );
}

function CalendarRow({ segments }: { segments: Segment[] }) {
  return (
    <View
      className="flex-row"
      style={{ height: CELL_HEIGHT, marginBottom: ROW_GAP }}
    >
      {segments.map((seg, idx) => (
        <View
          // biome-ignore lint/suspicious/noArrayIndexKey: segment order is the natural identity within a week row
          key={idx}
          style={{ flex: seg.span, paddingHorizontal: 2 }}
        >
          {seg.type === "pill" && (
            <PillSegment days={seg.days} span={seg.span} />
          )}
          {seg.type === "today" && <TodayCell day={seg.day} />}
          {seg.type === "day" && <DayCell day={seg.day} future={seg.future} />}
          {seg.type === "empty" && <View className="h-full" />}
        </View>
      ))}
    </View>
  );
}

export default function StreakPath() {
  const insets = useSafeAreaInsets();
  const { state } = useAppState();

  const now = useMemo(() => new Date(), []);
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());

  const sealedKeys = useMemo(() => {
    const s = new Set<string>();
    for (const [key, day] of Object.entries(state.days)) {
      if (day.sealed) {
        s.add(key);
      }
    }
    return s;
  }, [state.days]);

  const totalSealed = sealedKeys.size;
  const todayKey = toDateKey();

  const rows = useMemo(
    () => buildGrid(viewYear, viewMonth),
    [viewYear, viewMonth]
  );

  const isCurrentMonth =
    viewYear === now.getFullYear() && viewMonth === now.getMonth();

  const goPrev = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
      return;
    }
    setViewMonth((m) => m - 1);
  };

  const goNext = () => {
    if (isCurrentMonth) {
      return;
    }
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
      return;
    }
    setViewMonth((m) => m + 1);
  };

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <View className="h-14 flex-row items-center px-6">
        <Pressable
          className="-ml-2 p-2"
          hitSlop={8}
          onPress={() => router.back()}
        >
          <XIcon className="size-6 text-foreground" />
        </Pressable>
        <Text className="flex-1 pr-10 text-center font-serif text-[22px] text-foreground">
          the path.
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: Math.max(insets.bottom, 24) + 16,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Total sealed + flame */}
        <View className="mt-8 flex-row items-center justify-between">
          <View className="flex-col">
            <Text className="font-serif text-[56px] text-foreground leading-none">
              {totalSealed}
            </Text>
            <Text className="mt-2 font-semibold text-[11px] text-muted-foreground uppercase tracking-widest">
              Days Sealed
            </Text>
          </View>
          <FireBoldIcon className="size-14 text-foreground" />
        </View>

        {/* Month navigation */}
        <View className="mt-7 flex-row items-center justify-between">
          <Text className="font-medium text-[16px] text-foreground">
            {MONTH_LABELS[viewMonth]} {viewYear}
          </Text>
          <View className="flex-row items-center gap-4">
            <Pressable
              className="p-1 active:opacity-60"
              hitSlop={8}
              onPress={goPrev}
            >
              <CaretRightBoldIcon
                className="size-4 text-foreground"
                style={{ transform: [{ rotate: "180deg" }] }}
              />
            </Pressable>
            <Pressable
              className="p-1 active:opacity-60"
              disabled={isCurrentMonth}
              hitSlop={8}
              onPress={goNext}
              style={{ opacity: isCurrentMonth ? 0.3 : 1 }}
            >
              <CaretRightBoldIcon className="size-4 text-foreground" />
            </Pressable>
          </View>
        </View>

        {/* Calendar card */}
        <View
          className="mt-4 rounded-2xl bg-muted"
          style={{ paddingHorizontal: 12, paddingVertical: 16 }}
        >
          <View className="mb-3 flex-row">
            {WEEKDAY_LABELS.map((label) => (
              <View
                className="flex-1 items-center"
                key={label}
                style={{ paddingHorizontal: 2 }}
              >
                <Text className="font-semibold text-[10px] text-muted-foreground uppercase tracking-widest">
                  {label}
                </Text>
              </View>
            ))}
          </View>

          {rows.map((row, rowIdx) => (
            <CalendarRow
              // biome-ignore lint/suspicious/noArrayIndexKey: weeks are positionally identified within a single month grid
              key={rowIdx}
              segments={rowSegments(row, sealedKeys, todayKey)}
            />
          ))}
        </View>

        <Text className="mt-5 text-center font-serif text-[13px] text-muted-foreground">
          Discipline does not announce itself.
        </Text>
      </ScrollView>
    </View>
  );
}
